import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams, Link as RouterLink } from "wouter";
import MainNav from "@/components/main-nav";
import CourseContent from "@/components/course-content";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Calendar, Clock, Users, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CourseDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  // Fetch course
  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ["/api/courses", parseInt(id)],
  });
  
  // Fetch instructor
  const { data: instructor } = useQuery({
    queryKey: ["/api/users", course?.instructorId],
    enabled: !!course?.instructorId,
  });
  
  // Check if user is enrolled
  const { data: userEnrollments = [] } = useQuery({
    queryKey: ["/api/enrollments/user", user?.id],
    enabled: !!user,
  });
  
  const isEnrolled = userEnrollments.some(
    (enrollment: any) => enrollment.courseId === parseInt(id)
  );
  
  // Handle enrollment
  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to enroll in this course",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    setIsEnrolling(true);
    
    try {
      await apiRequest("POST", "/api/enrollments", {
        userId: user.id,
        courseId: parseInt(id),
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/user", user.id] });
      
      toast({
        title: "Enrolled successfully",
        description: `You have been enrolled in "${course.title}"`,
      });
    } catch (error) {
      toast({
        title: "Enrollment failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };
  
  if (isLoadingCourse) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNav />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Course not found</h1>
            <p className="text-muted-foreground mb-6">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <RouterLink href="/">
              <Button>Browse Courses</Button>
            </RouterLink>
          </div>
        </div>
      </div>
    );
  }
  
  // Format instructor name
  const instructorName = instructor 
    ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.username
    : "Unknown Instructor";
    
  const instructorInitials = instructorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1">
        {/* Course Header */}
        <div className="bg-primary text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-6 text-white bg-transparent hover:bg-white/20 border-white/30"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <Badge variant="outline" className="mb-3 text-white border-white/30 bg-white/10">
                  {course.categoryId ? "Category" : "Uncategorized"}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-white/90 mb-6">{course.description}</p>
                
                <div className="flex flex-wrap gap-4 items-center text-sm text-white/80">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>50 students enrolled</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-80 bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold">
                    {course.price === "0" ? "Free" : `$${course.price}`}
                  </p>
                </div>
                
                {isEnrolled ? (
                  <div className="text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-2" />
                    <p className="mb-3">You're already enrolled in this course</p>
                    <Button className="w-full" variant="secondary">
                      Continue Learning
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? "Enrolling..." : "Enroll Now"}
                  </Button>
                )}
                
                <Separator className="my-4 bg-white/20" />
                
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={instructorName} />
                    <AvatarFallback>{instructorInitials}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium">{instructorName}</p>
                    <p className="text-xs text-white/70">Instructor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Course Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-card rounded-lg shadow-sm border p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            {course.content ? (
              <CourseContent content={course.content} />
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>No content available for this course yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
