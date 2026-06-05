// FIFA World Cup 2026 participating countries (selection of 32+ teams)
export type WCCountry = {
  code: string;
  name_bn: string;
  name_en: string;
  flag: string;
};

export const WC_COUNTRIES: WCCountry[] = [
  { code: "ARG", name_bn: "আর্জেন্টিনা", name_en: "Argentina", flag: "🇦🇷" },
  { code: "BRA", name_bn: "ব্রাজিল", name_en: "Brazil", flag: "🇧🇷" },
  { code: "FRA", name_bn: "ফ্রান্স", name_en: "France", flag: "🇫🇷" },
  { code: "GER", name_bn: "জার্মানি", name_en: "Germany", flag: "🇩🇪" },
  { code: "ESP", name_bn: "স্পেন", name_en: "Spain", flag: "🇪🇸" },
  { code: "POR", name_bn: "পর্তুগাল", name_en: "Portugal", flag: "🇵🇹" },
  { code: "ENG", name_bn: "ইংল্যান্ড", name_en: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "ITA", name_bn: "ইতালি", name_en: "Italy", flag: "🇮🇹" },
  { code: "NED", name_bn: "নেদারল্যান্ডস", name_en: "Netherlands", flag: "🇳🇱" },
  { code: "BEL", name_bn: "বেলজিয়াম", name_en: "Belgium", flag: "🇧🇪" },
  { code: "CRO", name_bn: "ক্রোয়েশিয়া", name_en: "Croatia", flag: "🇭🇷" },
  { code: "URU", name_bn: "উরুগুয়ে", name_en: "Uruguay", flag: "🇺🇾" },
  { code: "MEX", name_bn: "মেক্সিকো", name_en: "Mexico", flag: "🇲🇽" },
  { code: "USA", name_bn: "যুক্তরাষ্ট্র", name_en: "USA", flag: "🇺🇸" },
  { code: "CAN", name_bn: "কানাডা", name_en: "Canada", flag: "🇨🇦" },
  { code: "JPN", name_bn: "জাপান", name_en: "Japan", flag: "🇯🇵" },
  { code: "KOR", name_bn: "দক্ষিণ কোরিয়া", name_en: "South Korea", flag: "🇰🇷" },
  { code: "AUS", name_bn: "অস্ট্রেলিয়া", name_en: "Australia", flag: "🇦🇺" },
  { code: "MAR", name_bn: "মরক্কো", name_en: "Morocco", flag: "🇲🇦" },
  { code: "SEN", name_bn: "সেনেগাল", name_en: "Senegal", flag: "🇸🇳" },
  { code: "GHA", name_bn: "ঘানা", name_en: "Ghana", flag: "🇬🇭" },
  { code: "NGA", name_bn: "নাইজেরিয়া", name_en: "Nigeria", flag: "🇳🇬" },
  { code: "EGY", name_bn: "মিশর", name_en: "Egypt", flag: "🇪🇬" },
  { code: "TUN", name_bn: "তিউনিসিয়া", name_en: "Tunisia", flag: "🇹🇳" },
  { code: "KSA", name_bn: "সৌদি আরব", name_en: "Saudi Arabia", flag: "🇸🇦" },
  { code: "IRN", name_bn: "ইরান", name_en: "Iran", flag: "🇮🇷" },
  { code: "QAT", name_bn: "কাতার", name_en: "Qatar", flag: "🇶🇦" },
  { code: "SUI", name_bn: "সুইজারল্যান্ড", name_en: "Switzerland", flag: "🇨🇭" },
  { code: "DEN", name_bn: "ডেনমার্ক", name_en: "Denmark", flag: "🇩🇰" },
  { code: "POL", name_bn: "পোল্যান্ড", name_en: "Poland", flag: "🇵🇱" },
  { code: "SRB", name_bn: "সার্বিয়া", name_en: "Serbia", flag: "🇷🇸" },
  { code: "ECU", name_bn: "ইকুয়েডর", name_en: "Ecuador", flag: "🇪🇨" },
  { code: "COL", name_bn: "কলম্বিয়া", name_en: "Colombia", flag: "🇨🇴" },
  { code: "CHI", name_bn: "চিলি", name_en: "Chile", flag: "🇨🇱" },
  { code: "PER", name_bn: "পেরু", name_en: "Peru", flag: "🇵🇪" },
];

export function findCountry(code: string): WCCountry | undefined {
  return WC_COUNTRIES.find((c) => c.code === code);
}
