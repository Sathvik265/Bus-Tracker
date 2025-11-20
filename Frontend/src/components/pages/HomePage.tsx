import React, { useState } from 'react';
import { SearchCriteria } from '../../types';
import { LOCATIONS } from '../../constants';

interface HomePageProps {
  onSearch: (criteria: SearchCriteria) => void;
  loading: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ onSearch, loading }) => {
  const [from, setFrom] = useState('Hubli');
  const [to, setTo] = useState('Bengaluru');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ from, to, date });
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-2">
            Book Your Bus Tickets
          </h2>
          <p className="text-center text-slate-500 mb-8">
            Reliable, Safe, and On-Time. Your trusted travel partner.
          </p>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            <div className="md:col-span-5 relative">
              <label className="block text-sm font-semibold text-slate-600 mb-1" htmlFor="from">From</label>
              <select 
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-brand focus:border-brand appearance-none bg-white text-black"
              >
                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-7">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="hidden md:flex md:col-span-1 items-center justify-center mt-7">
              <button type="button" onClick={handleSwap} className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
              </button>
            </div>

            <div className="md:col-span-5 relative">
              <label className="block text-sm font-semibold text-slate-600 mb-1" htmlFor="to">To</label>
              <select 
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-brand focus:border-brand appearance-none bg-white text-black"
              >
                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-7">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            
            <div className="md:col-span-4">
              <label className="block text-sm font-semibold text-slate-600 mb-1" htmlFor="date">Date</label>
              <input 
                type="date" 
                id="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-brand focus:border-brand bg-white text-black"
              />
            </div>

            <div className="md:col-span-8">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-danger hover:bg-danger-dark text-white font-bold py-3.5 px-4 rounded-lg transition duration-300 disabled:bg-slate-400 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : 'Search Buses'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
