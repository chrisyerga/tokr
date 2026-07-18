import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Earth } from "./planets/Earth";
import { Schrodinger, Fish } from "./characters/Schrodinger";
import { SpyActor } from "./spy/SpyActor";

/** Kitchen window — used for spy peek positioning. */
const WINDOW = { x: 455, y: 48, w: 420, h: 340 } as const;

/**
 * Telescope flip gag (overlay starts 168.0 abs):
 * telescope on Earth zooms billions of light years to a distant star,
 * then the NRO flips it around and catches Schrödinger stealing a fish.
 */
const BEATS = {
  // "something I could see billions of light years away" (168.2–176.0 abs)
  zoomIn1: 2.5,
  // "Except" (177.5 abs)
  zoomOut: 9.5,
  // "pointing it the other way" (178.7 abs)
  flip: 10.7,
  // "staring at us" (182.1 abs)
  zoomIn2: 13.5,
  sneak: 14.0,
  grab: 15.0,
  /** Spy slides in outside the window while cat admires the loot. */
  spyPeek: 16.0,
  spyPeekDone: 17.0,
  /** Cat spots the spy → shock flash → bolt. */
  caught: 17.35,
  scurry: 18.15,
  // fade before "It's like looking down at the ground" (187.0 abs)
  fadeOut: 18.5,
  fadeDone: 18.95,
} as const;

// Telescope mount pivot in output px
const PIVOT_X = 540;
const PIVOT_Y = 1290;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/** Cartoon tripod telescope; tube pivots around the mount. */
const Telescope: React.FC<{ aimDeg: number }> = ({ aimDeg }) => (
  <svg
    viewBox="-220 -220 440 320"
    width={440}
    height={320}
    style={{ overflow: "visible" }}
  >
    {/* Tripod */}
    <g stroke="#4f3b22" strokeWidth={14} strokeLinecap="round">
      <line x1={0} y1={0} x2={-72} y2={92} />
      <line x1={0} y1={0} x2={72} y2={92} />
      <line x1={0} y1={0} x2={0} y2={96} />
    </g>
    <circle cx={0} cy={0} r={22} fill="#6e5638" stroke="#4f3b22" strokeWidth={6} />

    {/* Tube assembly */}
    <g transform={`rotate(${aimDeg})`}>
      {/* Main tube */}
      <rect x={-70} y={-30} width={210} height={60} rx={26} fill="#f2f0ea" stroke="#3a3f4d" strokeWidth={6} />
      {/* Stripe */}
      <rect x={20} y={-30} width={34} height={60} fill="#d8a13a" stroke="#3a3f4d" strokeWidth={4} />
      {/* Front aperture */}
      <ellipse cx={140} cy={0} rx={14} ry={30} fill="#0b1e3a" stroke="#3a3f4d" strokeWidth={6} />
      <ellipse cx={140} cy={0} rx={7} ry={18} fill="#9fd4ff" opacity={0.5} />
      {/* Eyepiece at the back, angled down */}
      <g transform="translate(-70, 8) rotate(35)">
        <rect x={-38} y={-12} width={44} height={24} rx={10} fill="#3a3f4d" stroke="#20242e" strokeWidth={5} />
        <ellipse cx={-38} cy={0} rx={6} ry={12} fill="#141821" />
      </g>
    </g>
  </svg>
);

