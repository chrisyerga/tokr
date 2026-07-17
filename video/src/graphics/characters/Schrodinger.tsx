import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Schrödinger: recurring naughty black cat. Faces right.
 *
 * Poses:
 *  - idle:   standing, tail sway, ear flicks
 *  - sneak:  low crouch, tail flat, tip-toe leg cycle
 *  - grab:   reared up, one front paw extended
 *  - shock:  airborne, legs splayed, fur spikes, bottle-brush tail
 *  - scurry: flat-out run, legs a spinning blur
 *
 * Emotions swap the face independently of the pose.
 */
export type SchrodingerPose = "idle" | "sneak" | "grab" | "shock" | "scurry";
export type SchrodingerEmotion = "neutral" | "sly" | "shocked" | "content";

const BODY = "#26262e";
const BODY_DARK = "#0d0d12";
const CHEST = "#e8e4dc";
const EYE_GREEN = "#4ade80";
const PINK = "#e8849a";

/** Small cartoon fish — reusable on plates or clamped in a cat's mouth. */
export const Fish: React.FC<{ size?: number; flip?: boolean }> = ({
  size = 90,
  flip = false,
}) => (
  <svg
    viewBox="0 0 120 60"
    width={size}
    height={size / 2}
    style={{
      overflow: "visible",
      transform: flip ? "scaleX(-1)" : undefined,
    }}
  >
    {/* Body */}
    <path
      d="M 12 30 Q 40 4 74 22 Q 92 30 74 38 Q 40 56 12 30 Z"
      fill="#7fb8d4"
      stroke="#3a6a86"
      strokeWidth={4}
    />
    {/* Tail */}
    <path d="M 74 30 L 104 12 Q 98 30 104 48 Z" fill="#7fb8d4" stroke="#3a6a86" strokeWidth={4} strokeLinejoin="round" />
    {/* Belly sheen */}
    <path d="M 20 32 Q 44 46 68 36" fill="none" stroke="#b8dcee" strokeWidth={4} strokeLinecap="round" />
    {/* Eye (X — it's dinner) */}
    <path d="M 28 22 L 36 30 M 36 22 L 28 30" stroke="#1e3a4e" strokeWidth={3.5} strokeLinecap="round" />
    {/* Gill */}
    <path d="M 46 18 Q 52 30 46 42" fill="none" stroke="#3a6a86" strokeWidth={3} />
  </svg>
);

const Face: React.FC<{ emotion: SchrodingerEmotion; t: number }> = ({ emotion, t }) => {
  if (emotion === "shocked") {
    const jitter = Math.sin(t * 40) * 1.2;
    return (
      <g>
        {/* Bug eyes: huge whites, pinprick pupils */}
        <circle cx={168} cy={44} r={17} fill="#fff" stroke={BODY_DARK} strokeWidth={3.5} />
        <circle cx={198} cy={44} r={17} fill="#fff" stroke={BODY_DARK} strokeWidth={3.5} />
        <circle cx={170 + jitter} cy={45} r={3.2} fill="#111" />
        <circle cx={200 + jitter} cy={45} r={3.2} fill="#111" />
        {/* Yowling mouth */}
        <ellipse cx={185} cy={72} rx={9} ry={12} fill="#5a2030" stroke={BODY_DARK} strokeWidth={3} />
        <path d="M 181 61 L 183 65 M 189 61 L 187 65" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    );
  }
  if (emotion === "sly") {
    return (
      <g>
        {/* Half-lidded green eyes */}
        <path d="M 158 44 Q 168 38 178 44 L 178 50 Q 168 54 158 50 Z" fill={EYE_GREEN} stroke={BODY_DARK} strokeWidth={3} />
        <path d="M 190 44 Q 200 38 210 44 L 210 50 Q 200 54 190 50 Z" fill={EYE_GREEN} stroke={BODY_DARK} strokeWidth={3} />
        <rect x={166} y={44} width={5} height={8} rx={2} fill="#111" />
        <rect x={198} y={44} width={5} height={8} rx={2} fill="#111" />
        {/* Heavy lids */}
        <path d="M 156 43 L 180 41" stroke={BODY_DARK} strokeWidth={3.5} strokeLinecap="round" />
        <path d="M 188 41 L 212 43" stroke={BODY_DARK} strokeWidth={3.5} strokeLinecap="round" />
        {/* Smirk */}
        <path d="M 176 66 Q 185 72 196 64" fill="none" stroke={BODY_DARK} strokeWidth={3.5} strokeLinecap="round" />
      </g>
    );
  }
  if (emotion === "content") {
    return (
      <g>
        {/* Happy closed eyes */}
        <path d="M 158 46 Q 168 38 178 46" fill="none" stroke={BODY_DARK} strokeWidth={4} strokeLinecap="round" />
        <path d="M 190 46 Q 200 38 210 46" fill="none" stroke={BODY_DARK} strokeWidth={4} strokeLinecap="round" />
        {/* :3 mouth */}
        <path d="M 176 64 Q 181 70 185 64 Q 189 70 195 64" fill="none" stroke={BODY_DARK} strokeWidth={3.5} strokeLinecap="round" />
      </g>
    );
  }
  // neutral
  const blink = (t % 3.4) < 0.12 ? 0.15 : 1;
  return (
    <g>
      <ellipse cx={168} cy={46} rx={8} ry={10 * blink} fill={EYE_GREEN} stroke={BODY_DARK} strokeWidth={3} />
      <ellipse cx={200} cy={46} rx={8} ry={10 * blink} fill={EYE_GREEN} stroke={BODY_DARK} strokeWidth={3} />
      {blink > 0.5 && (
        <>
          <ellipse cx={170} cy={47} rx={3} ry={6} fill="#111" />
          <ellipse cx={202} cy={47} rx={3} ry={6} fill="#111" />
        </>
      )}
      <path d="M 178 64 Q 185 68 192 64" fill="none" stroke={BODY_DARK} strokeWidth={3.5} strokeLinecap="round" />
    </g>
  );
};

