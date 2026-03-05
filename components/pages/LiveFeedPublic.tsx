
import React, { useEffect, useState } from 'react';
import { PublicLayout } from './PublicPages';
import { Event, AuditLog } from '../../types';
import { 
  Activity, 
  Clock, 
  Calendar, 
  Users, 
  Zap,
  Ticket,
  ArrowUpRight,
  Radio
} from 'lucide-react';

interface Props {
  events: Event[];
  logs: AuditLog[];
  onBack: () => void;
}

const LiveFeedPublic: React.FC<Props> = ({ events, logs, onBack }) => {
  const [tickerLogs, setTickerLogs] = useState<AuditLog[]>([]);

  // Simulate incoming logs for the "Live" feel
  useEffect(() => {
    setTickerLogs(logs.slice(0, 10));
    const interval = setInterval(() => {
       // In a real app, this would be a websocket subscription
       // For demo, we just shuffle or refresh
    }, 3000);
    return () => clearInterval(interval);
  }, [logs]);

  const activeEvents = events.filter(e => new Date(e.date) >= new Date()).slice(0, 4);

  return (
    <PublicLayout 
      title="Campus Pulse" 
      subtitle="Real-time telemetry of institutional activities and student engagement."
      icon={<Radio size={32} className="text-rose-500 animate-pulse" />}
      onBack={onBack}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        
        {/* Left: Activity Ticker */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
           <div className="p-8 rounded-[2.5rem] bg-[#111C44]/50 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Activity size={24} />
                    </div>
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-white">System Status: Online</h3>
                    <p className="text-xs text-slate-400 font-mono">Latency: 24ms • Uptime: 99.9%</p>
                 </div>
              </div>
              <div className="text-right hidden sm:block">
                 <p className="text-3xl font-black text-white">{events.length}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Nodes</p>
              </div>
           </div>

           <div className="flex-1 bg-[#02040a] border border-white/10 rounded-[2.5rem] p-8 overflow-hidden flex flex-col">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                 <Clock size={16} /> Transaction Ledger
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                 {tickerLogs.map((log, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-[#111C44]/30 border border-white/5 animate-in slide-in-from-right-4 fade-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                       <div className="mt-1">
                          <div className="w-2 h-2 rounded-full bg-[#0055FF]" />
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-bold text-white">{log.action}</p>
                          <div className="flex justify-between mt-1">
                             <span className="text-[10px] font-mono text-slate-500">{log.user}</span>
                             <span className="text-[10px] font-mono text-slate-600">{log.timestamp.split(',')[1]}</span>
                          </div>
                       </div>
                    </div>
                 ))}
                 {tickerLogs.length === 0 && (
                    <div className="text-center py-10 text-slate-600 font-mono text-xs">Waiting for incoming packets...</div>
                 )}
              </div>
           </div>
        </div>

        {/* Right: Trending Events */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
           <div className="flex-1 bg-[#111C44]/50 border border-white/10 rounded-[2.5rem] p-8 overflow-y-auto custom-scrollbar">
              <h3 className="text-sm font-black uppercase tracking-widest text-rose-500 mb-6 flex items-center gap-2">
                 <Zap size={16} /> Trending Events
              </h3>
              <div className="space-y-4">
                 {activeEvents.map(e => (
                    <div key={e.id} className="group p-5 rounded-[2rem] bg-[#02040a] border border-white/5 hover:border-rose-500/30 transition-all cursor-default">
                       <div className="flex justify-between items-start mb-3">
                          <span className="px-3 py-1 rounded-full bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-300 border border-white/10">
                             {e.type}
                          </span>
                          <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                             <Users size={12} /> {Math.floor(Math.random() * 200) + 50}
                          </span>
                       </div>
                       <h4 className="font-bold text-white leading-tight mb-2 group-hover:text-rose-500 transition-colors">{e.title}</h4>
                       <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                          <Calendar size={12} /> {e.date}
                       </div>
                    </div>
                 ))}
                 {activeEvents.length === 0 && (
                    <div className="text-center py-20 opacity-30">
                       <Calendar size={48} className="mx-auto mb-4" />
                       <p className="text-xs font-black uppercase tracking-widest">No scheduled pulses</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

      </div>
    </PublicLayout>
  );
};

export default LiveFeedPublic;
