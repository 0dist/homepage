

import {getBookmarks, selectFolder, resetBookmarkLayout} from "./bookmarks.js";
import "./link.js";
import "./canvas.js";
import {pullStorageBlock} from "./storage.js";
import {setPreferenceVal} from "./preference.js";
import "./image.js";


pullStorageBlock();
setPreferenceVal();


const edit = document.getElementById("edit");
const header = document.getElementsByTagName("header")[0];

const importButton = document.getElementById("import");
const importDropdown = document.querySelector(".import-dropdown");

const preference = document.getElementById("preference");
const preferenceDropdown = document.querySelector(".preference-dropdown");

const sidebarToggle = document.getElementById("sidebar-toggle");
const canvasSidebar = document.getElementById("canvas-sidebar");

const linkLayout = document.getElementById("link-layout-wrapper");
const blur = document.getElementById("blur");


edit.addEventListener("click", () => {
    toggleCanvasEdit();

    if (canvasSidebar.children[0]) {
        sidebarToggle.classList.add("active-sidebar");
    }
})


header.addEventListener("click", (cursor) => {
    let inDropdown;

    if (cursor.target == importButton) {
        importDropdown.classList.toggle("active-dropdown");
        preferenceDropdown.classList.remove("active-dropdown");
    }
    else if (cursor.target == preference) {
        preferenceDropdown.classList.toggle("active-dropdown");
        importDropdown.classList.remove("active-dropdown");
    }

    for (let i of cursor.composedPath()) {
        if (i.id == "import-wrapper" || i.id == "preference-wrapper") {
            inDropdown = true;
            break
        }
    }
    if (!inDropdown) {
        [importDropdown, preferenceDropdown].forEach((i) => {
            i.classList.remove("active-dropdown");
        })
    }
})


sidebarToggle.addEventListener("click", () => {
    canvasSidebar.classList.toggle("active-sidebar");
    [header, sidebarToggle].forEach((i) => {
        i.classList.toggle("sidebar-width");
    })
    sidebarToggle.classList.toggle("reflect-toggle");
})


function toggleCanvasEdit() {
    const style = document.createElement("style");
    style.id = "editable";
    style.textContent = ".canvas-elem{border: var(--layout-border);}.block-content{pointer-events: none;}#option-wrapper{display: flex;}#edit{display: none;}.active-sidebar, .active-dropdown{display: block;}.sidebar-width{left: calc(10% + var(--scrollbar-width));}.reflect-toggle{transform: scaleX(-1);}"

    document.head.appendChild(style);
}


document.getElementById("from-bookmarks").addEventListener("click", () => {
    blur.dataset.layout = "bookmarks";
    chrome.bookmarks.getSubTree("0").then((result) => {
        getBookmarks(result, document.getElementById("bookmark-output-container"));
        selectFolder(document.getElementById("1"), "1");
    })
}) 


document.getElementById("from-link").addEventListener("click", () => {
    blur.dataset.layout = "link";

    [blur, linkLayout].forEach((i) => {
        i.style.display = "block";
    })
})


blur.addEventListener("click", () => {
    if (blur.dataset.layout == "link") {
        [linkLayout, blur].forEach((i) => {
            i.removeAttribute("style");  
        })
    }
    else {
        resetBookmarkLayout();
    }
})
