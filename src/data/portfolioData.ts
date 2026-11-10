import type { ChapterId, MetricItem, MilestoneItem, Mission, NavItem, SceneId } from "@/types/portfolio";

export const chapters: ChapterId[] = ["home", "signal", "work", "about", "vision", "contact"];

export const navItems: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "work", label: "Missions" },
  { id: "about", label: "Profile" },
  { id: "vision", label: "Vision" },
  { id: "contact", label: "Contact" },
];

export const chapterScene: Record<ChapterId, SceneId> = {
  home: "orbit",
  signal: "city",
  work: "storm",
  about: "planet",
  vision: "city",
  contact: "orbit",
};

export const missions: Mission[] = [
  {
    number: "01",
    title: "Traxy",
    planet: "gas",
    category: "Venture concept",
    description:
      "An accessible, affordable electric-vehicle mobility ecosystem exploring smarter individual and shared commuting.",
    tags: ["Mobility"],
  },
  {
    number: "02",
    title: "Darkra",
    planet: "void",
    category: "Smart India Hackathon 2026",
    description:
      "Team Darkra’s Cyber Prahar system explores machine learning, anomaly detection, explainable AI and intelligent incident response.",
    tags: ["Cyber Prahar"],
  },
  {
    number: "03",
    title: "Aegis",
    planet: "ice",
    category: "Startup vision",
    description:
      "An independent vision for intelligent security solutions built for increasingly AI-driven digital ecosystems.",
    tags: ["Cybersecurity"],
  },
];

export const metrics: MetricItem[] = [
  { value: 47, label: "Global rank", detail: "SRM CTF", tone: "yellow" },
  { value: 36, label: "Hour build sprint", detail: "Hackathon", tone: "violet" },
  { value: 3, label: "Active missions", detail: "Traxy / Darkra / Aegis", tone: "light" },
];

export const milestones: MilestoneItem[] = [
  ["Global #47", "SRM CTF", "Capture The Flag cybersecurity competition"],
  ["Team lead", "Smart India Hackathon", "Team Darkra, Cyber Prahar, 2026"],
  ["36 hours", "Build sprint", "Intensive innovation and problem-solving hackathon"],
  ["Community", "Microsoft Student Ambassador", "BIT Jaipur chapter initiatives"],
  ["Campus", "TEDx and initiatives", "Creative, collaborative, student-led activities"],
];

export const capabilities = [
  "AI / ML",
  "Anomaly detection",
  "Cybersecurity",
  "Software development",
  "Entrepreneurship",
  "Mobility",
  "Product thinking",
  "UI / UX",
];

export const manifesto =
  "Building at the intersection of artificial intelligence, cybersecurity, mobility and innovation.";

export const EMAIL = "mailto:rudraxdecosta@gmail.com";

export const WORK_INQUIRY_EMAIL =
  "mailto:rudraxdecosta@gmail.com?subject=Project%20Inquiry%20%E2%80%94%20Build%20a%20Custom%20Website%20/%20Product&body=Hi%20Aditya,%0A%0AI%20explored%20your%20portfolio%20and%20was%20blown%20away%20by%20the%20quality.%20I%20would%20like%20to%20hire%20you%20to%20build%20something%20similar%20for%20my%20company/project.%0A%0AProject%20Overview:%20%0AEstimated%20Budget%20(INR/USD):%20%0ATimeline:%20%0A%0ABest%20regards,";

export const FUNDING_EMAIL =
  "mailto:rudraxdecosta@gmail.com?subject=Funding%20/%20Investment%20Inquiry%20for%20Aditya%20Mudgal&body=Hi%20Aditya,%0A%0AI%20am%20interested%20in%20backing%20your%20work%20/%20investing%20in%20your%20ventures%20(Traxy,%20Darkra,%20Aegis).%0A%0AOrganization/Investor%20Name:%20%0AProposed%20Support/Investment%20Amount:%20%0ANotes:%20%0A%0ABest%20regards,";

export const LINKEDIN_URL = "https://www.linkedin.com/in/aditya-mudgal-568630437/";
export const INSTAGRAM_URL = "https://www.instagram.com/ky_yr_adi_/";
