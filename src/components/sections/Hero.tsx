import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Heading, Reveal, SplitWords } from "@/components/ui/Reveal";
import type { ChapterId } from "@/types/portfolio";

interface HeroProps {
  ready: boolean;
  onNavigate: (id: ChapterId) => void;
}

export function Hero({ ready, onNavigate }: HeroProps) {
  return (
    <section id="home" className="chapter hero">
      <div className="hero-inner">
        <Reveal active={ready} className="hero-eyebrow">
          <span className="text-video-title text-text-primary caps">
            AI / ML &middot; Cybersecurity &middot; Mobility
          </span>
        </Reveal>

        <Heading level={1} className="display display-xl">
          <Reveal text active={ready} delay={150}>
            <span className="line">
              <SplitWords text="Aditya Mudgal" />
            </span>
            <span className="line">
              <SplitWords text="Beyond the Known" offset={2} accent />
            </span>
          </Reveal>
        </Heading>

        <Reveal active={ready} delay={650} className="hero-copy">
          <div className="text-label text-text-primary">
            AI and Machine Learning student, cybersecurity enthusiast, aspiring entrepreneur and
            technology innovator based in Jaipur, India.
          </div>
          <div className="actions">
            <Magnetic>
              <Button
                variant="primary"
                className="cta-primary"
                iconEnd={<ArrowRight size={16} />}
                onClick={() => onNavigate("work")}
              >
                See the work
              </Button>
            </Magnetic>
          </div>
        </Reveal>
      </div>

      <Reveal active={ready} delay={950} className="hero-foot">
        <Button
          variant="neutral"
          size="small"
          className="on-video"
          iconEnd={<ArrowDown size={16} className="bob" />}
          onClick={() => onNavigate("signal")}
        >
          Scroll to descend
        </Button>
        <div className="telemetry text-video-title text-text-secondary caps">
          <span>Orbital record 001</span>
          <span>26.9124 N / 75.7873 E</span>
          <span>Human + machine</span>
        </div>
      </Reveal>
    </section>
  );
}
