
import React, { useState, useEffect } from 'react';
import { Registration, Event, Club, Quotation, PaymentGatewayConfig } from '../../types';
import { db } from '../../db';
import { 
  Plus, 
  Globe, 
  Check, 
  X, 
  ShieldCheck, 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  QrCode, 
  Upload, 
  FileText, 
  Clock, 
  CheckCircle2, 
  DollarSign,
  Briefcase,
  CreditCard,
  Settings,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';

interface Props {
  club: Club;
  registrations: Registration[];
  events: Event[];
  onApprovePayment: (id: string) => void;
  onUpdateQuotes: (quotes: Quotation[]) => void;
  onUpdateQr: (url: string) => void;
  isDarkMode: boolean;
  isFaculty?: boolean;
}

const ClubFinance: React.FC<Props> = ({ 
  club, 
  registrations, 
  events, 
  onApprovePayment, 
  onUpdateQuotes, 
  onUpdateQr,
  isDarkMode,
  isFaculty = false
}) => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [newQuote, setNewQuote] = useState({ title: '', vendor: '', amount: 0, desc: '' });
  
  // Payment Gateway Config State
  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig>(
    club.paymentGatewayConfig || { provider: 'ManualUPI', isActive: true, apiKey: '', secretKey: '', merchantId: '' }
  );
  const [showSecrets, setShowSecrets] = useState(false);
  const [isGatewaySaving, setIsGatewaySaving] = useState(false);

  // Filter for Paid registrations related to this club
  const financeRegs = registrations.filter(r => r.paymentType === 'UPI' || r.paymentType === 'Gateway');
  
  const totalRevenue = financeRegs
    .filter(r => r.status === 'Approved')
    .reduce((acc, r) => {
        const eventFee = events.find(e => e.id === r.eventId)?.fee || 0;
        return acc + eventFee;
    }, 0);

  const pendingAmount = financeRegs
    .filter(r => r.status === 'Pending')
    .reduce((acc, r) => {
        const eventFee = events.find(e => e.id === r.eventId)?.fee || 0;
        return acc + eventFee;
    }, 0);

  const handleAddQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const quote: Quotation = {
      id: `q-${Date.now()}`,
      title: newQuote.title,
      vendorName: newQuote.vendor,
      amount: Number(newQuote.amount),
      description: newQuote.desc,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };
    onUpdateQuotes([...(club.quotations || []), quote]);
    setIsQuoteModalOpen(false);
    setNewQuote({ title: '', vendor: '', amount: 0, desc: '' });
  };

  const handleApproveQuotation = (id: string) => {
    const updated = (club.quotations || []).map(q => q.id === id ? { ...q, status: 'Approved' as const } : q);
    onUpdateQuotes(updated);
  };

  const handleRejectQuotation = (id: string) => {
    const updated = (club.quotations || []).map(q => q.id === id ? { ...q, status: 'Rejected' as const } : q);
    onUpdateQuotes(updated);
  };

  const handleQrUpload = () => {
    const url = prompt("Enter Direct UPI QR Asset URL (HTTPS recommend):", club.defaultUpiQrUrl || '');
    if (url) onUpdateQr(url);
  };

  const handleSaveGatewayConfig = async () => {
    setIsGatewaySaving(true);
    // Persist to DB via db.updateClub which should handle partial updates in real app, but here we update the whole club object via prop or direct call if available.
    // Assuming onUpdateQr updates a part of club, we really need a full update method or reuse existing patterns.
    // The prompt says "Club Admin or Treasurer is allowed to change API key".
    // We will use db.updateClub directly or assume onUpdateQr implies a generic update callback if we refactor, but strict to props, we might need a new prop or reuse.
    // For now, I'll use db.updateClub directly as it is imported.
    try {
        await db.updateClub({
            ...club,
            paymentGatewayConfig: gatewayConfig
        });
        alert("Payment Infrastructure Updated Successfully.");
    } catch (e) {
        alert("Failed to update payment settings.");
    }
    setIsGatewaySaving(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Finance & Treasury</h1>
          <p className="text-slate-500 font-semibold mt-2 italic">Institutional Ledger • Secure Transaction Verification</p>
         </div>
         <div className="flex gap-4">
            <button 
              onClick={handleQrUpload}
              className="bg-[#111C44] border border-white/5 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-[#1B254B] transition-all"
            >
              <QrCode size={18} /> Manage Payment QR
            </button>
            <button 
              onClick={() => setIsQuoteModalOpen(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-500/20 flex items-center gap-3 hover:scale-105 transition-all"
            >
              <Plus size={18} /> New Quotation
            </button>
         </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`p-10 rounded-[3rem] border bg-[#111C44] border-white/5 relative overflow-hidden group`}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Wallet size={24}/></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]">Verified Revenue</span>
            </div>
            <p className="text-5xl font-black text-white tracking-tighter">₹{totalRevenue}</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1 uppercase tracking-widest"><TrendingUp size={12}/> Net Verified Credits</p>
        </div>

        <div className={`p-10 rounded-[3rem] border bg-[#111C44] border-white/5 relative overflow-hidden group`}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl"><Clock size={24}/></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]">Pending Verification</span>
            </div>
            <p className="text-5xl font-black text-white tracking-tighter">₹{pendingAmount}</p>
            <p className="text-[10px] font-bold text-amber-500 mt-2 uppercase tracking-widest">Manual Audit Required</p>
        </div>

        <div className={`p-10 rounded-[3rem] border bg-[#111C44] border-white/5 relative overflow-hidden group`}>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><DollarSign size={24}/></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]">Approved Budget Requests</span>
            </div>
            <p className="text-5xl font-black text-white tracking-tighter">
              ₹{(club.quotations || []).filter(q => q.status === 'Approved').reduce((a, b) => a + b.amount, 0)}
            </p>
            <p className="text-[10px] font-bold text-blue-400 mt-2 uppercase tracking-widest">Procurement Capacity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Transaction Ledger */}
        <div className={`xl:col-span-2 rounded-[3.5rem] border bg-[#111C44] border-white/5 overflow-hidden shadow-2xl`}>
          <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-black text-white uppercase tracking-widest opacity-60">Payment Ledger</h3>
              <span className="bg-amber-500/10 text-amber-500 px-4 py-1.5 rounded-full text-[10px] font-black border border-amber-500/20">AWAITING AUDIT: {financeRegs.filter(r => r.status === 'Pending').length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3AED0] opacity-40">
                  <th className="px-10 py-8">Identity Ledger</th>
                  <th className="px-10 py-8">Event Narrative</th>
                  <th className="px-10 py-8">Financial Proof</th>
                  <th className="px-10 py-8 text-right">Verification Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {financeRegs.length === 0 ? (
                  <tr><td colSpan={4} className="px-10 py-24 text-center opacity-30 font-black uppercase tracking-widest text-xs">No manual transactions in registry.</td></tr>
                ) : (
                  financeRegs.map(reg => {
                    const event = events.find(e => e.id === reg.eventId);
                    return (
                    <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-10 py-8">
                        <p className="font-black text-lg text-white">{reg.studentName}</p>
                        <p className="text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest">{reg.studentRoll}</p>
                      </td>
                      <td className="px-10 py-8">
                        <p className="font-bold text-sm text-white">{event?.title}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">₹{event?.fee}</p>
                      </td>
                      <td className="px-10 py-8">
                        {reg.paymentType === 'Gateway' ? (
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">Automated Gateway</span>
                        ) : (
                            <button onClick={() => window.open(reg.paymentProofUrl)} className="flex items-center gap-2 text-[10px] font-black text-blue-400 bg-blue-500/10 px-5 py-2.5 rounded-2xl border border-blue-500/20 hover:bg-blue-500/20 transition-all">
                                <Globe size={14}/> Open Proof
                            </button>
                        )}
                      </td>
                      <td className="px-10 py-8 text-right">
                        {reg.status === 'Pending' ? (
                          <div className="flex gap-3 justify-end">
                            <button onClick={() => onApprovePayment(reg.id)} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><Check size={20}/></button>
                            <button className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><X size={20}/></button>
                          </div>
                        ) : (
                          <div className="text-emerald-500 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest justify-end bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10 inline-flex">
                             <ShieldCheck size={16} /> Verified
                          </div>
                        )}
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Payment Gateway Configuration */}
          <div className="p-10 rounded-[3.5rem] border bg-[#111C44] border-white/5 shadow-2xl space-y-6">
             <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h3 className="text-lg font-black text-white uppercase tracking-widest opacity-60 flex items-center gap-3">
                   <CreditCard size={20} className="text-primary" /> Gateway Settings
                </h3>
             </div>
             
             <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0] mb-2 block">Payment Provider</label>
                    <select 
                        value={gatewayConfig.provider} 
                        onChange={(e) => setGatewayConfig({...gatewayConfig, provider: e.target.value as any})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-primary"
                    >
                        <option value="ManualUPI">Manual UPI (Default)</option>
                        <option value="Razorpay">Razorpay</option>
                        <option value="Stripe">Stripe</option>
                        <option value="PhonePe">PhonePe Business</option>
                    </select>
                </div>

                {gatewayConfig.provider !== 'ManualUPI' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0] mb-2 block">Public / API Key</label>
                            <input 
                                type="text"
                                value={gatewayConfig.apiKey || ''}
                                onChange={(e) => setGatewayConfig({...gatewayConfig, apiKey: e.target.value})}
                                placeholder="rzp_test_..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-xs outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0] mb-2 flex justify-between">
                                Secret Key 
                                <button type="button" onClick={() => setShowSecrets(!showSecrets)} className="text-primary hover:underline">{showSecrets ? 'Hide' : 'Show'}</button>
                            </label>
                            <div className="relative">
                                <input 
                                    type={showSecrets ? "text" : "password"}
                                    value={gatewayConfig.secretKey || ''}
                                    onChange={(e) => setGatewayConfig({...gatewayConfig, secretKey: e.target.value})}
                                    placeholder="Secret..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-mono text-xs outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${gatewayConfig.isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${gatewayConfig.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <input type="checkbox" checked={gatewayConfig.isActive} onChange={(e) => setGatewayConfig({...gatewayConfig, isActive: e.target.checked})} className="hidden" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Enable Gateway</span>
                    </label>
                    
                    <button 
                        onClick={handleSaveGatewayConfig}
                        disabled={isGatewaySaving}
                        className="p-3 bg-primary text-white rounded-xl shadow-lg hover:bg-primary-hover transition-all disabled:opacity-50"
                    >
                        <Save size={18} />
                    </button>
                </div>
             </div>
          </div>

          {/* Quotation & Procurement Sidepanel */}
          <div className={`p-10 rounded-[3.5rem] border bg-[#111C44] border-white/5 shadow-2xl`}>
             <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <h3 className="text-lg font-black text-white uppercase tracking-widest opacity-60 flex items-center gap-3">
                   <Briefcase size={20} className="text-primary" /> Procurement
                </h3>
             </div>
             <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {(club.quotations || []).length === 0 ? (
                  <div className="text-center py-12 opacity-20 space-y-4">
                     <FileText size={48} className="mx-auto" />
                     <p className="text-[10px] font-black uppercase tracking-widest">No active quotations</p>
                  </div>
                ) : (
                  (club.quotations || []).map(quote => (
                    <div key={quote.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-4 group">
                       <div className="flex justify-between items-start">
                          <div>
                             <h4 className="font-black text-white text-lg tracking-tight group-hover:text-primary transition-colors">{quote.title}</h4>
                             <p className="text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest">{quote.vendorName} • {quote.date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${
                            quote.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            quote.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {quote.status}
                          </span>
                       </div>
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Requested Sum</p>
                             <p className="text-2xl font-black text-white">₹{quote.amount}</p>
                          </div>
                          {isFaculty && quote.status === 'Pending' && (
                             <div className="flex gap-2">
                                <button onClick={() => handleApproveQuotation(quote.id)} className="p-2 bg-emerald-600 text-white rounded-lg hover:scale-110 transition-transform"><Check size={16}/></button>
                                <button onClick={() => handleRejectQuotation(quote.id)} className="p-2 bg-rose-600 text-white rounded-lg hover:scale-110 transition-transform"><X size={16}/></button>
                             </div>
                          )}
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>

          <div className="p-8 rounded-[3rem] bg-primary/10 border border-primary/20 flex items-start gap-5">
             <AlertCircle size={24} className="text-primary shrink-0" />
             <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Financial Protocol</h4>
                <p className="text-[11px] text-[#A3AED0] font-medium leading-relaxed italic">All manual UPI payments must match the transaction IDs in the institutional bank feed. Quotations over ₹5,000 require Secondary Faculty Oversight.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Quotation Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className={`max-w-xl w-full p-12 rounded-[4rem] border border-white/10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-500 bg-[#0F172A]`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-white">Draft Quotation</h2>
                <p className="text-slate-500 text-sm mt-1">Submit a financial request for institutional approval.</p>
              </div>
              <button onClick={() => setIsQuoteModalOpen(false)} className="p-4 bg-white/5 rounded-2xl text-white hover:bg-rose-500 transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddQuotation} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]/40 ml-4">Purchase Intent</label>
                  <input required value={newQuote.title} onChange={e => setNewQuote({...newQuote, title: e.target.value})} placeholder="Ex: Hackathon Merch / Cloud Credits" className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] outline-none focus:border-primary text-white font-bold" />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]/40 ml-4">Vendor Node</label>
                    <input required value={newQuote.vendor} onChange={e => setNewQuote({...newQuote, vendor: e.target.value})} placeholder="Company Name" className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] outline-none focus:border-primary text-white font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]/40 ml-4">Amount (₹)</label>
                    <input required type="number" value={newQuote.amount} onChange={e => setNewQuote({...newQuote, amount: Number(e.target.value)})} placeholder="4999" className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] outline-none focus:border-primary text-white font-black" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#A3AED0]/40 ml-4">Narrative & Justification</label>
                  <textarea required value={newQuote.desc} onChange={e => setNewQuote({...newQuote, desc: e.target.value})} rows={3} placeholder="Detailed breakdown of expenses..." className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] outline-none focus:border-primary text-white font-medium text-sm leading-relaxed" />
               </div>
               <button className="w-full py-6 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all">
                  Initialize Approval Pipeline
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubFinance;
