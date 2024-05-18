import App from './App.svelte';

let stop: (() => void) | null;
// wait till SvelteKit start and end hydration
const elem = document.querySelector("script[data-sveltekit-fetched]");
if (elem) {
    new MutationObserver((_, observer) => {
        if (!document.contains(elem)) {
            observer.disconnect();
            start();
        }
    }).observe(elem.parentElement!, { childList: true });
} else {
    start();
}

async function start () {
    await new Promise((res) => setTimeout(res, 10));
    addStartAppButton();
    if (window.location.hash) {
        startApp();
    }
}

function addStartAppButton () {
    const ul = document.createElement("ul");
    ul.style.marginTop = "20px";

    const li = document.createElement("li");

    const a = document.createElement("a");
    a.innerText = "Import tags";
    a.href = "#";
    a.addEventListener("click", () => {
        // ev.preventDefault();
        (document.querySelector("nav > :first-child") as HTMLElement)?.click();
        startApp();
        // ul.remove();
    });

    li.append(a);
    ul.append(li);
    document.querySelector(".mobile_menu")?.append(ul);
}

function startApp () {
    const content = document.querySelector(".content");
    if (!content) {
        console.error("No the element to mount the App");
        return;
    }
    for (const elem of content.children) {
        (elem as HTMLElement).style.display = "none";
    }

    stop?.();
    const app = new App({
    	target: content,
    });
    window.addEventListener("click", destroyOnLeave, { capture: true });
    console.log("created app");
    stop = () => {
        window.removeEventListener("click", destroyOnLeave, { capture: true });
        app.$destroy();
        for (const elem of content.children) {
            (elem as HTMLElement).style.display = "";
        }
        console.log("app destroyed");
    }
}

function destroyOnLeave () {
    setTimeout(() => {
        console.log("checking");
        if (!location.hash && !location.href.endsWith("#")) {
            stop?.();
            stop = null;
        }
    }, 100);
}

window.addEventListener("popstate", () => {
    if (location.hash || location.href.endsWith("#")) {
        if (!stop) startApp();
    } else {
        if (stop) {
            stop();
            stop = null;
        }
    }
}, { capture: true });

// @ts-ignore
GM.addStyle(`
    .sidebar_block + .quick_search {
        display: none;
    }
`);
