import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Zap, Image, Code, FileText, Brain } from "lucide-react";

export default function ToolsPage() {
  const tools = [
    {
      id: 1,
      name: "Image Generator",
      description: "Create stunning images from text descriptions using AI",
      icon: Image,
      category: "Creative",
      status: "Available"
    },
    {
      id: 2,
      name: "Code Assistant",
      description: "Get help with coding, debugging, and code reviews",
      icon: Code,
      category: "Development",
      status: "Available"
    },
    {
      id: 3,
      name: "Text Summarizer",
      description: "Summarize long documents and articles quickly",
      icon: FileText,
      category: "Productivity",
      status: "Available"
    },
    {
      id: 4,
      name: "Data Analyzer",
      description: "Analyze and visualize your data with AI insights",
      icon: Brain,
      category: "Analytics",
      status: "Coming Soon"
    }
  ];

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">AI Tools</h1>
            <p className="text-muted-foreground">
              Discover and use powerful AI tools for your projects
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Card key={tool.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {tool.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge 
                        variant={tool.status === "Available" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {tool.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {tool.description}
                    </CardDescription>
                    <Button 
                      className="w-full gap-2" 
                      disabled={tool.status !== "Available"}
                    >
                      <Zap className="h-4 w-4" />
                      {tool.status === "Available" ? "Use Tool" : "Coming Soon"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 