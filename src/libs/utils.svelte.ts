import type { SimpleAPPost } from "./providers/APDataProvider";
import storage from "./storage.svelte";

/**
 * Get the erotic color of a post. For non-moderators always returns `"none"`
 */
export function eroticColor(post: SimpleAPPost) {
    return storage.isModerator ? ["none", "#F0F", "#F90", "#F00"][post.erotics] : "none";
}

/**
 * Get a color (`"black"` or `"white"`) mostly contrast to the post's color
 */
export function contrastColor(post: SimpleAPPost) {
    return post.color[0] + post.color[1] + post.color[2] > 128 * 3 ? "black" : "white";
}

/**
 * Get the site's language
 */
export function siteLang() {
    return (
        new URLSearchParams(window.location.search).get("lang") ??
        document.cookie
            .split(";")
            .find((s) => s.startsWith("sitelang="))
            ?.split("=")[1] ??
        "en"
    );
}

/**
 * Whether the post has published status
 */
export function isPostPublished(post: SimpleAPPost) {
    return post.status === 1;
}

/**
 * Convert 0..1 number to rounded 0..100
 */
export function percent(n: number) {
    return Math.round(n * 10_000) / 100;
}

/**
 * Convert the timestamp to date-time in local format
 */
export function localTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString();
}
