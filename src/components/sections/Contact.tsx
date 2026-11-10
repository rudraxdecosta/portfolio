import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Heading, Reveal, SplitWords } from "@/components/ui/Reveal";
import { EMAIL, INSTAGRAM_URL, LINKEDIN_URL } from "@/data/portfolioData";

export function Contact() {
  return (
    <section id="contact" className="chapter contact">
      <div className="contact-inner">
        <Reveal className="eyebrow text-video-title caps">05 / Open channel</Reveal>
        <Heading level={2} className="display display-xl">
          <Reveal text>
            <span className="line">
              <SplitWords text="Let&rsquo;s make" />
            </span>
            <span className="line">
              <SplitWords text="contact." offset={2} accent />
            </span>
          </Reveal>
        </Heading>
        <Reveal delay={250} className="contact-copy">
          <div className="text-label text-text-primary">Have a mission in mind?</div>
          <div className="actions">
            <Magnetic>
              <Button
                variant="primary"
                iconEnd={<ArrowRight size={16} />}
                onClick={() => {
                  window.location.href = EMAIL;
                }}
              >
                Make contact
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
