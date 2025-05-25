import { AppLayout } from "@/components/layout/app-layout";

export default function ChatPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Chat</h1>
          <p className="text-muted-foreground">
            AI-powered chat interface with MCP tools
          </p>
        </div>
        
        <div className="grid gap-4">
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Chat Interface</h2>
            <p className="text-muted-foreground">
              This is where the chat interface will be implemented.
            </p>
          </div>
          
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Available Tools</h2>
            <p className="text-muted-foreground">
              Tools from connected MCP servers will be displayed here.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 