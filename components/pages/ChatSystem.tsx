import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Club, Message, Role, PollOption } from '../../types';
import { db } from '../../db';
import { 
  Send, 
  Search, 
  MoreVertical, 
  User as UserIcon, 
  Paperclip,
  CheckCheck,
  Check,
  Phone,
  Video,
  ArrowLeft,
  Users,
  Camera,
  Mic,
  Plus,
  Image as ImageIcon,
  MapPin,
  BarChart2,
  X,
  Play,
  FileVideo,
  Map as MapIcon,
  MessageSquare,
  Lock
} from 'lucide-react';

interface Props {
  user: User;
  clubs: Club[];
  allUsers: User[];
  activeContext?: string;
  isDarkMode: boolean;
}

const ChatSystem: React.FC<Props> = ({ user, clubs, allUsers, activeContext, isDarkMode }) => {
  const [activeChannel, setActiveChannel] = useState<{ type: 'club' | 'dm', id: string, name: string, image?: string, color?: string, subtitle?: string, isOnline?: boolean, lastSeen?: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  
  // Poll State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ACCESS CONTROL LOGIC ---
  const allowedClubs = useMemo(() => {
    if (user.globalRole !== Role.STUDENT) return clubs;
    const myClubIds = user.clubMemberships.map(m => m.clubId);
    return clubs.filter(c => myClubIds.includes(c.id));
  }, [clubs, user]);

  const allowedUsers = useMemo(() => {
    if (user.globalRole !== Role.STUDENT) return allUsers.filter(u => u.id !== user.id);
    
    const myClubIds = user.clubMemberships.map(m => m.clubId);
    return allUsers.filter(u => {
      if (u.id === user.id) return false;
      if (u.globalRole !== Role.STUDENT) return true; // Can chat with faculty
      const theirClubIds = u.clubMemberships.map(m => m.clubId);
      return myClubIds.some(id => theirClubIds.includes(id));
    });
  }, [allUsers, user]);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (activeContext && activeContext !== 'Global') {
      const club = allowedClubs.find(c => c.id === activeContext);
      if (club) {
        setActiveChannel({ 
            type: 'club', 
            id: club.id, 
            name: club.name, 
            color: club.themeColor,
            subtitle: `${club.category} Council` 
        });
      }
    }
  }, [activeContext, allowedClubs]);

  // --- MESSAGE FETCHING ---
  useEffect(() => {
    if (!activeChannel) return;
    const fetchMessages = async () => {
      const msgs = await db.getMessages(
        activeChannel.type === 'club' ? activeChannel.id : undefined,
        user.id,
        activeChannel.type === 'dm' ? activeChannel.id : undefined
      );
      setMessages(msgs);
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); 
    return () => clearInterval(interval);
  }, [activeChannel, user.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- HELPERS ---
  const formatTime = (iso: string) => {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (iso?: string) => {
      if (!iso) return 'Offline';
      const date = new Date(iso);
      const now = new Date();
      const diff = (now.getTime() - date.getTime()) / 1000 / 60; // minutes
      if (diff < 2) return 'Online';
      if (diff < 60) return `Last seen ${Math.floor(diff)}m ago`;
      if (diff < 1440) return `Last seen ${Math.floor(diff/60)}h ago`;
      return `Last seen ${date.toLocaleDateString()}`;
  };

  // --- ACTIONS ---

  const handleSend = async (type: Message['type'] = 'text', content?: string, extraData?: any) => {
    if (!activeChannel) return;
    if (type === 'text' && !input.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      content: type === 'text' ? input : content,
      timestamp: new Date().toISOString(),
      type: type,
      status: 'sent',
      clubId: activeChannel.type === 'club' ? activeChannel.id : undefined,
      recipientId: activeChannel.type === 'dm' ? activeChannel.id : undefined,
      ...extraData
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setShowAttachMenu(false);
    setShowPollModal(false);
    
    // Simulate Network Delay for "Sent" -> "Delivered"
    await db.sendMessage(newMsg);
    
    // Simulate user reading it after 2s if DM
    if (activeChannel.type === 'dm') {
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m));
        }, 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
          const type = file.type.startsWith('video') ? 'video' : 'image';
          handleSend(type, type === 'video' ? 'Video Message' : 'Image Message', { mediaUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
  };

  const handleSendLocation = () => {
      if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition((pos) => {
              handleSend('location', 'Shared Location', { 
                  latitude: pos.coords.latitude, 
                  longitude: pos.coords.longitude 
              });
          });
      } else {
          alert("Geolocation not available");
      }
  };

  const handleCreatePoll = () => {
      const validOptions = pollOptions.filter(o => o.trim() !== '');
      if (!pollQuestion.trim() || validOptions.length < 2) return;
      
      const optionsObjects: PollOption[] = validOptions.map((opt, i) => ({
          id: `opt-${i}`,
          text: opt,
          votes: []
      }));

      handleSend('poll', 'Poll', { pollQuestion, pollOptions: optionsObjects });
      setPollQuestion('');
      setPollOptions(['', '']);
  };

  const handleVote = async (msgId: string, optionId: string) => {
      await db.votePoll(msgId, optionId, user.id);
      // Optimistic update
      setMessages(prev => prev.map(m => {
          if (m.id === msgId && m.pollOptions) {
              const updatedOptions = m.pollOptions.map(opt => ({
                  ...opt,
                  votes: opt.votes.filter(v => v !== user.id) // remove existing vote
              }));
              const target = updatedOptions.find(o => o.id === optionId);
              if (target) target.votes.push(user.id);
              return { ...m, pollOptions: updatedOptions };
          }
          return m;
      }));
  };

  const filteredClubs = allowedClubs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredUsers = allowedUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  // --- RENDERERS ---

  const MessageStatusIcon = ({ status }: { status: Message['status'] }) => {
      if (status === 'read') return <CheckCheck size={16} className="text-[#53bdeb]" />; // Blue ticks
      if (status === 'delivered') return <CheckCheck size={16} className="text-slate-400" />; // Gray ticks
      return <Check size={16} className="text-slate-400" />; // Single tick
  };

  const RenderMessageContent = ({ msg, isMe }: { msg: Message, isMe: boolean }) => {
      switch (msg.type) {
          case 'image':
              return (
                  <div className="mb-1">
                      <img src={msg.mediaUrl} className="rounded-lg max-w-[280px] max-h-[300px] object-cover cursor-pointer" alt="attachment" />
                      {msg.content && <p className="mt-2 text-sm">{msg.content}</p>}
                  </div>
              );
          case 'video':
              return (
                  <div className="mb-1">
                      <video src={msg.mediaUrl} controls className="rounded-lg max-w-[280px] max-h-[300px]" />
                      {msg.content && <p className="mt-2 text-sm">{msg.content}</p>}
                  </div>
              );
          case 'location':
              return (
                  <div className="mb-1">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${msg.latitude},${msg.longitude}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block rounded-lg overflow-hidden border border-white/20 bg-black/20 max-w-[280px]"
                      >
                          <div className="h-32 bg-slate-200 flex items-center justify-center relative">
                              <MapIcon size={40} className="text-slate-400" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <MapPin size={32} className="text-rose-500 fill-rose-500 drop-shadow-lg -mt-4" />
                              </div>
                          </div>
                          <div className={`p-3 text-xs ${isMe ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                              <p className="font-bold">Live Location</p>
                              <p className="opacity-80">Tap to view on Maps</p>
                          </div>
                      </a>
                  </div>
              );
          case 'poll':
              const totalVotes = msg.pollOptions?.reduce((acc, opt) => acc + opt.votes.length, 0) || 0;
              return (
                  <div className={`min-w-[250px] ${isMe ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                      <p className="font-bold mb-3 text-base">{msg.pollQuestion}</p>
                      <div className="space-y-2">
                          {msg.pollOptions?.map(opt => {
                              const percent = totalVotes > 0 ? (opt.votes.length / totalVotes) * 100 : 0;
                              const hasVoted = opt.votes.includes(user.id);
                              return (
                                  <div 
                                    key={opt.id} 
                                    onClick={() => handleVote(msg.id, opt.id)}
                                    className="relative cursor-pointer group"
                                  >
                                      <div className={`h-10 rounded-lg border flex items-center px-3 relative overflow-hidden transition-all ${
                                          hasVoted 
                                          ? (isMe ? 'border-white/40 bg-white/20' : 'border-blue-500/40 bg-blue-500/10')
                                          : (isMe ? 'border-white/20 bg-black/10' : 'border-slate-300 dark:border-slate-600 bg-transparent')
                                      }`}>
                                          <div 
                                            className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${isMe ? 'bg-white/20' : 'bg-blue-500/20'}`} 
                                            style={{ width: `${percent}%` }} 
                                          />
                                          <div className="relative z-10 flex justify-between w-full text-sm font-medium">
                                              <span>{opt.text}</span>
                                              <span>{opt.votes.length}</span>
                                          </div>
                                          {hasVoted && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                      <p className="text-[10px] mt-2 opacity-60 text-right">{totalVotes} votes</p>
                  </div>
              );
          default:
              return <span className="whitespace-pre-wrap">{msg.content}</span>;
      }
  };

  return (
    <div className={`flex h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] overflow-hidden relative transition-colors duration-300 ${isDarkMode ? 'bg-[#0B1437]' : 'bg-[#F4F7FE]'}`}>
      
      {/* --- LEFT SIDEBAR (List View) --- */}
      <div className={`w-full md:w-[400px] flex flex-col border-r absolute md:relative inset-0 z-10 transition-transform duration-300 
        ${isDarkMode ? 'border-white/5 bg-[#111C44]' : 'border-slate-200 bg-white'}
        ${activeChannel ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
        
        {/* Header */}
        <div className={`px-4 py-3 flex justify-between items-center sticky top-0 z-20 ${isDarkMode ? 'bg-[#111C44]' : 'bg-white'}`}>
           <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Chats</h1>
           <div className={`flex gap-4 ${isDarkMode ? 'text-slate-300' : 'text-[#A3AED0]'}`}>
              <Camera size={22} className="cursor-pointer hover:opacity-80" />
              <Search size={22} className="cursor-pointer hover:opacity-80" />
              <MoreVertical size={22} className="cursor-pointer hover:opacity-80" />
           </div>
        </div>

        {/* Search Input */}
        <div className="px-3 pb-2">
            <div className={`rounded-xl flex items-center px-3 py-2 ${isDarkMode ? 'bg-[#0B1437]' : 'bg-[#F4F7FE]'}`}>
                <Search size={18} className={isDarkMode ? 'text-slate-500' : 'text-[#A3AED0]'} />
                <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search or start new chat"
                    className={`bg-transparent border-none outline-none text-sm ml-3 w-full ${isDarkMode ? 'text-white placeholder-slate-500' : 'text-[#1B2559] placeholder-[#A3AED0]'}`}
                />
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Empty State */}
            {filteredClubs.length === 0 && filteredUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8 opacity-50">
                    <div className={`p-4 rounded-full mb-4 ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                        <MessageSquare size={24} />
                    </div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No active conversations</p>
                    <p className="text-xs mt-2 text-slate-500">Join a club or wait for approval to start messaging peers.</p>
                </div>
            )}

            {/* Clubs Section */}
            {filteredClubs.length > 0 && (
                <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500 bg-[#0B1437]/50' : 'text-[#A3AED0] bg-[#F4F7FE]'}`}>
                    My Groups
                </div>
            )}
            {filteredClubs.map(club => (
                <div 
                    key={club.id}
                    onClick={() => setActiveChannel({ 
                        type: 'club', 
                        id: club.id, 
                        name: club.name, 
                        color: club.themeColor,
                        subtitle: `${club.category} Council` 
                    })}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b 
                        ${isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}
                        ${activeChannel?.id === club.id ? (isDarkMode ? 'bg-white/5' : 'bg-[#F4F7FE]') : ''}`}
                >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0" style={{ backgroundColor: club.themeColor }}>
                        {club.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                            <h3 className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{club.name}</h3>
                            <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-[#A3AED0]'}`}>12:30 PM</span>
                        </div>
                        <p className={`text-sm truncate flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Users size={12} /> {club.category} Wing • Official
                        </p>
                    </div>
                </div>
            ))}

            {/* Users Section */}
            {(filteredUsers.length > 0) && (
                <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest mt-2 ${isDarkMode ? 'text-slate-500 bg-[#0B1437]/50' : 'text-[#A3AED0] bg-[#F4F7FE]'}`}>
                    Direct Messages
                </div>
            )}
            {filteredUsers.map(u => (
                <div 
                    key={u.id}
                    onClick={() => setActiveChannel({ 
                        type: 'dm', 
                        id: u.id, 
                        name: u.name, 
                        image: u.photoUrl,
                        subtitle: u.globalRole,
                        isOnline: u.isOnline,
                        lastSeen: u.lastSeen
                    })}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b 
                        ${isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}
                        ${activeChannel?.id === u.id ? (isDarkMode ? 'bg-white/5' : 'bg-[#F4F7FE]') : ''}`}
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border shrink-0 relative ${isDarkMode ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
                        {u.photoUrl ? <img src={u.photoUrl} className="w-full h-full object-cover" /> : <span className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-[#A3AED0]'}`}>{u.name[0]}</span>}
                        {u.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#111C44]"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                            <h3 className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{u.name}</h3>
                            <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-[#A3AED0]'}`}>
                                {u.lastSeen ? new Date(u.lastSeen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                            </span>
                        </div>
                        <p className={`text-sm truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {u.isOnline ? <span className="text-emerald-500 font-medium">Online</span> : (u.globalRole === Role.STUDENT ? u.branch : u.globalRole)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- RIGHT SIDE (Chat View) --- */}
      <div className={`w-full md:flex-1 flex flex-col absolute md:relative inset-0 z-20 transition-transform duration-300 
        ${isDarkMode ? 'bg-[#0B1024]' : 'bg-[#F4F7FE]'}
        ${activeChannel ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        
        {activeChannel ? (
            <>
                {/* Chat Header */}
                <div className={`h-16 px-4 flex items-center justify-between border-b shadow-md shrink-0 ${isDarkMode ? 'bg-[#111C44] border-white/5' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveChannel(null)} className={`md:hidden p-2 -ml-2 ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-[#1B2559]'}`}>
                            <ArrowLeft size={24} />
                        </button>
                        
                        {activeChannel.type === 'club' ? (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: activeChannel.color }}>
                                {activeChannel.name[0]}
                            </div>
                        ) : (
                            <div className={`w-10 h-10 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100 border border-slate-200'}`}>
                                {activeChannel.image ? <img src={activeChannel.image} className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`}>{activeChannel.name[0]}</div>}
                            </div>
                        )}
                        
                        <div className="cursor-pointer">
                            <h3 className={`font-bold text-sm md:text-base leading-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{activeChannel.name}</h3>
                            <p className={`text-xs truncate max-w-[150px] md:max-w-none ${isDarkMode ? 'text-slate-400' : 'text-[#A3AED0]'}`}>
                                {activeChannel.type === 'club' ? activeChannel.subtitle : (activeChannel.isOnline ? 'Online' : formatLastSeen(activeChannel.lastSeen))}
                            </p>
                        </div>
                    </div>

                    <div className={`flex items-center gap-4 ${isDarkMode ? 'text-slate-300' : 'text-[#A3AED0]'}`}>
                        <Video size={22} className={`cursor-pointer hidden sm:block ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1B2559]'}`} />
                        <Phone size={20} className={`cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1B2559]'}`} />
                        <MoreVertical size={20} className={`cursor-pointer ${isDarkMode ? 'hover:text-white' : 'hover:text-[#1B2559]'}`} />
                    </div>
                </div>

                {/* Chat Body */}
                <div 
                    className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 custom-scrollbar"
                    style={{ 
                        backgroundImage: isDarkMode ? 'url("https://i.pinimg.com/originals/97/c0/07/97c00759d90d786d9b6096d274ad3e07.png")' : 'none',
                        backgroundColor: isDarkMode ? '#0B1024' : '#E5E5E5',
                        backgroundBlendMode: isDarkMode ? 'soft-light' : 'normal',
                        backgroundRepeat: 'repeat',
                        backgroundSize: '400px 400px'
                    }}
                    ref={scrollRef}
                >
                    {messages.map((msg, i) => {
                        const isMe = msg.senderId === user.id;
                        const showHeader = i === 0 || messages[i-1].senderId !== msg.senderId;
                        
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-1`}>
                                <div className={`relative max-w-[85%] md:max-w-[65%] px-3 py-2 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                    isMe 
                                        ? (isDarkMode ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#005c4b] text-white rounded-tr-none')
                                        : (isDarkMode ? 'bg-[#202c33] text-slate-200 rounded-tl-none' : 'bg-white text-[#1B2559] rounded-tl-none')
                                }`}>
                                    {!isMe && showHeader && activeChannel.type === 'club' && (
                                        <p className="text-[10px] font-bold text-orange-400 mb-1">{msg.senderName}</p>
                                    )}
                                    
                                    <RenderMessageContent msg={msg} isMe={isMe} />
                                    
                                    <div className="flex items-center justify-end gap-1 mt-1 -mr-1">
                                        <span className={`text-[9px] ${isMe ? 'text-white/70' : (isDarkMode ? 'text-slate-400' : 'text-slate-400')}`}>
                                            {formatTime(msg.timestamp)}
                                        </span>
                                        {isMe && <MessageStatusIcon status={msg.status} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                <div className={`p-3 flex items-center gap-2 md:gap-3 shrink-0 relative ${isDarkMode ? 'bg-[#111C44]' : 'bg-[#F0F2F5] border-t border-slate-200'}`}>
                    {/* Attachment Menu */}
                    {showAttachMenu && (
                        <div className={`absolute bottom-20 left-4 p-4 rounded-2xl shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-4 zoom-in-95 ${isDarkMode ? 'bg-[#202c33]' : 'bg-white'}`}>
                            <button onClick={() => { fileInputRef.current?.click(); }} className="flex items-center gap-3 hover:opacity-80">
                                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white"><ImageIcon size={20}/></div>
                                <span className={isDarkMode ? 'text-white' : 'text-slate-700'}>Photos & Videos</span>
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                            
                            <button onClick={handleSendLocation} className="flex items-center gap-3 hover:opacity-80">
                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white"><MapPin size={20}/></div>
                                <span className={isDarkMode ? 'text-white' : 'text-slate-700'}>Location</span>
                            </button>
                            
                            <button onClick={() => { setShowPollModal(true); setShowAttachMenu(false); }} className="flex items-center gap-3 hover:opacity-80">
                                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white"><BarChart2 size={20}/></div>
                                <span className={isDarkMode ? 'text-white' : 'text-slate-700'}>Poll</span>
                            </button>
                        </div>
                    )}

                    <button 
                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                        className={`p-3 transition-colors rounded-full ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-[#1B2559] hover:bg-white'}`}
                    >
                        <Plus size={24} className={`transition-transform duration-300 ${showAttachMenu ? 'rotate-45' : ''}`} />
                    </button>
                    
                    <form onSubmit={(e) => handleSend('text', undefined, e)} className={`flex-1 flex items-center gap-2 rounded-2xl px-4 py-3 ${isDarkMode ? 'bg-[#2a3942]' : 'bg-white'}`}>
                        <button type="button" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-[#A3AED0] hover:text-[#1B2559]'}`}><Paperclip size={20} /></button>
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message"
                            className={`flex-1 bg-transparent border-none outline-none text-base ${isDarkMode ? 'text-white placeholder-slate-500' : 'text-[#1B2559] placeholder-[#A3AED0]'}`}
                        />
                        <button type="button" className={`${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-[#A3AED0] hover:text-[#1B2559]'}`}><Camera size={20} /></button>
                    </form>

                    <button 
                        onClick={() => input.trim() ? handleSend('text') : null}
                        className={`p-3 rounded-full flex items-center justify-center transition-all shadow-lg ${
                            input.trim() 
                                ? (isDarkMode ? 'bg-[#00a884] text-white hover:scale-105' : 'bg-[#00a884] text-white hover:scale-105') 
                                : (isDarkMode ? 'bg-[#202c33] text-slate-400' : 'bg-white text-slate-400')
                        }`}
                    >
                        {input.trim() ? <Send size={20} className="ml-0.5" /> : <Mic size={20} />}
                    </button>
                </div>

                {/* Poll Creator Modal */}
                {showPollModal && (
                    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
                        <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDarkMode ? 'bg-[#202c33] text-white' : 'bg-white text-slate-900'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Create Poll</h3>
                                <button onClick={() => setShowPollModal(false)}><X size={24} /></button>
                            </div>
                            <div className="space-y-4">
                                <input 
                                    value={pollQuestion}
                                    onChange={e => setPollQuestion(e.target.value)}
                                    placeholder="Ask a question..."
                                    className={`w-full p-4 rounded-xl outline-none font-bold ${isDarkMode ? 'bg-[#111b21] text-white' : 'bg-slate-100 text-slate-900'}`}
                                />
                                <div className="space-y-2">
                                    {pollOptions.map((opt, i) => (
                                        <input 
                                            key={i}
                                            value={opt}
                                            onChange={e => {
                                                const newOpts = [...pollOptions];
                                                newOpts[i] = e.target.value;
                                                setPollOptions(newOpts);
                                            }}
                                            placeholder={`Option ${i + 1}`}
                                            className={`w-full p-3 rounded-xl outline-none text-sm ${isDarkMode ? 'bg-[#111b21] text-white' : 'bg-slate-100 text-slate-900'}`}
                                        />
                                    ))}
                                    <button 
                                        onClick={() => setPollOptions([...pollOptions, ''])}
                                        className="text-sm font-bold text-[#00a884] hover:underline"
                                    >
                                        + Add Option
                                    </button>
                                </div>
                                <button 
                                    onClick={handleCreatePoll}
                                    className="w-full py-3 bg-[#00a884] text-white rounded-full font-bold shadow-lg mt-4"
                                >
                                    Send Poll
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        ) : (
            <div className={`hidden md:flex flex-1 flex-col items-center justify-center text-center p-10 border-l ${isDarkMode ? 'bg-[#111C44] border-[#0B1024]' : 'bg-[#F0F2F5] border-slate-200'}`}>
                <div className={`w-64 h-64 opacity-50 bg-[url('https://i.pinimg.com/originals/97/c0/07/97c00759d90d786d9b6096d274ad3e07.png')] bg-contain bg-no-repeat bg-center mb-8 rounded-full border-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100 grayscale'}`} />
                <h2 className={`text-3xl font-light mb-4 ${isDarkMode ? 'text-slate-200' : 'text-[#41525d]'}`}>CCMS Web for MITS</h2>
                <p className={`max-w-md text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Send and receive messages within your club councils. <br/>
                    Strict access control ensures privacy across different wings.
                </p>
                <div className={`mt-8 flex items-center gap-2 text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Lock size={14} /> End-to-end encrypted
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;