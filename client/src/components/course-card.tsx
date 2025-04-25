import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Course, User } from "@shared/schema";
import { StarIcon } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CourseCardProps {
  course: Course;
  instructor?: User;
  onEnroll?: () => void;
}

export default function CourseCard({ course, instructor, onEnroll }: CourseCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to enroll");
      
      const res = await apiRequest("POST", `/api/enrollments`, {
        userId: user.id,
        courseId: course.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/user", user?.id] });
      toast({
        title: "Enrolled successfully",
        description: `You have been enrolled in ${course.title}`,
      });
      if (onEnroll) onEnroll();
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleEnroll = () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to enroll in courses",
        variant: "destructive",
      });
      return;
    }
    
    enrollMutation.mutate();
  };

  const instructorName = instructor 
    ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.username
    : "Unknown Instructor";
    
  const instructorInitials = instructorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="h-48 w-full bg-muted">
        {course.image && (
          <img
            src={course.image}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <CardHeader className="p-5 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              {course.categoryId ? "Category" : "Uncategorized"}
            </Badge>
            <Link href={`/course/${course.id}`}>
              <a className="mt-2 text-lg font-semibold hover:underline block">{course.title}</a>
            </Link>
          </div>
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-500" fill="currentColor" />
            <span className="text-muted-foreground text-sm ml-1">4.8</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {course.description}
        </p>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={instructorName} />
              <AvatarFallback>{instructorInitials}</AvatarFallback>
            </Avatar>
            <span className="ml-2 text-sm text-muted-foreground">{instructorName}</span>
          </div>
          <span className="text-primary font-semibold">
            {course.price === "0" ? "Free" : `$${course.price}`}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button 
          className="w-full" 
          onClick={handleEnroll}
          disabled={enrollMutation.isPending}
        >
          {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}