/** Head group (~70px wide) centered around (185, 48) with ears, whiskers, face. */
const Head: React.FC<{
  emotion: SchrodingerEmotion;
  t: number;
  spiked: boolean;
}> = ({ emotion, t, spiked }) => {
  const earFlick = Math.sin(t * Math.PI * 2 * 0.3) > 0.92 ? -8 : 0;
  return (
    <g>
      {/* Ears */}
      <g transform={spiked ? "translate(-2,-6) rotate(-10 165 14)" : `rotate(${earFlick} 165 20)`}>
        <path d="M 152 32 L 158 2 L 176 24 Z" fill={BODY} stroke={BODY_DARK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 158 24 L 161 11 L 169 21 Z" fill={PINK} />
      </g>
      <g transform={spiked ? "translate(2,-6) rotate(10 205 14)" : undefined}>
        <path d="M 216 32 L 212 2 L 194 24 Z" fill={BODY} stroke={BODY_DARK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 210 24 L 208 11 L 200 21 Z" fill={PINK} />
      </g>
      {/* Head */}
      <ellipse cx={185} cy={48} rx={38} ry={34} fill={BODY} stroke={BODY_DARK} strokeWidth={4.5} />
      {/* Spiked cheek fur when shocked */}
      {spiked && (
        <g fill={BODY} stroke={BODY_DARK} strokeWidth={3.5} strokeLinejoin="round">
          <path d="M 150 38 L 138 32 L 149 46 L 136 46 L 150 54 Z" />
          <path d="M 220 38 L 232 32 L 221 46 L 234 46 L 220 54 Z" />
        </g>
      )}
      <Face emotion={emotion} t={t} />
      {/* Nose */}
      <path d="M 181 56 L 189 56 L 185 61 Z" fill={PINK} stroke={BODY_DARK} strokeWidth={2.5} strokeLinejoin="round" />
      {/* Whiskers */}
      <g stroke="#c8c4bc" strokeWidth={2.5} strokeLinecap="round" fill="none">
        <path d="M 152 56 L 128 52" />
        <path d="M 152 62 L 130 64" />
        <path d="M 218 56 L 242 52" />
        <path d="M 218 62 L 240 64" />
      </g>
    </g>
  );
};

export const Schrodinger: React.FC<{
  size?: number;
  pose?: SchrodingerPose;
  emotion?: SchrodingerEmotion;
  /** Fish clamped in mouth */
  holdFish?: boolean;
}> = ({ size = 240, pose = "idle", emotion, holdFish = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Sensible default face per pose, overridable
  const face: SchrodingerEmotion =
    emotion ??
    (pose === "shock"
      ? "shocked"
      : pose === "sneak" || pose === "grab"
        ? "sly"
        : "neutral");

  const tailSway = Math.sin(t * Math.PI * 2 * 0.5) * 14;
  const runCycle = t * Math.PI * 2 * 5;
  const sneakBob = Math.sin(t * Math.PI * 2 * 1.6) * 3;
  const shockShake = pose === "shock" ? Math.sin(t * 50) * 2 : 0;

  return (
    <div
      style={{
        width: size,
        height: size * 0.85,
        filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.45))",
      }}
    >
      <svg viewBox="0 0 280 240" width="100%" height="100%" style={{ overflow: "visible" }}>
        {pose === "idle" && (
          <g>
            {/* Tail */}
            <path
              d={`M 40 160 Q ${8 + tailSway} 130 ${22 + tailSway} 88`}
              fill="none"
              stroke={BODY}
              strokeWidth={16}
              strokeLinecap="round"
            />
            {/* Body */}
            <ellipse cx={95} cy={165} rx={70} ry={48} fill={BODY} stroke={BODY_DARK} strokeWidth={4.5} />
            {/* Chest patch */}
            <ellipse cx={140} cy={175} rx={24} ry={30} fill={CHEST} opacity={0.9} />
            {/* Legs */}
            <rect x={62} y={192} width={16} height={38} rx={8} fill={BODY} stroke={BODY_DARK} strokeWidth={3.5} />
            <rect x={118} y={192} width={16} height={38} rx={8} fill={BODY} stroke={BODY_DARK} strokeWidth={3.5} />
            <g transform="translate(0, 62)">
              <Head emotion={face} t={t} spiked={false} />
            </g>
          </g>
        )}

        {pose === "sneak" && (
          <g transform={`translate(0, ${sneakBob})`}>
            {/* Flat tail trailing low */}
            <path
              d={`M 30 196 Q ${-6 + tailSway * 0.4} 192 ${-24} 200`}
              fill="none"
              stroke={BODY}
              strokeWidth={15}
              strokeLinecap="round"
            />
            {/* Long low body */}
            <path
              d="M 28 210 Q 30 176 80 172 Q 140 168 170 182 L 170 214 Q 100 226 28 210 Z"
              fill={BODY}
              stroke={BODY_DARK}
              strokeWidth={4.5}
            />
            {/* Tip-toe legs, alternating */}
            {[52, 92, 132].map((x, i) => (
              <rect
                key={x}
                x={x}
                y={208 + Math.sin(runCycle * 0.35 + i * 2.1) * 4}
                width={13}
                height={26}
                rx={6}
                fill={BODY}
                stroke={BODY_DARK}
                strokeWidth={3}
              />
            ))}
            {/* Head low and forward */}
            <g transform="translate(14, 128) scale(0.95)">
              <Head emotion={face} t={t} spiked={false} />
            </g>
          </g>
        )}

        {pose === "grab" && (
          <g>
            {/* Excited tail curl */}
            <path
              d={`M 58 190 Q ${20 + tailSway} 160 ${36 + tailSway} 110 Q ${42 + tailSway} 92 ${58 + tailSway * 0.5} 96`}
              fill="none"
              stroke={BODY}
              strokeWidth={15}
              strokeLinecap="round"
            />
            {/* Upright body */}
            <path
              d="M 70 226 Q 58 160 92 118 Q 112 96 132 116 Q 152 156 148 226 Z"
              fill={BODY}
              stroke={BODY_DARK}
              strokeWidth={4.5}
            />
            <ellipse cx={112} cy={190} rx={22} ry={32} fill={CHEST} opacity={0.9} />
            {/* Hind feet */}
            <ellipse cx={84} cy={228} rx={18} ry={9} fill={BODY} stroke={BODY_DARK} strokeWidth={3.5} />
            <ellipse cx={134} cy={228} rx={18} ry={9} fill={BODY} stroke={BODY_DARK} strokeWidth={3.5} />
            {/* Reaching front paw */}
            <path d="M 120 130 Q 160 100 196 92" fill="none" stroke={BODY} strokeWidth={16} strokeLinecap="round" />
            <circle cx={198} cy={90} r={11} fill={BODY} stroke={BODY_DARK} strokeWidth={3.5} />
            {/* Toe beans */}
            <circle cx={194} cy={85} r={2.5} fill={PINK} />
            <circle cx={201} cy={84} r={2.5} fill={PINK} />
            {/* Other paw tucked */}
            <path d="M 106 140 Q 92 152 96 166" fill="none" stroke={BODY} strokeWidth={14} strokeLinecap="round" />
            {/* Head up, tilted toward the prize */}
            <g transform="translate(-42, 30) rotate(-8 185 48)">
              <Head emotion={face} t={t} spiked={false} />
            </g>
          </g>
        )}

        {pose === "shock" && (
          <g transform={`translate(${shockShake}, 0)`}>
            {/* Bottle-brush tail */}
            <g>
              <path d="M 52 150 Q 22 120 30 74" fill="none" stroke={BODY} strokeWidth={26} strokeLinecap="round" />
              {/* Tail spikes */}
              <g fill={BODY} stroke={BODY_DARK} strokeWidth={3} strokeLinejoin="round">
                <path d="M 20 120 L 4 112 L 22 132 Z" />
                <path d="M 18 96 L 2 84 L 22 106 Z" />
                <path d="M 24 74 L 14 56 L 36 72 Z" />
                <path d="M 44 132 L 30 144 L 50 146 Z" />
              </g>
            </g>
            {/* Airborne body with jagged fur outline */}
            <path
              d="M 60 140 L 72 122 L 82 134 L 96 116 L 108 130 L 124 118 L 132 134 L 148 128
                 L 150 160 L 140 178 L 124 170 L 110 184 L 94 172 L 78 184 L 64 170 L 56 158 Z"
              fill={BODY}
              stroke={BODY_DARK}
              strokeWidth={4.5}
              strokeLinejoin="round"
            />
            <ellipse cx={118} cy={158} rx={18} ry={20} fill={CHEST} opacity={0.85} />
            {/* Splayed legs */}
            <path d="M 74 168 L 44 200" stroke={BODY} strokeWidth={15} strokeLinecap="round" />
            <path d="M 100 178 L 88 216" stroke={BODY} strokeWidth={15} strokeLinecap="round" />
            <path d="M 128 176 L 144 212" stroke={BODY} strokeWidth={15} strokeLinecap="round" />
            <path d="M 146 158 L 182 184" stroke={BODY} strokeWidth={15} strokeLinecap="round" />
            {/* Claws out */}
            <g stroke={BODY_DARK} strokeWidth={3} strokeLinecap="round">
              <path d="M 40 202 L 34 208 M 46 206 L 42 213" />
              <path d="M 84 218 L 80 225 M 92 219 L 90 226" />
            </g>
            {/* Head thrown up */}
            <g transform="translate(-40, 6)">
              <Head emotion={face} t={t} spiked />
            </g>
          </g>
        )}

        {pose === "scurry" && (
          <g>
            {/* Speed lines */}
            <g stroke="rgba(255,255,255,0.5)" strokeWidth={5} strokeLinecap="round">
              <path d="M 6 150 L 46 150" />
              <path d="M -2 172 L 42 172" />
              <path d="M 10 194 L 50 194" />
            </g>
            {/* Tail streaming straight back */}
            <path d={`M 46 158 Q 16 ${154 + tailSway * 0.4} -16 162`} fill="none" stroke={BODY} strokeWidth={15} strokeLinecap="round" />
            {/* Stretched body */}
            <path
              d="M 38 176 Q 50 142 110 140 Q 160 140 178 158 L 174 190 Q 100 204 40 192 Z"
              fill={BODY}
              stroke={BODY_DARK}
              strokeWidth={4.5}
            />
            {/* Spinning leg blur */}
            <g opacity={0.9}>
              <ellipse cx={80} cy={202} rx={34} ry={16} fill="none" stroke={BODY} strokeWidth={9} strokeDasharray="20 14" strokeDashoffset={-runCycle * 12} />
              <ellipse cx={140} cy={202} rx={34} ry={16} fill="none" stroke={BODY} strokeWidth={9} strokeDasharray="20 14" strokeDashoffset={runCycle * 12} />
            </g>
            {/* Head craned forward */}
            <g transform="translate(4, 96) rotate(4 185 48) scale(0.95)">
              <Head emotion={face} t={t} spiked={false} />
            </g>
          </g>
        )}

        {/* Fish in mouth — positioned near the head per pose */}
        {holdFish && (
          <g
            transform={
              pose === "scurry"
                ? "translate(212, 150) rotate(18)"
                : pose === "shock"
                  ? "translate(168, 96) rotate(-14)"
                  : pose === "grab"
                    ? "translate(166, 118) rotate(-10)"
                    : pose === "sneak"
                      ? "translate(206, 186) rotate(12)"
                      : "translate(168, 128) rotate(6)"
            }
          >
            <Fish size={78} flip />
          </g>
        )}
      </svg>
    </div>
  );
};
