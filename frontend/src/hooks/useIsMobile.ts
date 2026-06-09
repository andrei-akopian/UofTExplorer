import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

function getIsMobileViewport() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(getIsMobileViewport);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(getIsMobileViewport());
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isMobile;
}
