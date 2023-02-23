

import {parseBlockInfo} from "./storage.js";


const bookmarkLayout = document.getElementById("bookmark-layout-wrapper");
const bookmarkInputSearch = document.getElementById("bookmark-search");
const submitBookmarkSearch = document.getElementById("submit-bookmark-search");

const outputContainer = document.getElementById("bookmark-output-container");
const selectionContainer = document.getElementById("selected-bookmarks").firstChild;

const blur = document.getElementById("blur");

let selectedElems = [], lastInputValue;


function getBookmarks(result, thisElem) {
    const ul = document.createElement("ul");
    thisElem.appendChild(ul);

    let checked;
    for (let i of result) {
        for (let child of i.children) {

            if (child.url) {
                selectedElems.indexOf(child.id) >= 0 ? checked = "checked" : checked = "";

                let row = '<li id='+child.id+' class="row"><input type="checkbox"'+checked+'><div><p>'+child.title+'</p><p class="row-url">'+child.url+'</p></div></li>'
                ul.insertAdjacentHTML("beforeend", row);
            }
            else {
                let folder = '<li id='+child.id+' class="folder">🖿 '+child.title+'</li>'
                ul.insertAdjacentHTML("beforeend", folder);
            }
        }
    }
}


bookmarkLayout.addEventListener("click", (elem) => {
    let thisElem = elem.target;
    let thisId = thisElem.id;
    let firstClass = thisElem.classList[0];

    if (firstClass == "folder") {
        selectFolder(thisElem, thisId);
    }
    else if (firstClass == "row") {
        selectRow(thisElem, thisId);
    }
})


function selectFolder(thisElem, id) {

    if (!thisElem.dataset.opened) {
        chrome.bookmarks.getSubTree(id).then((result) => {
            getBookmarks(result, thisElem);

            thisElem.dataset.opened = "true";
            thisElem.lastChild.style.margin = "0 0 0 20px";

            if (!bookmarkLayout.style[0]) {
                bookmarkLayout.style.display = "grid";
                blur.style.display = "block";
            }
        });
    }
    else {
        let ul = thisElem.lastChild;
        ul.toggleAttribute("hidden");
    }
    thisElem.classList.toggle("opened-folder");
}


function selectRow(thisElem, id) {

    let multiElem = outputContainer.querySelectorAll("#"+CSS.escape(id)+"");
    let checkbox = thisElem.children[0];

    if (checkbox.hasAttribute("checked")) {
        let indexOf = selectedElems.indexOf(id);
        selectionContainer.removeChild(selectionContainer.children[indexOf]);
        selectedElems.splice(indexOf, 1);

        for (let i of multiElem) {
            let checkbox = i.children[0];
            checkbox.removeAttribute("checked");
        }
    } 
    else {
        for (let i of multiElem) {
            let checkbox = i.children[0];
            checkbox.setAttribute("checked", "");
        }
        selectionContainer.appendChild(thisElem.cloneNode(true));
        selectedElems.push(id);
    }
}


submitBookmarkSearch.addEventListener("click", () => {
    let liveInputValue = bookmarkInputSearch.value;
    if (liveInputValue) {
        if (liveInputValue !== lastInputValue) {
            let children = outputContainer.children;

            if (children.length == 2) {
                children[1].remove();
            }

            children[0].hidden = "true";
            const ul = document.createElement("ul");
            outputContainer.appendChild(ul);

            chrome.bookmarks.search(liveInputValue).then((result) => {
                let checked;
                for (let i of result) {
                    selectedElems.indexOf(i.id) >= 0 ? checked = "checked" : checked = "";

                    let row = '<li id='+i.id+' class="row"><input type="checkbox"'+checked+'><div><p>'+i.title+'</p><p class="row-url">'+i.url+'</p></div></li>'
                    ul.insertAdjacentHTML("beforeend", row); 
                }
            })
            lastInputValue = liveInputValue;
        }
    }
})


bookmarkInputSearch.addEventListener("keydown", (key) => {
    if (key.key == "Enter") {
        submitBookmarkSearch.click();
    }
})


bookmarkInputSearch.addEventListener("input", () => {
     if (!bookmarkInputSearch.value && outputContainer.children.length == 2) {
        let children = outputContainer.children;

            children[1].remove();
            children[0].removeAttribute("hidden");
            lastInputValue = "";
    }
})


document.getElementById("submit-selected").addEventListener("click", () => {
    let length = selectedElems.length;
    let lastVal;

    for (let id of selectedElems) {
        chrome.bookmarks.get(id).then((result) => {
            for (let i of result) {
                if (!--length) {
                    lastVal = true;
                }
                parseBlockInfo(i.title, i.url, "", true, lastVal);
            }
        })
    }
    resetBookmarkLayout();
})


function resetBookmarkLayout() {
    outputContainer.textContent = "";
    selectionContainer.textContent = "";

    [bookmarkLayout, blur].forEach((i) => {
        i.removeAttribute("style");  
    })
    selectedElems = [];
    lastInputValue = "";
}



export {getBookmarks, selectFolder, resetBookmarkLayout};