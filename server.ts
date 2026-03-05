
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'mits-institutional-secret-2026';

app.use(cors());
app.use(express.json());

// --- AUTH MIDDLEWARE ---
interface AuthRequest extends Request {
  user?: any;
}

const authenticate = async (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Identity token required' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired session' });
  }
};

// --- ROUTES ---

// 1. Authentication & Security
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ 
    where: { email },
    include: { clubMemberships: true }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.globalRole }, JWT_SECRET);
  res.json({ token, user });
});

// 2. Identity Ledger (Users)
app.get('/api/users', authenticate, async (req, res) => {
  const users = await prisma.user.findMany({
    include: { clubMemberships: true }
  });
  res.json(users);
});

app.get('/api/users/:id', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { clubMemberships: true }
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.put('/api/users/:id', authenticate, async (req: any, res) => {
  const { name, email, globalRole, enrollmentNumber, branch, phoneNumber, linkedin, github, skills, profileLocked } = req.body;
  
  const user = await prisma.user.upsert({
    where: { id: req.params.id },
    update: { name, email, globalRole, enrollmentNumber, branch, phoneNumber, linkedin, github, skills, profileLocked },
    create: { 
      id: req.params.id, 
      name, 
      email, 
      globalRole, 
      enrollmentNumber, 
      branch, 
      phoneNumber, 
      linkedin, 
      github, 
      skills, 
      profileLocked,
      password: await bcrypt.hash('MITS2026', 10) // Default pwd for new imports
    }
  });
  res.json(user);
});

// 3. Institutional Clubs
app.get('/api/clubs', async (req, res) => {
  const clubs = await prisma.club.findMany({
    include: { achievements: true, events: true }
  });
  res.json(clubs);
});

app.post('/api/clubs', authenticate, async (req: any, res) => {
  if (req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Admin only' });
  const { name, category, themeColor, subdomain, tagline } = req.body;
  const club = await prisma.club.create({
    data: { name, category, themeColor, subdomain, tagline, facultyCoordinatorId: 'faculty-jadon' }
  });
  res.status(201).json(club);
});

app.patch('/api/clubs/:id', authenticate, async (req: any, res) => {
  const club = await prisma.club.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(club);
});

// 4. Governance Hub (Events)
app.get('/api/events', async (req, res) => {
  const events = await prisma.event.findMany({
    include: { club: true }
  });
  res.json(events);
});

app.post('/api/events', authenticate, async (req: any, res) => {
  const { title, description, type, fee, date, clubId } = req.body;
  const event = await prisma.event.create({
    data: { title, description, type, fee, date: new Date(date), clubId, status: 'Pending' }
  });
  res.status(201).json(event);
});

// 5. Registration & Gate Control
app.get('/api/registrations', authenticate, async (req, res) => {
  const regs = await prisma.registration.findMany({
    include: { user: true, event: true }
  });
  res.json(regs);
});

app.patch('/api/registrations/:id', authenticate, async (req: any, res) => {
  const reg = await prisma.registration.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(reg);
});

// 6. Recruitment Pipeline
app.get('/api/applicants', authenticate, async (req, res) => {
  const applicants = await prisma.applicant.findMany({
    include: { club: true }
  });
  res.json(applicants);
});

// 7. Audit Logging
app.get('/api/logs', authenticate, async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' }
  });
  res.json(logs);
});

// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MITS Institutional API Core live on port ${PORT}`);
});
