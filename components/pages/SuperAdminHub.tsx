
import React, { useState, useEffect } from 'react';
import { Club, User, Role, ClubRole, Notification } from '../../types';
import { db } from '../../db';
import { 
  Snowflake, 
  Check, 
  Plus, 
  ShieldAlert, 
  Globe, 
  X, 
  Palette, 
  Layout, 
  UserPlus, 
  Zap,
  Crown,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Radio
} from 'lucide-react';

interface Props {
  clubs: Club[];
  allUsers: User[];
  onFreeze: (id: string) => void;
  onEnterClub: (id: string) => void;
  onAddClub: (club: Club) => void;
  onAppointPresident: (clubId: string, studentId: string) => void;
  onAssignFaculty: (clubId: string, faculty: User) => void;
  onAddUser?: (user: User) => void;
  isDarkMode: boolean;
}

const SuperAdminHub: React.FC<Props> = ({ 
  clubs, 
  allUsers, 
  onFreeze, 
  onEnterClub, 
  onAddClub, 
  onAppointPresident, 
  onAssignFaculty,
  onAddUser,
  isDarkMode 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [isFacultyAssignModalOpen, setIsFacultyAssignModalOpen] = useState(false);
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [appointSearch, setAppointSearch] = useState('');
  const [facultyAssignSearch, setFacultyAssignSearch] = useState('');

  // Notification State
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'info' as Notification['type'] });

  const [newClubData, setNewClubData] = useState({
    name: '',
    category: 'Technical' as Club['category'],
    themeColor: '#2563eb',
    tagline: ''
  });

  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    department: ''
  });

  const students = allUsers.filter(u => u.globalRole === Role.STUDENT);
  const facultyMembers = allUsers.filter(u => u.globalRole === Role.FACULTY);
  
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(appointSearch.toLowerCase()) || 
    (s.enrollmentNumber || '').toLowerCase().includes(appointSearch.toLowerCase())
  );

  const filteredFacultyForAssign = facultyMembers.filter(f => 
    f.name.toLowerCase().includes(facultyAssignSearch.toLowerCase()) ||
    f.email.toLowerCase().includes(facultyAssignSearch.toLowerCase())
  );

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    const club: Club = {
      id: `club-${Date.now()}`,
      name: newClubData.name,
      category: newClubData.category,
      themeColor: newClubData.themeColor,
      subdomain: `${newClubData.name.toLowerCase().replace(/\s+/g, '')}.mitsgwl.ac.in`,
      leadership: {},
      facultyCoordinatorId: '', // Fixed: Empty string instead of invalid ID to prevent FK violation
      tagline: newClubData.tagline,
      recruitmentActive: false
    };
    onAddClub(club);
    setIsModalOpen(false);
    setNewClubData({ name: '', category: 'Technical', themeColor: '#2563eb', tagline: '' });
  };

  const handleCreateFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddUser) {
      const user: User = {
        id: `faculty-${Date.now()}`,
        name: newFaculty.name,
        email: newFaculty.email,
        globalRole: Role.FACULTY,
        clubMemberships: [],
        branch: newFaculty.department,
        password: 'MITS_FACULTY_' + Math.random().toString(36).slice(-6).toUpperCase()
      };
      onAddUser(user);
      setNewFaculty({ name: '', email: '', department: '' });
      alert(`Success: Faculty ${user.name} added to institutional registry.`);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const notif: Notification = {
        id: `sys-broadcast-${Date.now()}`,
        title: broadcast.title,
        message: broadcast.message,
        type: broadcast.type,
        timestamp: new Date().toISOString(),
        read: false,
        senderName: 'MITS Administration'
    };
    await db.sendNotification(notif);
    alert("System Broadcast Sent Successfully");
    setBroadcast({ title: '', message: '', type: 'info' });
  };

  const handleOpenAppoint = (club: Club) => {
    setSelectedClub(club);
    setIsAppointModalOpen(true);
  };

  const handleOpenFacultyAssign = (club: Club) => {
    setSelectedClub(club);
    setIsFacultyAssignModalOpen(true);
  };

  const handleConfirmAppointment = (studentId: string) => {
    if (selectedClub) {
      onAppointPresident(selectedClub.id, studentId);
      setIsAppointModalOpen(false);
      alert(`President appointed for ${selectedClub.name}. Updating registry...`);
    }
  };

  const handleConfirmFacultyAssign = (faculty: User) => {
    if (selectedClub) {
        onAssignFaculty(selectedClub.id, faculty);
        setIsFacultyAssignModalOpen(false);
        alert(`Faculty Coordinator ${faculty.name} assigned to ${selectedClub.name}.`);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Institutional Management</h1>
          <p className="text-slate-500 font-medium text-lg">Central control for all registered MITS student organizations.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setIsFacultyModalOpen(true)}
            className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center gap-3 border ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
            }`}
          >
            <GraduationCap size={18} /> Faculty Registry
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-3"
          >
            <Plus size={20} /> New Club Registry
          </button>
        </div>
      </header>

      {/* Global Broadcast Center */}
      <div className={`p-10 rounded-[3.5rem] border ${isDarkMode ? 'bg-[#111C44] border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl"><Radio size={24}/></div>
            <h2 className="text-2xl font-black text-white tracking-tight">System Broadcast Center</h2>
        </div>
        <form onSubmit={handleBroadcast} className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full space-y-4">
                <input 
                    required
                    placeholder="Broadcast Title" 
                    value={broadcast.title}
                    onChange={e => setBroadcast({...broadcast, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-rose-500 transition-all"
                />
                <input 
                    required
                    placeholder="Message Content"
                    value={broadcast.message}
                    onChange={e => setBroadcast({...broadcast, message: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium outline-none focus:border-rose-500 transition-all"
                />
            </div>
            <div className="w-full md:w-auto">
                <div className="flex gap-2 mb-4">
                    {['info', 'warning', 'error', 'success'].map((t) => (
                        <button 
                            key={t}
                            type="button" 
                            onClick={() => setBroadcast({...broadcast, type: t as any})}
                            className={`h-8 w-8 rounded-full border-2 ${broadcast.type === t ? 'border-white ring-2 ring-rose-500' : 'border-transparent opacity-50'} ${
                                t === 'info' ? 'bg-blue-500' : t === 'warning' ? 'bg-amber-500' : t === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
                            }`} 
                        />
                    ))}
                </div>
                <button type="submit" className="w-full px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-3">
                    <Zap size={18} /> Transmit
                </button>
            </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {clubs.map(club => {
          const president = allUsers.find(u => 
            u.clubMemberships.some(m => m.clubId === club.id && m.role === ClubRole.PRESIDENT)
          );

          return (
            <div key={club.id} className={`p-10 rounded-[3rem] border transition-all relative overflow-hidden group ${
              isDarkMode ? 'bg-[#161b2a] border-slate-800' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl'
            }`}>
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all">
                <Zap size={80} style={{ color: club.themeColor }} />
              </div>

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div 
                  className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-xl" 
                  style={{ backgroundColor: club.themeColor }}
                >
                  {club.name[0]}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                  club.isFrozen ? 'text-rose-400 border-rose-400/20 bg-rose-400/5' : 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                }`}>
                  {club.isFrozen ? 'Registry Frozen' : 'Live Status'}
                </span>
              </div>

              <div className="space-y-2 mb-8 relative z-10">
                <h3 className="text-3xl font-black tracking-tighter">{club.name}</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{club.subdomain}</p>
              </div>

              <div className="space-y-4 mb-8">
                {/* President Block */}
                <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                    <p className="text-[9px] font-black uppercase opacity-30 mb-1">Presidential Authority</p>
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                        <Crown size={14} className="text-amber-500" /> {president ? president.name : 'Vacant'}
                    </p>
                    </div>
                    <button 
                    onClick={() => handleOpenAppoint(club)}
                    className="p-2.5 rounded-xl bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all"
                    title="Appoint President"
                    >
                    <UserPlus size={16} />
                    </button>
                </div>

                {/* Faculty Block */}
                <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                    <p className="text-[9px] font-black uppercase opacity-30 mb-1">Faculty Oversight</p>
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                        <GraduationCap size={14} className="text-emerald-500" /> 
                        {club.facultyCoordinatorNames && club.facultyCoordinatorNames.length > 0 
                            ? club.facultyCoordinatorNames[0] 
                            : 'Unassigned'}
                    </p>
                    </div>
                    <button 
                    onClick={() => handleOpenFacultyAssign(club)}
                    className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all"
                    title="Assign Coordinator"
                    >
                    <Briefcase size={16} />
                    </button>
                </div>
              </div>

              <div className="flex gap-3 relative z-10">
                <button 
                  onClick={() => onEnterClub(club.id)} 
                  className="flex-1 py-4 bg-slate-800 hover:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                >
                  Governance Panel
                </button>
                <button 
                  onClick={() => onFreeze(club.id)} 
                  className={`p-4 rounded-2xl transition-all ${
                    club.isFrozen ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500'
                  }`}
                >
                  {club.isFrozen ? <Check size={20}/> : <Snowflake size={20}/>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Faculty Registry Modal */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className={`max-w-4xl w-full p-12 rounded-[4rem] border shadow-2xl space-y-10 animate-in zoom-in-95 duration-500 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black tracking-tight">Faculty Registry</h2>
                <p className="text-slate-500 text-sm mt-1">Manage institutional faculty coordinators and department heads.</p>
              </div>
              <button onClick={() => setIsFacultyModalOpen(false)} className="p-4 bg-slate-800/50 rounded-2xl text-white hover:bg-rose-500 transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <Plus size={18} /> Register New Faculty
                </h3>
                <form onSubmit={handleCreateFaculty} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Full Title & Name</label>
                    <input 
                      required
                      type="text" 
                      value={newFaculty.name}
                      onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})}
                      placeholder="Dr. R. S. Jadon"
                      className={`w-full px-8 py-5 rounded-[2rem] border outline-none font-bold ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Institutional Email</label>
                    <input 
                      required
                      type="email" 
                      value={newFaculty.email}
                      onChange={(e) => setNewFaculty({...newFaculty, email: e.target.value})}
                      placeholder="faculty@mitsgwl.ac.in"
                      className={`w-full px-8 py-5 rounded-[2rem] border outline-none font-bold ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Department</label>
                    <input 
                      required
                      type="text" 
                      value={newFaculty.department}
                      onChange={(e) => setNewFaculty({...newFaculty, department: e.target.value})}
                      placeholder="CSE / IT / MAC"
                      className={`w-full px-8 py-5 rounded-[2rem] border outline-none font-bold ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                  <button className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                    Issue Credentials
                  </button>
                </form>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <ShieldCheck size={18} /> Active Faculty Roll
                </h3>
                <div className={`max-h-[400px] overflow-y-auto pr-2 space-y-3 scrollbar-thin ${
                  isDarkMode ? 'bg-slate-900/30' : 'bg-slate-50'
                } p-4 rounded-[2rem]`}>
                  {facultyMembers.map(fac => (
                    <div key={fac.id} className={`p-4 rounded-2xl border flex items-center justify-between group ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-100 hover:shadow-md'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-500 flex items-center justify-center font-black">
                          {fac.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm leading-tight">{fac.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{fac.branch || 'Coordinator'}</p>
                        </div>
                      </div>
                      <div className="text-[9px] font-mono opacity-30">{fac.email}</div>
                    </div>
                  ))}
                  {facultyMembers.length === 0 && (
                    <div className="text-center py-10 opacity-30 font-black uppercase tracking-widest text-[10px]">No registered faculty</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal (Students) */}
      {isAppointModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className={`max-w-2xl w-full p-12 rounded-[4rem] border shadow-2xl space-y-8 animate-in zoom-in-95 duration-500 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black tracking-tight">Appoint Authority</h2>
                <p className="text-slate-500 text-sm mt-1">Select a student from the ledger to lead {selectedClub?.name}.</p>
              </div>
              <button onClick={() => setIsAppointModalOpen(false)} className="p-4 bg-slate-800/50 rounded-2xl text-white hover:bg-rose-500 transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search Identity Ledger..." 
                value={appointSearch}
                onChange={(e) => setAppointSearch(e.target.value)}
                className={`w-full pl-16 pr-8 py-5 rounded-[2rem] border outline-none font-bold text-lg ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {filteredStudents.map(student => (
                <div key={student.id} className={`p-6 rounded-[2rem] border flex items-center justify-between group ${
                  isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 font-black text-xl">
                      {student.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-lg tracking-tight">{student.name}</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{student.enrollmentNumber || 'ROLL-PENDING'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleConfirmAppointment(student.id)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <Crown size={14} /> Appoint President
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Faculty Assignment Modal */}
      {isFacultyAssignModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className={`max-w-2xl w-full p-12 rounded-[4rem] border shadow-2xl space-y-8 animate-in zoom-in-95 duration-500 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black tracking-tight">Assign Coordinator</h2>
                <p className="text-slate-500 text-sm mt-1">Select a faculty member to oversee {selectedClub?.name}.</p>
              </div>
              <button onClick={() => setIsFacultyAssignModalOpen(false)} className="p-4 bg-slate-800/50 rounded-2xl text-white hover:bg-rose-500 transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search Faculty Registry..." 
                value={facultyAssignSearch}
                onChange={(e) => setFacultyAssignSearch(e.target.value)}
                className={`w-full pl-16 pr-8 py-5 rounded-[2rem] border outline-none font-bold text-lg ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {filteredFacultyForAssign.map(faculty => (
                <div key={faculty.id} className={`p-6 rounded-[2rem] border flex items-center justify-between group ${
                  isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-500 font-black text-xl">
                      {faculty.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-lg tracking-tight">{faculty.name}</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{faculty.branch || 'General'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleConfirmFacultyAssign(faculty)}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Assign Coordinator
                  </button>
                </div>
              ))}
              {filteredFacultyForAssign.length === 0 && (
                  <div className="text-center py-10 opacity-30 font-black uppercase tracking-widest text-[10px]">No faculty members found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Club Registry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className={`max-w-2xl w-full p-12 rounded-[4rem] border shadow-2xl space-y-10 animate-in fade-in zoom-in-95 duration-500 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-black tracking-tight">Institutional Onboarding</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800/50 rounded-2xl text-white hover:bg-rose-500 transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Club Name</label>
                <input 
                  required
                  type="text" 
                  value={newClubData.name}
                  onChange={(e) => setNewClubData({...newClubData, name: e.target.value})}
                  className={`w-full px-8 py-5 rounded-[2rem] border outline-none font-bold text-lg ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Wing Category</label>
                  <select 
                    value={newClubData.category}
                    onChange={(e) => setNewClubData({...newClubData, category: e.target.value as any})}
                    className={`w-full px-8 py-5 rounded-[2rem] border outline-none font-bold ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Social">Social</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">System Theme</label>
                  <input 
                    type="color" 
                    value={newClubData.themeColor}
                    onChange={(e) => setNewClubData({...newClubData, themeColor: e.target.value})}
                    className="w-full h-16 rounded-[1.5rem] bg-transparent border-none cursor-pointer"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-6 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Synchronize Registry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminHub;
