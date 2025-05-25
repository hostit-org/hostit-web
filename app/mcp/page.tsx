import { AppLayout } from "@/components/layout/app-layout";

export default function MCPPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">MCP Servers & Tools</h1>
          <p className="text-muted-foreground">
            Manage your MCP servers and discover available tools
          </p>
        </div>
        
        <div className="grid gap-4">
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">My Servers</h2>
            <p className="text-muted-foreground">
              Your registered MCP servers will be listed here.
            </p>
          </div>
          
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Available Tools</h2>
            <p className="text-muted-foreground">
              Tools from all connected servers will be displayed here.
            </p>
          </div>
          
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Server Profiles</h2>
            <p className="text-muted-foreground">
              Manage server configuration profiles here.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 