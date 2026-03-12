"use client";

import { useEffect, useRef, useState } from "react";

interface DeferBelowFoldProps {
  children: React.ReactNode;
  placeholderClassName?: string;
  rootMargin?: string;
}

export function DeferBelowFold({
  children,
  placeholderClassName = "min-h-[280px]",
  rootMargin = "280px 0px",
}: DeferBelowFoldProps) {
  const markerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      return;
    }

    const marker = markerRef.current;
    if (!marker) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(marker);

    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return <div ref={markerRef} className={isVisible ? undefined : placeholderClassName}>{isVisible ? children : null}</div>;
}
