export type Urgency = 'low' | 'medium' | 'high' | 'critical';

export interface CalendarEvent {
    id: number;
    title: string;
    description?: string;
    location?: string;
    start_at: string;
    end_at: string;
    all_day: boolean;
    urgency: Urgency;
    urgencyColor: string;
    color: string;
    is_completed: boolean;
    category?: {
        id: number;
        name: string;
        color: string;
    };
}

export interface EventCategory {
    id: number;
    name: string;
    color: string;
    icon?: string;
}

export const URGENCY_CONFIG: Record<Urgency, { label: string; color: string; bg: string; border: string; dot: string }> = {
    low:      { label: 'Low',      color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: 'bg-emerald-500' },
    medium:   { label: 'Medium',   color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   dot: 'bg-amber-500'   },
    high:     { label: 'High',     color: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200',  dot: 'bg-orange-500'  },
    critical: { label: 'Critical', color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200',     dot: 'bg-red-500'     },
};

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];
