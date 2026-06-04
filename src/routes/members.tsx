import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Facebook, Instagram, Youtube, Phone, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/members")({
  component: MembersPage,
  head: () => ({
    meta: [
      { title: "সদস্য তালিকা · Members · Martello Cup" },
      { name: "description", content: "Martello Cup committee and team members directory with social profiles." },
    ],
  }),
});

function pickRole(m: any, lang: string) {
  if (lang === "en") return m.role_en || m.role_bn;
  if (lang === "sat") return m.role_sat || m.role_bn;
  return m.role_bn || m.role_en;
}
function pickBio(m: any, lang: string) {
  if (lang === "en") return m.bio_en || m.bio_bn || "";
  if (lang === "sat") return m.bio_sat || m.bio_bn || "";
  return m.bio_bn || m.bio_en || "";
}

function MembersPage() {
  const { lang } = useI18n();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).rpc("list_members_public");
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow-red mb-3">
          <Users className="h-7 w-7 text-white" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          {lang === "en" ? "Members" : lang === "sat" ? "সাঙ্গাত" : "সদস্য তালিকা"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {lang === "en" ? "Martello Cup community" : "মার্টেলো কাপ পরিবার"}
        </p>
      </motion.div>

      {loading ? (
        <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto" />
      ) : rows.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          {lang === "en" ? "No members yet." : "এখনো কোনো সদস্য যোগ করা হয়নি।"}
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl bg-card border border-border shadow-card overflow-hidden hover:shadow-elevated transition-shadow"
            >
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                {m.photo_url ? (
                  <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <Users className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-display text-lg font-bold">{m.name}</h3>
                <p className="text-xs text-primary font-semibold uppercase tracking-wide">{pickRole(m, lang)}</p>
                {pickBio(m, lang) && <p className="text-sm text-muted-foreground line-clamp-3">{pickBio(m, lang)}</p>}

                <div className="flex flex-wrap gap-2 pt-2">
                  {m.facebook_url && <SocialBtn href={m.facebook_url} icon={<Facebook className="h-4 w-4" />} />}
                  {m.instagram_url && <SocialBtn href={m.instagram_url} icon={<Instagram className="h-4 w-4" />} />}
                  {m.youtube_url && <SocialBtn href={m.youtube_url} icon={<Youtube className="h-4 w-4" />} />}
                  {m.tiktok_url && <SocialBtn href={m.tiktok_url} icon={<span className="text-xs font-bold">TT</span>} />}
                  {m.whatsapp_url && <SocialBtn href={m.whatsapp_url} icon={<span className="text-xs font-bold">WA</span>} />}
                  {m.phone && <SocialBtn href={`tel:${m.phone}`} icon={<Phone className="h-4 w-4" />} />}
                  {m.email && <SocialBtn href={`mailto:${m.email}`} icon={<Mail className="h-4 w-4" />} />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function SocialBtn({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
    >
      {icon}
    </a>
  );
}
