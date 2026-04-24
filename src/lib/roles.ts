import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type AppRole =
  | "super_admin"
  | "admin"
  | "content_manager"
  | "match_manager"
  | "media_manager"
  | "viewer";

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!active) return;
        setRoles((data ?? []).map((r) => r.role as AppRole));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const has = (r: AppRole) => roles.includes(r);
  const isAdmin = has("super_admin") || has("admin");
  const isSuperAdmin = has("super_admin");

  return { roles, loading, has, isAdmin, isSuperAdmin };
}
