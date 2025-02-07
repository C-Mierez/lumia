import Link from "next/link";

import SVG from "@components/svg/logo";
import { SidebarTrigger } from "@components/ui/sidebar";

import SearchInput from "./search-input";
import AuthButton from "@modules/auth/ui/components/auth-button";

export default function HomeNavbar() {
    return (
        <nav className="bg-brand-950 sticky top-0 right-0 left-0 z-50 flex w-full items-center justify-between gap-4 px-4 py-4">
            {/* Sidebar Button */}
            <SidebarTrigger variant={"link"} className="size-5"></SidebarTrigger>
            {/* Branding */}
            <Link href={"/"} className="-ml-1 flex items-end gap-0.5">
                <SVG.BrandLogo className="fill-foreground h-4" />
                <h1 className="font-brand text-xl leading-3.5 font-medium tracking-tighter">Lumia</h1>
            </Link>
            {/* Search Bar */}
            <div className="mx-auto flex max-w-4xl flex-1 justify-center">
                <SearchInput />
            </div>
            {/* Auth or User Profile */}
            <div className="flex items-center gap-4">
                <AuthButton />
            </div>
        </nav>
    );
}
