"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb() {
  const pathname = usePathname();
  
  // 경로를 세그먼트로 분할
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) return null;
  
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
        </li>
        {segments.map((segment, index) => {
          // 현재 세그먼트까지의 URL 생성
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;
          
          return (
            <li key={segment} className="inline-flex items-center">
              <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" />
              {isLast ? (
                <span className="text-sm font-medium text-foreground capitalize">
                  {segment.replace(/-/g, ' ')}
                </span>
              ) : (
                <Link 
                  href={href} 
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground capitalize transition-colors"
                >
                  {segment.replace(/-/g, ' ')}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 