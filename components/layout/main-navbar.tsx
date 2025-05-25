import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/shared/ui/button";
import { Github } from "lucide-react";
import { HeaderAuthClient } from "@/components/auth/header-auth-client";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeToggle } from "./theme-toggle";
import { NavItems } from "./nav-items";
import { Logo } from "./logo";

export default function MainNavbar() {

  return (
    <header className="h-16 border-b border-border flex items-center px-6 bg-background">
      <div className="flex items-center flex-1">
        {/* 로고 */}
        <Link href="/" className="flex items-center mr-8">
          <div className="relative h-8 w-8 mr-3">
            <Image
              src="/hostit-logo.png"
              alt="HostIt Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-bold">HostIt</h1>
        </Link>
        
        {/* 네비게이션 메뉴 */}
        <NavItems />
      </div>
        
      {/* GitHub 버튼과 테마 전환 버튼 */}
      <div className="flex items-center gap-2 mr-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
        >
          <a 
            href="https://github.com/hostit-org/hostit-web"
            target="_blank" 
            rel="noreferrer"
          >
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </a>
        </Button>
        
        {/* 테마 전환 버튼 */}
        <ThemeToggle />
      </div>
      
      {/* 사용자 인증 영역 */}
      <div className="flex items-center">
        {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuthClient initialUser={null} />}
      </div>
    </header>
  );
} 