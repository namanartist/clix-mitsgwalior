
import React from 'react';
import { Registration, Applicant, Event, Club } from '../../types';
import { 
  CreditCard, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Search, 
  Filter,
  FileText,
  ExternalLink
} from 'lucide-react';

interface Props {
  registrations: Registration[];
  applicants: Applicant[];
  events: Event[];
  clubs: Club[];
  isDarkMode: boolean;
}

const MyPayments: React.FC<Props> = ({ registrations, applicants, events, clubs, isDarkMode }) => {
  // Combine event registrations and recruitment into a single ledger
  const eventPayments = registrations.filter(r => r.paymentType === 'UPI').map(reg => {
    const event = events.find(e => e.id === reg.eventId);
    const club = clubs.find(c => c.id === event?.clubId);
    return {
      id: reg.id,
      title: event?.title || 'Unknown Event',
      category: 'Event Registration',
      amount: event?.fee || 0,
      date: '2026-03-10', // Simulated date
      status: reg.status,
      proof: reg.paymentProofUrl,
      club: club?.name
    };
  });

  // Simulate recruitment processing fees for the demo
  const recruitmentPayments = applicants.map(app => ({
    id: `rec-${app.id}`,
    title: `Recruitment Fee: ${app.domain} Wing`,
    category: 'Recruitment Processing',
    amount: 50,
    date: '2026-02-28',
    status: 'Approved',
    proof: '#',
    club: 'Institutional'
  }));

  const allTransactions = [...eventPayments, ...recruitmentPayments].sort((a, b) => b.id.localeCompare(a.id));
  const totalSpent = allTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Financial Ledger</h1>
          <p className="text-slate-500 font-medium">Verified transaction history for MITS campus activities.</p>
        </div>
        <div className={`p-6 rounded-[2rem] border flex items-center gap-6 ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Contribution</p>
            <p className="text-2xl font-black">₹{totalSpent}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className={`w-full pl-12 pr-6 py-3 rounded-2xl border outline-none focus:border-blue-500 transition-all text-sm ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}
              />
            </div>
            <button className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              <Filter size={20} className="text-slate-400" />
            </button>
          </div>

          <div className={`rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100'}`}>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-800/50">
                  <th className="px-8 py-6">Activity Details</th>
                  <th className="px-8 py-6">Protocol</th>
                  <th className="px-8 py-6">Amount</th>
                  <th className="px-8 py-6 text-right">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {allTransactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-blue-600/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.category === 'Recruitment Processing' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          {tx.category === 'Recruitment Processing' ? <FileText size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{tx.title}</p>
                          <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">{tx.club} • {tx.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700">
                        UPI Verification
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-slate-100">₹{tx.amount}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                          tx.status === 'Approved' ? 'text-emerald-500' : 'text-amber-500'
                        }`}>
                          {tx.status === 'Approved' ? <CheckCircle2 size={14} /> : <Clock size={14} className="animate-pulse" />}
                          {tx.status}
                        </span>
                        <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 opacity-40">Wallet Summary</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <span className="text-[10px] font-black uppercase opacity-60">Verified Payments</span>
                <span className="text-xl font-black text-emerald-500">{allTransactions.filter(t => t.status === 'Approved').length}</span>
              </div>
              <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <span className="text-[10px] font-black uppercase opacity-60">Pending Audit</span>
                <span className="text-xl font-black text-amber-500">{allTransactions.filter(t => t.status === 'Pending').length}</span>
              </div>
            </div>
            <button className="w-full mt-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
              Add MITS Credit
            </button>
          </div>

          <div className={`p-8 rounded-[2.5rem] border flex items-center gap-4 ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100'}`}>
            <AlertCircle className="text-amber-500 shrink-0" size={24} />
            <p className="text-[10px] font-bold text-amber-500 leading-relaxed uppercase tracking-widest">
              Please allow 2-4 hours for manual verification of UPI transaction proofs by club treasurers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPayments;
