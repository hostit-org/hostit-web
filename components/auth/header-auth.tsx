import { createClient } from "@/utils/supabase/server";
import { HeaderAuthClient } from "./header-auth-client";

export default async function HeaderAuth() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HeaderAuthClient initialUser={user} />;
}
