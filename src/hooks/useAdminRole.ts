
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

// Custom hook que retorna se o user é admin 
export function useAdminRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function checkRole() {
      setLoading(true);
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // Sempre garantir que pepedr13@gmail.com é admin!
      if (user.email === "pepedr13@gmail.com") {
        // Checa se já tem role. Se não, insere.
        const { data: roles, error } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id)
          .eq("role", "admin");
        if (error) {
          setIsAdmin(false); setLoading(false); return;
        }

        if (!roles || roles.length === 0) {
          // Insere role admin para esse usuário
          await supabase.from("user_roles").insert({
            user_id: user.id,
            role: "admin",
          });
        }
        setIsAdmin(true); setLoading(false); return;
      }
      // Para os demais, consulta role
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("role", "admin");
      if (!ignore) {
        setIsAdmin(!!data?.length);
        setLoading(false);
      }
    }
    checkRole();
    return () => { ignore = true }
  }, [user]);

  return { isAdmin, loading };
}
