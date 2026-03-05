
import React, { useMemo } from 'react';
import { Club, Event, Registration, Applicant } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Activity, Users, TrendingUp, Award, Calendar, Zap, Target } from 'lucide-react';

interface Props {
  clubs: Club[];
  events: Event[];
  registrations: Registration[];
  applicants: Applicant[];
}

const InstitutionalKPIs: React.FC<Props> = ({ clubs, events, registrations, applicants }) => {
  const engagementStats = useMemo(() => {
    // Participation by category
    const categories = ['Technical', 'Cultural', 'Social', 'Sports'];
    return categories.map(cat => {
      const clubIdsInCat = clubs.filter(c => c.category === cat).map(c => c.id);
      const totalRegs = registrations.filter(r => {
        const ev = events.find(e => e.id === r.eventId);
        return ev && clubIdsInCat.includes(ev.clubId);
      }).length;
      return { name: cat, Participation: totalRegs };
    });
  }, [clubs, events, registrations]);

  const recruitmentEfficiency = useMemo(() => {
      // Conversion from Applied to Selected
      const totalApplied = applicants.length;
      const totalSelected = applicants.filter(a => a.stage === 'Selected').length;
      const rate = totalApplied > 0 ? (totalSelected / totalApplied) * 100 : 0;
      return rate.toFixed(1);
  }, [applicants]);

  const eventSuccessRate = useMemo(() => {
      // Approved vs Proposed events
      const total = events.length;
      const approved = events.filter(e => e.status === 'Approved').length;
      return total > 0 ? (approved / total) * 100 : 0;
  }, [events]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight">Institutional KPIs</h1>
        <p className="text-[#A3AED0] font-medium text-lg italic">Data-driven insights into campus engagement and student leadership performance.</p>
      </header>

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-10 rounded-[3rem] bg-[#111C44] border border-white/5 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Activity size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]">Avg. Attendance Rate</span>
                </div>
                <h3 className="text-5xl font-black tracking-tighter text-white">84.2%</h3>
                <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp size={12}/> +4.2% from prev. semester</p>
            </div>
        </div>

        <div className="p-10 rounded-[3rem] bg-[#111C44] border border-white/5 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Target size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]">Recruitment Yield</span>
                </div>
                <h3 className="text-5xl font-black tracking-tighter text-white">{recruitmentEfficiency}%</h3>
                <p className="text-xs font-bold text-blue-500 mt-2 flex items-center gap-1"><Users size={12}/> High vetting standards maintained</p>
            </div>
        </div>

        <div className="p-10 rounded-[3rem] bg-[#111C44] border border-white/5 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <Award size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]">Credentials Issued</span>
                </div>
                <h3 className="text-5xl font-black tracking-tighter text-white">{registrations.filter(r => r.certificateId).length}</h3>
                <p className="text-xs font-bold text-purple-500 mt-2 flex items-center gap-1"><Zap size={12}/> Blockchain verified records</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Engagement Chart */}
          <div className="bg-[#111C44] p-10 rounded-[3.5rem] border border-white/5">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black tracking-tight text-white uppercase tracking-widest opacity-60 flex items-center gap-3">
                    <Users size={20} className="text-primary"/> Student Pulse by Wing
                </h3>
              </div>
              <div className="h-[350px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2B3674" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 11, fontWeight: 700}} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 11, fontWeight: 700}} />
                        <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            contentStyle={{ backgroundColor: '#0B1437', borderRadius: '20px', border: '1px solid #2B3674', boxShadow: 'none' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="Participation" radius={[12, 12, 0, 0]} barSize={40}>
                            {engagementStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#7551FF', '#3965FF', '#05CD99', '#FFAE1F'][index % 4]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* Growth Trend Area Chart */}
          <div className="bg-[#111C44] p-10 rounded-[3.5rem] border border-white/5">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black tracking-tight text-white uppercase tracking-widest opacity-60 flex items-center gap-3">
                    <Calendar size={20} className="text-primary"/> Engagement Continuity
                </h3>
              </div>
              <div className="h-[350px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                        { name: 'Jan', active: 400 },
                        { name: 'Feb', active: 650 },
                        { name: 'Mar', active: 580 },
                        { name: 'Apr', active: 900 },
                        { name: 'May', active: 750 },
                        { name: 'Jun', active: 1100 },
                    ]}>
                        <defs>
                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7551FF" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#7551FF" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2B3674" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 11, fontWeight: 700}} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3AED0', fontSize: 11, fontWeight: 700}} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0B1437', borderRadius: '20px', border: '1px solid #2B3674', boxShadow: 'none' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="active" stroke="#7551FF" strokeWidth={4} fillOpacity={1} fill="url(#colorActive)" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#111C44] flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Award size={28} />
              </div>
              <div>
                  <h4 className="font-black text-white text-lg tracking-tight">Meritocratic Ranking</h4>
                  <p className="text-xs text-[#A3AED0] font-medium leading-relaxed mt-1">C-Octane and GDSC remain the highest performing technical entities with 95% attendance verification.</p>
              </div>
          </div>
          <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#111C44] flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <Zap size={28} />
              </div>
              <div>
                  <h4 className="font-black text-white text-lg tracking-tight">Institutional Momentum</h4>
                  <p className="text-xs text-[#A3AED0] font-medium leading-relaxed mt-1">Cultural wing participation has seen a 22% spike following the deployment of digital ticketing.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default InstitutionalKPIs;
