
import React, { useMemo } from 'react';
import { Club, User, Event, Registration, Applicant, Role } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Users, Calendar, Wallet, PieChart as PieIcon, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  clubs: Club[];
  users: User[];
  events: Event[];
  registrations: Registration[];
  applicants: Applicant[];
  isDarkMode: boolean;
}

const GlobalAnalytics: React.FC<Props> = ({ clubs, users, events, registrations, applicants, isDarkMode }) => {
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // --- KPI Calculations ---
  const totalStudents = users.filter(u => u.globalRole === Role.STUDENT).length;
  const activeClubs = clubs.filter(c => !c.isFrozen).length;
  
  const totalRevenue = useMemo(() => {
    return registrations
      .filter(r => r.status === 'Approved')
      .reduce((acc, reg) => {
        const event = events.find(e => e.id === reg.eventId);
        return acc + (event?.fee || 0);
      }, 0);
  }, [registrations, events]);

  const recruitmentStats = useMemo(() => {
    const stages = ['Applied', 'Screening', 'Interview', 'Selected'];
    return stages.map(stage => ({
      name: stage,
      count: applicants.filter(a => a.stage === stage).length
    }));
  }, [applicants]);

  const clubCategoryStats = useMemo(() => {
    const categories = clubs.reduce((acc, club) => {
      acc[club.category] = (acc[club.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [clubs]);

  const eventParticipation = useMemo(() => {
    // Top 5 events by registration count
    const eventCounts = registrations.reduce((acc, reg) => {
      acc[reg.eventId] = (acc[reg.eventId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(eventCounts)
      .map(([eventId, count]) => {
        const event = events.find(e => e.id === eventId);
        return {
          name: event ? `${event.title.substring(0, 15)}...` : 'Unknown',
          Attendees: Number(count)
        };
      })
      .sort((a, b) => b.Attendees - a.Attendees)
      .slice(0, 5);
  }, [registrations, events]);

  const eventParticipationData = eventParticipation;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Global Analytics</h1>
          <p className="text-slate-500 font-medium">Real-time institutional metrics and data visualization.</p>
        </div>
        <div className={`px-6 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest flex items-center gap-3 ${
          isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          <Activity size={16} className="text-emerald-500" /> System Healthy
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
              <Users size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Students</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black tracking-tighter">{totalStudents}</h3>
            <span className="text-xs font-bold text-emerald-500 flex items-center mb-1"><ArrowUpRight size={12} /> +12%</span>
          </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
              <PieIcon size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Clubs</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black tracking-tighter">{activeClubs}</h3>
            <span className="text-xs font-bold text-slate-400 mb-1">/ {clubs.length} Total</span>
          </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <Wallet size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Est. Revenue</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black tracking-tighter">₹{totalRevenue.toLocaleString()}</h3>
            <span className="text-xs font-bold text-emerald-500 flex items-center mb-1"><ArrowUpRight size={12} /> +8%</span>
          </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Applicants</span>
          </div>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black tracking-tighter">{applicants.length}</h3>
            <span className="text-xs font-bold text-rose-500 flex items-center mb-1"><ArrowDownRight size={12} /> -2%</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <h3 className="text-lg font-black tracking-tight mb-8">Recruitment Funnel</h3>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recruitmentStats}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: isDarkMode ? '#fff' : '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="#2563eb" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <h3 className="text-lg font-black tracking-tight mb-8">Club Ecosystem Distribution</h3>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clubCategoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {clubCategoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   itemStyle={{ color: isDarkMode ? '#fff' : '#0f172a', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        <h3 className="text-lg font-black tracking-tight mb-8">Top Events by Participation</h3>
        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eventParticipationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} horizontal={false} />
              <XAxis type="number" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" width={150} stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                 contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 cursor={{ fill: isDarkMode ? '#334155' : '#f1f5f9' }}
              />
              <Bar dataKey="Attendees" fill="#10b981" radius={[0, 4, 4, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GlobalAnalytics;
