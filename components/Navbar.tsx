
import React, { useState, useEffect, useRef } from 'react';
import { User, Club, Notification } from '../types';
import { Bell, Menu, Search, ChevronDown, Command, LogOut, User as UserIcon, Settings, Zap, Sun, Moon } from 'lucide-react';
import { db } from '../db';

interface NavbarProps {
  user: User;
  clubs: Club[];
  activeContext: string;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onToggleMobileMenu: () => void;
  onGoHome?: () => void;
  onOpenProfile?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, clubs, activeContext, onLogout, isDarkMode, onToggleTheme, onToggleMobileMenu, onGoHome, onOpenProfile 
}) => {
  const currentClub = clubs.find(c => c.id === activeContext);
  const contextName = activeContext === 'Global' ? 'Dashboard' : (currentClub?.name || 'Club');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifs = async () => {
        const notifs = await db.getNotifications();
        setNotifications(notifs);
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className={`h-16 md:h-24 px-6 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-all ${
        isDarkMode ? 'bg-[#02040a]/80 backdrop-blur-xl border-b border-white/5 md:border-none' : 'bg-[#F4F7FE]/80 backdrop-blur-xl md:border-none'
    }`}>
      
      {/* Mobile Logo / Breadcrumb Context */}
      <div className="flex items-center gap-3 md:hidden">
         <div className="w-8 h-8 rounded-lg bg-[#0099FF] flex items-center justify-center text-white">
            <Zap size={18} className="fill-white" />
         </div>
         <div>
            <h2 className={`text-lg font-bold tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>CCMS</h2>
            <p className="text-[9px] font-medium text-[#A3AED0]">{contextName}</p>
         </div>
      </div>

      {/* Desktop Breadcrumb */}
      <div className="hidden md:flex flex-col justify-center">
        <p className="text-[10px] font-medium text-[#A3AED0]">Pages / {contextName}</p>
        <h2 className={`text-3xl font-bold tracking-tight mt-1 ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>
            {activeContext === 'Global' ? 'Main Dashboard' : contextName}
        </h2>
      </div>

      <div className={`p-1.5 md:p-2.5 rounded-full md:rounded-[30px] flex items-center gap-2 md:gap-4 md:shadow-lg transition-all ${
          isDarkMode ? 'md:bg-[#0d121d] md:border border-white/5' : 'md:bg-white md:shadow-[0_18px_40px_rgba(112,144,176,0.12)]'
      }`}>
        
        {/* Search Bar */}
        <div className="relative hidden md:block">
            <div className={`flex items-center rounded-[30px] px-4 py-2.5 w-64 border focus-within:border-[#0099FF] transition-all ${
                isDarkMode ? 'bg-[#02040a] border-white/5' : 'bg-[#F4F7FE] border-transparent'
            }`}>
                <Search size={16} className={isDarkMode ? 'text-white' : 'text-[#1B2559]'} />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className={`bg-transparent border-none outline-none text-sm ml-3 w-full placeholder-[#A3AED0] font-medium ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}
                />
            </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className={`p-2 transition-colors relative ${isDarkMode ? 'text-white hover:text-blue-400' : 'text-[#A3AED0] hover:text-[#1B2559]'}`}
        >
           {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-2 text-[#A3AED0] transition-colors relative ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1B2559]'}`}
        >
            <Bell size={20} />
            {unreadCount > 0 && <span className={`absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border ${isDarkMode ? 'border-[#0d121d]' : 'border-white'}`} />}
        </button>

        {/* Profile Dropdown Trigger */}
        <div className="relative" ref={profileRef}>
            <div 
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold overflow-hidden border cursor-pointer hover:border-[#0099FF] transition-all ${
                    isDarkMode ? 'bg-[#1a202e] border-white/5 text-white' : 'bg-[#111C44] text-white border-transparent'
                }`}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
                {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : user.name[0]}
            </div>

            {isProfileOpen && (
                <div className={`absolute right-0 top-full mt-4 w-64 border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 ${
                    isDarkMode ? 'bg-[#0d121d] border-white/10' : 'bg-white border-slate-200'
                }`}>
                    <div className={`p-4 border-b mb-2 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                        <p className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{user.name}</p>
                        <p className="text-[10px] text-[#A3AED0] truncate">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded bg-[#0099FF]/10 text-[#0099FF] text-[9px] font-black uppercase tracking-widest border border-[#0099FF]/20">
                            {user.globalRole}
                        </span>
                    </div>
                    
                    <button 
                        onClick={() => {
                            if (onOpenProfile) onOpenProfile();
                            setIsProfileOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-bold ${
                            isDarkMode ? 'text-[#A3AED0] hover:bg-white/5 hover:text-white' : 'text-[#A3AED0] hover:bg-[#F4F7FE] hover:text-[#1B2559]'
                        }`}
                    >
                        <UserIcon size={16} /> My Profile
                    </button>
                    
                    <button 
                        onClick={() => {
                            if (onOpenProfile) onOpenProfile();
                            setIsProfileOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-bold ${
                            isDarkMode ? 'text-[#A3AED0] hover:bg-white/5 hover:text-white' : 'text-[#A3AED0] hover:bg-[#F4F7FE] hover:text-[#1B2559]'
                        }`}
                    >
                        <Settings size={16} /> Settings
                    </button>

                    <div className={`h-px my-2 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`} />
                    
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-500/10 text-rose-500 hover:text-rose-400 transition-all text-sm font-bold"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
