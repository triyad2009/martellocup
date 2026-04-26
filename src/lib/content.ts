import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Generic realtime list hook for any public table */
export function useTable<T = any>(
  table: string,
  opts: { order?: string; ascending?: boolean; filter?: (q: any) => any } = {},
) {
  const { order = "sort_order", ascending = true, filter } = opts;
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      let q = (supabase as any).from(table).select("*").order(order, { ascending });
      if (filter) q = filter(q);
      const { data } = await q;
      if (!active) return;
      setRows((data ?? []) as T[]);
      setLoading(false);
    };
    load();
    const channel = supabase
      .channel(`watch-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => load())
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  return { rows, loading };
}

export function useSingletonRow<T = any>(table: string) {
  const [row, setRow] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await (supabase as any).from(table).select("*").limit(1).maybeSingle();
      if (!active) return;
      setRow((data as T) ?? null);
      setLoading(false);
    };
    load();
    const channel = supabase
      .channel(`watch-single-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => load())
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [table]);
  return { row, loading, setRow };
}

/** Upload a file to media bucket; returns public URL */
export async function uploadMedia(file: File, folder = "general"): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}
