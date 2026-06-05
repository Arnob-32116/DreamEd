import { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 'basic' | 'details' | 'expenses';

const STEPS: { key: Step; label: string; icon: string }[] = [
    { key: 'basic',    label: 'Basic Info',   icon: '🏛️' },
    { key: 'details',  label: 'Details',      icon: '📋' },
    { key: 'expenses', label: 'Costs',        icon: '💰' },
];

const CATEGORIES = [
    'Public Research', 'Private Research',
    'Liberal Arts', 'Technical',
    'Community College', 'Other',
];

const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'JP', name: 'Japan' },
    { code: 'SG', name: 'Singapore' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'IN', name: 'India' },
    { code: 'CN', name: 'China' },
    { code: 'OTHER', name: 'Other' },
];

// ── Input component ───────────────────────────────────────────────────────────
function Field({ label, required, error, children }: {
    label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 placeholder-slate-400 dark:placeholder-slate-500 transition-all ${className}`}
        />
    );
}

function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className={`w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 placeholder-slate-400 dark:placeholder-slate-500 resize-none transition-all ${className}`}
        />
    );
}

function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            {...props}
            className={`w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all ${className}`}
        >
            {children}
        </select>
    );
}

// ── Image upload box ──────────────────────────────────────────────────────────
function ImageUpload({ label, preview, onFile, hint }: {
    label: string;
    preview: string | null;
    onFile: (f: File) => void;
    hint?: string;
}) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
            <div
                onClick={() => ref.current?.click()}
                className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all
                    ${preview ? 'border-blue-300 dark:border-blue-700' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'}
                    bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-blue-900/10`}
                style={{ minHeight: 120 }}
            >
                {preview ? (
                    <img src={preview} alt="preview" className="w-full h-32 object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400 dark:text-slate-500">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium">Click to upload</span>
                        {hint && <span className="text-[11px]">{hint}</span>}
                    </div>
                )}
            </div>
            <input ref={ref} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CreateUniversity() {
    const [step, setStep] = useState<Step>('basic');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Image state
    const [logoFile, setLogoFile]           = useState<File | null>(null);
    const [logoPreview, setLogoPreview]     = useState<string | null>(null);
    const [coverFile, setCoverFile]         = useState<File | null>(null);
    const [coverPreview, setCoverPreview]   = useState<string | null>(null);

    // Form state
    const [form, setForm] = useState({
        // Basic
        name: '', abbreviation: '', website: '',
        city: '', state: '', country: '', country_code: '',
        category: '',
        // Details
        qs_ranking: '', acceptance_rate: '', student_count: '',
        faculty_count: '', founded_year: '', president: '',
        motto: '', about: '', life_in_city: '',
        // Expenses
        annual_tuition: '', room_and_board: '', application_fee: '',
        books_supplies: '', transportation: '', personal_expenses: '',
        health_insurance: '', financial_aid_note: '', financial_aid_url: '',
    });

    function set(key: string, value: string) {
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
    }

    function handleLogo(file: File) {
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    }

    function handleCover(file: File) {
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    }

    function handleCountryChange(code: string) {
        const country = COUNTRIES.find(c => c.code === code);
        set('country_code', code);
        set('country', country?.name ?? '');
    }

    function validateBasic(): boolean {
        const e: Record<string, string> = {};
        if (!form.name.trim())     e.name     = 'University name is required';
        if (!form.country.trim())  e.country  = 'Country is required';
        if (!form.category)        e.category = 'Category is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleNext() {
        if (step === 'basic' && !validateBasic()) return;
        if (step === 'basic')    setStep('details');
        if (step === 'details')  setStep('expenses');
    }

    function handleBack() {
        if (step === 'details')  setStep('basic');
        if (step === 'expenses') setStep('details');
    }

    function handleSubmit() {
        setSubmitting(true);
        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            if (value !== '') formData.append(key, value);
        });

        if (logoFile)  formData.append('logo_file', logoFile);
        if (coverFile) formData.append('cover_image_file', coverFile);

        router.post('/contributor/universities', formData, {
            forceFormData: true,
            onError: (errs) => { setErrors(errs); setSubmitting(false); setStep('basic'); },
            onFinish: () => setSubmitting(false),
        });
    }

    const stepIndex = STEPS.findIndex(s => s.key === step);

    return (
        <>
            <Head title="Add University" />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

                {/* Top bar */}
                <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
                        <Link href="/contributor/universities" className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            My Universities
                        </Link>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Add New University</span>
                        <div className="w-24" />
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-5 py-8">

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        {STEPS.map((s, i) => (
                            <div key={s.key} className="flex items-center gap-2 flex-1">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                    s.key === step
                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/40'
                                        : i < stepIndex
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                }`}>
                                    <span>{s.icon}</span>
                                    <span className="hidden sm:inline">{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 rounded ${i < stepIndex ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ── Step 1: Basic Info ── */}
                    {step === 'basic' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Basic Information</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <Field label="University Name" required error={errors.name}>
                                        <Input placeholder="e.g. Massachusetts Institute of Technology" value={form.name} onChange={e => set('name', e.target.value)} />
                                    </Field>
                                </div>

                                <Field label="Abbreviation">
                                    <Input placeholder="e.g. MIT" value={form.abbreviation} onChange={e => set('abbreviation', e.target.value)} />
                                </Field>

                                <Field label="Website">
                                    <Input type="url" placeholder="https://mit.edu" value={form.website} onChange={e => set('website', e.target.value)} />
                                </Field>

                                <Field label="Country" required error={errors.country}>
                                    <Select value={form.country_code} onChange={e => handleCountryChange(e.target.value)}>
                                        <option value="">Select country...</option>
                                        {COUNTRIES.map(c => (
                                            <option key={c.code} value={c.code}>{c.name}</option>
                                        ))}
                                    </Select>
                                </Field>

                                <Field label="Category" required error={errors.category}>
                                    <Select value={form.category} onChange={e => set('category', e.target.value)}>
                                        <option value="">Select category...</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </Select>
                                </Field>

                                <Field label="City">
                                    <Input placeholder="e.g. Cambridge" value={form.city} onChange={e => set('city', e.target.value)} />
                                </Field>

                                <Field label="State / Province">
                                    <Input placeholder="e.g. Massachusetts" value={form.state} onChange={e => set('state', e.target.value)} />
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                                <ImageUpload
                                    label="University Logo"
                                    preview={logoPreview}
                                    onFile={handleLogo}
                                    hint="PNG or JPG, max 2MB"
                                />
                                <ImageUpload
                                    label="Cover Image"
                                    preview={coverPreview}
                                    onFile={handleCover}
                                    hint="JPG or PNG, max 5MB"
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Details ── */}
                    {step === 'details' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">University Details</h2>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <Field label="QS Ranking">
                                    <Input type="number" min={1} placeholder="e.g. 1" value={form.qs_ranking} onChange={e => set('qs_ranking', e.target.value)} />
                                </Field>
                                <Field label="Acceptance Rate %">
                                    <Input type="number" min={0} max={100} step={0.01} placeholder="e.g. 7" value={form.acceptance_rate} onChange={e => set('acceptance_rate', e.target.value)} />
                                </Field>
                                <Field label="Founded Year">
                                    <Input type="number" placeholder="e.g. 1861" value={form.founded_year} onChange={e => set('founded_year', e.target.value)} />
                                </Field>
                                <Field label="Total Students">
                                    <Input type="number" placeholder="e.g. 11934" value={form.student_count} onChange={e => set('student_count', e.target.value)} />
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Field label="Faculty Count">
                                    <Input type="number" placeholder="e.g. 1074" value={form.faculty_count} onChange={e => set('faculty_count', e.target.value)} />
                                </Field>
                                <Field label="President / Chancellor">
                                    <Input placeholder="e.g. Sally Kornbluth" value={form.president} onChange={e => set('president', e.target.value)} />
                                </Field>
                                <Field label="Motto">
                                    <Input placeholder="e.g. Mens et Manus" value={form.motto} onChange={e => set('motto', e.target.value)} />
                                </Field>
                            </div>

                            <Field label="About the University">
                                <Textarea rows={4} placeholder="Write a description of the university..." value={form.about} onChange={e => set('about', e.target.value)} />
                            </Field>

                            <Field label="Life in the City">
                                <Textarea rows={3} placeholder="Describe what it's like to live and study in this city..." value={form.life_in_city} onChange={e => set('life_in_city', e.target.value)} />
                            </Field>
                        </div>
                    )}

                    {/* ── Step 3: Expenses ── */}
                    {step === 'expenses' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Annual Costs & Expenses</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All amounts in USD per academic year. Leave blank if unknown.</p>
                            </div>

                            {/* Main costs */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Field label="Annual Tuition ($)">
                                    <Input type="number" min={0} placeholder="e.g. 53450" value={form.annual_tuition} onChange={e => set('annual_tuition', e.target.value)} />
                                </Field>
                                <Field label="Room & Board ($)">
                                    <Input type="number" min={0} placeholder="e.g. 17800" value={form.room_and_board} onChange={e => set('room_and_board', e.target.value)} />
                                </Field>
                                <Field label="Application Fee ($)">
                                    <Input type="number" min={0} placeholder="e.g. 75" value={form.application_fee} onChange={e => set('application_fee', e.target.value)} />
                                </Field>
                            </div>

                            {/* Additional costs */}
                            <div>
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Additional Estimated Expenses</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <Field label="Books & Supplies ($)">
                                        <Input type="number" min={0} placeholder="e.g. 1200" value={form.books_supplies} onChange={e => set('books_supplies', e.target.value)} />
                                    </Field>
                                    <Field label="Transportation ($)">
                                        <Input type="number" min={0} placeholder="e.g. 1500" value={form.transportation} onChange={e => set('transportation', e.target.value)} />
                                    </Field>
                                    <Field label="Personal Expenses ($)">
                                        <Input type="number" min={0} placeholder="e.g. 2000" value={form.personal_expenses} onChange={e => set('personal_expenses', e.target.value)} />
                                    </Field>
                                    <Field label="Health Insurance ($)">
                                        <Input type="number" min={0} placeholder="e.g. 3300" value={form.health_insurance} onChange={e => set('health_insurance', e.target.value)} />
                                    </Field>
                                </div>
                            </div>

                            {/* Financial aid */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Financial Aid (optional)</p>
                                <Field label="Financial Aid Note">
                                    <Textarea rows={2} placeholder="e.g. MIT is committed to making education accessible..." value={form.financial_aid_note} onChange={e => set('financial_aid_note', e.target.value)} />
                                </Field>
                                <Field label="Financial Aid URL">
                                    <Input type="url" placeholder="https://..." value={form.financial_aid_url} onChange={e => set('financial_aid_url', e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between mt-6">
                        {step !== 'basic' ? (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                        ) : <div />}

                        {step !== 'expenses' ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Create University
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-4">
                        You can add programs and scholarships after creating the university.
                    </p>
                </div>
            </div>
        </>
    );
}
