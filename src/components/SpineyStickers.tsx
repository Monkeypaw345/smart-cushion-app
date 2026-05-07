import React from 'react';

// Sticker kinds — backwards-compatible IDs, redrawn as capybaras
export type StickerKind =
  | 'crown'    // Crown Capy (good)
  | 'flex'     // Flex Capy (good)
  | 'sparkles' // Hot Spring Capy (good — towel + steam)
  | 'slouch'   // Flat Capy (poor — melted)
  | 'bandage'  // Bandage Capy (poor)
  | 'tired'    // Sleepy Capy (poor)
  | 'running'  // Running Capy (funny)
  | 'sleeping' // Iceberg Capy (funny — floating)
  | 'dumbbell';// Dumbbell Capy (funny)

const FUR = '#a07550';
const FUR_DARK = '#6b4528';
const SNOUT = '#c69874';
const BELLY = '#d4b896';
const EAR_INNER = '#7a4f30';

interface CapyProps {
  cx?: number;
  cy?: number;
  scale?: number;
  expression?: 'smile' | 'flat' | 'sleep' | 'flex' | 'tired' | 'frown' | 'X' | 'wow';
  flat?: boolean;
}

const CapyHead: React.FC<CapyProps> = ({ cx = 60, cy = 50, scale = 1, expression = 'smile' }) => {
  const s = scale;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="28" ry="23" fill={FUR} stroke={FUR_DARK} strokeWidth="1.6" />
      <ellipse cx="-18" cy="-19" rx="5" ry="6" fill={FUR} stroke={FUR_DARK} strokeWidth="1.4" />
      <ellipse cx="-18" cy="-18" rx="2.5" ry="3" fill={EAR_INNER} />
      <ellipse cx="18" cy="-19" rx="5" ry="6" fill={FUR} stroke={FUR_DARK} strokeWidth="1.4" />
      <ellipse cx="18" cy="-18" rx="2.5" ry="3" fill={EAR_INNER} />
      {/* snout */}
      <ellipse cx="0" cy="10" rx="13" ry="9" fill={SNOUT} stroke={FUR_DARK} strokeWidth="1.4" />
      <circle cx="-4" cy="8" r="1" fill={FUR_DARK} />
      <circle cx="4" cy="8" r="1" fill={FUR_DARK} />
      {/* eyes */}
      {expression === 'sleep' || expression === 'tired' ? (
        <>
          <path d="M-12 -5 q4 -3 8 0" stroke={FUR_DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M4 -5 q4 -3 8 0" stroke={FUR_DARK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </>
      ) : expression === 'X' ? (
        <>
          <path d="M-12 -7 l5 5 M-7 -7 l-5 5" stroke={FUR_DARK} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M7 -7 l5 5 M12 -7 l-5 5" stroke={FUR_DARK} strokeWidth="1.6" strokeLinecap="round" />
        </>
      ) : expression === 'wow' ? (
        <>
          <circle cx="-9" cy="-4" r="3" fill="#fff" stroke={FUR_DARK} strokeWidth="1" />
          <circle cx="-9" cy="-4" r="1.4" fill={FUR_DARK} />
          <circle cx="9" cy="-4" r="3" fill="#fff" stroke={FUR_DARK} strokeWidth="1" />
          <circle cx="9" cy="-4" r="1.4" fill={FUR_DARK} />
        </>
      ) : (
        <>
          <circle cx="-9" cy="-4" r="2.4" fill={FUR_DARK} />
          <circle cx="9" cy="-4" r="2.4" fill={FUR_DARK} />
        </>
      )}
      {/* cheeks */}
      <ellipse cx="-15" cy="5" rx="3" ry="2" fill="#e89a8a" opacity="0.6" />
      <ellipse cx="15" cy="5" rx="3" ry="2" fill="#e89a8a" opacity="0.6" />
      {/* mouth */}
      {expression === 'smile' || expression === 'flex' ? (
        <path d="M-5 16 q5 4 10 0" stroke={FUR_DARK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      ) : expression === 'frown' || expression === 'X' ? (
        <path d="M-5 18 q5 -4 10 0" stroke={FUR_DARK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      ) : (
        <line x1="-3" y1="17" x2="3" y2="17" stroke={FUR_DARK} strokeWidth="1.4" strokeLinecap="round" />
      )}
    </g>
  );
};

const SittingBody: React.FC<{ cx?: number; cy?: number }> = ({ cx = 60, cy = 90 }) => (
  <g>
    <ellipse cx={cx} cy={cy} rx="34" ry="26" fill={FUR} stroke={FUR_DARK} strokeWidth="1.8" />
    <ellipse cx={cx} cy={cy + 5} rx="22" ry="14" fill={BELLY} opacity="0.65" />
    {/* feet */}
    <ellipse cx={cx - 16} cy={cy + 22} rx="6" ry="3.5" fill={FUR_DARK} />
    <ellipse cx={cx + 16} cy={cy + 22} rx="6" ry="3.5" fill={FUR_DARK} />
  </g>
);

interface Props { kind: StickerKind; size?: number; }

export const SpineySticker: React.FC<Props> = ({ kind, size = 96 }) => {
  const w = size, h = size;
  const v = '0 0 120 120';

  switch (kind) {
    case 'crown': {
      // Crown Capy
      return (
        <svg width={w} height={h} viewBox={v}>
          <SittingBody />
          <CapyHead expression="smile" />
          <g>
            <path d="M40 20 L46 8 L54 16 L60 4 L66 16 L74 8 L80 20 L80 26 L40 26 Z"
                  fill="#D4922A" stroke={FUR_DARK} strokeWidth="1.4" />
            <circle cx="46" cy="11" r="1.8" fill="#c0614a" />
            <circle cx="60" cy="7" r="2.2" fill="#7a9e5f" />
            <circle cx="74" cy="11" r="1.8" fill="#c0614a" />
          </g>
        </svg>
      );
    }
    case 'flex': {
      return (
        <svg width={w} height={h} viewBox={v}>
          <SittingBody />
          {/* flexed arms */}
          <ellipse cx="22" cy="78" rx="9" ry="11" fill={FUR} stroke={FUR_DARK} strokeWidth="1.6" transform="rotate(20 22 78)" />
          <ellipse cx="98" cy="78" rx="9" ry="11" fill={FUR} stroke={FUR_DARK} strokeWidth="1.6" transform="rotate(-20 98 78)" />
          <CapyHead expression="flex" />
          <text x="60" y="115" textAnchor="middle" fontSize="11" fontWeight="900" fill="#8B5E3C">STRONG</text>
        </svg>
      );
    }
    case 'sparkles': {
      // Hot Spring Capy — water, towel on head, steam
      return (
        <svg width={w} height={h} viewBox={v}>
          {/* steam */}
          {[30, 60, 90].map((x, i) => (
            <path key={i} d={`M${x} 30 q-4 -8 0 -16 q4 -6 0 -14`} stroke="#c8a87a" strokeWidth="1.5" fill="none" opacity="0.6">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
            </path>
          ))}
          {/* water tub */}
          <ellipse cx="60" cy="92" rx="48" ry="14" fill="#a8d4e0" stroke="#4a8aa0" strokeWidth="1.5" />
          <ellipse cx="60" cy="88" rx="44" ry="8" fill="#cce5ed" />
          {/* head poking out */}
          <CapyHead cy={68} expression="smile" scale={0.9} />
          {/* towel on head */}
          <rect x="40" y="38" width="40" height="10" fill="#fdf8f3" stroke="#d4b896" strokeWidth="1" rx="2" />
          <rect x="38" y="46" width="44" height="4" fill="#e8a838" rx="1" />
          {/* bubbles */}
          <circle cx="30" cy="92" r="2" fill="#fff" opacity="0.8" />
          <circle cx="92" cy="94" r="2.5" fill="#fff" opacity="0.8" />
          <circle cx="78" cy="98" r="1.5" fill="#fff" opacity="0.8" />
        </svg>
      );
    }
    case 'slouch': {
      // Flat Capy — completely melted/lying flat
      return (
        <svg width={w} height={h} viewBox={v}>
          <ellipse cx="60" cy="80" rx="50" ry="14" fill={FUR} stroke={FUR_DARK} strokeWidth="1.8" />
          <ellipse cx="60" cy="76" rx="38" ry="6" fill={BELLY} opacity="0.7" />
          {/* paws sticking out */}
          <ellipse cx="20" cy="78" rx="6" ry="4" fill={FUR} stroke={FUR_DARK} strokeWidth="1.4" />
          <ellipse cx="100" cy="78" rx="6" ry="4" fill={FUR} stroke={FUR_DARK} strokeWidth="1.4" />
          {/* head squished */}
          <ellipse cx="35" cy="74" rx="14" ry="11" fill={FUR} stroke={FUR_DARK} strokeWidth="1.6" />
          <ellipse cx="28" cy="78" rx="6" ry="4" fill={SNOUT} stroke={FUR_DARK} strokeWidth="1" />
          <path d="M30 72 q3 -2 6 0" stroke={FUR_DARK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M40 72 q3 -2 6 0" stroke={FUR_DARK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <text x="60" y="105" textAnchor="middle" fontSize="10" fontWeight="900" fill="#8B5E3C">i melted</text>
        </svg>
      );
    }
    case 'bandage': {
      return (
        <svg width={w} height={h} viewBox={v}>
          <SittingBody />
          {/* back bandage */}
          <rect x="44" y="76" width="32" height="8" fill="#fdf8f3" stroke="#c69874" strokeWidth="1" rx="2" transform="rotate(-10 60 80)" />
          <line x1="50" y1="78" x2="70" y2="82" stroke="#c69874" strokeWidth="0.6" transform="rotate(-10 60 80)" />
          <CapyHead expression="frown" />
        </svg>
      );
    }
    case 'tired': {
      // Sleepy Capy with pillow
      return (
        <svg width={w} height={h} viewBox={v}>
          {/* pillow */}
          <rect x="14" y="86" width="38" height="20" rx="6" fill="#faebd7" stroke={FUR_DARK} strokeWidth="1.4" />
          <SittingBody cx={70} cy={92} />
          <CapyHead cx={70} cy={58} expression="tired" />
          <text x="40" y="40" fontSize="14" fontWeight="900" fill="#8B5E3C">z</text>
          <text x="50" y="32" fontSize="10" fontWeight="900" fill="#8B5E3C">z</text>
        </svg>
      );
    }
    case 'running': {
      return (
        <svg width={w} height={h} viewBox={v}>
          {/* chair behind */}
          <g opacity="0.7">
            <rect x="6" y="70" width="14" height="22" fill="#c8a87a" />
            <rect x="6" y="58" width="14" height="14" fill="#c8a87a" />
          </g>
          <g transform="translate(15 0)">
            <SittingBody cx={70} cy={92} />
            <CapyHead cx={70} cy={56} expression="wow" />
          </g>
          {/* speed lines */}
          <line x1="22" y1="70" x2="40" y2="70" stroke={FUR_DARK} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="20" y1="80" x2="42" y2="80" stroke={FUR_DARK} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="24" y1="92" x2="40" y2="92" stroke={FUR_DARK} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    }
    case 'sleeping': {
      // Iceberg Capy — floating peacefully
      return (
        <svg width={w} height={h} viewBox={v}>
          {/* water */}
          <rect x="0" y="86" width="120" height="34" fill="#a8d4e0" />
          <path d="M0 92 q15 -4 30 0 t30 0 t30 0 t30 0" stroke="#4a8aa0" strokeWidth="1" fill="none" opacity="0.6" />
          <path d="M0 102 q15 -4 30 0 t30 0 t30 0 t30 0" stroke="#4a8aa0" strokeWidth="1" fill="none" opacity="0.6" />
          {/* iceberg */}
          <path d="M30 86 L40 64 L60 60 L80 66 L92 86 Z" fill="#fdf8f3" stroke="#7aa0b0" strokeWidth="1.4" />
          <path d="M40 86 L48 72 L60 70 L74 76 L84 86 Z" fill="#cce5ed" />
          {/* capy on top */}
          <SittingBody cx={60} cy={62} />
          <CapyHead cx={60} cy={36} expression="smile" scale={0.85} />
        </svg>
      );
    }
    case 'dumbbell': {
      return (
        <svg width={w} height={h} viewBox={v}>
          <SittingBody />
          <CapyHead expression="flex" />
          {/* heavy dumbbell — capy struggling */}
          <g>
            <rect x="14" y="70" width="3" height="14" fill="#3d2b1f" />
            <rect x="8" y="64" width="14" height="6" fill="#3d2b1f" rx="1" />
            <rect x="8" y="84" width="14" height="6" fill="#3d2b1f" rx="1" />
            <line x1="22" y1="77" x2="98" y2="77" stroke="#3d2b1f" strokeWidth="2.4" />
            <rect x="98" y="64" width="14" height="6" fill="#3d2b1f" rx="1" />
            <rect x="98" y="84" width="14" height="6" fill="#3d2b1f" rx="1" />
            <rect x="103" y="70" width="3" height="14" fill="#3d2b1f" />
          </g>
          {/* sweat */}
          <path d="M85 22 q-2 4 0 6 q2 -2 0 -6 z" fill="#5cc8ff" stroke="#2b8acb" strokeWidth="0.8" />
        </svg>
      );
    }
  }
};

export const CapySticker = SpineySticker;
