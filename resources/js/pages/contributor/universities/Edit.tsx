import { useState, useRef } from 'react';
import { Head, router, Link } from '@inertiajs/react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Qualifications {
    min_degree:  string;
    sat_act:     string;
    language:    string;
    min_cgpa:    string;
}

interface Program {
    id?:                     number;
    name:                    string;
    school:                  string;
    degree_type:             string;
    duration:                string;
    tuition_fee:             string;
    application_deadline:    string;
    program_url:             string;
    required_qualifications: Qualifications;
    subjects:                string[];
}

interface Scholarship {
    id?:                number;
    name:               string;
    type:               string;
    coverage:           string;
    is_independent:     boolean;
    description:        string;
    total_amount:       string;
    recipients:         string;
    eligible_countries: string;
    programs_covered:   string;
    scholarship_url:    string;
}

interface Expense {
    annual_tuition:     string;
    room_and_board:     string;
    application_fee:    string;
    books_supplies:     string;
    transportation:     string;
    personal_expenses:  string;
    health_insurance:   string;
    financial_aid_note: string;
    financial_aid_url:  string;
}

interface University {
    id:               number;
    name:             string;
    abbreviation:     string;
    slug:             string;
    logo:             string | null;
    cover_image:      string | null;
    website:          string;
    city:             string;
    state:            string;
    country:          string;
    country_code:     string;
    category:         string;
    qs_ranking:       number | null;
    acceptance_rate:  number | null;
    student_count:    number | null;
    faculty_count:    number | null;
    founded_year:     number | null;
    president:        string;
    motto:            string;
    about:            string;
    life_in_city:     string;
    programs:         Program[];
    scholarships:     Scholarship[];
    expenses:         Expense | null;
}

interface Props { university: University; }

