import { useState, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface LockerDocument {
    id:               number;
    name:             string;
    description:      string | null;
    is_mandatory:     boolean;
    accepted_formats: string | null;
    max_size_mb:      number;
    is_custom:        boolean;
    is_uploaded:      boolean;
    is_validated:     boolean;
    file_url:         string | null;
    file_name:        string | null;
    file_type:        string | null;
    file_size:        number | null;
    file_size_mb:     number | null;
}

interface Locker {
    id:              number;
    name:            string;
    description:     string | null;
    icon:            string;
    type:            string;
    is_starred:      boolean;
    storage_used_mb: number;
    total_docs:      number;
    uploaded_docs:   number;
    validated_docs:  number;
    updated_at:      string;
    program:         { id: number; name: string; degree_type: string; university: string | null } | null;
    scholarship:     { id: number; name: string } | null;
    documents:       LockerDocument[];
}

interface PageProps {
    locker: Locker;
    [key: string]: unknown;
}

// ── Icon map ──────────────────────────────────────────────────────────────────
const ICONS: Record<string, { emoji: string; bg: string }> = {
    document: { emoji: '📄', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    academic: { emoji: '🎓', bg: 'bg-red-100 dark:bg-red-900/30' },
    personal: { emoji: '👤', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    financial:{ emoji: '💳', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    study:    { emoji: '📚', bg: 'bg-green-100 dark:bg-green-900/30' },
};

// ── File type icon ─────────────────────────────────────────────────────────────
function FileIcon({ fileType }: { fileType: string | null }) {
    const isPdf  = fileType?.includes('pdf');
    const isWord = fileType?.includes('word') || fileType?.includes('document');
    const isImg  = fileType?.includes('image');

    if (isPdf)  return <span className="text-red-500 text-lg">📕</span>;
    if (isWord) return <span className="text-blue-500 text-lg">📘</span>;
    if (isImg)  return <span className="text-green-500 text-lg">🖼️</span>;
    return <span className="text-slate-400 text-lg">📄</span>;
}

// ── Document Row ──────────────────────────────────────────────────────────────
function DocumentRow({ doc, lockerId, onUpload }: {
    doc: LockerDocument;
    lockerId: number;
    onUpload: (docId: number, file: File) => void;
}) {
    const [uploading,   setUploading]   = useState(false);
    const [deleting,    setDeleting]    = useState(false);
    const [validating,  setValidating]  = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size
        const maxBytes = (doc.max_size_mb ?? 10) * 1048576;
        if (file.size > maxBytes) {
            alert(`File too large. Max size is ${doc.max_size_mb}MB.`);
            return;
        }

        setUploading(true);
        onUpload(doc.id, file);
        setUploading(false);
    }

    function handleDelete() {
        setDeleting(true);
        router.delete(`/locker/${lockerId}/documents/${doc.id}/file`, {
            preserveScroll: true,
            onFinish: () => setDeleting(false),
        });
    }

    function handleValidate() {
        setValidating(true);
        router.post(`/locker/${lockerId}/documents/${doc.id}/validate`, {}, {
            preserveScroll: true,
            onFinish: () => setValidating(false),
        });
    }

    return (
        <div className={`rounded-xl border transition-all ${
            doc.is_validated
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
                : doc.is_uploaded
                ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
        }`}>
            <div className="p-4 flex items-start gap-4">

                {/* Checkbox / Status */}
                <button onClick={handleValidate}
                    disabled={!doc.is_uploaded || validating}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        doc.is_validated
                            ? 'border-emerald-500 bg-emerald-500'
                            : doc.is_uploaded
                            ? 'border-blue-400 hover:border-emerald-400 cursor-pointer'
                            : 'border-slate-300 dark:border-slate-600 cursor-not-allowed opacity-50'
                    }`}>
                    {doc.is_validated && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                        </svg>
                    )}
                </button>

                {/* Doc info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{doc.name}</h3>
                        {doc.is_mandatory && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                Required
                            </span>
                        )}
                        {doc.is_custom && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                Custom
                            </span>
                        )}
                        {doc.is_validated && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                ✓ Ready
                            </span>
                        )}
                    </div>

                    {doc.description && (
                        <p className="text-[12px] text-slate-400 dark:text-slate-500 mb-1">{doc.description}</p>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                        {doc.accepted_formats && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                Formats: {doc.accepted_formats}
                            </span>
                        )}
                        {doc.max_size_mb && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                Max: {doc.max_size_mb}MB
                            </span>
                        )}
                    </div>

                    {/* Uploaded file info */}
                    {doc.is_uploaded && doc.file_name && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <FileIcon fileType={doc.file_type}/>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                                    {doc.file_name}
                                </p>
                                {doc.file_size_mb && (
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                        {doc.file_size_mb} MB
                                    </p>
                                )}
                            </div>
                            <a href={doc.file_url!} target="_blank" rel="noopener noreferrer"
                                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0">
                                View
                            </a>
                            <a href={doc.file_url!} download={doc.file_name}
                                className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:underline shrink-0">
                                Download
                            </a>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Upload */}
                    <button onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-50">
                        {uploading ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                            </svg>
                        )}
                        {doc.is_uploaded ? 'Replace' : 'Upload'}
                    </button>
                    <input ref={fileRef} type="file" hidden onChange={handleFileSelect}
                        accept={doc.accepted_formats
                            ? doc.accepted_formats.split(',').map(f => `.${f.trim().toLowerCase()}`).join(',')
                            : undefined}/>

                    {/* Delete file */}
                    {doc.is_uploaded && (
                        <button onClick={handleDelete} disabled={deleting}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LockerShow() {
    const { locker } = usePage<PageProps>().props;
    const icon = ICONS[locker.icon] ?? ICONS.document;

    const [showAddCustom, setShowAddCustom] = useState(false);
    const [customDocName, setCustomDocName] = useState('');
    const [addingCustom,  setAddingCustom]  = useState(false);

    const progress = locker.total_docs > 0
        ? Math.round((locker.validated_docs / locker.total_docs) * 100)
        : 0;

    const mandatoryDocs = locker.documents.filter(d => d.is_mandatory || !d.is_custom);
    const customDocs    = locker.documents.filter(d => d.is_custom);

    function handleUpload(docId: number, file: File) {
        const formData = new FormData();
        formData.append('file', file);

        router.post(`/locker/${locker.id}/documents/${docId}/upload`, formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    function handleAddCustom() {
        if (!customDocName.trim()) return;
        setAddingCustom(true);
        router.post(`/locker/${locker.id}/documents`, { name: customDocName }, {
            preserveScroll: true,
            onSuccess: () => {
                setCustomDocName('');
                setShowAddCustom(false);
            },
            onFinish: () => setAddingCustom(false),
        });
    }

    function handleRemoveCustom(docId: number) {
        router.delete(`/locker/${locker.id}/documents/${docId}`, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={locker.name} />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

                {/* Header */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                    <div className="max-w-3xl mx-auto flex items-center gap-4">
                        <Link href="/locker"
                            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                            </svg>
                            Back
                        </Link>

                        <div className={`w-10 h-10 rounded-xl ${icon.bg} flex items-center justify-center text-xl shrink-0`}>
                            {icon.emoji}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{locker.name}</h1>
                            {locker.program && (
                                <p className="text-[12px] text-blue-600 dark:text-blue-400 truncate">
                                    {locker.program.university} — {locker.program.degree_type} in {locker.program.name}
                                </p>
                            )}
                            {locker.scholarship && (
                                <p className="text-[12px] text-amber-600 dark:text-amber-400 truncate">
                                    {locker.scholarship.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

                    {/* Stats + progress */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="font-bold text-slate-800 dark:text-slate-100">
                                    {locker.name}
                                </h2>
                                {locker.description && (
                                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{locker.description}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{progress}%</p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">Complete</p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                            <div className={`h-full rounded-full transition-all ${
                                progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                            }`} style={{ width: `${progress}%` }}/>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 flex-wrap text-sm">
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"/>
                                {locker.total_docs} documents
                            </div>
                            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                <span className="w-2 h-2 rounded-full bg-blue-400"/>
                                {locker.uploaded_docs} uploaded
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"/>
                                {locker.validated_docs} ready
                            </div>
                        </div>
                    </div>

                    {/* Upload button area */}
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            Documents in this folder
                            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                {locker.total_docs} documents
                            </span>
                        </h2>
                        <button onClick={() => setShowAddCustom(v => !v)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[13px] font-semibold transition-colors shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                            </svg>
                            Upload Files
                        </button>
                    </div>

                    {/* Add custom document form */}
                    {showAddCustom && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800 p-4">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Add Custom Document</p>
                            <div className="flex gap-2">
                                <input type="text"
                                    value={customDocName}
                                    onChange={e => setCustomDocName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
                                    placeholder="Document name e.g. Bank Statement"
                                    className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none focus:border-blue-400 placeholder-slate-400 transition-all"/>
                                <button onClick={handleAddCustom} disabled={addingCustom || !customDocName.trim()}
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                                    Add
                                </button>
                                <button onClick={() => setShowAddCustom(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mandatory / required docs */}
                    {mandatoryDocs.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Required Documents
                            </h3>
                            {mandatoryDocs.map(doc => (
                                <DocumentRow
                                    key={doc.id}
                                    doc={doc}
                                    lockerId={locker.id}
                                    onUpload={handleUpload}
                                />
                            ))}
                        </div>
                    )}

                    {/* Custom docs */}
                    {customDocs.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Additional Documents
                            </h3>
                            {customDocs.map(doc => (
                                <div key={doc.id} className="relative">
                                    <DocumentRow
                                        doc={doc}
                                        lockerId={locker.id}
                                        onUpload={handleUpload}
                                    />
                                    <button onClick={() => handleRemoveCustom(doc.id)}
                                        className="absolute top-3 right-16 text-[11px] text-red-500 hover:underline">
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {locker.total_docs === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <p className="text-2xl mb-3">📂</p>
                            <p className="font-semibold text-slate-600 dark:text-slate-400">No documents yet</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                                {locker.program || locker.scholarship
                                    ? 'No required documents have been added for this program/scholarship yet.'
                                    : 'Add custom documents using the button above.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
