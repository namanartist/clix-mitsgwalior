
import React, { useState, useEffect } from 'react';
import { Role, User } from '../../types';
import { DEMO_USERS } from '../../constants';
import { db } from '../../db';
import { supabase } from '../../lib/supabase';
import Footer from '../Footer';
import { 
  ShieldCheck, 
  GraduationCap, 
  Lock,
  ArrowLeft,
  Mail,
  Key,
  User as UserIcon,
  Loader2,
  ShieldAlert,
  Globe,
  Fingerprint,
  Zap,
  Sun,
  Moon
} from 'lucide-react';

interface Props {
  onSelectRole: (user: User) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenDeveloper?: () => void;
  onOpenProfile?: () => void;
  onNavigate?: (page: string) => void;
}

type OnboardingStep = 'role' | 'auth';

const Onboarding: React.FC<Props> = ({ onSelectRole, isDarkMode, onToggleTheme, onOpenDeveloper, onOpenProfile, onNavigate }) => {
  const [step, setStep] = useState<OnboardingStep>('role');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: '',
    enrollment: ''
  });

  // Handle session check on mount
  useEffect(() => {
    const handleSession = async (session: any) => {
      if (session?.user) {
        let userProfile = await db.getUser(session.user.id);
        
        if (!userProfile) {
          const metadata = session.user.user_metadata || {};
          const role = metadata.global_role || Role.STUDENT; 
          
          const newUser: User = {
            id: session.user.id,
            name: metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            globalRole: role,
            clubMemberships: [],
            photoUrl: metadata.avatar_url,
            enrollmentNumber: ''
          };
          
          await db.saveUser(newUser);
          userProfile = newUser;
        }
        
        onSelectRole(userProfile);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_IN' && session) {
        handleSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [onSelectRole]);

  const roles = [
    {
      role: Role.STUDENT,
      title: 'Student Access',
      code: 'STU-01',
      description: 'Participate in events and manage portfolio.',
      icon: GraduationCap,
      color: 'text-blue-400',
      bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      border: isDarkMode ? 'border-blue-500/20' : 'border-blue-100'
    },
    {
      role: Role.FACULTY,
      title: 'Faculty Access',
      code: 'FAC-02',
      description: 'Institutional oversight and approvals.',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
      border: isDarkMode ? 'border-emerald-500/20' : 'border-emerald-100'
    },
    {
      role: Role.SUPER_ADMIN,
      title: 'Admin Console',
      code: 'ROOT-03',
      description: 'System-wide configuration.',
      icon: Lock,
      color: 'text-amber-400',
      bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
      border: isDarkMode ? 'border-amber-500/20' : 'border-amber-100'
    }
  ];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setIsSignUp(true);
    setStep('auth');
    setErrorMsg(null);
  };

  const handleGoToLogin = () => {
    setSelectedRole(null);
    setIsSignUp(false);
    setStep('auth');
    setErrorMsg(null);
  };

  const handleGoogleLogin = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            client_id: '813894100155-tvu5f1qk74p3eo37r8fsu06f7qlp75lk.apps.googleusercontent.com'
          },
          data: selectedRole ? { global_role: selectedRole } : undefined
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("OAuth Error:", err);
      setErrorMsg(err.message || "Google Authentication Failed.");
      setIsSubmitting(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const existingUsers = await db.getUsers();
        if (existingUsers.some(u => u.email.toLowerCase() === authData.email.toLowerCase())) {
            setErrorMsg("Identity Conflict: Email already registered in institutional mainframe.");
            setIsSubmitting(false);
            return;
        }

        const { data: authResult, error: authError } = await supabase.auth.signUp({
          email: authData.email,
          password: authData.password,
          options: { data: { name: authData.name, global_role: selectedRole } }
        });
        if (authError) throw authError;

        if (authResult.user) {
          const newUser: User = {
            id: authResult.user.id,
            name: authData.name,
            email: authData.email,
            globalRole: selectedRole!,
            clubMemberships: [],
            enrollmentNumber: authData.enrollment
          };
          await db.saveUser(newUser);
          onSelectRole(newUser);
        }
      } else {
        const demoUser = DEMO_USERS.find(u => u.email === authData.email && u.password === authData.password);
        if (demoUser) {
           onSelectRole(demoUser);
           return;
        }

        const { data: authResult, error: authError } = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: authData.password,
        });
        if (authError) throw authError;

        if (authResult.user) {
          const userProfile = await db.getUser(authResult.user.id);
          if (userProfile) onSelectRole(userProfile);
          else {
              const newUser: User = {
                  id: authResult.user.id,
                  name: authResult.user.user_metadata?.name || authData.email.split('@')[0],
                  email: authData.email,
                  globalRole: authResult.user.user_metadata?.global_role || Role.STUDENT,
                  clubMemberships: []
              };
              await db.saveUser(newUser);
              onSelectRole(newUser);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication Protocol Failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex h-screen w-full font-sans overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#02040a]' : 'bg-white'}`}>
      
      {/* Theme Toggle Button */}
      <button
        onClick={onToggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full transition-all ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Left Panel */}
      <div className={`hidden lg:flex w-1/2 relative border-r flex-col justify-between p-20 overflow-hidden transition-colors duration-500 ${
          isDarkMode ? 'bg-[#02040a] border-white/5' : 'bg-[#F4F7FE] border-slate-200'
      }`}>
        <div className={`absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] ${
            isDarkMode ? 'from-[#0099FF]/10 via-[#02040a] to-[#02040a]' : 'from-[#0099FF]/5 via-[#F4F7FE] to-[#F4F7FE]'
        }`} />
        
        <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0099FF] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0099FF]/30">
                    <Zap size={20} className="fill-white" />
                </div>
                <span className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>CCMS<span className="text-[#0099FF]">.IO</span></span>
            </div>
            
            <div className="space-y-6">
                <h1 className={`text-6xl font-black tracking-tighter leading-[1.1] ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>
                    Institutional <br />
                    <span className="text-[#0099FF]">Operating System.</span>
                </h1>
                <p className={`text-xl font-medium max-w-md leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-[#A3AED0]'}`}>
                    Secure access to the MITS Gwalior digital campus. Manage events, recruitment, and verified credentials.
                </p>
            </div>
        </div>

        <div className={`relative z-10 flex gap-12 border-t pt-12 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
            <div>
                <p className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>40+</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0099FF] mt-1">Clubs</p>
            </div>
            <div>
                <p className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>10k+</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0099FF] mt-1">Students</p>
            </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className={`w-full lg:w-1/2 h-full relative overflow-y-auto custom-scrollbar flex flex-col ${isDarkMode ? 'bg-[#02040a]' : 'bg-white'}`}>
        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-20">
            
            <div className="w-full max-w-md relative z-10 space-y-12">
                
                {/* Progress */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${step === 'role' ? 'bg-[#0099FF]' : (isDarkMode ? 'bg-slate-800' : 'bg-slate-200')}`} />
                        <div className={`w-12 h-1 rounded-full ${step === 'role' ? 'bg-[#0099FF]' : (isDarkMode ? 'bg-slate-800' : 'bg-slate-200')}`} />
                        <div className={`w-3 h-3 rounded-full ${step === 'auth' ? 'bg-[#0099FF]' : (isDarkMode ? 'bg-slate-800' : 'bg-slate-200')}`} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {step === 'role' ? 'Identification' : 'Verification'}
                    </span>
                </div>

                {step === 'role' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div>
                            <h2 className={`text-4xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Select Access Protocol</h2>
                            <p className={`${isDarkMode ? 'text-slate-400' : 'text-[#A3AED0]'} font-medium`}>Identify your role to proceed.</p>
                        </div>

                        <div className="space-y-4">
                            {roles.map((r) => (
                                <button
                                    key={r.role}
                                    onClick={() => handleRoleSelect(r.role)}
                                    className={`group w-full text-left relative overflow-hidden rounded-[2.5rem] border ${r.border} ${isDarkMode ? 'bg-[#0d121d] hover:bg-[#111C44]' : 'bg-white hover:bg-slate-50 shadow-sm'} transition-all duration-300 hover:scale-[1.02] p-8`}
                                >
                                    <div className="flex items-start gap-6 relative z-10">
                                        <div className={`p-4 rounded-2xl ${r.bg} ${r.color} shrink-0`}>
                                            <r.icon size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>{r.title}</h3>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${r.color} opacity-60`}>{r.code}</span>
                                            </div>
                                            <p className={`text-xs font-medium leading-relaxed pr-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{r.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="text-center pt-8">
                            <button 
                                onClick={handleGoToLogin}
                                className={`text-xs font-bold transition-colors flex items-center justify-center gap-2 mx-auto group ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-[#1B2559]'}`}
                            >
                                Already have credentials? <span className="text-[#0099FF] group-hover:underline">Login directly</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div>
                            <button 
                                onClick={() => setStep('role')} 
                                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors mb-8 ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-[#1B2559]'}`}
                            >
                                <ArrowLeft size={14} /> Back to Identification
                            </button>
                            <h2 className={`text-4xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>
                                {isSignUp ? `Initialize ${selectedRole}` : 'Terminal Access'}
                            </h2>
                            <p className={`${isDarkMode ? 'text-slate-400' : 'text-[#A3AED0]'} font-medium`}>
                                {isSignUp ? 'Establish a new identity record.' : 'Enter secure credentials.'}
                            </p>
                        </div>

                        {errorMsg && (
                            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-3">
                                <ShieldAlert size={16} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            <button 
                                onClick={handleGoogleLogin}
                                disabled={isSubmitting}
                                className={`w-full py-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg ${
                                    isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-[#F4F7FE] text-[#1B2559] hover:bg-slate-200'
                                }`}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Globe size={18} />}
                                Continue with Institutional ID
                            </button>

                            <div className="relative text-center">
                                <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div></div>
                                <span className={`relative px-4 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-[#02040a] text-slate-500' : 'bg-white text-slate-400'}`}>Or Manual Entry</span>
                            </div>

                            <form onSubmit={handleAuthSubmit} className="space-y-6">
                                {isSignUp && (
                                    <div className="space-y-2">
                                        <label className={`text-[10px] font-black uppercase tracking-widest ml-4 ${isDarkMode ? 'text-slate-500' : 'text-[#A3AED0]'}`}>Full Name</label>
                                        <div className="relative group">
                                            <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#0099FF] transition-colors" size={18} />
                                            <input 
                                                required
                                                type="text"
                                                value={authData.name}
                                                onChange={e => setAuthData({...authData, name: e.target.value})}
                                                className={`w-full border rounded-2xl py-5 pl-14 pr-6 font-bold outline-none focus:border-[#0099FF] transition-all ${
                                                    isDarkMode 
                                                    ? 'bg-[#0d121d] border-white/5 text-white placeholder:text-slate-600' 
                                                    : 'bg-[#F4F7FE] border-transparent text-[#1B2559] placeholder:text-slate-400 focus:bg-white focus:shadow-lg'
                                                }`}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ml-4 ${isDarkMode ? 'text-slate-500' : 'text-[#A3AED0]'}`}>Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#0099FF] transition-colors" size={18} />
                                        <input 
                                            required
                                            type="email"
                                            value={authData.email}
                                            onChange={e => setAuthData({...authData, email: e.target.value})}
                                            className={`w-full border rounded-2xl py-5 pl-14 pr-6 font-bold outline-none focus:border-[#0099FF] transition-all ${
                                                isDarkMode 
                                                ? 'bg-[#0d121d] border-white/5 text-white placeholder:text-slate-600' 
                                                : 'bg-[#F4F7FE] border-transparent text-[#1B2559] placeholder:text-slate-400 focus:bg-white focus:shadow-lg'
                                            }`}
                                            placeholder="id@mitsgwl.ac.in"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ml-4 ${isDarkMode ? 'text-slate-500' : 'text-[#A3AED0]'}`}>Password</label>
                                    <div className="relative group">
                                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#0099FF] transition-colors" size={18} />
                                        <input 
                                            required
                                            type="password"
                                            value={authData.password}
                                            onChange={e => setAuthData({...authData, password: e.target.value})}
                                            className={`w-full border rounded-2xl py-5 pl-14 pr-6 font-bold outline-none focus:border-[#0099FF] transition-all ${
                                                isDarkMode 
                                                ? 'bg-[#0d121d] border-white/5 text-white placeholder:text-slate-600' 
                                                : 'bg-[#F4F7FE] border-transparent text-[#1B2559] placeholder:text-slate-400 focus:bg-white focus:shadow-lg'
                                            }`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button 
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-[#0099FF] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#0099FF]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>
                                            <Fingerprint size={18} /> {isSignUp ? 'Create Credentials' : 'Authenticate'}
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="text-center">
                                <button 
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-slate-500 hover:text-[#0099FF]' : 'text-slate-400 hover:text-[#0099FF]'}`}
                                >
                                    {isSignUp ? 'Already authenticated? Login' : 'New here? Register'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        <Footer 
            onOpenDeveloper={onOpenDeveloper || (() => {})} 
            onOpenProfile={onOpenProfile} 
            onNavigate={onNavigate || (() => {})}
            isDarkMode={isDarkMode} 
        />
      </div>
    </div>
  );
};

export default Onboarding;
