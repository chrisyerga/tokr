import React from "react";

/** Giant cartoon cash stack for Uncle Clam to gobble. */
export const MoneyPile: React.FC<{
  size?: number;
  /** 1 = full pile, 0 = eaten */
  amount?: number;
}> = ({ size = 160, amount = 1 }) => {
  if (amount <= 0.02) return null;
  const h = size * (0.35 + amount * 0.65);
  const bills = Math.max(2, Math.round(amount * 7));

  return (
    <div
      style={{
        width: size,
        height: h,
        opacity: Math.min(1, amount * 1.2),
        transform: `scale(${0.7 + amount * 0.3})`,
        transformOrigin: "50% 100%",
        filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.4))",
      }}
    >
      <svg viewBox="0 0 120 100" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
        {Array.from({ length: bills }).map((_, i) => {
          const y = 85 - i * 9;
          const wobble = (i % 2 === 0 ? -3 : 3) + (i % 3) * 2;
          return (
            <g key={i} transform={`translate(${wobble}, 0)`}>
              <rect
                x={10}
                y={y}
                width={100}
                height={14}
                rx={2}
                fill="#3d8f4a"
                stroke="#1e5a28"
                strokeWidth={2}
              />
              <rect
                x={16}
                y={y + 3}
                width={88}
                height={8}
                rx={1}
                fill="none"
                stroke="#8fd49a"
                strokeWidth={1}
              />
              <text
                x={60}
                y={y + 11}
                textAnchor="middle"
                fontSize={9}
                fontWeight={800}
                fill="#c8f0d0"
                fontFamily="Montserrat, Arial Black, sans-serif"
              >
                $
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
