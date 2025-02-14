import { useQueryState } from "nuqs";

import { SEARCH_KEYS_ALL } from "@lib/searchParams";

// A wrapper around useQueryState to add additional type-safety for the used key values
export default function useSafeQueryState(key: SEARCH_KEYS_ALL) {
    return useQueryState(key);
}
