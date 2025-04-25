import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import MainNav from "@/components/main-nav";
import CourseForm from "@/components/course-form";
import { Course } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState("courses");
  
  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
          </div>
        </main>
      </div>
    );
  }
  
  // Fetch courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  
  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });
  
  // Fetch enrollments
  const { data: enrollments = [] } = useQuery({
    queryKey: ["/api/enrollments"],
  });
  
  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (courseId: number) => {
      await apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully",
      });
      setCourseToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting course",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
  };
  
  const confirmDelete = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete.id);
    }
  };
  
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsCreateModalOpen(true);
  };
  
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setEditingCourse(null);
  };

  // Get course stats
  const publishedCourses = courses.filter(c => c.status === "published").length;
  const draftCourses = courses.filter(c => c.status === "draft").length;
  const totalStudents = users.filter((u: any) => u.role === "user").length;
  const totalEnrollments = enrollments.length;
  
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Admin Dashboard</h1>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Create New Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[720px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingCourse ? "Edit Course" : "Create New Course"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCourse
                      ? "Update the course details and content"
                      : "Fill in the course details and content to create a new course"}
                  </DialogDescription>
                </DialogHeader>
                <CourseForm 
                  existingCourse={editingCourse || undefined} 
                  onSuccess={handleCreateSuccess}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-lg shadow p-4 border">
              <h3 className="text-sm font-medium text-muted-foreground">Total Courses</h3>
              <p className="mt-2 text-3xl font-semibold">{courses.length}</p>
            </div>
            <div className="bg-card rounded-lg shadow p-4 border">
              <h3 className="text-sm font-medium text-muted-foreground">Published Courses</h3>
              <p className="mt-2 text-3xl font-semibold">{publishedCourses}</p>
            </div>
            <div className="bg-card rounded-lg shadow p-4 border">
              <h3 className="text-sm font-medium text-muted-foreground">Total Students</h3>
              <p className="mt-2 text-3xl font-semibold">{totalStudents}</p>
            </div>
            <div className="bg-card rounded-lg shadow p-4 border">
              <h3 className="text-sm font-medium text-muted-foreground">Total Enrollments</h3>
              <p className="mt-2 text-3xl font-semibold">{totalEnrollments}</p>
            </div>
          </div>
          
          {/* Admin Tabs */}
          <Tabs defaultValue="courses" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses">
              {isLoadingCourses ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="bg-card rounded-lg shadow overflow-hidden border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => {
                        const courseEnrollments = enrollments.filter(
                          (e: any) => e.courseId === course.id
                        );
                        
                        return (
                          <TableRow key={course.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 rounded bg-muted">
                                  {course.image && (
                                    <img 
                                      className="h-10 w-10 rounded object-cover" 
                                      src={course.image} 
                                      alt={course.title} 
                                    />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium">{course.title}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {course.categoryId || "Uncategorized"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {courseEnrollments.length}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={course.status === "published" ? "default" : "secondary"}>
                                {course.status === "published" ? "Published" : "Draft"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditCourse(course)}
                                >
                                  <Pencil className="h-4 w-4 text-primary" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteCourse(course)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="students">
              {isLoadingUsers ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="bg-card rounded-lg shadow overflow-hidden border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Enrolled Courses</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .filter((u: any) => u.role === "user")
                        .map((student: any) => {
                          const studentEnrollments = enrollments.filter(
                            (e: any) => e.userId === student.id
                          );
                          
                          const nameInitials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase() || student.username[0].toUpperCase();
                          
                          return (
                            <TableRow key={student.id}>
                              <TableCell>
                                <div className="flex items-center">
                                  <Avatar>
                                    <AvatarFallback>{nameInitials}</AvatarFallback>
                                  </Avatar>
                                  <div className="ml-3">
                                    <div className="font-medium">
                                      {student.firstName || student.lastName
                                        ? `${student.firstName || ''} ${student.lastName || ''}`
                                        : student.username}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {student.username}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{student.email}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(student.createdAt).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">
                                  {studentEnrollments.length} courses
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course "{courseToDelete?.title}".
              This action cannot be undone, and all enrollments will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
