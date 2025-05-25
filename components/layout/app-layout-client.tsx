'use client';

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { useTheme } from "next-themes";
import MainNavbar from "./main-navbar";
import Breadcrumb from "./breadcrumb";
import { AppSidebar } from "./app-sidebar";

// 사이드바 토글 버튼
function SidebarToggle({ 
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
        "h-6 w-6 absolute -right-3 top-3 bg-background border border-border rounded-full shadow-sm hover:bg-accent z-50",
        "transition-transform duration-300",
        !isSidebarOpen && "rotate-180"
      )}
      onClick={toggleSidebar}
      data-sidebar="trigger"
    >
      <ChevronLeft className="h-3 w-3" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

interface AppLayoutClientProps {
  children: React.ReactNode;
}

export function AppLayoutClient({ children }: AppLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <MainNavbar />
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        <aside
          className={cn(
            "bg-background transition-all duration-300 border-r border-border h-full flex flex-col relative",
            isSidebarOpen ? "w-64" : "w-20",
            // 모바일에서는 오버레이로 표시
            "md:relative md:translate-x-0",
            "absolute z-40 md:z-auto",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          {/* 사이드바 토글 버튼 - 경계선에 위치 */}
          <SidebarToggle isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          
          <AppSidebar isOpen={isSidebarOpen} />
        </aside>

        {/* 모바일 오버레이 */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        <main className="flex-1 overflow-y-auto h-full bg-background">
          {/* 일관된 breadcrumb 및 페이지 컨테이너 */}
          <div className="flex flex-col h-full">
            <div className="pt-6 px-6 pb-2">
              <Breadcrumb />
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