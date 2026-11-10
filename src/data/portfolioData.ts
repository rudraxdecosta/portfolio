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
export const LINKEDIN_URL = "https://www.linkedin.com/in/aditya-mudgal-568630437/";
export const INSTAGRAM_URL = "https://www.instagram.com/ky_yr_adi_/";
