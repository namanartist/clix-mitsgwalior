
import React from 'react';
import { Applicant, Club } from '../../types';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Sparkles,
  MapPin,
  Calendar,
  Zap,
  Loader2,
  Activity
} from 'lucide-react';

interface Props {
  applicants: Applicant[];
  clubs: Club[];
  userName: string;
  isDarkMode: boolean;
}

const MyApplications: React.FC<Props> = ({ applicants, clubs, userName, isDarkMode }) => {
  // Filter applications belonging to the current user
  const myApps = applicants.filter(a => a.name === userName);
  
  const stages: Applicant['stage'][] = ['Applied', 'Screening', 'Interview', 'Offer', 'Selected'];

  const getStageHint = (stage: Applicant['stage']) => {
    switch (stage) {
      case 'Applied': return "Identity logged in recruitment pipeline. Awaiting initial screening.";
      case 'Screening': return "Leadership is reviewing your intent statement and skills portfolio.";
      case 'Interview': return "Preparation phase: Technical/Cultural rounds are being scheduled.";
      case 'Offer': return "Congratulations! Your offer is currently being generated.";
      case 'Selected': return "Success! Welcome to the council. Final onboarding initiated.";
      case 'Rejected': return "Feedback cycle closed. Explore other opportunities in the registry.";
      default: return "Synchronizing status with the institutional mainframe...";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="space-y-1">
        <h1 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>Recruitment Track</h1>
        <p className="text-[#A3AED0] font-medium text-lg">Live status of your club memberships and professional applications.</p>
      </header>

      {myApps.length === 0 ? (
        <div className={`p-32 border-4 border-dashed rounded-[3rem] text-center space-y-6 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <Briefcase size={64} className="mx-auto text-slate-500 opacity-20" />
          <div className="space-y-2">
            <p className={`text-xl font-black opacity-40 uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>No Active Applications</p>
            <p className="text-[#A3AED0] max-w-md mx-auto">Browse the Club Registry to find organizations and start your journey as a student leader.</p>
          </div>
          <button className="px-8 py-4 bg-[#0099FF] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#0099FF]/30 hover:scale-105 transition-all">
            Explore Registry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {myApps.map((app) => {
            const currentStageIndex = stages.indexOf(app.stage);
            const isRejected = app.stage === 'Rejected';

            return (
              <div 
                key={app.id} 
                className={`p-10 rounded-[3rem] border relative overflow-hidden transition-all shadow-sm hover:shadow-xl ${
                    isDarkMode ? 'bg-[#111C44] border-slate-800' : 'bg-white border-slate-100'
                }`}
              >
                {/* Status Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-10 pointer-events-none ${
                  isRejected ? 'bg-rose-500' : 'bg-[#0099FF]'
                }`} />

                <div className="flex flex-col lg:flex-row justify-between gap-12 relative z-10">
                  <div className="space-y-6 lg:max-w-md">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#0099FF]/10 text-[#0099FF] flex items-center justify-center font-black text-xl">
                        {app.domain[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>{app.domain} Wing</h3>
                           <span className="bg-[#0099FF]/5 text-[#0099FF] text-[8px] font-black uppercase px-2 py-0.5 rounded border border-[#0099FF]/10">Cycle: {app.recruitmentCycle}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]">MITS Institutional Drive 2026</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm font-medium text-[#A3AED0]">
                        <MapPin size={16} className="text-[#0099FF]" /> SAC Ground Floor, New Block
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-[#A3AED0]">
                        <Calendar size={16} className="text-[#0099FF]" /> Applied on 14th Oct 2025
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-[#A3AED0]">
                        <Activity size={16} className="text-emerald-500" />
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Live Status Tracking Active
                        </span>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#0099FF]/5 border border-[#0099FF]/10 space-y-3">
                      <div className="flex items-center justify-between">
                         <p className="text-[10px] font-black uppercase tracking-widest text-[#0099FF] flex items-center gap-2">
                           <Sparkles size={12} /> Strategic Intent
                         </p>
                         <span className="text-[8px] font-bold opacity-30 text-[#0099FF]">V.1.0</span>
                      </div>
                      <p className={`text-sm font-medium italic opacity-70 leading-relaxed ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>"{app.whyJoin}"</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    {isRejected ? (
                      <div className="flex flex-col items-center text-center space-y-4 p-12 bg-rose-500/5 rounded-[2.5rem] border border-rose-500/10 animate-in fade-in zoom-in-95">
                        <AlertCircle size={48} className="text-rose-500" />
                        <h4 className="text-2xl font-black text-rose-500">Application Closed</h4>
                        <p className="text-[#A3AED0] text-sm max-w-xs font-medium">We appreciate your interest in the {app.domain} wing. Unfortunately, we aren't moving forward at this time.</p>
                        <button className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline">Download Detailed Feedback</button>
                      </div>
                    ) : (
                      <div className="space-y-12">
                        <div className="flex justify-between items-end mb-2 px-2">
                          <div className="space-y-1">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0099FF] flex items-center gap-2">
                               <Zap size={10} className="fill-[#0099FF]" /> Live Pipeline Stage
                             </h4>
                             <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>{app.stage}</p>
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[#A3AED0]">Next Sync</span>
                             <p className={`text-[10px] font-bold ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>24h Remaining</p>
                          </div>
                        </div>
                        
                        <div className="relative pt-4">
                          <div className="absolute top-[2.25rem] left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                          <div 
                            className="absolute top-[2.25rem] left-0 h-1 bg-[#0099FF] rounded-full transition-all duration-1000 shadow-[#0099FF]" 
                            style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                          />
                          
                          <div className="flex justify-between relative">
                            {stages.map((stage, i) => {
                              const isCompleted = i < currentStageIndex;
                              const isCurrent = i === currentStageIndex;
                              return (
                                <div key={stage} className="flex flex-col items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-500 ${
                                    isCompleted || isCurrent 
                                      ? 'bg-[#0099FF] text-white border-[#0099FF]' 
                                      : isDarkMode ? 'bg-[#111C44] border-slate-700 text-slate-500' : 'bg-white border-slate-100 text-slate-300'
                                  } ${isCurrent ? 'ring-4 ring-[#0099FF]/20 scale-110 shadow-lg' : ''}`}>
                                    {isCompleted ? <CheckCircle2 size={18} /> : (
                                      isCurrent ? <Loader2 size={18} className="animate-spin" /> : <span className="text-xs font-black">{i + 1}</span>
                                    )}
                                  </div>
                                  <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                                    isCompleted || isCurrent ? 'text-[#0099FF]' : 'opacity-20 text-[#A3AED0]'
                                  }`}>
                                    {stage}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className={`p-6 rounded-2xl border flex gap-4 items-start ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                           <div className="p-2 bg-[#0099FF]/10 rounded-lg text-[#0099FF]">
                              <Activity size={18} />
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[#A3AED0]">Strategic Hint</p>
                              <p className="text-xs font-medium text-[#A3AED0] leading-relaxed">
                                 {getStageHint(app.stage)}
                              </p>
                           </div>
                        </div>

                        <div className="flex justify-end pt-4">
                           <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#0099FF] hover:gap-4 transition-all group">
                             Review Submitted Application <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
