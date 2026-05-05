import { MONTHS } from './calendar-types';

type View = 'month' | 'agenda';

interface CalendarHeaderProps {
    year: number;
    month: number;
    view: View;
    onViewChange: (v: View) => void;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    onAddEvent: () => void;
}

const views: { key: View; label: string }[] = [
    { key: 'month',  label: 'Month'  },
    { key: 'agenda', label: 'Agenda' },
];

export default function CalendarHeader({
    year, month, view, onViewChange, onPrev, onNext, onToday, onAddEvent,
}: CalendarHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-border">
            {/* Left: nav */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onToday}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
                >
                    Today
                </button>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onPrev}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={onNext}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                    {MONTHS[month - 1]} <span className="text-muted-foreground font-normal">{year}</span>
                </h1>
            </div>

            {/* Right: view switcher + add */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex bg-muted rounded-xl p-1 gap-0.5">
                    {views.map(v => (
                        <button
                            key={v.key}
                            onClick={() => onViewChange(v.key)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                view === v.key
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onAddEvent}
                    className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold transition-colors ml-auto sm:ml-0"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden xs:inline">New Event</span>
                </button>
            </div>
        </div>
    );
}
