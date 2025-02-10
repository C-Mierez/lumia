import { ClapperboardIcon } from "lucide-react";
import Link from "next/link";

import SVG from "@components/svg/logo";
import { Button } from "@components/ui/button";
import { SidebarTrigger } from "@components/ui/sidebar";
import AuthButton from "@modules/auth/ui/components/auth-button";

import SearchInput from "./search-input";

export default function HomeNavbar() {
    return (
        <nav className="bg-background sticky top-0 right-0 left-0 z-50 flex h-16 w-full items-center justify-between gap-4 px-4 py-4">
            <div className="flex items-center gap-4">
                {/* Sidebar Button */}
                <SidebarTrigger variant={"glow"} className="size-5 [&_svg]:size-5"></SidebarTrigger>
                {/* Branding */}
                <Link href={"/"} className="-ml-1 flex items-end gap-0.5">
                    <SVG.BrandLogo className="fill-foreground h-4" />
                    <h1 className="text-xl leading-3.75 font-medium tracking-tighter">Lumia</h1>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="absolute right-0 bottom-0 left-0 mx-auto flex max-w-4xl flex-1 translate-y-[-40%] justify-center">
                <SearchInput />
            </div>

            {/* Auth or User Profile */}
            <div className="flex items-center gap-4">
                {/* Studio Link */}
                <Link href="/studio">
                    <Button variant={"muted"} className="[&_svg]:size-4">
                        <ClapperboardIcon />
                        Studio
                    </Button>
                </Link>

                {/* Auth  */}
                <AuthButton />
            </div>
        </nav>
    );
}
