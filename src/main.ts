import App from './App.svelte';

const a = document.createElement("a");
a.innerText = "Import tags";
a.href = "#";
a.addEventListener("click", (ev) => {
    ev.preventDefault();

    document.getElementById("mobile_menu_icon")?.click();

    const content = document.getElementById("content");
    if (!content) {
        console.error("No #content element");
        return;
    }
    content.innerHTML = "";

    new App({
    	target: content,
    });
});

const li = document.createElement("li");
li.append(a);

const ul = document.createElement("ul");
ul.style.marginTop = "20px";
ul.append(li);

document.getElementById("mobile_menu")?.append(ul);