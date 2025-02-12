import { SearchIcon } from "lucide-react";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";

export default function SearchInput() {
    return (
        // TODO Add clear search button
        // TODO Add search functionality
        <form className="flex h-full w-full transition-colors">
            <Input
                placeholder="Search for videos"
                className="focus:bg-accent-600/20 focus:border-foreground h-9 rounded-l-md rounded-r-none border-r-0 bg-transparent focus:outline-none focus-visible:ring-0"
            />
            <Button
                type="submit"
                variant={"ghost"}
                className="border-input rounded-l-none rounded-r-md border focus:outline-none disabled:cursor-default disabled:opacity-50"
            >
                <SearchIcon />
            </Button>
        </form>
    );
}
