import { ClapperboardIcon } from "lucide-react";
import Link from "next/link";

import SVG from "@components/svg/svg";
import { Button } from "@components/ui/button";
import { SidebarTrigger } from "@components/ui/sidebar";
import AuthButton from "@modules/auth/ui/components/auth-button";

import SearchInput from "./search-input";

export default function HomeNavbar() {
    return (
        <>
            <div className="col-start-1 col-end-3 flex items-center gap-4">
                {/* Sidebar Button */}
                <SidebarTrigger variant={"glow"} className="size-5 [&_svg]:size-5"></SidebarTrigger>
                {/* Branding */}
                <Link href={"/"} className="-ml-1 flex items-end gap-0.5">
                    <SVG.BrandLogo className="fill-foreground h-4" />
                    <h1 className="text-xl leading-3.75 font-medium tracking-tighter">Lumia</h1>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="col-start-5 col-end-11 flex w-full max-w-4xl flex-1 justify-center place-self-center md:col-start-3 md:col-end-9">
                <SearchInput />
            </div>

            {/* Auth or User Profile */}
            <div className="bg-background border-t-border fixed right-0 bottom-0 left-0 flex items-center justify-between gap-4 border border-r-0 border-b-0 border-l-0 p-2 md:static md:col-start-9 md:col-end-11 md:justify-end md:border-0 md:p-0">
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
        </>
    );
}
