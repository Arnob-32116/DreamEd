import { CalendarEvent, DAYS } from './calendar-types';
import EventChip from './EventChip';

interface MonthGridProps {
    year: number;
    month: number; // 1-based
    events: CalendarEvent[];
    onDayClick: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
}

function getDaysInMonth(year: number, month: number) {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const prevMonthDays = new Date(year, month - 1, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ date: new Date(year, month - 2, prevMonthDays - i), isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        days.push({ date: new Date(year, month - 1, d), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
        days.push({ date: new Date(year, month, d), isCurrentMonth: false });
    }
    return days;
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function isToday(date: Date) {
    return isSameDay(date, new Date());
}

export default function MonthGrid({ year, month, events, onDayClick, onEventClick }: MonthGridProps) {
    const days = getDaysInMonth(year, month);

    const getEventsForDay = (date: Date) =>
        events.filter(e => isSameDay(new Date(e.start_at), date))
              .sort((a, b) => {
                  const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                  return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
              });

    return (
        <div className="flex-1 overflow-auto bg-background">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border">
                {DAYS.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day[0]}</span>
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 grid-rows-6 h-[calc(100vh-200px)] min-h-[480px]">
                {days.map(({ date, isCurrentMonth }, idx) => {
                    const dayEvents = getEventsForDay(date);
                    const today = isToday(date);
                    const MAX_VISIBLE = 3;
                    const overflow = dayEvents.length - MAX_VISIBLE;

                    return (
                        <div
                            key={idx}
                            onClick={() => onDayClick(date)}
                            className={`
                                border-b border-r border-border p-1 sm:p-1.5 flex flex-col gap-0.5 cursor-pointer
                                transition-colors hover:bg-accent min-h-0
                                ${isCurrentMonth ? 'bg-background' : 'bg-muted/40'}
                            `}
                        >
                            {/* Date number */}
                            <div className="flex justify-end mb-0.5">
                                <span className={`
                                    w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm font-semibold rounded-full transition-colors
                                    ${today ? 'bg-primary text-primary-foreground' : ''}
                                    ${!today && isCurrentMonth ? 'text-foreground hover:bg-accent' : ''}
                                    ${!isCurrentMonth ? 'text-muted-foreground/50' : ''}
                                `}>
                                    {date.getDate()}
                                </span>
                            </div>

                            {/* Events */}
                            <div className="flex flex-col gap-0.5 overflow-hidden flex-1 min-h-0">
                                {dayEvents.slice(0, MAX_VISIBLE).map(event => (
                                    <EventChip
                                        key={event.id}
                                        event={event}
                                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                        compact
                                    />
                                ))}
                                {overflow > 0 && (
                                    <button className="text-[10px] font-semibold text-primary hover:opacity-70 text-left px-2 py-0.5 rounded hover:bg-accent transition-colors">
                                        +{overflow} more
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
