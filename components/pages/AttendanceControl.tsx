
import React, { useState, useEffect } from 'react';
import { Registration } from '../../types';
import { 
  Camera, 
  UserCheck, 
  X, 
  CheckCircle2, 
  Clock, 
  ScanLine, 
  Search, 
  UserPlus, 
  Zap, 
  Fingerprint, 
  ShieldCheck, 
  Activity, 
  ToggleRight,
  ToggleLeft
} from 'lucide-react';
import { Html5QrcodeScanner } from "https://esm.sh/html5-qrcode";

interface Props {
  registrations: Registration[];
  onMark: (id: string, status: boolean) => void;
  onFinalize: () => void;
  isDarkMode?: boolean; 
}

const AttendanceControl: React.FC<Props> = ({ registrations, onMark, onFinalize, isDarkMode = true }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickMarkRoll, setQuickMarkRoll] = useState('');
  const [scanResult, setScanResult] = useState<{ msg: string, status: 'success' | 'error' } | null>(null);

  const filteredRegs = registrations.filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.studentRoll.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = registrations.filter(r => r.attendanceMarked).length;
  const percentage = registrations.length > 0 ? Math.round((presentCount / registrations.length) * 100) : 0;

  // Handle Scanner Logic
  useEffect(() => {
    let scanner: any;
    if (isScanning) {
        scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        scanner.render((decodedText: string) => {
            // Logic to find user by ticketId OR id
            const reg = registrations.find(r => r.ticketId === decodedText || r.id === decodedText);
            
            if (reg) {
                if (!reg.attendanceMarked) {
                    onMark(reg.id, true);
                    setScanResult({ msg: `Verified: ${reg.studentName}`, status: 'success' });
                    // Optional: Play sound here
                } else {
                    setScanResult({ msg: `${reg.studentName} is already present`, status: 'success' });
                }
            } else {
                setScanResult({ msg: `Invalid Credential: ${decodedText}`, status: 'error' });
            }
            
            // Auto clear message after 3 seconds
            setTimeout(() => setScanResult(null), 3000);
        }, (errorMessage: string) => {
            // Handle scan error (ignore generally for clean UI)
        });
    }

    return () => {
        if (scanner) {
            scanner.clear().catch((error: any) => console.error("Failed to clear scanner. ", error));
        }
    };
  }, [isScanning, registrations]);

  const handleQuickMark = (e: React.FormEvent) => {
    e.preventDefault();
    const reg = registrations.find(r => r.studentRoll.toUpperCase() === quickMarkRoll.toUpperCase());
    if (reg) {
      onMark(reg.id, true);
      setQuickMarkRoll('');
      setScanResult({ msg: `Manual Entry: ${reg.studentName}`, status: 'success' });
      setTimeout(() => setScanResult(null), 3000);
    } else {
      alert(`Identity Error: Roll Number "${quickMarkRoll}" is not found in the registration ledger for this event.`);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen flex flex-col space-y-10">
      
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
             <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-[#0055FF]/10 text-[#0055FF]' : 'bg-[#0055FF] text-white'}`}>
                <Fingerprint size={28} />
             </div>
             <h1 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Gatekeeper Protocol</h1>
          </div>
          <p className={`text-sm font-medium mt-1 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Real-time identity verification and venue access control.</p>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={onFinalize}
             className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-dashed hover:scale-105 transition-all flex items-center gap-2 ${isDarkMode ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-slate-300 text-slate-500 hover:text-black'}`}
           >
             <ShieldCheck size={16} /> Finalize Session
           </button>
           <button 
             onClick={() => setIsScanning(!isScanning)}
             className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 transition-all hover:scale-105 ${
               isScanning ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-[#0055FF] text-white shadow-[#0055FF]/30'
             }`}
           >
             {isScanning ? <><X size={16} /> Abort Scan</> : <><Camera size={16} /> Activate Scanner</>}
           </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
         
         {/* Left Panel: Stats & Controls */}
         <div className="space-y-8 lg:col-span-1">
            
            {/* Live Stats Card */}
            <div className={`p-8 rounded-[3rem] relative overflow-hidden ${isDarkMode ? 'bg-[#111C44] border border-white/5' : 'bg-white shadow-xl'}`}>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0055FF]/10 rounded-full blur-3xl" />
                
                <div className="flex justify-between items-start mb-10 relative z-10">
                   <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Occupancy</p>
                      <h3 className={`text-5xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{presentCount}<span className={`text-2xl text-slate-500`}>/{registrations.length}</span></h3>
                   </div>
                   <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                         <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className={`${isDarkMode ? 'text-slate-800' : 'text-slate-100'}`} />
                         <circle cx="32" cy="32" r="28" stroke="#0055FF" strokeWidth="4" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * percentage) / 100} className="transition-all duration-1000 ease-out" />
                      </svg>
                      <span className={`absolute text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{percentage}%</span>
                   </div>
                </div>

                <div className="space-y-4 relative z-10">
                   <div className={`p-4 rounded-2xl flex items-center justify-between ${isDarkMode ? 'bg-[#0B1437]' : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>System Online</span>
                      </div>
                      <Activity size={16} className="text-emerald-500" />
                   </div>
                </div>
            </div>

            {/* Quick Mark Card */}
            <div className={`p-8 rounded-[3rem] ${isDarkMode ? 'bg-[#111C44] border border-white/5' : 'bg-white shadow-xl'}`}>
                <h3 className={`text-lg font-black tracking-tight mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>
                   <Zap size={18} className="text-amber-500" /> Quick Entry
                </h3>
                <form onSubmit={handleQuickMark} className="flex gap-2">
                   <input 
                      value={quickMarkRoll}
                      onChange={(e) => setQuickMarkRoll(e.target.value.toUpperCase())}
                      placeholder="Roll No..." 
                      className={`flex-1 min-w-0 px-6 py-4 rounded-2xl text-sm font-bold outline-none uppercase tracking-widest transition-all ${
                         isDarkMode ? 'bg-[#0B1437] text-white focus:ring-2 focus:ring-[#0055FF]' : 'bg-slate-50 text-[#1B2559] focus:ring-2 focus:ring-[#0055FF]'
                      }`}
                   />
                   <button className="p-4 bg-[#0055FF] text-white rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-[#0055FF]/20">
                      <UserPlus size={20} />
                   </button>
                </form>
            </div>

            {/* Scanner Visual (Conditional) */}
            {isScanning && (
               <div className="rounded-[3rem] bg-black relative overflow-hidden border-4 border-[#0055FF] shadow-[0_0_50px_rgba(0,85,255,0.3)] flex flex-col items-center justify-center p-4">
                  <div id="reader" className="w-full h-full rounded-2xl overflow-hidden"></div>
                  {scanResult && (
                      <div className={`absolute bottom-8 left-8 right-8 p-4 rounded-xl font-bold text-center text-white ${scanResult.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                          {scanResult.msg}
                      </div>
                  )}
               </div>
            )}
         </div>

         {/* Right Panel: Roster List */}
         <div className={`lg:col-span-2 rounded-[3rem] border flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#111C44] border-white/5' : 'bg-white shadow-xl border-slate-100'}`}>
            <div className={`p-8 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
               <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Session Ledger</h3>
               <div className="relative w-64">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     placeholder="Filter identities..." 
                     className={`w-full pl-12 pr-4 py-3 rounded-xl text-xs font-bold outline-none transition-all ${
                        isDarkMode ? 'bg-[#0B1437] text-white focus:bg-[#050B20]' : 'bg-slate-50 text-[#1B2559] focus:bg-white border border-transparent focus:border-slate-200'
                     }`}
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
               {filteredRegs.map(reg => (
                  <div 
                     key={reg.id} 
                     className={`p-4 rounded-3xl flex items-center justify-between transition-all group ${
                        isDarkMode 
                        ? 'bg-[#0B1437] hover:bg-[#151E40]' 
                        : 'bg-slate-50 hover:bg-slate-100'
                     }`}
                  >
                     <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black transition-colors ${
                           reg.attendanceMarked 
                           ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                           : (isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-white border border-slate-200 text-slate-400')
                        }`}>
                           {reg.attendanceMarked ? <CheckCircle2 size={20} /> : reg.studentName[0]}
                        </div>
                        <div>
                           <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{reg.studentName}</h4>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{reg.studentRoll}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                           reg.attendanceMarked 
                           ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                           : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                           {reg.attendanceMarked ? 'Present' : 'Absent'}
                        </span>
                        
                        <div className="h-8 w-px bg-white/5 mx-2 hidden sm:block" />

                        <button 
                           onClick={() => onMark(reg.id, !reg.attendanceMarked)}
                           className={`p-3 rounded-xl transition-all ${
                              reg.attendanceMarked 
                              ? 'text-emerald-500 hover:bg-rose-500/10 hover:text-rose-500' 
                              : 'text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-500'
                           }`}
                        >
                           {reg.attendanceMarked ? <ToggleRight size={24} className="fill-current" /> : <ToggleLeft size={24} />}
                        </button>
                     </div>
                  </div>
               ))}
               {filteredRegs.length === 0 && (
                  <div className="py-20 text-center opacity-30">
                     <p className="text-xs font-black uppercase tracking-widest">No matching records found</p>
                  </div>
               )}
            </div>
         </div>

      </div>
    </div>
  );
};

export default AttendanceControl;
