import { db } from '@db';
import {
  users,
  courses,
  categories,
  enrollments,
  type User,
  type Course,
  type Category,
  type Enrollment,
  type InsertUser,
  type InsertCourse,
  type InsertCategory,
  type InsertEnrollment
} from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import connectPg from 'connect-pg-simple';
import session from 'express-session';
import { pool } from '@db';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  
  // Course methods
  getCourse(id: number): Promise<Course | undefined>;
  getCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, data: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  
  // Category methods
  getCategory(id: number): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Enrollment methods
  getEnrollment(id: number): Promise<Enrollment | undefined>;
  getEnrollments(): Promise<Enrollment[]>;
  getUserEnrollments(userId: number): Promise<Enrollment[]>;
  getCourseEnrollments(courseId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollmentStatus(id: number, status: string): Promise<Enrollment | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session'
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  }
  
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    return result[0];
  }
  
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }
  
  async createCourse(course: InsertCourse): Promise<Course> {
    const result = await db.insert(courses).values(course).returning();
    return result[0];
  }
  
  async updateCourse(id: number, data: Partial<InsertCourse>): Promise<Course | undefined> {
    const result = await db.update(courses).set(data).where(eq(courses.id, id)).returning();
    return result[0];
  }
  
  async deleteCourse(id: number): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id)).returning({ id: courses.id });
    return result.length > 0;
  }
  
  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }
  
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }
  
  // Enrollment methods
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    const result = await db.select().from(enrollments).where(eq(enrollments.id, id)).limit(1);
    return result[0];
  }
  
  async getEnrollments(): Promise<Enrollment[]> {
    return await db.select().from(enrollments);
  }
  
  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    return await db.select().from(enrollments).where(eq(enrollments.userId, userId));
  }
  
  async getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
    return await db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
  }
  
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    // Check if enrollment already exists
    const existing = await db.select().from(enrollments).where(
      and(
        eq(enrollments.userId, enrollment.userId),
        eq(enrollments.courseId, enrollment.courseId)
      )
    ).limit(1);
    
    if (existing.length > 0) {
      return existing[0]; // Return existing enrollment
    }
    
    const result = await db.insert(enrollments).values(enrollment).returning();
    return result[0];
  }
  
  async updateEnrollmentStatus(id: number, status: string): Promise<Enrollment | undefined> {
    const result = await db.update(enrollments)
      .set({ status })
      .where(eq(enrollments.id, id))
      .returning();
    return result[0];
  }
}

// Create and export a singleton instance
export const storage = new DatabaseStorage();
