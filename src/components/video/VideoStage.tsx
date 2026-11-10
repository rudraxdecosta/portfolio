import { useEffect, useRef } from "react";
import type { SceneId } from "@/types/portfolio";

import orbitVideo from "@/assets/video/orbit.mp4";
import orbitPoster from "@/assets/video/orbit.jpg";
import cityVideo from "@/assets/video/city.mp4";
import cityPoster from "@/assets/video/city.jpg";
import stormVideo from "@/assets/video/storm.mp4";
import stormPoster from "@/assets/video/storm.jpg";
import planetVideo from "@/assets/video/planet.mp4";
import planetPoster from "@/assets/video/planet.jpg";

export const scenes = {
  orbit: { video: orbitVideo, poster: orbitPoster },
  city: { video: cityVideo, poster: cityPoster },
  storm: { video: stormVideo, poster: stormPoster },
  planet: { video: planetVideo, poster: planetPoster },
} as const;

interface VideoStageProps {
  scene: SceneId;
  reduced: boolean;
  onHeroReady: () => void;
}

export function VideoStage({ scene, reduced, onHeroReady }: VideoStageProps) {
  const refs = useRef<Partial<Record<SceneId, HTMLVideoElement | null>>>({});

  useEffect(() => {
    const timers: number[] = [];
    (Object.keys(scenes) as SceneId[]).forEach((id) => {
      const video = refs.current[id];
      if (!video) return;
      if (id === scene) {
        if (!reduced) video.play().catch(() => undefined);
      } else {
        // Allow cross-fade to complete smoothly before pausing inactive scene
        timers.push(window.setTimeout(() => video.pause(), 1800));
      }
    });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [scene, reduced]);

  useEffect(() => {
    const hero = refs.current.orbit;
    if (hero && hero.readyState >= 3) onHeroReady();
  }, [onHeroReady]);

  return (
    <div className="stage" aria-hidden="true">
      <div className="stage-layer">
        {(Object.keys(scenes) as SceneId[]).map((id) => (
          <video
            key={id}
            ref={(node) => {
              refs.current[id] = node;
            }}
            className={`scene ${id === scene ? "is-active" : ""}`}
            src={scenes[id].video}
            poster={scenes[id].poster}
            muted
            loop
            playsInline
            preload="auto"
            onCanPlayThrough={id === "orbit" ? onHeroReady : undefined}
          />
        ))}
      </div>
      <div className="stage-tint" />
      <div className="stage-shade" />
      <div className="stage-vignette" />
    </div>
  );
}
