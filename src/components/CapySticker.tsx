import React from 'react';
import { SpineySticker, StickerKind } from './SpineyStickers';

export type StickerType = StickerKind;

interface CapyStickerProps {
  type: StickerType;
  size?: number;
  className?: string;
}

export const CapySticker: React.FC<CapyStickerProps> = ({ type, size = 150, className }) => {
  return (
    <div className={className}>
      <SpineySticker kind={type} size={size} />
    </div>
  );
};
