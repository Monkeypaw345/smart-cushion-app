import React from 'react';

export type StickerType = 
  | 'Basic Happy' | 'Basic Neutral' | 'Basic Sad' | 'Sleepy' | 'Hungry' | 'Cool' | 'Angry' | 'Blushing'
  | 'Hot Spring' | 'Chef' | 'Gamer' | 'Wizard' | 'Detective'
  | 'Flex' | 'Astronaut' | 'King';

interface CapyStickerProps {
  type: StickerType;
  size?: number;
  className?: string;
  silhouette?: boolean; // If true, render as a black shadow
}

const COLORS = {
  fur: '#a07550',
  furDark: '#6b4528',
  snout: '#c69874',
  belly: '#d4b896',
  ear: '#7a4f30',
  white: '#ffffff',
  black: '#000000',
  shadow: '#3d2b1f'
};

export const CapySticker: React.FC<CapyStickerProps> = ({ type, size = 150, className, silhouette = false }) => {
  const fill = (c: string) => (silhouette ? COLORS.black : c);
  const stroke = (c: string) => (silhouette ? COLORS.black : c);
  const opacity = (o: number) => (silhouette ? 1 : o);

  // Common Head & Body
  const renderBase = (headX = 100, headY = 75, bodyX = 100, bodyY = 140, slouch = 0) => (
    <g>
      {/* Body */}
      <ellipse cx={bodyX + slouch/2} cy={bodyY} rx="56" ry="42" fill={fill(COLORS.fur)} stroke={stroke(COLORS.furDark)} strokeWidth="2.2" />
      <ellipse cx={bodyX + slouch/2} cy={bodyY + 8} rx="40" ry="26" fill={fill(COLORS.belly)} opacity={opacity(0.6)} />
      
      {/* Feet */}
      <ellipse cx={bodyX - 26 + slouch/2} cy={bodyY + 38} rx="10" ry="6" fill={fill(COLORS.furDark)} />
      <ellipse cx={bodyX + 26 + slouch/2} cy={bodyY + 38} rx="10" ry="6" fill={fill(COLORS.furDark)} />

      {/* Head */}
      <g transform={`translate(${slouch} 0)`}>
        <ellipse cx={headX} cy={headY} rx="48" ry="40" fill={fill(COLORS.fur)} stroke={stroke(COLORS.furDark)} strokeWidth="2.2" />
        <ellipse cx={headX - 32} cy={headY - 31} rx="8" ry="9" fill={fill(COLORS.fur)} stroke={stroke(COLORS.furDark)} strokeWidth="1.8" />
        <ellipse cx={headX - 32} cy={headY - 30} rx="4" ry="5" fill={fill(COLORS.ear)} />
        <ellipse cx={headX + 32} cy={headY - 31} rx="8" ry="9" fill={fill(COLORS.fur)} stroke={stroke(COLORS.furDark)} strokeWidth="1.8" />
        <ellipse cx={headX + 32} cy={headY - 30} rx="4" ry="5" fill={fill(COLORS.ear)} />
        <ellipse cx={headX} cy={headY + 17} rx="20" ry="15" fill={fill(COLORS.snout)} stroke={stroke(COLORS.furDark)} strokeWidth="1.6" />
        <circle cx={headX - 6} cy={headY + 14} r="1.4" fill={fill(COLORS.furDark)} />
        <circle cx={headX + 6} cy={headY + 14} r="1.4" fill={fill(COLORS.furDark)} />
      </g>
    </g>
  );

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      {type === 'Basic Sad' ? (
        <g>
           <ellipse cx="100" cy="120" rx="70" ry="22" fill={fill(COLORS.fur)} stroke={stroke(COLORS.furDark)} strokeWidth="2" />
           <ellipse cx="38" cy="115" rx="22" ry="20" fill={fill(COLORS.fur)} stroke={stroke(COLORS.furDark)} strokeWidth="2" />
           <path d="M32 110 l4 4 M36 110 l-4 4" stroke={stroke(COLORS.furDark)} strokeWidth="2" />
           <path d="M44 110 l4 4 M48 110 l-4 4" stroke={stroke(COLORS.furDark)} strokeWidth="2" />
        </g>
      ) : renderBase(100, 75, 100, 140, type === 'Basic Neutral' ? 8 : 0)}

      {/* Eyes for most types */}
      {type !== 'Basic Sad' && type !== 'Basic Neutral' && type !== 'Cool' && (
        <g>
          <circle cx="86" cy="60" r="3" fill={fill(COLORS.black)} />
          <circle cx="114" cy="60" r="3" fill={fill(COLORS.black)} />
          {!silhouette && <circle cx="87" cy="59" r="1" fill="white" />}
          {!silhouette && <circle cx="115" cy="59" r="1" fill="white" />}
        </g>
      )}

      {/* Unique Props */}
      {!silhouette && (
        <>
          {type === 'Basic Happy' && (
             <path d="M92 99 q8 6 16 0" stroke={COLORS.furDark} strokeWidth="2" fill="none" />
          )}
          {type === 'Sleepy' && (
            <text x="140" y="50" fill={COLORS.furDark} fontWeight="900" fontSize="16">Zzz</text>
          )}
          {type === 'Hungry' && (
            <path d="M100 100 l15 5 l-5 5 z" fill="#7a9e5f" stroke="#4a633a" />
          )}
          {type === 'Cool' && (
            <path d="M75 55 h50 v10 h-50 z" fill="black" />
          )}
          {type === 'Angry' && (
            <path d="M60 40 q5 -10 10 0" fill="gray" opacity="0.6" />
          )}
          {type === 'Blushing' && (
            <g>
              <ellipse cx="75" cy="80" rx="5" ry="3" fill="#ff9999" opacity="0.6" />
              <ellipse cx="125" cy="80" rx="5" ry="3" fill="#ff9999" opacity="0.6" />
            </g>
          )}
          {type === 'Hot Spring' && (
            <rect x="80" y="30" width="40" height="15" rx="5" fill="white" stroke="#ccc" />
          )}
          {type === 'Chef' && (
            <path d="M80 40 h40 v-20 q0 -10 -20 -10 q-20 0 -20 10 z" fill="white" stroke="#333" />
          )}
          {type === 'Gamer' && (
            <path d="M70 60 q0 -40 60 0" stroke="black" strokeWidth="6" fill="none" />
          )}
          {type === 'Flex' && (
            <g>
               <path d="M40 120 q-20 -20 0 -40" stroke={COLORS.furDark} strokeWidth="8" fill="none" />
               <path d="M160 120 q20 -20 0 -40" stroke={COLORS.furDark} strokeWidth="8" fill="none" />
            </g>
          )}
          {type === 'King' && (
            <path d="M78 30 L84 18 L100 14 L116 18 L122 30 V36 H78 Z" fill="#FFD700" stroke="#B8860B" />
          )}
        </>
      )}

      {/* Shadow */}
      <ellipse cx="100" cy="186" rx="60" ry="5" fill={COLORS.shadow} opacity={opacity(0.1)} />
    </svg>
  );
};
