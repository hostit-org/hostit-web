'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home,
  MessageSquare,
  Zap,
  Settings,
  Heart,
  Clock,
  Search,
  Plus,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { Button } from "@/components/shared/ui/button";

interface AppSidebarProps {
  isOpen: boolean;
  onToggle?: () => void;
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  
  const routes = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Overview and stats"
    },
    {
      name: "Chat",
      href: "/chat",
      icon: MessageSquare,
      description: "AI conversations"
    },
    {
      name: "Tools",
      href: "/tools",
      icon: Zap,
      description: "Browse AI tools"
    },
    {
      name: "Search",
      href: "/search",
      icon: Search,
      description: "Find tools"
    }
  ];

  const quickActions = [
    {
      name: "Recent",
      href: "/recent",
      icon: Clock,
      description: "Recently used"
    },
    {
      name: "Favorites",
      href: "/favorites",
      icon: Heart,
      description: "Saved tools"
    }
  ];
  
  return (
    <div className="flex flex-col h-full py-4 bg-background">
      {/* Sidebar Header with Toggle */}
      <div className="flex items-center justify-between px-3 pb-2 mb-2">
        {isOpen ? (
          <>
            <h2 className="text-sm font-semibold text-foreground">Navigation</h2>
            {onToggle && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-accent rounded-md"
                onClick={onToggle}
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center w-full">
            {onToggle && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-accent rounded-md mb-2"
                onClick={onToggle}
                title="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            )}
            <div className="w-8 h-0.5 bg-muted-foreground/30 rounded-full" />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 px-3">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
          const Icon = route.icon;
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                isActive 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:text-accent-foreground",
                !isOpen && "justify-center px-2"
              )}
              title={!isOpen ? `${route.name} - ${route.description}` : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {isOpen && (
                <div className="flex flex-col">
                  <span>{route.name}</span>
                  <span className="text-xs text-muted-foreground">{route.description}</span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      {isOpen && (
        <div className="mx-3 my-4 h-px bg-border" />
      )}

      {/* Quick Actions */}
      <nav className="space-y-1 px-3">
        {isOpen && (
          <h4 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Access
          </h4>
        )}
        {quickActions.map((action) => {
          const isActive = pathname === action.href;
          const Icon = action.icon;
          
          return (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                isActive 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground hover:text-accent-foreground",
                !isOpen && "justify-center px-2"
              )}
              title={!isOpen ? `${action.name} - ${action.description}` : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {isOpen && <span>{action.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto space-y-1 px-3">
        {isOpen ? (
          <Button variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
            <Link href="/tools/new">
              <Plus className="h-4 w-4" />
              Add Tool
            </Link>
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-full h-10 hover:bg-accent mb-2" 
            asChild
            title="Add Tool - Create a new tool"
          >
            <Link href="/tools/new">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        )}
        
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
            pathname === "/settings"
              ? "bg-accent text-accent-foreground" 
              : "text-muted-foreground hover:text-accent-foreground",
            !isOpen && "justify-center px-2"
          )}
          title={!isOpen ? "Settings - Configure your preferences" : undefined}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {isOpen && <span>Settings</span>}
        </Link>
      </div>
    </div>
  );
} 