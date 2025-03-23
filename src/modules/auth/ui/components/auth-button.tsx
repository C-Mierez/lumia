"use client";

import { UserCircleIcon } from "lucide-react";

import { ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@components/ui/button";

export default function AuthButton() {
    return (
        <>
            <SignedIn>
                <UserButton></UserButton>
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <Button variant={"ghost"} className="[&_svg]:size-5">
                        <UserCircleIcon />
                    </Button>
                </SignInButton>
            </SignedOut>
            <ClerkLoading>
                <SignInButton mode="modal">
                    <Button variant={"ghost"} className="[&_svg]:size-5">
                        <UserCircleIcon />
                    </Button>
                </SignInButton>
            </ClerkLoading>
        </>
    );
}
