
import { Club, Applicant, Registration, Event, AuditLog, User, Role, ClubRole, Inquiry, SavedEvent, Message, Notification, SessionArchive, TeamMember, Mentor, DevConfig, PollOption } from './types';
import { DEMO_USERS, CLUBS, EVENTS, INITIAL_APPLICANTS, INITIAL_REGISTRATIONS, INITIAL_AUDIT_LOGS } from './constants';
import { supabase } from './lib/supabase';

// --- Helpers for Chat Mapping ---

const mapMessageFromDB = (dbMsg: any): Message => ({
    id: dbMsg.id,
    senderId: dbMsg.sender_id,
    senderName: dbMsg.sender_name,
    content: dbMsg.content,
    timestamp: dbMsg.timestamp,
    clubId: dbMsg.club_id,
    recipientId: dbMsg.recipient_id,
    type: dbMsg.type as any,
    status: dbMsg.status as any,
    mediaUrl: dbMsg.media_url,
    latitude: dbMsg.latitude,
    longitude: dbMsg.longitude,
    pollQuestion: dbMsg.poll_data?.question,
    pollOptions: dbMsg.poll_data?.options
});

const mapMessageToDB = (msg: Message) => ({
    id: msg.id,
    sender_id: msg.senderId,
    sender_name: msg.senderName,
    content: msg.content,
    timestamp: msg.timestamp,
    club_id: msg.clubId,
    recipient_id: msg.recipientId,
    type: msg.type,
    status: msg.status,
    media_url: msg.mediaUrl,
    latitude: msg.latitude,
    longitude: msg.longitude,
    poll_data: msg.type === 'poll' ? { question: msg.pollQuestion, options: msg.pollOptions } : null
});

class InstitutionalAPI {
  // OFFLINE FIRST: Default to true to prevent initial render crashes if API is down
  private isOfflineMode = true; 
  private hasInitialized = false;
  private STORAGE_PREFIX = 'MITS_CCMS_V2_';

