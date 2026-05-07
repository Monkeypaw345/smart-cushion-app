import React from 'react';

export type CapyMood = 'good' | 'neutral' | 'bad';

interface Props {
  mood: CapyMood;
  /** -1 (left) … 0 (centered) … 1 (right) */
  leanX: number;
  /** -1 (back) … 0 (centered) … 1 (forward) */
  leanY: number;
  size?: number;
}

// Reference-style chunky capybara, front-facing, sitting on a cushion.
// Reacts to weight balance: tilts and shifts horizontally with leanX,
// scales body slightly with leanY (forward lean = lean down toward viewer).
export const CapyAvatar: React.FC<Props> = ({ mood, leanX, leanY, size = 280 }) => {
  // Clamp inputs
  const lx = Math.max(-1, Math.min(1, leanX));
  const ly = Math.max(-1, Math.min(1, leanY));

  // Visual mapping
  const tiltDeg = lx * 14;        // body tilt
  const shiftPx = lx * 10;        // body horizontal shift
  const fwdPx   = ly * 8;         // forward lean shift
  const bodyScaleY = 1 - ly * 0.06; // squash slightly when leaning forward

  // Colors — warm tan
  const FUR        = '#d4a373';
  const FUR_HI     = '#e6c39d';
  const FUR_DARK   = '#a07550';
  const SNOUT      = '#c69874';
  const SNOUT_DARK = '#8b6240';
  const NOSE       = '#5a3a22';
  const PAW        = '#6b4528';
  const CUSHION    = '#e8d4b8';
  const CUSHION_DK = '#c8a87a';

  const showHalo  = mood === 'good';
  const happyEyes = mood !== 'bad';
  const sadMouth  = mood === 'bad';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id="bodyGrad" cx="42%" cy="32%" r="70%">
          <stop offset="0%" stopColor={FUR_HI} />
          <stop offset="55%" stopColor={FUR} />
          <stop offset="100%" stopColor={FUR_DARK} />
        </radialGradient>
        <radialGradient id="snoutGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={FUR_HI} />
          <stop offset="100%" stopColor={SNOUT} />
        </radialGradient>
        <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#a8e896" stopOpacity="0.0" />
          <stop offset="60%"  stopColor="#7ee061" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7ee061" stopOpacity="0.0" />
        </radialGradient>
        <filter id="haloGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Floor shadow */}
      <ellipse
        cx={150 + shiftPx * 0.6}
        cy="278"
        rx={88 - Math.abs(lx) * 6}
        ry="8"
        fill="#3d2b1f"
        opacity="0.18"
      />

      {/* Cushion */}
      <g transform={`translate(${shiftPx * 0.4} 0)`}>
        <ellipse cx="150" cy="262" rx="84" ry="14" fill={CUSHION_DK} />
        <rect x="74" y="240" width="152" height="22" rx="11" fill={CUSHION} stroke={CUSHION_DK} strokeWidth="2" />
        {/* fabric tuft */}
        <circle cx="150" cy="251" r="3" fill={CUSHION_DK} />
      </g>

      {/* Halo (good posture only) */}
      {showHalo && (
        <g transform={`translate(${shiftPx * 0.3} 0)`}>
          <ellipse cx="150" cy="42" rx="58" ry="12" fill="url(#haloGrad)" filter="url(#haloGlow)" />
          <ellipse cx="150" cy="42" rx="42" ry="8" fill="none" stroke="#7ee061" strokeWidth="6" opacity="0.95" />
          <ellipse cx="150" cy="42" rx="42" ry="8" fill="none" stroke="#c8f5b8" strokeWidth="2" />
        </g>
      )}

      {/* Body group — tilts and shifts based on lean */}
      <g
        transform={`
          translate(${150 + shiftPx} ${145 + fwdPx})
          rotate(${tiltDeg})
          scale(1 ${bodyScaleY})
          translate(${-150} ${-145})
        `}
        style={{ transition: 'transform 350ms cubic-bezier(.34,1.56,.64,1)' }}
      >
        {/* Front paws on cushion */}
        <ellipse cx="118" cy="246" rx="14" ry="10" fill={PAW} />
        <ellipse cx="182" cy="246" rx="14" ry="10" fill={PAW} />
        <ellipse cx="118" cy="244" rx="11" ry="6" fill={FUR_DARK} />
        <ellipse cx="182" cy="244" rx="11" ry="6" fill={FUR_DARK} />

        {/* Body — chunky teardrop, head fused into top */}
        <path
          d="M150 60
             C 95 60, 60 110, 60 160
             C 60 215, 92 250, 150 250
             C 208 250, 240 215, 240 160
             C 240 110, 205 60, 150 60 Z"
          fill="url(#bodyGrad)"
          stroke={FUR_DARK}
          strokeWidth="2"
        />

        {/* Belly highlight */}
        <ellipse cx="150" cy="190" rx="52" ry="48" fill={FUR_HI} opacity="0.45" />

        {/* Ears */}
        <g>
          <ellipse cx="108" cy="78" rx="11" ry="13" fill={FUR} stroke={FUR_DARK} strokeWidth="2" />
          <ellipse cx="108" cy="80" rx="5" ry="7" fill={SNOUT_DARK} />
          <ellipse cx="192" cy="78" rx="11" ry="13" fill={FUR} stroke={FUR_DARK} strokeWidth="2" />
          <ellipse cx="192" cy="80" rx="5" ry="7" fill={SNOUT_DARK} />
        </g>

        {/* Eyes */}
        {happyEyes ? (
          <>
            <path d="M120 128 q8 -7 16 0" stroke={NOSE} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M164 128 q8 -7 16 0" stroke={NOSE} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* worried open eyes */}
            <ellipse cx="128" cy="128" rx="5" ry="6" fill="#fff" stroke={NOSE} strokeWidth="1.5" />
            <ellipse cx="172" cy="128" rx="5" ry="6" fill="#fff" stroke={NOSE} strokeWidth="1.5" />
            <circle cx={128 + lx * 1.5} cy={129 + Math.abs(ly) * 1.5} r="2.5" fill={NOSE} />
            <circle cx={172 + lx * 1.5} cy={129 + Math.abs(ly) * 1.5} r="2.5" fill={NOSE} />
            {/* worried eyebrow tilt */}
            <path d="M118 116 l16 4" stroke={NOSE} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M182 116 l-16 4" stroke={NOSE} strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* Cheek blush (good mood only) */}
        {mood === 'good' && (
          <>
            <ellipse cx="108" cy="158" rx="9" ry="5" fill="#e89a8a" opacity="0.45" />
            <ellipse cx="192" cy="158" rx="9" ry="5" fill="#e89a8a" opacity="0.45" />
          </>
        )}

        {/* Snout — wide rounded muzzle */}
        <ellipse cx="150" cy="158" rx="44" ry="36" fill="url(#snoutGrad)" />
        <path d="M150 122 Q116 132 110 162 Q140 178 150 178 Q160 178 190 162 Q184 132 150 122 Z"
              fill="none" stroke={SNOUT_DARK} strokeWidth="1.2" opacity="0.4" />

        {/* Nose */}
        <ellipse cx="150" cy="148" rx="10" ry="7" fill={NOSE} />
        <ellipse cx="147" cy="146" rx="2" ry="1.5" fill="#fff" opacity="0.5" />

        {/* Mouth */}
        {sadMouth ? (
          <path d="M138 175 q12 -8 24 0" stroke={NOSE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : mood === 'good' ? (
          <path d="M132 168 q18 16 36 0" stroke={NOSE} strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : (
          <line x1="142" y1="172" x2="158" y2="172" stroke={NOSE} strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Whisker dots */}
        <circle cx="128" cy="160" r="1.2" fill={SNOUT_DARK} />
        <circle cx="124" cy="166" r="1.2" fill={SNOUT_DARK} />
        <circle cx="172" cy="160" r="1.2" fill={SNOUT_DARK} />
        <circle cx="176" cy="166" r="1.2" fill={SNOUT_DARK} />

        {/* Sweat drop when bad */}
        {mood === 'bad' && (
          <path
            d={`M${lx > 0 ? 100 : 200} 110 q-3 6 0 11 q3 -5 0 -11 z`}
            fill="#5cc8ff"
            stroke="#2b8acb"
            strokeWidth="1"
          >
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />
          </path>
        )}
      </g>

      {/* Sparkle accent (good) */}
      {showHalo && (
        <g>
          <path d="M40 240 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3 z" fill="#fff" opacity="0.9" />
          <path d="M260 60 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z" fill="#fff" opacity="0.85" />
        </g>
      )}
    </svg>
  );
};
