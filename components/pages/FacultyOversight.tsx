
import React from 'react';
import { Event, Club } from '../../types';
import { Clock, Check, X, ShieldCheck, Zap, AlertCircle, Calendar } from 'lucide-react';

interface Props {
  events: Event[];
  clubs: Club[];
  onApprove: (id: string) => void;
}

const FacultyOversight: React.FC<Props> = ({ events, clubs, onApprove }) => {
  const pending = events.filter(e => e.status === 'Pending');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight">Institutional Approvals</h1>
        <p className="text-[#A3AED0] font-medium text-lg italic">Strategic oversight and verification of proposed campus pulses.</p>
      </header>

      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock size={20} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-[0.2em] opacity-60">Pending Ledger Review ({pending.length})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pending.length === 0 ? (
            <div className="col-span-2 p-24 bg-[#111C44] border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-4">
              <ShieldCheck size={48} className="mx-auto text-[#A3AED0] opacity-20" />
              <p className="text-xl font-black opacity-30 uppercase tracking-widest">Protocol Clear: No pending items for review.</p>
            </div>
          ) : (
            pending.map(e => {
              const club = clubs.find(c => c.id === e.clubId);
              return (
                <div key={e.id} className="bg-[#111C44] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all">
                    <Zap size={100} style={{ color: club?.themeColor || 'var(--primary)' }} />
                  </div>

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg" style={{ backgroundColor: club?.themeColor || 'var(--primary)' }}>
                        {club?.name[0]}
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]">Origin Council</span>
                        <h4 className="font-bold text-white">{club?.name}</h4>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
                      Proposed for {e.date}
                    </span>
                  </div>

                  <div className="space-y-4 mb-10 relative z-10">
                    <h3 className="text-3xl font-black tracking-tighter text-white leading-tight">{e.title}</h3>
                    <p className="text-[#A3AED0] text-sm font-medium leading-relaxed italic line-clamp-3">"{e.description}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Financial Model</p>
                      <p className="font-bold text-white flex items-center gap-2">
                        {e.type === 'Paid' ? `₹${e.fee} Entry` : 'Complimentary Entry'}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Impact Radius</p>
                      <p className="font-bold text-white">Campus Wide</p>
                    </div>
                  </div>

                  <div className="flex gap-4 relative z-10">
                    <button 
                      onClick={() => onApprove(e.id)} 
                      className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95"
                    >
                      <Check size={20}/> Authenticate & Launch
                    </button>
                    <button className="p-5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                      <X size={24}/>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="p-8 rounded-[2.5rem] border border-white/5 bg-primary/5 flex items-start gap-6">
        <AlertCircle className="text-primary mt-1" size={24} />
        <div>
          <h4 className="font-black text-sm uppercase tracking-widest text-primary mb-2">Institutional Protocol Notice</h4>
          <p className="text-xs text-[#A3AED0] font-medium leading-relaxed max-w-2xl">
            As a faculty coordinator, your digital signature on event proposals triggers the automated ticketing ledger and opens recruitment pipelines. Ensure all proposals align with the Madhav Institute code of conduct before authentication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FacultyOversight;
