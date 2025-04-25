import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("user").notNull(), // 'user' or 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  price: text("price").default("0"),
  instructorId: integer("instructor_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  status: text("status").default("draft").notNull(), // 'draft' or 'published'
  content: text("content"), // Markdown content
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  status: text("status").default("in_progress").notNull(), // 'in_progress' or 'completed'
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  courses: many(courses, { relationName: "instructor" }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
    relationName: "instructor",
  }),
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  enrollments: many(enrollments),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

// Validation schemas
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  email: (schema) => schema.email("Must provide a valid email"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
}).omit({ createdAt: true });

export const insertCategorySchema = createInsertSchema(categories, {
  name: (schema) => schema.min(2, "Category name must be at least 2 characters"),
});

export const insertCourseSchema = createInsertSchema(courses, {
  title: (schema) => schema.min(5, "Title must be at least 5 characters"),
  description: (schema) => schema.min(10, "Description must be at least 10 characters"),
}).omit({ createdAt: true, updatedAt: true });

export const insertEnrollmentSchema = createInsertSchema(enrollments, {}).omit({ enrolledAt: true });

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
