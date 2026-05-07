import React from 'react';

type Mood = 'happy' | 'neutral' | 'sad';

interface CapybaraProps {
  mood: Mood;
  size?: number;
  className?: string;
}

const FUR = '#a07550';
const FUR_DARK = '#6b4528';
const SNOUT = '#c69874';
const BELLY = '#d4b896';
const EAR_INNER = '#7a4f30';

// A cute capybara — stout body, blunt snout, tiny ears, tiny feet.
export const Capybara: React.FC<CapybaraProps> = ({ mood, size = 180, className }) => {
  const happy = mood === 'happy';
  const sad = mood === 'sad';
  const neutral = mood === 'neutral';

  if (sad) {
    // Lying flat on its back — body horizontal, paws up
    return (
      <svg width={size} height={size} viewBox="0 0 200 160" className={className} xmlns="http://www.w3.org/2000/svg">
        {/* zzz */}
        <g fill="#8a6a55" fontFamily="ui-rounded, system-ui" fontWeight="900">
          <text x="50" y="28" fontSize="14">z</text>
          <text x="42" y="20" fontSize="10">z</text>
          <text x="60" y="18" fontSize="8">z</text>
        </g>
        {/* sweat drop */}
        <path d="M155 60 q-3 6 0 10 q3 -4 0 -10 z" fill="#5cc8ff" stroke="#2b8acb" strokeWidth="1">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />
        </path>
        {/* body lying flat */}
        <ellipse cx="100" cy="105" rx="70" ry="22" fill={FUR} stroke={FUR_DARK} strokeWidth="2" />
        <ellipse cx="100" cy="98" rx="60" ry="12" fill={BELLY} opacity="0.7" />
        {/* paws sticking up */}
        <ellipse cx="78" cy="80" rx="6" ry="10" fill={FUR} stroke={FUR_DARK} strokeWidth="1.8" />
        <ellipse cx="118" cy="80" rx="6" ry="10" fill={FUR} stroke={FUR_DARK} strokeWidth="1.8" />
        <ellipse cx="62" cy="84" rx="5" ry="8" fill={FUR} stroke={FUR_DARK} strokeWidth="1.6" />
        <ellipse cx="138" cy="84" rx="5" ry="8" fill={FUR} stroke={FUR_DARK} strokeWidth="1.6" />
        {/* head on left */}
        <ellipse cx="38" cy="100" rx="22" ry="20" fill={FUR} stroke={FUR_DARK} strokeWidth="2" />
        {/* ear */}
        <ellipse cx="32" cy="84" rx="5" ry="6" fill={FUR} stroke={FUR_DARK} strokeWidth="1.5" />
        <ellipse cx="32" cy="85" rx="2.5" ry="3.5" fill={EAR_INNER} />
        {/* snout */}
        <ellipse cx="22" cy="105" rx="10" ry="8" fill={SNOUT} stroke={FUR_DARK} strokeWidth="1.5" />
        <circle cx="18" cy="103" r="1.4" fill={FUR_DARK} />
        <circle cx="20" cy="107" r="1.4" fill={FUR_DARK} />
        {/* defeated eyes (X marks) */}
        <path d="M32 96 l4 4 M36 96 l-4 4" stroke={FUR_DARK} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M44 96 l4 4 M48 96 l-4 4" stroke={FUR_DARK} strokeWidth="1.6" strokeLinecap="round" />
        {/* mouth */}
        <path d="M22 112 q3 -2 6 0" stroke={FUR_DARK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* shadow */}
        <ellipse cx="100" cy="135" rx="80" ry="5" fill="#3d2b1f" opacity="0.12" />
      </svg>
    );
  }

  // happy or neutral — sitting upright (slouched if neutral)
  const slouch = neutral ? 8 : 0;
  const eyeY = neutral ? 64 : 60;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      {happy && (
        <g>
          {[
            { x: 30, y: 40, r: 3 },
            { x: 170, y: 50, r: 2.5 },
            { x: 25, y: 100, r: 2 },
            { x: 175, y: 110, r: 3 },
            { x: 40, y: 160, r: 2 },
          ].map((s, i) => (
            <path
              key={i}
              d={`M${s.x} ${s.y} l${s.r} ${s.r * 1.5} l${s.r * 1.5} ${s.r} l${-s.r * 1.5} ${s.r} l${-s.r} ${s.r * 1.5} l${-s.r} ${-s.r * 1.5} l${-s.r * 1.5} ${-s.r} l${s.r * 1.5} ${-s.r} z`}
              fill="#D4922A"
            >
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </path>
          ))}
        </g>
      )}

      {/* body — round/stout */}
      <ellipse cx={100 + slouch / 2} cy="140" rx="56" ry="42" fill={FUR} stroke={FUR_DARK} strokeWidth="2.2" />
      <ellipse cx={100 + slouch / 2} cy="148" rx="40" ry="26" fill={BELLY} opacity="0.65" />

      {/* feet */}
      <ellipse cx="74" cy="178" rx="10" ry="6" fill={FUR_DARK} />
      <ellipse cx="126" cy="178" rx="10" ry="6" fill={FUR_DARK} />

      {/* tiny arms */}
      <ellipse cx="55" cy="140" rx="9" ry="14" fill={FUR} stroke={FUR_DARK} strokeWidth="1.8" transform={`rotate(${neutral ? -5 : 5} 55 140)`} />
      <ellipse cx="145" cy="140" rx="9" ry="14" fill={FUR} stroke={FUR_DARK} strokeWidth="1.8" transform={`rotate(${neutral ? 5 : -5} 145 140)`} />

      {/* head — large blunt rectangle-ish */}
      <g transform={`translate(${slouch} ${neutral ? 8 : 0})`}>
        <ellipse cx="100" cy="75" rx="48" ry="40" fill={FUR} stroke={FUR_DARK} strokeWidth="2.2" />
        {/* ears */}
        <ellipse cx="68" cy="44" rx="8" ry="9" fill={FUR} stroke={FUR_DARK} strokeWidth="1.8" />
        <ellipse cx="68" cy="45" rx="4" ry="5" fill={EAR_INNER} />
        <ellipse cx="132" cy="44" rx="8" ry="9" fill={FUR} stroke={FUR_DARK} strokeWidth="1.8" />
        <ellipse cx="132" cy="45" rx="4" ry="5" fill={EAR_INNER} />
        {/* eyes */}
        {neutral ? (
          <>
            <path d="M82 64 q4 -2 8 0" stroke={FUR_DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M110 64 q4 -2 8 0" stroke={FUR_DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="86" cy={eyeY} r="3" fill={FUR_DARK} />
            <circle cx="114" cy={eyeY} r="3" fill={FUR_DARK} />
            <circle cx="87" cy={eyeY - 1} r="0.9" fill="#fff" />
            <circle cx="115" cy={eyeY - 1} r="0.9" fill="#fff" />
          </>
        )}
        {/* cheek blush */}
        <ellipse cx="74" cy="80" rx="5" ry="3" fill="#e89a8a" opacity="0.5" />
        <ellipse cx="126" cy="80" rx="5" ry="3" fill="#e89a8a" opacity="0.5" />
        {/* snout — large blunt */}
        <ellipse cx="100" cy="92" rx="20" ry="15" fill={SNOUT} stroke={FUR_DARK} strokeWidth="1.6" />
        {/* nostrils */}
        <circle cx="94" cy="89" r="1.4" fill={FUR_DARK} />
        <circle cx="106" cy="89" r="1.4" fill={FUR_DARK} />
        {/* mouth */}
        {happy ? (
          <path d="M92 99 q8 6 16 0" stroke={FUR_DARK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        ) : (
          <line x1="95" y1="100" x2="105" y2="100" stroke={FUR_DARK} strokeWidth="1.6" strokeLinecap="round" />
        )}

        {/* crown when happy */}
        {happy && (
          <g>
            <path d="M78 30 L84 18 L94 26 L100 14 L106 26 L116 18 L122 30 L122 36 L78 36 Z"
                  fill="#D4922A" stroke="#8B5E3C" strokeWidth="1.5" />
            <circle cx="84" cy="20" r="2" fill="#c0614a" />
            <circle cx="100" cy="17" r="2.4" fill="#7a9e5f" />
            <circle cx="116" cy="20" r="2" fill="#c0614a" />
          </g>
        )}
      </g>

      {/* base shadow */}
      <ellipse cx="100" cy="186" rx="62" ry="5" fill="#3d2b1f" opacity="0.12" />
    </svg>
  );
};

// Backwards-compatible exports — Spiney was the previous name
export const Spiney = Capybara;

export const moodFromScore = (score: number): Mood => {
  if (score > 80) return 'happy';
  if (score >= 50) return 'neutral';
  return 'sad';
};