  // --- Core Utility: Fail-Fast Network Wrapper ---
  private async network<T>(
    promise: Promise<{ data: T | null; error: any }>, 
    fallbackData: any
  ): Promise<T | any> {
    if (this.isOfflineMode) return fallbackData;

    try {
      const TIMEOUT_MS = 3000;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network Timeout')), TIMEOUT_MS)
      );

      const response = await Promise.race([promise, timeoutPromise]) as any;
      
      if (response?.error) throw response.error;
      return response?.data ?? fallbackData;
    } catch (err) {
      console.warn("System switching to Isolated Mode (Network/Timeout Error):", err);
      this.isOfflineMode = true; // Switch to offline on failure
      return fallbackData;
    }
  }

  // Initial connectivity check
  async initialize(): Promise<void> {
    if (this.hasInitialized) return;
    try {
        const { data, error } = await supabase.from('clubs').select('id').limit(1);
        if (!error) {
            this.isOfflineMode = false;
            console.log("Institutional Mainframe Connected: Online Mode");
        } else {
            console.warn("Institutional Mainframe Unreachable: Offline Mode Active");
        }
    } catch (e) {
        console.warn("Network unreachable, staying in Offline Mode");
    }
    this.hasInitialized = true;
  }

  private getLocal<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  private setLocal<T>(key: string, value: T) {
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (e) {
      // Ignore storage errors
    }
  }

  // --- USER MOCK HELPERS (Simulate Online/Last Seen) ---
  getUserStatus(userId: string) {
      // Simulate randomization for demo purposes
      const isOnline = Math.random() > 0.5;
      const lastSeen = new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString();
      return { isOnline, lastSeen };
  }
  
  // --- Chat & Notifications ---
  async getMessages(clubId?: string, userId?: string, otherUserId?: string): Promise<Message[]> {
    if (!this.isOfflineMode) {
        try {
            let query = supabase.from('messages').select('*');
            
            if (clubId) {
                query = query.eq('club_id', clubId);
            } else if (userId && otherUserId) {
                // OR logic for DM: (sender=A AND recipient=B) OR (sender=B AND recipient=A)
                query = query.or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`);
            } else {
                return [];
            }

            const { data, error } = await query.order('timestamp', { ascending: true });
            
            if (error) throw error;
            if (data) return data.map(mapMessageFromDB);
        } catch (e) {
            console.warn("Chat Sync Error (Using Cache):", e);
        }
    }

    const allMessages = this.getLocal<Message[]>('MESSAGES', []);
    
    // Simulate updating status to 'read' if fetching locally
    const updatedMessages = allMessages.map(m => {
        if (m.recipientId === userId && m.status !== 'read') {
            return { ...m, status: 'read' as const };
        }
        return m;
    });
    
    // If we updated statuses, save back
    if (JSON.stringify(allMessages) !== JSON.stringify(updatedMessages)) {
        this.setLocal('MESSAGES', updatedMessages);
    }

    if (clubId) {
        return updatedMessages.filter(m => m.clubId === clubId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    if (userId && otherUserId) {
        return updatedMessages.filter(m => 
            (m.senderId === userId && m.recipientId === otherUserId) || 
            (m.senderId === otherUserId && m.recipientId === userId)
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    return [];
  }

  async sendMessage(message: Message): Promise<void> {
    // 1. Optimistic Local Update
    const allMessages = this.getLocal<Message[]>('MESSAGES', []);
    this.setLocal('MESSAGES', [...allMessages, message]);
    
    // 2. Network Sync
    if (!this.isOfflineMode) {
        try {
            const dbPayload = mapMessageToDB(message);
            const { error } = await supabase.from('messages').insert(dbPayload);
            if (error) throw error;
        } catch (e) {
            console.error("Message Send Error:", e);
        }
    }

    // 3. Simulate Push Notification (if DM)
    if (message.recipientId) {
       this.sendNotification({
           id: `notif-${Date.now()}`,
           title: `New Message from ${message.senderName}`,
           message: message.type === 'text' ? (message.content || 'Sent a message') : `Sent a ${message.type}`,
           type: 'info',
           timestamp: new Date().toISOString(),
           read: false,
           senderName: message.senderName
       });
    }
  }

  async votePoll(messageId: string, optionId: string, userId: string): Promise<void> {
      // 1. Local Optimistic Update
      const allMessages = this.getLocal<Message[]>('MESSAGES', []);
      const msgIndex = allMessages.findIndex(m => m.id === messageId);
      
      let updatedMessage: Message | null = null;

      if (msgIndex >= 0 && allMessages[msgIndex].type === 'poll' && allMessages[msgIndex].pollOptions) {
          const msg = allMessages[msgIndex];
          const updatedOptions = msg.pollOptions!.map(opt => ({
              ...opt,
              votes: opt.votes.filter(v => v !== userId) // remove existing vote
          }));
          
          const targetOption = updatedOptions.find(o => o.id === optionId);
          if (targetOption) {
              targetOption.votes.push(userId);
          }
          
          updatedMessage = { ...msg, pollOptions: updatedOptions };
          allMessages[msgIndex] = updatedMessage;
          this.setLocal('MESSAGES', allMessages);
      }

      // 2. Network Update
      if (!this.isOfflineMode && updatedMessage) {
          try {
             // Fetch latest to ensure we don't overwrite others' votes (simple concurrency handling)
             const { data: remoteMsg } = await supabase.from('messages').select('*').eq('id', messageId).single();
             if (remoteMsg) {
                 const msg = mapMessageFromDB(remoteMsg);
                 if (msg.pollOptions) {
                     const updatedOptions = msg.pollOptions.map(opt => ({
                        ...opt,
                        votes: opt.votes.filter(v => v !== userId)
                     }));
                     const target = updatedOptions.find(o => o.id === optionId);
                     if (target) target.votes.push(userId);
                     
                     const dbPayload = mapMessageToDB({ ...msg, pollOptions: updatedOptions });
                     await supabase.from('messages').update({ poll_data: dbPayload.poll_data }).eq('id', messageId);
                 }
             }
          } catch (e) {
              console.error("Poll Vote Error:", e);
          }
      }
  }

  async getUsers(): Promise<User[]> {
    if (!this.isOfflineMode) {
       // Ideally fetch from DB, but for demo continuity we might mix strategies
       // keeping local mock for consistency if DB is empty
    }
    const users = this.getLocal<User[]>('USERS', DEMO_USERS);
    return users.map(u => {
        const { isOnline, lastSeen } = this.getUserStatus(u.id);
        return { ...u, isOnline, lastSeen };
    });
  }
  
  async getUser(id: string): Promise<User | null> {
      // 1. Try Network (Supabase) to get latest profile with enrollment number
      if (!this.isOfflineMode) {
          try {
              const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
              if (data && !error) {
                  return {
                      id: data.id,
                      name: data.name,
                      email: data.email,
                      globalRole: data.global_role as Role,
                      enrollmentNumber: data.enrollment_number, // Ensure enrollment number is fetched
                      branch: data.branch,
                      photoUrl: data.photo_url,
                      signatureUrl: data.signature_url,
                      linkedin: data.linkedin,
                      github: data.github,
                      phoneNumber: data.phone_number,
                      profileLocked: data.profile_locked,
                      skills: data.skills || [],
                      clubMemberships: data.club_memberships || [],
                      isOnline: false, 
                      lastSeen: new Date().toISOString()
                  };
              }
          } catch (e) {
              console.warn("User Fetch Error (DB):", e);
          }
      }

      // 2. Fallback to Local Storage
      const users = await this.getUsers();
      return users.find(u => u.id === id) || null;
  }

  async saveUser(user: User): Promise<User> {
    // 1. Local Update (Optimistic)
    const users = [...this.getLocal<User[]>('USERS', DEMO_USERS)];
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) users[existingIndex] = user; else users.push(user);
    this.setLocal('USERS', users);
    
    // 2. Supabase Sync (Persistence)
    if (!this.isOfflineMode) {
        try {
            const dbPayload = {
                id: user.id,
                name: user.name,
                email: user.email,
                global_role: user.globalRole,
                enrollment_number: user.enrollmentNumber, // Persist Enrollment Number
                branch: user.branch,
                photo_url: user.photoUrl,
                signature_url: user.signatureUrl,
                linkedin: user.linkedin,
                github: user.github,
                phone_number: user.phoneNumber,
                profile_locked: user.profileLocked,
                skills: user.skills,
                club_memberships: user.clubMemberships,
                updated_at: new Date().toISOString()
            };
            
            const { error } = await supabase.from('profiles').upsert(dbPayload, { onConflict: 'id' });
            if (error) console.error("Supabase User Sync Error:", error);
        } catch (e) {
            console.error("Supabase Sync Exception:", e);
        }
    }
    
    return user;
  }
  
  // --- Standard Data Accessors (Local Only for Demo Speed, or Mocked) ---
  async getClubs() { return this.getLocal('CLUBS', CLUBS); }
  async getEvents() { return this.getLocal('EVENTS', EVENTS); }
  async getRegistrations() { return this.getLocal('REGISTRATIONS', INITIAL_REGISTRATIONS); }
  async getApplicants() { return this.getLocal('APPLICANTS', INITIAL_APPLICANTS); }
  async getLogs() { return this.getLocal('LOGS', INITIAL_AUDIT_LOGS); }
  async getSavedEvents(userId: string) { return this.getLocal<SavedEvent[]>('SAVED_EVENTS', []); }
  
  async toggleSavedEvent(userId: string, eventId: string) { 
      const saved = this.getLocal<SavedEvent[]>('SAVED_EVENTS', []);
      const exists = saved.find(s => s.userId === userId && s.eventId === eventId);
      let newSaved;
      if (exists) {
          newSaved = saved.filter(s => !(s.userId === userId && s.eventId === eventId));
      } else {
          newSaved = [...saved, { userId, eventId }];
      }
      this.setLocal('SAVED_EVENTS', newSaved);
      return true; 
  }

  async saveEvent(event: Event) { 
      const events = this.getLocal<Event[]>('EVENTS', EVENTS);
      this.setLocal('EVENTS', [...events, event]);
      return event; 
  }

  async saveRegistration(reg: Registration) { 
      const regs = this.getLocal<Registration[]>('REGISTRATIONS', INITIAL_REGISTRATIONS);
      const index = regs.findIndex(r => r.id === reg.id);
      if (index >= 0) regs[index] = reg; else regs.push(reg);
      this.setLocal('REGISTRATIONS', regs);
  }

  async addLog(log: AuditLog) { 
      const logs = this.getLocal<AuditLog[]>('LOGS', INITIAL_AUDIT_LOGS);
      this.setLocal('LOGS', [log, ...logs]);
  }

  async sendNotification(n: Notification) { 
      const all = this.getLocal<Notification[]>('NOTIFICATIONS', []);
      this.setLocal('NOTIFICATIONS', [n, ...all]);
  }

  async getNotifications() { return this.getLocal<Notification[]>('NOTIFICATIONS', []); }
  
  async getDevelopers() { return this.getLocal<TeamMember[]>('DEVELOPERS', []); }
  async saveDeveloper(d: TeamMember) { 
      const devs = this.getLocal<TeamMember[]>('DEVELOPERS', []);
      const idx = devs.findIndex(x => x.id === d.id);
      if (idx >= 0) devs[idx] = d; else devs.push(d);
      this.setLocal('DEVELOPERS', devs);
  }
  async deleteDeveloper(id: string) {
      const devs = this.getLocal<TeamMember[]>('DEVELOPERS', []);
      this.setLocal('DEVELOPERS', devs.filter(d => d.id !== id));
  }

  async getMentors() { return this.getLocal<Mentor[]>('MENTORS', []); }
  
  async saveMentor(m: Mentor) {
      const list = this.getLocal<Mentor[]>('MENTORS', []);
      const idx = list.findIndex(x => x.id === m.id);
      if (idx >= 0) {
          list[idx] = m;
      } else {
          list.push(m);
      }
      this.setLocal('MENTORS', list);
  }
  
  async deleteMentor(id: string) {
      const list = this.getLocal<Mentor[]>('MENTORS', []);
      this.setLocal('MENTORS', list.filter(m => m.id !== id));
  }

  async getDevConfig() { return this.getLocal<DevConfig>('DEV_CONFIG', null as any); }
  async saveDevConfig(c: DevConfig) { this.setLocal('DEV_CONFIG', c); }

  async deleteUser(id: string) {
      const users = this.getLocal<User[]>('USERS', DEMO_USERS);
      this.setLocal('USERS', users.filter(u => u.id !== id));
  }

  async addClub(c: Club) { 
      const clubs = this.getLocal<Club[]>('CLUBS', CLUBS);
      this.setLocal('CLUBS', [...clubs, c]);
      return c; 
  }

  async updateClub(c: Club) {
      const clubs = this.getLocal<Club[]>('CLUBS', CLUBS);
      const idx = clubs.findIndex(x => x.id === c.id);
      if (idx >= 0) clubs[idx] = c;
      this.setLocal('CLUBS', clubs);
  }

  async deleteEvent(id: string) {
      const events = this.getLocal<Event[]>('EVENTS', EVENTS);
      this.setLocal('EVENTS', events.filter(e => e.id !== id));
  }

  async saveApplicant(a: Applicant) {
      const apps = this.getLocal<Applicant[]>('APPLICANTS', INITIAL_APPLICANTS);
      this.setLocal('APPLICANTS', [...apps, a]);
  }

  async appointPresident(cId: string, sId: string) {
      const clubs = await this.getClubs();
      const club = clubs.find(c => c.id === cId);
      const user = await this.getUser(sId);
      
      if (club && user) {
          // Update Club
          club.leadership['President'] = user.name;
          await this.updateClub(club);
          
          // Update User
          user.clubMemberships = user.clubMemberships.filter(m => m.clubId !== cId);
          user.clubMemberships.push({ clubId: cId, role: ClubRole.PRESIDENT });
          await this.saveUser(user);
      }
  }

  async assignFaculty(cId: string, faculty: User) {
      const clubs = await this.getClubs();
      const club = clubs.find(c => c.id === cId);
      if (club) {
          club.facultyCoordinatorId = faculty.id;
          club.facultyCoordinatorNames = [faculty.name];
          await this.updateClub(club);
      }
  }

  generateRandomPassword() { return Math.random().toString(36).slice(-8).toUpperCase(); }
}

export const db = new InstitutionalAPI();
