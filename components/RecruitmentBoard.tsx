
import React, { useState } from 'react';
import { Applicant, ClubRole } from '../types';
import { 
  MoreVertical, 
  Search, 
  Filter, 
  UserPlus, 
  ChevronRight, 
  ChevronLeft, 
  Briefcase,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCcw
} from 'lucide-react';

interface RecruitmentBoardProps {
  applicants: Applicant[];
  onMove: (id: string, stage: Applicant['stage']) => void;
  onUpdateDomain: (id: string, domain: string) => void;
  onNewCycle?: () => void;
  onAIAnalyze?: (id: string) => void;
  clubRole: ClubRole | null;
  clubThemeColor: string;
}

const RecruitmentBoard: React.FC<RecruitmentBoardProps> = ({ 
  applicants, 
  onMove, 
  onUpdateDomain, 
  onNewCycle, 
  onAIAnalyze,
  clubRole, 
  clubThemeColor 
}) => {
  const stages: Applicant['stage'][] = ['Applied', 'Screening', 'Interview', 'Offer', 'Selected'];
  const domains = ['Tech', 'Management', 'Content', 'Social Media'];
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  
  const isPresident = clubRole === ClubRole.PRESIDENT;

  const toggleNotes = (id: string) => {
    const newSet = new Set(expandedNotes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedNotes(newSet);
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Recruitment Pipeline</h2>
          <p className="text-[#A3AED0] text-sm font-medium mt-1">Institutional Membership Flow • AI Assisted Screening</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3AED0]" size={16} />
            <input 
              type="text" 
              placeholder="Filter Roll No..." 
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-[#111C44] border border-white/10 text-white focus:border-primary transition-all text-sm w-64 outline-none shadow-sm"
            />
          </div>
          {isPresident && (
            <button 
              onClick={onNewCycle}
              className="px-6 py-2.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <RefreshCcw size={16} /> New Cycle
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 snap-x custom-scrollbar">
        {stages.map((stage) => (
          <div key={stage} className="min-w-[320px] snap-start">
            <div className="flex items-center justify-between mb-6 px-3">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3AED0]">{stage}</span>
                <span className="bg-[#111C44] text-primary text-[10px] px-2.5 py-1 rounded-full font-black border border-white/5">
                  {applicants.filter(a => a.stage === stage).length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {applicants.filter(a => a.stage === stage).map((applicant) => (
                <div key={applicant.id} className="bg-[#111C44] border border-white/5 p-6 rounded-[1.5rem] shadow-sm hover:shadow-xl transition-all group relative">
                  <div className="flex justify-between items-start mb-4">
                    <select 
                      value={applicant.domain}
                      onChange={(e) => onUpdateDomain(applicant.id, e.target.value)}
                      className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase cursor-pointer outline-none border-none ${
                        applicant.domain === 'Tech' ? 'bg-blue-500/10 text-blue-400' : 
                        applicant.domain === 'Management' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-purple-500/10 text-purple-400'
                      }`}
                    >
                      {domains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button 
                      onClick={() => onAIAnalyze?.(applicant.id)}
                      className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
                      title="Analyze with AI"
                    >
                      <Sparkles size={14} />
                    </button>
                  </div>

                  <h4 className="font-black text-white text-lg mb-1">{applicant.name}</h4>
                  <p className="text-[11px] text-[#A3AED0] mb-6 font-bold uppercase tracking-wider">{applicant.rollNumber} • {applicant.branch}</p>

                  <div className="bg-[#0B1437] rounded-2xl p-4 mb-4 border border-white/5">
                    <p className="text-[9px] text-[#A3AED0] font-black uppercase tracking-widest mb-2 opacity-50">Intent Statement</p>
                    <p className="text-xs text-white/80 font-medium italic line-clamp-3">"{applicant.whyJoin}"</p>
                  </div>

                  {applicant.notes && (
                    <div className="mb-4">
                      <button 
                        onClick={() => toggleNotes(applicant.id)}
                        className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest hover:text-primary-hover transition-colors"
                      >
                        {expandedNotes.has(applicant.id) ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                        {expandedNotes.has(applicant.id) ? 'Hide Backend Intel' : 'Show Backend Intel'}
                      </button>
                      {expandedNotes.has(applicant.id) && (
                        <div className="mt-2 bg-primary/5 p-3 rounded-xl border border-primary/10 animate-in fade-in slide-in-from-top-1">
                          <p className="text-[10px] text-primary/80 font-medium">{applicant.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <button 
                      onClick={() => {
                        const idx = stages.indexOf(stage);
                        if (idx > 0) onMove(applicant.id, stages[idx - 1]);
                      }}
                      disabled={stage === 'Applied'}
                      className="p-2 rounded-xl text-white/20 hover:text-white disabled:opacity-0"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        const idx = stages.indexOf(stage);
                        const nextStage = stages[idx + 1];
                        if (idx < stages.length - 1) onMove(applicant.id, nextStage);
                      }}
                      disabled={stage === 'Selected'}
                      className="p-2 rounded-xl text-primary hover:bg-primary/10 disabled:opacity-0"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruitmentBoard;
