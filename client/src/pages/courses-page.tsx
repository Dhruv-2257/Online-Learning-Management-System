import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainNav from "@/components/main-nav";
import CourseCard from "@/components/course-card";
import { Course, Category, User } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CoursesPage() {
  const [location] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  
  // Parse search query from URL
  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get("search") || "";
  
  // Fetch courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch users (instructors)
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter and sort courses
  const filteredCourses = courses
    .filter(course => {
      // Filter by category
      if (selectedCategory !== "all" && course.categoryId !== parseInt(selectedCategory)) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !course.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Only show published courses on the public page
      return course.status === "published";
    })
    .sort((a, b) => {
      // Sort by date/title
      if (sortOrder === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortOrder === "a-z") {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });

  const getInstructorForCourse = (instructorId: number) => {
    return users.find(user => user.id === instructorId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page title and filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <h1 className="text-2xl font-bold mb-4 md:mb-0">
                {searchQuery ? `Search Results: "${searchQuery}"` : "Explore Courses"}
              </h1>
              
              <div className="flex flex-wrap gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={sortOrder}
                  onValueChange={setSortOrder}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="a-z">A-Z</SelectItem>
                    <SelectItem value="z-a">Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Course Grid */}
          {isLoadingCourses ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  instructor={getInstructorForCourse(course.instructorId)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-lg border">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold mb-2">No courses found</h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? `No courses match your search for "${searchQuery}"`
                  : "Try changing your filters or check back later"
                }
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/"}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <span className="text-primary font-bold text-xl">LearnEase</span>
              <p className="mt-2 text-sm text-muted-foreground">
                Simple, intuitive learning management system<br/>for beginners and experts alike.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Platform</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="/" className="text-sm text-foreground hover:text-primary">Browse Courses</a></li>
                  <li><a href="/#categories" className="text-sm text-foreground hover:text-primary">Categories</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Company</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-sm text-foreground hover:text-primary">About</a></li>
                  <li><a href="#" className="text-sm text-foreground hover:text-primary">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Legal</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-sm text-foreground hover:text-primary">Privacy Policy</a></li>
                  <li><a href="#" className="text-sm text-foreground hover:text-primary">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} LearnEase LMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
