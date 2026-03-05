
import React, { useMemo, useState, useEffect } from 'react';
import { User, Event, Club, AuditLog, Registration, Applicant } from '../../types';
import { db } from '../../db';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  Wallet, 
  Users, 
  ArrowRight, 
  MoreHorizontal, 
  Clock, 
  Activity, 
  Zap, 
  Ticket, 
  Search, 
  Bell 
} from 'lucide-react';

interface Props {
  user: User;
  events: Event[];
  clubs: Club[];
  certCount: number;
  onRegister: (eventId: string) => void;
  isDarkMode: boolean;
  logs: AuditLog[];
  registrations: Registration[];
  applicants: Applicant[];
}

const GlobalStudentDashboard: React.FC<Props> = ({ 
  user, events, clubs, certCount, onRegister, isDarkMode, logs, registrations, applicants 
}) => {
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchSaved = async () => {
        const saved = await db.getSavedEvents(user.id);
        setSavedEventIds(saved.map(s => s.eventId));
    };
    fetchSaved();
  }, [user.id]);

  // Mock Data for "Sparkline" Cards
  const sparkData1 = [
    { val: 10 }, { val: 25 }, { val: 20 }, { val: 40 }, { val: 35 }, { val: 50 }, { val: 45 }, { val: 70 }
  ];
  const sparkData2 = [
    { val: 30 }, { val: 45 }, { val: 35 }, { val: 60 }, { val: 50 }, { val: 75 }, { val: 65 }, { val: 90 }
  ];
  const sparkData3 = [
    { val: 20 }, { val: 15 }, { val: 30 }, { val: 25 }, { val: 45 }, { val: 30 }, { val: 55 }, { val: 40 }
  ];

  const upcomingEvent = events.filter(e => new Date(e.date) > new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Helper for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="p-4 md:p-10 space-y-8 md:space-y-10 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h1 className={`text-2xl md:text-4xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>
                {getGreeting()}, {user.name.split(' ')[0]}
            </h1>
            <p className="text-[#A3AED0] font-medium flex items-center gap-2 text-sm md:text-base">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 
                System Operational • {clubs.length} Active Clubs
            </p>
        </div>
        <div className="flex gap-3">
            <button className={`p-4 rounded-2xl border shadow-lg transition-all ${isDarkMode ? 'bg-[#111C44] border-white/5 text-white hover:bg-white/5' : 'bg-white border-transparent text-[#A3AED0] hover:text-[#1B2559]'}`}>
                <Search size={20} />
            </button>
            <button className={`p-4 rounded-2xl border shadow-lg transition-all relative ${isDarkMode ? 'bg-[#111C44] border-white/5 text-white hover:bg-white/5' : 'bg-white border-transparent text-[#A3AED0] hover:text-[#1B2559]'}`}>
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
        </div>
      </div>

      {/* Asset Grid (Crypto Wallet Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Registrations */}
        <div className={`rounded-[2.5rem] p-6 md:p-8 border relative overflow-hidden group transition-all shadow-xl min-w-0 ${
            isDarkMode 
            ? 'bg-[#111C44] border-white/5 hover:border-[#0055FF]/50' 
            : 'bg-white border-transparent hover:shadow-2xl'
        }`}>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest mb-1">Active Passes</p>
                    <h3 className={`text-3xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{registrations.length}</h3>
                </div>
                <div className="p-3 rounded-2xl bg-[#0055FF]/10 text-[#0055FF]">
                    <Ticket size={24} />
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-24 opacity-30 group-hover:opacity-60 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData1}>
                        <defs><linearGradient id="colorSpark1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0055FF" stopOpacity={0.5}/><stop offset="100%" stopColor="#0055FF" stopOpacity={0}/></linearGradient></defs>
                        <Area type="monotone" dataKey="val" stroke="#0055FF" strokeWidth={3} fill="url(#colorSpark1)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Card 2: Certificates */}
        <div className={`rounded-[2.5rem] p-6 md:p-8 border relative overflow-hidden group transition-all shadow-xl min-w-0 ${
            isDarkMode 
            ? 'bg-[#111C44] border-white/5 hover:border-[#7551FF]/50' 
            : 'bg-white border-transparent hover:shadow-2xl'
        }`}>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest mb-1">Credentials</p>
                    <h3 className={`text-3xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{certCount}</h3>
                </div>
                <div className="p-3 rounded-2xl bg-[#7551FF]/10 text-[#7551FF]">
                    <Zap size={24} />
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-24 opacity-30 group-hover:opacity-60 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData2}>
                        <defs><linearGradient id="colorSpark2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7551FF" stopOpacity={0.5}/><stop offset="100%" stopColor="#7551FF" stopOpacity={0}/></linearGradient></defs>
                        <Area type="monotone" dataKey="val" stroke="#7551FF" strokeWidth={3} fill="url(#colorSpark2)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Card 3: Applications */}
        <div className={`rounded-[2.5rem] p-6 md:p-8 border relative overflow-hidden group transition-all shadow-xl min-w-0 ${
            isDarkMode 
            ? 'bg-[#111C44] border-white/5 hover:border-[#05CD99]/50' 
            : 'bg-white border-transparent hover:shadow-2xl'
        }`}>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest mb-1">Recruitments</p>
                    <h3 className={`text-3xl md:text-4xl font-black ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{applicants.length}</h3>
                </div>
                <div className="p-3 rounded-2xl bg-[#05CD99]/10 text-[#05CD99]">
                    <Activity size={24} />
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-24 opacity-30 group-hover:opacity-60 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData3}>
                        <defs><linearGradient id="colorSpark3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#05CD99" stopOpacity={0.5}/><stop offset="100%" stopColor="#05CD99" stopOpacity={0}/></linearGradient></defs>
                        <Area type="monotone" dataKey="val" stroke="#05CD99" strokeWidth={3} fill="url(#colorSpark3)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area: Upcoming & Live */}
        <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Your Schedule</h2>
                <button className="text-[10px] font-bold text-[#0099FF] hover:underline uppercase tracking-widest">View Calendar</button>
            </div>

            {upcomingEvent ? (
                <div className={`p-8 md:p-10 rounded-[3rem] border relative overflow-hidden group ${
                    isDarkMode ? 'bg-gradient-to-br from-[#111C44] to-[#0B1437] border-white/5' : 'bg-white border-transparent shadow-xl'
                }`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
                        <Calendar size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        <div className={`w-20 h-20 rounded-[1.5rem] flex flex-col items-center justify-center text-center shadow-lg ${
                            isDarkMode ? 'bg-[#1B2559] text-white' : 'bg-[#F4F7FE] text-[#1B2559]'
                        }`}>
                            <span className="text-xs font-bold uppercase text-[#0099FF]">{new Date(upcomingEvent.date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-3xl font-black">{new Date(upcomingEvent.date).getDate()}</span>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-lg bg-[#0099FF]/10 text-[#0099FF] text-[10px] font-black uppercase tracking-widest mb-2 border border-[#0099FF]/20">Next Up</span>
                                <h3 className={`text-3xl font-black leading-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{upcomingEvent.title}</h3>
                            </div>
                            <p className="text-sm font-medium text-[#A3AED0] line-clamp-2">{upcomingEvent.description}</p>
                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => <div key={i} className={`w-8 h-8 rounded-full border-2 ${isDarkMode ? 'border-[#111C44] bg-slate-700' : 'border-white bg-slate-200'}`} />)}
                                </div>
                                <span className="text-xs font-bold text-[#A3AED0]">+124 Going</span>
                            </div>
                        </div>
                        <button className="p-4 rounded-2xl bg-[#0099FF] text-white hover:bg-[#007ACC] hover:scale-110 transition-all shadow-lg shadow-[#0099FF]/30">
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className={`p-16 rounded-[3rem] border border-dashed text-center ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                    <Calendar size={48} className="mx-auto text-slate-500 mb-4" />
                    <p className="text-[#A3AED0] font-bold">No upcoming events scheduled.</p>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Ticket, label: 'My Tickets', color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { icon: CheckCircle2, label: 'Scan Entry', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { icon: Wallet, label: 'Add Funds', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { icon: MoreHorizontal, label: 'More', color: 'text-blue-500', bg: 'bg-blue-500/10' }
                ].map((action, i) => (
                    <button key={i} className={`p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all hover:scale-105 ${isDarkMode ? 'bg-[#111C44] hover:bg-[#1B2559]' : 'bg-white shadow-sm hover:shadow-md'}`}>
                        <div className={`p-3 rounded-xl ${action.bg} ${action.color}`}>
                            <action.icon size={20} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-[#1B2559]'}`}>{action.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Right Sidebar: Live Logs */}
        <div className={`rounded-[3rem] p-8 border h-[600px] flex flex-col ${isDarkMode ? 'bg-[#111C44] border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
            <div className="flex items-center justify-between mb-8">
                <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Live Activity</h3>
                <Activity size={18} className="text-[#0099FF] animate-pulse" />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {logs.length > 0 ? logs.slice(0, 10).map((log, i) => (
                    <div key={i} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full mt-2 ${i===0 ? 'bg-[#0099FF] animate-ping' : 'bg-slate-700'}`} />
                            <div className="w-px h-full bg-slate-800 my-1 group-last:hidden" />
                        </div>
                        <div className="pb-4">
                            <p className={`text-xs font-bold leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                <span className="text-[#0099FF]">{log.user}</span> {log.action}
                            </p>
                            <span className="text-[10px] font-medium text-slate-500 mt-1 block">{log.timestamp}</span>
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-[#A3AED0] text-xs py-10">System Quiet.</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default GlobalStudentDashboard;
