import { monkeyWindow } from "$";
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
        // eslint-disable-next-line no-alert
        alert("No element to mount the App");
        return;
    }
    content.classList.add("alt");

    stop?.();
    const app = mount(App, {
        target: content,
    });
    stop = () => {
        unmount(app);
        content.classList.remove("alt");
    };
}

if (window.location.hash.startsWith("#/") || window.location.href.endsWith("#")) {
    startApp();
}

monkeyWindow.addEventListener("urlchange", () => {
    const hasHash = window.location.hash.startsWith("#/") || window.location.href.endsWith("#");
    if (hasHash && !stop) {
        startApp();
    } else if (!hasHash && stop) {
        stop();
        stop = null;
    }
});
