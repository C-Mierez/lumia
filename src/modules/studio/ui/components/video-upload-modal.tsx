import { CirclePlusIcon } from "lucide-react";

import { Button } from "@components/ui/button";

export default function VideoUploadModal() {
    return (
        <Button variant={"muted"} className="[&_svg]:size-4">
            <CirclePlusIcon />
            Create
        </Button>
    );
}
