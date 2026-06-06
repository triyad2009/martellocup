// FIFA World Cup 2026 participating countries (selection of 32+ teams)
export type WCCountry = {
  code: string;       // FIFA 3-letter
  iso2: string;       // for flagcdn.com
  name_bn: string;
  name_en: string;
  flag: string;       // emoji
  color: string;      // primary team color (hex)
  color2: string;     // secondary
  star: string;       // star player
};

export const WC_COUNTRIES: WCCountry[] = [
  { code: "ARG", iso2: "ar", name_bn: "আর্জেন্টিনা", name_en: "Argentina", flag: "🇦🇷", color: "#75AADB", color2: "#FFFFFF", star: "Lionel Messi" },
  { code: "BRA", iso2: "br", name_bn: "ব্রাজিল", name_en: "Brazil", flag: "🇧🇷", color: "#FEDD00", color2: "#009C3B", star: "Vinícius Jr." },
  { code: "FRA", iso2: "fr", name_bn: "ফ্রান্স", name_en: "France", flag: "🇫🇷", color: "#0055A4", color2: "#EF4135", star: "Kylian Mbappé" },
  { code: "GER", iso2: "de", name_bn: "জার্মানি", name_en: "Germany", flag: "🇩🇪", color: "#000000", color2: "#DD0000", star: "Jamal Musiala" },
  { code: "ESP", iso2: "es", name_bn: "স্পেন", name_en: "Spain", flag: "🇪🇸", color: "#C60B1E", color2: "#FFC400", star: "Lamine Yamal" },
  { code: "POR", iso2: "pt", name_bn: "পর্তুগাল", name_en: "Portugal", flag: "🇵🇹", color: "#006600", color2: "#FF0000", star: "Cristiano Ronaldo" },
  { code: "ENG", iso2: "gb-eng", name_bn: "ইংল্যান্ড", name_en: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#FFFFFF", color2: "#CE1124", star: "Jude Bellingham" },
  { code: "ITA", iso2: "it", name_bn: "ইতালি", name_en: "Italy", flag: "🇮🇹", color: "#0066CC", color2: "#FFFFFF", star: "Federico Chiesa" },
  { code: "NED", iso2: "nl", name_bn: "নেদারল্যান্ডস", name_en: "Netherlands", flag: "🇳🇱", color: "#FF6900", color2: "#21468B", star: "Virgil van Dijk" },
  { code: "BEL", iso2: "be", name_bn: "বেলজিয়াম", name_en: "Belgium", flag: "🇧🇪", color: "#ED2939", color2: "#FAE042", star: "Kevin De Bruyne" },
  { code: "CRO", iso2: "hr", name_bn: "ক্রোয়েশিয়া", name_en: "Croatia", flag: "🇭🇷", color: "#FF0000", color2: "#FFFFFF", star: "Luka Modrić" },
  { code: "URU", iso2: "uy", name_bn: "উরুগুয়ে", name_en: "Uruguay", flag: "🇺🇾", color: "#0038A8", color2: "#FFFFFF", star: "Federico Valverde" },
  { code: "MEX", iso2: "mx", name_bn: "মেক্সিকো", name_en: "Mexico", flag: "🇲🇽", color: "#006847", color2: "#CE1126", star: "Hirving Lozano" },
  { code: "USA", iso2: "us", name_bn: "যুক্তরাষ্ট্র", name_en: "USA", flag: "🇺🇸", color: "#002868", color2: "#BF0A30", star: "Christian Pulisic" },
  { code: "CAN", iso2: "ca", name_bn: "কানাডা", name_en: "Canada", flag: "🇨🇦", color: "#FF0000", color2: "#FFFFFF", star: "Alphonso Davies" },
  { code: "JPN", iso2: "jp", name_bn: "জাপান", name_en: "Japan", flag: "🇯🇵", color: "#BC002D", color2: "#FFFFFF", star: "Takefusa Kubo" },
  { code: "KOR", iso2: "kr", name_bn: "দক্ষিণ কোরিয়া", name_en: "South Korea", flag: "🇰🇷", color: "#003478", color2: "#C60C30", star: "Son Heung-min" },
  { code: "AUS", iso2: "au", name_bn: "অস্ট্রেলিয়া", name_en: "Australia", flag: "🇦🇺", color: "#00843D", color2: "#FFCD00", star: "Mathew Ryan" },
  { code: "MAR", iso2: "ma", name_bn: "মরক্কো", name_en: "Morocco", flag: "🇲🇦", color: "#C1272D", color2: "#006233", star: "Achraf Hakimi" },
  { code: "SEN", iso2: "sn", name_bn: "সেনেগাল", name_en: "Senegal", flag: "🇸🇳", color: "#00853F", color2: "#FDEF42", star: "Sadio Mané" },
  { code: "GHA", iso2: "gh", name_bn: "ঘানা", name_en: "Ghana", flag: "🇬🇭", color: "#CE1126", color2: "#FCD116", star: "Mohammed Kudus" },
  { code: "NGA", iso2: "ng", name_bn: "নাইজেরিয়া", name_en: "Nigeria", flag: "🇳🇬", color: "#008751", color2: "#FFFFFF", star: "Victor Osimhen" },
  { code: "EGY", iso2: "eg", name_bn: "মিশর", name_en: "Egypt", flag: "🇪🇬", color: "#CE1126", color2: "#FFFFFF", star: "Mohamed Salah" },
  { code: "TUN", iso2: "tn", name_bn: "তিউনিসিয়া", name_en: "Tunisia", flag: "🇹🇳", color: "#E70013", color2: "#FFFFFF", star: "Hannibal Mejbri" },
  { code: "KSA", iso2: "sa", name_bn: "সৌদি আরব", name_en: "Saudi Arabia", flag: "🇸🇦", color: "#006C35", color2: "#FFFFFF", star: "Salem Al-Dawsari" },
  { code: "IRN", iso2: "ir", name_bn: "ইরান", name_en: "Iran", flag: "🇮🇷", color: "#239F40", color2: "#DA0000", star: "Mehdi Taremi" },
  { code: "QAT", iso2: "qa", name_bn: "কাতার", name_en: "Qatar", flag: "🇶🇦", color: "#8A1538", color2: "#FFFFFF", star: "Akram Afif" },
  { code: "SUI", iso2: "ch", name_bn: "সুইজারল্যান্ড", name_en: "Switzerland", flag: "🇨🇭", color: "#FF0000", color2: "#FFFFFF", star: "Granit Xhaka" },
  { code: "DEN", iso2: "dk", name_bn: "ডেনমার্ক", name_en: "Denmark", flag: "🇩🇰", color: "#C60C30", color2: "#FFFFFF", star: "Christian Eriksen" },
  { code: "POL", iso2: "pl", name_bn: "পোল্যান্ড", name_en: "Poland", flag: "🇵🇱", color: "#DC143C", color2: "#FFFFFF", star: "Robert Lewandowski" },
  { code: "SRB", iso2: "rs", name_bn: "সার্বিয়া", name_en: "Serbia", flag: "🇷🇸", color: "#C6363C", color2: "#0C4076", star: "Dušan Vlahović" },
  { code: "ECU", iso2: "ec", name_bn: "ইকুয়েডর", name_en: "Ecuador", flag: "🇪🇨", color: "#FFD700", color2: "#0072CE", star: "Moisés Caicedo" },
  { code: "COL", iso2: "co", name_bn: "কলম্বিয়া", name_en: "Colombia", flag: "🇨🇴", color: "#FCD116", color2: "#003893", star: "Luis Díaz" },
  { code: "CHI", iso2: "cl", name_bn: "চিলি", name_en: "Chile", flag: "🇨🇱", color: "#D52B1E", color2: "#0039A6", star: "Alexis Sánchez" },
  { code: "PER", iso2: "pe", name_bn: "পেরু", name_en: "Peru", flag: "🇵🇪", color: "#D91023", color2: "#FFFFFF", star: "Gianluca Lapadula" },
];

export function findCountry(code: string): WCCountry | undefined {
  return WC_COUNTRIES.find((c) => c.code === code);
}
