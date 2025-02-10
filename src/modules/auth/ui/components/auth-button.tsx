"use client";

import { UserCircleIcon } from "lucide-react";

import { ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@components/ui/button";

export default function AuthButton() {
    return (
        <>
            <SignedIn>
                <UserButton>
                    {/* TODO: Use the Clerk menu to give access to user profile instead */}
                    {/* <UserButton.MenuItems>
                        <UserButton.Link
                            label="Studio"
                            href="/studio"
                            labelIcon={<ClapperboardIcon className="size-4" />}
                        />
                    </UserButton.MenuItems> */}
                </UserButton>
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <Button variant={"ghost"} className="[&_svg]:size-5">
                        <UserCircleIcon />
                        <span>Sign In</span>
                    </Button>
                </SignInButton>
            </SignedOut>
            <ClerkLoading>
                <SignInButton mode="modal">
                    <Button variant={"ghost"} className="[&_svg]:size-5">
                        <UserCircleIcon />
                        <span>Sign In</span>
                    </Button>
                </SignInButton>
            </ClerkLoading>
        </>
    );
}
