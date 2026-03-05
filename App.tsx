import React, { useState, useEffect } from 'react';
import { User, Club, Applicant, Event, Role, ClubRole, AuditLog, Registration, Quotation, Achievement } from './types';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';
import Onboarding from './components/pages/Onboarding';
import LandingPage from './components/pages/LandingPage';
import { db } from './db';
import { supabase } from './lib/supabase';
import { ShieldAlert, AlertTriangle, Save } from 'lucide-react';

// Page Components
import GlobalStudentDashboard from './components/pages/GlobalStudentDashboard';
import ClubHome from './components/pages/ClubHome';
import ClubMembers from './components/pages/ClubMembers';
import AttendanceControl from './components/pages/AttendanceControl';
import EventOperations from './components/pages/EventOperations';
import ClubFinance from './components/pages/ClubFinance';
import RecruitmentBoard from './components/RecruitmentBoard';
import CertificationGovernance from './components/pages/CertificationGovernance';
import ClubPublicWebsite from './components/pages/ClubPublicWebsite';
import ClubSiteEditor from './components/pages/ClubSiteEditor';
import ClubSettings from './components/pages/ClubSettings';
import MyApplications from './components/pages/MyApplications';
import MyTickets from './components/pages/MyTickets';
import MyPayments from './components/pages/MyPayments';
import MyCertificates from './components/pages/MyCertificates';
import CampusEvents from './components/pages/CampusEvents';
import GlobalClubs from './components/pages/GlobalClubs';
import StudentProfile from './components/pages/StudentProfile';
import FacultyFeed from './components/pages/FacultyFeed';
import FacultyOversight from './components/pages/FacultyOversight';
import InstitutionalKPIs from './components/pages/InstitutionalKPIs';
import SuperAdminHub from './components/pages/SuperAdminHub';
import StudentRegistry from './components/pages/StudentRegistry';
import FacultyRegistry from './components/pages/FacultyRegistry';
import GlobalAnalytics from './components/pages/GlobalAnalytics';
import SystemLogs from './components/pages/SystemLogs';
import Developers from './components/pages/Developers';
import ChatSystem from './components/pages/ChatSystem';

// Public Pages
import { LegalDocs, ReportIssue, FacultyPortalInfo, StudentLeadership } from './components/pages/PublicPages';
import EventRegistry from './components/pages/EventRegistry';
import ClubDirectoryPublic from './components/pages/ClubDirectoryPublic';
import PlatformFeatures from './components/pages/PlatformFeatures';
import LiveFeedPublic from './components/pages/LiveFeedPublic';
import CertificateVerification from './components/pages/CertificateVerification';

