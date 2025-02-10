import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Declarative iterator
export function range(n: number) {
    return Array.from({ length: n }, (_, i) => i);
}
