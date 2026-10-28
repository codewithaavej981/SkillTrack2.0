import { useId } from "react";

export default function BrandLogo({ size = 32, className = "brand-logo", style = {} }) {
  const s = Number(size) || 32;
  const rawId = useId();
  const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const bgId = `bl-bg-${cleanId}`;
  const arcId = `bl-arc-${cleanId}`;
  const pageId = `bl-page-${cleanId}`;
  const glowId = `bl-glow-${cleanId}`;

  return (
    <svg
      className={className}
      width={s}
      height={s}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        width: `${s}px`,
        height: `${s}px`,
        minWidth: `${s}px`,
        display: "inline-block",
        verticalAlign: "middle",
        borderRadius: "9px",
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id={bgId} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#140f2d" />
          <stop offset="50%" stopColor="#241952" />
          <stop offset="100%" stopColor="#3d2780" />
        </linearGradient>

        {/* Core Ribbon / Momentum Arc */}
        <linearGradient id={arcId} x1="14" y1="48" x2="50" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5046e5" />
          <stop offset="45%" stopColor="#7c3aed" />
          <stop offset="85%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Foundation / Learning Book Wing */}
        <linearGradient id={pageId} x1="14" y1="36" x2="36" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
        </linearGradient>

        {/* Star Glow Filter */}
        <filter id={glowId} x="32" y="6" width="28" height="28" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Squircle Backdrop with solid fallback */}
      <rect x="2" y="2" width="60" height="60" rx="16" ry="16" fill="#1e1548" />
      <rect x="2" y="2" width="60" height="60" rx="16" ry="16" fill={`url(#${bgId})`} />
      <rect
        x="2.5"
        y="2.5"
        width="59"
        height="59"
        rx="15.5"
        ry="15.5"
        stroke="rgba(255, 255, 255, 0.16)"
        strokeWidth="1"
      />

      {/* Lower Learning Foundation / Open Pages Arc */}
      <path
        d="M15 44 C 22 41, 28 42, 32 46 C 36 42, 42 41, 49 44 C 47 47, 40 49, 32 48.5 C 24 49, 17 47, 15 44 Z"
        fill={`url(#${pageId})`}
      />

      {/* Ascending Skill 'S' Momentum Ribbon */}
      <path
        d="M18 36 C 17 28, 26 23, 34 25 C 41 27, 45 32, 43 38 C 41 43, 32 42, 27 41 C 24 40.5, 22 41.5, 20 43 C 18 39, 21 35.5, 26 35 C 33 34, 37 36, 38 33 C 39 30.5, 36 29, 31 28.5 C 24 28, 20 31, 18 36 Z"
        fill={`url(#${arcId})`}
      />

      {/* Upward Growth Arrow Path connecting into AI Node */}
      <path
        d="M26 44 L36 26 L42 29"
        stroke={`url(#${arcId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Apex AI Quad Star (Intelligence & Momentum) */}
      <g filter={`url(#${glowId})`}>
        <path
          d="M46 11 C46 16.5, 48.5 19, 54 19 C48.5 19, 46 21.5, 46 27 C46 21.5, 43.5 19, 38 19 C43.5 19, 46 16.5, 46 11 Z"
          fill="#ffffff"
        />
        <circle cx="46" cy="19" r="1.5" fill="#38bdf8" />
      </g>

      {/* Micro Satellite Spark */}
      <path
        d="M19 19 C19 21.2, 20 22, 22.5 22 C20 22, 19 22.8, 19 25 C19 22.8, 18 22, 15.5 22 C18 22, 19 21.2, 19 19 Z"
        fill="#a78bfa"
        opacity="0.9"
      />
    </svg>
  );
}
