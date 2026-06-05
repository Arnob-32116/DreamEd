import { useState } from 'react';
import { DAYS, MONTHS, CalendarEvent } from './calendar-types';

interface MiniCalendarProps {
    year: number;
    month: number;
    events: CalendarEvent[];
    onDateSelect: (date: Date) => void;
    onMonthChange: (year: number, month: number) => void;
}

function getDays(year: number, month: number) {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const prevDays = new Date(year, month - 1, 0).getDate();

    const days: { date: Date; current: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--)
        days.push({ date: new Date(year, month - 2, prevDays - i), current: false });
    for (let d = 1; d <= daysInMonth; d++)
        days.push({ date: new Date(year, month - 1, d), current: true });
    while (days.length < 42)
        days.push({ date: new Date(year, month, days.length - firstDay - daysInMonth + 1), current: false });
    return days;
}

function isSameDay(a: Date, b: Date) {
    return a.toDateString() === b.toDateString();
}

const URGENCY_DOTS: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-400',
    medium: 'bg-amber-400',
    low: 'bg-emerald-400',
};

export default function MiniCalendar({ year, month, events, onDateSelect, onMonthChange }: MiniCalendarProps) {
    const days = getDays(year, month);
    const today = new Date();

    const hasEvent = (date: Date) => events.some(e => isSameDay(new Date(e.start_at), date));
    const topUrgency = (date: Date): string | null => {
        const order = ['critical', 'high', 'medium', 'low'];
        for (const u of order) {
            if (events.some(e => isSameDay(new Date(e.start_at), date) && e.urgency === u)) return u;
        }
        return null;
    };

    function prev() {
        if (month === 1) onMonthChange(year - 1, 12);
        else onMonthChange(year, month - 1);
    }
    function next() {
        if (month === 12) onMonthChange(year + 1, 1);
        else onMonthChange(year, month + 1);
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <button onClick={prev} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-sm font-bold text-slate-700">{MONTHS[month - 1].slice(0, 3)} {year}</span>
                <button onClick={next} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d[0]}</div>
                ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-y-0.5">
                {days.map(({ date, current }, i) => {
                    const isToday = isSameDay(date, today);
                    const dot = topUrgency(date);
                    return (
                        <button
                            key={i}
                            onClick={() => onDateSelect(date)}
                            className={`relative flex flex-col items-center justify-center w-8 h-8 mx-auto rounded-full text-[11px] font-semibold transition-all hover:bg-indigo-50 ${
                                isToday ? 'bg-indigo-600 text-white hover:bg-indigo-700' :
                                current ? 'text-slate-700' : 'text-slate-300'
                            }`}
                        >
                            {date.getDate()}
                            {dot && !isToday && (
                                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${URGENCY_DOTS[dot]}`} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
