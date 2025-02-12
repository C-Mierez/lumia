import { MuxStatus } from "@modules/videos/constants";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Declarative iterator
export function range(n: number) {
    return Array.from({ length: n }, (_, i) => i);
}

// Video duration formatting
export function formatVideoDuration(durationMilliseconds: number) {
    console.log("formatVideoDuration", durationMilliseconds);

    const seconds = Math.floor((durationMilliseconds / 1000) % 60);
    const minutes = Math.floor((durationMilliseconds / (1000 * 60)) % 60);

    console.log("formatVideoDuration", minutes, seconds);
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
