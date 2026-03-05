
import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { Search, Filter, Clock, FileText, User, ShieldAlert, ShieldCheck, ChevronDown } from 'lucide-react';

interface Props {
  logs: AuditLog[];
  isDarkMode: boolean;
}

const SystemLogs: React.FC<Props> = ({ logs, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredLogs = logs
    .filter(log => 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Assuming timestamps are sortable strings or converting them might be needed if format varies
      return sortOrder === 'desc' 
        ? a.timestamp.localeCompare(b.timestamp) 
        : b.timestamp.localeCompare(a.timestamp);
    });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">System Audit Logs</h1>
          <p className="text-slate-500 font-medium">Immutable institutional record of all administrative actions.</p>
        </div>
        <div className={`px-6 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest flex items-center gap-3 ${
          isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          <ShieldCheck size={16} className="text-blue-500" /> Ledger Integrity Verified
        </div>
      </header>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="Search by User or Action..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className={`w-full pl-12 pr-6 py-4 rounded-3xl border outline-none focus:border-blue-500 transition-all text-sm font-bold ${
               isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-white border-slate-200'
             }`}
           />
        </div>
        <button 
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          className={`px-6 py-4 rounded-2xl border flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${
            isDarkMode ? 'bg-slate-800/30 border-slate-800 hover:text-white' : 'bg-slate-50 border-slate-100 hover:bg-white'
          }`}
        >
          <Clock size={16} /> {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      <div className={`rounded-[3rem] border overflow-hidden ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="max-h-[800px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left">
            <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-slate-900/95 backdrop-blur' : 'bg-slate-50/95 backdrop-blur'}`}>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-10 py-6">Timestamp</th>
                <th className="px-10 py-6">Actor</th>
                <th className="px-10 py-6">Event Description</th>
                <th className="px-10 py-6 text-right">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/10">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-600/5 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3 text-slate-500 font-mono text-xs">
                         <Clock size={14} /> {log.timestamp}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                            isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {log.user[0]}
                          </div>
                          <span className="font-bold text-sm">{log.user}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-3">
                          <FileText size={16} className="text-blue-500 opacity-50" />
                          <span className="font-medium text-sm">{log.action}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                       {log.clubId ? (
                         <span className="inline-block px-3 py-1 rounded-lg bg-slate-800/50 border border-slate-700 text-[9px] font-black uppercase tracking-widest text-slate-400">
                           {log.clubId}
                         </span>
                       ) : (
                         <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                           Global
                         </span>
                       )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={4} className="px-10 py-20 text-center opacity-30 font-black uppercase tracking-widest">
                     No audit logs found matching criteria.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
