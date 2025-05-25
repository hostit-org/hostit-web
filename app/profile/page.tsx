import { AppLayout } from "@/components/layout/app-layout";

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <div className="grid gap-4">
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Account Information</h2>
            <p className="text-muted-foreground">
              Your profile information and account details.
            </p>
          </div>
          
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Usage Statistics</h2>
            <p className="text-muted-foreground">
              View your tool usage and activity statistics.
            </p>
          </div>
          
          <div className="p-6 border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Preferences</h2>
            <p className="text-muted-foreground">
              Customize your theme, language, and notification settings.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 