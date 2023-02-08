

chrome.storage.local.get("theme").then((result) => {
    for (let i in result) {
        const style = document.createElement("style");
        style.textContent = result[i].root;
        document.head.appendChild(style);
    }
})


