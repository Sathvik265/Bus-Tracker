import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface HeaderProps {
  onNavigate: (view: 'HOME' | 'MY_BOOKINGS') => void;
  isLoggedIn: boolean;
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, isLoggedIn, user, onLoginClick, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-brand-dark border-b border-amber-800/20">
      <nav className="container mx-auto px-4 md:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => onNavigate('HOME')}>
          <div className="bg-white p-1 rounded-md shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-dark" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 6.5C19.5 5.39543 18.6046 4.5 17.5 4.5H6.5C5.39543 4.5 4.5 5.39543 4.5 6.5V17.5C4.5 18.6046 5.39543 19.5 6.5 19.5H17.5C18.6046 19.5 19.5 18.6046 19.5 17.5V6.5ZM3 6.5C3 4.567 4.567 3 6.5 3H17.5C19.433 3 21 4.567 21 6.5V17.5C21 19.433 19.433 21 21 17.5V6.5Z" />
              <path d="M8 12C8 11.4477 7.55228 11 7 11C6.44772 11 6 11.4477 6 12V15C6 15.5523 6.44772 16 7 16C7.55228 16 8 15.5523 8 15V12Z" />
              <path d="M18 12C18 11.4477 17.5523 11 17 11C16.4477 11 16 11.4477 16 12V15C16 15.5523 16.4477 16 17 16C17.5523 16 18 15.5523 18 15V12Z" />
              <path d="M11 6H13V8H11V6Z" />
            </svg>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            KSRTC Live
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onNavigate('MY_BOOKINGS')}
            className="text-white font-semibold hover:bg-black/10 rounded-md px-4 py-2 transition-colors duration-200"
          >
            My Bookings
          </button>
          {isLoggedIn && user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2">
                <img src={user.avatarUrl} alt="User Avatar" className="h-9 w-9 rounded-full border-2 border-white/80" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 animate-fade-in">
                  <div className="px-4 py-2 text-sm text-slate-700 border-b">
                    Signed in as <br/>
                    <strong className="font-semibold">{user.name}</strong>
                  </div>
                  <button
                    onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-white text-brand-dark font-bold py-2 px-5 rounded-lg hover:bg-gray-200 transition-all duration-200 shadow hover:shadow-md">
              Login
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
