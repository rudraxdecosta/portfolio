import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BlackHoleCanvas } from "@/components/canvas/BlackHoleCanvas";
import { sound } from "@/lib/sound";
import { clamp, pad } from "@/lib/utils";
import type { DiveState } from "@/types/portfolio";

const APPROACH_MS = 5200;
const PLUNGE_MS = 1700;
const LOAD_LIMIT_MS = 9000;

interface IntroExperienceProps {
  heroReady: boolean;
  onExit: () => void;
  onDone: () => void;
}

export function IntroExperience({ heroReady, onExit, onDone }: IntroExperienceProps) {
  const [count, setCount] = useState(0);
  const [diving, setDiving] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const readyRef = useRef(heroReady);
  readyRef.current = heroReady;
  const dive = useRef<DiveState>({ approach: 0, plunge: 0 });
  const distanceRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const start = performance.now();
    let plungeStart = 0;
    let frame = 0;
    let exited = false;

    const tick = (now: number) => {
      const elapsed = now - start;
      const approach = clamp(elapsed / APPROACH_MS);
      if (!plungeStart && approach >= 1 && (readyRef.current || elapsed > LOAD_LIMIT_MS)) {
        plungeStart = now;
        setDiving(true);
      }
      const plunge = plungeStart ? clamp((now - plungeStart) / PLUNGE_MS) : 0;
      dive.current.approach = approach;
      dive.current.plunge = plunge;
      sound.dive(approach, plunge);

      // Mirror shader camera distance (in Schwarzschild radii) for telemetry readout
      const eased = approach * approach * (3 - 2 * approach);
      const far = 22 + (14 - 22) * eased;
      const distance = far + (1.02 - far) * Math.pow(plunge, 1.8);
      if (distanceRef.current) distanceRef.current.textContent = distance.toFixed(2);

      // Hold at 99 until the plunge completes
      setCount(plunge >= 1 ? 100 : Math.min(99, Math.round((approach * 0.9 + plunge * 0.1) * 100)));
      if (plunge >= 1 && !exited) {
        exited = true;
        sound.impact();
        setLeaving(true);
        onExit();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onExit]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(onDone, 1500);
    return () => window.clearTimeout(timer);
  }, [leaving, onDone]);

  return (
    <div
      className={`intro ${diving ? "is-diving" : ""} ${leaving ? "is-leaving" : ""}`}
      role="status"
      aria-label="Loading portfolio"
      style={{ "--count": count / 100 } as CSSProperties}
    >
      <BlackHoleCanvas state={dive} className="intro-canvas" />
      <div className="intro-row text-video-title text-text-secondary caps">
        <span>Aditya Mudgal</span>
        <span>2026</span>
      </div>
      <div className="intro-name display display-lg" aria-hidden="true">
        {["Aditya", "Mudgal"].map((name, line) => (
          <span className="intro-line" key={name}>
            {name.split("").map((char, index) => (
              <span
                className="intro-char"
                key={`${char}-${index}`}
                style={{ "--i": index + line * 6 } as CSSProperties}
              >
                {char}
              </span>
            ))}
          </span>
        ))}
      </div>
      <div className="intro-row text-video-title text-text-secondary caps">
        <span>Jaipur, India</span>
        <span className="intro-readout">
          {diving ? "Crossing the event horizon" : "Distance to horizon"}{" "}
          <span ref={distanceRef} className="intro-distance">
            22.00
          </span>{" "}
          rs
        </span>
        <span className="intro-count">{pad(count, 3)}</span>
      </div>
      <div className="intro-rule" aria-hidden="true" />
    </div>
  );
}
