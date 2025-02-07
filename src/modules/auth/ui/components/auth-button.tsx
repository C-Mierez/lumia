"use client";

import { UserCircleIcon } from "lucide-react";

import { SignedIn, SignedOut, SignInButton, UserButton, ClerkLoading } from "@clerk/nextjs";
import { Button } from "@components/ui/button";

export default function AuthButton() {
    return (
        <>
            <SignedIn>
                <UserButton />
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
