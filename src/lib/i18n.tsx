import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "bn" | "en" | "sat";

type Dict = Record<string, { bn: string; en: string; sat?: string }>;

export const dict: Dict = {
  // Navbar
  "nav.home": { bn: "হোম", en: "Home", sat: "ঘর" },
  "nav.fixtures": { bn: "ফিক্সচার", en: "Fixtures", sat: "খেলার তারিখ" },
  "nav.results": { bn: "ফলাফল", en: "Results", sat: "ফল" },
  "nav.points": { bn: "পয়েন্ট তালিকা", en: "Points Table", sat: "পয়েন্টের তালিকা" },
  "nav.teams": { bn: "দল", en: "Teams", sat: "দল" },
  "nav.players": { bn: "খেলোয়াড়", en: "Players", sat: "খেলোয়াড়" },
  "nav.registration": { bn: "নিবন্ধন", en: "Registration", sat: "নাম লেখানি" },
  "nav.tickets": { bn: "টিকিট", en: "Tickets", sat: "টিকিট" },
  "nav.jersey": { bn: "জার্সি", en: "Jersey", sat: "জার্সি" },
  "nav.gallery": { bn: "গ্যালারি", en: "Gallery", sat: "ছবিঘর" },
  "nav.news": { bn: "সংবাদ", en: "News", sat: "খবর" },
  "nav.sponsors": { bn: "স্পনসর", en: "Sponsors", sat: "সহযোগী" },
 "nav.about": { bn: "আমাদের সম্পর্কে", en: "About", sat: "আমাগির কথা" },
 "nav.committee": { bn: "কমিটি", en: "Committee", sat: "কমিটি" },
 "nav.contact": { bn: "যোগাযোগ", en: "Contact", sat: "মিল-আঁলাপ" },
  "nav.members": { bn: "সদস্য", en: "Members", sat: "সাঙ্গাত" },
 "nav.feed": { bn: "ফিড", en: "Feed", sat: "আঁলাপ-ঘর" },
 "nav.friends": { bn: "বন্ধু", en: "Friends", sat: "গাঁতি" },
 "nav.messages": { bn: "মেসেজ", en: "Messages", sat: "খবর" },

  // Hero
  "hero.title": { bn: "মার্টেলো কাপ", en: "MARTELLO CUP", sat: "মার্টেলো কাপ" },
  "hero.tagline": { bn: "যেখানে কিংবদন্তি জন্ম নেয়", en: "Where Legends Are Born", sat: "যেহানে নাম-করা পোলা জনম লয়" },
  "hero.season": { bn: "Football.Connectivity.Happiness", en: "Football.Connectivity.Happiness" },
  "hero.location": { bn: "গাইনবাড়ী, গাবুরা, শ্যামনগর, সাতক্ষীরা", en: "Gainbari, Gabura, Shyamnagar, Satkhira", sat: "গাইনবাড়ী, গাবুরা, শ্যামনগর, সাতক্ষীরা" },
  "nav.admin": { bn: "এডমিন", en: "Admin", sat: "মুরুব্বী" },
  "hero.cta.fixtures": { bn: "ফিক্সচার দেখুন", en: "View Fixtures", sat: "তারিখ দ্যাহো" },
  "hero.cta.register": { bn: "দল নিবন্ধন করুন", en: "Register Team", sat: "দল লেহাও" },
  "hero.countdown": { bn: "টুর্নামেন্ট শুরু হতে", en: "Tournament Starts In", sat: "খেলা শুরু হতে" },
  "hero.days": { bn: "দিন", en: "Days", sat: "দিন" },
  "hero.hours": { bn: "ঘন্টা", en: "Hours", sat: "ঘন্টা" },
  "hero.minutes": { bn: "মিনিট", en: "Minutes", sat: "মিনিট" },
  "hero.seconds": { bn: "সেকেন্ড", en: "Seconds", sat: "সেকেন্ড" },

  // Stats
  "stats.teams": { bn: "মোট দল", en: "Teams", sat: "মোট দল" },
  "stats.matches": { bn: "ম্যাচ", en: "Matches", sat: "খেলা" },
  "stats.goals": { bn: "গোল", en: "Goals", sat: "গোল" },
  "stats.players": { bn: "খেলোয়াড়", en: "Players", sat: "খেলোয়াড়" },

  // Sections
  "section.upcoming": { bn: "আসন্ন ম্যাচ", en: "Upcoming Matches", sat: "সামনের খেলা" },
  "section.results": { bn: "সর্বশেষ ফলাফল", en: "Latest Results", sat: "শ্যাষের ফল" },
  "section.points": { bn: "পয়েন্ট তালিকা", en: "Points Table", sat: "পয়েন্টের তালিকা" },
  "section.news": { bn: "সর্বশেষ সংবাদ", en: "Latest News", sat: "নয়া খবর" },
  "section.gallery": { bn: "গ্যালারি", en: "Gallery", sat: "ছবিঘর" },
  "section.sponsors": { bn: "আমাদের স্পনসর", en: "Our Sponsors", sat: "আমাগির সহযোগী" },
  "section.viewAll": { bn: "সব দেখুন", en: "View All", sat: "সবডা দ্যাহো" },

  // Dev
  "dev.label": { bn: "Develop By", en: "Develop By" },
  "dev.subtitle": { bn: "ফুল স্ট্যাক ডেভেলপার", en: "Full Stack Developer" },
  "dev.close": { bn: "বন্ধ করুন", en: "Close", sat: "বন্ধ করো" },

  // Footer
  "footer.about": { bn: "মার্টেলো কাপ সম্পর্কে", en: "About Martello Cup", sat: "মার্টেলো কাপের কথা" },
  "footer.aboutText": { bn: "সাতক্ষীরার গর্বিত ফুটবল টুর্নামেন্ট, যেখানে স্থানীয় প্রতিভা বিশ্বমানের প্রতিযোগিতায় মিলিত হয়।", en: "Satkhira's premier football tournament, where local talent meets world-class competition.", sat: "সাতক্ষীরার গর্বের ফুটবল খেলা, যেহানে গাঁয়ের পোলাপান বড় খেলায় নামে।" },
  "footer.quick": { bn: "দ্রুত লিঙ্ক", en: "Quick Links", sat: "তাড়াতাড়ি লিঙ্ক" },
  "footer.info": { bn: "তথ্য", en: "Information", sat: "খবর" },
  "footer.contact": { bn: "যোগাযোগ", en: "Contact", sat: "মিল-আঁলাপ" },
  "footer.rights": { bn: "© ২০২৫ মার্টেলো কাপ। সর্বস্বত্ব সংরক্ষিত।", en: "© 2025 Martello Cup. All Rights Reserved." },
  "footer.privacy": { bn: "গোপনীয়তা নীতি", en: "Privacy Policy", sat: "গোপন নীতি" },
  "footer.terms": { bn: "শর্তাবলী", en: "Terms", sat: "শর্ত" },
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
    if (saved === "bn" || saved === "en" || saved === "sat") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("mc_lang", l);
  };

  const t = (key: string) => {
    const entry = dict[key];
    if (!entry) return key;
    return (entry as any)[lang] ?? entry.bn ?? key;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
