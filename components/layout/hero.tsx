import { Button } from "@/components/shared/ui/button";
import { ArrowRight, Zap, Users, Code } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center text-center">
      {/* Main Hero Section */}
      <div className="flex flex-col gap-8 items-center max-w-4xl">
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground border">
          <Zap className="w-4 h-4" />
          <span>AI Tool Ecosystem's GitHub</span>
        </div>
        
        <h1 className="text-4xl lg:text-6xl font-bold !leading-tight text-foreground">
          Anyone can easily use and share AI tools
        </h1>
        
        <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl">
          The universal platform for AI tools. Whether you're a developer or just getting started, 
          discover, use, and share powerful AI tools in our open source ecosystem.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/chat">
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/mcp">
            Explore Tools
            </Link>
          </Button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl mt-16">
        <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
          <div className="p-3 rounded-full bg-muted">
            <Users className="w-6 h-6 text-foreground" />
          </div>
          <h3 className="text-xl font-semibold">For Everyone</h3>
          <p className="text-muted-foreground text-center">
            Adaptive UI that works for both beginners and advanced users. 
            No technical knowledge required to get started.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
          <div className="p-3 rounded-full bg-muted">
            <Zap className="w-6 h-6 text-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Integrated Ecosystem</h3>
          <p className="text-muted-foreground text-center">
            Seamlessly connect and chain AI tools together. 
            Build powerful workflows with simple drag-and-drop.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4 p-6 rounded-lg border bg-card">
          <div className="p-3 rounded-full bg-muted">
            <Code className="w-6 h-6 text-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Open Source</h3>
          <p className="text-muted-foreground text-center">
            Community-driven platform where developers can contribute 
            and users can access tools freely.
          </p>
        </div>
      </div>

      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
