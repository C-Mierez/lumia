import { ClapperboardIcon } from "lucide-react";
import Link from "next/link";

import NavbarWrapper from "@components/navbar/navbar-wrapper";
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
            <div className="col-start-3 col-end-9 flex w-full max-w-4xl flex-1 justify-center place-self-center">
                <SearchInput />
            </div>

            {/* Auth or User Profile */}
            <div className="col-start-9 col-end-11 flex items-center justify-end gap-4">
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
