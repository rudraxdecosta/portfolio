import { Metric } from "@/components/ui/Metric";
import { Heading, Reveal, SplitWords } from "@/components/ui/Reveal";
import { capabilities, metrics, milestones } from "@/data/portfolioData";
import { pad } from "@/lib/utils";

export function Profile() {
  return (
    <section id="about" className="chapter about">
      <div className="section-head">
        <div>
          <Reveal className="eyebrow text-video-title caps">03 / Operator profile</Reveal>
          <Heading level={2} className="display display-lg">
            <Reveal text>
              <span className="line">
                <SplitWords text="Curious by nature." />
              </span>
              <span className="line">
                <SplitWords text="Driven to build." offset={3} accent />
              </span>
            </Reveal>
          </Heading>
        </div>
      </div>

      <div className="profile">
        <Reveal className="profile-intro-wrap">
          <div className="block tone-black profile-intro">
            <div className="text-heading font-medium">
              Useful technology at the edge of AI, security and movement.
            </div>
            <div className="text-label-sm profile-copy">
              I&rsquo;m a B.Tech student specializing in Artificial Intelligence and Machine
              Learning at Birla Institute of Technology, Jaipur. I&rsquo;ve worked in the
              cybersecurity domain and enjoy turning emerging technologies into practical,
              meaningful solutions.
            </div>
            <div className="skill-row">
              {capabilities.map((item) => (
                <span className="skill text-label-sm" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {metrics.map((metric, index) => (
          <Reveal key={metric.label} delay={index * 120} className={`metric-wrap metric-${index}`}>
            <Metric {...metric} />
          </Reveal>
        ))}

        <Reveal delay={360} className="status-wrap">
          <div className="block tone-plum status">
            <span className="text-video-title caps profile-copy">Availability & Funding</span>
            <div className="text-heading font-medium">
              Open for custom high-impact builds, engineering contracts, and seed backing.
            </div>
            <span className="text-video-title caps profile-copy">
              Commission an elite experience or fund our active ventures
            </span>
          </div>
        </Reveal>

        <Reveal className="milestones-wrap">
          <div className="block tone-black milestones">
            <div className="text-label font-semibold milestones-title">Milestones</div>
            {milestones.map(([metric, title, detail], index) => (
              <div className="milestone" key={title}>
                <span className="text-video-title milestone-index">{pad(index + 1)}</span>
                <span className="text-video-title caps milestone-metric">{metric}</span>
                <span className="text-label font-medium">{title}</span>
                <span className="text-label-sm milestone-detail">{detail}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
