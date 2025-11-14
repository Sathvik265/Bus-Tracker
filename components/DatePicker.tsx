import React, { useState } from 'react';

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange, onClose }) => {
  const [displayDate, setDisplayDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
  const endOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);

  const startDay = startOfMonth.getDay();
  const date = startOfMonth;
  const dates: (Date | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    dates.push(null);
  }

  while (date <= endOfMonth) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  const handleDateClick = (date: Date | null) => {
    if (!date) return;
    const isPast = date < today;
    if (isPast) return;
    
    onChange(date);
    onClose();
  };

  const changeMonth = (amount: number) => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
  };
  
  return (
    <div className="absolute top-full mt-2 w-80 bg-white p-4 rounded-lg shadow-2xl z-20 animate-fade-in border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div className="font-bold text-lg text-gray-800">
          {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
        {daysOfWeek.map((day, i) => <div key={i}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dates.map((date, index) => {
          if (!date) return <div key={`empty-${index}`}></div>;
          
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === today.toDateString();
          const isPast = date < today;

          let classNames = 'w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-150 text-sm ';
          if (isPast) {
            classNames += 'text-gray-300 cursor-not-allowed';
          } else {
            classNames += 'cursor-pointer ';
            if (isSelected) {
              classNames += 'bg-brand-dark text-white font-bold';
            } else if (isToday) {
              classNames += 'ring-1 ring-brand text-brand';
            } else {
              classNames += 'hover:bg-gray-100 text-gray-700';
            }
          }
          
          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={classNames}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;