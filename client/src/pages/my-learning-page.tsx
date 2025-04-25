import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import MainNav from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { Loader2, School } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

export default function MyLearningPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"in_progress" | "completed">("in_progress");
  
  // Fetch user enrollments
  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ["/api/enrollments/user", user?.id],
    enabled: !!user,
  });
  
  // Fetch courses for the enrolled courses
  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });
  
  const filteredEnrollments = enrollments.filter(
    (enrollment: any) => enrollment.status === filter
  );
  
  const getCourseDetails = (courseId: number) => {
    return courses.find((course: any) => course.id === courseId);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">My Learning</h1>
            
            <div className="flex gap-2">
              <Button
                variant={filter === "in_progress" ? "default" : "outline"}
                onClick={() => setFilter("in_progress")}
              >
                In Progress
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                onClick={() => setFilter("completed")}
              >
                Completed
              </Button>
            </div>
          </div>
          
          {isLoadingEnrollments ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrollments.map((enrollment: any) => {
                const course = getCourseDetails(enrollment.courseId);
                if (!course) return null;
                
                // Mock progress for visualization
                const progress = enrollment.status === "completed" ? 100 : Math.floor(Math.random() * 90) + 10;
                
                return (
                  <Card key={enrollment.id}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <Badge variant={enrollment.status === "completed" ? "default" : "outline"}>
                          {enrollment.status === "completed" ? "Completed" : "In Progress"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="mt-2">{course.title}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/course/${course.id}`}>
                        <Button className="w-full">Continue Learning</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-lg border">
              <School className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No courses yet</h2>
              <p className="text-muted-foreground mb-6">
                Explore our course catalog and start learning today!
              </p>
              <Link href="/">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
