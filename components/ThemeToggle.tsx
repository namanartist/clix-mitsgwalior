
import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface Props {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<Props> = ({ isDarkMode, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className={`fixed bottom-6 left-6 z-[999] p-4 rounded-2xl shadow-2xl transition-all duration-500 flex items-center gap-3 backdrop-blur-xl border border-white/10 group ${
        isDarkMode 
          ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 hover:scale-110' 
          : 'bg-white text-slate-900 hover:bg-slate-50 hover:scale-110'
      }`}
      aria-label="Toggle Theme"
    >
      <div className="relative w-6 h-6">
        <Sun 
          className={`absolute inset-0 transition-all duration-500 ${isDarkMode ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`} 
          size={24} 
        />
        <Moon 
          className={`absolute inset-0 transition-all duration-500 ${isDarkMode ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} 
          size={24} 
        />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block transition-all">
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
