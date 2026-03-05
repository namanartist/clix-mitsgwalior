
import React, { useState, useRef } from 'react';
import { Event, Registration } from '../../types';
import { 
  Plus, Calendar, Tag, CreditCard, Clock, ShieldCheck, Send, Image as ImageIcon, Upload, 
  Users, ChevronLeft, Search, Ticket, UserPlus, Download, Printer, CheckCircle2, AlertCircle, X,
  MapPin, QrCode, Trash2
} from 'lucide-react';

interface Props {
  events: Event[];
  registrations: Registration[];
  onCreateEvent: (event: Event) => Promise<void>;
  onDeleteEvent?: (eventId: string) => Promise<void>;
  onRegister: (eventId: string, proxyStudent?: { name: string, roll: string, branch: string }) => void;
  onUpdateRegistration: (reg: Registration) => void;
  isDarkMode: boolean;
  isDirectApprovalEnabled?: boolean;
  clubId: string;
}

const EventOperations: React.FC<Props> = ({ 
  events, 
  registrations, 
  onCreateEvent, 
  onDeleteEvent,
  onRegister, 
  onUpdateRegistration,
  isDarkMode, 
  isDirectApprovalEnabled = false,
  clubId
}) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState<Registration | null>(null);
  const [participantSearch, setParticipantSearch] = useState('');
  
  // Create Event State
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '', description: '', type: 'Free', fee: 0, date: '', status: 'Pending', bannerUrl: ''
  });
  
  // Add Participant State
  const [newParticipant, setNewParticipant] = useState({ name: '', roll: '', branch: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const event: Event = {
      id: `evt-${Date.now()}`,
      clubId: clubId, 
      title: newEvent.title!,
      description: newEvent.description!,
      type: newEvent.type as 'Free' | 'Paid',
      fee: newEvent.type === 'Paid' ? Number(newEvent.fee) : 0,
      status: isDirectApprovalEnabled ? 'Approved' : 'Pending',
      date: newEvent.date!,
      bannerUrl: newEvent.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000',
      isFinalized: false
    };
    await onCreateEvent(event);
    setIsModalOpen(false);
    setNewEvent({ title: '', description: '', type: 'Free', fee: 0, date: '', status: 'Pending', bannerUrl: '' });
  };

  const handleDelete = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    if (onDeleteEvent && window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      await onDeleteEvent(eventId);
      if (selectedEvent?.id === eventId) setSelectedEvent(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent(prev => ({ ...prev, bannerUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) {
      onRegister(selectedEvent.id, newParticipant);
      setIsAddParticipantOpen(false);
      setNewParticipant({ name: '', roll: '', branch: '' });
      alert("Participant Added Successfully");
    }
  };

  const handleGenerateTicket = (reg: Registration) => {
    if (selectedEvent) {
      const idPart = selectedEvent.id.includes('-') ? selectedEvent.id.split('-')[1] : selectedEvent.id.slice(0, 4);
      const ticketId = `TKT-${idPart.toUpperCase()}-${Date.now().toString().slice(-6)}`;
      onUpdateRegistration({ ...reg, ticketId, status: 'Approved' });
    }
  };

  const handleMassGenerate = () => {
    if (!selectedEvent) return;
    const eventRegs = registrations.filter(r => r.eventId === selectedEvent.id && !r.ticketId && r.status === 'Approved');
    
    if (eventRegs.length === 0) {
      alert("No approved registrations found without tickets. Manually approve participants first or use individual generate.");
      return;
    }

    if (window.confirm(`Generate tickets for ${eventRegs.length} participants?`)) {
      eventRegs.forEach(reg => {
        const idPart = selectedEvent.id.includes('-') ? selectedEvent.id.split('-')[1] : selectedEvent.id.slice(0, 4);
        const ticketId = `TKT-${idPart.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        onUpdateRegistration({ ...reg, ticketId });
      });
      alert("Batch generation complete.");
    }
  };

  const openTicketView = (reg: Registration) => {
    setTicketData(reg);
    setIsTicketModalOpen(true);
  };

  // --- Render ---

  if (selectedEvent) {
    // === EVENT DETAIL VIEW ===
    const eventRegs = registrations.filter(r => r.eventId === selectedEvent.id);
    const approvedCount = eventRegs.filter(r => r.status === 'Approved').length;
    const ticketedCount = eventRegs.filter(r => r.ticketId).length;

    const filteredRegs = eventRegs.filter(r => 
      r.studentName.toLowerCase().includes(participantSearch.toLowerCase()) || 
      r.studentRoll.toLowerCase().includes(participantSearch.toLowerCase())
    );

    return (
      <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedEvent(null)}
              className={`p-3 rounded-xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
            >
              <ChevronLeft size={20} className={isDarkMode ? 'text-white' : 'text-slate-700'} />
            </button>
            <div>
              <h1 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>
                {selectedEvent.title}
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedEvent.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                  {selectedEvent.status}
                </span>
              </h1>
              <p className="text-slate-500 font-bold text-sm mt-1 flex items-center gap-2">
                <Calendar size={14} /> {selectedEvent.date} • {selectedEvent.type} {selectedEvent.type === 'Paid' && `(₹${selectedEvent.fee})`}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={handleMassGenerate}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:bg-purple-700 transition-all flex items-center gap-2"
             >
                <Ticket size={16} /> Batch Tickets
             </button>
             <button 
                onClick={() => setIsAddParticipantOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
             >
                <UserPlus size={16} /> Add Participant
             </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-[#111C44] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex items-center gap-3 mb-2 opacity-50">
                 <Users size={20} className={isDarkMode ? 'text-white' : 'text-slate-500'} /> <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-500'}`}>Total Registered</span>
              </div>
              <p className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{eventRegs.length}</p>
           </div>
           <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-[#111C44] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex items-center gap-3 mb-2 opacity-50 text-emerald-500">
                 <CheckCircle2 size={20} /> <span className="text-[10px] font-black uppercase tracking-widest">Verified / Approved</span>
              </div>
              <p className="text-4xl font-black text-emerald-500">{approvedCount}</p>
           </div>
           <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-[#111C44] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex items-center gap-3 mb-2 opacity-50 text-purple-500">
                 <Ticket size={20} /> <span className="text-[10px] font-black uppercase tracking-widest">Tickets Issued</span>
              </div>
              <p className="text-4xl font-black text-purple-500">{ticketedCount}</p>
           </div>
        </div>

        {/* Participants Table */}
        <div className={`rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
           <div className="p-6 border-b border-slate-800/10 flex items-center justify-between">
              <h3 className={`text-lg font-black uppercase tracking-widest opacity-60 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>Participant Ledger</h3>
              <div className="relative">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Search by Name or Roll..." 
                    value={participantSearch}
                    onChange={e => setParticipantSearch(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-xl text-xs font-bold outline-none border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                 />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-800/10">
                       <th className="px-8 py-6">Identity</th>
                       <th className="px-8 py-6">Registration Status</th>
                       <th className="px-8 py-6">Ticket ID</th>
                       <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800/10">
                    {filteredRegs.map(reg => (
                       <tr key={reg.id} className="hover:bg-slate-50/5 transition-colors">
                          <td className="px-8 py-5">
                             <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{reg.studentName}</p>
                             <p className="text-[10px] font-mono text-slate-500">{reg.studentRoll}</p>
                          </td>
                          <td className="px-8 py-5">
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                reg.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                                reg.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' : 
                                'bg-amber-500/10 text-amber-500'
                             }`}>
                                {reg.status}
                             </span>
                          </td>
                          <td className="px-8 py-5">
                             <span className="font-mono text-xs text-slate-400">{reg.ticketId || '—'}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             {reg.ticketId ? (
                                <button onClick={() => openTicketView(reg)} className="text-blue-500 hover:text-blue-400 font-bold text-xs flex items-center gap-1 justify-end ml-auto">
                                   <Ticket size={14} /> View Ticket
                                </button>
                             ) : (
                                <button 
                                   onClick={() => handleGenerateTicket(reg)}
                                   className={`font-bold text-xs flex items-center gap-1 justify-end ml-auto ${
                                     reg.status === 'Approved' ? 'text-purple-500 hover:text-purple-400' : 'text-emerald-500 hover:text-emerald-400'
                                   }`}
                                >
                                   {reg.status === 'Approved' ? <><Plus size={14} /> Generate</> : <><CheckCircle2 size={14}/> Approve & Gen</>}
                                </button>
                             )}
                          </td>
                       </tr>
                    ))}
                    {filteredRegs.length === 0 && <tr><td colSpan={4} className="px-8 py-12 text-center opacity-30 font-black uppercase tracking-widest text-xs text-slate-500">No records found</td></tr>}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Add Participant Modal */}
        {isAddParticipantOpen && (
           <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
              <div className={`max-w-md w-full p-8 rounded-[3rem] border shadow-2xl space-y-6 animate-in zoom-in-95 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                 <div className="flex justify-between items-center">
                    <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Manual Entry</h3>
                    <button onClick={() => setIsAddParticipantOpen(false)}><X size={20} className="text-slate-500" /></button>
                 </div>
                 <form onSubmit={handleAddParticipant} className="space-y-4">
                    <input required placeholder="Student Name" value={newParticipant.name} onChange={e => setNewParticipant({...newParticipant, name: e.target.value})} className={`w-full px-5 py-3 rounded-xl border outline-none font-bold text-sm ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-[#1B2559] placeholder-slate-400'}`} />
                    <input required placeholder="Roll Number" value={newParticipant.roll} onChange={e => setNewParticipant({...newParticipant, roll: e.target.value})} className={`w-full px-5 py-3 rounded-xl border outline-none font-bold text-sm ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-[#1B2559] placeholder-slate-400'}`} />
                    <input required placeholder="Branch" value={newParticipant.branch} onChange={e => setNewParticipant({...newParticipant, branch: e.target.value})} className={`w-full px-5 py-3 rounded-xl border outline-none font-bold text-sm ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-[#1B2559] placeholder-slate-400'}`} />
                    <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all">Register Candidate</button>
                 </form>
              </div>
           </div>
        )}

        {/* Ticket View Modal */}
        {isTicketModalOpen && ticketData && (
           <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setIsTicketModalOpen(false)}>
              <div className="relative max-w-md w-full animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                 {/* Print Area Container */}
                 <div id="print-ticket-area" className={`rounded-[2rem] overflow-hidden shadow-2xl relative ${isDarkMode ? 'bg-[#111C44]' : 'bg-white'}`}>
                    <div className="p-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                       <div className="text-center space-y-6 relative z-10">
                          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-xl">
                             {selectedEvent.title[0]}
                          </div>
                          <div>
                             <h2 className={`text-2xl font-black tracking-tight leading-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{selectedEvent.title}</h2>
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Official Entry Pass</p>
                          </div>
                          <div className="bg-white p-4 rounded-2xl shadow-sm inline-block">
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketData.ticketId || ticketData.id}`} alt="QR" className="w-28 h-28 object-contain" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-slate-500">Holder Identity</p>
                             <p className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{ticketData.studentName}</p>
                             <p className="text-xs font-mono text-slate-500">{ticketData.studentRoll}</p>
                          </div>
                          <div className="pt-6 border-t border-dashed border-slate-700/20">
                             <p className="text-[10px] font-mono text-slate-400 break-all">{ticketData.ticketId}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="mt-6 flex gap-4">
                    <button onClick={() => window.print()} className="flex-1 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                       <Printer size={16} /> Print / PDF
                    </button>
                    <button onClick={() => setIsTicketModalOpen(false)} className="px-6 py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all">
                       Close
                    </button>
                 </div>
              </div>
           </div>
        )}

      </div>
    );
  }

  // === EVENT LIST VIEW (Default) ===
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
          <h1 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Event Manager</h1>
          <p className="text-slate-500 font-semibold mt-2">Plan, schedule, and launch institutional events.</p>
         </div>
         <button 
          onClick={() => setIsModalOpen(true)} 
          className={`${isDirectApprovalEnabled ? 'bg-emerald-600' : 'bg-blue-600'} text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 transition-all`}
         >
          <Plus size={18} /> {isDirectApprovalEnabled ? 'Deploy Instant Event' : 'Create New Proposal'}
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map(event => (
            <div 
              key={event.id} 
              onClick={() => setSelectedEvent(event)}
              className={`p-8 rounded-[2.5rem] border group hover:shadow-xl transition-all flex flex-col cursor-pointer relative ${isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}
            >
                {/* Delete Button for Presidents/Admins */}
                {isDirectApprovalEnabled && onDeleteEvent && (
                  <button 
                    onClick={(e) => handleDelete(e, event.id)}
                    className="absolute top-4 left-4 z-10 p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    title="Delete Event"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className="h-32 w-full rounded-[1.5rem] bg-slate-800 mb-6 overflow-hidden relative">
                    <img src={event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000'} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                            event.status === 'Approved' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                            {event.status === 'Approved' ? <ShieldCheck size={10}/> : <Clock size={10}/>}
                            {event.status}
                        </span>
                    </div>
                </div>
                
                <h3 className={`text-2xl font-black tracking-tight mb-2 leading-tight flex-1 ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{event.title}</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6">
                    <Calendar size={14} /> {event.date}
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-800/10 mt-auto">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium opacity-60 text-slate-500"><Tag size={14}/> Type</span>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{event.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium opacity-60 text-slate-500"><Users size={14}/> Registered</span>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{registrations.filter(r => r.eventId === event.id).length}</span>
                    </div>
                </div>
            </div>
        ))}
        {events.length === 0 && (
            <div className={`col-span-full p-20 border-2 border-dashed rounded-[3rem] text-center opacity-40 ${isDarkMode ? 'border-slate-800/20' : 'border-slate-300'}`}>
                <Calendar size={48} className="mx-auto mb-4 text-slate-500"/>
                <p className="font-black uppercase tracking-widest text-xs text-slate-500">No events in the pipeline.</p>
            </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className={`max-w-2xl w-full p-10 rounded-[3rem] border shadow-2xl space-y-8 animate-in zoom-in-95 overflow-y-auto max-h-[90vh] custom-scrollbar ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div>
                  <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>
                    {isDirectApprovalEnabled ? 'Instant Event Deployment' : 'Propose New Event'}
                  </h2>
                  <p className="text-sm font-medium opacity-50 mt-1 text-slate-500">
                    {isDirectApprovalEnabled 
                      ? 'Presidential authority active: This event will be published immediately.'
                      : 'Institutional protocol: Sent to Faculty Coordinator for verification.'}
                  </p>
                </div>

                <form onSubmit={handleCreateSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 text-slate-500">Event Title</label>
                        <input required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className={`w-full px-6 py-4 rounded-2xl border outline-none font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-[#1B2559] placeholder-slate-400'}`} placeholder="Ex: Technoverse 2026" />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 text-slate-500">Description</label>
                        <textarea required value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className={`w-full px-6 py-4 rounded-2xl border outline-none font-medium h-32 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-[#1B2559] placeholder-slate-400'}`} placeholder="Detailed agenda and requirements..." />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-4 mb-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2 text-slate-500"><ImageIcon size={10}/> Banner Image URL</label>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1">
                                <Upload size={10} /> Local Upload
                            </button>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                        <input type="text" value={newEvent.bannerUrl} onChange={e => setNewEvent({...newEvent, bannerUrl: e.target.value})} className={`w-full px-6 py-4 rounded-2xl border outline-none font-medium text-xs font-mono ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-[#1B2559] placeholder-slate-400'}`} placeholder="https://..." />
                        {newEvent.bannerUrl && (
                            <div className="mt-3 h-32 w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-lg">
                                <img src={newEvent.bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 text-slate-500">Date</label>
                            <input required type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className={`w-full px-6 py-4 rounded-2xl border outline-none font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4 text-slate-500">Access Type</label>
                            <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as any})} className={`w-full px-6 py-4 rounded-2xl border outline-none font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`}>
                                <option value="Free">Free Entry</option>
                                <option value="Paid">Paid Ticket</option>
                            </select>
                        </div>
                    </div>

                    {newEvent.type === 'Paid' && (
                        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 ml-4">Registration Fee (₹)</label>
                                <input required type="number" value={newEvent.fee} onChange={e => setNewEvent({...newEvent, fee: Number(e.target.value)})} className={`w-full px-6 py-4 rounded-2xl border outline-none font-black text-amber-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`} />
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-medium text-amber-500/60">
                                <AlertCircle size={14} />
                                <p>Paid events require a linked UPI QR Code in Club Finance settings before tickets can be sold.</p>
                            </div>
                        </div>
                    )}

                    <div className={`pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-slate-500">Initial Status</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDirectApprovalEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {isDirectApprovalEnabled ? 'Auto-Approved' : 'Pending Review'}
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-all ${isDarkMode ? 'hover:bg-slate-800 text-white' : 'hover:bg-slate-100 text-[#1B2559]'}`}>Cancel</button>
                            <button 
                            type="submit" 
                            className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 ${
                                isDirectApprovalEnabled ? 'bg-emerald-600' : 'bg-blue-600'
                            }`}
                            >
                            {isDirectApprovalEnabled ? <><ShieldCheck size={18}/> Deploy to Campus</> : <><Send size={18}/> Submit Proposal</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default EventOperations;
