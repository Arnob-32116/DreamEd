import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SubjectArea {
    name: string;
    count: number;
}

interface ScholarshipData {
    id: number;
    name: string;
    slug: string;
    institution: string;
    logo: string | null;
    cover_image: string | null;
    website: string | null;
    country: string | null;
    country_code: string | null;
    type: string;
    coverage_type: string;
    currency: string;
    currency_symbol: string;
    monthly_amount: number | null;
    tuition_coverage: number | null;
    travel_allowance: number | null;
    living_allowance: number | null;
    duration: string | null;
    recipients: number | null;
    description: string | null;
    subject_areas: SubjectArea[];
    is_published: boolean;
}

interface PageProps {
    scholarship: ScholarshipData;
    [key: string]: unknown;
}

interface FormState {
    name: string;
    institution: string;
    website: string;
    country: string;
    country_code: string;
    type: string;
    description: string;
    logo_file: File | null;
    logo_preview: string;
    cover_image_file: File | null;
    cover_preview: string;
    coverage_type: string;
    currency: string;
    monthly_amount: string;
    tuition_coverage: string;
    travel_allowance: string;
    living_allowance: string;
    duration: string;
    recipients: string;
    subject_areas: SubjectArea[];
}

type Errors = Partial<Record<string, string>>;
type Tab = 'basic' | 'financial' | 'subjects';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SCHOLARSHIP_TYPES = [
    'Merit-Based', 'Need-Based', 'Athletic', 'Research', 'Government', 'Other',
];

const COVERAGE_TYPES = [
    'Fully Funded', 'Partial', 'Tuition Only', 'Living Expenses', 'Full Ride',
];

const CURRENCIES = [
    { code: 'USD', symbol: '$',    label: 'US Dollar' },
    { code: 'EUR', symbol: '€',    label: 'Euro' },
    { code: 'GBP', symbol: '£',    label: 'British Pound' },
    { code: 'CAD', symbol: 'CA$',  label: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'AU$',  label: 'Australian Dollar' },
    { code: 'CHF', symbol: 'CHF ', label: 'Swiss Franc' },
];

const COMMON_SUBJECTS = [
    'Engineering', 'Natural Sciences', 'Social Sciences', 'Business',
    'Medicine', 'Arts', 'Law', 'Computer Science', 'Education',
    'Agriculture', 'Architecture', 'Economics', 'Humanities',
];

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
        key: 'basic',
        label: 'Basic Info',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        key: 'financial',
        label: 'Financial',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        key: 'subjects',
        label: 'Subject Areas',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI primitives (same style as Create.tsx)
// ─────────────────────────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block text-[12.5px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
            {children}
            {required && <span className="text-red-400 ml-1">*</span>}
        </label>
    );
}

