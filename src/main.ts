import { mount, unmount } from "svelte";
import App from "./App.svelte";

let stop: (() => void) | null;

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

setInterval(() => {
    if (!document.contains(btn)) {
        document.querySelector(".mobile_menu")?.append(btn);
    }
}, 300);

function startApp() {
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
window.addEventListener(
    "click",
    (ev) => {
        const isRootLink = !!(ev.target as HTMLElement).closest("a[href='/']");
        if (isRootLink && stop) {
            stop();
            stop = null;
        }
    },
    { capture: true },
);

window.addEventListener("hashchange", () => {
    const hasHash = window.location.hash || window.location.href.endsWith("#");
    if (hasHash && !stop) {
        startApp();
    } else if (!hasHash && stop) {
        stop();
        stop = null;
    }
});
