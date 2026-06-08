<?php

namespace App\Http\Controllers;

use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UniversitySearchController extends Controller
{
    // ── Main index page ───────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $filters = $this->extractFilters($request);
        $universities = $this->queryUniversities($filters);

        return Inertia::render('universities/Index', [
            'universities' => $universities,
            'filters'      => $filters,
            'total'        => count($universities),
        ]);
    }

    // ── AI prompt search ──────────────────────────────────────────────────────
    public function aiSearch(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string|max:500',
        ]);

        $prompt = $request->input('prompt');
        $filters = $this->parsePromptWithGemini($prompt);

        if (!$filters) {
            return response()->json([
                'error'   => 'Could not understand your search. Please try rephrasing.',
                'filters' => [],
            ], 422);
        }

        $universities = $this->queryUniversities($filters);

        return response()->json([
            'universities'     => $universities,
            'filters'          => $filters,
            'total'            => count($universities),
            'interpreted_as'   => $filters['interpreted_as'] ?? null,
        ]);
    }

    // ── Parse prompt with Gemini ──────────────────────────────────────────────
    private function parsePromptWithGemini(string $prompt): ?array
    {
        $apiKey = config('services.gemini.key');

        if (empty($apiKey)) {
            Log::error('Gemini API key not configured.');
            return null;
        }

        $systemPrompt = <<<PROMPT
You are a university search filter extractor. Given a user's natural language query about universities,
extract structured search filters and return ONLY a valid JSON object with NO extra text, explanation, or markdown.

Extract these fields (all optional, use null if not mentioned):
{
  "country_codes": ["US","GB"],        // Array of ISO country codes. Map country names to codes.
  "city": "Cambridge",                  // Specific city name
  "state": "Massachusetts",             // State or province
  "categories": ["Technical","Public Research"], // From: Public Research, Private Research, Liberal Arts, Technical, Community College
  "subjects": ["Computer Science"],     // Subject/program areas
  "qs_ranking_max": 500,                // Maximum QS ranking number
  "qs_ranking_min": 1,                  // Minimum QS ranking number
  "acceptance_rate_max": 50,            // Max acceptance rate percentage
  "max_tuition": 30000,                 // Max annual tuition in USD
  "max_room_and_board": 15000,          // Max room and board cost in USD
  "has_scholarships": true,             // Whether scholarships are required
  "degree_types": ["Master's","PhD"],   // Degree types: Bachelor's, Master's, PhD
  "interpreted_as": "Brief human-readable summary of what was searched for"
}

Country code mappings to use:
USA/United States = US, UK/United Kingdom/Britain = GB, Canada = CA,
Germany = DE, Australia = AU, France = FR, Japan = JP, China = CN,
Singapore = SG, Bangladesh = BD, Netherlands = NL, Sweden = SE,
Switzerland = CH, South Korea = KR, India = IN

"reasonable housing" or "affordable housing" = max_room_and_board of 12000
"affordable" tuition = max_tuition of 25000
"top universities" or "prestigious" = qs_ranking_max of 100
"good universities" = qs_ranking_max of 300

User query: {$prompt}
PROMPT;

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $systemPrompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature'     => 0.1,
                    'maxOutputTokens' => 500,
                ],
            ]);

            if ($response->failed()) {
                Log::error('Gemini API call failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return null;
            }

            $data = $response->json();
            $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if (!$text) return null;

            // Strip markdown code fences if present
            $text = preg_replace('/```json\s*|\s*```/', '', trim($text));

            $filters = json_decode($text, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Gemini returned invalid JSON', ['text' => $text]);
                return null;
            }

            return $filters;

        } catch (\Exception $e) {
            Log::error('Gemini request exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    // ── Extract filters from request (for manual filter panel) ────────────────
    private function extractFilters(Request $request): array
    {
        return [
            'country_codes'      => $request->get('country_codes', []),
            'city'               => $request->get('city'),
            'state'              => $request->get('state'),
            'categories'         => $request->get('categories', []),
            'subjects'           => $request->get('subjects', []),
            'qs_ranking_min'     => $request->integer('qs_ranking_min', 1),
            'qs_ranking_max'     => $request->integer('qs_ranking_max', 1000),
            'acceptance_rate_max'=> $request->integer('acceptance_rate_max', 100),
            'max_tuition'        => $request->integer('max_tuition', 80000),
            'max_room_and_board' => $request->integer('max_room_and_board', 0),
            'has_scholarships'   => $request->boolean('has_scholarships', false),
            'degree_types'       => $request->get('degree_types', []),
            'search'             => $request->get('search'),
        ];
    }

    // ── Query universities with filters ───────────────────────────────────────
    private function queryUniversities(array $filters): array
    {
        $query = University::published()
            ->with(['programs', 'scholarships', 'expenses'])
            ->orderBy('qs_ranking');

        // Country filter
        if (!empty($filters['country_codes'])) {
            $query->whereIn('country_code', $filters['country_codes']);
        }

        // City filter
        if (!empty($filters['city'])) {
            $query->where('city', 'like', '%' . $filters['city'] . '%');
        }

        // State filter
        if (!empty($filters['state'])) {
            $query->where('state', 'like', '%' . $filters['state'] . '%');
        }

        // Category filter
        if (!empty($filters['categories'])) {
            $query->whereIn('category', $filters['categories']);
        }

        // QS ranking filter
        $rankMin = $filters['qs_ranking_min'] ?? 1;
        $rankMax = $filters['qs_ranking_max'] ?? 1000;
        if ($rankMin > 1 || $rankMax < 1000) {
            $query->where(function ($q) use ($rankMin, $rankMax) {
                $q->whereNull('qs_ranking')
                  ->orWhereBetween('qs_ranking', [$rankMin, $rankMax]);
            });
            if ($rankMax < 1000) {
                $query->whereNotNull('qs_ranking')
                      ->where('qs_ranking', '<=', $rankMax);
            }
        }

        // Acceptance rate filter
        if (!empty($filters['acceptance_rate_max']) && $filters['acceptance_rate_max'] < 100) {
            $query->where(function ($q) use ($filters) {
                $q->whereNull('acceptance_rate')
                  ->orWhere('acceptance_rate', '<=', $filters['acceptance_rate_max']);
            });
        }

        // Tuition filter
        if (!empty($filters['max_tuition']) && $filters['max_tuition'] < 80000) {
            $query->whereHas('expenses', function ($q) use ($filters) {
                $q->where('annual_tuition', '<=', $filters['max_tuition']);
            });
        }

        // Room and board filter
        if (!empty($filters['max_room_and_board']) && $filters['max_room_and_board'] > 0) {
            $query->whereHas('expenses', function ($q) use ($filters) {
                $q->where('room_and_board', '<=', $filters['max_room_and_board']);
            });
        }

        // Has scholarships filter
        if (!empty($filters['has_scholarships'])) {
            $query->whereHas('scholarships');
        }

        // Subjects filter
        if (!empty($filters['subjects'])) {
            $query->whereHas('programs', function ($q) use ($filters) {
                $q->where(function ($q2) use ($filters) {
                    foreach ($filters['subjects'] as $subject) {
                        $q2->orWhereJsonContains('subjects', $subject);
                    }
                });
            });
        }

        // Degree types filter
        if (!empty($filters['degree_types'])) {
            $query->whereHas('programs', function ($q) use ($filters) {
                $q->whereIn('degree_type', $filters['degree_types']);
            });
        }

        // Text search
        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $query->where(function ($q) use ($s) {
                $q->where('name',    'like', "%{$s}%")
                  ->orWhere('city',    'like', "%{$s}%")
                  ->orWhere('country', 'like', "%{$s}%");
            });
        }

        return $query->get()->map(fn($u) => $this->formatUniversity($u))->toArray();
    }

    // ── Format university for frontend ────────────────────────────────────────
    private function formatUniversity(University $u): array
    {
        $bachelors  = $u->programs->where('degree_type', "Bachelor's")->count();
        $masters    = $u->programs->where('degree_type', "Master's")->count();
        $phd        = $u->programs->where('degree_type', 'PhD')->count();

        return [
            'id'              => $u->id,
            'name'            => $u->name,
            'abbreviation'    => $u->abbreviation,
            'slug'            => $u->slug,
            'logo'            => $u->logo,
            'cover_image'     => $u->cover_image,
            'website'         => $u->website,
            'city'            => $u->city,
            'state'           => $u->state,
            'country'         => $u->country,
            'country_code'    => $u->country_code,
            'category'        => $u->category,
            'qs_ranking'      => $u->qs_ranking,
            'acceptance_rate' => $u->acceptance_rate,
            'student_count'   => $u->student_count,
            'is_published'    => $u->is_published,
            'programs_count'  => [
                'bachelors' => $bachelors,
                'masters'   => $masters,
                'phd'       => $phd,
                'total'     => $u->programs->count(),
            ],
            'scholarships_count' => $u->scholarships->count(),
            'expenses'        => $u->expenses ? [
                'annual_tuition'  => $u->expenses->annual_tuition,
                'room_and_board'  => $u->expenses->room_and_board,
                'application_fee' => $u->expenses->application_fee,
            ] : null,
        ];
    }
}
