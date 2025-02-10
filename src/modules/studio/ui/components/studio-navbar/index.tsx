import Link from "next/link";

import SVG from "@components/svg/logo";
import { SidebarTrigger } from "@components/ui/sidebar";

import AuthButton from "@modules/auth/ui/components/auth-button";
import VideoUploadModal from "../video-upload-modal";

export default function StudioNavbar() {
    return (
        <nav className="bg-background sticky top-0 right-0 left-0 z-50 flex h-16 w-full items-center justify-between gap-4 px-4 py-4">
            <div className="flex items-center gap-4">
                {/* Sidebar Button */}
                <SidebarTrigger variant={"glow"} className="size-5 [&_svg]:size-5"></SidebarTrigger>
                {/* Branding */}
                <Link href={"/"} className="-ml-1 flex items-end gap-0.5">
                    <SVG.BrandLogo className="fill-foreground h-4" />
                    <h1 className="text-xl leading-3.75 font-medium tracking-tighter">Studio</h1>
                </Link>
            </div>

            {/* Auth and Quick Actions */}
            <div className="flex items-center gap-4">
                <VideoUploadModal />
                <AuthButton />
            </div>
        </nav>
    );
}
