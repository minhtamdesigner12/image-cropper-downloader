"use client";

import { useEffect, useRef } from "react";

interface AdProps {
  slot: string; // Ad unit ID
  className?: string;
  style?: React.CSSProperties;
}

// Declare adsbygoogle on the window object for TypeScript
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function Ad({ slot, className, style }: AdProps) {
  const adRef = useRef<HTMLModElement>(null); // ✅ Correct type for <ins>

  useEffect(() => {
    if (!window.adsbygoogle || !adRef.current) return;

    try {
      // Only push if this ad hasn't been initialized yet
      if (!(adRef.current as any).adsbygoogleInitialized) {
        window.adsbygoogle.push({});
        (adRef.current as any).adsbygoogleInitialized = true;
      }
    } catch (e) {
      console.error("Adsense error:", e);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className || ""}`}
      style={{ display: "block", width: "100%", height: "90px", ...style }}
      data-ad-client="ca-pub-2028237203618434"
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
      ref={adRef} // ✅ Matches <ins> element type
    ></ins>
  );
}
