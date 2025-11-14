import React, { useState, useRef, useEffect } from 'react';
import { SearchCriteria } from '../../types';
import { LOCATIONS } from '../../constants';
import DatePicker from '../DatePicker';

interface HomePageProps {
  onSearch: (criteria: SearchCriteria) => void;
  loading: boolean;
}

const LocationIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 21l-4.95-6.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const CalendarIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
);

const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


const HomePage: React.FC<HomePageProps> = ({ onSearch, loading }) => {
  const [from, setFrom] = useState('Hubli');
  const [to, setTo] = useState('Bengaluru');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleDateChange = (newDate: Date) => {
    setDate(newDate.toLocaleDateString('en-CA'));
    setIsDatePickerOpen(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ from, to, date });
  };
  
  const [year, month, day] = date.split('-').map(Number);
  const selectedDateForPicker = new Date(year, month - 1, day);

  return (
    <div className="relative -mt-8 md:-mt-12">
      <div className="h-64 md:h-80 bg-cover bg-center rounded-lg shadow-lg" style={{ backgroundImage: `url(https://picsum.photos/seed/calmroad/1200/400)`}}>
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white text-center" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Track & Book Your Bus, Live!</h2>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto -mt-12 bg-white p-6 rounded-xl shadow-2xl border border-gray-200">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end">
          
          <div className="md:col-span-4">
            <label htmlFor="from" className="block text-sm font-medium text-slate-700">From</label>
            <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LocationIcon className="h-5 w-5 text-slate-400" />
                </div>
                <select id="from" value={from} onChange={(e) => setFrom(e.target.value)} required className="appearance-none bg-white text-slate-900 focus:ring-2 focus:ring-brand/50 focus:border-brand block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-3">
                    {LOCATIONS.sort().map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                </div>
            </div>
          </div>

          <div className="hidden md:flex justify-center items-center md:col-span-1 pt-6">
              <button type="button" onClick={handleSwap} className="p-2 rounded-full bg-slate-200 text-slate-600 hover:bg-brand hover:text-white transition-colors duration-200 border border-slate-300 hover:border-brand">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
              </button>
          </div>
          
          <div className="md:col-span-4">
            <label htmlFor="to" className="block text-sm font-medium text-slate-700">To</label>
            <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LocationIcon className="h-5 w-5 text-slate-400" />
                </div>
                <select id="to" value={to} onChange={(e) => setTo(e.target.value)} required className="appearance-none bg-white text-slate-900 focus:ring-2 focus:ring-brand/50 focus:border-brand block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-3">
                     {LOCATIONS.sort().map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                </div>
            </div>
          </div>

          <div className="md:col-span-4 relative" ref={datePickerRef}>
            <label htmlFor="date-button" className="block text-sm font-medium text-slate-700">Date of Journey</label>
             <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <CalendarIcon className="h-5 w-5 text-slate-400" />
                </div>
                <button
                    type="button"
                    id="date-button"
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="w-full bg-white text-slate-900 text-left focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand/50 block pl-10 sm:text-sm border-slate-300 rounded-md py-3"
                >
                    {selectedDateForPicker.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </button>
            </div>
            {isDatePickerOpen && (
              <DatePicker
                selectedDate={selectedDateForPicker}
                onChange={handleDateChange}
                onClose={() => setIsDatePickerOpen(false)}
              />
            )}
          </div>
          
          <div className="md:col-span-6 flex justify-center md:justify-start">
            <button type="submit" disabled={loading} className="w-full md:w-auto mt-4 md:mt-0 col-span-1 md:col-span-2 bg-brand-dark hover:bg-brand-dark/90 text-white font-bold py-3 px-12 rounded-lg transition-all duration-200 flex items-center justify-center disabled:bg-brand/50 shadow-md hover:shadow-lg hover:-translate-y-0.5 transform">
              {loading ? (
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Search Buses"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomePage;