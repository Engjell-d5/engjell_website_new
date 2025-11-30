'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  required?: boolean;
  className?: string;
}

export default function DateTimePicker({
  value,
  onChange,
  min,
  required,
  className = '',
}: DateTimePickerProps) {
  const [date, setDate] = useState(() => {
    if (value) {
      return value.split('T')[0];
    }
    return '';
  });
  
  const [time, setTime] = useState(() => {
    if (value) {
      const timePart = value.split('T')[1];
      return timePart || '12:00';
    }
    return '12:00';
  });

  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const isInternalUpdateRef = useRef(false);
  const prevCombinedRef = useRef<string>('');

  // Get minimum values
  const minDate = min ? min.split('T')[0] : '';
  const minTime = min ? min.split('T')[1] : '00:00';

  // Handle internal date/time changes
  useEffect(() => {
    // Skip if this update came from external value change
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    // Only call onChange when we have a valid date (time can have a default)
    if (date && time) {
      const combined = `${date}T${time}`;
      // Only call onChange if the combined value changed
      if (combined !== prevCombinedRef.current) {
        prevCombinedRef.current = combined;
        onChange(combined);
      }
    } else if (!date && prevCombinedRef.current) {
      // Clear the value if date is not selected
      prevCombinedRef.current = '';
      onChange('');
    }
    // Note: We intentionally exclude onChange and value from deps to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, time]);

  // Sync with external value changes
  useEffect(() => {
    if (value) {
      const newDate = value.split('T')[0];
      const newTime = value.split('T')[1] || '12:00';
      const shouldUpdateDate = newDate !== date;
      const shouldUpdateTime = newTime !== time;
      
      if (shouldUpdateDate || shouldUpdateTime) {
        isInternalUpdateRef.current = true;
        prevCombinedRef.current = value;
        if (shouldUpdateDate) setDate(newDate);
        if (shouldUpdateTime) setTime(newTime);
      }
    } else {
      // If value is cleared externally, clear our local state
      if (date || time !== '12:00') {
        isInternalUpdateRef.current = true;
        prevCombinedRef.current = '';
        if (date) setDate('');
        if (time !== '12:00') setTime('12:00');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Select date';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return '12:00 AM';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
    } catch {
      return '12:00 AM';
    }
  };

  const formatFullDateTime = () => {
    if (!date || !time) return 'Select date and time';
    return `${formatDisplayDate(date)} at ${formatDisplayTime(time)}`;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        {/* Date Picker */}
        <div className="relative">
          <label 
            htmlFor="date-picker-input"
            className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block"
          >
            Date
          </label>
          <div className="relative">
            <input
              id="date-picker-input"
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
              }}
              min={minDate}
              required={required}
              name="scheduled-date"
              className="w-full bg-black border border-[var(--border-color)] p-3 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors font-montserrat cursor-pointer"
              style={{ 
                fontSize: '16px',
                colorScheme: 'dark',
              }}
            />
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
            >
              <Calendar className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Time Picker */}
        <div className="relative">
          <label 
            htmlFor="time-picker-input"
            className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block"
          >
            Time
          </label>
          <div className="relative">
            <input
              id="time-picker-input"
              ref={timeInputRef}
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
              }}
              min={date === minDate ? minTime : undefined}
              required={required && !!date}
              disabled={!date}
              name="scheduled-time"
              className={`w-full bg-black border border-[var(--border-color)] p-3 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors font-montserrat ${
                date ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
              style={{ 
                fontSize: '16px',
                colorScheme: 'dark',
              }}
            />
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10 ${
                !date ? 'opacity-50' : ''
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Display full date/time summary */}
      {date && time && (
        <div className="mt-2 p-2 bg-[var(--rich-black)] border border-[var(--border-color)] rounded">
          <p className="text-xs text-gray-400">
            Scheduled: <span className="text-white font-semibold">{formatFullDateTime()}</span>
          </p>
        </div>
      )}

    </div>
  );
}
