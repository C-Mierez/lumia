// SearchParams Keys for writing and reading search params from URL
export const SEARCH_KEY_VALUES = {
    Home: {
        category: "category",
        test: "test",
        v: "v", // Video
        s: "s", // Search
        u: "u", // User
    },
    Studio: {
        video: "video",
    },
} as const;

// type SEARCH_PARAMS_TYPE = {
//     Home: {
//         category: string;
//         test: string;
//         edit: string;
//     };
//     Studio: {
//         video: string;
//     };
// };

// Route SearchParam types for type declarations and checking
// This is mainly needed to use NextJS's server-side searchParams API
export type SEARCH_PARAMS = {
    [Route in keyof typeof SEARCH_KEY_VALUES]: {
        [Key in keyof (typeof SEARCH_KEY_VALUES)[Route]]?: string;
    };
};

// A Union type for all the keys in each route
export type SEARCH_KEYS = {
    [Route in keyof SEARCH_PARAMS]?: keyof SEARCH_PARAMS[Route];
};

// A Union type for all the keys in all routes
export type SEARCH_KEYS_ALL = NonNullable<SEARCH_KEYS[keyof SEARCH_PARAMS]>;

// A Key-Value pair for search params
export type SEARCH_KV = {
    [K in SEARCH_KEYS_ALL]?: string;
};

// Utility function to build a query string from searchParams
export function buildSearchQuery(searchParams: SEARCH_KV) {
    return `?${new URLSearchParams(searchParams).toString()}`;
}
