import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { CalendarEvent, EventCategory, URGENCY_CONFIG, Urgency } from './calendar-types';

interface EventModalProps {
    event?: CalendarEvent | null;      // null = create
    defaultDate?: Date;
    categories: EventCategory[];
    onClose: () => void;
}

const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6'];

const urgencies: Urgency[] = ['low', 'medium', 'high', 'critical'];

function toDateTimeLocal(iso?: string) {
    if (!iso) return '';
    return iso.slice(0, 16);
}

export default function EventModal({ event, defaultDate, categories, onClose }: EventModalProps) {
    const isEditing = !!event;

    const defaultStart = defaultDate
        ? `${defaultDate.toISOString().slice(0,10)}T09:00`
        : toDateTimeLocal(event?.start_at) || new Date().toISOString().slice(0,16);

    const defaultEnd = defaultDate
        ? `${defaultDate.toISOString().slice(0,10)}T10:00`
        : toDateTimeLocal(event?.end_at) || new Date(Date.now() + 3600000).toISOString().slice(0,16);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title:       event?.title       ?? '',
        description: event?.description ?? '',
        location:    event?.location    ?? '',
        start_at:    defaultStart,
        end_at:      defaultEnd,
        all_day:     event?.all_day     ?? false,
        urgency:     (event?.urgency    ?? 'medium') as Urgency,
        color:       event?.color       ?? '#6366f1',
        category_id: event?.category?.id ?? '',
        is_completed: event?.is_completed ?? false,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (isEditing) {
            put(route('events.update', event!.id), { onSuccess: onClose });
        } else {
            post(route('events.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    }

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-3xl sm:rounded-t-2xl">
                    <h2 className="text-lg font-bold text-slate-800">
                        {isEditing ? 'Edit Event' : 'New Event'}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    {/* Color strip + Title */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                            <div
                                className="w-10 h-10 rounded-xl shrink-0 cursor-pointer ring-2 ring-offset-2"
                                style={{ backgroundColor: data.color, ringColor: data.color }}
                            />
                            <div className="flex flex-wrap gap-1 w-10">
                                {COLORS.map(c => (
                                    <button
                                        key={c} type="button"
                                        onClick={() => setData('color', c)}
                                        className={`w-4 h-4 rounded-full transition-transform hover:scale-110 ${data.color === c ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Event title *"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className="w-full text-lg font-semibold text-slate-800 placeholder-slate-300 border-0 border-b-2 border-slate-200 focus:border-indigo-500 outline-none pb-1 bg-transparent transition-colors"
                                required
                            />
                            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                        </div>
                    </div>

                    {/* Urgency */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Urgency</label>
                        <div className="flex gap-2 flex-wrap">
                            {urgencies.map(u => {
                                const cfg = URGENCY_CONFIG[u];
                                return (
                                    <button
                                        key={u} type="button"
                                        onClick={() => setData('urgency', u)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                            data.urgency === u
                                                ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`
                                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date / time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Start</label>
                            <input
                                type={data.all_day ? 'date' : 'datetime-local'}
                                value={data.start_at}
                                onChange={e => setData('start_at', e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all bg-slate-50"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">End</label>
                            <input
                                type={data.all_day ? 'date' : 'datetime-local'}
                                value={data.end_at}
                                onChange={e => setData('end_at', e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all bg-slate-50"
                                required
                            />
                        </div>
                    </div>

                    {/* All day toggle */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                            onClick={() => setData('all_day', !data.all_day)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${data.all_day ? 'bg-indigo-500' : 'bg-slate-200'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.all_day ? 'translate-x-5' : ''}`} />
                        </div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">All day</span>
                    </label>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Description</label>
                        <textarea
                            placeholder="Add a description…"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={3}
                            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all bg-slate-50 resize-none"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Location</label>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Add location…"
                                value={data.location}
                                onChange={e => setData('location', e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all bg-slate-50"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    {categories.length > 0 && (
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
                            <select
                                value={data.category_id}
                                onChange={e => setData('category_id', e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
                            >
                                <option value="">No category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Mark complete (edit only) */}
                    {isEditing && (
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div
                                onClick={() => setData('is_completed', !data.is_completed)}
                                className={`relative w-10 h-5 rounded-full transition-colors ${data.is_completed ? 'bg-emerald-500' : 'bg-slate-200'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.is_completed ? 'translate-x-5' : ''}`} />
                            </div>
                            <span className="text-sm font-medium text-slate-600">Mark as completed</span>
                        </label>
                    )}

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                            {processing ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
