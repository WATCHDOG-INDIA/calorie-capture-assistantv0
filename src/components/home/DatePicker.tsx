
import React from 'react';
import { format } from 'date-fns';
import { Check } from 'lucide-react';

interface DatePickerProps {
  weeklyCheckins: string[] | null;
}

const DatePicker: React.FC<DatePickerProps> = ({ weeklyCheckins }) => {
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const currentDay = today.getDay();

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between">
        {weekDays.map((day, index) => {
          const date = new Date();
          date.setDate(date.getDate() - currentDay + index);
          const isToday = index === currentDay;
          const isCheckedIn = weeklyCheckins?.includes(
            format(date, 'yyyy-MM-dd')
          );
          const isInStreak = index <= currentDay && isCheckedIn;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <span className="text-sm text-gray-500">{day}</span>
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full relative
                  ${isToday ? 'bg-black text-white dark:bg-white dark:text-black' : ''}
                  ${isInStreak ? 'bg-orange-500/20' : ''}
                `}
              >
                <span className="text-lg">
                  {format(date, 'dd')}
                </span>
                {isInStreak && (
                  <Check className="absolute w-4 h-4 text-orange-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;