/** Circular eyepiece porthole with vignette ring. */
const EyepieceView: React.FC<{
  opacity: number;
  scale: number;
  children: React.ReactNode;
}> = ({ opacity, scale, children }) => (
  <AbsoluteFill
    style={{
      opacity,
      background: "#000",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        width: 950,
        height: 950,
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative",
        border: "26px solid #141821",
        boxShadow:
          "inset 0 0 120px rgba(0,0,0,0.85), 0 0 60px rgba(159,212,255,0.15)",
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

/** View A: deep space, one glorious distant star. */
const StarView: React.FC<{ t: number }> = ({ t }) => {
  const twinkle = 0.75 + 0.25 * Math.sin(t * Math.PI * 2 * 1.4);
  const drift = Math.sin(t * Math.PI * 2 * 0.06) * 18;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at 50% 48%, #16294a 0%, #0a1428 55%, #040a16 100%)",
      }}
    >
      <svg width={950} height={950} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${drift}, 0)`}>
          {/* Background stars */}
          {Array.from({ length: 90 }).map((_, i) => (
            <circle
              key={i}
              cx={(i * 131) % 950}
              cy={(i * 71) % 950}
              r={(i % 3) * 0.8 + 0.7}
              fill={`rgba(255,255,255,${0.25 + ((i * 13) % 50) / 100})`}
            />
          ))}
          {/* Faint galaxies */}
          <ellipse cx={220} cy={280} rx={54} ry={18} fill="rgba(180,150,255,0.18)" transform="rotate(-24 220 280)" />
          <ellipse cx={730} cy={640} rx={44} ry={14} fill="rgba(150,200,255,0.15)" transform="rotate(30 730 640)" />
          {/* The star */}
          <g transform="translate(475, 445)" opacity={twinkle}>
            <circle r={70} fill="rgba(255,240,200,0.12)" />
            <circle r={38} fill="rgba(255,240,200,0.28)" />
            <circle r={16} fill="#fff6dc" />
            {/* Lens-flare cross */}
            <g stroke="rgba(255,246,220,0.8)" strokeWidth={5} strokeLinecap="round">
              <line x1={-120 * twinkle} y1={0} x2={120 * twinkle} y2={0} />
              <line x1={0} y1={-120 * twinkle} x2={0} y2={120 * twinkle} />
            </g>
            <g stroke="rgba(255,246,220,0.4)" strokeWidth={3.5} strokeLinecap="round" transform="rotate(45)">
              <line x1={-64} y1={0} x2={64} y2={0} />
              <line x1={0} y1={-64} x2={0} y2={64} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

/** View B: warm kitchen — and a cat burglar. */
const CatView: React.FC<{ t: number }> = ({ t }) => {
  const { x: wx, y: wy, w: ww, h: wh } = WINDOW;
  const frameCx = wx + ww / 2;
  const frameCy = wy + wh / 2;

  // Cat choreography (absolute-relative seconds shared with BEATS)
  const sneakX = interpolate(t, [BEATS.sneak, BEATS.grab], [-280, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scurryX = interpolate(t, [BEATS.scurry, BEATS.scurry + 1.0], [300, 1100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const catX = t >= BEATS.scurry ? scurryX : sneakX;

  let pose: "sneak" | "grab" | "shock" | "scurry" = "sneak";
  if (t >= BEATS.scurry) pose = "scurry";
  else if (t >= BEATS.caught) pose = "shock";
  else if (t >= BEATS.grab) pose = "grab";

  const fishStolen = t >= BEATS.grab + 0.45;

  // Spy peeks in from outside the window (slides left into frame)
  const spyPeekP = interpolate(t, [BEATS.spyPeek, BEATS.spyPeekDone], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spyVisible = t >= BEATS.spyPeek;
  const spyLeft = interpolate(spyPeekP, [0, 1], [wx + ww + 40, wx + ww - 210]);
  const spyBob = spyVisible ? Math.sin(t * Math.PI * 2 * 1.2) * 3 : 0;

  // Shock: leaps up with a hop
  const jumpP = clamp01((t - BEATS.caught) / 0.5);
  const jumpY = pose === "shock" ? -Math.sin(jumpP * Math.PI) * 150 - 40 : 0;

  // Caught flash + action lines
  const flash = interpolate(
    t,
    [BEATS.caught, BEATS.caught + 0.12, BEATS.caught + 0.4],
    [0, 0.9, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const burst = interpolate(t, [BEATS.caught, BEATS.caught + 0.7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const caughtLabel = interpolate(
    t,
    [BEATS.caught, BEATS.caught + 0.08, BEATS.caught + 0.55],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(#f0dcb8 0%, #e4c896 70%, #c8a870 100%)",
      }}
    >
      {/* Wallpaper stripes */}
      <svg width={950} height={950} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={i * 130} y={0} width={40} height={620} fill="rgba(190,140,90,0.15)" />
        ))}

        {/* Window night sky (behind frame + spy) */}
        <rect
          x={wx + 14}
          y={wy + 14}
          width={ww - 28}
          height={wh - 28}
          rx={8}
          fill="#0b1e3a"
        />
        {[
          [wx + 72, wy + 58],
          [wx + ww - 90, wy + 44],
          [wx + ww - 48, wy + wh - 72],
          [wx + 56, wy + wh - 58],
          [wx + ww / 2, wy + wh / 2 - 20],
          [wx + ww / 2 + 60, wy + wh / 2 + 40],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={2.5 + (i % 2)} fill="#fff" opacity={0.85} />
        ))}

        {/* Hanging lamp */}
        <line x1={300} y1={0} x2={300} y2={120} stroke="#4a3a26" strokeWidth={7} />
        <path d="M 255 120 L 345 120 L 325 170 L 275 170 Z" fill="#d8a13a" stroke="#8a6a2a" strokeWidth={5} />
        <circle cx={300} cy={178} r={12} fill="#fff2c0" opacity={0.95} />
      </svg>

      {/* Spy peeking in from outside — between sky and window frame */}
      {spyVisible && (
        <div
          style={{
            position: "absolute",
            left: spyLeft,
            top: wy + 52 + spyBob,
            width: 240,
            height: 300,
            zIndex: 2,
            overflow: "hidden",
            transform: "rotate(-6deg)",
            transformOrigin: "50% 100%",
          }}
        >
          <div style={{ marginTop: 36 }}>
            <SpyActor size={250} still />
          </div>
        </div>
      )}

      {/* Window frame + mullions (on top of spy) */}
      <svg
        width={950}
        height={950}
        style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}
      >
        <rect
          x={wx}
          y={wy}
          width={ww}
          height={wh}
          rx={14}
          fill="none"
          stroke="#7a5a34"
          strokeWidth={16}
        />
        <line
          x1={frameCx}
          y1={wy + 10}
          x2={frameCx}
          y2={wy + wh - 10}
          stroke="#7a5a34"
          strokeWidth={10}
        />
        <line
          x1={wx + 10}
          y1={frameCy}
          x2={wx + ww - 10}
          y2={frameCy}
          stroke="#7a5a34"
          strokeWidth={10}
        />
        {/* Sill ledge */}
        <rect
          x={wx - 18}
          y={wy + wh - 8}
          width={ww + 36}
          height={22}
          rx={6}
          fill="#6a4a28"
          stroke="#4a3a26"
          strokeWidth={5}
        />
      </svg>

      {/* Dinner table */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 620 }}>
        <svg width={950} height={330} style={{ overflow: "visible" }}>
          {/* Tablecloth */}
          <rect x={330} y={0} width={640} height={44} rx={10} fill="#c05050" stroke="#7a2e2e" strokeWidth={5} />
          <rect x={344} y={44} width={612} height={16} fill="#a84040" />
          {/* Legs */}
          <rect x={400} y={58} width={26} height={220} fill="#7a5a34" stroke="#4a3a26" strokeWidth={4} />
          <rect x={860} y={58} width={26} height={220} fill="#7a5a34" stroke="#4a3a26" strokeWidth={4} />
          {/* Plate */}
          <ellipse cx={520} cy={4} rx={110} ry={26} fill="#f4f0e6" stroke="#b0a890" strokeWidth={5} />
          <ellipse cx={520} cy={2} rx={78} ry={17} fill="#e4e0d4" />
          {/* Candle */}
          <rect x={790} y={-64} width={16} height={62} rx={5} fill="#f0e6d0" stroke="#b0a890" strokeWidth={3} />
          <ellipse cx={798} cy={-70} rx={7} ry={11 + Math.sin(t * 18) * 2} fill="#ffb347" />
        </svg>
        {/* The fish, until stolen */}
        {!fishStolen && (
          <div style={{ position: "absolute", left: 470, top: -34 }}>
            <Fish size={110} />
          </div>
        )}
      </div>

      {/* Schrödinger */}
      <div
        style={{
          position: "absolute",
          left: catX,
          top: 560 + jumpY,
          zIndex: 2,
        }}
      >
        <Schrodinger size={280} pose={pose} holdFish={fishStolen} />
      </div>

      {/* Caught! — flash + radiating action lines */}
      {burst > 0 && burst < 1 && (
        <svg width={950} height={950} style={{ position: "absolute", inset: 0, zIndex: 3 }}>
          <g
            stroke="#fff"
            strokeWidth={9}
            strokeLinecap="round"
            opacity={1 - burst}
            transform="translate(310, 620)"
          >
            {Array.from({ length: 10 }).map((_, i) => {
              const a = (i / 10) * Math.PI * 2;
              const r1 = 170 + burst * 190;
              const r2 = r1 + 70;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * r1}
                  y1={Math.sin(a) * r1}
                  x2={Math.cos(a) * r2}
                  y2={Math.sin(a) * r2}
                />
              );
            })}
          </g>
        </svg>
      )}
      {caughtLabel > 0 && (
        <div
          style={{
            position: "absolute",
            left: 180,
            top: 380,
            zIndex: 5,
            opacity: caughtLabel,
            transform: `scale(${0.85 + caughtLabel * 0.2}) rotate(-4deg)`,
            fontFamily: '"Montserrat", "Arial Black", Impact, sans-serif',
            fontWeight: 900,
            fontSize: 88,
            color: "#ff3b3b",
            letterSpacing: "0.04em",
            textShadow:
              "6px 0 #000, -6px 0 #000, 0 6px #000, 0 -6px #000, 5px 5px #000, -5px -5px #000",
          }}
        >
          CAUGHT!
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#fff",
          opacity: flash,
          zIndex: 4,
        }}
      />
    </div>
  );
};

export const TelescopeFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  // Scene fades in from the base video, and back out at the end
  const sceneOpacity =
    interpolate(t, [0, 0.5], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    interpolate(t, [BEATS.fadeOut, BEATS.fadeDone], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Zoom envelopes (0 = wide, 1 = fully in the eyepiece)
  const zoomA = interpolate(
    t,
    [BEATS.zoomIn1, BEATS.zoomIn1 + 1.1, BEATS.zoomOut, BEATS.zoomOut + 0.9],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const zoomB = interpolate(t, [BEATS.zoomIn2, BEATS.zoomIn2 + 1.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zoom = Math.max(zoomA, zoomB);
  const usingB = zoomB > zoomA;

  // Telescope flip: -35° (up-right) → 145° (down-left at Earth), with overshoot
  const flipSpring = spring({
    frame: Math.max(0, frame - Math.round(BEATS.flip * fps)),
    fps,
    config: { damping: 11, stiffness: 90 },
  });
  const aimDeg = interpolate(flipSpring, [0, 1], [-35, 145]);

  // Eyepiece world position moves when the tube flips; zoom origin follows.
  const originX = usingB ? "56%" : "43.5%";
  const originY = usingB ? "63.9%" : "69.6%";
  const worldScale = 1 + zoom * 6;

  // Porthole cross-fade once the zoom is most of the way in
  const eyeOpacity = interpolate(zoom, [0.6, 0.95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eyeScale = interpolate(zoom, [0.6, 1], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity, background: "transparent" }}>
      {/* World scene */}
      <AbsoluteFill
        style={{
          transform: `scale(${worldScale})`,
          transformOrigin: `${originX} ${originY}`,
        }}
      >
        {/* Night sky */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, #10254a 0%, #060f22 60%, #01040c 100%)",
          }}
        >
          <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 110 }).map((_, i) => (
              <circle
                key={i}
                cx={(i * 89) % width}
                cy={(i * 47) % (height * 0.75)}
                r={(i % 3) * 0.8 + 0.6}
                fill={`rgba(255,255,255,${0.3 + ((i * 19) % 55) / 100})`}
              />
            ))}
            {/* The destination star twinkles up-right where the telescope points */}
            <g transform="translate(860, 320)" opacity={0.8 + 0.2 * Math.sin(t * 6)}>
              <circle r={7} fill="#fff6dc" />
              <line x1={-20} y1={0} x2={20} y2={0} stroke="#fff6dc" strokeWidth={3} strokeLinecap="round" />
              <line x1={0} y1={-20} x2={0} y2={20} stroke="#fff6dc" strokeWidth={3} strokeLinecap="round" />
            </g>
          </svg>
        </AbsoluteFill>

        {/* Earth as the curved ground */}
        <div
          style={{
            position: "absolute",
            left: width / 2 - 1100,
            top: 1380,
            zIndex: 1,
          }}
        >
          <Earth size={2200} />
        </div>

        {/* Telescope on the horizon */}
        <div
          style={{
            position: "absolute",
            left: PIVOT_X - 220,
            top: PIVOT_Y - 220,
            zIndex: 2,
          }}
        >
          <Telescope aimDeg={aimDeg} />
        </div>
      </AbsoluteFill>

      {/* Eyepiece porthole views */}
      {usingB ? (
        <EyepieceView opacity={eyeOpacity} scale={eyeScale}>
          <CatView t={t} />
        </EyepieceView>
      ) : (
        <EyepieceView opacity={eyeOpacity} scale={eyeScale}>
          <StarView t={t} />
        </EyepieceView>
      )}

    </AbsoluteFill>
  );
};
