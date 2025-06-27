import { useState, useEffect } from "react";

export function useColsPerRow() {
  const getCols = () => {
    if (typeof window === "undefined") return 4; // default for SSR
    const width = window.innerWidth;
    if (width < 576) return 1;
    if (width < 768) return 2;
    if (width < 992) return 3;
    return 4;
  };

  const [cols, setCols] = useState(getCols);

  useEffect(() => {
    const handleResize = () => setCols(getCols());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return cols;
}