'use client';

import { Button } from '@/components/shared/ui/button';
import { Menu } from 'lucide-react';
import { ThemeSwitcher } from "../shared/common/theme-switcher";

interface AppHeaderClientProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function AppHeaderClient({ sidebarOpen, setSidebarOpen }: AppHeaderClientProps) {
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mr-2"
      >
        <Menu className="h-4 w-4" />
      </Button>
      
      <div className="ml-auto">
        <ThemeSwitcher />
      </div>
    </>
  );
} 