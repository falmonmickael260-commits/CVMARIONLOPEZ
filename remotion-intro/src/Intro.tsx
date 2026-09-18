import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const CLAY = "#B5651D";
const TERRACOTTA = "#C67B5C";
const SAND = "#E9DCC9";
const CREAM = "#FBF6ED";
const INK = "#241C15";
const PINE = "#2F4234";
const GOLD = "#C79A56";

const GrainOverlay: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill
    style={{
      opacity,
      mixBlendMode: "overlay",
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    }}
  />
);

const Letters: React.FC<{
  text: string;
  startFrame: number;
  style?: React.CSSProperties;
}> = ({ text, startFrame, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span style={{ display: "inline-block", ...style }}>
      {text.split("").map((ch, i) => {
        const local = frame - startFrame - i * 2;
        const p = spring({
          frame: local,
          fps,
          config: { damping: 200, stiffness: 130, mass: 0.9 },
          durationInFrames: 22,
        });
        const y = interpolate(p, [0, 1], [46, 0]);
        const o = interpolate(local, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px)`,
              opacity: o,
              whiteSpace: "pre",
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const bgIn = interpolate(frame, [0, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const holdEnd = durationInFrames - 26;
  const fadeOut = interpolate(frame, [holdEnd, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const globalOpacity = Math.min(bgIn, fadeOut);

  const drift = frame / durationInFrames;
  const gradAngle = 135 + Math.sin(drift * Math.PI * 2) * 6;

  const pathLen = 1400;
  const lineDraw = interpolate(frame, [18, 78], [pathLen, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const dotP = interpolate(frame, [18, 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const eyebrowO = interpolate(frame, [4, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtitleP = spring({
    frame: frame - 68,
    fps,
    config: { damping: 200, stiffness: 120 },
  });
  const subtitleY = interpolate(subtitleP, [0, 1], [24, 0]);
  const subtitleO = interpolate(frame, [68, 84], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ruleP = interpolate(frame, [64, 92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // simple path across the frame, roughly diagonal with a gentle S curve
  const pathD = `M ${width * 0.08} ${height * 0.82} C ${width * 0.32} ${height * 0.62}, ${width * 0.38} ${height * 0.9}, ${width * 0.58} ${height * 0.5} S ${width * 0.86} ${height * 0.2}, ${width * 0.94} ${height * 0.16}`;

  return (
    <AbsoluteFill style={{ backgroundColor: CREAM }}>
      <AbsoluteFill
        style={{
          opacity: globalOpacity,
          background: `linear-gradient(${gradAngle}deg, ${INK} 0%, ${PINE} 38%, ${CLAY} 74%, ${TERRACOTTA} 100%)`,
        }}
      />

      <AbsoluteFill style={{ opacity: globalOpacity * 0.5 }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <path
            d={pathD}
            fill="none"
            stroke={GOLD}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeDasharray={pathLen}
            strokeDashoffset={lineDraw}
            opacity={0.85}
          />
        </svg>
      </AbsoluteFill>

      <GrainOverlay opacity={globalOpacity * 0.05} />

      <AbsoluteFill
        style={{
          opacity: globalOpacity,
          background:
            "radial-gradient(120% 90% at 18% 112%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.42) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          opacity: globalOpacity,
          justifyContent: "center",
          alignItems: "flex-start",
          paddingLeft: width * 0.09,
          paddingRight: width * 0.09,
        }}
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontWeight: 600,
            color: SAND,
            opacity: eyebrowO * 0.85,
            marginBottom: 22,
          }}
        >
          CV digital — Édition 2026
        </div>

        <div
          style={{
            fontFamily: "Instrument Serif, serif",
            fontWeight: 400,
            fontSize: 118,
            lineHeight: 0.98,
            color: CREAM,
            overflow: "hidden",
          }}
        >
          <Letters text="Marion" startFrame={20} />
        </div>
        <div
          style={{
            fontFamily: "Instrument Serif, serif",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 118,
            lineHeight: 1.02,
            color: GOLD,
            overflow: "hidden",
            marginTop: 2,
          }}
        >
          <Letters text="Lopez" startFrame={32} />
        </div>

        <div
          style={{
            marginTop: 30,
            width: 84 * ruleP,
            height: 2,
            background: GOLD,
            opacity: ruleP,
          }}
        />

        <div
          style={{
            marginTop: 26,
            fontFamily: "Instrument Serif, serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 34,
            color: "rgba(251,246,237,0.92)",
            opacity: subtitleO,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          Livreuse de repas à domicile
        </div>
      </AbsoluteFill>

      {frame >= 18 && frame <= 82 && (
        <AbsoluteFill style={{ opacity: globalOpacity }}>
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ position: "absolute", inset: 0 }}
          >
            <path id="dotpath" d={pathD} fill="none" stroke="none" />
            <DotOnPath pathD={pathD} progress={dotP} color={GOLD} />
          </svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// Approximates a point along the cubic path using the DOM path API at render time via a hidden svg.
const DotOnPath: React.FC<{ pathD: string; progress: number; color: string }> = ({
  pathD,
  progress,
  color,
}) => {
  const ref = React.useRef<SVGPathElement>(null);
  const [pt, setPt] = React.useState<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const length = ref.current.getTotalLength();
    const p = ref.current.getPointAtLength(length * progress);
    setPt({ x: p.x, y: p.y });
  }, [progress]);

  return (
    <>
      <path ref={ref} d={pathD} fill="none" stroke="none" />
      {pt && (
        <g>
          <circle cx={pt.x} cy={pt.y} r={10} fill={color} opacity={0.18} />
          <circle cx={pt.x} cy={pt.y} r={4.5} fill={color} />
        </g>
      )}
    </>
  );
};
