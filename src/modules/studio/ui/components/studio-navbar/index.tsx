import Link from "next/link";

import NavbarWrapper from "@components/navbar/navbar-wrapper";
import SVG from "@components/svg/svg";
import { SidebarTrigger } from "@components/ui/sidebar";
import AuthButton from "@modules/auth/ui/components/auth-button";

import CreateVideoButton from "../create-video-button";

export default function StudioNavbar() {
    return (
        <>
            <div className="col-start-1 col-end-6 flex items-center gap-4">
                {/* Sidebar Button */}
                <SidebarTrigger variant={"glow"} className="size-5 [&_svg]:size-5"></SidebarTrigger>
                {/* Branding */}
                <Link href={"/"} className="-ml-1 flex items-end gap-0.5">
                    <SVG.BrandLogo className="fill-foreground h-4" />
                    <h1 className="text-xl leading-3.75 font-medium tracking-tighter">Studio</h1>
                </Link>
            </div>

            {/* Auth and Quick Actions */}
            <div className="col-start-6 col-end-11 flex items-center justify-end gap-4">
                <CreateVideoButton />
                <AuthButton />
            </div>
        </>
    );
}
