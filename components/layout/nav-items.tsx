"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavItems() {
  const pathname = usePathname();
  
  // Determine active tab based on current path
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };
  
  // Navigation items (docs-based)
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Chat", path: "/chat" },
    { name: "MCP", path: "/mcp" },
    { name: "Profile", path: "/profile" }
  ];

  return (
    <nav className="flex space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={cn(
            "text-sm hover:text-foreground transition-colors",
            isActive(item.path) 
              ? "font-medium text-foreground" 
              : "text-muted-foreground"
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
} 