type AppView = 'landing' | 'auth' | 'dashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeContext, setActiveContext] = useState<string>('Global');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [pendingRollNumber, setPendingRollNumber] = useState('');
  
  // New State for Public Overlays
  const [publicPage, setPublicPage] = useState<string | null>(null);

  const [data, setData] = useState<{
    users: User[];
    clubs: Club[];
    events: Event[];
    registrations: Registration[];
    applicants: Applicant[];
    logs: AuditLog[];
  }>({
    users: [],
    clubs: [],
    events: [],
    registrations: [],
    applicants: [],
    logs: []
  });

  useEffect(() => {
    const init = async () => {
      try {
        await db.initialize();
        // Always fetch public data (clubs/events) for the Landing Page
        const [clubs, events, logs] = await Promise.all([
          db.getClubs(),
          db.getEvents(),
          db.getLogs()
        ]);
        setData(prev => ({ ...prev, clubs, events, logs }));
        refreshData();
      } catch (err) {
        console.error("Initialization Failed:", err);
      }
    };
    init();
  }, []);

  // When user logs in, switch to dashboard and load restricted data
  useEffect(() => {
    if (currentUser) {
      setCurrentView('dashboard');
      refreshData();
    } else {
      // If logged out, ensure we stay on landing or auth
      if (currentView === 'dashboard') setCurrentView('landing');
    }
  }, [currentUser]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const refreshData = async () => {
    try {
        const [clubs, events] = await Promise.all([
          db.getClubs(),
          db.getEvents()
        ]);

        let users: User[] = [];
        let registrations: Registration[] = [];
        let applicants: Applicant[] = [];
        let logs: AuditLog[] = [];

        // Only fetch sensitive data if authenticated
        if (currentUser) {
            [users, registrations, applicants, logs] = await Promise.all([
                db.getUsers(),
                db.getRegistrations(),
                db.getApplicants(),
                db.getLogs()
            ]);
        } else {
            // Fetch logs for public ticker
            logs = await db.getLogs();
        }

        setData({ users, clubs, events, registrations, applicants, logs });
    } catch (e) {
        console.error("Data Refresh Failed:", e);
    }
  };

  const handleContextChange = (contextId: string) => {
    setActiveContext(contextId);
    setActiveTab(contextId === 'Global' ? 'dashboard' : 'club-dashboard');
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Logout Error:", e);
    }
    setCurrentUser(null);
    setActiveContext('Global');
    setActiveTab('dashboard');
    setCurrentView('landing');
  };

  const handleUpdateMissingRoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && pendingRollNumber.trim()) {
        const updatedUser = { ...currentUser, enrollmentNumber: pendingRollNumber.trim().toUpperCase() };
        await db.saveUser(updatedUser);
        setCurrentUser(updatedUser); // Update local state immediately
        await refreshData();
    }
  };

  // --- Actions ---

  const handleRegisterEvent = async (eventId: string, proxy?: { name: string, roll: string, branch: string }) => {
    if (!currentUser) {
        // If coming from Landing page
        setCurrentView('auth');
        return;
    }
    
    const event = data.events.find(e => e.id === eventId);
    if (!event) return;

    let studentName = currentUser.name;
    let studentId = currentUser.id;
    let studentRoll = currentUser.enrollmentNumber || 'PENDING';
    let studentBranch = currentUser.branch;

    if (proxy) {
        studentName = proxy.name;
        studentId = `proxy-${Date.now()}`; 
        studentRoll = proxy.roll;
        studentBranch = proxy.branch;
    }

    const isFree = event.type === 'Free';
    const ticketId = isFree ? `TKT-${event.id.split('-')[1].toUpperCase()}-${Date.now().toString().slice(-6)}` : undefined;

    const registration: Registration = {
      id: `reg-${Date.now()}`,
      eventId,
      studentId,
      studentName,
      studentRoll,
      studentBranch,
      status: isFree ? 'Approved' : 'Pending', 
      paymentType: isFree ? 'Free' : 'UPI',
      ticketId: ticketId,
      attendanceMarked: false
    };

    await db.saveRegistration(registration);
    await db.addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: currentUser.name,
      action: `Registered ${proxy ? '(Proxy) ' : ''}for ${event.title}${isFree ? ' - Ticket Issued' : ' - Pending Payment'}`,
      clubId: event.clubId
    });
    
    await refreshData();
    
    if (!proxy) {
       setTimeout(() => {
           alert(isFree ? "Registration Successful! Ticket generated." : "Registration Pending. Please complete payment verification.");
       }, 100);
    }
  };

  const handleApprovePayment = async (id: string) => {
    const reg = data.registrations.find(r => r.id === id);
    if (!reg) return;
    
    // Generate Ticket on Approval
    const event = data.events.find(e => e.id === reg.eventId);
    const idPart = event ? (event.id.includes('-') ? event.id.split('-')[1] : event.id.slice(0, 4)) : 'EVT';
    const ticketId = `TKT-${idPart.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    
    const updatedReg: Registration = { 
        ...reg, 
        status: 'Approved', 
        ticketId: ticketId 
    };
    
    await db.saveRegistration(updatedReg);
    await db.addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: currentUser?.name || 'System',
      action: `Payment Verified & Ticket Issued for ${reg.studentName}`,
      clubId: event?.clubId
    });
    
    refreshData();
  };

  const handleUpdateRegistration = async (reg: Registration) => { await db.saveRegistration(reg); refreshData(); };
  const handleApplicantMove = async (id: string, stage: Applicant['stage']) => { /* ... */ };
  const handleApplicantDomainUpdate = async (id: string, domain: string) => { /* ... */ };
  const handleNewRecruitmentCycle = async (clubId: string) => { /* ... */ };
  const handleUpdateUser = async (user: User) => { await db.saveUser(user); if (currentUser && currentUser.id === user.id) setCurrentUser(user); refreshData(); };
  const handleRemoveUser = async (id: string) => { await db.deleteUser(id); refreshData(); };
  const handleAddUser = async (user: User) => { await db.saveUser(user); refreshData(); };
  const handleFreezeClub = async (id: string) => { /* ... */ };
  const handleAddClub = async (club: Club) => { await db.addClub(club); refreshData(); };
  const handleAppointPresident = async (cId: string, sId: string) => { await db.appointPresident(cId, sId); await refreshData(); };
  const handleAssignFaculty = async (cId: string, faculty: User) => { await db.assignFaculty(cId, faculty); await refreshData(); };
  const handleSaveEvent = async (event: Event) => { await db.saveEvent(event); refreshData(); };
  const handleDeleteEvent = async (eventId: string) => { await db.deleteEvent(eventId); refreshData(); };
  const handleApproveEvent = async (id: string) => { /* ... */ };
  const handleMarkAttendance = async (id: string, status: boolean) => { 
      // Optimistic update for UI responsiveness
      const reg = data.registrations.find(r => r.id === id);
      if (reg) {
          const updatedReg = { ...reg, attendanceMarked: status };
          setData(prev => ({
              ...prev,
              registrations: prev.registrations.map(r => r.id === id ? updatedReg : r)
          }));
          await db.saveRegistration(updatedReg); 
          refreshData(); 
      }
  };
  const handleIssueCertificateBatch = async (batch: any) => { /* ... */ };
  const handleUpdateClubQuotation = async (id: string, q: Quotation[]) => { /* ... */ };
  const handleUpdateClubQr = async (id: string, url: string) => { /* ... */ };
  const handleNewApplication = async (data: any) => { /* ... */ };
  const handleSwitchRole = async (targetRole: Role) => { /* ... */ };

  // --- View Routing ---

  const closePublicPage = () => setPublicPage(null);

  // Render Public Page Overlay
  if (publicPage) {
    switch (publicPage) {
      case 'platform':
        return <PlatformFeatures onBack={closePublicPage} />;
      case 'live-feed':
        return <LiveFeedPublic events={data.events} logs={data.logs} onBack={closePublicPage} />;
      case 'events':
        return <EventRegistry events={data.events} clubs={data.clubs} onBack={closePublicPage} />;
      case 'clubs':
        return <ClubDirectoryPublic clubs={data.clubs} onBack={closePublicPage} />;
      case 'leadership':
        return <StudentLeadership clubs={data.clubs} users={data.users} onBack={closePublicPage} />;
      case 'faculty':
        return <FacultyPortalInfo onBack={closePublicPage} onLogin={() => { closePublicPage(); setCurrentView('auth'); }} />;
      case 'privacy':
        return <LegalDocs type="privacy" onBack={closePublicPage} />;
      case 'tos':
        return <LegalDocs type="tos" onBack={closePublicPage} />;
      case 'report':
        return <ReportIssue onBack={closePublicPage} />;
      case 'developers':
        return <Developers onBack={closePublicPage} isDarkMode={isDarkMode} mode="console" />;
      case 'verify-cert':
        return <CertificateVerification onBack={closePublicPage} />;
      default:
        // developer pages are handled by activeTab in dashboard flow, but if accessed from landing footer:
        if (publicPage === 'developers') {
             return <Developers onBack={closePublicPage} isDarkMode={isDarkMode} mode="console" />;
        }
        closePublicPage();
        return null;
    }
  }

  // Handle Developer Views (Original logic preserved but integrated into new footer)
  if (activeTab === 'developer-profile' && !currentUser) {
      return <Developers onBack={() => setActiveTab('dashboard')} isDarkMode={isDarkMode} mode="public" />;
  }
  if (activeTab === 'developers' && !currentUser) {
      return <Developers onBack={() => setActiveTab('dashboard')} isDarkMode={isDarkMode} mode="console" />;
  }

  if (currentView === 'landing' && !currentUser) {
    return (
        <>
            <LandingPage 
                events={data.events}
                clubs={data.clubs}
                onLogin={() => setCurrentView('auth')}
                onRegister={() => setCurrentView('auth')}
                isDarkMode={isDarkMode}
                onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                onOpenDeveloper={() => setActiveTab('developers')}
                onOpenProfile={() => setActiveTab('developer-profile')}
                onNavigate={setPublicPage}
            />
        </>
    );
  }

  if (currentView === 'auth' && !currentUser) {
    return (
        <>
            <Onboarding 
                onSelectRole={setCurrentUser} 
                isDarkMode={isDarkMode}
                onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                onOpenDeveloper={() => setActiveTab('developers')}
                onOpenProfile={() => setActiveTab('developer-profile')}
                onNavigate={setPublicPage}
            />
        </>
    );
  }

  // --- Main Dashboard Logic ---
  if (!currentUser) return null;

  // BLOCKING MODAL: Missing Roll Number
  const isMissingRollNo = !currentUser.enrollmentNumber || currentUser.enrollmentNumber === 'PENDING';
  
  if (isMissingRollNo) {
      return (
          <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-[#02040a]' : 'bg-gray-100'}`}>
              <div className={`max-w-md w-full p-10 rounded-[3rem] shadow-2xl border text-center space-y-8 animate-in zoom-in-95 ${isDarkMode ? 'bg-[#111C44] border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-3xl flex items-center justify-center mx-auto">
                      <AlertTriangle size={40} />
                  </div>
                  <div>
                      <h2 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-[#1B2559]'}`}>Missing Credentials</h2>
                      <p className="text-slate-500 font-medium text-sm">Institutional protocol requires a valid Enrollment Number to access the dashboard.</p>
                  </div>
                  <form onSubmit={handleUpdateMissingRoll} className="space-y-4">
                      <input 
                        required
                        autoFocus
                        value={pendingRollNumber}
                        onChange={(e) => setPendingRollNumber(e.target.value.toUpperCase())}
                        placeholder="Enrollment No. (e.g. 0901CS211001)"
                        className={`w-full px-6 py-4 rounded-2xl border outline-none font-bold text-center uppercase tracking-widest ${
                            isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-200 text-[#1B2559] focus:border-amber-500'
                        }`}
                      />
                      <button className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2">
                          <Save size={16} /> Update Identity
                      </button>
                  </form>
              </div>
          </div>
      );
  }

  // Determine permissions
  const userRole = currentUser.globalRole;
  const userClubRole = currentUser.clubMemberships.find(m => m.clubId === activeContext)?.role || null;
  const currentClub = data.clubs.find(c => c.id === activeContext);

  const renderContent = () => {
    // Global Views
    if (activeContext === 'Global') {
      switch (activeTab) {
        case 'dashboard':
          return <GlobalStudentDashboard user={currentUser} events={data.events} clubs={data.clubs} certCount={data.registrations.filter(r => r.studentId === currentUser.id && r.certificateId).length} onRegister={handleRegisterEvent} isDarkMode={isDarkMode} logs={data.logs} registrations={data.registrations} applicants={data.applicants} />;
        // ... all other cases ...
        case 'admin-dashboard':
          return <SuperAdminHub clubs={data.clubs} allUsers={data.users} onFreeze={handleFreezeClub} onEnterClub={handleContextChange} onAddClub={handleAddClub} onAppointPresident={handleAppointPresident} onAssignFaculty={handleAssignFaculty} onAddUser={handleAddUser} isDarkMode={isDarkMode} />;
        case 'chat':
          return <ChatSystem user={currentUser} clubs={data.clubs} allUsers={data.users} activeContext={activeContext} isDarkMode={isDarkMode} />;
        case 'student-registry':
          return <StudentRegistry allUsers={data.users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onRemoveUser={handleRemoveUser} isDarkMode={isDarkMode} />;
        case 'faculty-registry':
          return <FacultyRegistry allUsers={data.users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onRemoveUser={handleRemoveUser} isDarkMode={isDarkMode} />;
        case 'clubs':
          return <GlobalClubs clubs={data.clubs} isDarkMode={isDarkMode} onEnterClub={handleContextChange} />;
        case 'analytics':
          return <GlobalAnalytics clubs={data.clubs} users={data.users} events={data.events} registrations={data.registrations} applicants={data.applicants} isDarkMode={isDarkMode} />;
        case 'global-audit':
          return <SystemLogs logs={data.logs} isDarkMode={isDarkMode} />;
        case 'faculty-dashboard':
          return <FacultyFeed user={currentUser} clubs={data.clubs} onManageClub={handleContextChange} />;
        case 'approvals':
          return <FacultyOversight events={data.events} clubs={data.clubs} onApprove={handleApproveEvent} />;
        case 'reports':
          return <InstitutionalKPIs clubs={data.clubs} events={data.events} registrations={data.registrations} applicants={data.applicants} />;
        case 'profile':
          return <StudentProfile user={currentUser} onSave={handleUpdateUser} isDarkMode={isDarkMode} registrations={data.registrations} applicants={data.applicants} events={data.events} />;
        case 'recruitment':
          return <MyApplications applicants={data.applicants} clubs={data.clubs} userName={currentUser.name} isDarkMode={isDarkMode} />;
        case 'events':
          return <CampusEvents events={data.events} clubs={data.clubs} registrations={data.registrations} onRegister={handleRegisterEvent} isDarkMode={isDarkMode} user={currentUser} />;
        case 'certificates':
          return <MyCertificates registrations={data.registrations} clubs={data.clubs} events={data.events} />;
        case 'tickets':
          return <MyTickets registrations={data.registrations.filter(r => r.studentId === currentUser.id)} events={data.events} clubs={data.clubs} isDarkMode={isDarkMode} />;
        case 'payments':
          return <MyPayments registrations={data.registrations.filter(r => r.studentId === currentUser.id)} applicants={data.applicants.filter(a => a.name === currentUser.name)} events={data.events} clubs={data.clubs} isDarkMode={isDarkMode} />;
        case 'developers':
          return <Developers 
            onBack={() => setActiveTab(currentUser.globalRole === Role.SUPER_ADMIN ? 'admin-dashboard' : 'dashboard')} 
            isDarkMode={isDarkMode} 
            currentUser={currentUser}
            allUsers={data.users}
            mode="console"
          />;
        case 'developer-profile':
          return <Developers 
            onBack={() => setActiveTab(currentUser.globalRole === Role.SUPER_ADMIN ? 'admin-dashboard' : 'dashboard')} 
            isDarkMode={isDarkMode} 
            currentUser={currentUser}
            mode="public"
          />;
        default:
          return currentUser.globalRole === Role.FACULTY ? <FacultyFeed user={currentUser} clubs={data.clubs} onManageClub={handleContextChange} /> : <GlobalStudentDashboard user={currentUser} events={data.events} clubs={data.clubs} certCount={0} onRegister={handleRegisterEvent} isDarkMode={isDarkMode} logs={data.logs} registrations={data.registrations} applicants={data.applicants} />;
      }
    }

    if (!currentClub) return <div>Club Not Found</div>;

    // ... Firewall Logic ...
    const isGlobalAdmin = currentUser.globalRole === Role.SUPER_ADMIN || currentUser.globalRole === Role.FACULTY;
    const isClubAdmin = userClubRole && userClubRole !== ClubRole.MEMBER;
    const isAuthorized = activeTab === 'website' || activeTab === 'chat' || isGlobalAdmin || isClubAdmin;

    if (!isAuthorized) {
        return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-8 p-8 animate-in fade-in zoom-in-95">
            <div className="w-32 h-32 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-2xl shadow-rose-500/10 relative">
                <ShieldAlert size={64} />
                <div className="absolute inset-0 bg-rose-500/10 blur-xl rounded-full -z-10" />
            </div>
            <div className="space-y-4 max-w-lg">
                <h2 className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#111C44]'}`}>
                    Restricted Access Protocol
                </h2>
                <p className="text-[#A3AED0] font-medium text-lg leading-relaxed">
                    Identity marker <strong>{currentUser.name}</strong> lacks the required security clearance for the <strong>{currentClub.name}</strong> governance mainframe.
                </p>
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={() => setActiveTab('website')}
                    className="px-8 py-4 bg-[#0d121d] border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1a202e] transition-all"
                >
                    View Public Page
                </button>
                <button 
                    onClick={() => handleContextChange('Global')}
                    className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                    Return to Global
                </button>
            </div>
        </div>
      );
    }

    const clubRegs = data.registrations.filter(r => data.events.find(e => e.id === r.eventId)?.clubId === activeContext);
    const clubEvents = data.events.filter(e => e.clubId === activeContext);
    const clubApplicants = data.applicants;

    switch (activeTab) {
      case 'club-dashboard': return <ClubHome club={currentClub} registrations={clubRegs} />;
      case 'chat': return <ChatSystem user={currentUser} clubs={data.clubs} allUsers={data.users} activeContext={activeContext} isDarkMode={isDarkMode} />;
      case 'members': return <ClubMembers clubId={activeContext} clubName={currentClub?.name || ''} isDarkMode={isDarkMode} clubRole={userClubRole} allUsers={data.users} onUpdateUser={handleUpdateUser} applicants={data.applicants} />;
      case 'attendance': return <AttendanceControl registrations={clubRegs} onMark={handleMarkAttendance} onFinalize={() => {}} isDarkMode={isDarkMode} />;
      case 'club-events': return <EventOperations events={clubEvents} registrations={clubRegs} onCreateEvent={handleSaveEvent} onDeleteEvent={handleDeleteEvent} onRegister={handleRegisterEvent} onUpdateRegistration={handleUpdateRegistration} isDarkMode={isDarkMode} isDirectApprovalEnabled={userClubRole === ClubRole.PRESIDENT || currentUser.globalRole === Role.FACULTY} clubId={activeContext} />;
      case 'club-finance': return <ClubFinance club={currentClub} registrations={clubRegs} events={clubEvents} onApprovePayment={handleApprovePayment} onUpdateQuotes={(quotes) => handleUpdateClubQuotation(activeContext, quotes)} onUpdateQr={(url) => handleUpdateClubQr(activeContext, url)} isDarkMode={isDarkMode} isFaculty={currentUser.globalRole === Role.FACULTY} />;
      case 'recruitment': return <RecruitmentBoard applicants={clubApplicants} onMove={handleApplicantMove} onUpdateDomain={handleApplicantDomainUpdate} clubRole={userClubRole} clubThemeColor={currentClub?.themeColor || '#2563eb'} onNewCycle={() => handleNewRecruitmentCycle(activeContext)} />;
      case 'certificates': return <CertificationGovernance club={currentClub} registrations={clubRegs} events={clubEvents} onIssueBatch={handleIssueCertificateBatch} allUsers={data.users} />;
      case 'website': return <ClubPublicWebsite club={currentClub} events={clubEvents} members={data.users} currentUser={currentUser} isDarkMode={isDarkMode} onUpdateClub={async (c) => { await db.updateClub(c); await refreshData(); }} onSwitchToDashboard={() => setActiveTab('club-dashboard')} onApply={handleNewApplication} onRegister={handleRegisterEvent} />;
      case 'site-editor': return <ClubSiteEditor club={currentClub} events={clubEvents} onSave={async (c) => { await db.updateClub(c); await refreshData(); }} isDarkMode={isDarkMode} />;
      case 'club-settings': return <ClubSettings club={currentClub} onSave={async (c) => { await db.updateClub(c); await refreshData(); }} isDarkMode={isDarkMode} />;
      default: return <ClubHome club={currentClub} registrations={clubRegs} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#02040a] text-white' : 'bg-[#F4F7FE] text-[#111C44]'}`}>
      <Navbar 
        user={currentUser} 
        clubs={data.clubs}
        activeContext={activeContext}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onGoHome={() => handleContextChange('Global')}
        onOpenProfile={() => { handleContextChange('Global'); setActiveTab('profile'); }}
      />
      
      <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] overflow-hidden">
        <Sidebar 
          user={currentUser}
          clubs={data.clubs}
          activeContext={activeContext}
          onContextChange={handleContextChange}
          userRole={userRole}
          clubRole={userClubRole}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDarkMode={isDarkMode}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onSwitchRole={handleSwitchRole}
        />
        
        <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col pb-24 md:pb-0">
          <div className="flex-1">
            {renderContent()}
          </div>
          <Footer 
            onOpenDeveloper={() => setActiveTab('developers')} 
            onOpenProfile={() => setActiveTab('developer-profile')}
            onNavigate={setPublicPage}
            isDarkMode={isDarkMode} 
            variant="minimal"
          />
        </main>
      </div>

      <MobileNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isDarkMode={isDarkMode} 
      />
    </div>
  );
};

export default App;