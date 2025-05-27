'use client';

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { useTheme } from "next-themes";
import MainNavbar from "./main-navbar";
import Breadcrumb from "./breadcrumb";
import { AppSidebar } from "./app-sidebar";



// Mobile sidebar toggle button
function MobileSidebarToggle({ 
  isSidebarOpen, 
  toggleSidebar 
}: { 
  isSidebarOpen: boolean; 
  toggleSidebar: () => void 
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-10 w-10 md:hidden fixed top-20 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg shadow-lg hover:bg-accent z-50",
        "transition-all duration-200 hover:scale-105 hover:shadow-xl"
      )}
      onClick={toggleSidebar}
      title={isSidebarOpen ? "Close menu" : "Open menu"}
    >
      {isSidebarOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle Mobile Menu</span>
    </Button>
  );
}

interface AppLayoutClientProps {
  children: React.ReactNode;
}

export function AppLayoutClient({ children }: AppLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile default: closed
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
    
    // Open sidebar on desktop, close on mobile
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    // Initial setup
    handleResize();
    
    // Resize event listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <MainNavbar />
      
      {/* Mobile sidebar toggle button */}
      <MobileSidebarToggle isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        <aside
          className={cn(
            "bg-background transition-all duration-300 border-r border-border h-full flex flex-col",
            isSidebarOpen ? "w-64" : "w-20",
            // Display as overlay on mobile
            "md:relative md:translate-x-0",
            "absolute z-40 md:z-auto",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <AppSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        </aside>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        <main className="flex-1 overflow-y-auto h-full bg-background">
          {/* Consistent breadcrumb and page container */}
          <div className="flex flex-col h-full">
            <div className="pt-6 px-6 pb-2">
              <div className="flex items-center gap-4">
                {/* Desktop sidebar toggle button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex items-center gap-2 px-3 py-2 h-8 rounded-lg border border-border/50 hover:border-border hover:bg-accent/50 transition-all duration-200"
                  onClick={toggleSidebar}
                  title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                  {isSidebarOpen ? (
                    <>
                      <PanelLeftClose className="h-4 w-4" />
                      <span className="text-sm font-medium">Collapse</span>
                    </>
                  ) : (
                    <>
                      <PanelLeftOpen className="h-4 w-4" />
                      <span className="text-sm font-medium">Show sidebar</span>
                    </>
                  )}
                </Button>
                <Breadcrumb />
              </div>
            </div>
            <div className="flex-1 px-6 pb-6 overflow-y-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 