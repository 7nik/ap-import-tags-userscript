import App from './App.svelte';

if (window.location.hash) {
    startApp();
} else {
    const ul = document.createElement("ul");
    ul.style.marginTop = "20px";

    const li = document.createElement("li");

    const a = document.createElement("a");
    a.innerText = "Import tags";
    a.href = "#";
    a.addEventListener("click", (ev) => {
        ev.preventDefault();
        document.getElementById("mobile_menu_icon")?.click();
        startApp();
        ul.remove();
    });
    
    li.append(a);
    ul.append(li);
    document.getElementById("mobile_menu")?.append(ul);
}

function startApp () {
    const content = document.getElementById("content");
    if (!content) {
        console.error("No #content element");
        return;
    }
    content.innerHTML = "";

    new App({
    	target: content,
    });
}

// @ts-ignore
GM.addStyle(`
    .sidebar_block + .quick_search {
        display: none;
    }
`);
