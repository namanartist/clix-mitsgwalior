
export enum Role {
  STUDENT = 'Student',
  FACULTY = 'Faculty Coordinator',
  SUPER_ADMIN = 'Super Admin'
}

export enum ClubRole {
  PRESIDENT = 'President',
  VICE_PRESIDENT = 'Vice President',
  SECRETARY = 'Secretary',
  TREASURER = 'Treasurer',
  TECH_HEAD = 'Tech Head',
  CONTENT_HEAD = 'Content Head',
  MANAGEMENT_HEAD = 'Management Head',
  SOCIAL_MEDIA_HEAD = 'Social Media Head',
  MEMBER = 'Member'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; 
  globalRole: Role;
  clubMemberships: ClubMembership[];
  photoUrl?: string;
  signatureUrl?: string;
  linkedin?: string;
  github?: string;
  phoneNumber?: string;
  enrollmentNumber?: string;
  address?: string;
  branch?: string;
  fatherName?: string;
  motherName?: string;
  profileLocked?: boolean;
  skills?: string[];
  lastSeen?: string; // ISO String
  isOnline?: boolean;
}

export interface ClubMembership {
  clubId: string;
  role: ClubRole;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  link?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
  iconName?: string;
}

export interface Quotation {
  id: string;
  title: string;
  vendorName: string;
  amount: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
  fileUrl?: string;
}

export interface PaymentGatewayConfig {
  provider: 'ManualUPI' | 'Razorpay' | 'Stripe' | 'PhonePe';
  apiKey?: string;
  secretKey?: string;
  merchantId?: string;
  isActive: boolean;
}

export type CertificateTemplate = 'classic' | 'modern' | 'tech' | 'minimal' | 'elegant';

export interface CertificateConfig {
  templateId: CertificateTemplate;
  customBackgroundUrl?: string;
  showMITSLogo: boolean;
  showClubLogo: boolean;
  signatureTextFaculty: string;
  signatureTextPresident: string;
}

export interface Club {
  id: string;
  name: string;
  category: 'Technical' | 'Cultural' | 'Social' | 'Sports';
  themeColor: string;
  subdomain: string;
  logoUrl?: string;
  facultyCoordinatorId: string; 
  facultyCoordinatorNames?: string[]; 
  leadership: Record<string, string>; 
  isFrozen?: boolean;
  recruitmentActive?: boolean;
  tagline?: string;
  bannerUrl?: string;
  description?: string;
  achievements?: Achievement[];
  customSections?: CustomSection[];
  defaultUpiQrUrl?: string;
  quotations?: Quotation[];
  paymentGatewayConfig?: PaymentGatewayConfig;
  certificateConfig?: CertificateConfig;
}

export interface Applicant {
  id: string;
  name: string;
  rollNumber: string;
  branch: string;
  domain: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Selected' | 'Rejected';
  whyJoin: string;
  resumeUrl?: string;
  notes?: string;
  recruitmentCycle?: string; 
}

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  studentBranch?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  paymentType: 'Free' | 'UPI' | 'Gateway';
  paymentProofUrl?: string;
  transactionId?: string;
  ticketId?: string;
  attendanceMarked?: boolean;
  certificateId?: string;
}

export interface Event {
  id: string;
  clubId: string;
  title: string;
  description: string;
  type: 'Free' | 'Paid';
  fee?: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
  upiQrUrl?: string;
  bannerUrl?: string;
  isFinalized?: boolean;
  createdBy?: string; 
}

export interface SavedEvent {
  userId: string;
  eventId: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  clubId?: string;
}

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  message: string;
  clubId?: string;
  createdAt?: string;
  status?: 'Pending' | 'In Progress' | 'Resolved';
}

export interface ContextState {
  user: User | null;
  activeContext: 'Global' | string;
}

// --- UPDATED CHAT TYPES ---

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // array of userIds
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content?: string; // Optional if only media/poll
  timestamp: string;
  clubId?: string;
  recipientId?: string;
  
  // New Features
  type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'poll' | 'system';
  status: 'sent' | 'delivered' | 'read';
  
  // Media Fields
  mediaUrl?: string;
  
  // Location Fields
  latitude?: number;
  longitude?: number;
  
  // Poll Fields
  pollQuestion?: string;
  pollOptions?: PollOption[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  senderName?: string;
}

export interface SessionArchive {
  id: string;
  sessionName: string;
  archivedAt: string;
  archivedBy: string;
  data: {
    events: Event[];
    registrations: Registration[];
    applicants: Applicant[];
    logs: AuditLog[];
    messages: Message[];
    notifications: Notification[];
  };
}

// --- DEVELOPER / TEAM TYPES ---

export interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  desc?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  email?: string;
  image?: string; 
  linkedin?: string;
  github?: string;
  isLead: boolean;
  education: Education[];
  experience: Experience[];
  achievements: Achievement[];
}

export interface Mentor {
  id: string;
  name: string;
  designation: string;
  image?: string;
  link?: string;
}

export interface DevConfig {
  developedUnderName: string;
  developedUnderUrl: string;
  developedUnderLogo?: string;
  authorizedEmails: string[];
}
