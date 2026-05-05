import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SavedGeneration<T = any> {
  id: string;
  tool_type: string;
  title: string;
  payload: T;
  created_at: string;
}

export function useSavedGenerations<T = any>(toolType: string) {
  const [items, setItems] = useState<SavedGeneration<T>[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_generations")
      .select("id, tool_type, title, payload, created_at")
      .eq("tool_type", toolType)
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error && data) setItems(data as any);
    setLoading(false);
  }, [toolType]);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback(async (title: string, payload: T) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sign in to save"); return null; }
    const { data, error } = await supabase
      .from("user_generations")
      .insert({ user_id: user.id, tool_type: toolType, title, payload: payload as any })
      .select()
      .single();
    if (error) { toast.error(error.message); return null; }
    toast.success("Saved to your library 💾");
    await refresh();
    return data;
  }, [toolType, refresh]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("user_generations").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { items, loading, save, remove, refresh };
}