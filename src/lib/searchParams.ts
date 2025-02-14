// SearchParams Keys for writing and reading search params from URL
export const SEARCH_KEYS = {
    Home: {
        category: "category",
        test: "test",
    },
    Studio: {
        video: "video",
    },
};

// Route SearchParam types for type declarations and checking
// This is mainly needed to use NextJS's server-side searchParams API
export type SEARCH_PARAMS = {
    [Route in keyof typeof SEARCH_KEYS]: {
        [Param in keyof (typeof SEARCH_KEYS)[Route]]?: string;
    };
};

// Utility function to build a query string from searchParams
export function buildSearchQuery(searchParams: SEARCH_PARAMS[keyof SEARCH_PARAMS]) {
    return `?${new URLSearchParams(searchParams).toString()}`;
}
