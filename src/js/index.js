


import {bookmarks} from "./bookmarks.js";
import {storage} from "./storage.js";
import {image} from "./image.js";
import {canvas} from "./canvas.js";
import {preferences} from "./preferences.js";




let main = new class Main {
    constructor() {
        this.header = document.getElementsByTagName("header")[0];

        this.importBtn = document.getElementById("import");
        this.importDropdown = document.querySelector(".import-dropdown");
        this.prefBtn = document.getElementById("preference");
        this.prefDropdown = document.querySelector(".preference-dropdown");

        this.exportStorage = document.getElementById("export-storage");
        this.importStorage = document.getElementById("import-storage");

        this.canvas = document.getElementById("canvas")
        this.sidebar = document.getElementById("canvas-sidebar");
        this.sidebarToggle = document.getElementById("sidebar-toggle");

        this.linkLayout = document.getElementById("link-layout-wrapper");
        this.blur = document.getElementById("blur");

        this.imgBtn = document.getElementById("input-image");
        this.editable;




        document.getElementById("edit").addEventListener("click", () => {
            this.enableCanvasEdit();
            this.editable = true;
            if (this.sidebar.children[0]) {
                this.sidebarToggle.classList.add("active-sidebar");
            }
        })


        this.header.addEventListener("click", (cursor) => {
            for (let set of [[this.importBtn, this.importDropdown], [this.prefBtn, this.prefDropdown]]) {
                if (cursor.target == set[0]) {
                    set[1].classList.toggle("active-dropdown");
                }
            }

            for (let set of [[this.importBtn, this.importDropdown], [this.prefBtn, this.prefDropdown]]) {
                if (cursor.target != set[0] && !this.checkParent(cursor.composedPath(), set[0]) && set[1].classList.contains("active-dropdown")) {
                    set[1].classList.remove("active-dropdown");
                }
            }

        })



        this.sidebarToggle.addEventListener("click", () => {
            this.sidebar.classList.toggle("active-sidebar");
            this.sidebarToggle.classList.toggle("reflect-toggle");
            for (let i of [this.header, this.sidebarToggle]) {
                i.classList.toggle("sidebar-width");
            }
        })



        document.getElementById("from-bookmarks").addEventListener("click", () => {
            chrome.bookmarks.getSubTree("0").then((result) => {
                bookmarks.getBookmarks(result, document.getElementById("bookmark-output-container"));
                bookmarks.selectFolder(document.getElementById("1"), "1");
            })
        })


        this.imgBtn.addEventListener("change", () => {
            image.chooseImage(this.imgBtn)
        })


        document.getElementById("save").addEventListener("click", () => {
            document.getElementById("editable").remove();
            this.resetSidebar();
            this.editable = false;

            let blocks = JSON.parse(localStorage.getItem("blocks")), images = JSON.parse(localStorage.getItem("images")), obj = Object;
            blocks ? this.saveLocalStorage(obj, [blocks, "blocks"], blocks.length) : null;
            images ? this.saveLocalStorage(obj, [images, "images"], images.length) : null;
            preferences.setPreferences("save");
        })

        document.getElementById("reset").addEventListener("click", () => {
            if (window.confirm("Delete all links, images and reset preferences?")) {
                localStorage.clear();
                window.indexedDB.deleteDatabase("blobsDb");
                window.location.reload();
            }
        })



        this.exportStorage.addEventListener("mousedown", () => {
            let obj = {}, blocks = JSON.parse(localStorage.getItem("blocks"));
            blocks ? obj["blocks"] = blocks : null;
            obj["preferences"] = JSON.parse(localStorage.getItem("preferences"));

             this.exportStorage.href = URL.createObjectURL(new Blob([JSON.stringify(obj)]));
        })

        this.importStorage.addEventListener("change", () => {
            localStorage.clear();
            window.indexedDB.deleteDatabase("blobsDb");
            const reader = new FileReader();

            reader.readAsText(this.importStorage.files[0]);
            reader.onload = () => {
                let data = JSON.parse(reader.result);
                for (let i of Object.keys(data)) {
                    localStorage.setItem(i, JSON.stringify(data[i]));
                }
                window.location.reload();
            }
        })




    }

    enableCanvasEdit() {
        const style = document.createElement("style");
        style.id = "editable";
        style.textContent = ".canvas-elem{border: var(--layout-border);}.block-content{pointer-events: none;}#option-wrapper{display: flex;}#edit{display: none;}.active-sidebar, .active-dropdown{display: block;}.sidebar-width{left: calc(10% + var(--scrollbar-width));}.reflect-toggle{transform: scaleX(-1);}"

        document.head.appendChild(style);
    }


    checkParent(path, elem) {
        for (let i of path) {
            if (i == elem.parentElement) {
                return true
                break
            }
        }
    }

    saveLocalStorage(obj, elems, total) {
        for (let i of elems[0]) {
            obj.values(i)[0].position = document.getElementById(obj.keys(i)[0]).getAttribute("style");

            if (!--total) {
                localStorage.setItem(elems[1], JSON.stringify(elems[0]));
            }
        }
    }


    resetSidebar() {
        for (let i of [this.sidebar, this.sidebarToggle, this.header]) {
            i.classList.remove("active-sidebar", "sidebar-width", "reflect-toggle");
        }
    }

    openSidebar() {
        for (let i of ["sidebar-width", "active-sidebar", "reflect-toggle"]) {
            this.sidebarToggle.classList.add(i)
        }
        this.header.classList.add("sidebar-width");
        this.sidebar.classList.add("active-sidebar");
    }




}

storage.pullLocalStorage();
preferences.setPreferences("set");
export {main}



