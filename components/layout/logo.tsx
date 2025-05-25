"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 32 }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 로딩 중에는 기본 로고 표시
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <Image
          src="/hostit-logo.png"
          alt="HostIt Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
        alt="HostIt Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
} 