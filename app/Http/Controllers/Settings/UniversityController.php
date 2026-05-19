<?php

namespace App\Http\Controllers;

use App\Models\University;
use App\Models\UniversityProgram;
use App\Models\UniversityScholarship;
use App\Models\UniversityExpense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UniversityController extends Controller
{
    private string $supabaseUrl;
    private string $supabaseKey;
    private string $supabaseBucket;

    public function __construct()
    {
        $this->supabaseUrl    = rtrim(config('services.supabase.url', ''), '/');
        $this->supabaseKey    = config('services.supabase.service_role_key', '');
        $this->supabaseBucket = config('services.supabase.bucket', 'UniversityImages');
    }

    // ── Student: list all universities ───────────────────────────────────────
    public function index(Request $request)
    {
        $search   = (string) $request->get('search', '');
        $country  = (string) $request->get('country', '');
        $category = (string) $request->get('category', '');
        $subjects = $request->get('subjects', []);
        $rankMin  = $request->integer('rank_min', 1);
        $rankMax  = $request->integer('rank_max', 1000);

        $query = University::published()
            ->with(['programs', 'scholarships', 'expenses'])
            ->orderBy('qs_ranking');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name',    'like', "%{$search}%")
                  ->orWhere('city',    'like', "%{$search}%")
                  ->orWhere('country', 'like', "%{$search}%");
            });
        }

        if (!empty($country)) {
            $query->where('country_code', $country);
        }

        if (!empty($category)) {
            $query->where('category', $category);
        }

        if (!empty($subjects)) {
            $query->whereHas('programs', function ($q) use ($subjects) {
                $q->where(function ($q2) use ($subjects) {
                    foreach ($subjects as $subject) {
                        $q2->orWhereJsonContains('subjects', $subject);
                    }
                });
            });
        }

        if ($rankMin || $rankMax) {
            $query->whereBetween('qs_ranking', [$rankMin, $rankMax]);
        }

        $universities = $query->get()->map(fn($u) => $this->formatUniversity($u));

        return Inertia::render('universities/Index', [
            'universities' => $universities,
            'filters'      => compact('search', 'country', 'category', 'subjects', 'rankMin', 'rankMax'),
        ]);
    }

    // ── Student: view single university ──────────────────────────────────────
    public function show(string $slug)
    {
        $university = University::published()
            ->with(['programs', 'scholarships', 'expenses'])
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('universities/Show', [
            'university' => $this->formatUniversity($university),
        ]);
    }

    // ── Contributor: show create form ─────────────────────────────────────────
    public function create()
    {
        return Inertia::render('contributor/universities/Create');
    }

    // ── Contributor: store new university ─────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'name'                => 'required|string|max:255',
            'abbreviation'        => 'nullable|string|max:20',
            'website'             => 'nullable|url',
            'city'                => 'nullable|string|max:100',
            'state'               => 'nullable|string|max:100',
            'country'             => 'required|string|max:100',
            'country_code'        => 'nullable|string|max:5',
            'category'            => 'required|in:Public Research,Private Research,Liberal Arts,Technical,Community College,Other',
            'qs_ranking'          => 'nullable|integer|min:1',
            'acceptance_rate'     => 'nullable|numeric|min:0|max:100',
            'student_count'       => 'nullable|integer|min:0',
            'faculty_count'       => 'nullable|integer|min:0',
            'founded_year'        => 'nullable|integer|min:1000|max:' . date('Y'),
            'president'           => 'nullable|string|max:255',
            'motto'               => 'nullable|string|max:255',
            'about'               => 'nullable|string',
            'life_in_city'        => 'nullable|string',
            'logo_file'           => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'cover_image_file'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $logoUrl       = null;
        $coverImageUrl = null;

        if ($request->hasFile('logo_file')) {
            $logoUrl = $this->uploadToSupabase($request->file('logo_file'), 'logos');
        }
        if ($request->hasFile('cover_image_file')) {
            $coverImageUrl = $this->uploadToSupabase($request->file('cover_image_file'), 'covers');
        }

        $university = University::create([
            'created_by'      => Auth::id(),
            'name'            => $request->input('name'),
            'abbreviation'    => $request->input('abbreviation'),
            'website'         => $request->input('website'),
            'city'            => $request->input('city'),
            'state'           => $request->input('state'),
            'country'         => $request->input('country'),
            'country_code'    => strtoupper($request->input('country_code', '')),
            'category'        => $request->input('category'),
            'qs_ranking'      => $request->input('qs_ranking'),
            'acceptance_rate' => $request->input('acceptance_rate'),
            'student_count'   => $request->input('student_count'),
            'faculty_count'   => $request->input('faculty_count'),
            'founded_year'    => $request->input('founded_year'),
            'president'       => $request->input('president'),
            'motto'           => $request->input('motto'),
            'about'           => $request->input('about'),
            'life_in_city'    => $request->input('life_in_city'),
            'logo'            => $logoUrl,
            'cover_image'     => $coverImageUrl,
            'is_published'    => true,
        ]);

        // Store expenses if provided
        if ($request->hasAny([
            'annual_tuition', 'room_and_board', 'application_fee',
            'books_supplies', 'transportation', 'personal_expenses',
            'health_insurance',
        ])) {
            UniversityExpense::create([
                'university_id'     => $university->id,
                'annual_tuition'    => $request->input('annual_tuition'),
                'room_and_board'    => $request->input('room_and_board'),
                'application_fee'   => $request->input('application_fee'),
                'books_supplies'    => $request->input('books_supplies'),
                'transportation'    => $request->input('transportation'),
                'personal_expenses' => $request->input('personal_expenses'),
                'health_insurance'  => $request->input('health_insurance'),
                'financial_aid_note'=> $request->input('financial_aid_note'),
                'financial_aid_url' => $request->input('financial_aid_url'),
            ]);
        }

        return redirect()->route('contributor.universities.edit', $university->slug)
            ->with('success', 'University created. You can now add programs and scholarships.');
    }

    // ── Contributor: show edit form ───────────────────────────────────────────
    public function edit(string $slug)
    {
        $university = University::with(['programs', 'scholarships', 'expenses'])
            ->where('slug', $slug)
            ->where('created_by', Auth::id())
            ->firstOrFail();

        return Inertia::render('contributor/universities/Edit', [
            'university' => $this->formatUniversity($university),
        ]);
    }

    // ── Contributor: update university ────────────────────────────────────────
    public function update(Request $request, string $slug)
    {
        $university = University::where('slug', $slug)
            ->where('created_by', Auth::id())
            ->firstOrFail();

        $request->validate([
            'name'             => 'required|string|max:255',
            'abbreviation'     => 'nullable|string|max:20',
            'website'          => 'nullable|url',
            'city'             => 'nullable|string|max:100',
            'state'            => 'nullable|string|max:100',
            'country'          => 'required|string|max:100',
            'country_code'     => 'nullable|string|max:5',
            'category'         => 'required|in:Public Research,Private Research,Liberal Arts,Technical,Community College,Other',
            'qs_ranking'       => 'nullable|integer|min:1',
            'acceptance_rate'  => 'nullable|numeric|min:0|max:100',
            'student_count'    => 'nullable|integer|min:0',
            'faculty_count'    => 'nullable|integer|min:0',
            'founded_year'     => 'nullable|integer|min:1000|max:' . date('Y'),
            'president'        => 'nullable|string|max:255',
            'motto'            => 'nullable|string|max:255',
            'about'            => 'nullable|string',
            'life_in_city'     => 'nullable|string',
            'logo_file'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'cover_image_file' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('logo_file')) {
            $university->logo = $this->uploadToSupabase($request->file('logo_file'), 'logos');
        }
        if ($request->hasFile('cover_image_file')) {
            $university->cover_image = $this->uploadToSupabase($request->file('cover_image_file'), 'covers');
        }

        $university->update([
            'name'            => $request->input('name'),
            'abbreviation'    => $request->input('abbreviation'),
            'website'         => $request->input('website'),
            'city'            => $request->input('city'),
            'state'           => $request->input('state'),
            'country'         => $request->input('country'),
            'country_code'    => strtoupper($request->input('country_code', '')),
            'category'        => $request->input('category'),
            'qs_ranking'      => $request->input('qs_ranking'),
            'acceptance_rate' => $request->input('acceptance_rate'),
            'student_count'   => $request->input('student_count'),
            'faculty_count'   => $request->input('faculty_count'),
            'founded_year'    => $request->input('founded_year'),
            'president'       => $request->input('president'),
            'motto'           => $request->input('motto'),
            'about'           => $request->input('about'),
            'life_in_city'    => $request->input('life_in_city'),
            'logo'            => $university->logo,
            'cover_image'     => $university->cover_image,
        ]);

        // Update or create expenses
        $university->expenses()->updateOrCreate(
            ['university_id' => $university->id],
            [
                'annual_tuition'     => $request->input('annual_tuition'),
                'room_and_board'     => $request->input('room_and_board'),
                'application_fee'    => $request->input('application_fee'),
                'books_supplies'     => $request->input('books_supplies'),
                'transportation'     => $request->input('transportation'),
                'personal_expenses'  => $request->input('personal_expenses'),
                'health_insurance'   => $request->input('health_insurance'),
                'financial_aid_note' => $request->input('financial_aid_note'),
                'financial_aid_url'  => $request->input('financial_aid_url'),
            ]
        );

        return back()->with('success', 'University updated successfully.');
    }

    // ── Contributor: add program ──────────────────────────────────────────────
    public function storeProgram(Request $request, string $slug)
    {
        $university = University::where('slug', $slug)
            ->where('created_by', Auth::id())
            ->firstOrFail();

        $request->validate([
            'name'                    => 'required|string|max:255',
            'school'                  => 'nullable|string|max:255',
            'degree_type'             => "required|in:Bachelor's,Master's,PhD,Diploma,Certificate",
            'duration'                => 'nullable|string|max:50',
            'tuition_fee'             => 'nullable|numeric|min:0',
            'application_deadline'    => 'nullable|date',
            'program_url'             => 'nullable|url',
            'required_qualifications' => 'nullable|string',
            'subjects'                => 'nullable|array',
        ]);

        $university->programs()->create($request->only([
            'name', 'school', 'degree_type', 'duration',
            'tuition_fee', 'application_deadline',
            'program_url', 'required_qualifications', 'subjects',
        ]));

        return back()->with('success', 'Program added.');
    }

    // ── Contributor: update program ───────────────────────────────────────────
    public function updateProgram(Request $request, string $slug, int $programId)
    {
        $university = University::where('slug', $slug)
            ->where('created_by', Auth::id())
            ->firstOrFail();

        $program = $university->programs()->findOrFail($programId);

        $request->validate([
            'name'                    => 'required|string|max:255',
            'school'                  => 'nullable|string|max:255',
            'degree_type'             => "required|in:Bachelor's,Master's,PhD,Diploma,Certificate",
            'duration'                => 'nullable|string|max:50',
            'tuition_fee'             => 'nullable|numeric|min:0',
            'application_deadline'    => 'nullable|date',
            'program_url'             => 'nullable|url',
            'required_qualifications' => 'nullable|string',
            'subjects'                => 'nullable|array',
        ]);

        $program->update($request->only([
            'name', 'school', 'degree_type', 'duration',
            'tuition_fee', 'application_deadline',
            'program_url', 'required_qualifications', 'subjects',
        ]));

        return back()->with('success', 'Program updated.');
    }

    // ── Contributor: delete program ───────────────────────────────────────────
    public function destroyProgram(string $slug, int $programId)
    {
        $university = University::where('slug', $slug)
            ->where('created_by', Auth::id())
            ->firstOrFail();

        $university->programs()->findOrFail($programId)->delete();

        return back()->with('success', 'Program removed.');
    }

    // ── Contributor: add scholarship ──────────────────────────────────────────
    public function storeScholarship(Request $request, string $slug)
    {
        $university = University::where('slug', $slug)
            ->where('created_by', Auth::id())
            ->firstOrFail();

        $request->validate([
            'name'               => 'required|string|max:255',
            'type'               => 'required|in:Merit-Based,Need-Based,Athletic,Research,Government,Other',
            'coverage'           => 'required|in:Full Tuition,Partial,Living Expenses,Full Ride',
            'is_independent'     => 'boolean',
            'description'        => 'nullable|string',
            'total_amount'       => 'nullable|numeric|min:0',
            'recipients'         => 'nullable|integer|min:0',
            'eligible_countries' => 'nullable|integer|min:0',
            'programs_covered'   => 'nullable|string|max:255',
            'scholarship_url'    => 'nullable|url',
        ]);

        $university->scholarships()->create($request->only([
            'name', 'type', 'coverage', 'is_independent', 'description',
            'total_amount', 'recipients', 'eligible_countries',
            'programs_covered', 'scholarship_url',
        ]));

        return back()->with('success', 'Scholarship added.');
    }

    // ── Contributor: update scholarship ──────────────────────────────────────
    public function updateScholarship(Request $request, string $slug, int $scholarshipId)
    {
        $university = University::where('slug', $slug)
            ->where('created_by', Auth::id())
            ->firstOrFail();

        $scholarship = $university->scholarships()->findOrFail($scholarshipId);

        $request->validate([
            'name'               => 'required|string|max:255',
            'type'               => 'required|in:Merit-Based,Need-Based,Athletic,Research,Government,Other',
            'coverage'           => 'required|in:Full Tuition,Partial,Living Expenses,Full Ride',
            'is_independent'     => 'boolean',
            'description'        => 'nullable|string',
            'total_amount'       => 'nullable|numeric|min:0',
            'recipients'         => 'nullable|integer|min:0',
            'eligible_countries' => 'nullable|integer|min:0',
            'programs_covered'   => 'nullable|string|max:255',
            'scholarship_url'    => 'nullable|url',
        ]);

        $scholarship->update($request->only([
            'name', 'type', 'coverage', 'is_independent', 'description',
            'total_amount', 'recipients', 'eligible_countries',
            'programs_covered', 'scholarship_url',
        ]));

        return back()->with('success', 'Scholarship updated.');
    }

    // ── Contributor: delete scholarship ──────────────────────────────────────
    public function destroyScholarship(string $slug, int $scholarshipId)
    {
        $university = University::where('slug', $slug)
            ->where('created_by', Auth::id())
            ->firstOrFail();

        $university->scholarships()->findOrFail($scholarshipId)->delete();

        return back()->with('success', 'Scholarship removed.');
    }

    // ── Contributor: my universities list ─────────────────────────────────────
    public function myUniversities()
    {
        $universities = University::where('created_by', Auth::id())
            ->withCount(['programs', 'scholarships'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($u) => $this->formatUniversity($u));

        return Inertia::render('contributor/universities/MyUniversities', [
            'universities' => $universities,
        ]);
    }

    // ── Supabase upload ───────────────────────────────────────────────────────
    private function uploadToSupabase(\Illuminate\Http\UploadedFile $file, string $folder = 'misc'): ?string
    {
        if (empty($this->supabaseUrl) || empty($this->supabaseKey)) {
            Log::error('Supabase config missing for university upload.');
            return null;
        }

        try {
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $path      = "{$folder}/" . time() . '_' . Str::random(10) . '.' . $extension;
            $endpoint  = "{$this->supabaseUrl}/storage/v1/object/{$this->supabaseBucket}/{$path}";
            $mimeType  = $file->getMimeType() ?: 'image/jpeg';

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->supabaseKey}",
                'Content-Type'  => $mimeType,
                'x-upsert'      => 'true',
            ])->withBody(file_get_contents($file->getRealPath()), $mimeType)
              ->post($endpoint);

            if ($response->failed()) {
                Log::error('Supabase university upload failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return null;
            }

            return "{$this->supabaseUrl}/storage/v1/object/public/{$this->supabaseBucket}/{$path}";
        } catch (\Exception $e) {
            Log::error('Supabase university upload exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    // ── Format helper ─────────────────────────────────────────────────────────
    private function formatUniversity(University $u): array
    {
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
            'faculty_count'   => $u->faculty_count,
            'founded_year'    => $u->founded_year,
            'president'       => $u->president,
            'motto'           => $u->motto,
            'about'           => $u->about,
            'life_in_city'    => $u->life_in_city,
            'is_published'    => $u->is_published,
            'programs'        => $u->programs ?? [],
            'scholarships'    => $u->scholarships ?? [],
            'expenses'        => $u->expenses ?? null,
            'programs_count'  => $u->programs_count ?? $u->programs?->count() ?? 0,
            'scholarships_count' => $u->scholarships_count ?? $u->scholarships?->count() ?? 0,
        ];
    }
}
