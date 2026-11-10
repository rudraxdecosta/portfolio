import { useCallback, useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { VideoStage } from "@/components/video/VideoStage";
import { IntroExperience } from "@/components/intro/IntroExperience";
import { Hero } from "@/components/sections/Hero";
import { Signal } from "@/components/sections/Signal";
import { Missions } from "@/components/sections/Missions";
import { Profile } from "@/components/sections/Profile";
import { Vision } from "@/components/sections/Vision";
import { Contact } from "@/components/sections/Contact";
import { chapters, chapterScene } from "@/data/portfolioData";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import { sound } from "@/lib/sound";
import { clamp } from "@/lib/utils";
import type { ChapterId } from "@/types/portfolio";

export default function App() {
  const reduced = prefersReducedMotion();
  const [introDone, setIntroDone] = useState(reduced);
  const [ready, setReady] = useState(reduced);
  const [heroReady, setHeroReady] = useState(false);
  const [chapter, setChapter] = useState<ChapterId>("home");

  const shellRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement>(null);

  const handleExit = useCallback(() => setReady(true), []);
  const handleDone = useCallback(() => setIntroDone(true), []);
  const handleHeroReady = useCallback(() => setHeroReady(true), []);

  const goTo = useCallback((id: ChapterId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Passive scroll listener drives scroll effects via CSS variables,
  // preventing React rerenders except on section transitions.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const shell = shellRef.current;
    if (!scroller || !shell) return;

    const sections = chapters.map((id) => document.getElementById(id)!);
    const signal = document.getElementById("signal")!;
    let frame = 0;

    const update = () => {
      frame = 0;
      const top = scroller.scrollTop;
      const height = scroller.clientHeight;
      const max = scroller.scrollHeight - height;

      shell.style.setProperty("--scroll", (max > 0 ? top / max : 0).toFixed(4));
      shell.style.setProperty("--hero", clamp(top / height).toFixed(4));

      const span = signal.offsetHeight - height;
      signal.style.setProperty(
        "--p",
        clamp(span > 0 ? (top - signal.offsetTop) / span : 0).toFixed(4)
      );

      const middle = top + height * 0.5;
      let current: ChapterId = "home";
      sections.forEach((section, index) => {
        if (section && section.offsetTop <= middle) {
          current = chapters[index];
        }
      });
      setChapter((previous) => (previous === current ? previous : current));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    scroller.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    if (ready) {
      sound.chime(chapters.indexOf(chapter));
    }
  }, [chapter, ready]);

  const scene = chapterScene[chapter];

  return (
    <div ref={shellRef} className="app-shell" data-scene={scene}>
      <VideoStage scene={scene} reduced={reduced} onHeroReady={handleHeroReady} />

      <div className="progress" aria-hidden="true" />

      <Navbar currentChapter={chapter} onNavigate={goTo} />

      <main ref={scrollerRef} className={`portfolio-main ${ready ? "" : "is-locked"}`}>
        <Hero ready={ready} onNavigate={goTo} />
        <Signal />
        <Missions />
        <Profile />
        <Vision />
        <Contact />
      </main>

      {!introDone && (
        <IntroExperience heroReady={heroReady} onExit={handleExit} onDone={handleDone} />
      )}
    </div>
  );
}
