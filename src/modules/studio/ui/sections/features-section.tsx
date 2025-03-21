"use client";

import { Suspense } from "react";

import { Loader2Icon, SparkleIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { Separator } from "@components/ui/separator";

import StatsCard from "../components/stats-card";

interface FeaturesProps {}

export default function Features({}: FeaturesProps) {
    return (
        <>
            <StatsCard>
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg">What&apos;s new in Lumia</h2>
                    <SparkleIcon className="size-4" />
                </div>

                <div className="text-muted-foreground mt-4 flex flex-col gap-4 text-sm">
                    <p>AI Thumbnail Generation</p>
                    <Separator />
                    <p>Custom playlists</p>
                    <Separator />
                    <p>Upcoming changes to video file size limits</p>
                </div>
            </StatsCard>
        </>
    );
}
