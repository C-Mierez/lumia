const SVG = {
    BrandLogo: (props: React.SVGProps<SVGSVGElement>) => {
        return (
            <svg viewBox="0 0 90 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16 0C7.16309 0 0 7.16333 0 16V44C0 52.8367 7.16309 60 16 60H74C82.8369 60 90 52.8367 90 44V16C90 7.16333 82.8369 0 74 0H16ZM37.0039 13C36.002 13 35 14.0056 35 15.0112L35.1006 44.9766C35.1006 45.3789 35.2002 45.781 35.4004 46.0828C35.6797 46.5024 36.0879 46.7922 36.5352 46.9224C37.0527 47.073 37.623 47.0098 38.1064 46.686L61.1553 31.6028C61.2842 31.5378 61.3721 31.4309 61.4727 31.3091C61.5273 31.2424 61.585 31.1711 61.6562 31.1001C62.2578 30.1951 62.0576 28.9883 61.1553 28.385L38.1064 13.3018C37.8057 13.1006 37.4053 13 37.0039 13Z"
                />
            </svg>
        );
    },
    PlaceholderVideo: (props: React.SVGProps<SVGSVGElement>) => {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
                <rect width="100%" height="100%" fill="var(--color-muted)" />

                <g transform="translate(800, 450)">
                    <rect x="-200" y="-140" width="400" height="280" rx="35" fill="var(--color-accent)" />

                    <circle cx="-50" cy="-20" r="25" fill="white" />
                    <circle cx="50" cy="-20" r="25" fill="white" />
                    <line x1="-75" y1="60" x2="75" y2="40" stroke="white" strokeWidth="25" strokeLinecap="round" />
                </g>
            </svg>
        );
    },
};

export default SVG;
