import { Heading, Reveal, SplitWords } from "@/components/ui/Reveal";
import { missions } from "@/data/portfolioData";

export function Missions() {
  return (
    <section id="work" className="chapter work">
      <div className="section-head">
        <div>
          <Reveal className="eyebrow text-video-title caps">02 / Active missions</Reveal>
          <Heading level={2} className="display display-lg">
            <Reveal text>
              <span className="line">
                <SplitWords text="Missions." accent />
              </span>
            </Reveal>
          </Heading>
        </div>
        <Reveal delay={200} className="section-note text-label-sm text-text-secondary">
          Three entrepreneurial directions exploring mobility, AI-powered security and the future
          of intelligent digital ecosystems.
        </Reveal>
      </div>

      <div className="mission-list">
        {missions.map((mission, index) => (
          <Reveal key={mission.number} delay={index * 120}>
            <div className="mission">
              <div className={`planet planet-${mission.planet}`} aria-hidden="true">
                <i />
              </div>
              <div className="mission-title">
                <span className="text-video-title text-text-secondary caps">
                  {mission.number} / {mission.category}
                </span>
                <Heading level={3} className="display display-lg">
                  {mission.title}
                </Heading>
              </div>
              <div className="mission-detail">
                <div className="text-label text-text-primary">{mission.description}</div>
                <div className="text-video-title text-text-secondary caps">
                  {mission.tags.join(" \u00b7 ")}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
