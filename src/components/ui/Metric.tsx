import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import { clamp, pad } from "@/lib/utils";

export function CountUp({ to, active, size = 2 }: { to: number; active: boolean; size?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (prefersReducedMotion()) {
      setValue(to);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = clamp((now - start) / 1800);
      setValue(Math.round(to * (1 - Math.pow(1 - progress, 4))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, to]);

  return <>{pad(value, size)}</>;
}

export function Metric({
  value,
  label,
  detail,
  tone,
}: {
  value: number;
  label: string;
  detail: string;
  tone: "yellow" | "violet" | "light";
}) {
  const [ref, seen] = useInView<HTMLDivElement>(0.4);

  return (
    <div ref={ref} className={`block metric tone-${tone}`}>
      <span className="display display-xl metric-value">
        <CountUp to={value} active={seen} />
      </span>
      <div className="metric-text">
        <span className="text-label font-semibold">{label}</span>
        <span className="text-video-title caps metric-detail">{detail}</span>
      </div>
    </div>
  );
}
