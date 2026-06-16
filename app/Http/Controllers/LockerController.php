<?php

namespace App\Http\Controllers;

use App\Models\Locker;
use App\Models\LockerDocument;
use App\Models\ProgramRequiredDocument;
use App\Models\ScholarshipRequiredDocument;
use App\Models\UniversityProgram;
use App\Models\Scholarship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LockerController extends Controller
{
    private string $supabaseUrl;
    private string $supabaseKey;
    private string $supabaseBucket = 'LockerFiles';

    const STORAGE_LIMIT = 104857600; // 100MB in bytes

    public function __construct()
    {
        $this->supabaseUrl = rtrim(config('services.supabase.url', ''), '/');
        $this->supabaseKey = config('services.supabase.service_role_key', '');
    }

    // ── List all lockers ──────────────────────────────────────────────────────
    public function index()
    {
        $user    = Auth::user();
        $lockers = Locker::where('user_id', $user->id)
            ->with(['documents', 'program.university', 'scholarship'])
            ->orderByDesc('is_starred')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn($l) => $this->formatLocker($l));

        $storageUsed  = $user->storage_used ?? 0;
        $storageLimit = $user->storage_limit ?? self::STORAGE_LIMIT;

        return Inertia::render('student/locker/Index', [
            'lockers'      => $lockers,
            'storageUsed'  => $storageUsed,
            'storageLimit' => $storageLimit,
            'storageUsedMb'  => round($storageUsed / 1048576, 2),
            'storageLimitMb' => round($storageLimit / 1048576, 2),
        ]);
    }

    // ── Show single locker ────────────────────────────────────────────────────
    public function show(int $id)
    {
        $locker = Locker::where('user_id', Auth::id())
            ->with(['documents.requiredDocument', 'program.university', 'scholarship'])
            ->findOrFail($id);

        return Inertia::render('student/locker/Show', [
            'locker' => $this->formatLockerDetail($locker),
        ]);
    }

    // ── Create locker ─────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'description'           => 'nullable|string',
            'icon'                  => 'nullable|string|in:document,academic,personal,financial,study',
            'type'                  => 'required|in:university,scholarship',
            'university_program_id' => 'nullable|integer|exists:university_programs,id',
            'scholarship_id'        => 'nullable|integer|exists:scholarships,id',
        ]);

        $locker = Locker::create([
            'user_id'               => Auth::id(),
            'name'                  => $request->input('name'),
            'description'           => $request->input('description'),
            'icon'                  => $request->input('icon', 'document'),
            'type'                  => $request->input('type'),
            'university_program_id' => $request->input('university_program_id'),
            'scholarship_id'        => $request->input('scholarship_id'),
            'is_starred'            => false,
            'storage_used'          => 0,
        ]);

        // Auto-populate checklist from required documents
        $this->populateChecklist($locker);

        return redirect()->route('locker.show', $locker->id)
            ->with('success', 'Locker created successfully.');
    }

    // ── Update locker info ────────────────────────────────────────────────────
    public function update(Request $request, int $id)
    {
        $locker = Locker::where('user_id', Auth::id())->findOrFail($id);

        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon'        => 'nullable|string|in:document,academic,personal,financial,study',
            'is_starred'  => 'nullable|boolean',
        ]);

        $locker->update($request->only(['name', 'description', 'icon', 'is_starred']));

        return back()->with('success', 'Locker updated.');
    }

    // ── Delete locker ─────────────────────────────────────────────────────────
    public function destroy(int $id)
    {
        $locker = Locker::where('user_id', Auth::id())
            ->with('documents')
            ->findOrFail($id);

        // Delete all files from Supabase
        foreach ($locker->documents as $doc) {
            if ($doc->file_url) {
                $this->deleteFromSupabase($doc->file_url);
            }
        }

        // Subtract storage from user
        $user = Auth::user();
        $user->decrement('storage_used', $locker->storage_used);

        $locker->delete();

        return redirect()->route('locker.index')->with('success', 'Locker deleted.');
    }

    // ── Toggle star ───────────────────────────────────────────────────────────
    public function toggleStar(int $id)
    {
        $locker = Locker::where('user_id', Auth::id())->findOrFail($id);
        $locker->update(['is_starred' => !$locker->is_starred]);

        return back()->with('success', 'Updated.');
    }

    // ── Upload file to a locker document ──────────────────────────────────────
    public function uploadFile(Request $request, int $lockerId, int $documentId)
    {
        $locker   = Locker::where('user_id', Auth::id())->findOrFail($lockerId);
        $document = LockerDocument::where('locker_id', $locker->id)->findOrFail($documentId);

        $request->validate([
            'file' => 'required|file|max:10240', // 10MB per file
        ]);

        $file     = $request->file('file');
        $fileSize = $file->getSize();
        $user     = Auth::user();

        // Check storage limit
        $currentUsed = $user->storage_used ?? 0;
        $storageLimit = $user->storage_limit ?? self::STORAGE_LIMIT;

        if (($currentUsed + $fileSize) > $storageLimit) {
            return back()->withErrors(['file' => 'Storage limit reached. You have used ' . round($currentUsed / 1048576, 1) . 'MB of your 100MB limit.']);
        }

        // Delete old file if exists
        if ($document->file_url) {
            $this->deleteFromSupabase($document->file_url);
            $user->decrement('storage_used', $document->file_size ?? 0);
            $locker->decrement('storage_used', $document->file_size ?? 0);
        }

        // Upload to Supabase
        $fileUrl = $this->uploadToSupabase($file, Auth::id());

        if (!$fileUrl) {
            return back()->withErrors(['file' => 'Upload failed. Please try again.']);
        }

        // Update document
        $document->update([
            'file_url'    => $fileUrl,
            'file_name'   => $file->getClientOriginalName(),
            'file_type'   => $file->getMimeType(),
            'file_size'   => $fileSize,
            'is_uploaded' => true,
        ]);

        // Update storage usage
        $user->increment('storage_used', $fileSize);
        $locker->increment('storage_used', $fileSize);

        return back()->with('success', 'File uploaded successfully.');
    }

    // ── Delete file from locker document ──────────────────────────────────────
    public function deleteFile(int $lockerId, int $documentId)
    {
        $locker   = Locker::where('user_id', Auth::id())->findOrFail($lockerId);
        $document = LockerDocument::where('locker_id', $locker->id)->findOrFail($documentId);

        if ($document->file_url) {
            $this->deleteFromSupabase($document->file_url);
            $fileSize = $document->file_size ?? 0;

            Auth::user()->decrement('storage_used', $fileSize);
            $locker->decrement('storage_used', $fileSize);
        }

        $document->update([
            'file_url'    => null,
            'file_name'   => null,
            'file_type'   => null,
            'file_size'   => null,
            'is_uploaded' => false,
            'is_validated'=> false,
        ]);

        return back()->with('success', 'File removed.');
    }

    // ── Toggle validated (tick) ───────────────────────────────────────────────
    public function toggleValidate(int $lockerId, int $documentId)
    {
        $locker   = Locker::where('user_id', Auth::id())->findOrFail($lockerId);
        $document = LockerDocument::where('locker_id', $locker->id)->findOrFail($documentId);

        // Can only validate if file is uploaded
        if (!$document->is_uploaded) {
            return back()->withErrors(['document' => 'Please upload the file first before marking it as ready.']);
        }

        $document->update(['is_validated' => !$document->is_validated]);

        return back()->with('success', 'Updated.');
    }

    // ── Add custom document to locker ─────────────────────────────────────────
    public function addCustomDocument(Request $request, int $lockerId)
    {
        $locker = Locker::where('user_id', Auth::id())->findOrFail($lockerId);

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        LockerDocument::create([
            'locker_id'   => $locker->id,
            'custom_name' => $request->input('name'),
            'is_custom'   => true,
            'is_uploaded' => false,
            'is_validated'=> false,
        ]);

        return back()->with('success', 'Document added.');
    }

    // ── Remove custom document ────────────────────────────────────────────────
    public function removeDocument(int $lockerId, int $documentId)
    {
        $locker   = Locker::where('user_id', Auth::id())->findOrFail($lockerId);
        $document = LockerDocument::where('locker_id', $locker->id)
            ->where('is_custom', true)
            ->findOrFail($documentId);

        if ($document->file_url) {
            $this->deleteFromSupabase($document->file_url);
            Auth::user()->decrement('storage_used', $document->file_size ?? 0);
            $locker->decrement('storage_used', $document->file_size ?? 0);
        }

        $document->delete();

        return back()->with('success', 'Document removed.');
    }

    // ── Get programs for locker creation dropdown ─────────────────────────────
    public function getPrograms(Request $request)
    {
        $universityId = $request->integer('university_id');

        $programs = UniversityProgram::whereHas('university', function ($q) use ($universityId) {
            $q->where('id', $universityId)->where('is_published', true);
        })->with('university:id,name,abbreviation')
          ->get()
          ->map(fn($p) => [
              'id'          => $p->id,
              'name'        => $p->name,
              'degree_type' => $p->degree_type,
              'school'      => $p->school,
              'university'  => $p->university->name,
          ]);

        return response()->json($programs);
    }

    // ── Auto-populate checklist from required documents ───────────────────────
    private function populateChecklist(Locker $locker): void
    {
        $documents = [];

        if ($locker->type === 'university' && $locker->university_program_id) {
            $documents = ProgramRequiredDocument::where('university_program_id', $locker->university_program_id)
                ->orderBy('sort_order')
                ->get();

            foreach ($documents as $doc) {
                LockerDocument::create([
                    'locker_id'              => $locker->id,
                    'required_document_type' => ProgramRequiredDocument::class,
                    'required_document_id'   => $doc->id,
                    'is_custom'              => false,
                    'is_uploaded'            => false,
                    'is_validated'           => false,
                ]);
            }
        }

        if ($locker->type === 'scholarship' && $locker->scholarship_id) {
            $documents = ScholarshipRequiredDocument::where('scholarship_id', $locker->scholarship_id)
                ->orderBy('sort_order')
                ->get();

            foreach ($documents as $doc) {
                LockerDocument::create([
                    'locker_id'              => $locker->id,
                    'required_document_type' => ScholarshipRequiredDocument::class,
                    'required_document_id'   => $doc->id,
                    'is_custom'              => false,
                    'is_uploaded'            => false,
                    'is_validated'           => false,
                ]);
            }
        }
    }

    // ── Upload to Supabase ────────────────────────────────────────────────────
    private function uploadToSupabase(\Illuminate\Http\UploadedFile $file, int $userId): ?string
    {
        if (empty($this->supabaseUrl) || empty($this->supabaseKey)) {
            Log::error('Supabase config missing for locker upload.');
            return null;
        }

        try {
            $extension = $file->getClientOriginalExtension() ?: 'pdf';
            $path      = "user_{$userId}/" . time() . '_' . Str::random(10) . '.' . $extension;
            $endpoint  = "{$this->supabaseUrl}/storage/v1/object/{$this->supabaseBucket}/{$path}";
            $mimeType  = $file->getMimeType() ?: 'application/pdf';

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->supabaseKey}",
                'Content-Type'  => $mimeType,
                'x-upsert'      => 'true',
            ])->withBody(file_get_contents($file->getRealPath()), $mimeType)
              ->post($endpoint);

            if ($response->failed()) {
                Log::error('Supabase locker upload failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return null;
            }

            return "{$this->supabaseUrl}/storage/v1/object/public/{$this->supabaseBucket}/{$path}";
        } catch (\Exception $e) {
            Log::error('Supabase locker upload exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    // ── Delete from Supabase ──────────────────────────────────────────────────
    private function deleteFromSupabase(string $fileUrl): void
    {
        try {
            $path     = str_replace("{$this->supabaseUrl}/storage/v1/object/public/{$this->supabaseBucket}/", '', $fileUrl);
            $endpoint = "{$this->supabaseUrl}/storage/v1/object/{$this->supabaseBucket}/{$path}";

            Http::withHeaders([
                'Authorization' => "Bearer {$this->supabaseKey}",
            ])->delete($endpoint);
        } catch (\Exception $e) {
            Log::error('Supabase locker delete exception', ['message' => $e->getMessage()]);
        }
    }

    // ── Format locker for index ───────────────────────────────────────────────
    private function formatLocker(Locker $l): array
    {
        $totalDocs    = $l->documents->count();
        $uploadedDocs = $l->documents->where('is_uploaded', true)->count();
        $validatedDocs= $l->documents->where('is_validated', true)->count();

        return [
            'id'           => $l->id,
            'name'         => $l->name,
            'description'  => $l->description,
            'icon'         => $l->icon,
            'type'         => $l->type,
            'is_starred'   => $l->is_starred,
            'storage_used' => $l->storage_used,
            'storage_used_mb' => round($l->storage_used / 1048576, 2),
            'total_docs'   => $totalDocs,
            'uploaded_docs'=> $uploadedDocs,
            'validated_docs'=> $validatedDocs,
            'updated_at'   => $l->updated_at?->format('Y-m-d'),
            'program'      => $l->program ? [
                'id'          => $l->program->id,
                'name'        => $l->program->name,
                'degree_type' => $l->program->degree_type,
                'university'  => $l->program->university?->name,
            ] : null,
            'scholarship'  => $l->scholarship ? [
                'id'   => $l->scholarship->id,
                'name' => $l->scholarship->name,
            ] : null,
        ];
    }

    // ── Format locker detail for show ────────────────────────────────────────
    private function formatLockerDetail(Locker $l): array
    {
        $base = $this->formatLocker($l);

        $base['documents'] = $l->documents->map(function ($doc) {
            $reqDoc = $doc->requiredDocument;
            return [
                'id'           => $doc->id,
                'name'         => $doc->is_custom ? $doc->custom_name : ($reqDoc?->name ?? 'Unknown'),
                'description'  => $reqDoc?->description ?? null,
                'is_mandatory' => $reqDoc?->is_mandatory ?? false,
                'accepted_formats' => $reqDoc?->accepted_formats ?? null,
                'max_size_mb'  => $reqDoc?->max_size_mb ?? 10,
                'is_custom'    => $doc->is_custom,
                'is_uploaded'  => $doc->is_uploaded,
                'is_validated' => $doc->is_validated,
                'file_url'     => $doc->file_url,
                'file_name'    => $doc->file_name,
                'file_type'    => $doc->file_type,
                'file_size'    => $doc->file_size,
                'file_size_mb' => $doc->file_size ? round($doc->file_size / 1048576, 2) : null,
            ];
        })->values()->toArray();

        return $base;
    }
}
