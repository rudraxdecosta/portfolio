import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Heading, Reveal, SplitWords } from "@/components/ui/Reveal";
import { FUNDING_EMAIL, INSTAGRAM_URL, LINKEDIN_URL, WORK_INQUIRY_EMAIL } from "@/data/portfolioData";

export function Contact() {
  return (
    <section id="contact" className="chapter contact">
      <div className="contact-inner">
        <Reveal className="eyebrow text-video-title caps">05 / Commissions & Backing</Reveal>
        <Heading level={2} className="display display-xl">
          <Reveal text>
            <span className="line">
              <SplitWords text="Like this build?" />
            </span>
            <span className="line">
              <SplitWords text="Let&rsquo;s build yours." offset={3} accent />
            </span>
          </Reveal>
        </Heading>
        <Reveal delay={250} className="contact-copy">
          <div className="text-heading font-medium" style={{ marginBottom: "8px" }}>
            I designed &amp; coded this entire experience from scratch.
          </div>
          <div
            className="text-label text-text-primary"
            style={{ marginBottom: "24px", maxWidth: "620px" }}
          >
            Looking for an elite interactive website, a bespoke AI/ML prototype, or wanting to
            invest in ventures like Traxy, Darkra, or Aegis? Let&rsquo;s discuss your vision and budget.
          </div>
          <div className="actions">
            <Magnetic>
              <Button
                variant="primary"
                iconEnd={<ArrowRight size={16} />}
                onClick={() => {
                  window.location.href = WORK_INQUIRY_EMAIL;
                }}
              >
                Commission a build
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                variant="neutral"
                className="on-video"
                iconEnd={<Sparkles size={16} />}
                onClick={() => {
                  window.location.href = FUNDING_EMAIL;
                }}
              >
                Back / Fund my work
              </Button>
            </Magnetic>
            <Button
              variant="neutral"
              className="on-video"
              onClick={() => window.open(LINKEDIN_URL, "_blank", "noopener,noreferrer")}
            >
              LinkedIn
            </Button>
            <Button
              variant="neutral"
              className="on-video"
              onClick={() => window.open(INSTAGRAM_URL, "_blank", "noopener,noreferrer")}
            >
              Instagram
            </Button>
          </div>
        </Reveal>
      </div>
      <div className="footer-row text-video-title text-text-secondary caps">
        <span>&copy; 2026 Aditya Mudgal</span>
        <span>Jaipur, India</span>
      </div>
    </section>
  );
}
