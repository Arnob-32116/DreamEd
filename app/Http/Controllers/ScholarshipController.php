<?php

namespace App\Http\Controllers;

use App\Models\Scholarship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ScholarshipController extends Controller
{
    private string $supabaseUrl;
    private string $supabaseKey;
    private string $supabaseBucket;

    public function __construct()
    {
        $this->supabaseUrl    = rtrim(config('services.supabase.url', ''), '/');
        $this->supabaseKey    = config('services.supabase.service_role_key', '');
        $this->supabaseBucket = 'ScholarshipImages';  // separate bucket
    }

    // ── Public listing ────────────────────────────────────────────────────────
    // GET /scholarships
    public function index(Request $request)
    {
        $search       = (string) $request->get('search', '');
        $countries    = (array)  $request->get('countries', []);
        $institutions = (array)  $request->get('institutions', []);
        $types        = (array)  $request->get('types', []);

        $query = Scholarship::published()
            ->orderByDesc('created_at');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name',        'like', "%{$search}%")
                  ->orWhere('institution', 'like', "%{$search}%")
                  ->orWhere('country',     'like', "%{$search}%");
            });
        }

        if (!empty($countries)) {
            $query->whereIn('country_code', $countries);
        }

        if (!empty($institutions)) {
            $query->whereIn('institution', $institutions);
        }

        if (!empty($types)) {
            $query->whereIn('type', $types);
        }

        $scholarships = $query->get()->map(fn($s) => $this->formatScholarship($s));

        // Build filter options from ALL published scholarships (not filtered)
        $all = Scholarship::published()->get();

        $filterCountries = $all
            ->whereNotNull('country_code')
            ->unique('country_code')
            ->sortBy('country')
            ->values()
            ->map(fn($s) => [
                'code'  => $s->country_code,
                'label' => $s->country,
            ]);

        $filterInstitutions = $all
            ->unique('institution')
            ->sortBy('institution')
            ->values()
            ->pluck('institution');

        $filterTypes = [
            'Merit-Based', 'Need-Based', 'Athletic',
            'Research', 'Government', 'Other',
        ];

        return Inertia::render('scholarships/Index', [
            'scholarships'       => $scholarships,
            'total'              => $scholarships->count(),
            'filterCountries'    => $filterCountries,
            'filterInstitutions' => $filterInstitutions,
            'filterTypes'        => $filterTypes,
            'filters'            => [
                'search'       => $search,
                'countries'    => $countries,
                'institutions' => $institutions,
                'types'        => $types,
            ],
        ]);
    }

    // ── Public detail ─────────────────────────────────────────────────────────
    // GET /scholarships/{slug}
    public function show(string $slug)
    {
        $scholarship = Scholarship::published()
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('scholarships/Show', [
            'scholarship' => $this->formatScholarship($scholarship),
        ]);
    }

    // ── Contributor: create ───────────────────────────────────────────────────
    // POST /contributor/scholarships
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'institution'       => 'required|string|max:255',
            'website'           => 'nullable|url|max:500',
            'country'           => 'nullable|string|max:100',
            'country_code'      => 'nullable|string|max:5',
            'type'              => 'required|in:Merit-Based,Need-Based,Athletic,Research,Government,Other',
            'coverage_type'     => 'required|in:Fully Funded,Partial,Tuition Only,Living Expenses,Full Ride',
            'currency'          => 'nullable|string|max:5',
            'monthly_amount'    => 'nullable|numeric|min:0',
            'tuition_coverage'  => 'nullable|numeric|min:0',
            'travel_allowance'  => 'nullable|numeric|min:0',
            'living_allowance'  => 'nullable|numeric|min:0',
            'duration'          => 'nullable|string|max:100',
            'recipients'        => 'nullable|integer|min:1',
            'description'       => 'nullable|string',
            'subject_areas'     => 'nullable|array',
            'subject_areas.*.name'  => 'required|string|max:100',
            'subject_areas.*.count' => 'required|integer|min:0',
            'logo_file'         => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'cover_image_file'  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'logo_url'          => 'nullable|string',
            'cover_image_url'   => 'nullable|string',
        ]);

        $logoUrl  = null;
        $coverUrl = null;

        if ($request->hasFile('logo_file')) {
            $logoUrl = $this->uploadToSupabase($request->file('logo_file'), 'logos');
        } elseif ($request->filled('logo_url')) {
            $logoUrl = $request->input('logo_url');
        }

        if ($request->hasFile('cover_image_file')) {
            $coverUrl = $this->uploadToSupabase($request->file('cover_image_file'), 'covers');
        } elseif ($request->filled('cover_image_url')) {
            $coverUrl = $request->input('cover_image_url');
        }

        Scholarship::create([
            'created_by'       => Auth::id(),
            'name'             => $validated['name'],
            'institution'      => $validated['institution'],
            'website'          => $validated['website'] ?? null,
            'country'          => $validated['country'] ?? null,
            'country_code'     => isset($validated['country_code'])
                                    ? strtoupper($validated['country_code'])
                                    : null,
            'type'             => $validated['type'],
            'coverage_type'    => $validated['coverage_type'],
            'currency'         => strtoupper($validated['currency'] ?? 'USD'),
            'monthly_amount'   => $validated['monthly_amount'] ?? null,
            'tuition_coverage' => $validated['tuition_coverage'] ?? null,
            'travel_allowance' => $validated['travel_allowance'] ?? null,
            'living_allowance' => $validated['living_allowance'] ?? null,
            'duration'         => $validated['duration'] ?? null,
            'recipients'       => $validated['recipients'] ?? null,
            'description'      => $validated['description'] ?? null,
            'subject_areas'    => $validated['subject_areas'] ?? null,
            'logo'             => $logoUrl,
            'cover_image'      => $coverUrl,
            'is_published'     => true,
        ]);

        return redirect()
            ->route('contributor.scholarships.index')
            ->with('success', 'Scholarship created successfully.');
    }

    // ── Contributor: update ───────────────────────────────────────────────────
    // PUT /contributor/scholarships/{scholarship}
    public function update(Request $request, Scholarship $scholarship)
    {
        if ($scholarship->created_by !== Auth::id() && !Auth::user()->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'institution'       => 'required|string|max:255',
            'website'           => 'nullable|url|max:500',
            'country'           => 'nullable|string|max:100',
            'country_code'      => 'nullable|string|max:5',
            'type'              => 'required|in:Merit-Based,Need-Based,Athletic,Research,Government,Other',
            'coverage_type'     => 'required|in:Fully Funded,Partial,Tuition Only,Living Expenses,Full Ride',
            'currency'          => 'nullable|string|max:5',
            'monthly_amount'    => 'nullable|numeric|min:0',
            'tuition_coverage'  => 'nullable|numeric|min:0',
            'travel_allowance'  => 'nullable|numeric|min:0',
            'living_allowance'  => 'nullable|numeric|min:0',
            'duration'          => 'nullable|string|max:100',
            'recipients'        => 'nullable|integer|min:1',
            'description'       => 'nullable|string',
            'subject_areas'     => 'nullable|array',
            'subject_areas.*.name'  => 'required|string|max:100',
            'subject_areas.*.count' => 'required|integer|min:0',
            'logo_file'         => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'cover_image_file'  => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        // Handle logo replacement
        if ($request->hasFile('logo_file')) {
            if ($scholarship->logo) $this->deleteFromSupabase($scholarship->logo);
            $validated['logo'] = $this->uploadToSupabase($request->file('logo_file'), 'logos');
        }

        // Handle cover replacement
        if ($request->hasFile('cover_image_file')) {
            if ($scholarship->cover_image) $this->deleteFromSupabase($scholarship->cover_image);
            $validated['cover_image'] = $this->uploadToSupabase($request->file('cover_image_file'), 'covers');
        }

        if (isset($validated['country_code'])) {
            $validated['country_code'] = strtoupper($validated['country_code']);
        }
        if (isset($validated['currency'])) {
            $validated['currency'] = strtoupper($validated['currency']);
        }

        $scholarship->update($validated);

        return back()->with('success', 'Scholarship updated.');
    }

    // ── Contributor: delete ───────────────────────────────────────────────────
    // DELETE /contributor/scholarships/{scholarship}
    public function destroy(Scholarship $scholarship)
    {
        if ($scholarship->created_by !== Auth::id() && !Auth::user()->isAdmin()) {
            abort(403);
        }

        if ($scholarship->logo)        $this->deleteFromSupabase($scholarship->logo);
        if ($scholarship->cover_image) $this->deleteFromSupabase($scholarship->cover_image);

        $scholarship->delete();

        return back()->with('success', 'Scholarship deleted.');
    }

    // ── Supabase helpers ──────────────────────────────────────────────────────

    private function uploadToSupabase(
        \Illuminate\Http\UploadedFile $file,
        string $folder = 'misc'
    ): ?string {
        if (empty($this->supabaseUrl) || empty($this->supabaseKey)) {
            Log::error('Supabase config missing for ScholarshipController');
            return null;
        }

        try {
            $ext      = $file->getClientOriginalExtension() ?: 'jpg';
            $path     = "{$folder}/" . time() . '_' . Str::random(10) . ".{$ext}";
            $endpoint = "{$this->supabaseUrl}/storage/v1/object/{$this->supabaseBucket}/{$path}";
            $mime     = $file->getMimeType() ?: 'image/jpeg';

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->supabaseKey}",
                'Content-Type'  => $mime,
                'x-upsert'      => 'true',
            ])->withBody(file_get_contents($file->getRealPath()), $mime)->post($endpoint);

            if ($response->failed()) {
                Log::error('Supabase upload failed (scholarship)', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return null;
            }

            return "{$this->supabaseUrl}/storage/v1/object/public/{$this->supabaseBucket}/{$path}";

        } catch (\Exception $e) {
            Log::error('Supabase upload exception (scholarship)', ['message' => $e->getMessage()]);
            return null;
        }
    }

    private function deleteFromSupabase(string $publicUrl): void
    {
        try {
            $prefix = "{$this->supabaseUrl}/storage/v1/object/public/{$this->supabaseBucket}/";
            if (!str_starts_with($publicUrl, $prefix)) return;
            $objectPath = substr($publicUrl, strlen($prefix));

            Http::withHeaders([
                'Authorization' => "Bearer {$this->supabaseKey}",
                'Content-Type'  => 'application/json',
            ])->delete(
                "{$this->supabaseUrl}/storage/v1/object/{$this->supabaseBucket}",
                ['prefixes' => [$objectPath]]
            );
        } catch (\Exception $e) {
            Log::error('Supabase delete exception (scholarship)', ['message' => $e->getMessage()]);
        }
    }

    // ── Formatter ─────────────────────────────────────────────────────────────

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
            'created_at'       => $s->created_at?->format('M d, Y'),
        ];
    }
}
