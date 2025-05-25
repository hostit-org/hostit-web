import Link from "next/link";
import HeaderAuth from "../auth/header-auth";
import { AppHeaderClient } from "./app-header-client";

interface AppHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export async function AppHeader({ sidebarOpen, setSidebarOpen }: AppHeaderProps) {
  return (
    <header className="h-14 border-b bg-background flex items-center px-4">
      <AppHeaderClient 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <div className="flex items-center space-x-2">
        <Link 
          href="/" 
          className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          HostIt
        </Link>
      </div>
      
      <div className="ml-auto">
        <HeaderAuth />
      </div>
    </header>
  );
} 