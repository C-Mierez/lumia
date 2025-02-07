import { Button } from "@components/ui/button";
import { UserCircleIcon } from "lucide-react";

export default function AuthButton() {
    // TODO Add different states for authenticated and unauthenticated users
    return (
        <Button variant={"ghost"} className="[&_svg]:size-5">
            <UserCircleIcon />
            <span>Sign In</span>
        </Button>
    );
}
