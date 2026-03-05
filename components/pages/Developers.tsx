
import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Users, Activity, Lock, ArrowLeft, Trash2, 
  Code, Server, Wifi, ShieldAlert, LogOut, CheckCircle2,
  Github, Linkedin, Mail, Calendar, Briefcase, Award,
  Eye, EyeOff, User as UserIcon, Edit3, Key, Plus, Save, X, 
  GraduationCap, Upload, Image as ImageIcon, Link as LinkIcon,
  Globe, Layout, Smartphone, Monitor, ExternalLink,
  Search, Bell, Settings, PieChart, BarChart2, Layers, Cpu, Zap, FileText
} from 'lucide-react';
import { db } from '../../db';
import { User as UserType, TeamMember, Mentor, DevConfig } from '../../types';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis, PieChart as RePieChart, Pie, Cell, CartesianGrid 
} from 'recharts';

interface Props {
  onBack: () => void;
  isDarkMode: boolean;
  currentUser?: UserType;
  allUsers?: UserType[]; 
  mode?: 'public' | 'console';
}

const Developers: React.FC<Props> = ({ onBack, isDarkMode, currentUser, allUsers = [], mode = 'console' }) => {
  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'team' | 'mentors' | 'settings'>('dashboard');
  
  // Auth Form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [config, setConfig] = useState<DevConfig>({
    developedUnderName: 'BDC - Software Development Club',
    developedUnderUrl: '#',
    authorizedEmails: ['namanlahariya@outlook.in', '25mc1na80@mitsgwl.ac.in']
  });

  // Modal State
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);

  // Refs for File Uploads
  const mentorImageInputRef = useRef<HTMLInputElement>(null);
  const orgLogoInputRef = useRef<HTMLInputElement>(null);

  // Mock Data for Charts
  const chartData1 = [
    { name: 'Mon', value: 400 }, { name: 'Tue', value: 300 }, { name: 'Wed', value: 300 }, 
    { name: 'Thu', value: 200 }, { name: 'Fri', value: 278 }, { name: 'Sat', value: 189 }, { name: 'Sun', value: 239 }
  ];
  const chartData2 = [
    { name: 'Mon', value: 2400 }, { name: 'Tue', value: 1398 }, { name: 'Wed', value: 9800 }, 
    { name: 'Thu', value: 3908 }, { name: 'Fri', value: 4800 }, { name: 'Sat', value: 3800 }, { name: 'Sun', value: 4300 }
  ];
  const pieData = [
    { name: 'System', value: 400 }, { name: 'User', value: 300 }, { name: 'Idle', value: 300 }, { name: 'Net', value: 200 }
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // --- EFFECTS ---

  useEffect(() => {
    const fetchData = async () => {
        const [loadedTeam, loadedMentors, loadedConfig] = await Promise.all([
            db.getDevelopers(),
            db.getMentors(),
            db.getDevConfig()
        ]);

        if (loadedTeam.length > 0) setTeam(loadedTeam);
        else {
            // Default seed
            const defaultLead: TeamMember = {
                id: 'lead-1',
                name: 'Naman Lahariya',
                role: 'Full Stack Architect',
                bio: 'Bridging the gap between complex mathematical modeling and modern software solutions.',
                isLead: true,
                email: 'namanalahariya@gmail.com',
                education: [{ id: 'edu-1', school: 'MITS Gwalior', degree: 'B.Tech Mathematics & Computing', year: '2022-2026' }],
                experience: [
                    { id: 'exp-1', company: 'Internshala', role: 'Campus Ambassador', duration: '2026' },
                    { id: 'exp-2', company: 'Corizo Edutech', role: 'Digital Marketing Intern', duration: '2025' }
                ],
                achievements: [
                    { id: 'ach-1', title: 'SIH Hackathon Winner', description: 'National level hackathon victory.', date: '2025' },
                    { id: 'ach-2', title: 'Built Institutional OS', description: 'Architected the entire CCMS platform.', date: '2026' }
                ]
            };
            setTeam([defaultLead]);
        }

        if (loadedMentors.length > 0) setMentors(loadedMentors);
        else setMentors([
            { id: 'm1', name: 'Dr. Rajni Ranjan Singh Makwana', designation: 'Head, CAI', image: '' },
            { id: 'm2', name: 'Mr. Atul Chauhan', designation: 'Programmer', image: '' }
        ]);

        if (loadedConfig) setConfig(loadedConfig);
    };
    fetchData();
  }, []);

  // Auto-login for known users
  useEffect(() => {
    if (currentUser && config.authorizedEmails.map(e => e.toLowerCase()).includes(currentUser.email.toLowerCase())) {
        setIsAuthenticated(true);
    }
  }, [currentUser, config.authorizedEmails]);

  // --- ACTIONS ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (config.authorizedEmails.includes(username.toLowerCase()) && password === 'mits2026') {
        setIsAuthenticated(true);
      } else {
        alert('Access Denied');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleImageUpload = (file: File, callback: (base64: string) => void) => {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
  };

  const saveMember = async (member: TeamMember) => {
      const newMember = editingMember ? member : { ...member, id: `dev-${Date.now()}` };
      await db.saveDeveloper(newMember);
      setTeam(prev => prev.some(m => m.id === newMember.id) ? prev.map(m => m.id === newMember.id ? newMember : m) : [...prev, newMember]);
      setMemberModalOpen(false);
      setEditingMember(null);
  };

  const removeMember = async (id: string) => {
      if (confirm('Remove this developer from the team?')) {
          await db.deleteDeveloper(id);
          setTeam(prev => prev.filter(m => m.id !== id));
      }
  };

  const handleSaveMentor = async (mentor: Mentor) => {
      const newMentor = editingMentor ? mentor : { ...mentor, id: `mentor-${Date.now()}` };
      await db.saveMentor(newMentor);
      setMentors(prev => {
          const index = prev.findIndex(m => m.id === newMentor.id);
          if (index >= 0) {
              const updated = [...prev];
              updated[index] = newMentor;
              return updated;
          }
          return [...prev, newMentor];
      });
      setMentorModalOpen(false);
      setEditingMentor(null);
  };

  const handleRemoveMentor = async (id: string) => {
      if(confirm('Remove this mentor?')) {
          await db.deleteMentor(id);
          setMentors(prev => prev.filter(m => m.id !== id));
      }
  };

  const handleSaveConfig = async () => {
      await db.saveDevConfig(config);
      alert("System Configuration Synchronized.");
  };

  // --- SUB-COMPONENTS ---

  const MemberModal = () => {
      const [data, setData] = useState<TeamMember>(editingMember || {
          id: '', name: '', role: '', bio: '', email: '', isLead: false, education: [], experience: [], achievements: []
      });
      const [tab, setTab] = useState<'basic' | 'edu' | 'exp' | 'ach'>('basic');
      const fileRef = useRef<HTMLInputElement>(null);

      return (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className={`w-full max-w-2xl rounded-[2rem] border shadow-2xl flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-[#111C44] border-white/10 text-white' : 'bg-white border-slate-200 text-[#1B2559]'}`}>
                  <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <h3 className="text-xl font-black">{editingMember ? 'Edit Profile' : 'Add Developer'}</h3>
                      <button onClick={() => setMemberModalOpen(false)} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={20}/></button>
                  </div>
                  
                  <div className={`flex border-b px-6 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      {['Basic Info', 'Education', 'Experience', 'Achievements'].map((t, i) => {
                          const key = ['basic', 'edu', 'exp', 'ach'][i] as any;
                          return (
                              <button key={key} onClick={() => setTab(key)} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${tab === key ? 'border-[#0099FF] text-[#0099FF]' : 'border-transparent text-slate-500 hover:text-slate-400'}`}>
                                  {t}
                              </button>
                          )
                      })}
                  </div>

                  <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                      {tab === 'basic' && (
                          <div className="space-y-6">
                              <div className="flex items-center gap-6">
                                  <div onClick={() => fileRef.current?.click()} className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden group ${isDarkMode ? 'bg-white/5 border-white/20 hover:border-[#0099FF] hover:text-[#0099FF]' : 'bg-slate-50 border-slate-300 hover:border-[#0099FF] hover:text-[#0099FF]'}`}>
                                      {data.image ? <img src={data.image} className="w-full h-full object-cover" /> : <Upload size={24} className="text-slate-500 group-hover:text-[#0099FF]"/>}
                                  </div>
                                  <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], (b64) => setData({...data, image: b64}))} />
                                  <div className="flex-1 space-y-3">
                                      <input value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="Full Name" className={`w-full rounded-xl px-4 py-3 font-bold outline-none focus:border-[#0099FF] border ${isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`} />
                                      <input value={data.role} onChange={e => setData({...data, role: e.target.value})} placeholder="Role" className={`w-full rounded-xl px-4 py-3 font-bold outline-none focus:border-[#0099FF] border ${isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`} />
                                  </div>
                              </div>
                              <textarea value={data.bio} onChange={e => setData({...data, bio: e.target.value})} placeholder="Short Bio..." rows={3} className={`w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0099FF] border ${isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`} />
                              <div className="grid grid-cols-2 gap-4">
                                  <input value={data.email} onChange={e => setData({...data, email: e.target.value})} placeholder="Email" className={`rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0099FF] border ${isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`} />
                                  <input value={data.linkedin} onChange={e => setData({...data, linkedin: e.target.value})} placeholder="LinkedIn URL" className={`rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0099FF] border ${isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`} />
                                  <input value={data.github} onChange={e => setData({...data, github: e.target.value})} placeholder="GitHub URL" className={`rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0099FF] border ${isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`} />
                                  <div className="flex items-center gap-3 px-2">
                                      <input type="checkbox" checked={data.isLead} onChange={e => setData({...data, isLead: e.target.checked})} className="w-5 h-5 rounded" />
                                      <span className="text-sm font-bold text-slate-500">Mark as Lead</span>
                                  </div>
                              </div>
                          </div>
                      )}
                      
                      {tab === 'edu' && <div className="p-4 text-center text-slate-500 italic">Education details can be managed here (Implementation skipped for brevity).</div>}
                      {tab === 'exp' && <div className="p-4 text-center text-slate-500 italic">Experience details can be managed here.</div>}
                      {tab === 'ach' && <div className="p-4 text-center text-slate-500 italic">Achievement details can be managed here.</div>}
                  </div>

                  <div className={`p-6 border-t flex justify-end gap-3 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <button onClick={() => setMemberModalOpen(false)} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}`}>Cancel</button>
                      <button onClick={() => saveMember(data)} className="px-8 py-3 rounded-xl text-sm font-bold bg-[#0099FF] text-white shadow-lg hover:bg-blue-600 transition-all">Save Member</button>
                  </div>
              </div>
          </div>
      );
  };

  const MentorModal = () => {
      const [data, setData] = useState<Mentor>(editingMentor || {
          id: '', name: '', designation: '', image: '', link: ''
      });

      return (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className={`w-full max-w-lg rounded-[2rem] border shadow-2xl flex flex-col ${isDarkMode ? 'bg-[#111C44] border-white/10 text-white' : 'bg-white border-slate-200 text-[#1B2559]'}`}>
                  <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <h3 className="text-xl font-black">{editingMentor ? 'Edit Mentor' : 'Add Mentor'}</h3>
                      <button onClick={() => setMentorModalOpen(false)} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={20}/></button>
                  </div>
                  <div className="p-8 space-y-6">
                      <div className="flex flex-col items-center mb-4">
                          <div 
                            onClick={() => mentorImageInputRef.current?.click()}
                            className={`w-32 h-32 rounded-full border-4 border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative group ${isDarkMode ? 'bg-white/5 border-white/20' : 'bg-slate-50 border-slate-300'}`}
                          >
                              {data.image ? <img src={data.image} className="w-full h-full object-cover" /> : <Upload size={32} className="text-slate-400" />}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">Upload Photo</div>
                          </div>
                          <input type="file" ref={mentorImageInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], (b64) => setData({...data, image: b64}))} />
                      </div>
                      <div className="space-y-4">
                          <input value={data.name} onChange={e => setData({...data, name: e.target.value})} placeholder="Full Name" className={`w-full rounded-xl px-4 py-3 font-bold outline-none focus:border-[#0099FF] border ${isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`} />
                          <input value={data.designation} onChange={e => setData({...data, designation: e.target.value})} placeholder="Designation (e.g. HOD, CSE)" className={`w-full rounded-xl px-4 py-3 font-bold outline-none focus:border-[#0099FF] border ${isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`} />
                          <input value={data.link} onChange={e => setData({...data, link: e.target.value})} placeholder="Profile Link (Optional)" className={`w-full rounded-xl px-4 py-3 font-bold outline-none focus:border-[#0099FF] border ${isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`} />
                      </div>
                  </div>
                  <div className={`p-6 border-t flex justify-end gap-3 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <button onClick={() => setMentorModalOpen(false)} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'}`}>Cancel</button>
                      <button onClick={() => handleSaveMentor(data)} className="px-8 py-3 rounded-xl text-sm font-bold bg-[#0099FF] text-white shadow-lg hover:bg-blue-600 transition-all">Save Mentor</button>
                  </div>
              </div>
          </div>
      );
  };

  // --- RENDER: PUBLIC VIEW ---
  if (mode === 'public') {
      return (
        <div className={`min-h-screen font-sans flex flex-col overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-[#0B1229] text-white' : 'bg-[#F4F7FE] text-[#1B2559]'}`}>
            {/* Header */}
            <div className="relative pt-24 pb-12 px-6 overflow-hidden">
                {isDarkMode && (
                    <>
                        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
                        <div className="absolute top-20 right-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]" />
                    </>
                )}
                
                <button 
                    onClick={onBack} 
                    className={`fixed top-8 left-8 z-50 p-3 rounded-full backdrop-blur-md border transition-all ${
                        isDarkMode 
                        ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' 
                        : 'bg-white/80 hover:bg-white border-slate-200 text-[#1B2559] shadow-lg'
                    }`}
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="relative z-10 max-w-6xl mx-auto text-center space-y-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                        isDarkMode 
                        ? 'border-purple-500/30 bg-purple-500/10 text-purple-300' 
                        : 'border-[#0099FF]/30 bg-[#0099FF]/10 text-[#0099FF]'
                    }`}>
                        <Code size={12} /> Engineering & Design
                    </div>
                    <h1 className={`text-6xl md:text-8xl font-black tracking-tighter ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50' : 'text-[#1B2559]'}`}>
                        The Architects
                    </h1>
                    <p className={`text-xl max-w-2xl mx-auto font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-[#A3AED0]'}`}>
                        Meet the team building the digital backbone of MITS Gwalior.
                    </p>
                </div>
            </div>

            {/* Developer Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-24 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {team.sort((a, b) => (a.isLead === b.isLead ? 0 : a.isLead ? -1 : 1)).map(member => (
                        <div key={member.id} className={`group relative rounded-[2.5rem] border overflow-hidden transition-all duration-500 flex flex-col h-full hover:shadow-2xl hover:-translate-y-1 ${
                            isDarkMode 
                            ? 'bg-[#111C44] border-white/5 hover:border-white/10 hover:shadow-purple-500/10' 
                            : 'bg-white border-slate-100 hover:shadow-xl'
                        }`}>
                            {/* Card Header & Image */}
                            <div className={`h-32 relative ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-[#0B1437]' : 'bg-gradient-to-br from-[#E6F0FF] to-[#F4F7FE]'}`}>
                                {member.isLead && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg">
                                        <Award size={10} /> Lead
                                    </div>
                                )}
                            </div>
                            <div className="px-8 -mt-16 mb-4 flex justify-between items-end">
                                <div className={`w-28 h-28 rounded-[2rem] p-1 relative group-hover:scale-105 transition-transform duration-500 ${isDarkMode ? 'bg-[#111C44]' : 'bg-white'}`}>
                                    <div className={`w-full h-full rounded-[1.8rem] overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                        {member.image ? <img src={member.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-400">{member.name[0]}</div>}
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-2">
                                    {member.linkedin && <a href={member.linkedin} target="_blank" className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-blue-600 text-slate-400 hover:text-white' : 'bg-slate-50 hover:bg-blue-600 text-slate-400 hover:text-white'}`}><Linkedin size={16}/></a>}
                                    {member.github && <a href={member.github} target="_blank" className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 hover:bg-slate-800 text-slate-400 hover:text-white'}`}><Github size={16}/></a>}
                                    {member.email && <a href={`mailto:${member.email}`} className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-emerald-600 text-slate-400 hover:text-white' : 'bg-slate-50 hover:bg-emerald-600 text-slate-400 hover:text-white'}`}><Mail size={16}/></a>}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="px-8 pb-8 flex-1 flex flex-col space-y-6">
                                <div>
                                    <h3 className={`text-2xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{member.name}</h3>
                                    <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-purple-400' : 'text-[#0099FF]'}`}>{member.role}</p>
                                    <p className={`text-xs mt-3 leading-relaxed line-clamp-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{member.bio}</p>
                                </div>

                                {(member.education.length > 0 || member.experience.length > 0) && (
                                    <div className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                        {member.education[0] && (
                                            <div className="flex gap-3">
                                                <div className="mt-0.5"><GraduationCap size={14} className="text-blue-500"/></div>
                                                <div>
                                                    <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{member.education[0].degree}</p>
                                                    <p className="text-[10px] text-slate-500">{member.education[0].school}</p>
                                                </div>
                                            </div>
                                        )}
                                        {member.experience[0] && (
                                            <div className="flex gap-3">
                                                <div className="mt-0.5"><Briefcase size={14} className="text-emerald-500"/></div>
                                                <div>
                                                    <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{member.experience[0].role}</p>
                                                    <p className="text-[10px] text-slate-500">{member.experience[0].company}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {member.achievements.length > 0 && (
                                    <div className="mt-auto pt-4">
                                        <div className="flex flex-wrap gap-2">
                                            {member.achievements.slice(0,3).map((ach, i) => (
                                                <div key={i} className="group/tooltip relative">
                                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors block cursor-default ${
                                                        isDarkMode 
                                                        ? 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10' 
                                                        : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                                    }`}>
                                                        {ach.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mentorship Section */}
                <div className="mt-32">
                    <h2 className={`text-center text-3xl font-black mb-16 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Under The Guidance Of</h2>
                    <div className="flex flex-wrap justify-center gap-12">
                        {mentors.map(mentor => (
                            <a 
                                key={mentor.id} 
                                href={mentor.link || '#'} 
                                target={mentor.link ? "_blank" : undefined}
                                className={`flex flex-col items-center text-center gap-4 group ${!mentor.link && 'pointer-events-none'}`}
                            >
                                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-purple-500/20 to-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                    <div className={`w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center ${
                                        isDarkMode ? 'bg-[#111C44] border-white/10' : 'bg-white border-slate-100'
                                    }`}>
                                        {mentor.image ? <img src={mentor.image} className="w-full h-full object-cover" /> : <div className="font-bold text-slate-400 text-xl">{mentor.name[0]}</div>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className={`text-lg font-bold group-hover:text-blue-500 transition-colors ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{mentor.name}</h4>
                                    <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{mentor.designation}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Developed Under */}
                <div className={`mt-32 pt-16 border-t text-center ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <div className={`inline-flex items-center gap-4 px-6 py-3 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                        {config.developedUnderLogo ? (
                            <img src={config.developedUnderLogo} alt="Org" className="w-8 h-8 object-contain" />
                        ) : (
                            <Code size={16} className="text-slate-400" />
                        )}
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Developed Under</span>
                        <a href={config.developedUnderUrl} className={`text-sm font-bold hover:text-purple-500 transition-colors flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>
                            {config.developedUnderName} <ExternalLink size={12} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- RENDER: LOGIN ---
  if (!isAuthenticated) {
      return (
          <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans ${isDarkMode ? 'bg-[#0B1437]' : 'bg-[#F4F7FE]'}`}>
              <div className={`max-w-md w-full backdrop-blur-xl border rounded-[2.5rem] p-10 relative z-10 shadow-2xl ${
                  isDarkMode 
                  ? 'bg-[#111C44]/80 border-white/10' 
                  : 'bg-white/80 border-slate-200'
              }`}>
                  <div className="text-center mb-10">
                      <div className="w-16 h-16 bg-[#0055FF]/20 text-[#0055FF] rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Terminal size={32} />
                      </div>
                      <h1 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>System Console</h1>
                      <p className="text-slate-400 text-sm font-medium mt-2">Restricted Access Protocol</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-3">Developer ID</label>
                          <input 
                            type="text" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            className={`w-full border rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#0055FF] transition-all font-bold ${
                                isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-[#F4F7FE] border-transparent text-[#1B2559]'
                            }`}
                            placeholder="id@mitsgwl.ac.in" 
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-3">Access Key</label>
                          <div className="relative">
                              <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className={`w-full border rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#0055FF] transition-all font-bold ${
                                    isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-[#F4F7FE] border-transparent text-[#1B2559]'
                                }`}
                                placeholder="••••••••" 
                              />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#0055FF]"><Eye size={18} /></button>
                          </div>
                      </div>
                      <button disabled={isLoading} className="w-full py-4 bg-[#0055FF] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#0055FF]/20 hover:bg-[#3311db] transition-all disabled:opacity-50">
                          {isLoading ? 'Verifying...' : 'Initialize Session'}
                      </button>
                  </form>
                  <button onClick={onBack} className="w-full mt-6 text-xs font-bold text-slate-500 hover:text-[#0055FF] transition-colors">Abort Connection</button>
              </div>
          </div>
      );
  }

  // --- RENDER: CONSOLE DASHBOARD ---
  return (
      <div className={`flex h-screen font-sans overflow-hidden ${isDarkMode ? 'bg-[#0B1437] text-white' : 'bg-[#F4F7FE] text-[#1B2559]'}`}>
          {/* Sidebar */}
          <aside className={`w-72 flex flex-col p-6 border-r relative z-20 ${isDarkMode ? 'bg-[#111C44] border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-3 mb-12 px-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0055FF] to-[#00E5FF] flex items-center justify-center text-white shadow-lg">
                      <Terminal size={20} />
                  </div>
                  <h2 className="text-xl font-black tracking-tight">DEV<span className="text-[#0055FF]">CONSOLE</span></h2>
              </div>

              <nav className="flex-1 space-y-3">
                  {[
                      { id: 'dashboard', label: 'Dashboard', icon: Layout },
                      { id: 'team', label: 'Core Team', icon: Users },
                      { id: 'mentors', label: 'Mentorship', icon: GraduationCap },
                      { id: 'settings', label: 'Configuration', icon: Settings },
                  ].map(item => (
                      <button
                          key={item.id}
                          onClick={() => setActiveView(item.id as any)}
                          className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
                              activeView === item.id 
                              ? 'bg-[#0055FF] text-white shadow-lg shadow-[#0055FF]/20' 
                              : isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-[#1B2559]'
                          }`}
                      >
                          <item.icon size={18} /> {item.label}
                      </button>
                  ))}
              </nav>

              <div className={`pt-6 mt-auto border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                  <button onClick={onBack} className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      isDarkMode ? 'bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400' : 'bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500'
                  }`}>
                      <LogOut size={14} /> End Session
                  </button>
              </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 flex flex-col relative overflow-hidden">
              {/* Header */}
              <header className={`h-24 px-8 flex items-center justify-between border-b backdrop-blur-md z-10 ${isDarkMode ? 'border-white/5 bg-[#0B1437]/50' : 'border-slate-200 bg-[#F4F7FE]/80'}`}>
                  <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Overview</p>
                      <h2 className="text-2xl font-black tracking-tight">{activeView === 'dashboard' ? 'System Metrics' : activeView === 'team' ? 'Team Management' : activeView === 'mentors' ? 'Mentorship' : 'Configuration'}</h2>
                  </div>
              </header>

              {/* Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                  
                  {activeView === 'dashboard' && (
                      <>
                          {/* Top Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className={`p-6 rounded-[20px] relative overflow-hidden group ${isDarkMode ? 'bg-[#111C44]' : 'bg-white shadow-sm'}`}>
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Developers</p>
                                          <h3 className="text-3xl font-black mt-1">{team.length}</h3>
                                      </div>
                                      <div className="p-3 bg-[#0055FF]/20 rounded-xl text-[#0055FF]"><Users size={24} /></div>
                                  </div>
                                  <div className="h-16 w-full">
                                      <ResponsiveContainer width="100%" height="100%">
                                          <AreaChart data={chartData1}>
                                              <defs><linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0055FF" stopOpacity={0.8}/><stop offset="95%" stopColor="#0055FF" stopOpacity={0}/></linearGradient></defs>
                                              <Area type="monotone" dataKey="value" stroke="#0055FF" strokeWidth={2} fillOpacity={1} fill="url(#colorPv)" />
                                          </AreaChart>
                                      </ResponsiveContainer>
                                  </div>
                              </div>

                              <div className={`p-6 rounded-[20px] relative overflow-hidden group ${isDarkMode ? 'bg-[#111C44]' : 'bg-white shadow-sm'}`}>
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">System Load</p>
                                          <h3 className="text-3xl font-black mt-1">42%</h3>
                                      </div>
                                      <div className="p-3 bg-[#05CD99]/20 rounded-xl text-[#05CD99]"><Cpu size={24} /></div>
                                  </div>
                                  <div className="h-16 w-full">
                                      <ResponsiveContainer width="100%" height="100%">
                                          <AreaChart data={chartData2}>
                                              <defs><linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#05CD99" stopOpacity={0.8}/><stop offset="95%" stopColor="#05CD99" stopOpacity={0}/></linearGradient></defs>
                                              <Area type="monotone" dataKey="value" stroke="#05CD99" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
                                          </AreaChart>
                                      </ResponsiveContainer>
                                  </div>
                              </div>

                              <div className={`p-6 rounded-[20px] relative overflow-hidden group ${isDarkMode ? 'bg-[#111C44]' : 'bg-white shadow-sm'}`}>
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Mentors</p>
                                          <h3 className="text-3xl font-black mt-1">{mentors.length}</h3>
                                      </div>
                                      <div className="p-3 bg-[#FFB547]/20 rounded-xl text-[#FFB547]"><GraduationCap size={24} /></div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-4 text-xs font-bold text-[#FFB547]">
                                      <Zap size={14} /> <span>System Optimized</span>
                                  </div>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              {/* Charts / Pie */}
                              <div className={`rounded-[20px] p-6 flex flex-col ${isDarkMode ? 'bg-[#111C44]' : 'bg-white shadow-sm'}`}>
                                  <h3 className="text-lg font-bold mb-6">System Health</h3>
                                  <div className="h-[250px] w-full relative">
                                      <ResponsiveContainer width="100%" height="100%">
                                          <RePieChart>
                                              <Pie
                                                  data={pieData}
                                                  innerRadius={60}
                                                  outerRadius={80}
                                                  paddingAngle={5}
                                                  dataKey="value"
                                              >
                                                  {pieData.map((entry, index) => (
                                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                  ))}
                                              </Pie>
                                              <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0B1437' : '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: isDarkMode ? '#fff' : '#1B2559' }} />
                                          </RePieChart>
                                      </ResponsiveContainer>
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                          <div className="text-center">
                                              <p className="text-2xl font-black">98%</p>
                                              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Uptime</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </>
                  )}

                  {activeView === 'team' && (
                      <>
                          <div className="flex justify-end mb-4">
                              <button onClick={() => { setEditingMember(null); setMemberModalOpen(true); }} className="bg-[#0055FF] text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                                  <Plus size={16} /> Add Developer
                              </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {team.map(member => (
                                  <div key={member.id} className={`rounded-[20px] p-6 relative group border border-transparent hover:border-[#0055FF]/50 transition-all ${isDarkMode ? 'bg-[#111C44]' : 'bg-white shadow-sm'}`}>
                                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => { setEditingMember(member); setMemberModalOpen(true); }} className={`p-2 rounded-lg hover:text-[#0055FF] ${isDarkMode ? 'bg-[#0B1437] text-white' : 'bg-slate-100 text-slate-600'}`}><Edit3 size={14}/></button>
                                          <button onClick={() => removeMember(member.id)} className={`p-2 rounded-lg hover:text-rose-500 ${isDarkMode ? 'bg-[#0B1437] text-white' : 'bg-slate-100 text-slate-600'}`}><Trash2 size={14}/></button>
                                      </div>
                                      <div className="flex flex-col items-center text-center">
                                          <div className={`w-20 h-20 rounded-full border-4 overflow-hidden mb-4 shadow-lg ${isDarkMode ? 'border-[#0B1437]' : 'border-[#F4F7FE]'}`}>
                                              {member.image ? <img src={member.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-700 flex items-center justify-center text-xl font-bold">{member.name[0]}</div>}
                                          </div>
                                          <h4 className="text-lg font-bold">{member.name}</h4>
                                          <p className="text-xs text-[#0055FF] font-bold uppercase tracking-widest mt-1">{member.role}</p>
                                          
                                          <div className={`mt-6 w-full pt-6 border-t grid grid-cols-3 gap-2 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                              <div className="text-center">
                                                  <p className="text-lg font-bold">{member.education.length}</p>
                                                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">Edu</p>
                                              </div>
                                              <div className={`text-center border-l border-r ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                                  <p className="text-lg font-bold">{member.experience.length}</p>
                                                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">Exp</p>
                                              </div>
                                              <div className="text-center">
                                                  <p className="text-lg font-bold">{member.achievements.length}</p>
                                                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">Ach</p>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </>
                  )}

                  {activeView === 'mentors' && (
                      <>
                          <div className="flex justify-end mb-4">
                              <button onClick={() => { setEditingMentor(null); setMentorModalOpen(true); }} className="bg-[#0055FF] text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
                                  <Plus size={16} /> Add Mentor
                              </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {mentors.map(mentor => (
                                  <div key={mentor.id} className={`rounded-[20px] p-6 relative group border border-transparent hover:border-purple-500/50 transition-all ${isDarkMode ? 'bg-[#111C44]' : 'bg-white shadow-sm'}`}>
                                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => { setEditingMentor(mentor); setMentorModalOpen(true); }} className={`p-2 rounded-lg hover:text-[#0055FF] ${isDarkMode ? 'bg-[#0B1437] text-white' : 'bg-slate-100 text-slate-600'}`}><Edit3 size={14}/></button>
                                          <button onClick={() => handleRemoveMentor(mentor.id)} className={`p-2 rounded-lg hover:text-rose-500 ${isDarkMode ? 'bg-[#0B1437] text-white' : 'bg-slate-100 text-slate-600'}`}><Trash2 size={14}/></button>
                                      </div>
                                      <div className="flex flex-col items-center text-center">
                                          <div className={`w-20 h-20 rounded-full border-4 overflow-hidden mb-4 shadow-lg ${isDarkMode ? 'border-[#0B1437]' : 'border-[#F4F7FE]'}`}>
                                              {mentor.image ? <img src={mentor.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-700 flex items-center justify-center text-xl font-bold">{mentor.name[0]}</div>}
                                          </div>
                                          <h4 className="text-lg font-bold">{mentor.name}</h4>
                                          <p className="text-xs text-purple-500 font-bold uppercase tracking-widest mt-1">{mentor.designation}</p>
                                          {mentor.link && (
                                              <a href={mentor.link} target="_blank" className="mt-4 text-[10px] flex items-center gap-1 font-bold text-slate-500 hover:text-[#0055FF]">
                                                  View Profile <ExternalLink size={10}/>
                                              </a>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </>
                  )}

                  {activeView === 'settings' && (
                      <div className="max-w-2xl mx-auto space-y-8">
                          <div className={`p-8 rounded-[2rem] border ${isDarkMode ? 'bg-[#111C44] border-white/5' : 'bg-white shadow-sm border-slate-100'}`}>
                              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Globe size={18} /> Organization Identity</h3>
                              <div className="space-y-6">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Developed Under Name</label>
                                      <input 
                                          value={config.developedUnderName}
                                          onChange={e => setConfig({...config, developedUnderName: e.target.value})}
                                          className={`w-full rounded-xl px-4 py-3 font-bold outline-none focus:border-[#0099FF] border ${isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`}
                                      />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Website URL</label>
                                      <input 
                                          value={config.developedUnderUrl}
                                          onChange={e => setConfig({...config, developedUnderUrl: e.target.value})}
                                          className={`w-full rounded-xl px-4 py-3 font-bold outline-none focus:border-[#0099FF] border ${isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`}
                                      />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Organization Logo</label>
                                      <div className="flex items-center gap-4">
                                          <div onClick={() => orgLogoInputRef.current?.click()} className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden ${isDarkMode ? 'border-white/20 hover:border-[#0099FF]' : 'border-slate-300 hover:border-[#0099FF]'}`}>
                                              {config.developedUnderLogo ? <img src={config.developedUnderLogo} className="w-full h-full object-contain p-2" /> : <Upload size={20} className="text-slate-400"/>}
                                          </div>
                                          <div className="flex-1">
                                              <p className="text-xs text-slate-500">Upload a square logo (PNG/SVG preferred).</p>
                                              <input type="file" ref={orgLogoInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], (b64) => setConfig({...config, developedUnderLogo: b64}))} />
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className={`p-8 rounded-[2rem] border ${isDarkMode ? 'bg-[#111C44] border-white/5' : 'bg-white shadow-sm border-slate-100'}`}>
                              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Lock size={18} /> Access Control</h3>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Authorized Emails (Comma Separated)</label>
                                  <textarea 
                                      value={config.authorizedEmails.join(', ')}
                                      onChange={e => setConfig({...config, authorizedEmails: e.target.value.split(',').map(s => s.trim())})}
                                      rows={4}
                                      className={`w-full rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-[#0099FF] border ${isDarkMode ? 'bg-[#0B1437] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-[#1B2559]'}`}
                                  />
                                  <p className="text-[10px] text-slate-500">These emails will have access to the Developer Console.</p>
                              </div>
                          </div>

                          <div className="flex justify-end">
                              <button onClick={handleSaveConfig} className="bg-[#0055FF] text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                                  <Save size={16} /> Save Configuration
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          </main>

          {/* Modals */}
          {memberModalOpen && <MemberModal />}
          {mentorModalOpen && <MentorModal />}
      </div>
  );
};

export default Developers;
