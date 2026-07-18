import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Earth } from "./planets/Earth";
import { SpyCharacter } from "./title/SpyCharacter";
import { NancyGraceRoman } from "./title/NancyGraceRoman";
import { SpyTelescope } from "./spy/SpyTelescope";
import { UncleClam } from "./spy/UncleClam";
import { MoneyPile } from "./spy/MoneyPile";
import { NasaScientist, SCIENTIST_CAST } from "./spy/NasaScientist";
import { SpyActor, type SpyPose } from "./spy/SpyActor";
import { CharacterIntro } from "./shared/CharacterIntro";

/** Relative beat markers (seconds into overlay @ 86.06 abs). */
const BEATS = {
  spies: 0,
  earth: 5.0,
  clam: 11.0,
  shrug: 20.0,
  nasa: 22.5,
  nancy: 26.5,
  // "...if you need one" ends 114.82 abs; back to video before
  // "Of course I'm irked" at 115.0 abs.
  fadeOut: 28.5,
  fadeDone: 28.9,
} as const;

const EARTH_X = 540;
const EARTH_Y = 520;
const SPY_X = 540;
// Bottom lane sits above the karaoke subtitles (~y 1470+).
const SPY_Y = 1130;

/** Orbit rings in multiple directions; slots fill until every ring is packed. */
type Ring = { rx: number; ry: number; rotDeg: number; speed: number; count: number };
const RINGS: Ring[] = [
  { rx: 240, ry: 105, rotDeg: 0, speed: 0.55, count: 10 },
  { rx: 230, ry: 110, rotDeg: 65, speed: -0.45, count: 10 },
  { rx: 250, ry: 100, rotDeg: -50, speed: 0.5, count: 9 },
];

/** joinAt for each (ring, slot), interleaved across rings. */
type RingSlot = { ring: number; slot: number; joinAt: number };
const RING_SLOTS: RingSlot[] = (() => {
  const slots: RingSlot[] = [];
  const maxCount = Math.max(...RINGS.map((r) => r.count));
  let join = 12.4;
  for (let s = 0; s < maxCount; s++) {
    for (let r = 0; r < RINGS.length; r++) {
      if (s < RINGS[r]!.count) {
        slots.push({ ring: r, slot: s, joinAt: join });
        join += 0.25;
      }
    }
  }
  return slots;
})();

/** Clam ejections: frantic cadence the spy can't keep up with. */
const EJECTIONS: number[] = Array.from({ length: 13 }, (_, i) => 12.0 + i * 0.42);

/** Two sats tumble off the overflowing pile. */
const DROPS = [
  { at: 16.6, x: 300, y: 1310 },
  { at: 17.1, x: 500, y: 1330 },
];

/** Pile of caught-but-not-yet-tossed sats at the spy's feet. */
const PILE_KEYS = [13.0, 13.6, 14.1, 14.6, 15.1, 15.6, 16.1, 17.2, 18.0, 18.7, 19.3, 19.9];
const PILE_VALS = [0, 1, 2, 3, 4, 5, 6, 4, 3, 2, 1, 0];

const MONEY_PILES = [
  { x: 280, eatAt: 12.0 },
  { x: 480, eatAt: 13.5 },
  { x: 680, eatAt: 15.0 },
  { x: 860, eatAt: 16.4 },
];

// Clam lane (above the spy, below the orbits)
const CLAM_Y = 820;
const MONEY_Y = 930;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function ringPoint(ring: Ring, angle: number) {
  const px = Math.cos(angle) * ring.rx;
  const py = Math.sin(angle) * ring.ry;
  const r = (ring.rotDeg * Math.PI) / 180;
  return {
    x: EARTH_X + px * Math.cos(r) - py * Math.sin(r),
    y: EARTH_Y + px * Math.sin(r) + py * Math.cos(r),
  };
}

/**
 * NRO story: spies → Earth surveillance → Uncle Clam funding montage →
 * leftover spy telescopes → NASA celebration → Nancy's hint.
 */
