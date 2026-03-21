import { useEffect, useRef, useState } from "react";

export default function useIntersectionObserver(options?: IntersectionObserverInit) {
    const [isIntersecting, setIsIntersecting] = useState(false);

    const targetRef = useRef<HTMLDivElement>(null);

    const root = options?.root ?? null;
    const rootMargin = options?.rootMargin ?? "0px";
    const threshold = options?.threshold ?? 0;
    const thresholdDep = Array.isArray(threshold) ? threshold.join(",") : `${threshold}`;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting((prev) => (prev === entry.isIntersecting ? prev : entry.isIntersecting));
            },
            { root, rootMargin, threshold },
        );

        if (targetRef.current) {
            observer.observe(targetRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [root, rootMargin, thresholdDep, threshold]);

    return { targetRef, isIntersecting };
}
