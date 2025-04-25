import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { insertCourseSchema, Course } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

interface CourseFormProps {
  existingCourse?: Course;
  onSuccess?: () => void;
}

// Extending insert course schema for form validation
const formSchema = insertCourseSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  categoryId: z.string().optional(),
  price: z.string().refine(val => !isNaN(Number(val)), {
    message: "Price must be a number",
  }),
  status: z.enum(["draft", "published"]),
});

type CourseFormValues = z.infer<typeof formSchema>;

export default function CourseForm({ existingCourse, onSuccess }: CourseFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Default values for the form
  const defaultValues: Partial<CourseFormValues> = {
    title: existingCourse?.title || "",
    description: existingCourse?.description || "",
    content: existingCourse?.content || "",
    price: existingCourse?.price || "0",
    categoryId: existingCourse?.categoryId?.toString() || undefined,
    status: (existingCourse?.status as "draft" | "published") || "draft",
  };

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createCourseMutation = useMutation({
    mutationFn: async (values: CourseFormValues) => {
      if (!user) throw new Error("You must be logged in to create a course");
      
      // Convert categoryId to number if provided
      const courseData = {
        ...values,
        instructorId: user.id,
        categoryId: values.categoryId ? parseInt(values.categoryId) : undefined,
      };
      
      const url = existingCourse 
        ? `/api/courses/${existingCourse.id}` 
        : "/api/courses";
      
      const method = existingCourse ? "PATCH" : "POST";
      
      const res = await apiRequest(method, url, courseData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: existingCourse ? "Course updated" : "Course created",
        description: existingCourse 
          ? "The course has been updated successfully" 
          : "The course has been created successfully",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (values: CourseFormValues) => {
    setIsSubmitting(true);
    createCourseMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter course title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input className="pl-7" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter course description" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Content (Markdown)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="# Course Introduction
## What you'll learn

* Item 1
* Item 2

```js
// Example code
const hello = 'world';
```" 
                  className="min-h-[250px] font-mono" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : existingCourse ? "Update Course" : "Create Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