export const SpySatellite: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  // --- Phase helpers ---
  const spiesIn = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const earthIn = spring({
    frame: Math.max(0, frame - BEATS.earth * fps),
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const clamActive = t >= BEATS.clam && t < BEATS.shrug + 1;
  const clamX = clamActive
    ? interpolate(t, [BEATS.clam, BEATS.clam + 6.5], [-200, width + 80], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : -200;
  const nearPile = MONEY_PILES.find(
    (p) => Math.abs(clamX - p.x) < 110 && t >= p.eatAt - 0.3 && t < p.eatAt + 0.5,
  );
  const gobble = nearPile
    ? interpolate(Math.abs(clamX - nearPile.x), [0, 110], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Spy pose: frantic catch/toss alternation while ejections rain down
  let spyPose: SpyPose = "idle";
  const catching = EJECTIONS.some((at) => t >= at + 0.65 && t < at + 0.95);
  const tossing = EJECTIONS.some((at) => t >= at + 0.95 && t < at + 1.3);
  if (t >= BEATS.shrug && t < BEATS.nasa) spyPose = "shrug";
  else if (tossing) spyPose = "toss";
  else if (catching) spyPose = "catch";

  const spyWalk = interpolate(t, [BEATS.shrug + 1.2, BEATS.nasa], [0, width + 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spyVisible = t < BEATS.nasa + 0.2;

  const introSpiesOpacity = interpolate(t, [BEATS.earth - 0.3, BEATS.earth + 1.2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Starfield fades in over the base video as the intro spies fade out,
  // then stays for the rest of the sequence.
  const bgIn = 1 - introSpiesOpacity;

  // Backlog pile at the spy's feet
  const pileCount = Math.round(
    interpolate(t, PILE_KEYS, PILE_VALS, {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  // NASA
  const nasaIn = spring({
    frame: Math.max(0, frame - BEATS.nasa * fps),
    fps,
    config: { damping: 13, stiffness: 110 },
  });
  const shedProgress = interpolate(t, [BEATS.nasa + 1.2, BEATS.nasa + 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const celebrate = t >= BEATS.nasa + 2.4;
  const crowdIn = spring({
    frame: Math.max(0, frame - (BEATS.nasa + 2.3) * fps),
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  // Nancy
  const nancyIn = spring({
    frame: Math.max(0, frame - BEATS.nancy * fps),
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  // Whole scene fades back to the base video after "...if you need one"
  const sceneOpacity = interpolate(t, [BEATS.fadeOut, BEATS.fadeDone], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* Starfield background — transparent during the spy intro, then fades in */}
      <AbsoluteFill
        style={{
          opacity: bgIn,
          background:
            "radial-gradient(ellipse at 50% 35%, #0b1e3a 0%, #020814 65%, #000 100%)",
        }}
      >
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 70 }).map((_, i) => (
            <circle
              key={i}
              cx={(i * 97) % width}
              cy={(i * 53) % (height * 0.85)}
              r={(i % 3) * 0.7 + 0.6}
              fill={`rgba(255,255,255,${0.3 + ((i * 17) % 50) / 100})`}
            />
          ))}
        </svg>
      </AbsoluteFill>

      {/* Beat 1: spy characters pop */}
      <div style={{ opacity: spiesIn * introSpiesOpacity }}>
        {[
          { x: 80, y: 280, delay: 0, size: 200 },
          { x: 720, y: 360, delay: 6, size: 220 },
          { x: 400, y: 200, delay: 12, size: 190 },
        ].map((s, i) => {
          const pop = spring({
            frame: Math.max(0, frame - s.delay),
            fps,
            config: { damping: 12, stiffness: 140 },
          });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: s.x,
                top: s.y,
                transform: `scale(${interpolate(pop, [0, 1], [0.2, 1])})`,
                opacity: pop,
              }}
            >
              <SpyCharacter size={s.size} />
            </div>
          );
        })}
      </div>

      {/* Beat 2+: Earth */}
      <div
        style={{
          position: "absolute",
          left: EARTH_X - 160,
          top: EARTH_Y - 160,
          opacity: earthIn,
          transform: `scale(${interpolate(earthIn, [0, 1], [0.6, 1])})`,
        }}
      >
        <Earth size={320} />
      </div>

      {/* Orbiting sats — multiple rings, filling until packed */}
      {t >= BEATS.earth && <OrbitalSats t={t} earthIn={earthIn} />}

      {/* Money piles */}
      {t >= BEATS.clam - 0.5 &&
        MONEY_PILES.map((p, i) => {
          const eaten = clamp01(
            interpolate(t, [p.eatAt, p.eatAt + 0.45], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          );
          const pileIn = spring({
            frame: Math.max(0, frame - (BEATS.clam - 0.4 + i * 0.15) * fps),
            fps,
            config: { damping: 14, stiffness: 120 },
          });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: p.x - 70,
                top: MONEY_Y,
                opacity: pileIn,
              }}
            >
              <MoneyPile size={150} amount={eaten} />
            </div>
          );
        })}

      {/* Uncle Clam */}
      {clamActive && (
        <div
          style={{
            position: "absolute",
            left: clamX,
            top: CLAM_Y,
            zIndex: 4,
          }}
        >
          <UncleClam size={250} gobble={gobble} racing />
        </div>
      )}

      {/* Uncle Clam name drop + factoids */}
      <Sequence
        from={Math.round(BEATS.clam * fps)}
        durationInFrames={Math.round(3.8 * fps)}
        layout="none"
      >
        <AbsoluteFill style={{ zIndex: 6, pointerEvents: "none" }}>
          <CharacterIntro
          name="UNCLE CLAM"
          nameColor="#d8a13a"
          nameX={220}
          nameY={100}
          factoids={[
            {
              text: "Gobbles cash!",
              delaySec: 0.45,
              x: 30,
              y: 320,
              rotate: -6,
              color: "#7ee787",
            },
            {
              text: "Poops out\nsatellites",
              delaySec: 0.95,
              x: 560,
              y: 420,
              rotate: 5,
              color: "#ff9f43",
            },
          ]}
          fadeOutSec={2.8}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Sats ejected from the clam raining down on the spy */}
      {EJECTIONS.map((at, i) => (
        <EjectedSat key={i} launchAt={at} t={t} width={width} />
      ))}

      {/* Backlog pile at the spy's feet */}
      {Array.from({ length: pileCount }).map((_, i) => (
        <div
          key={`pile-${i}`}
          style={{
            position: "absolute",
            left: SPY_X - 290 + (i % 2) * 30,
            top: 1330 - i * 52,
            transform: `rotate(${i % 2 === 0 ? -10 : 12}deg)`,
            zIndex: 4,
          }}
        >
          <SpyTelescope size={165} disguised bob={false} />
        </div>
      ))}

      {/* Two sats tumble off the pile */}
      {DROPS.map((d, i) => (
        <TumblingSat key={`tumble-${i}`} drop={d} t={t} nasaAt={BEATS.nasa} slot={i} />
      ))}

      {/* Bottom spy */}
      {spyVisible && t >= BEATS.earth && (
        <div
          style={{
            position: "absolute",
            left: width / 2 - 130 + (t >= BEATS.shrug + 1.2 ? spyWalk : 0),
            top: SPY_Y,
            opacity: earthIn,
            zIndex: 5,
          }}
        >
          <SpyActor size={260} pose={spyPose} still={t >= BEATS.shrug + 1.2} />
        </div>
      )}

      {/* NASA scientists */}
      {t >= BEATS.nasa && (
        <>
          <div
            style={{
              position: "absolute",
              left: interpolate(nasaIn, [0, 1], [-200, 280]),
              top: 1150,
              opacity: nasaIn,
              zIndex: 6,
            }}
          >
            <NasaScientist
              size={210}
              variant={SCIENTIST_CAST[1]}
              celebrate={celebrate}
              carrying={t >= BEATS.nasa + 0.8}
            />
          </div>
          {t >= BEATS.nasa + 0.8 && t < BEATS.nasa + 2.5 && (
            <div
              style={{
                position: "absolute",
                left: 400,
                top: 1210,
                zIndex: 7,
                transform: `scale(${interpolate(shedProgress, [0, 1], [1, 1.15])})`,
              }}
            >
              <SpyTelescope size={180} shedProgress={shedProgress} bob={false} />
            </div>
          )}
          {t >= BEATS.nasa + 2.4 && (
            <div
              style={{
                position: "absolute",
                left: 400,
                top: 1000,
                opacity: crowdIn,
                zIndex: 6,
              }}
            >
              <SpyTelescope size={220} disguised={false} shedProgress={1} />
            </div>
          )}
          {[
            { v: SCIENTIST_CAST[0]!, x: 120, delay: 0 },
            { v: SCIENTIST_CAST[2]!, x: 620, delay: 4 },
            { v: SCIENTIST_CAST[3]!, x: 780, delay: 8 },
            { v: SCIENTIST_CAST[4]!, x: 40, delay: 10 },
          ].map((c, i) => {
            const pop = spring({
              frame: Math.max(0, frame - (BEATS.nasa + 2.3) * fps - c.delay),
              fps,
              config: { damping: 12, stiffness: 140 },
            });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: c.x,
                  top: 1200 + (i % 2) * 40,
                  opacity: pop,
                  transform: `scale(${interpolate(pop, [0, 1], [0.3, 1])})`,
                  zIndex: 6,
                }}
              >
                <NasaScientist size={180} variant={c.v} celebrate={celebrate} />
              </div>
            );
          })}
        </>
      )}

      {/* Nancy hint */}
      {t >= BEATS.nancy && (
        <div
          style={{
            position: "absolute",
            left: 700,
            top: 180,
            opacity: nancyIn,
            transform: `translateY(${interpolate(nancyIn, [0, 1], [-40, 0])}px)`,
            zIndex: 8,
          }}
        >
          <NancyGraceRoman
            size={260}
            speech={"Whatcha gonna call it?\nHint hint"}
            speechAt={BEATS.nancy + 0.3}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};

const OrbitalSats: React.FC<{ t: number; earthIn: number }> = ({ t, earthIn }) => {
  // Seed sat from the surveillance beat occupies ring 0, slot 0.
  const seedJoin = BEATS.earth + 0.3;

  return (
    <>
      {RING_SLOTS.map(({ ring, slot, joinAt }, i) => {
        const join = ring === 0 && slot === 0 ? seedJoin : joinAt;
        if (t < join) return null;
        const r = RINGS[ring]!;
        const age = t - join;
        const angle = (slot / r.count) * Math.PI * 2 + t * r.speed;
        const { x, y } = ringPoint(r, angle);
        const pop = clamp01(age * 3);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 85,
              top: y - 50,
              opacity: earthIn * pop,
              transform: `scale(${0.65 + pop * 0.15}) rotate(${(angle * 180) / Math.PI + 90}deg)`,
              zIndex: 2,
            }}
          >
            <SpyTelescope size={170} disguised bob={false} />
          </div>
        );
      })}
    </>
  );
};

/** Clam-ejected sat: arcs from the clam's position down to the spy. */
const EjectedSat: React.FC<{ launchAt: number; t: number; width: number }> = ({
  launchAt,
  t,
  width,
}) => {
  const local = t - launchAt;
  if (local < 0 || local > 0.9) return null;

  // Clam position at launch time (matches clamX interpolation)
  const fromX = interpolate(launchAt, [BEATS.clam, BEATS.clam + 6.5], [-200, width + 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const p = local / 0.9;
  const x = interpolate(p, [0, 1], [fromX - 40, SPY_X]);
  let y = interpolate(p, [0, 1], [CLAM_Y + 80, SPY_Y + 40], { easing: (v) => v * v });
  y -= Math.sin(p * Math.PI) * 160;
  const rot = p * 260;

  return (
    <div
      style={{
        position: "absolute",
        left: x - 85,
        top: y - 50,
        transform: `rotate(${rot}deg) scale(0.85)`,
        zIndex: 4,
        opacity: clamp01(local * 5),
      }}
    >
      <SpyTelescope size={170} disguised bob={false} />
    </div>
  );
};

/** Sat that tumbles off the overflowing pile onto the ground and stays. */
const TumblingSat: React.FC<{
  drop: { at: number; x: number; y: number };
  t: number;
  nasaAt: number;
  slot: number;
}> = ({ drop, t, nasaAt, slot }) => {
  if (t < drop.at) return null;
  // First leftover gets picked up by NASA
  if (slot === 0 && t >= nasaAt + 0.8) return null;

  const p = clamp01((t - drop.at) / 0.55);
  const fromX = SPY_X - 260;
  const fromY = 1120;
  const x = interpolate(p, [0, 1], [fromX, drop.x]);
  let y = interpolate(p, [0, 1], [fromY, drop.y], { easing: (v) => v * v });
  y -= Math.sin(p * Math.PI) * 60;
  const rot = interpolate(p, [0, 1], [30, -12]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `rotate(${rot}deg)`,
        zIndex: 3,
      }}
    >
      <SpyTelescope size={185} disguised bob={false} />
    </div>
  );
};