function TextInput({
    value, onChange, placeholder, error, type = 'text', prefix,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    error?: string;
    type?: string;
    prefix?: string;
}) {
    return (
        <div>
            <div className={`flex items-center bg-white dark:bg-zinc-800 border rounded-xl overflow-hidden transition-all ${
                error
                    ? 'border-red-300 dark:border-red-700 ring-1 ring-red-300 dark:ring-red-700'
                    : 'border-zinc-200 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-[#1a6b8a]/30 focus-within:border-[#1a6b8a]/60'
            }`}>
                {prefix && (
                    <span className="pl-4 text-zinc-400 dark:text-zinc-500 text-[14px] font-medium shrink-0 select-none">
                        {prefix}
                    </span>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-3 text-[14px] text-zinc-800 dark:text-zinc-100 bg-transparent border-none outline-none placeholder-zinc-300 dark:placeholder-zinc-600"
                />
            </div>
            {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}
        </div>
    );
}

function TextArea({
    value, onChange, placeholder, rows = 4, error,
}: {
    value: string; onChange: (v: string) => void;
    placeholder?: string; rows?: number; error?: string;
}) {
    return (
        <div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className={`w-full px-4 py-3 text-[14px] text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 border rounded-xl outline-none resize-none placeholder-zinc-300 dark:placeholder-zinc-600 transition-all ${
                    error
                        ? 'border-red-300 dark:border-red-700'
                        : 'border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-[#1a6b8a]/30 focus:border-[#1a6b8a]/60'
                }`}
            />
            {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}
        </div>
    );
}

function SelectInput({
    value, onChange, options,
}: {
    value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 text-[14px] text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-[#1a6b8a]/30 focus:border-[#1a6b8a]/60 transition-all"
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}

function PillSelector({
    options, value, onChange,
}: {
    options: string[]; value: string; onChange: (v: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
                <button
                    key={opt}
                    type="button"
                    onClick={() => onChange(opt)}
                    className={`py-2 px-4 rounded-xl text-[13px] font-semibold border-2 transition-all ${
                        value === opt
                            ? 'bg-[#1a6b8a]/10 dark:bg-[#1a6b8a]/20 border-[#1a6b8a] text-[#1a6b8a] dark:text-[#3a9bbf]'
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}

// Image preview + replace
function ImageField({
    label, currentUrl, preview, onChange, hint,
}: {
    label: string;
    currentUrl: string | null;
    preview: string;
    onChange: (file: File, preview: string) => void;
    hint?: string;
}) {
    const displayed = preview || currentUrl;

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange(file, ev.target?.result as string);
        reader.readAsDataURL(file);
    }

    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <label className="block cursor-pointer">
                <div className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all hover:border-[#1a6b8a]/60 ${
                    displayed ? 'border-[#1a6b8a]/40' : 'border-zinc-300 dark:border-zinc-700'
                }`}>
                    {displayed ? (
                        <div className="relative h-32 group">
                            <img src={displayed} alt="preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="text-white text-[12px] font-semibold">Replace image</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-32 flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                            <span className="text-[12.5px] font-medium">Upload {label}</span>
                            {hint && <span className="text-[11px] opacity-70">{hint}</span>}
                        </div>
                    )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Success toast
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[13.5px] font-semibold px-5 py-3.5 rounded-2xl shadow-xl">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {message}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Edit page
// ─────────────────────────────────────────────────────────────────────────────

export default function EditScholarship() {
    const { scholarship: s } = usePage<PageProps>().props;

    const [activeTab, setActiveTab] = useState<Tab>('basic');
    const [errors, setErrors]       = useState<Errors>({});
    const [saving, setSaving]       = useState(false);
    const [toast, setToast]         = useState('');

    // ── Initialise form from existing scholarship ────────────────────────────
    const [form, setForm] = useState<FormState>({
        name:              s.name,
        institution:       s.institution,
        website:           s.website ?? '',
        country:           s.country ?? '',
        country_code:      s.country_code ?? '',
        type:              s.type,
        description:       s.description ?? '',
        logo_file:         null,
        logo_preview:      '',
        cover_image_file:  null,
        cover_preview:     '',
        coverage_type:     s.coverage_type,
        currency:          s.currency,
        monthly_amount:    s.monthly_amount    != null ? String(s.monthly_amount)    : '',
        tuition_coverage:  s.tuition_coverage  != null ? String(s.tuition_coverage)  : '',
        travel_allowance:  s.travel_allowance  != null ? String(s.travel_allowance)  : '',
        living_allowance:  s.living_allowance  != null ? String(s.living_allowance)  : '',
        duration:          s.duration ?? '',
        recipients:        s.recipients != null ? String(s.recipients) : '',
        subject_areas:     s.subject_areas ?? [],
    });

    function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    // ── Validation ───────────────────────────────────────────────────────────
    function validate(): boolean {
        const errs: Errors = {};
        if (!form.name.trim())        errs.name        = 'Scholarship name is required.';
        if (!form.institution.trim()) errs.institution  = 'Institution name is required.';
        if (form.website && !/^https?:\/\/.+/.test(form.website))
            errs.website = 'Enter a valid URL starting with https://';
        if (form.monthly_amount   && isNaN(Number(form.monthly_amount)))   errs.monthly_amount   = 'Must be a number.';
        if (form.tuition_coverage && isNaN(Number(form.tuition_coverage))) errs.tuition_coverage = 'Must be a number.';
        if (form.travel_allowance && isNaN(Number(form.travel_allowance))) errs.travel_allowance = 'Must be a number.';
        if (form.living_allowance && isNaN(Number(form.living_allowance))) errs.living_allowance = 'Must be a number.';
        if (form.recipients       && isNaN(Number(form.recipients)))       errs.recipients       = 'Must be a whole number.';
        setErrors(errs);
        if (Object.keys(errs).length > 0) {
            // Switch to tab with first error
            const basicKeys    = ['name', 'institution', 'website', 'country', 'country_code', 'description'];
            const financialKeys = ['monthly_amount', 'tuition_coverage', 'travel_allowance', 'living_allowance', 'recipients'];
            if (Object.keys(errs).some((k) => basicKeys.includes(k)))     setActiveTab('basic');
            else if (Object.keys(errs).some((k) => financialKeys.includes(k))) setActiveTab('financial');
        }
        return Object.keys(errs).length === 0;
    }

    // ── Submit ───────────────────────────────────────────────────────────────
    function handleSave() {
        if (!validate() || saving) return;
        setSaving(true);

        const fd = new FormData();
        fd.append('_method',       'PUT');
        fd.append('name',          form.name.trim());
        fd.append('institution',   form.institution.trim());
        fd.append('website',       form.website.trim());
        fd.append('country',       form.country.trim());
        fd.append('country_code',  form.country_code.trim().toUpperCase());
        fd.append('type',          form.type);
        fd.append('description',   form.description.trim());
        fd.append('coverage_type', form.coverage_type);
        fd.append('currency',      form.currency);

        if (form.monthly_amount)   fd.append('monthly_amount',   form.monthly_amount);
        if (form.tuition_coverage !== '') fd.append('tuition_coverage', form.tuition_coverage);
        if (form.travel_allowance) fd.append('travel_allowance', form.travel_allowance);
        if (form.living_allowance) fd.append('living_allowance', form.living_allowance);
        if (form.duration)         fd.append('duration',         form.duration.trim());
        if (form.recipients)       fd.append('recipients',       form.recipients);

        if (form.logo_file)        fd.append('logo_file',        form.logo_file);
        if (form.cover_image_file) fd.append('cover_image_file', form.cover_image_file);

        fd.append('subject_areas', JSON.stringify(form.subject_areas));

        router.post(`/contributor/scholarships/${s.id}`, fd, {
            forceFormData: true,
            onSuccess: () => {
                setSaving(false);
                setToast('Scholarship updated successfully!');
            },
            onError: (e) => {
                setSaving(false);
                setErrors(e);
            },
            onFinish: () => setSaving(false),
        });
    }

    // ── Subject area helpers ─────────────────────────────────────────────────
    const selectedNames = form.subject_areas.map((sa) => sa.name);

    function toggleSubject(name: string) {
        const exists = form.subject_areas.find((sa) => sa.name === name);
        setField('subject_areas',
            exists
                ? form.subject_areas.filter((sa) => sa.name !== name)
                : [...form.subject_areas, { name, count: 0 }],
        );
    }

    function updateCount(name: string, count: number) {
        setField('subject_areas',
            form.subject_areas.map((sa) => sa.name === name ? { ...sa, count } : sa),
        );
    }

    function removeSubject(name: string) {
        setField('subject_areas', form.subject_areas.filter((sa) => sa.name !== name));
    }

    const [customName, setCustomName]   = useState('');
    const [customCount, setCustomCount] = useState('');

    function addCustom() {
        const name = customName.trim();
        if (!name || selectedNames.includes(name)) return;
        setField('subject_areas', [...form.subject_areas, { name, count: parseInt(customCount) || 0 }]);
        setCustomName('');
        setCustomCount('');
    }

    const sym = CURRENCIES.find((c) => c.code === form.currency)?.symbol ?? '$';

    return (
        <>
            <Head title={`Edit — ${s.name}`} />

            <div className="flex-1 min-h-screen bg-[#f3f4f6] dark:bg-zinc-950 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 mb-6 text-[13px]">
                        <Link
                            href="/contributor/scholarships"
                            className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors no-underline"
                        >
                            My Scholarships
                        </Link>
                        <span className="text-zinc-300 dark:text-zinc-700">/</span>
                        <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-xs">{s.name}</span>
                        <span className="text-zinc-300 dark:text-zinc-700">/</span>
                        <span className="text-zinc-500 dark:text-zinc-400">Edit</span>
                    </div>

                    {/* Page header */}
                    <div className="flex items-start justify-between gap-4 mb-7">
                        <div className="flex items-center gap-4">
                            {/* Logo thumbnail */}
                            <div className="w-14 h-14 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800 shrink-0 shadow-sm">
                                {(form.logo_preview || s.logo) ? (
                                    <img
                                        src={form.logo_preview || s.logo!}
                                        alt={s.institution}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#2a7fa0] to-[#1a5570] flex items-center justify-center">
                                        <span className="text-white text-[16px] font-black">
                                            {s.institution.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-[20px] font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                                    {form.name || s.name}
                                </h1>
                                <p className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                                    {form.institution || s.institution}
                                </p>
                            </div>
                        </div>

                        {/* View public page */}
                        <a
                            href={`/scholarships/${s.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-400 dark:text-zinc-500 hover:text-[#1a6b8a] dark:hover:text-[#3a9bbf] border border-zinc-200 dark:border-zinc-700 hover:border-[#1a6b8a]/40 rounded-xl px-3.5 py-2 transition-all no-underline shrink-0"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            View Live
                        </a>
                    </div>

                    {/* Tab bar */}
                    <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6">
                        {TABS.map((tab) => {
                            const hasError =
                                tab.key === 'basic'
                                    ? ['name', 'institution', 'website'].some((k) => errors[k])
                                    : tab.key === 'financial'
                                    ? ['monthly_amount', 'tuition_coverage', 'travel_allowance', 'living_allowance', 'recipients'].some((k) => errors[k])
                                    : false;

                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-5 py-3 text-[13.5px] font-semibold border-b-2 -mb-px transition-all ${
                                        activeTab === tab.key
                                            ? 'border-[#1a6b8a] text-[#1a6b8a] dark:text-[#3a9bbf] dark:border-[#3a9bbf]'
                                            : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {hasError && (
                                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">

                        {/* ── Tab: Basic Info ── */}
                        {activeTab === 'basic' && (
                            <div className="flex flex-col gap-5">
                                {/* Images */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ImageField
                                        label="Logo / Badge"
                                        currentUrl={s.logo}
                                        preview={form.logo_preview}
                                        hint="PNG, JPG up to 2MB"
                                        onChange={(f, p) => { setField('logo_file', f); setField('logo_preview', p); }}
                                    />
                                    <ImageField
                                        label="Cover Image"
                                        currentUrl={s.cover_image}
                                        preview={form.cover_preview}
                                        hint="PNG, JPG up to 5MB"
                                        onChange={(f, p) => { setField('cover_image_file', f); setField('cover_preview', p); }}
                                    />
                                </div>

                                <div>
                                    <FieldLabel required>Scholarship Name</FieldLabel>
                                    <TextInput
                                        value={form.name}
                                        onChange={(v) => setField('name', v)}
                                        placeholder="e.g. DAAD Research Grants"
                                        error={errors.name}
                                    />
                                </div>

                                <div>
                                    <FieldLabel required>Institution / Organisation</FieldLabel>
                                    <TextInput
                                        value={form.institution}
                                        onChange={(v) => setField('institution', v)}
                                        placeholder="e.g. DAAD Institution"
                                        error={errors.institution}
                                    />
                                </div>

                                <div>
                                    <FieldLabel>Official Website</FieldLabel>
                                    <TextInput
                                        value={form.website}
                                        onChange={(v) => setField('website', v)}
                                        placeholder="https://"
                                        error={errors.website}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <FieldLabel>Country</FieldLabel>
                                        <TextInput
                                            value={form.country}
                                            onChange={(v) => setField('country', v)}
                                            placeholder="e.g. Germany"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Country Code</FieldLabel>
                                        <TextInput
                                            value={form.country_code}
                                            onChange={(v) => setField('country_code', v.toUpperCase().slice(0, 5))}
                                            placeholder="e.g. DE"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <FieldLabel required>Scholarship Type</FieldLabel>
                                    <PillSelector
                                        options={SCHOLARSHIP_TYPES}
                                        value={form.type}
                                        onChange={(v) => setField('type', v)}
                                    />
                                </div>

                                <div>
                                    <FieldLabel>Description</FieldLabel>
                                    <TextArea
                                        value={form.description}
                                        onChange={(v) => setField('description', v)}
                                        placeholder="Describe the scholarship..."
                                        error={errors.description}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Financial ── */}
                        {activeTab === 'financial' && (
                            <div className="flex flex-col gap-5">
                                <div>
                                    <FieldLabel required>Coverage Type</FieldLabel>
                                    <PillSelector
                                        options={COVERAGE_TYPES}
                                        value={form.coverage_type}
                                        onChange={(v) => setField('coverage_type', v)}
                                    />
                                </div>

                                <div>
                                    <FieldLabel>Currency</FieldLabel>
                                    <SelectInput
                                        value={form.currency}
                                        onChange={(v) => setField('currency', v)}
                                        options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.symbol} ${c.label}` }))}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <FieldLabel>Monthly Stipend</FieldLabel>
                                        <TextInput
                                            value={form.monthly_amount}
                                            onChange={(v) => setField('monthly_amount', v)}
                                            placeholder="e.g. 2000"
                                            prefix={sym}
                                            type="number"
                                            error={errors.monthly_amount}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Tuition Coverage</FieldLabel>
                                        <TextInput
                                            value={form.tuition_coverage}
                                            onChange={(v) => setField('tuition_coverage', v)}
                                            placeholder="0 = fully covered"
                                            prefix={sym}
                                            type="number"
                                            error={errors.tuition_coverage}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Travel Allowance</FieldLabel>
                                        <TextInput
                                            value={form.travel_allowance}
                                            onChange={(v) => setField('travel_allowance', v)}
                                            placeholder="e.g. 500"
                                            prefix={sym}
                                            type="number"
                                            error={errors.travel_allowance}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Living Allowance <span className="text-zinc-400 normal-case font-normal">/month</span></FieldLabel>
                                        <TextInput
                                            value={form.living_allowance}
                                            onChange={(v) => setField('living_allowance', v)}
                                            placeholder="e.g. 1200"
                                            prefix={sym}
                                            type="number"
                                            error={errors.living_allowance}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <FieldLabel>Duration</FieldLabel>
                                        <TextInput
                                            value={form.duration}
                                            onChange={(v) => setField('duration', v)}
                                            placeholder="e.g. 12-24 months"
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Total Recipients</FieldLabel>
                                        <TextInput
                                            value={form.recipients}
                                            onChange={(v) => setField('recipients', v)}
                                            placeholder="e.g. 150"
                                            type="number"
                                            error={errors.recipients}
                                        />
                                    </div>
                                </div>

                                {/* Live preview */}
                                <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3">Preview</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                            { label: 'Type',    val: form.coverage_type },
                                            { label: 'Tuition', val: form.tuition_coverage !== '' ? `${sym}${Number(form.tuition_coverage).toLocaleString()}` : null },
                                            { label: 'Travel',  val: form.travel_allowance ? `${sym}${Number(form.travel_allowance).toLocaleString()}` : null },
                                            { label: 'Living',  val: form.living_allowance ? `${sym}${Number(form.living_allowance).toLocaleString()}/mo` : null },
                                        ].map((item) => item.val && (
                                            <div key={item.label} className="bg-white dark:bg-zinc-800 rounded-lg p-3 border border-zinc-100 dark:border-zinc-700 text-center">
                                                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">{item.label}</p>
                                                <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-100">{item.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Subject Areas ── */}
                        {activeTab === 'subjects' && (
                            <div className="flex flex-col gap-5">
                                <div>
                                    <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400 mb-4">
                                        Select fields this scholarship covers and set available slots per field.
                                    </p>

                                    {/* Quick-select */}
                                    <FieldLabel>Common fields</FieldLabel>
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {COMMON_SUBJECTS.map((subj) => {
                                            const sel = selectedNames.includes(subj);
                                            return (
                                                <button
                                                    key={subj}
                                                    type="button"
                                                    onClick={() => toggleSubject(subj)}
                                                    className={`text-[12.5px] font-medium px-3 py-1.5 rounded-full border transition-all ${
                                                        sel
                                                            ? 'bg-[#1a6b8a] border-[#1a6b8a] text-white'
                                                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-[#1a6b8a]/40 hover:text-[#1a6b8a] dark:hover:text-[#3a9bbf]'
                                                    }`}
                                                >
                                                    {sel && <span className="mr-1">✓</span>}
                                                    {subj}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Custom field */}
                                    <FieldLabel>Add custom field</FieldLabel>
                                    <div className="flex gap-2 mb-5">
                                        <input
                                            type="text"
                                            value={customName}
                                            onChange={(e) => setCustomName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                                            placeholder="Field name"
                                            className="flex-1 px-4 py-2.5 text-[14px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#1a6b8a]/30 text-zinc-800 dark:text-zinc-100 placeholder-zinc-300 dark:placeholder-zinc-600"
                                        />
                                        <input
                                            type="number"
                                            value={customCount}
                                            onChange={(e) => setCustomCount(e.target.value)}
                                            placeholder="Slots"
                                            className="w-20 px-3 py-2.5 text-[14px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#1a6b8a]/30 text-zinc-800 dark:text-zinc-100 placeholder-zinc-300 dark:placeholder-zinc-600 text-center"
                                        />
                                        <button
                                            type="button"
                                            onClick={addCustom}
                                            className="px-4 py-2.5 bg-[#1a6b8a] hover:bg-[#155878] text-white text-[13px] font-semibold rounded-xl transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Selected list */}
                                    {form.subject_areas.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {form.subject_areas.map((sa, i) => {
                                                const colors = [
                                                    'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
                                                    'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
                                                    'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300',
                                                    'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
                                                    'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
                                                    'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300',
                                                ][i % 6];

                                                return (
                                                    <div key={sa.name} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colors}`}>
                                                        <span className="flex-1 text-[13.5px] font-semibold">{sa.name}</span>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className="text-[12px] opacity-70">Slots:</span>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                value={sa.count}
                                                                onChange={(e) => updateCount(sa.name, parseInt(e.target.value) || 0)}
                                                                className="w-16 px-2 py-1 text-[13px] font-bold text-center bg-white dark:bg-zinc-800 border border-current/20 rounded-lg outline-none"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSubject(sa.name)}
                                                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
                                                        >
                                                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                                                <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 text-center">
                                            <p className="text-[13px] text-zinc-400 dark:text-zinc-500">
                                                No subject areas added yet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Save button — always visible at bottom */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                            <Link
                                href="/contributor/scholarships"
                                className="text-[13px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors no-underline"
                            >
                                ← Back to list
                            </Link>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#1a6b8a] hover:bg-[#155878] text-white text-[13.5px] font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin">
                                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="56" strokeDashoffset="14" />
                                        </svg>
                                        Saving…
                                    </>
                                ) : (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && <Toast message={toast} onClose={() => setToast('')} />}
        </>
    );
}
