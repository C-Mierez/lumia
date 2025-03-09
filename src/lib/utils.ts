import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { env } from "@/env";
import { MuxStatus } from "@modules/videos/constants";

import { buildSearchQuery } from "./searchParams";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Declarative iterator
export function range(n: number) {
    return Array.from({ length: n }, (_, i) => i);
}

// Video duration formatting
export function formatVideoDuration(durationMilliseconds: number) {
    const seconds = Math.floor((durationMilliseconds / 1000) % 60);
    const minutes = Math.floor((durationMilliseconds / (1000 * 60)) % 60);

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// Formatter for MuxStatus
export function formatMuxStatus(status: string | null) {
    switch (status) {
        case MuxStatus.Waiting:
            return "Waiting";
        case MuxStatus.Processing:
            return "Processing";
        case MuxStatus.Ready:
            return "Ready";
        case MuxStatus.Failed:
            return "Failed";
        default:
            return "Unknown";
    }
}

// Get current URL in Vercel deployment
export function getFullVideoUrl(videoId: string) {
    return `${env.NEXT_PUBLIC_WEBSITE_URL}/watch${buildSearchQuery({ v: videoId })}`;
}

export function getFullPlaylistUrl(playlistId: string) {
    return `${env.NEXT_PUBLIC_WEBSITE_URL}/playlists/${playlistId}`;
}

export enum ChannelSubroute {
    Videos = "videos",
    Playlists = "playlists",
    About = "about",
}
export function getFullChannelUrl(userId: string, sub?: ChannelSubroute) {
    const subroute = sub ? `/${sub}` : "";
    return `${env.NEXT_PUBLIC_WEBSITE_URL}/channel${subroute}${buildSearchQuery({ u: userId })}`;
}

// Format string to uppercase first letter only
export function formatUppercaseFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Default mux thumbnail url
export function getDefaultMuxThumbnailUrl(playbackId: string) {
    return `https://image.mux.com/${playbackId}/thumbnail.jpg`;
}

// Default mux preview url
export function getDefaultMuxPreviewUrl(playbackId: string) {
    return `https://image.mux.com/${playbackId}/animated.gif`;
}

// Default mux track url
export function getDefaultMuxTrackUrl(playbackId: string, trackId: string) {
    return `https://stream.mux.com/${playbackId}/text/${trackId}.txt`;
}
