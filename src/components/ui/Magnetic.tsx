import { useRef, type PointerEvent, type ReactNode } from "react";

/** Pulls its children slightly toward the pointer on mouse hover. */
export function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element || event.pointerType !== "mouse") return;
    const box = element.getBoundingClientRect();
    const x = (event.clientX - (box.left + box.width / 2)) * 0.22;
    const y = (event.clientY - (box.top + box.height / 2)) * 0.32;
    element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div ref={ref} className="magnetic" onPointerMove={move} onPointerLeave={leave}>
      {children}
    </div>
  );
}
