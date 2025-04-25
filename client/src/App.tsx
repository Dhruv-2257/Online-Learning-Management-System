import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import CoursesPage from "@/pages/courses-page";
import MyLearningPage from "@/pages/my-learning-page";
import CourseDetailPage from "@/pages/course-detail-page";
import AdminPage from "@/pages/admin-page";
import AuthPage from "@/pages/auth-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CoursesPage} />
      <Route path="/course/:id" component={CourseDetailPage} />
      <ProtectedRoute path="/my-learning" component={MyLearningPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
