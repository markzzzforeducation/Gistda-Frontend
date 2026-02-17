import type { User } from '../stores/auth';

// Types
export interface Lesson {
    id: string;
    title: string;
    content: string;
    videoUrl?: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    lessons: Lesson[];
}

export interface Submission {
    id: string;
    title: string;
    abstract: string;
    studentName: string;
    studentId: string;
    imageUrl: string;
    status: 'pending' | 'published' | 'rejected';
    submittedAt: string;
}

export interface Evaluation {
    id: string;
    internId: string;
    mentorId: string;
    mentorName: string;
    quantityOfWork: number;
    qualityOfWork: number;
    academicAbility: number;
    abilityToLearn: number;
    judgmentAndDecision: number;
    organizationAndPlanning: number;
    communicationSkills: number;
    suitabilityForJob: number;
    responsibility: number;
    interestInWork: number;
    initiative: number;
    responseToSupervision: number;
    personality: number;
    interpersonalSkills: number;
    discipline: number;
    ethicsAndMorality: number;
    comment: string;
    strengths: string;
    improvements: string;
    createdAt: string;
}

export interface MockDB {
    users: User[];
    courses?: Course[];
    submissions?: Submission[];
    evaluations?: Evaluation[];
}

const DB_KEY = 'gistda-mock-db';

// Initial Data
const initialUsers: User[] = [
    { id: 'u1', name: 'Admin (Mentor)', email: 'admin@example.com', password: 'password', role: 'admin' },
    {
        id: 'u2',
        name: 'Intern User',
        email: 'intern@example.com',
        password: 'password',
        role: 'intern',
        profile: {
            firstName: 'Intern',
            lastName: 'User',
            university: 'GISTDA University',
            faculty: 'Engineering',
            major: 'Computer Engineering',
            studentId: '63010001',
            startDate: '2024-01-01',
            endDate: '2024-04-30',
            mobile: '0812345678',
            advisorName: 'Dr. Advisor',
            advisorEmail: 'advisor@university.ac.th'
        }
    },
    { id: 'u3', name: 'External User', email: 'external@example.com', password: 'password', role: 'external' },
];

// Helper to load/save DB
function loadDB(): MockDB {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
    const db = { users: initialUsers };
    saveDB(db);
    return db;
}

function saveDB(db: MockDB) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Service Methods
export const mockBackend = {
    // Auth & Users
    login(email: string, password: string) {
        const db = loadDB();
        const user = db.users.find(u => u.email === email && u.password === password);
        if (user) {
            return { ok: true, user, token: 'mock-token-' + user.id };
        }
        return { ok: false, message: 'Invalid credentials' };
    },

    getUsers() {
        const db = loadDB();
        return db.users;
    },

    createUser(user: Omit<User, 'id'>) {
        const db = loadDB();
        if (db.users.some(u => u.email === user.email)) {
            throw new Error('Email already exists');
        }
        const newUser = { ...user, id: 'u' + Date.now() };
        db.users.push(newUser);
        saveDB(db);
        return newUser;
    },

    updateUser(id: string, updates: Partial<User>) {
        const db = loadDB();
        const idx = db.users.findIndex(u => u.id === id);
        if (idx === -1) throw new Error('User not found');
        db.users[idx] = { ...db.users[idx], ...updates } as User;
        saveDB(db);
        return db.users[idx];
    },

    deleteUser(id: string) {
        const db = loadDB();
        db.users = db.users.filter(u => u.id !== id);
        saveDB(db);
    },

    // Courses
    getCourses(): Course[] {
        const db = loadDB();
        return db.courses || [];
    },

    createCourse(course: Omit<Course, 'id'>): Course {
        const db = loadDB();
        const newCourse: Course = { ...course, id: 'c' + Date.now() };
        db.courses = db.courses || [];
        db.courses.push(newCourse);
        saveDB(db);
        return newCourse;
    },

    updateCourse(id: string, updates: Partial<Course>): Course {
        const db = loadDB();
        db.courses = db.courses || [];
        const idx = db.courses.findIndex(c => c.id === id);
        if (idx === -1) throw new Error('Course not found');
        db.courses[idx] = { ...db.courses[idx], ...updates } as Course;
        saveDB(db);
        return db.courses[idx] as Course;
    },

    deleteCourse(id: string): void {
        const db = loadDB();
        db.courses = (db.courses || []).filter(c => c.id !== id);
        saveDB(db);
    },

    // Gallery / Submissions
    getSubmissions(): Submission[] {
        const db = loadDB();
        return db.submissions || [];
    },

    createSubmission(submission: Omit<Submission, 'id' | 'status' | 'submittedAt'>): Submission {
        const db = loadDB();
        const newSubmission: Submission = {
            ...submission,
            id: 's' + Date.now(),
            status: 'pending',
            submittedAt: new Date().toISOString()
        };
        db.submissions = db.submissions || [];
        db.submissions.push(newSubmission);
        saveDB(db);
        return newSubmission;
    },

    updateSubmission(id: string, updates: Partial<Submission>): Submission {
        const db = loadDB();
        db.submissions = db.submissions || [];
        const idx = db.submissions.findIndex(s => s.id === id);
        if (idx === -1) throw new Error('Submission not found');
        db.submissions[idx] = { ...db.submissions[idx], ...updates } as Submission;
        saveDB(db);
        return db.submissions[idx] as Submission;
    },

    deleteSubmission(id: string): void {
        const db = loadDB();
        db.submissions = (db.submissions || []).filter(s => s.id !== id);
        saveDB(db);
    },

    // Evaluations
    getEvaluations(): Evaluation[] {
        const db = loadDB();
        return db.evaluations || [];
    },

    createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt'>): Evaluation {
        const db = loadDB();
        const newEvaluation: Evaluation = {
            ...evaluation,
            id: 'e' + Date.now(),
            createdAt: new Date().toISOString()
        };
        db.evaluations = db.evaluations || [];
        db.evaluations.push(newEvaluation);
        saveDB(db);
        return newEvaluation;
    }
};

// Seed initial data if empty
const db = loadDB();
if (!db.courses) {
    db.courses = [
        {
            id: 'c1',
            title: 'Introduction to Space Technology',
            description: 'Learn the basics of space tech and satellite systems.',
            lessons: [
                { id: 'l1', title: 'History of Spaceflight', content: 'Content about history...', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
                { id: 'l2', title: 'Satellite Orbits', content: 'Content about orbits...', videoUrl: '' }
            ]
        },
        {
            id: 'c2',
            title: 'GISTDA Orientation',
            description: 'Welcome to GISTDA internship program.',
            lessons: [
                { id: 'l3', title: 'Safety Guidelines', content: 'Safety first...', videoUrl: '' }
            ]
        }
    ];
    saveDB(db);
}

if (!db.submissions) {
    db.submissions = [
        {
            id: 's1',
            title: 'Satellite Image Processing using AI',
            abstract: 'A study on using CNNs to detect deforestation.',
            studentName: 'Intern User',
            studentId: 'u2',
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
            status: 'published',
            submittedAt: new Date().toISOString()
        }
    ];
    saveDB(db);
}