const CATEGORIES     = ['Public Research','Private Research','Liberal Arts','Technical','Community College','Other'];
const DEGREE_TYPES   = ["Bachelor's","Master's","PhD","Diploma","Certificate"];
const SCHOL_TYPES    = ['Merit-Based','Need-Based','Athletic','Research','Government','Other'];
const COVERAGE_TYPES = ['Full Tuition','Partial','Living Expenses','Full Ride'];
const SUBJECTS_LIST  = ['Computer Science','Engineering','Business Administration','Medicine','Law','Psychology','Economics','Physics','Mathematics','Chemistry','Biology','Architecture','Arts','Education','Nursing'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {label}{required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <span className="text-lg">{icon}</span>
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

const inputCls    = "w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 placeholder-slate-400 dark:placeholder-slate-600 transition-all";
const textareaCls = inputCls + " resize-none leading-relaxed";

const emptyQuals = (): Qualifications => ({ min_degree: '', sat_act: '', language: '', min_cgpa: '' });

// ── Main ──────────────────────────────────────────────────────────────────────
export default function EditUniversity({ university }: Props) {
    const [activeTab, setActiveTab] = useState<'info'|'programs'|'scholarships'>('info');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess]       = useState('');

    // ── Basic info form ───────────────────────────────────────────────────────
    const [form, setForm] = useState({
        name:              university.name             ?? '',
        abbreviation:      university.abbreviation     ?? '',
        website:           university.website          ?? '',
        category:          university.category         ?? '',
        city:              university.city             ?? '',
        state:             university.state            ?? '',
        country:           university.country          ?? '',
        country_code:      university.country_code     ?? '',
        qs_ranking:        university.qs_ranking?.toString()      ?? '',
        acceptance_rate:   university.acceptance_rate?.toString() ?? '',
        student_count:     university.student_count?.toString()   ?? '',
        faculty_count:     university.faculty_count?.toString()   ?? '',
        founded_year:      university.founded_year?.toString()    ?? '',
        president:         university.president        ?? '',
        motto:             university.motto            ?? '',
        about:             university.about            ?? '',
        life_in_city:      university.life_in_city     ?? '',
        annual_tuition:    university.expenses?.annual_tuition    ?? '',
        room_and_board:    university.expenses?.room_and_board    ?? '',
        application_fee:   university.expenses?.application_fee   ?? '',
        books_supplies:    university.expenses?.books_supplies    ?? '',
        transportation:    university.expenses?.transportation    ?? '',
        personal_expenses: university.expenses?.personal_expenses ?? '',
        health_insurance:  university.expenses?.health_insurance  ?? '',
        financial_aid_note:university.expenses?.financial_aid_note ?? '',
        financial_aid_url: university.expenses?.financial_aid_url  ?? '',
    });

    function setF(key: string, value: string) { setForm(prev => ({ ...prev, [key]: value })); }

    // ── Images ────────────────────────────────────────────────────────────────
    const logoRef  = useRef<HTMLInputElement>(null);
    const coverRef = useRef<HTMLInputElement>(null);
    const [logoFile,     setLogoFile]     = useState<File|null>(null);
    const [coverFile,    setCoverFile]    = useState<File|null>(null);
    const [logoPreview,  setLogoPreview]  = useState<string|null>(university.logo);
    const [coverPreview, setCoverPreview] = useState<string|null>(university.cover_image);

    function handleImageChange(file: File, type: 'logo'|'cover') {
        const reader = new FileReader();
        reader.onload = e => {
            const r = e.target?.result as string;
            if (type === 'logo')  { setLogoFile(file);  setLogoPreview(r); }
            else                  { setCoverFile(file); setCoverPreview(r); }
        };
        reader.readAsDataURL(file);
    }

    function handleUpdateInfo() {
        setSubmitting(true);
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, String(v)); });
        if (logoFile)  fd.append('logo_file', logoFile);
        if (coverFile) fd.append('cover_image_file', coverFile);
        fd.append('_method', 'PUT');
        router.post(`/contributor/universities/${university.slug}`, fd, {
            forceFormData: true,
            onSuccess: () => { setSuccess('University updated!'); setTimeout(() => setSuccess(''), 3000); },
            onFinish: () => setSubmitting(false),
        });
    }

    // ── Programs ──────────────────────────────────────────────────────────────
    const emptyProgram = (): Program => ({
        name: '', school: '', degree_type: "Bachelor's", duration: '',
        tuition_fee: '', application_deadline: '', program_url: '',
        required_qualifications: emptyQuals(), subjects: [],
    });

    const normaliseProgram = (p: Program): Program => ({
        ...p,
        tuition_fee: p.tuition_fee?.toString() ?? '',
        subjects: Array.isArray(p.subjects) ? p.subjects : [],
        required_qualifications: p.required_qualifications
            ? { min_degree: p.required_qualifications.min_degree ?? '',
                sat_act:    p.required_qualifications.sat_act    ?? '',
                language:   p.required_qualifications.language   ?? '',
                min_cgpa:   p.required_qualifications.min_cgpa   ?? '' }
            : emptyQuals(),
    });

    const [programs,        setPrograms]        = useState<Program[]>(university.programs.map(normaliseProgram));
    const [newProgram,      setNewProgram]       = useState<Program>(emptyProgram());
    const [showProgramForm, setShowProgramForm]  = useState(false);
    const [editingProgram,  setEditingProgram]   = useState<Program|null>(null);

    function handleAddProgram() {
        router.post(`/contributor/universities/${university.slug}/programs`, {
            ...newProgram,
            required_qualifications: newProgram.required_qualifications,
        }, { onSuccess: () => { setNewProgram(emptyProgram()); setShowProgramForm(false); } });
    }

    function handleUpdateProgram(p: Program) {
        router.put(`/contributor/universities/${university.slug}/programs/${p.id}`, {
            ...p,
            required_qualifications: p.required_qualifications,
        }, { onSuccess: () => setEditingProgram(null) });
    }

    function handleDeleteProgram(id: number) {
        router.delete(`/contributor/universities/${university.slug}/programs/${id}`);
    }

    // ── Scholarships ──────────────────────────────────────────────────────────
    const emptyScholarship = (): Scholarship => ({
        name: '', type: 'Merit-Based', coverage: 'Partial', is_independent: false,
        description: '', total_amount: '', recipients: '', eligible_countries: '',
        programs_covered: '', scholarship_url: '',
    });

    const [scholarships,        setScholarships]        = useState<Scholarship[]>(
        university.scholarships.map(s => ({
            ...s,
            total_amount:       s.total_amount?.toString()       ?? '',
            recipients:         s.recipients?.toString()         ?? '',
            eligible_countries: s.eligible_countries?.toString() ?? '',
        }))
    );
    const [newScholarship,      setNewScholarship]       = useState<Scholarship>(emptyScholarship());
    const [showScholarshipForm, setShowScholarshipForm]  = useState(false);
    const [editingScholarship,  setEditingScholarship]   = useState<Scholarship|null>(null);

    function handleAddScholarship() {
        router.post(`/contributor/universities/${university.slug}/scholarships`, newScholarship, {
            onSuccess: () => { setNewScholarship(emptyScholarship()); setShowScholarshipForm(false); },
        });
    }
    function handleUpdateScholarship(s: Scholarship) {
        router.put(`/contributor/universities/${university.slug}/scholarships/${s.id}`, s, {
            onSuccess: () => setEditingScholarship(null),
        });
    }
    function handleDeleteScholarship(id: number) {
        router.delete(`/contributor/universities/${university.slug}/scholarships/${id}`);
    }

    const totalCost = ['annual_tuition','room_and_board','application_fee','books_supplies','transportation','personal_expenses','health_insurance']
        .reduce((s, k) => s + (parseFloat(form[k as keyof typeof form] || '0') || 0), 0);

    return (
        <>
            <Head title={`Edit — ${university.name}`} />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

                {/* Top bar */}
                <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
                    <Link href="/contributor/universities" className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                        </svg>
                        My Universities
                    </Link>
                    <div className="flex items-center gap-3">
                        {university.logo && <img src={university.logo} className="w-7 h-7 rounded-lg object-cover" alt="logo"/>}
                        <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-xs">{university.name}</h1>
                    </div>
                    <Link href={`/universities/${university.slug}`} target="_blank"
                        className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        View Page
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                    </Link>
                </div>

                {/* Tab bar */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6">
                    <div className="flex gap-1 max-w-4xl mx-auto">
                        {([
                            { key: 'info',         label: 'University Info',               icon: '🏛️' },
                            { key: 'programs',     label: `Programs (${programs.length})`,     icon: '🎓' },
                            { key: 'scholarships', label: `Scholarships (${scholarships.length})`, icon: '🏆' },
                        ] as const).map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                                    activeTab === tab.key
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}>
                                <span>{tab.icon}</span>{tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

                    {/* Success toast */}
                    {success && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                            </svg>
                            {success}
                        </div>
                    )}

                    {/* ── Info Tab ── */}
                    {activeTab === 'info' && (
                        <>
                            <Section title="Images" icon="🖼️">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Cover Image</label>
                                        <div onClick={() => coverRef.current?.click()}
                                            className="relative w-full h-40 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer overflow-hidden hover:border-blue-300 transition-all">
                                            {coverPreview
                                                ? <><img src={coverPreview} className="w-full h-full object-cover" alt="Cover"/>
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                        <span className="text-white text-sm font-semibold">Change Cover</span>
                                                    </div></>
                                                : <div className="flex items-center justify-center h-full text-slate-400 text-sm gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                                                    </svg>
                                                    Upload cover
                                                  </div>
                                            }
                                            <input ref={coverRef} type="file" hidden accept="image/*"
                                                onChange={e => e.target.files?.[0] && handleImageChange(e.target.files[0], 'cover')}/>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div onClick={() => logoRef.current?.click()}
                                            className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer overflow-hidden hover:border-blue-300 transition-all flex items-center justify-center shrink-0">
                                            {logoPreview
                                                ? <img src={logoPreview} className="w-full h-full object-cover" alt="Logo"/>
                                                : <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                                                  </svg>
                                            }
                                            <input ref={logoRef} type="file" hidden accept="image/*"
                                                onChange={e => e.target.files?.[0] && handleImageChange(e.target.files[0], 'logo')}/>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">University logo (square recommended)</p>
                                    </div>
                                </div>
                            </Section>

                            <Section title="Basic Information" icon="🏛️">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Field label="University Name" required>
                                            <input className={inputCls} value={form.name} onChange={e => setF('name', e.target.value)}/>
                                        </Field>
                                    </div>
                                    <Field label="Abbreviation">
                                        <input className={inputCls} placeholder="MIT" value={form.abbreviation} onChange={e => setF('abbreviation', e.target.value)}/>
                                    </Field>
                                    <Field label="Category" required>
                                        <select className={inputCls} value={form.category} onChange={e => setF('category', e.target.value)}>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </Field>
                                    <div className="col-span-2">
                                        <Field label="Website">
                                            <input className={inputCls} type="url" value={form.website} onChange={e => setF('website', e.target.value)}/>
                                        </Field>
                                    </div>
                                    <Field label="City">
                                        <input className={inputCls} value={form.city} onChange={e => setF('city', e.target.value)}/>
                                    </Field>
                                    <Field label="State / Province">
                                        <input className={inputCls} value={form.state} onChange={e => setF('state', e.target.value)}/>
                                    </Field>
                                    <Field label="Country" required>
                                        <input className={inputCls} value={form.country} onChange={e => setF('country', e.target.value)}/>
                                    </Field>
                                    <Field label="Country Code">
                                        <input className={inputCls} placeholder="US" maxLength={5} value={form.country_code} onChange={e => setF('country_code', e.target.value.toUpperCase())}/>
                                    </Field>
                                </div>
                            </Section>

                            <Section title="Rankings & Statistics" icon="📊">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <Field label="QS Ranking">
                                        <input className={inputCls} type="number" min="1" value={form.qs_ranking} onChange={e => setF('qs_ranking', e.target.value)}/>
                                    </Field>
                                    <Field label="Acceptance Rate (%)">
                                        <input className={inputCls} type="number" min="0" max="100" step="0.01" value={form.acceptance_rate} onChange={e => setF('acceptance_rate', e.target.value)}/>
                                    </Field>
                                    <Field label="Total Students">
                                        <input className={inputCls} type="number" min="0" value={form.student_count} onChange={e => setF('student_count', e.target.value)}/>
                                    </Field>
                                    <Field label="Faculty Members">
                                        <input className={inputCls} type="number" min="0" value={form.faculty_count} onChange={e => setF('faculty_count', e.target.value)}/>
                                    </Field>
                                    <Field label="Founded Year">
                                        <input className={inputCls} type="number" value={form.founded_year} onChange={e => setF('founded_year', e.target.value)}/>
                                    </Field>
                                    <Field label="President">
                                        <input className={inputCls} value={form.president} onChange={e => setF('president', e.target.value)}/>
                                    </Field>
                                    <div className="col-span-2 sm:col-span-3">
                                        <Field label="Motto">
                                            <input className={inputCls} value={form.motto} onChange={e => setF('motto', e.target.value)}/>
                                        </Field>
                                    </div>
                                </div>
                            </Section>

                            <Section title="About" icon="📖">
                                <div className="space-y-4">
                                    <Field label="About the University">
                                        <textarea className={textareaCls} rows={5} value={form.about} onChange={e => setF('about', e.target.value)}/>
                                    </Field>
                                    <Field label="Life in the City">
                                        <textarea className={textareaCls} rows={3} value={form.life_in_city} onChange={e => setF('life_in_city', e.target.value)}/>
                                    </Field>
                                </div>
                            </Section>

                            <Section title="Annual Costs & Expenses" icon="💰">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {[
                                        { key: 'annual_tuition',    label: 'Annual Tuition ($)' },
                                        { key: 'room_and_board',    label: 'Room & Board ($)' },
                                        { key: 'application_fee',   label: 'Application Fee ($)' },
                                        { key: 'books_supplies',    label: 'Books & Supplies ($)' },
                                        { key: 'transportation',    label: 'Transportation ($)' },
                                        { key: 'personal_expenses', label: 'Personal Expenses ($)' },
                                        { key: 'health_insurance',  label: 'Health Insurance ($)' },
                                    ].map(({ key, label }) => (
                                        <Field key={key} label={label}>
                                            <input className={inputCls} type="number" min="0"
                                                value={form[key as keyof typeof form]}
                                                onChange={e => setF(key, e.target.value)}/>
                                        </Field>
                                    ))}
                                </div>
                                {totalCost > 0 && (
                                    <div className="mt-4 bg-blue-700 rounded-xl p-4 flex items-center justify-between text-white">
                                        <p className="text-sm font-medium">Total Estimated Cost</p>
                                        <p className="text-xl font-bold">${totalCost.toLocaleString()}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 gap-4 mt-4">
                                    <Field label="Financial Aid Note">
                                        <textarea className={textareaCls} rows={2} value={form.financial_aid_note} onChange={e => setF('financial_aid_note', e.target.value)}/>
                                    </Field>
                                    <Field label="Financial Aid URL">
                                        <input className={inputCls} type="url" value={form.financial_aid_url} onChange={e => setF('financial_aid_url', e.target.value)}/>
                                    </Field>
                                </div>
                            </Section>

                            <div className="flex justify-end">
                                <button onClick={handleUpdateInfo} disabled={submitting}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-all disabled:opacity-50">
                                    {submitting ? 'Saving...' : '✓ Save Changes'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Programs Tab ── */}
                    {activeTab === 'programs' && (
                        <div className="space-y-4">
                            {programs.map(program => (
                                <div key={program.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                                    {editingProgram?.id === program.id ? (
                                        <ProgramForm
                                            data={editingProgram}
                                            onChange={setEditingProgram}
                                            onSave={() => handleUpdateProgram(editingProgram)}
                                            onCancel={() => setEditingProgram(null)}
                                            inputCls={inputCls}
                                            textareaCls={textareaCls}
                                            degreeTypes={DEGREE_TYPES}
                                            subjectsList={SUBJECTS_LIST}
                                        />
                                    ) : (
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                        {program.degree_type}
                                                    </span>
                                                    {program.school && <span className="text-xs text-slate-400">{program.school}</span>}
                                                </div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{program.name}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                    {program.duration && <span>⏱ {program.duration}</span>}
                                                    {program.tuition_fee && <span>💰 ${Number(program.tuition_fee).toLocaleString()}/yr</span>}
                                                    {program.application_deadline && <span>📅 {program.application_deadline}</span>}
                                                </div>
                                                {/* Qualifications preview */}
                                                {program.required_qualifications && (
                                                    Object.values(program.required_qualifications).some(v => v) && (
                                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                                            {program.required_qualifications.min_degree && (
                                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                                                                    🎓 {program.required_qualifications.min_degree}
                                                                </span>
                                                            )}
                                                            {program.required_qualifications.min_cgpa && (
                                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                                                                    📊 CGPA: {program.required_qualifications.min_cgpa}
                                                                </span>
                                                            )}
                                                            {program.required_qualifications.language && (
                                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                                                                    🌐 {program.required_qualifications.language}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button onClick={() => setEditingProgram(program)}
                                                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDeleteProgram(program.id!)}
                                                    className="px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 transition-colors">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {showProgramForm ? (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-5">
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">New Program</h3>
                                    <ProgramForm
                                        data={newProgram}
                                        onChange={setNewProgram}
                                        onSave={handleAddProgram}
                                        onCancel={() => setShowProgramForm(false)}
                                        inputCls={inputCls}
                                        textareaCls={textareaCls}
                                        degreeTypes={DEGREE_TYPES}
                                        subjectsList={SUBJECTS_LIST}
                                        isNew
                                    />
                                </div>
                            ) : (
                                <button onClick={() => setShowProgramForm(true)}
                                    className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                                    </svg>
                                    Add Program
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── Scholarships Tab ── */}
                    {activeTab === 'scholarships' && (
                        <div className="space-y-4">
                            {scholarships.map(s => (
                                <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                                    {editingScholarship?.id === s.id ? (
                                        <ScholarshipForm
                                            data={editingScholarship}
                                            onChange={setEditingScholarship}
                                            onSave={() => handleUpdateScholarship(editingScholarship)}
                                            onCancel={() => setEditingScholarship(null)}
                                            inputCls={inputCls}
                                            textareaCls={textareaCls}
                                            scholarshipTypes={SCHOL_TYPES}
                                            coverageTypes={COVERAGE_TYPES}
                                        />
                                    ) : (
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">{s.type}</span>
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">{s.coverage}</span>
                                                    {s.is_independent && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">Independent</span>}
                                                </div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{s.name}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                    {s.total_amount && <span>💰 ${Number(s.total_amount).toLocaleString()}</span>}
                                                    {s.recipients && <span>👥 {s.recipients} recipients</span>}
                                                    {s.programs_covered && <span>🎓 {s.programs_covered}</span>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button onClick={() => setEditingScholarship(s)}
                                                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDeleteScholarship(s.id!)}
                                                    className="px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 transition-colors">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {showScholarshipForm ? (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-200 dark:border-amber-800 p-5">
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">New Scholarship</h3>
                                    <ScholarshipForm
                                        data={newScholarship}
                                        onChange={setNewScholarship}
                                        onSave={handleAddScholarship}
                                        onCancel={() => setShowScholarshipForm(false)}
                                        inputCls={inputCls}
                                        textareaCls={textareaCls}
                                        scholarshipTypes={SCHOL_TYPES}
                                        coverageTypes={COVERAGE_TYPES}
                                        isNew
                                    />
                                </div>
                            ) : (
                                <button onClick={() => setShowScholarshipForm(true)}
                                    className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 hover:border-amber-300 hover:text-amber-600 dark:hover:border-amber-700 dark:hover:text-amber-400 transition-all flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                                    </svg>
                                    Add Scholarship
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ── Program sub-form ──────────────────────────────────────────────────────────
function ProgramForm({ data, onChange, onSave, onCancel, inputCls, textareaCls, degreeTypes, subjectsList, isNew }: {
    data: Program;
    onChange: (p: Program) => void;
    onSave: () => void;
    onCancel: () => void;
    inputCls: string;
    textareaCls: string;
    degreeTypes: string[];
    subjectsList: string[];
    isNew?: boolean;
}) {
    function set(key: keyof Program, value: any) { onChange({ ...data, [key]: value }); }
    function setQ(key: keyof Qualifications, value: string) {
        onChange({ ...data, required_qualifications: { ...data.required_qualifications, [key]: value } });
    }
    function toggleSubject(s: string) {
        const subjects = data.subjects.includes(s)
            ? data.subjects.filter(x => x !== s)
            : [...data.subjects, s];
        set('subjects', subjects);
    }

    return (
        <div className="space-y-5">
            {/* Basic fields */}
            <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="Program name *" value={data.name} onChange={e => set('name', e.target.value)}/>
                <input className={inputCls} placeholder="School / Faculty" value={data.school} onChange={e => set('school', e.target.value)}/>
                <select className={inputCls} value={data.degree_type} onChange={e => set('degree_type', e.target.value)}>
                    {degreeTypes.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input className={inputCls} placeholder="Duration (e.g. 4 years)" value={data.duration} onChange={e => set('duration', e.target.value)}/>
                <input className={inputCls} type="number" placeholder="Tuition fee ($)" value={data.tuition_fee} onChange={e => set('tuition_fee', e.target.value)}/>
                <input className={inputCls} type="date" value={data.application_deadline} onChange={e => set('application_deadline', e.target.value)}/>
                <div className="col-span-2">
                    <input className={inputCls} type="url" placeholder="Program page URL" value={data.program_url} onChange={e => set('program_url', e.target.value)}/>
                </div>
            </div>

            {/* ── Required Qualifications (structured) ── */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Required Qualifications
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Minimum Degree</label>
                        <input className={inputCls} placeholder="e.g. High School Diploma"
                            value={data.required_qualifications.min_degree}
                            onChange={e => setQ('min_degree', e.target.value)}/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">SAT / ACT Scores</label>
                        <input className={inputCls} placeholder="e.g. SAT: 1500+ / ACT: 34+"
                            value={data.required_qualifications.sat_act}
                            onChange={e => setQ('sat_act', e.target.value)}/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Language Proficiency</label>
                        <input className={inputCls} placeholder="e.g. TOEFL: 100+ / IELTS: 7.0+"
                            value={data.required_qualifications.language}
                            onChange={e => setQ('language', e.target.value)}/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Minimum CGPA</label>
                        <input className={inputCls} placeholder="e.g. 3.8 / 4.0"
                            value={data.required_qualifications.min_cgpa}
                            onChange={e => setQ('min_cgpa', e.target.value)}/>
                    </div>
                </div>
            </div>

            {/* Subjects */}
            <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subjects</p>
                <div className="flex flex-wrap gap-1.5">
                    {subjectsList.map(s => (
                        <button key={s} type="button" onClick={() => toggleSubject(s)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                                data.subjects.includes(s)
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300'
                            }`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
                <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button onClick={onSave} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                    {isNew ? 'Add Program' : 'Save'}
                </button>
            </div>
        </div>
    );
}

// ── Scholarship sub-form ──────────────────────────────────────────────────────
function ScholarshipForm({ data, onChange, onSave, onCancel, inputCls, textareaCls, scholarshipTypes, coverageTypes, isNew }: {
    data: Scholarship; onChange: (s: Scholarship) => void;
    onSave: () => void; onCancel: () => void;
    inputCls: string; textareaCls: string;
    scholarshipTypes: string[]; coverageTypes: string[]; isNew?: boolean;
}) {
    function set(key: keyof Scholarship, value: any) { onChange({ ...data, [key]: value }); }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <input className={inputCls} placeholder="Scholarship name *" value={data.name} onChange={e => set('name', e.target.value)}/>
                </div>
                <select className={inputCls} value={data.type} onChange={e => set('type', e.target.value)}>
                    {scholarshipTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className={inputCls} value={data.coverage} onChange={e => set('coverage', e.target.value)}>
                    {coverageTypes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input className={inputCls} type="number" placeholder="Total amount ($)" value={data.total_amount} onChange={e => set('total_amount', e.target.value)}/>
                <input className={inputCls} type="number" placeholder="Number of recipients" value={data.recipients} onChange={e => set('recipients', e.target.value)}/>
                <input className={inputCls} type="number" placeholder="Eligible countries" value={data.eligible_countries} onChange={e => set('eligible_countries', e.target.value)}/>
                <input className={inputCls} placeholder="Programs covered (e.g. Master's, PhD)" value={data.programs_covered} onChange={e => set('programs_covered', e.target.value)}/>
                <div className="col-span-2">
                    <input className={inputCls} type="url" placeholder="Scholarship page URL" value={data.scholarship_url} onChange={e => set('scholarship_url', e.target.value)}/>
                </div>
                <div className="col-span-2">
                    <textarea className={textareaCls} rows={2} placeholder="Description" value={data.description} onChange={e => set('description', e.target.value)}/>
                </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.is_independent} onChange={e => set('is_independent', e.target.checked)} className="rounded border-slate-300"/>
                <span className="text-sm text-slate-600 dark:text-slate-300">Independent scholarship (not university-offered)</span>
            </label>
            <div className="flex gap-2 justify-end pt-2">
                <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button onClick={onSave} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors">
                    {isNew ? 'Add Scholarship' : 'Save'}
                </button>
            </div>
        </div>
    );
}
