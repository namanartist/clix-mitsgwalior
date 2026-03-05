
import React, { useState } from 'react';
import { User, ClubRole, Role, Applicant } from '../../types';
import { 
  Search, 
  UserPlus, 
  MoreHorizontal,
  Mail,
  ShieldCheck,
  Filter,
  X,
  Linkedin,
  Github,
  Award,
  Zap,
  Briefcase,
  Layers
} from 'lucide-react';

interface Props {
  clubId: string;
  clubName: string;
  isDarkMode: boolean;
  clubRole: ClubRole | null;
  allUsers: User[];
  onUpdateUser: (user: User) => void;
  applicants: Applicant[];
}

const ClubMembers: React.FC<Props> = ({ 
  clubId, 
  clubName, 
  isDarkMode, 
  clubRole, 
  allUsers, 
  onUpdateUser,
  applicants
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  const clubMembers = allUsers.filter(u => u.clubMemberships.some(m => m.clubId === clubId));
  const filteredMembers = clubMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.enrollmentNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>
            Team Members ({filteredMembers.length})
          </h2>
          <p className="text-sm font-medium text-[#A3AED0]">
            Manage roles and view the official roster for {clubName}.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className={`flex items-center px-4 py-2 rounded-[20px] w-full md:w-64 transition-colors ${isDarkMode ? 'bg-[#111C44]' : 'bg-white'}`}>
                <Search size={18} className="text-[#A3AED0]" />
                <input 
                    type="text" 
                    placeholder="Search members..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`ml-3 bg-transparent outline-none text-sm font-medium w-full placeholder-[#A3AED0] ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}
                />
            </div>
            <button className={`p-2.5 rounded-[14px] ${isDarkMode ? 'bg-[#111C44] text-white' : 'bg-white text-[#2B3674] hover:bg-gray-50'}`}>
                <Filter size={20} />
            </button>
            <button className="bg-[#0055FF] hover:bg-[#0044CC] text-white px-5 py-2.5 rounded-[14px] text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#0055FF]/20 transition-all">
                <UserPlus size={18} /> <span className="hidden md:inline">Add Member</span>
            </button>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.map(member => {
            const role = member.clubMemberships.find(m => m.clubId === clubId)?.role || ClubRole.MEMBER;
            return (
                <div key={member.id} className={`p-6 rounded-[20px] flex flex-col items-center text-center relative group transition-all hover:-translate-y-1 mits-shadow ${isDarkMode ? 'bg-[#111C44]' : 'bg-white'}`}>
                    
                    <button className="absolute top-4 right-4 text-[#A3AED0] hover:text-[#2B3674] dark:hover:text-white">
                        <MoreHorizontal size={20} />
                    </button>

                    <div className="w-20 h-20 rounded-full border-4 border-[#F4F7FE] dark:border-[#1B254B] mb-4 overflow-hidden relative shadow-sm">
                        {member.photoUrl ? (
                            <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#4D94FF] to-[#0055FF] flex items-center justify-center text-white text-2xl font-bold">
                                {member.name[0]}
                            </div>
                        )}
                    </div>

                    <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>
                        {member.name}
                    </h3>
                    <p className="text-xs font-medium text-[#A3AED0] mb-4 uppercase tracking-wide">
                        {role}
                    </p>

                    <div className="flex items-center gap-8 w-full justify-center px-4 mb-6">
                        <div className="text-center">
                            <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>12</p>
                            <p className="text-[10px] text-[#A3AED0] font-medium">Events</p>
                        </div>
                        <div className="text-center">
                            <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>98%</p>
                            <p className="text-[10px] text-[#A3AED0] font-medium">Attd.</p>
                        </div>
                        <div className="text-center">
                            <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#2B3674]'}`}>3</p>
                            <p className="text-[10px] text-[#A3AED0] font-medium">Years</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => setSelectedMember(member)}
                        className={`w-full py-2.5 rounded-[10px] text-sm font-bold transition-colors ${
                            isDarkMode 
                            ? 'bg-[#1B254B] text-white hover:bg-[#0055FF]' 
                            : 'bg-[#F4F7FE] text-[#0055FF] hover:bg-[#0055FF] hover:text-white'
                        }`}
                    >
                        Inspect Identity
                    </button>
                </div>
            );
        })}
      </div>

      {/* Identity Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setSelectedMember(null)} />
          <div className={`relative max-w-2xl w-full rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-[#0B1437]' : 'bg-white'}`}>
            <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-8 right-8 p-3 rounded-2xl bg-white/5 text-white hover:bg-rose-500 transition-all z-20"
            >
                <X size={20} />
            </button>

            <div className="h-40 bg-gradient-to-r from-[#0055FF] to-[#7551FF] relative">
                <div className="absolute -bottom-16 left-12">
                    <div className="w-32 h-32 rounded-[2.5rem] border-[6px] border-[#0B1437] bg-[#111C44] overflow-hidden shadow-2xl">
                        {selectedMember.photoUrl ? (
                            <img src={selectedMember.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-4xl font-black">{selectedMember.name[0]}</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-12 pt-20 pb-12 space-y-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-4xl font-black text-white tracking-tighter leading-tight">{selectedMember.name}</h3>
                        <p className="text-[#A3AED0] font-bold uppercase tracking-widest text-[10px] mt-1">{selectedMember.enrollmentNumber || 'ROLL-PENDING'} • {selectedMember.branch || 'GENERAL'}</p>
                    </div>
                    <div className="flex gap-2">
                        {selectedMember.linkedin && <a href={selectedMember.linkedin} target="_blank" className="p-3 rounded-xl bg-white/5 text-[#A3AED0] hover:text-white transition-all"><Linkedin size={18} /></a>}
                        {selectedMember.github && <a href={selectedMember.github} target="_blank" className="p-3 rounded-xl bg-white/5 text-[#A3AED0] hover:text-white transition-all"><Github size={18} /></a>}
                        <a href={`mailto:${selectedMember.email}`} className="p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 transition-all"><Mail size={18} /></a>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><Award size={18} /></div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Verified Skills</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(selectedMember.skills || []).length > 0 ? selectedMember.skills?.map(s => (
                                <span key={s} className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-xs font-bold text-[#A3AED0]">{s}</span>
                            )) : <p className="text-xs italic opacity-30">No skills indexed.</p>}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Layers size={18} /></div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Council Appointments</h4>
                        </div>
                        <div className="space-y-3">
                            {selectedMember.clubMemberships.map(m => (
                                <div key={m.clubId} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                                    <div>
                                        <p className="text-xs font-black text-white">{m.role}</p>
                                        <p className="text-[9px] font-bold text-[#A3AED0] uppercase">{m.clubId.replace('club-', '')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-white">Institutional Status</p>
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Academic Entry</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest opacity-40">Entry Key</p>
                        <p className="text-xs font-mono font-bold text-white">SEC-ID-{selectedMember.id.split('-').pop()}</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubMembers;
