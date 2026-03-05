
import React from 'react';
import { LayoutDashboard, Calendar, Globe, Menu, Layers, Zap } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleMenu: () => void;
  isDarkMode: boolean;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, onToggleMenu, isDarkMode }) => {
  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 h-[5.5rem] pb-safe px-6 pt-2 border-t z-[40] flex justify-between items-start transition-all ${
      isDarkMode ? 'bg-[#02040a]/95 border-white/5 backdrop-blur-xl' : 'bg-white/95 border-slate-200 backdrop-blur-xl'
    }`}>
      <NavButton 
        icon={LayoutDashboard} 
        label="Home" 
        isActive={activeTab === 'dashboard' || activeTab === 'club-dashboard'} 
        onClick={() => setActiveTab('dashboard')} 
        isDarkMode={isDarkMode}
      />
      <NavButton 
        icon={Calendar} 
        label="Events" 
        isActive={activeTab === 'events' || activeTab === 'club-events'} 
        onClick={() => setActiveTab('events')} 
        isDarkMode={isDarkMode}
      />
      
      {/* Floating Action Button Style for Center */}
      <div className="-mt-6">
          <button 
            onClick={() => setActiveTab('clubs')}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-[#0055FF]/30 transition-transform active:scale-95 ${
                activeTab === 'clubs' ? 'bg-white text-[#0055FF] border-4 border-[#0055FF]' : 'bg-[#0055FF] text-white border-4 border-[#02040a]'
            }`}
          >
            <Globe size={24} />
          </button>
      </div>

      <NavButton 
        icon={Layers} 
        label="Apps" 
        isActive={['recruitment', 'certificates', 'tickets', 'payments'].includes(activeTab)} 
        onClick={() => setActiveTab('recruitment')} 
        isDarkMode={isDarkMode}
      />
      <button 
        onClick={onToggleMenu}
        className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-2xl transition-all active:scale-95 ${
            isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        <Menu size={22} />
        <span className="text-[9px] font-bold">Menu</span>
      </button>
    </div>
  );
};

const NavButton = ({ icon: Icon, label, isActive, onClick, isDarkMode }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-2xl transition-all active:scale-95 ${
      isActive 
        ? 'text-[#0055FF] bg-[#0055FF]/10' 
        : isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    <Icon size={22} className={isActive ? 'fill-current' : ''} />
    <span className="text-[9px] font-bold">{label}</span>
  </button>
);

export default MobileNav;
