import { Heading, Reveal, SplitWords } from "@/components/ui/Reveal";

export function Vision() {
  return (
    <section id="vision" className="chapter vision">
      <div className="vision-inner">
        <Reveal className="eyebrow text-video-title caps">04 / Vision</Reveal>
        <Reveal delay={150} className="vision-copy text-label text-text-primary">
          I want to build impactful technology products, explore new possibilities in AI, and
          create secure, intelligent, accessible digital ecosystems.
        </Reveal>
        <Heading level={2} className="display display-lg">
          <Reveal text>
            <span className="line">
              <SplitWords text="Curious by nature." />
            </span>
            <span className="line">
              <SplitWords text="Driven by innovation." offset={3} />
            </span>
            <span className="line">
              <SplitWords text="Focused on building what&rsquo;s next." offset={6} accent />
            </span>
          </Reveal>
        </Heading>
      </div>
    </section>
  );
}
