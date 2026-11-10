import { type CSSProperties } from "react";
import { Heading } from "@/components/ui/Reveal";
import { manifesto } from "@/data/portfolioData";

export function Signal() {
  return (
    <section id="signal" className="chapter signal">
      <div className="signal-sticky">
        <div className="signal-row text-video-title text-text-secondary caps">
          <span>01 / Signal acquired</span>
          <span>Strength 98.4%</span>
        </div>
        <Heading level={2} className="display display-md manifesto">
          {manifesto.split(" ").map((word, index, all) => (
            <span key={`${word}-${index}`}>
              <span
                className="scroll-word"
                style={{ "--i": index, "--n": all.length } as CSSProperties}
              >
                {word}
              </span>
              {index < all.length - 1 ? " " : null}
            </span>
          ))}
        </Heading>
        <div className="signal-row text-video-title text-text-secondary caps" aria-hidden="true">
          <span>Transmission</span>
          <span className="wave">
            {Array.from({ length: 56 }, (_, index) => (
              <i
                key={index}
                style={
                  {
                    "--h": `${16 + ((index * 37) % 74)}%`,
                    "--bi": index,
                  } as CSSProperties
                }
              />
            ))}
          </span>
          <span>00:24:16:08</span>
        </div>
      </div>
    </section>
  );
}
