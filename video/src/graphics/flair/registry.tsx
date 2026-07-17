import React from "react";
import { Goldilocks } from "./Goldilocks";

export const FLAIR: Record<string, React.FC> = {
  Goldilocks,
};

export function renderFlair(name: string): React.ReactNode {
  const Comp = FLAIR[name];
  if (!Comp) {
    return (
      <div
        style={{
          color: "#FFD400",
          fontSize: 36,
          fontWeight: 800,
          textAlign: "center",
          marginTop: 120,
          fontFamily: "Montserrat, Arial Black, sans-serif",
        }}
      >
        Unknown flair: {name}
      </div>
    );
  }
  return <Comp />;
}
