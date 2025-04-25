import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { registerViewRoutes } from "./views";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  insertCourseSchema,
  insertCategorySchema,
  insertEnrollmentSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes - prefix all routes with /api
  const apiPrefix = "/api";

  // Middleware to check if user is authenticated
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Middleware to check if user is admin
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  // Error handling middleware for zod validation
  const validateBody = (schema: z.ZodType<any, any>) => {
    return (req: Request, res: Response, next: Function) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        next(error);
      }
    };
  };

  // Categories routes
  app.get(`${apiPrefix}/categories`, async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get(`${apiPrefix}/categories/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.post(
    `${apiPrefix}/categories`,
    requireAdmin,
    validateBody(insertCategorySchema),
    async (req, res) => {
      try {
        const category = await storage.createCategory(req.body);
        res.status(201).json(category);
      } catch (error) {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  );

  // Courses routes
  app.get(`${apiPrefix}/courses`, async (_req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get(`${apiPrefix}/courses/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post(
    `${apiPrefix}/courses`,
    requireAuth,
    validateBody(insertCourseSchema),
    async (req, res) => {
      try {
        const userId = req.user!.id;
        
        // Only admins can create courses
        if (req.user!.role !== "admin") {
          return res.status(403).json({ message: "Only admins can create courses" });
        }
        
        const course = await storage.createCourse({
          ...req.body,
          instructorId: userId
        });
        
        res.status(201).json(course);
      } catch (error) {
        res.status(500).json({ message: "Failed to create course" });
      }
    }
  );

  app.patch(
    `${apiPrefix}/courses/:id`,
    requireAuth,
    async (req, res) => {
      try {
        const courseId = parseInt(req.params.id);
        const course = await storage.getCourse(courseId);
        
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }
        
        // Check if user is the instructor or an admin
        if (course.instructorId !== req.user!.id && req.user!.role !== "admin") {
          return res.status(403).json({ message: "You can only update your own courses" });
        }
        
        const updatedCourse = await storage.updateCourse(courseId, req.body);
        res.json(updatedCourse);
      } catch (error) {
        res.status(500).json({ message: "Failed to update course" });
      }
    }
  );

  app.delete(
    `${apiPrefix}/courses/:id`,
    requireAdmin,
    async (req, res) => {
      try {
        const courseId = parseInt(req.params.id);
        const course = await storage.getCourse(courseId);
        
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }
        
        await storage.deleteCourse(courseId);
        res.status(200).json({ message: "Course deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: "Failed to delete course" });
      }
    }
  );

  // Enrollments routes
  app.get(`${apiPrefix}/enrollments`, requireAdmin, async (_req, res) => {
    try {
      const enrollments = await storage.getEnrollments();
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.get(`${apiPrefix}/enrollments/user/:userId`, requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Users can only view their own enrollments unless they're an admin
      if (userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "You can only view your own enrollments" });
      }
      
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user enrollments" });
    }
  });

  app.get(`${apiPrefix}/enrollments/course/:courseId`, requireAuth, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const course = await storage.getCourse(courseId);
      
      // Only course instructors and admins can view course enrollments
      if (course?.instructorId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to view course enrollments" });
      }
      
      const enrollments = await storage.getCourseEnrollments(courseId);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course enrollments" });
    }
  });

  app.post(
    `${apiPrefix}/enrollments`,
    requireAuth,
    validateBody(insertEnrollmentSchema),
    async (req, res) => {
      try {
        const { userId, courseId } = req.body;
        
        // Users can only enroll themselves
        if (userId !== req.user!.id && req.user!.role !== "admin") {
          return res.status(403).json({ message: "You can only enroll yourself" });
        }
        
        // Check if course exists
        const course = await storage.getCourse(courseId);
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }
        
        // Check if course is published
        if (course.status !== "published") {
          return res.status(400).json({ message: "Cannot enroll in an unpublished course" });
        }
        
        const enrollment = await storage.createEnrollment(req.body);
        res.status(201).json(enrollment);
      } catch (error) {
        res.status(500).json({ message: "Failed to create enrollment" });
      }
    }
  );

  app.patch(
    `${apiPrefix}/enrollments/:id/status`,
    requireAuth,
    async (req, res) => {
      try {
        const enrollmentId = parseInt(req.params.id);
        const { status } = req.body;
        
        if (!status || !["in_progress", "completed"].includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
        }
        
        const enrollment = await storage.getEnrollment(enrollmentId);
        if (!enrollment) {
          return res.status(404).json({ message: "Enrollment not found" });
        }
        
        // Users can only update their own enrollments
        if (enrollment.userId !== req.user!.id && req.user!.role !== "admin") {
          return res.status(403).json({ message: "You can only update your own enrollments" });
        }
        
        const updatedEnrollment = await storage.updateEnrollmentStatus(enrollmentId, status);
        res.json(updatedEnrollment);
      } catch (error) {
        res.status(500).json({ message: "Failed to update enrollment status" });
      }
    }
  );

  // Users routes
  app.get(`${apiPrefix}/users`, requireAdmin, async (_req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get(`${apiPrefix}/users/:id`, requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Users can only view their own profile unless they're an admin
      if (userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to view this user" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Set up view routes (for server-side rendering with EJS)
  registerViewRoutes(app);
  
  const httpServer = createServer(app);
  return httpServer;
}
