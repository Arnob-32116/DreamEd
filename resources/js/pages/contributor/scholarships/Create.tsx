import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SubjectArea {
    name: string;
    count: number;
}

interface FormData {
    // Step 1 — Basic Info
    name: string;
    institution: string;
    website: string;
    country: string;
    country_code: string;
    type: string;
    description: string;
    logo_file: File | null;
    cover_image_file: File | null;
    logo_preview: string;
    cover_preview: string;

    // Step 2 — Financial
    coverage_type: string;
    currency: string;
    monthly_amount: string;
    tuition_coverage: string;
    travel_allowance: string;
    living_allowance: string;
    duration: string;
    recipients: string;

    // Step 3 — Subject Areas
    subject_areas: SubjectArea[];
}

type Errors = Partial<Record<string, string>>;

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

const STEPS = [
    { number: 1, label: 'Basic Info',    icon: '📋' },
    { number: 2, label: 'Financial',     icon: '💰' },
    { number: 3, label: 'Subject Areas', icon: '📚' },
];

const EMPTY: FormData = {
    name: '', institution: '', website: '', country: '', country_code: '',
    type: 'Merit-Based', description: '',
    logo_file: null, cover_image_file: null, logo_preview: '', cover_preview: '',
    coverage_type: 'Partial', currency: 'USD',
    monthly_amount: '', tuition_coverage: '', travel_allowance: '',
    living_allowance: '', duration: '', recipients: '',
    subject_areas: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI primitives
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
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    rows?: number;
    error?: string;
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
    value, onChange, options, error,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    error?: string;
}) {
    return (
        <div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-4 py-3 text-[14px] text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 border rounded-xl outline-none appearance-none cursor-pointer transition-all ${
                    error
                        ? 'border-red-300 dark:border-red-700'
                        : 'border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-[#1a6b8a]/30 focus:border-[#1a6b8a]/60'
                }`}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}
        </div>
    );
}

// Image upload box
function ImageUpload({
    label, preview, onChange, hint,
}: {
    label: string;
    preview: string;
    onChange: (file: File, preview: string) => void;
    hint?: string;
}) {
    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange(file, ev.target?.result as string);
        reader.readAsDataURL(file);
    }

    return (
        <label className="block cursor-pointer">
            <div className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all hover:border-[#1a6b8a]/60 ${
                preview ? 'border-[#1a6b8a]/40' : 'border-zinc-300 dark:border-zinc-700'
            }`}>
                {preview ? (
                    <div className="relative h-32 group">
                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[12px] font-semibold">Click to change</span>
                        </div>
                    </div>
                ) : (
                    <div className="h-32 flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[12.5px] font-medium">{label}</span>
                        {hint && <span className="text-[11px] opacity-70">{hint}</span>}
                    </div>
                )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step progress bar
// ─────────────────────────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-0 mb-8">
            {STEPS.map((step, idx) => {
                const done    = current > step.number;
                const active  = current === step.number;
                const isLast  = idx === STEPS.length - 1;

                return (
                    <div key={step.number} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold border-2 transition-all ${
                                done   ? 'bg-[#1a6b8a] border-[#1a6b8a] text-white' :
                                active ? 'bg-white dark:bg-zinc-900 border-[#1a6b8a] text-[#1a6b8a]' :
                                         'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                            }`}>
                                {done ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : step.number}
                            </div>
                            <span className={`text-[11px] font-semibold whitespace-nowrap ${
                                active ? 'text-[#1a6b8a] dark:text-[#3a9bbf]' : 'text-zinc-400 dark:text-zinc-500'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                        {!isLast && (
                            <div className={`flex-1 h-0.5 mx-3 mb-5 transition-all ${
                                done ? 'bg-[#1a6b8a]' : 'bg-zinc-200 dark:bg-zinc-700'
                            }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Basic Info
// ─────────────────────────────────────────────────────────────────────────────

function Step1({
    form, setField, errors,
}: {
    form: FormData;
    setField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
    errors: Errors;
}) {
    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-[20px] font-bold text-zinc-800 dark:text-zinc-100 mb-1">Basic Information</h2>
                <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400">Tell us about the scholarship and the organisation offering it.</p>
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <FieldLabel>Logo / Badge Image</FieldLabel>
                    <ImageUpload
                        label="Upload Logo"
                        preview={form.logo_preview}
                        hint="PNG, JPG up to 2MB"
                        onChange={(f, p) => { setField('logo_file', f); setField('logo_preview', p); }}
                    />
                </div>
                <div>
                    <FieldLabel>Cover Image</FieldLabel>
                    <ImageUpload
                        label="Upload Cover"
                        preview={form.cover_preview}
                        hint="PNG, JPG up to 5MB"
                        onChange={(f, p) => { setField('cover_image_file', f); setField('cover_preview', p); }}
                    />
                </div>
            </div>

            {/* Name */}
            <div>
                <FieldLabel required>Scholarship Name</FieldLabel>
                <TextInput
                    value={form.name}
                    onChange={(v) => setField('name', v)}
                    placeholder="e.g. DAAD Research Grants"
                    error={errors.name}
                />
            </div>

            {/* Institution */}
            <div>
                <FieldLabel required>Offering Institution / Organisation</FieldLabel>
                <TextInput
                    value={form.institution}
                    onChange={(v) => setField('institution', v)}
                    placeholder="e.g. DAAD Institution, Fulbright, Gates Foundation"
                    error={errors.institution}
                />
            </div>

            {/* Website */}
            <div>
                <FieldLabel>Official Website</FieldLabel>
                <TextInput
                    value={form.website}
                    onChange={(v) => setField('website', v)}
                    placeholder="https://www.daad.de/en/"
                    error={errors.website}
                />
            </div>

            {/* Country + Country Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <FieldLabel>Country</FieldLabel>
                    <TextInput
                        value={form.country}
                        onChange={(v) => setField('country', v)}
                        placeholder="e.g. Germany"
                        error={errors.country}
                    />
                </div>
                <div>
                    <FieldLabel>Country Code</FieldLabel>
                    <TextInput
                        value={form.country_code}
                        onChange={(v) => setField('country_code', v.toUpperCase().slice(0, 5))}
                        placeholder="e.g. DE"
                        error={errors.country_code}
                    />
                </div>
            </div>

            {/* Type */}
            <div>
                <FieldLabel required>Scholarship Type</FieldLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SCHOLARSHIP_TYPES.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setField('type', t)}
                            className={`py-2.5 px-3 rounded-xl text-[13px] font-semibold border-2 transition-all text-left ${
                                form.type === t
                                    ? 'bg-[#1a6b8a]/10 dark:bg-[#1a6b8a]/20 border-[#1a6b8a] text-[#1a6b8a] dark:text-[#3a9bbf]'
                                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div>
                <FieldLabel>Description</FieldLabel>
                <TextArea
                    value={form.description}
                    onChange={(v) => setField('description', v)}
                    placeholder="Describe the scholarship, its purpose, and who it is for..."
                    error={errors.description}
                />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Financial Details
// ─────────────────────────────────────────────────────────────────────────────

function Step2({
    form, setField, errors,
}: {
    form: FormData;
    setField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
    errors: Errors;
}) {
    const sym = CURRENCIES.find((c) => c.code === form.currency)?.symbol ?? '$';

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-[20px] font-bold text-zinc-800 dark:text-zinc-100 mb-1">Financial Details</h2>
                <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400">Enter the financial breakdown of what the scholarship covers.</p>
            </div>

            {/* Coverage type */}
            <div>
                <FieldLabel required>Coverage Type</FieldLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COVERAGE_TYPES.map((ct) => (
                        <button
                            key={ct}
                            type="button"
                            onClick={() => setField('coverage_type', ct)}
                            className={`py-2.5 px-3 rounded-xl text-[13px] font-semibold border-2 transition-all ${
                                form.coverage_type === ct
                                    ? 'bg-[#1a6b8a]/10 dark:bg-[#1a6b8a]/20 border-[#1a6b8a] text-[#1a6b8a] dark:text-[#3a9bbf]'
                                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                            }`}
                        >
                            {ct}
                        </button>
                    ))}
                </div>
            </div>

            {/* Currency */}
            <div>
                <FieldLabel>Currency</FieldLabel>
                <SelectInput
                    value={form.currency}
                    onChange={(v) => setField('currency', v)}
                    options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.symbol} ${c.label}` }))}
                />
            </div>

            {/* Financial amounts grid */}
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
                    <p className="text-[11px] text-zinc-400 mt-1">Amount given per month to the recipient</p>
                </div>
                <div>
                    <FieldLabel>Tuition Coverage</FieldLabel>
                    <TextInput
                        value={form.tuition_coverage}
                        onChange={(v) => setField('tuition_coverage', v)}
                        placeholder="e.g. 0 (fully covered)"
                        prefix={sym}
                        type="number"
                        error={errors.tuition_coverage}
                    />
                    <p className="text-[11px] text-zinc-400 mt-1">Enter 0 if tuition is fully covered</p>
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
                    <FieldLabel>Living Allowance <span className="text-zinc-400 normal-case font-normal">(per month)</span></FieldLabel>
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

            {/* Duration + Recipients */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <FieldLabel>Duration</FieldLabel>
                    <TextInput
                        value={form.duration}
                        onChange={(v) => setField('duration', v)}
                        placeholder="e.g. 12-24 months, 4 years"
                        error={errors.duration}
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

            {/* Live preview card */}
            {(form.monthly_amount || form.tuition_coverage !== '' || form.travel_allowance || form.living_allowance) && (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3">Preview</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                            { label: 'Type',    val: form.coverage_type, colored: true },
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
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Subject Areas
// ─────────────────────────────────────────────────────────────────────────────

function Step3({
    form, setField,
}: {
    form: FormData;
    setField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
    const [customName, setCustomName]   = useState('');
    const [customCount, setCustomCount] = useState('');

    function toggleSubject(name: string) {
        const exists = form.subject_areas.find((s) => s.name === name);
        if (exists) {
            setField('subject_areas', form.subject_areas.filter((s) => s.name !== name));
        } else {
            setField('subject_areas', [...form.subject_areas, { name, count: 0 }]);
        }
    }

    function updateCount(name: string, count: number) {
        setField(
            'subject_areas',
            form.subject_areas.map((s) => s.name === name ? { ...s, count } : s),
        );
    }

    function removeSubject(name: string) {
        setField('subject_areas', form.subject_areas.filter((s) => s.name !== name));
    }

    function addCustom() {
        const name  = customName.trim();
        const count = parseInt(customCount) || 0;
        if (!name) return;
        if (form.subject_areas.find((s) => s.name.toLowerCase() === name.toLowerCase())) return;
        setField('subject_areas', [...form.subject_areas, { name, count }]);
        setCustomName('');
        setCustomCount('');
    }

    const selectedNames = form.subject_areas.map((s) => s.name);

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-[20px] font-bold text-zinc-800 dark:text-zinc-100 mb-1">Subject Areas</h2>
                <p className="text-[13.5px] text-zinc-500 dark:text-zinc-400">
                    Select the fields this scholarship covers and enter how many opportunities are available in each.
                    This step is optional.
                </p>
            </div>

            {/* Quick-select common subjects */}
            <div>
                <FieldLabel>Select from common fields</FieldLabel>
                <div className="flex flex-wrap gap-2">
                    {COMMON_SUBJECTS.map((s) => {
                        const selected = selectedNames.includes(s);
                        return (
                            <button
                                key={s}
                                type="button"
                                onClick={() => toggleSubject(s)}
                                className={`text-[12.5px] font-medium px-3 py-1.5 rounded-full border transition-all ${
                                    selected
                                        ? 'bg-[#1a6b8a] border-[#1a6b8a] text-white'
                                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-[#1a6b8a]/40 hover:text-[#1a6b8a] dark:hover:text-[#3a9bbf]'
                                }`}
                            >
                                {selected && (
                                    <span className="mr-1">✓</span>
                                )}
                                {s}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Add custom subject */}
            <div>
                <FieldLabel>Add a custom field</FieldLabel>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                        placeholder="Field name e.g. Marine Biology"
                        className="flex-1 px-4 py-2.5 text-[14px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#1a6b8a]/30 focus:border-[#1a6b8a]/60 text-zinc-800 dark:text-zinc-100 placeholder-zinc-300 dark:placeholder-zinc-600"
                    />
                    <button
                        type="button"
                        onClick={addCustom}
                        className="px-4 py-2.5 bg-[#1a6b8a] hover:bg-[#155878] text-white text-[13px] font-semibold rounded-xl transition-all"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Selected subjects with count input */}
            {form.subject_areas.length > 0 && (
                <div>
                    <FieldLabel>Set available slots per field</FieldLabel>
                    <div className="flex flex-col gap-2">
                        {form.subject_areas.map((s, i) => {
                            const colors = [
                                'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
                                'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
                                'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300',
                                'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
                                'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
                                'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300',
                            ][i % 6];

                            return (
                                <div
                                    key={s.name}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colors}`}
                                >
                                    <span className="flex-1 text-[13.5px] font-semibold">{s.name}</span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[12px] opacity-70">Slots:</span>
                                        <input
                                            type="number"
                                            min={0}
                                            value={s.count === 0 && !s.name ? '' : s.count}
                                            onChange={(e) => updateCount(s.name, parseInt(e.target.value) || 0)}
                                            className="w-16 px-2 py-1 text-[13px] font-bold text-center bg-white dark:bg-zinc-800 border border-current/20 rounded-lg outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeSubject(s.name)}
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
                </div>
            )}

            {form.subject_areas.length === 0 && (
                <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 text-center">
                    <p className="text-[13px] text-zinc-400 dark:text-zinc-500">
                        No subject areas selected yet. You can skip this step.
                    </p>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main wizard
// ─────────────────────────────────────────────────────────────────────────────

export default function CreateScholarship() {
    const [step, setStep]     = useState(1);
    const [form, setForm]     = useState<FormData>(EMPTY);
    const [errors, setErrors] = useState<Errors>({});
    const [saving, setSaving] = useState(false);

    function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    // ── Validation per step ──────────────────────────────────────────────────
    function validateStep(s: number): boolean {
        const errs: Errors = {};

        if (s === 1) {
            if (!form.name.trim())        errs.name        = 'Scholarship name is required.';
            if (!form.institution.trim()) errs.institution  = 'Institution name is required.';
            if (form.website && !/^https?:\/\/.+/.test(form.website))
                errs.website = 'Enter a valid URL starting with https://';
        }

        if (s === 2) {
            if (form.monthly_amount   && isNaN(Number(form.monthly_amount)))   errs.monthly_amount   = 'Must be a number.';
            if (form.tuition_coverage && isNaN(Number(form.tuition_coverage))) errs.tuition_coverage = 'Must be a number.';
            if (form.travel_allowance && isNaN(Number(form.travel_allowance))) errs.travel_allowance = 'Must be a number.';
            if (form.living_allowance && isNaN(Number(form.living_allowance))) errs.living_allowance = 'Must be a number.';
            if (form.recipients       && isNaN(Number(form.recipients)))       errs.recipients       = 'Must be a whole number.';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function handleNext() {
        if (validateStep(step)) setStep((s) => Math.min(s + 1, 3));
    }

    function handleBack() {
        setStep((s) => Math.max(s - 1, 1));
    }

    // ── Submit ───────────────────────────────────────────────────────────────
    function handleSubmit() {
        if (!validateStep(3) || saving) return;
        setSaving(true);

        const fd = new FormData();
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
        if (form.tuition_coverage) fd.append('tuition_coverage', form.tuition_coverage);
        if (form.travel_allowance) fd.append('travel_allowance', form.travel_allowance);
        if (form.living_allowance) fd.append('living_allowance', form.living_allowance);
        if (form.duration)         fd.append('duration',         form.duration.trim());
        if (form.recipients)       fd.append('recipients',       form.recipients);
        if (form.logo_file)        fd.append('logo_file',        form.logo_file);
        if (form.cover_image_file) fd.append('cover_image_file', form.cover_image_file);

        // Subject areas as JSON
        fd.append('subject_areas', JSON.stringify(form.subject_areas));

        router.post('/contributor/scholarships', fd, {
            forceFormData: true,
            onSuccess: () => setSaving(false),
            onError:   (e) => { setSaving(false); setErrors(e); setStep(1); },
            onFinish:  () => setSaving(false),
        });
    }

    return (
        <>
            <Head title="Add Scholarship" />

            <div className="flex-1 min-h-screen bg-[#f3f4f6] dark:bg-zinc-950 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-5 sm:px-6 py-10">

                    {/* Top nav */}
                    <div className="flex items-center gap-3 mb-8">
                        <Link
                            href="/contributor/scholarships"
                            className="flex items-center gap-2 text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors no-underline group"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                className="transition-transform group-hover:-translate-x-0.5">
                                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            My Scholarships
                        </Link>
                        <span className="text-zinc-300 dark:text-zinc-600">/</span>
                        <span className="text-[13px] text-zinc-800 dark:text-zinc-200 font-medium">Add Scholarship</span>
                    </div>

                    {/* Step progress */}
                    <StepBar current={step} />

                    {/* Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">

                        {step === 1 && <Step1 form={form} setField={setField} errors={errors} />}
                        {step === 2 && <Step2 form={form} setField={setField} errors={errors} />}
                        {step === 3 && <Step3 form={form} setField={setField} />}

                        {/* Navigation buttons */}
                        <div className={`flex items-center mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[13.5px] font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Back
                                </button>
                            )}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1a6b8a] hover:bg-[#155878] text-white text-[13.5px] font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0"
                                >
                                    Continue
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#1a6b8a] hover:bg-[#155878] text-white text-[13.5px] font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-spin">
                                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="56" strokeDashoffset="14" />
                                            </svg>
                                            Publishing…
                                        </>
                                    ) : (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Publish Scholarship
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Step hint */}
                    <p className="text-center text-[12px] text-zinc-400 dark:text-zinc-600 mt-4">
                        Step {step} of {STEPS.length} — {STEPS[step - 1].label}
                    </p>
                </div>
            </div>
        </>
    );
}
