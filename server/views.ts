import type { Express, Request, Response } from "express";
import express from "express";
import { storage } from "./storage";
import path from "path";

export function registerViewRoutes(app: Express) {
  // Set up EJS as the view engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(process.cwd(), 'views'));
  
  // Serve static files from public directory
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Middleware to check if user is authenticated
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/auth');
    }
    next();
  };

  // Middleware to check if user is admin
  const requireAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.redirect('/');
    }
    next();
  };

  // Home page (Course listing)
  app.get('/', async (req, res) => {
    try {
      const courses = await storage.getCourses();
      const categories = await storage.getCategories();
      
      // Only show published courses to non-admin users
      const filteredCourses = req.user?.role === 'admin' 
        ? courses 
        : courses.filter(course => course.status === 'published');
      
      res.render('pages/home', {
        user: req.user || null,
        courses: filteredCourses,
        categories,
        path: req.path
      });
    } catch (error) {
      console.error("Error rendering home page:", error);
      res.status(500).send('Server error');
    }
  });

  // Authentication page
  app.get('/auth', (req, res) => {
    // If user is already logged in, redirect to home
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    
    // Check if there's a redirect parameter
    const redirect = req.query.redirect || '/';
    
    res.render('pages/auth', {
      user: null,
      path: req.path,
      redirect
    });
  });

  // Course detail page
  app.get('/course/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).render('pages/not-found', {
          user: req.user || null,
          path: req.path
        });
      }
      
      // Only show published courses to non-admin users unless they're the course creator
      if (course.status !== 'published' && 
          (!req.user || (req.user.role !== 'admin' && req.user.id !== course.instructorId))) {
        return res.status(404).render('pages/not-found', {
          user: req.user || null,
          path: req.path
        });
      }
      
      // Get course instructor info
      const instructor = await storage.getUser(course.instructorId);
      
      // Get course enrollments
      const enrollments = await storage.getCourseEnrollments(courseId);
      
      // Check if current user is enrolled
      let isEnrolled = false;
      if (req.user) {
        const userEnrollments = await storage.getUserEnrollments(req.user.id);
        isEnrolled = userEnrollments.some(e => e.courseId === courseId);
      }
      
      // Get categories for display
      const categories = await storage.getCategories();
      
      res.render('pages/course-detail', {
        user: req.user || null,
        course,
        instructor,
        categories,
        enrollmentsCount: enrollments.length,
        isEnrolled,
        path: req.path
      });
    } catch (error) {
      console.error("Error rendering course detail:", error);
      res.status(500).send('Server error');
    }
  });

  // My Learning page (protected)
  app.get('/my-learning', requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const enrollments = await storage.getUserEnrollments(userId);
      const courses = await storage.getCourses();
      const categories = await storage.getCategories();
      
      res.render('pages/my-learning', {
        user: req.user,
        enrollments,
        courses,
        categories,
        path: req.path
      });
    } catch (error) {
      console.error("Error rendering my learning page:", error);
      res.status(500).send('Server error');
    }
  });

  // Admin page (protected, admin only)
  app.get('/admin', requireAdmin, async (req, res) => {
    try {
      const courses = await storage.getCourses();
      const categories = await storage.getCategories();
      const users = await storage.getUsers();
      const enrollments = await storage.getEnrollments();
      
      res.render('pages/admin', {
        user: req.user,
        courses,
        categories,
        users,
        enrollments,
        path: req.path
      });
    } catch (error) {
      console.error("Error rendering admin page:", error);
      res.status(500).send('Server error');
    }
  });

  // 404 page - catch all route
  app.use((req, res) => {
    res.status(404).render('pages/not-found', {
      user: req.user || null,
      path: req.path
    });
  });
}