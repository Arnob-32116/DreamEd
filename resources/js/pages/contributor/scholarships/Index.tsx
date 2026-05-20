import { useState, useMemo, useRef, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import ScholarshipCard, { type ScholarshipListItem } from '@/layouts/ScholarshipLayout/ScholarshipCard';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FilterCountry {
    code: string;
    label: string;
}

interface PageProps {
    scholarships: ScholarshipListItem[];
    total: number;
    filterCountries: FilterCountry[];
    filterInstitutions: string[];
    filterTypes: string[];
    filters: {
        search: string;
        countries: string[];
        institutions: string[];
        types: string[];
    };
    [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter panel (slide-in drawer matching screenshot 5)
// ─────────────────────────────────────────────────────────────────────────────

interface FilterPanelProps {
    open: boolean;
    onClose: () => void;
    countries: FilterCountry[];
    institutions: string[];
    types: string[];
    selected: {
        countries: string[];
        institutions: string[];
        types: string[];
    };
    onChange: (key: 'countries' | 'institutions' | 'types', value: string[]) => void;
    onReset: () => void;
    onApply: () => void;
}

function CheckRow({
    label,
    checked,
    onChange,
    prefix,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    prefix?: string;
}) {
    return (
        <label className="flex items-center gap-3 py-2 cursor-pointer group">
            <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    checked
                        ? 'bg-[#1a6b8a] border-[#1a6b8a]'
                        : 'border-zinc-300 dark:border-zinc-600 group-hover:border-[#1a6b8a]/60'
                }`}
                onClick={() => onChange(!checked)}
            >
                {checked && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            <div className="flex items-center gap-2 text-[13.5px] text-zinc-700 dark:text-zinc-300 select-none">
                {prefix && (
                    <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 w-6 shrink-0">
                        {prefix}
                    </span>
                )}
                {label}
            </div>
        </label>
    );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
            <h3 className="text-[14px] font-bold text-zinc-800 dark:text-zinc-100 mb-1">{title}</h3>
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
                {children}
            </div>
        </div>
    );
}

function FilterPanel({
    open, onClose, countries, institutions, types,
    selected, onChange, onReset, onApply,
}: FilterPanelProps) {
    const totalActive =
        selected.countries.length +
        selected.institutions.length +
        selected.types.length;

    function toggleItem(
        key: 'countries' | 'institutions' | 'types',
        value: string,
        current: string[],
    ) {
        if (current.includes(value)) {
            onChange(key, current.filter((v) => v !== value));
        } else {
            onChange(key, [...current, value]);
        }
    }

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-zinc-50 dark:bg-zinc-950 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
                    <div className="w-10 h-10 rounded-xl bg-[#1a6b8a] flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2 className="text-[16px] font-bold text-zinc-800 dark:text-zinc-100 flex-1">
                        Filter Scholarships
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Reset row */}
                <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
                    <button
                        onClick={onReset}
                        disabled={totalActive === 0}
                        className="flex items-center gap-2 text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M3 12a9 9 0 109-9 9 9 0 00-6.28 2.57L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Reset
                        {totalActive > 0 && (
                            <span className="bg-[#1a6b8a] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {totalActive}
                            </span>
                        )}
                    </button>
                </div>

                {/* Scrollable filter sections */}
                <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

                    {/* Countries */}
                    {countries.length > 0 && (
                        <FilterSection title="Countries">
                            {countries.map((c) => (
                                <CheckRow
                                    key={c.code}
                                    label={c.label}
                                    prefix={c.code}
                                    checked={selected.countries.includes(c.code)}
                                    onChange={() => toggleItem('countries', c.code, selected.countries)}
                                />
                            ))}
                        </FilterSection>
                    )}

                    {/* Organizations / Institutions */}
                    {institutions.length > 0 && (
                        <FilterSection title="Organizations">
                            {institutions.map((inst) => (
                                <CheckRow
                                    key={inst}
                                    label={inst}
                                    checked={selected.institutions.includes(inst)}
                                    onChange={() => toggleItem('institutions', inst, selected.institutions)}
                                />
                            ))}
                        </FilterSection>
                    )}

                    {/* Types */}
                    {types.length > 0 && (
                        <FilterSection title="Scholarship Type">
                            {types.map((t) => (
                                <CheckRow
                                    key={t}
                                    label={t}
                                    checked={selected.types.includes(t)}
                                    onChange={() => toggleItem('types', t, selected.types)}
                                />
                            ))}
                        </FilterSection>
                    )}
                </div>

                {/* Apply button */}
                <div className="px-5 py-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
                    <button
                        onClick={onApply}
                        className="w-full py-3 rounded-xl bg-[#1a6b8a] hover:bg-[#155878] text-white text-[14px] font-semibold transition-all shadow-sm hover:shadow-md"
                    >
                        Show Results
                        {totalActive > 0 && ` (${totalActive} filter${totalActive > 1 ? 's' : ''})`}
                    </button>
                </div>
            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function ScholarshipsIndex() {
    const {
        scholarships,
        total,
        filterCountries,
        filterInstitutions,
        filterTypes,
        filters,
    } = usePage<PageProps>().props;

    // Local search state — client-side for instant feedback
    const [localSearch, setLocalSearch] = useState(filters.search);

    // Filter panel state
    const [panelOpen, setPanelOpen] = useState(false);

    // Pending filter selections inside the panel (not applied until "Show Results")
    const [pending, setPending] = useState({
        countries:    filters.countries,
        institutions: filters.institutions,
        types:        filters.types,
    });

    // Active filters (what's currently applied to the server query)
    const [active, setActive] = useState({
        countries:    filters.countries,
        institutions: filters.institutions,
        types:        filters.types,
    });

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Client-side search filter on top of server results ──────────────────
    // For large datasets this should be server-side; for now it's instant UX.
    const displayed = useMemo(() => {
        if (!localSearch.trim()) return scholarships;
        const q = localSearch.toLowerCase();
        return scholarships.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                s.institution.toLowerCase().includes(q) ||
                (s.country?.toLowerCase().includes(q) ?? false),
        );
    }, [scholarships, localSearch]);

    // ── Debounced server request on search change ────────────────────────────
    function handleSearchChange(val: string) {
        setLocalSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            applyToServer({ search: val, ...active });
        }, 400);
    }

    // ── Apply filters to server ──────────────────────────────────────────────
    function applyToServer(params: {
        search: string;
        countries: string[];
        institutions: string[];
        types: string[];
    }) {
        router.get(
            '/scholarships',
            {
                search:       params.search || undefined,
                countries:    params.countries.length ? params.countries : undefined,
                institutions: params.institutions.length ? params.institutions : undefined,
                types:        params.types.length ? params.types : undefined,
            },
            { preserveScroll: true, preserveState: true },
        );
    }

    function handleApplyFilters() {
        setActive(pending);
        setPanelOpen(false);
        applyToServer({ search: localSearch, ...pending });
    }

    function handleResetFilters() {
        const empty = { countries: [], institutions: [], types: [] };
        setPending(empty);
        setActive(empty);
        setLocalSearch('');
        router.get('/scholarships', {}, { preserveScroll: true, preserveState: true });
    }

    function handlePanelOpen() {
        setPending(active); // sync pending to current active when opening
        setPanelOpen(true);
    }

    const totalActive =
        active.countries.length + active.institutions.length + active.types.length;

    return (
        <>
            <Head title="Scholarship Search" />

            <div className="flex-1 min-h-screen bg-[#f3f4f6] dark:bg-zinc-950 overflow-y-auto">

                {/* ── Hero ── */}
                <section className="pt-14 pb-10 px-5 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight mb-3"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                        Scholarship Search
                    </h1>
                    <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mb-8 max-w-xl mx-auto">
                        Discover funding opportunities and scholarships from around the world
                    </p>

                    {/* Search + Filter row */}
                    <div className="flex items-center gap-3 max-w-2xl mx-auto">
                        {/* Search bar */}
                        <div className="flex-1 flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 h-13 shadow-sm focus-within:ring-2 focus-within:ring-[#1a6b8a]/30 focus-within:border-[#1a6b8a]/50 transition-all">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-zinc-400 shrink-0">
                                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                                <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <input
                                type="text"
                                value={localSearch}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search scholarships, organizations, or countries..."
                                className="flex-1 bg-transparent border-none outline-none text-[14px] text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 py-3.5"
                            />
                            {localSearch && (
                                <button
                                    onClick={() => handleSearchChange('')}
                                    className="text-zinc-300 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Filter button */}
                        <button
                            onClick={handlePanelOpen}
                            className={`flex items-center gap-2 px-5 h-13 rounded-2xl border text-[13.5px] font-semibold transition-all shrink-0 shadow-sm ${
                                totalActive > 0
                                    ? 'bg-[#1a6b8a] border-[#1a6b8a] text-white hover:bg-[#155878]'
                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                            }`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Filters
                            {totalActive > 0 && (
                                <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {totalActive}
                                </span>
                            )}
                        </button>
                    </div>
                </section>

                {/* ── Results count pill ── */}
                <div className="flex justify-center mb-6 px-5">
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full px-5 py-2 shadow-sm text-[13.5px] text-zinc-600 dark:text-zinc-300 font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#1a6b8a] animate-pulse" />
                        {displayed.length} scholarship{displayed.length !== 1 ? 's' : ''} found
                    </div>
                </div>

                {/* ── Active filter chips ── */}
                {totalActive > 0 && (
                    <div className="max-w-4xl mx-auto px-5 mb-5 flex flex-wrap gap-2">
                        {active.countries.map((c) => {
                            const country = filterCountries.find((fc) => fc.code === c);
                            return (
                                <FilterChip
                                    key={c}
                                    label={country?.label ?? c}
                                    onRemove={() => {
                                        const next = { ...active, countries: active.countries.filter((x) => x !== c) };
                                        setActive(next);
                                        setPending(next);
                                        applyToServer({ search: localSearch, ...next });
                                    }}
                                />
                            );
                        })}
                        {active.institutions.map((inst) => (
                            <FilterChip
                                key={inst}
                                label={inst}
                                onRemove={() => {
                                    const next = { ...active, institutions: active.institutions.filter((x) => x !== inst) };
                                    setActive(next);
                                    setPending(next);
                                    applyToServer({ search: localSearch, ...next });
                                }}
                            />
                        ))}
                        {active.types.map((t) => (
                            <FilterChip
                                key={t}
                                label={t}
                                onRemove={() => {
                                    const next = { ...active, types: active.types.filter((x) => x !== t) };
                                    setActive(next);
                                    setPending(next);
                                    applyToServer({ search: localSearch, ...next });
                                }}
                            />
                        ))}
                        <button
                            onClick={handleResetFilters}
                            className="text-[12px] font-semibold text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors px-1"
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {/* ── Scholarship list ── */}
                <div className="max-w-4xl mx-auto px-5 pb-20 flex flex-col gap-5">
                    {displayed.length === 0 ? (
                        <EmptyState onReset={handleResetFilters} />
                    ) : (
                        displayed.map((s) => (
                            <ScholarshipCard key={s.id} scholarship={s} />
                        ))
                    )}
                </div>
            </div>

            {/* Filter panel */}
            <FilterPanel
                open={panelOpen}
                onClose={() => setPanelOpen(false)}
                countries={filterCountries}
                institutions={filterInstitutions}
                types={filterTypes}
                selected={pending}
                onChange={(key, val) => setPending((prev) => ({ ...prev, [key]: val }))}
                onReset={() => setPending({ countries: [], institutions: [], types: [] })}
                onApply={handleApplyFilters}
            />
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#1a6b8a] dark:text-[#3a9bbf] bg-[#1a6b8a]/8 dark:bg-[#1a6b8a]/20 border border-[#1a6b8a]/20 dark:border-[#1a6b8a]/30 pl-3 pr-2 py-1 rounded-full">
            {label}
            <button
                onClick={onRemove}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#1a6b8a]/20 transition-colors"
            >
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
            </button>
        </span>
    );
}

function EmptyState({ onReset }: { onReset: () => void }) {
    return (
        <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-zinc-400 dark:text-zinc-500">
                    <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
            </div>
            <p className="text-[15px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                No scholarships found
            </p>
            <p className="text-[13px] text-zinc-400 dark:text-zinc-500 mb-5">
                Try adjusting your search or filters
            </p>
            <button
                onClick={onReset}
                className="text-[13px] font-semibold text-[#1a6b8a] dark:text-[#3a9bbf] hover:underline"
            >
                Clear all filters
            </button>
        </div>
    );
}
