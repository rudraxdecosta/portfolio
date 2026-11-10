import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { navItems } from "@/data/portfolioData";
import type { ChapterId } from "@/types/portfolio";

export function LocalClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      {new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now)}
    </>
  );
}

interface NavbarProps {
  currentChapter: ChapterId;
  onNavigate: (id: ChapterId) => void;
}

export function Navbar({ currentChapter, onNavigate }: NavbarProps) {
  return (
    <header className="hud text-video-title">
      <Button
        variant="subtle"
        size="small"
        className="on-video hud-brand"
        aria-label="Aditya Mudgal, back to top"
        onClick={() => onNavigate("home")}
      >
        AM.
      </Button>
      <nav className="hud-nav" aria-label="Sections">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="subtle"
            size="small"
            className={`on-video nav-link ${currentChapter === item.id ? "is-active" : ""}`}
            aria-current={currentChapter === item.id ? "true" : undefined}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </nav>
      <div className="hud-time text-text-secondary caps">
        <span className="hud-hide">Jaipur 26.91 N</span>
        <span className="hud-clock">
          <LocalClock /> IST
        </span>
      </div>
    </header>
  );
}
