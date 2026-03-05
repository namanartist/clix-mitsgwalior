
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Award, 
  Globe, 
  ShieldCheck, 
  FileText,
  Activity,
  CreditCard,
  ScanLine,
  Ticket,
  PieChart,
  Settings as SettingsIcon,
  Layout,
  UserPlus,
  GraduationCap,
  Briefcase,
  X,
  CheckCircle2,
  ChevronDown,
  Layers,
  MessageSquare,
  Zap,
  UserCog
} from 'lucide-react';
import { ClubRole, Role, User, Club } from '../types';

interface SidebarProps {
  user: User;
  clubs: Club[];
  activeContext: string;
  onContextChange: (id: string) => void;
  userRole: Role;
  clubRole: ClubRole | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSwitchRole?: (role: Role) => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  user, clubs, activeContext, onContextChange, userRole, clubRole, activeTab, setActiveTab, isOpen, onClose, isDarkMode
}) => {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = userRole === Role.SUPER_ADMIN;
  const isFaculty = userRole === Role.FACULTY;

  const currentClub = clubs.find(c => c.id === activeContext);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePerspectiveSelect = (id: string) => {
    onContextChange(id);
    setIsSwitcherOpen(false);
  };

  const menuItems: SidebarItem[] = [];

  if (activeContext === 'Global') {
    if (isSuperAdmin) {
      menuItems.push(
        { id: 'admin-dashboard', label: 'Admin Hub', icon: ShieldCheck },
        { id: 'chat', label: 'Comm. Center', icon: MessageSquare },
        { id: 'student-registry', label: 'Student Registry', icon: UserPlus },
        { id: 'faculty-registry', label: 'Faculty Registry', icon: GraduationCap },
        { id: 'clubs', label: 'Club Registry', icon: Globe },
        { id: 'analytics', label: 'Global Analytics', icon: PieChart },
        { id: 'global-audit', label: 'System Logs', icon: FileText }
      );
    } else if (isFaculty) {
      menuItems.push(
        { id: 'faculty-dashboard', label: 'Faculty Feed', icon: LayoutDashboard },
        { id: 'chat', label: 'Comm. Center', icon: MessageSquare },
        { id: 'approvals', label: 'Pending Approvals', icon: CheckCircle2 },
        { id: 'reports', label: 'Institutional KPIs', icon: Activity }
      );
    } else {
      menuItems.push(
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'chat', label: 'Messages', icon: MessageSquare },
        { id: 'clubs', label: 'Browse Clubs', icon: Globe },
        { id: 'recruitment', label: 'My Applications', icon: Activity },
        { id: 'events', label: 'Campus Events', icon: Calendar },
        { id: 'certificates', label: 'My Certificates', icon: Award },
        { id: 'tickets', label: 'My Tickets', icon: Ticket },
        { id: 'payments', label: 'Payments', icon: CreditCard }
      );
    }
  } else {
    menuItems.push(
      { id: 'club-dashboard', label: 'Club Hub', icon: LayoutDashboard },
      { id: 'chat', label: 'Club Chat', icon: MessageSquare },
      { id: 'members', label: 'Member Directory', icon: Users },
      { id: 'recruitment', label: 'Recruitment Panel', icon: Briefcase },
      { id: 'club-events', label: 'Event Manager', icon: Calendar },
      { id: 'club-finance', label: 'Finance & Treasury', icon: CreditCard },
      { id: 'attendance', label: 'Gate Control', icon: ScanLine },
      { id: 'certificates', label: 'Certification', icon: Award }
    );
    
    if (clubRole === ClubRole.PRESIDENT) {
      menuItems.push(
        { id: 'site-editor', label: 'Site Studio', icon: Layout },
        { id: 'club-settings', label: 'Club Settings', icon: SettingsIcon }
      );
    }

    menuItems.push({ id: 'website', label: 'Public Page', icon: Globe });
  }

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-72 flex flex-col
      transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 md:relative md:h-screen
      transition-all duration-300 ease-in-out
      ${isDarkMode ? 'bg-[#02040a] border-white/5' : 'bg-white border-slate-200'} border-r
    `}>
      {/* Header Logo */}
      <div className="px-8 pt-8 pb-4 flex items-center justify-between">
        <div className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>
            <Zap size={24} className="fill-[#0099FF] text-[#0099FF]" />
            <span className="text-2xl font-black tracking-tight">CCMS<span className="text-[#0099FF]">.IO</span></span>
        </div>
        <button onClick={onClose} className="md:hidden opacity-50 hover:opacity-100">
            <X size={24} className={isDarkMode ? 'text-white' : 'text-[#1B2559]'} />
        </button>
      </div>

      <div className="px-6 mb-2">
        <div className={`h-px bg-gradient-to-r from-transparent ${isDarkMode ? 'via-white/10' : 'via-slate-200'} to-transparent`} />
      </div>

      {/* Perspective Switcher */}
      <div className="px-6 py-4 relative" ref={switcherRef}>
        <button 
          onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
          className={`w-full p-4 rounded-[20px] transition-all flex items-center gap-4 group border ${
            isDarkMode 
              ? 'bg-[#0d121d] hover:bg-[#1a202e] border-white/5 text-white' 
              : 'bg-[#F4F7FE] hover:bg-slate-100 border-transparent text-[#1B2559]'
          } ${isSwitcherOpen ? 'ring-2 ring-[#0099FF]/50' : ''}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg transition-transform group-hover:scale-105`} style={{ backgroundColor: activeContext === 'Global' ? '#0099FF' : currentClub?.themeColor }}>
             {activeContext === 'Global' ? <Layers size={20} /> : currentClub?.name[0]}
          </div>
          <div className="flex-1 text-left min-w-0">
             <p className="text-[9px] font-bold uppercase tracking-widest text-[#A3AED0]">Perspective</p>
             <h3 className="text-sm font-bold truncate">{activeContext === 'Global' ? 'Global View' : currentClub?.name}</h3>
          </div>
          <ChevronDown size={16} className={`text-[#A3AED0] transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} />
        </button>

        {isSwitcherOpen && (
          <div className={`absolute left-6 right-6 top-full mt-2 z-[100] border rounded-[20px] shadow-2xl overflow-hidden p-2 ${
            isDarkMode ? 'bg-[#0d121d] border-white/10' : 'bg-white border-slate-200'
          }`}>
            <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
              <button 
                onClick={() => handlePerspectiveSelect('Global')} 
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-50 text-[#1B2559]'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#0099FF] flex items-center justify-center text-white"><Layers size={16} /></div>
                <span className="text-xs font-bold">Global View</span>
              </button>
              {user.clubMemberships.map((m) => {
                const c = clubs.find(cl => cl.id === m.clubId);
                if (!c) return null;
                return (
                  <button 
                    key={c.id} 
                    onClick={() => handlePerspectiveSelect(c.id)} 
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-50 text-[#1B2559]'}`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: c.themeColor }}>{c.name[0]}</div>
                    <span className="text-xs font-bold truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onClose(); }}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-[15px] transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-[#0099FF] text-white shadow-lg shadow-[#0099FF]/20' 
                  : isDarkMode 
                    ? 'text-[#A3AED0] hover:text-white hover:bg-white/5' 
                    : 'text-[#A3AED0] hover:text-[#1B2559] hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <Icon size={20} className={`${isActive ? 'text-white' : ''}`} />
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />}
            </button>
          );
        })}
      </div>
      
      {/* Bottom Profile */}
      <div className={`p-6 mt-auto border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0099FF] to-[#00E5FF] p-[2px]">
                <div className={`w-full h-full rounded-full overflow-hidden ${isDarkMode ? 'bg-[#02040a]' : 'bg-white'}`}>
                    {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center text-xs ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{user.name[0]}</div>}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{user.name}</p>
                <p className="text-[10px] font-bold text-[#A3AED0] truncate">{user.globalRole}</p>
            </div>
        </div>
        <button 
            onClick={() => { onContextChange('Global'); setActiveTab('profile'); onClose(); }}
            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                isDarkMode 
                ? 'bg-[#0d121d] text-white hover:bg-[#1a202e]' 
                : 'bg-[#F4F7FE] text-[#1B2559] hover:bg-slate-200'
            }`}
        >
            <UserCog size={14} /> Profile Settings
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
