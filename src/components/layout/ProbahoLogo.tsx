import React from 'react';

interface ProbahoLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  glow?: boolean;
}

/**
 * Official Brand Identity Logo for PROBAHO CRM Solutions.
 * Designed with a geometric flowing ribbon monogram 'P' symbolizing 
 * continuous operational flow ("Probaho"), financial velocity, and modern CRM architecture.
 */
export const ProbahoLogo: React.FC<ProbahoLogoProps> = ({
  size = 36,
  className = '',
  style = {},
  glow = true
}) => {
  const gradientId1 = 'probaho-grad-primary';
  const gradientId2 = 'probaho-grad-flow';
  const gradientId3 = 'probaho-grad-glow';

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        position: 'relative',
        ...style
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          filter: glow ? 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.35))' : 'none',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <defs>
          {/* Base Premium Modern Tech Gradient */}
          <linearGradient id={gradientId1} x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          {/* Flow Stream Accent Gradient */}
          <linearGradient id={gradientId2} x1="20" y1="20" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="45%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          {/* Specular Glow Highlight */}
          <linearGradient id={gradientId3} x1="25" y1="15" x2="75" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Shadow Filter for Inner Ribbon Depth */}
          <filter id="probaho-depth" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1E1B4B" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Squircle Badge Background (when rendered as badge or icon) */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="26"
          fill={`url(#${gradientId1})`}
        />

        {/* Elegant Subtle Glass Inset Highlight Border */}
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          rx="25"
          stroke={`url(#${gradientId3})`}
          strokeWidth="1.5"
          fill="none"
          opacity="0.65"
        />

        {/* Decorative Ambient Flow Arc */}
        <path
          d="M20 78C32 84 68 84 80 72"
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Primary Monogram "P" - Upright Pillar & Dynamic Flow Loop */}
        <g filter="url(#probaho-depth)">
          {/* Vertical Stem of "P" (Flow Pillar) */}
          <path
            d="M30 24C30 21.79 31.79 20 34 20H40C42.21 20 44 21.79 44 24V74C44 76.21 42.21 78 40 78H34C31.79 78 30 76.21 30 74V24Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />

          {/* Outer Flow Loop forming the upper head of the 'P' */}
          <path
            d="M40 20H55C68.8 20 80 30.5 80 43.5C80 56.5 68.8 67 55 67H42"
            stroke={`url(#${gradientId2})`}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* High-Contrast Crisp Foreground Curve */}
          <path
            d="M42 22H55C66.5 22 76 31.5 76 43.5C76 55.5 66.5 65 55 65H42"
            stroke="#FFFFFF"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Inner Energy Spark / Stream Intersection Dot */}
          <circle
            cx="55"
            cy="43.5"
            r="5"
            fill="#38BDF8"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))'
            }}
          />
          <circle
            cx="55"
            cy="43.5"
            r="2"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    </div>
  );
};
