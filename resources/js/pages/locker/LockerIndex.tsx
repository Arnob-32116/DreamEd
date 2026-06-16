import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Program {
    id:          number;
    name:        string;
    degree_type: string;
    school:      string | null;
    university:  string;
}

interface LockerProgram {
    id:          number;
    name:        string;
    degree_type: string;
    university:  string | null;
}

interface LockerScholarship {
    id:   number;
    name: string;
}

interface Locker {
    id:             number;
    name:           string;
    description:    string | null;
    icon:           string;
    type:           string;
    is_starred:     boolean;
    storage_used_mb:number;
    total_docs:     number;
    uploaded_docs:  number;
    validated_docs: number;
    updated_at:     string;
    program:        LockerProgram | null;
    scholarship:    LockerScholarship | null;
}

interface University {
    id:   number;
    name: string;
    slug: string;
}

interface Scholarship {
    id:   number;
    name: string;
    slug: string;
}

interface PageProps {
    lockers:        Locker[];
    storageUsed:    number;
    storageLimit:   number;
    storageUsedMb:  number;
    storageLimitMb: number;
    [key: string]: unknown;
}

// ── Icon map ──────────────────────────────────────────────────────────────────
const ICONS: Record<string, { emoji: string; bg: string; text: string }> = {
    document: { emoji: '📄', bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-600 dark:text-blue-400' },
    academic: { emoji: '🎓', bg: 'bg-red-100 dark:bg-red-900/30',     text: 'text-red-600 dark:text-red-400' },
    personal: { emoji: '👤', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
    financial:{ emoji: '💳', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    study:    { emoji: '📚', bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-600 dark:text-green-400' },
};

const ICON_OPTIONS = [
    { key: 'document',  label: 'Document' },
    { key: 'academic',  label: 'Academic' },
    { key: 'personal',  label: 'Personal' },
    { key: 'financial', label: 'Financial' },
    { key: 'study',     label: 'Study' },
];

// ── Locker Card ───────────────────────────────────────────────────────────────
function LockerCard({ locker, onStar, onDelete }: {
    locker: Locker;
    onStar: (id: number) => void;
    onDelete: (id: number) => void;
}) {
    const [showMenu, setShowMenu] = useState(false);
    const icon = ICONS[locker.icon] ?? ICONS.document;
    const progress = locker.total_docs > 0
        ? Math.round((locker.validated_docs / locker.total_docs) * 100)
        : 0;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all relative">

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl ${icon.bg} flex items-center justify-center text-xl shrink-0`}>
                    {icon.emoji}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onStar(locker.id)}
                        className="text-slate-300 dark:text-slate-600 hover:text-amber-400 transition-colors">
                        <svg className={`w-5 h-5 ${locker.is_starred ? 'fill-amber-400 text-amber-400' : ''}`}
                            fill={locker.is_starred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                        </svg>
                    </button>

                    {/* 3-dot menu */}
                    <div className="relative">
                        <button onClick={() => setShowMenu(v => !v)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                            </svg>
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 min-w-[140px] overflow-hidden">
                                <Link href={`/locker/${locker.id}`}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                    Open
                                </Link>
                                <button onClick={() => { onDelete(locker.id); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                    Delete Locker
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Name + linked */}
            <Link href={`/locker/${locker.id}`} className="block group">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-0.5">
                    {locker.name}
                </h3>
                {locker.description && (
                    <p className="text-[12px] text-slate-400 dark:text-slate-500 leading-snug mb-2 line-clamp-2">
                        {locker.description}
                    </p>
                )}
                {locker.program && (
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
                        {locker.program.university} — {locker.program.name}
                    </p>
                )}
                {locker.scholarship && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate">
                        {locker.scholarship.name}
                    </p>
                )}
            </Link>

            {/* Progress bar */}
            {locker.total_docs > 0 && (
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            {locker.validated_docs}/{locker.total_docs} documents ready
                        </span>
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                            {progress}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}/>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {locker.total_docs} documents
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Modified {locker.updated_at}
                </span>
            </div>
        </div>
    );
}

// ── Create Locker Modal ───────────────────────────────────────────────────────
function CreateLockerModal({ onClose, universities, scholarships }: {
    onClose: () => void;
    universities: University[];
    scholarships: Scholarship[];
}) {
    const [form, setForm] = useState({
        name:                  '',
        description:           '',
        icon:                  'document',
        type:                  'university',
        university_id:         '',
        university_program_id: '',
        scholarship_id:        '',
    });
    const [programs,  setPrograms]  = useState<Program[]>([]);
    const [loading,   setLoading]   = useState(false);
    const [submitting, setSubmitting] = useState(false);

    function set(key: string, value: string) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    // Load programs when university changes
    useEffect(() => {
        if (form.university_id && form.type === 'university') {
            setLoading(true);
            axios.get(`/api/programs?university_id=${form.university_id}`)
                .then(res => setPrograms(res.data))
                .catch(() => setPrograms([]))
                .finally(() => setLoading(false));
        } else {
            setPrograms([]);
        }
        set('university_program_id', '');
    }, [form.university_id, form.type]);

    function handleSubmit() {
        if (!form.name.trim()) return;
        setSubmitting(true);

        const data: Record<string, string> = {
            name:        form.name,
            description: form.description,
            icon:        form.icon,
            type:        form.type,
        };

        if (form.type === 'university' && form.university_program_id) {
            data.university_program_id = form.university_program_id;
        }
        if (form.type === 'scholarship' && form.scholarship_id) {
            data.scholarship_id = form.scholarship_id;
        }

        router.post('/locker', data, {
            onFinish: () => setSubmitting(false),
            onSuccess: () => onClose(),
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 dark:text-slate-100">Create New Folder</h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Organize your documents efficiently</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">

                    {/* Type toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        {[
                            { key: 'university',  label: 'University Specific' },
                            { key: 'scholarship', label: 'Scholarship' },
                        ].map(t => (
                            <button key={t.key} onClick={() => set('type', t.key)}
                                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                                    form.type === t.key
                                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Folder name */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                            Folder Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            placeholder="e.g., MIT Locker, Stanford Locker..."
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 placeholder-slate-400 transition-all"
                        />
                        {form.type === 'university' && form.university_program_id && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                                Creating folder in: {form.type === 'university' ? 'University Specific' : 'Scholarship'}
                            </p>
                        )}
                    </div>

                    {/* University + Program selector */}
                    {form.type === 'university' && (
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">University</label>
                                <select
                                    value={form.university_id}
                                    onChange={e => set('university_id', e.target.value)}
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none focus:border-blue-400 transition-all">
                                    <option value="">Select university (optional)</option>
                                    {universities.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            {form.university_id && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Program</label>
                                    {loading ? (
                                        <div className="text-sm text-slate-400 py-2">Loading programs...</div>
                                    ) : (
                                        <select
                                            value={form.university_program_id}
                                            onChange={e => set('university_program_id', e.target.value)}
                                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none focus:border-blue-400 transition-all">
                                            <option value="">Select program (optional)</option>
                                            {programs.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.degree_type} — {p.name} {p.school ? `(${p.school})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Scholarship selector */}
                    {form.type === 'scholarship' && (
                        <div>
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Scholarship</label>
                            <select
                                value={form.scholarship_id}
                                onChange={e => set('scholarship_id', e.target.value)}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none focus:border-blue-400 transition-all">
                                <option value="">Select scholarship (optional)</option>
                                {scholarships.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                            placeholder="Brief description of what this folder will contain..."
                            rows={2}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 placeholder-slate-400 transition-all resize-none"/>
                    </div>

                    {/* Icon selector */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Choose Icon</label>
                        <div className="flex gap-2">
                            {ICON_OPTIONS.map(opt => {
                                const ic = ICONS[opt.key];
                                return (
                                    <button key={opt.key} onClick={() => set('icon', opt.key)}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all flex-1 ${
                                            form.icon === opt.key
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}>
                                        <span className={`w-8 h-8 rounded-lg ${ic.bg} flex items-center justify-center text-lg`}>
                                            {ic.emoji}
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={submitting || !form.name.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {submitting ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                            </svg>
                        )}
                        Create Folder
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LockerIndex() {
    const { lockers: initialLockers, storageUsedMb, storageLimitMb }
        = usePage<PageProps>().props;

    const [lockers,      setLockers]      = useState<Locker[]>(initialLockers);
    const [showCreate,   setShowCreate]   = useState(false);
    const [filterStarred, setFilterStarred] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [universities, setUniversities] = useState<University[]>([]);
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);

    // Load universities + scholarships for dropdown
    useEffect(() => {
        axios.get('/api/programs?university_id=').catch(() => {});
        // Load universities from existing lockers' data or a separate endpoint
        // For now we'll pass them via a simple fetch
        axios.get('/universities?format=simple').catch(() => {});
    }, []);

    const storagePercent = Math.round((storageUsedMb / storageLimitMb) * 100);
    const storageColor   = storagePercent > 80 ? 'bg-red-500' : storagePercent > 60 ? 'bg-amber-500' : 'bg-blue-500';

    const displayedLockers = filterStarred ? lockers.filter(l => l.is_starred) : lockers;

    function handleStar(id: number) {
        router.post(`/locker/${id}/star`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setLockers(prev => prev.map(l =>
                    l.id === id ? { ...l, is_starred: !l.is_starred } : l
                ));
            },
        });
    }

    function handleDelete(id: number) {
        setDeleteConfirm(id);
    }

    function confirmDelete() {
        if (!deleteConfirm) return;
        router.delete(`/locker/${deleteConfirm}`, {
            onSuccess: () => {
                setLockers(prev => prev.filter(l => l.id !== deleteConfirm));
                setDeleteConfirm(null);
            },
        });
    }

    return (
        <>
            <Head title="Locker" />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

                {/* Header */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
                    <div className="max-w-5xl mx-auto flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Locker</h1>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                                Store and organize your documents
                            </p>
                        </div>
                        <button onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold transition-colors shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                            </svg>
                            New Folder
                        </button>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

                    {/* Search + filter row */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                                <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <input type="text" placeholder="Search folders and documents..."
                                className="flex-1 bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600"/>
                        </div>
                        <button onClick={() => setFilterStarred(v => !v)}
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                                filterStarred
                                    ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 text-amber-500'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:text-amber-400'
                            }`}>
                            <svg className="w-4 h-4" fill={filterStarred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                            </svg>
                        </button>
                    </div>

                    {/* Storage usage */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Storage Usage</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500">
                                {storageUsedMb.toFixed(1)} MB of {storageLimitMb} MB used
                            </p>
                        </div>
                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${storageColor} rounded-full transition-all`}
                                style={{ width: `${Math.min(storagePercent, 100)}%` }}/>
                        </div>
                    </div>

                    {/* Locker grid */}
                    {displayedLockers.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-2xl">
                                🗂️
                            </div>
                            <p className="font-semibold text-slate-600 dark:text-slate-400">
                                {filterStarred ? 'No starred lockers' : 'No lockers yet'}
                            </p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 mb-4">
                                {filterStarred ? 'Star a locker to find it here' : 'Create your first locker to organize your documents'}
                            </p>
                            {!filterStarred && (
                                <button onClick={() => setShowCreate(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                                    </svg>
                                    Create First Locker
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayedLockers.map(locker => (
                                <LockerCard
                                    key={locker.id}
                                    locker={locker}
                                    onStar={handleStar}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create modal */}
            {showCreate && (
                <CreateLockerModal
                    onClose={() => setShowCreate(false)}
                    universities={universities}
                    scholarships={scholarships}
                />
            )}

            {/* Delete confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}/>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm mx-4 w-full">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-2">Delete Locker?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                            This will permanently delete the locker and all uploaded files. This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
