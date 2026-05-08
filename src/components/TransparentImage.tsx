import React, { useState, useEffect } from 'react';

interface TransparentImageProps {
  src: string;
  alt: string;
  className?: string;
  threshold?: number;
}

/**
 * Component xử lý bóc nền trắng của ảnh bằng Canvas API
 */
export const TransparentImage: React.FC<TransparentImageProps> = ({ 
  src, 
  alt, 
  className, 
  threshold = 240 
}) => {
  const [processedSrc, setProcessedSrc] = useState<string>(src);

  useEffect(() => {
    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    
    img.onload = () => {
      if (isCancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Nếu pixel có độ sáng cao hơn ngưỡng (gần trắng), đặt alpha = 0
        if (data[i] > threshold && data[i+1] > threshold && data[i+2] > threshold) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedSrc(canvas.toDataURL());
    };
    
    return () => { isCancelled = true; };
  }, [src, threshold]);

  return <img src={processedSrc} alt={alt} className={className} />;
};
