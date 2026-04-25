import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "bn" | "en";

type Dict = Record<string, { bn: string; en: string }>;

export const dict: Dict = {
  // Navbar
  "nav.home": { bn: "হোম", en: "Home" },
  "nav.fixtures": { bn: "ফিক্সচার", en: "Fixtures" },
  "nav.results": { bn: "ফলাফল", en: "Results" },
  "nav.points": { bn: "পয়েন্ট তালিকা", en: "Points Table" },
  "nav.teams": { bn: "দল", en: "Teams" },
  "nav.players": { bn: "খেলোয়াড়", en: "Players" },
  "nav.registration": { bn: "নিবন্ধন", en: "Registration" },
  "nav.tickets": { bn: "টিকিট", en: "Tickets" },
  "nav.gallery": { bn: "গ্যালারি", en: "Gallery" },
  "nav.news": { bn: "সংবাদ", en: "News" },
  "nav.sponsors": { bn: "স্পনসর", en: "Sponsors" },
  "nav.about": { bn: "আমাদের সম্পর্কে", en: "About" },
  "nav.contact": { bn: "যোগাযোগ", en: "Contact" },

  // Hero
  "hero.title": { bn: "মার্টেলো কাপ", en: "MARTELLO CUP" },
  "hero.tagline": { bn: "যেখানে কিংবদন্তি জন্ম নেয়", en: "Where Legends Are Born" },
  "hero.season": { bn: "Football.Connectivity.Happiness", en: "Football.Connectivity.Happiness" },
  "hero.location": { bn: "গাইনবাড়ী, গাবুরা, শ্যামনগর, সাতক্ষীরা", en: "Gainbari, Gabura, Shyamnagar, Satkhira" },
  "nav.admin": { bn: "এডমিন", en: "Admin" },
  "hero.cta.fixtures": { bn: "ফিক্সচার দেখুন", en: "View Fixtures" },
  "hero.cta.register": { bn: "দল নিবন্ধন করুন", en: "Register Team" },
  "hero.countdown": { bn: "টুর্নামেন্ট শুরু হতে", en: "Tournament Starts In" },
  "hero.days": { bn: "দিন", en: "Days" },
  "hero.hours": { bn: "ঘন্টা", en: "Hours" },
  "hero.minutes": { bn: "মিনিট", en: "Minutes" },
  "hero.seconds": { bn: "সেকেন্ড", en: "Seconds" },

  // Stats
  "stats.teams": { bn: "মোট দল", en: "Teams" },
  "stats.matches": { bn: "ম্যাচ", en: "Matches" },
  "stats.goals": { bn: "গোল", en: "Goals" },
  "stats.players": { bn: "খেলোয়াড়", en: "Players" },

  // Sections
  "section.upcoming": { bn: "আসন্ন ম্যাচ", en: "Upcoming Matches" },
  "section.results": { bn: "সর্বশেষ ফলাফল", en: "Latest Results" },
  "section.points": { bn: "পয়েন্ট তালিকা", en: "Points Table" },
  "section.news": { bn: "সর্বশেষ সংবাদ", en: "Latest News" },
  "section.gallery": { bn: "গ্যালারি", en: "Gallery" },
  "section.sponsors": { bn: "আমাদের স্পনসর", en: "Our Sponsors" },
  "section.viewAll": { bn: "সব দেখুন", en: "View All" },

  // Dev
  "dev.label": { bn: "Develop By", en: "Develop By" },
  "dev.subtitle": { bn: "ফুল স্ট্যাক ডেভেলপার", en: "Full Stack Developer" },
  "dev.close": { bn: "বন্ধ করুন", en: "Close" },

  // Footer
  "footer.about": { bn: "মার্টেলো কাপ সম্পর্কে", en: "About Martello Cup" },
  "footer.aboutText": { bn: "সাতক্ষীরার গর্বিত ফুটবল টুর্নামেন্ট, যেখানে স্থানীয় প্রতিভা বিশ্বমানের প্রতিযোগিতায় মিলিত হয়।", en: "Satkhira's premier football tournament, where local talent meets world-class competition." },
  "footer.quick": { bn: "দ্রুত লিঙ্ক", en: "Quick Links" },
  "footer.info": { bn: "তথ্য", en: "Information" },
  "footer.contact": { bn: "যোগাযোগ", en: "Contact" },
  "footer.rights": { bn: "© ২০২৫ মার্টেলো কাপ। সর্বস্বত্ব সংরক্ষিত।", en: "© 2025 Martello Cup. All Rights Reserved." },
  "footer.privacy": { bn: "গোপনীয়তা নীতি", en: "Privacy Policy" },
  "footer.terms": { bn: "শর্তাবলী", en: "Terms" },
};

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("mc_lang")) as Lang | null;
    if (saved === "bn" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("mc_lang", l);
  };

  const t = (key: string) => dict[key]?.[lang] ?? key;

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
