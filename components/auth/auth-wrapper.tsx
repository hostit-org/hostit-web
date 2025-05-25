import { createClient } from "@/utils/supabase/server";
import { AuthProvider } from "./auth-provider";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default async function AuthWrapper({ children }: AuthWrapperProps) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthProvider initialUser={user}>
      {children}
    </AuthProvider>
  );
} 