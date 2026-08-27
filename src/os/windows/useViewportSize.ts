import { useEffect, useState } from "react";

export interface ViewportSize {
  width: number;
  height: number;
}

function readViewport(): ViewportSize {
  if (typeof window === "undefined") return { width: 1024, height: 768 };
  return { width: window.innerWidth, height: window.innerHeight };
}

/** Tracks the browser viewport size so windows can stay reachable when it's narrower than their default layout. */
export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(readViewport);

  useEffect(() => {
    function handleResize() {
      setSize(readViewport());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
