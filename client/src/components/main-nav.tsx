import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import ThemeToggle from "@/components/theme-toggle";
import SearchInput from "@/components/search-input";
import { useMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function MainNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => location === path;

  const navLinks = [
    { path: "/", label: "Courses", visibleFor: "all" },
    { path: "/my-learning", label: "My Learning", visibleFor: "user" },
    { path: "/admin", label: "Admin", visibleFor: "admin" },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (link.visibleFor === "all") return true;
    if (link.visibleFor === "user" && user) return true;
    if (link.visibleFor === "admin" && user?.role === "admin") return true;
    return false;
  });

  const renderNavLink = (path: string, label: string) => (
    <Link href={path} key={path}>
      <a className={`px-1 py-2 text-sm font-medium border-b-2 ${
        isActive(path) 
          ? "border-primary text-foreground" 
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
      }`}>
        {label}
      </a>
    </Link>
  );

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation Links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="text-primary font-bold text-xl">LearnEase</a>
              </Link>
            </div>
            
            {/* Desktop Navigation Links */}
            {!isMobile && (
              <div className="ml-6 flex space-x-8">
                {filteredLinks.map(({ path, label }) => renderNavLink(path, label))}
              </div>
            )}
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center">
            {/* Search Bar (Desktop) */}
            {!isMobile && <SearchInput />}
            
            {/* Dark Mode Toggle */}
            <ThemeToggle className="ml-3" />
            
            {/* User Menu / Login Button */}
            <div className="ml-3">
              {user ? (
                <Button 
                  variant="ghost" 
                  className="text-sm font-medium"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <Link href="/auth">
                  <Button variant="default" className="text-sm font-medium">
                    Login
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Mobile menu button */}
            {isMobile && (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="ml-2 p-2">
                    <Menu size={24} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="flex flex-col space-y-4 mt-6">
                    {filteredLinks.map(({ path, label }) => (
                      <Link href={path} key={path}>
                        <a 
                          className={`px-1 py-2 text-base font-medium ${
                            isActive(path) 
                              ? "text-primary" 
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {label}
                        </a>
                      </Link>
                    ))}
                    <SearchInput />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
