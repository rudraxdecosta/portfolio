import { type CSSProperties, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

/** Fades a block up, or unmasks the words inside it, once it enters view. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  text = false,
  active,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  text?: boolean;
  active?: boolean;
}) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const on = active ?? seen;

  return (
    <div
      ref={ref}
      className={`reveal ${text ? "reveal-text" : ""} ${on ? "is-in" : ""} ${className}`}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function SplitWords({
  text,
  offset = 0,
  accent = false,
}: {
  text: string;
  offset?: number;
  accent?: boolean;
}) {
  return (
    <>
      {text.split(" ").map((word, index, all) => (
        <span key={`${word}-${index}`}>
          <span
            className={`word ${accent ? "is-accent" : ""}`}
            style={{ "--i": index + offset } as CSSProperties}
          >
            <span className="word-inner">{word}</span>
          </span>
          {index < all.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

export function Heading({
  level,
  className,
  children,
}: {
  level: 1 | 2 | 3;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="heading" aria-level={level} className={className}>
      {children}
    </div>
  );
}
