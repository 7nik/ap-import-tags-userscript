import { monkeyWindow } from "$";
import { mount, unmount } from "svelte";
import App from "./App.svelte";

let stop: (() => void) | null;

// wait till SvelteKit start and end hydration
if (document.getElementById("svelte-announcer")) {
    init();
} else {
    const content = document.querySelector("div[style='display: contents']")!;
    new MutationObserver((_, observer) => {
        if (document.getElementById("svelte-announcer")) {
            observer.disconnect();
            setTimeout(init, 10);
        }
    }).observe(content, { childList: true });
}

function init() {
    const btn = document.createElement("ul");
    btn.style.marginTop = "20px";

    const li = document.createElement("li");

    const a = document.createElement("a");
    // TODO change to a better name, plus prefix in localStore
    a.textContent = "Import tags";
    a.href = "#";
    a.addEventListener("click", () => {
        (document.querySelector("nav > :first-child") as HTMLElement)?.click();
        startApp();
    });

    li.append(a);
    btn.append(li);

    if (!document.contains(btn)) {
        document.querySelector(".mobile_menu")?.append(btn);
    }

    if (window.location.hash.startsWith("#/") || window.location.href.endsWith("#")) {
        startApp();
    }
}

function startApp() {
    const content = document.querySelector(".content");
    if (!content) {
        // eslint-disable-next-line no-alert
        alert("No element to mount the App");
        return;
    }

    stop?.();
    const app = mount(App, {
        target: content.parentElement!,
        anchor: content,
    });
    stop = () => {
        unmount(app);
    };
}

if (monkeyWindow.onurlchange === null) {
    monkeyWindow.addEventListener("urlchange", () => {
        const hasHash = window.location.hash.startsWith("#/") || window.location.href.endsWith("#");
        if (hasHash && !stop) {
            startApp();
        } else if (!hasHash && stop) {
            stop();
            stop = null;
        }
    });
}
