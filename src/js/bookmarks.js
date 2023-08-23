


import {storage, StorageBlock} from "./storage.js";
import {main} from "./index.js";




let bookmarks = new class Bookmarks {
    constructor() {
        this.bookmarkLayout = document.getElementById("bookmark-layout-wrapper");
        this.bookmarkInputSearch = document.getElementById("bookmark-search");
        this.submitBookmarkSearch = document.getElementById("submit-bookmark-search");
        this.outputContainer = document.getElementById("bookmark-output-container");
        this.selectionContainer = document.getElementById("selected-bookmarks").firstChild;
        this.blur = document.getElementById("blur");

        this.selectedElems = [], this.lastInputVal;




        this.bookmarkLayout.addEventListener("click", (e) => {
            let elem = e.target, id = elem.id, elemClass = elem.classList[0];
            if (elemClass == "folder") {
                this.selectFolder(elem, id);
            }
            else if (elemClass == "row") {
                this.selectRow(elem, id);
            }
        })


        this.submitBookmarkSearch.addEventListener("click", () => {
            let inputVal = this.bookmarkInputSearch.value;
            if (inputVal) {
                if (inputVal !== this.lastInputVal) {
                    let children = this.outputContainer.children;

                    if (children[1]) {
                        children[1].remove();
                    }

                    children[0].hidden = "true";
                    const ul = document.createElement("ul");
                    this.outputContainer.appendChild(ul);

                    chrome.bookmarks.search(inputVal).then((result) => {
                        let checked;
                        for (let i of result) {
                            this.selectedElems.indexOf(i.id) >= 0 ? checked = "checked" : checked = "";

                            let elem = '<li id='+i.id+' class="row"><input type="checkbox"'+checked+'><div><p>'+i.title+'</p><p class="row-url">'+i.url+'</p></div></li>'
                            ul.insertAdjacentHTML("beforeend", elem); 
                        }
                    })
                    this.lastInputVal = inputVal;
                }
            }
        })

        this.bookmarkInputSearch.addEventListener("keydown", (key) => {
            if (key.key == "Enter") {
                this.submitBookmarkSearch.click();
            }
        })

        this.bookmarkInputSearch.addEventListener("input", () => {
             if (!this.bookmarkInputSearch.value && this.outputContainer.children.length == 2) {
                let children = this.outputContainer.children;

                children[1].remove();
                children[0].removeAttribute("hidden");
                this.lastInputVal = "";
            }
        })


        document.getElementById("submit-selected").addEventListener("click", () => {
            let blockList = [], total = this.selectedElems.length;
            for (let i of this.selectedElems) {
                chrome.bookmarks.get(i).then((result) => {
                    for (let i of result) {
                        let obj = {}, title = i.title, url = i.url, icon = "_favicon/?pageUrl="+encodeURIComponent(url)+"", id = storage.generateId();

                        obj[id] = new StorageBlock(title, url, icon, "");
                        blockList.push(obj);

                        if (!--total) {
                            storage.setBlockInfo(blockList)
                        }
                    }
                })
            }
            bookmarks.resetLayout();
            main.openSidebar()
        })


        this.blur.addEventListener("click", (e) => {
            this.resetLayout();
        })

        // disable selection while clicking on links
        this.outputContainer.addEventListener('mousedown', (e) => {
            if (e.detail > 1) {
                e.preventDefault();
            }
        }, false);




    }


    getBookmarks(result, elem) {
        const ul = document.createElement("ul");
        elem.appendChild(ul);

        let checked;
        for (let i of result) {
            for (let bkmark of i.children) {
                let elem
                if (bkmark.url) {
                    this.selectedElems.indexOf(bkmark.id) >= 0 ? checked = "checked" : checked = "";

                    elem = '<li id='+bkmark.id+' class="row"><input type="checkbox"'+checked+'><div><p>'+bkmark.title+'</p><p class="row-url">'+bkmark.url+'</p></div></li>'
                }
                else {
                    elem = '<li id='+bkmark.id+' class="folder">🖿 '+bkmark.title+'</li>'
                }
                ul.insertAdjacentHTML("beforeend", elem);
            }
        }
    }


    selectFolder(elem, id) {
        if (!elem.dataset.opened) {
            chrome.bookmarks.getSubTree(id).then((result) => {
                this.getBookmarks(result, elem);

                elem.dataset.opened = "true";
                elem.lastChild.style.margin = "0 0 0 20px";

                // show layouts
                if (!this.bookmarkLayout.style[0]) {
                    this.bookmarkLayout.style.display = "grid";
                    this.blur.style.display = "block";
                }
            });
        }
        else {
            elem.lastChild.toggleAttribute("hidden");
        }
        elem.classList.toggle("opened-folder");
    }


    selectRow(elem, id) {
        let checkbox = elem.children[0];
        let elems = document.querySelectorAll('[id='+'"'+id+'"'+']');

        if (checkbox.checked) {
            this.doCheckboxes(elems, false)

            let index = this.selectedElems.indexOf(id);
            this.selectionContainer.children[index].remove();
            this.selectedElems.splice(index, 1)
        } 
        else {
            this.doCheckboxes(elems, true)
            this.selectionContainer.appendChild(elem.cloneNode(true));
            this.selectedElems.push(id);
        }
    }

    doCheckboxes(elems, bool) {
        for (let i of elems) {
            i.children[0].checked = bool;
        }
    }


    resetLayout() {
        for (let i of [this.outputContainer, this.selectionContainer]) {
            i.textContent = "";
        }
        for (let i of [this.bookmarkLayout, this.blur]) {
            i.removeAttribute("style");  
        }
        this.selectedElems = [];
        this.lastInputVal = "";
        this.bookmarkInputSearch.value = "";
    }






}

export {bookmarks}




