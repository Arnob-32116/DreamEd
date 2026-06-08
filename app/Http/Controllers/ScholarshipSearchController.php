<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ScholarshipSearchController extends Controller
{
    // ── Main index page ───────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $filters      = $this->extractFilters($request);
        $scholarships = $this->queryScholarships($filters);

        return Inertia::render('scholarships/Index', [
            'scholarships' => $scholarships,
            'filters'      => $filters,
            'total'        => count($scholarships),
        ]);
    }

    // ── Single scholarship ────────────────────────────────────────────────────
    public function show(string $slug)
    {
        $scholarship = Scholarship::published()
            ->with('creator')
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('scholarships/Show', [
            'scholarship' => $this->formatScholarship($scholarship),
        ]);
    }

    // ── AI prompt search ──────────────────────────────────────────────────────
    public function aiSearch(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string|max:500',
        ]);

        $prompt  = $request->input('prompt');
        $filters = $this->parsePromptWithGemini($prompt);

        if (!$filters) {
            return response()->json([
                'error'   => 'Could not understand your search. Please try rephrasing.',
                'filters' => [],
            ], 422);
        }

        $scholarships = $this->queryScholarships($filters);

        return response()->json([
            'scholarships'   => $scholarships,
            'filters'        => $filters,
            'total'          => count($scholarships),
            'interpreted_as' => $filters['interpreted_as'] ?? null,
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
You are a scholarship search filter extractor. Given a user's natural language query about scholarships,
extract structured search filters and return ONLY a valid JSON object with NO extra text, explanation, or markdown.

Extract these fields (all optional, use null if not mentioned):
{
  "country_codes": ["DE","US"],          // Array of ISO country codes for the scholarship's origin country
  "types": ["Merit-Based","Government"], // From: Merit-Based, Need-Based, Athletic, Research, Government, Other
  "coverage_types": ["Fully Funded"],    // From: Fully Funded, Partial, Tuition Only, Living Expenses, Full Ride
  "subjects": ["Engineering"],           // Subject/field areas
  "institutions": ["DAAD","Fulbright"],  // Specific institution names if mentioned
  "min_monthly": 500,                    // Minimum monthly stipend in USD
  "max_tuition_coverage": 50000,         // Maximum tuition coverage in USD (0 = fully covered)
  "min_recipients": 10,                  // Minimum number of recipients
  "currencies": ["EUR","USD"],           // Preferred currencies
  "interpreted_as": "Brief human-readable summary of what was searched for"
}

Country code mappings:
USA/United States = US, UK/United Kingdom/Britain = GB, Canada = CA,
Germany = DE, Australia = AU, France = FR, Japan = JP, China = CN,
Singapore = SG, Bangladesh = BD, Netherlands = NL, Sweden = SE,
Switzerland = CH, South Korea = KR, India = IN, Europe (general) = DE,GB,FR,NL,SE,CH

Type mappings:
"government scholarship" = Government
"merit scholarship" or "academic excellence" = Merit-Based
"need-based" or "financial need" = Need-Based
"research funding" = Research

Coverage mappings:
"full scholarship" or "fully funded" = Fully Funded
"full ride" = Full Ride
"tuition only" = Tuition Only
"partial" = Partial

"high stipend" or "good stipend" = min_monthly of 800
"reasonable stipend" = min_monthly of 500
"living allowance" = Living Expenses coverage

User query: {$prompt}
PROMPT;

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $systemPrompt]]],
                ],
                'generationConfig' => [
                    'temperature'     => 0.1,
                    'maxOutputTokens' => 400,
                ],
            ]);

            if ($response->failed()) {
                Log::error('Gemini scholarship search failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return null;
            }

            $data = $response->json();
            $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if (!$text) return null;

            $text    = preg_replace('/```json\s*|\s*```/', '', trim($text));
            $filters = json_decode($text, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Gemini returned invalid JSON for scholarship search', ['text' => $text]);
                return null;
            }

            return $filters;

        } catch (\Exception $e) {
            Log::error('Gemini scholarship exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    // ── Extract filters from request ──────────────────────────────────────────
    private function extractFilters(Request $request): array
    {
        return [
            'country_codes'  => $request->get('country_codes', []),
            'types'          => $request->get('types', []),
            'coverage_types' => $request->get('coverage_types', []),
            'subjects'       => $request->get('subjects', []),
            'institutions'   => $request->get('institutions', []),
            'min_monthly'    => $request->integer('min_monthly', 0),
            'search'         => $request->get('search'),
        ];
    }

    // ── Query scholarships with filters ───────────────────────────────────────
    private function queryScholarships(array $filters): array
    {
        $query = Scholarship::published()
            ->with('creator')
            ->orderByDesc('created_at');

        if (!empty($filters['country_codes'])) {
            $query->whereIn('country_code', $filters['country_codes']);
        }

        if (!empty($filters['types'])) {
            $query->whereIn('type', $filters['types']);
        }

        if (!empty($filters['coverage_types'])) {
            $query->whereIn('coverage_type', $filters['coverage_types']);
        }

        if (!empty($filters['institutions'])) {
            $query->where(function ($q) use ($filters) {
                foreach ($filters['institutions'] as $inst) {
                    $q->orWhere('institution', 'like', "%{$inst}%");
                }
            });
        }

        if (!empty($filters['min_monthly']) && $filters['min_monthly'] > 0) {
            $query->where('monthly_amount', '>=', $filters['min_monthly']);
        }

        if (!empty($filters['subjects'])) {
            $query->where(function ($q) use ($filters) {
                foreach ($filters['subjects'] as $subject) {
                    $q->orWhereJsonContains('subject_areas', $subject);
                }
            });
        }

        if (!empty($filters['currencies'])) {
            $query->whereIn('currency', $filters['currencies']);
        }

        if (!empty($filters['search'])) {
            $s = $filters['search'];
            $query->where(function ($q) use ($s) {
                $q->where('name',        'like', "%{$s}%")
                  ->orWhere('institution', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%");
            });
        }

        return $query->get()->map(fn($s) => $this->formatScholarship($s))->toArray();
    }

    // ── Format scholarship for frontend ──────────────────────────────────────
    private function formatScholarship(Scholarship $s): array
    {
        return [
            'id'               => $s->id,
            'name'             => $s->name,
            'slug'             => $s->slug,
            'institution'      => $s->institution,
            'logo'             => $s->logo,
            'cover_image'      => $s->cover_image,
            'website'          => $s->website,
            'country'          => $s->country,
            'country_code'     => $s->country_code,
            'type'             => $s->type,
            'coverage_type'    => $s->coverage_type,
            'currency'         => $s->currency,
            'currency_symbol'  => $s->currency_symbol,
            'monthly_amount'   => $s->monthly_amount,
            'tuition_coverage' => $s->tuition_coverage,
            'travel_allowance' => $s->travel_allowance,
            'living_allowance' => $s->living_allowance,
            'duration'         => $s->duration,
            'recipients'       => $s->recipients,
            'description'      => $s->description,
            'subject_areas'    => $s->subject_areas_array,
            'is_published'     => $s->is_published,
        ];
    }
}
