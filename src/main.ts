import { mount, unmount } from "svelte";
import App from "./App.svelte";

let stop: (() => void) | null;
// wait till SvelteKit start and end hydration
const skScript = document.querySelector("script[data-sveltekit-fetched]");
if (skScript) {
    new MutationObserver((_, observer) => {
        if (!document.contains(skScript)) {
            observer.disconnect();
            start();
        }
    }).observe(skScript.parentElement!, { childList: true });
} else {
    start();
}

async function start () {
    await new Promise((res) => { setTimeout(res, 10); });
    addStartAppButton();
    if (window.location.hash || window.location.href.endsWith("#")) {
        startApp();
    }
}

function addStartAppButton () {
    const ul = document.createElement("ul");
    ul.style.marginTop = "20px";

    const li = document.createElement("li");

    const a = document.createElement("a");
    a.textContent = "Import tags";
    a.href = "#";
    a.addEventListener("click", () => {
        (document.querySelector("nav > :first-child") as HTMLElement)?.click();
        startApp();
    });

    li.append(a);
    ul.append(li);
    document.querySelector(".mobile_menu")?.append(ul);
}

function startApp () {
    const content = document.querySelector(".content");
    if (!content) {
        console.error("No element to mount the App");
        return;
    }
    for (const elem of content.children) {
        (elem as HTMLElement).style.display = "none";
    }

    stop?.();
    const app = mount(App, {
        target: content,
    });
    stop = () => {
        unmount(app);
        for (const elem of content.children) {
            (elem as HTMLElement).style.display = "";
        }
    };
}

// https://github.com/sveltejs/kit/issues/2588 in SK below v1.181
// no hashchange event when only hash changes
window.addEventListener("click", (ev) => {
    const a = (ev.target as HTMLElement).closest("a[href='/']");
    if (a && stop) {
        stop();
        stop = null;
    }
}, { capture: true });

window.addEventListener("hashchange", () => {
    const hasHash = window.location.hash || window.location.href.endsWith("#");
    if (hasHash && !stop) {
        startApp();
    } else if (!hasHash && stop) {
        stop();
        stop = null;
    }
});
