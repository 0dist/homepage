

const header = document.getElementsByTagName("header")[0];

const canvas = document.getElementById("canvas");
const canvasSidebar = document.getElementById("canvas-sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");

const exportStorage = document.getElementById("export-storage");
const importStorage = document.getElementById("import-storage");

let hasImages, imageNum = 0;


function pullStorageBlock() {
	chrome.storage.local.get((result) => {
    	for (let i in result) {
    		//if numerical
    		if (+i) {
	    		if (!result[i].isImage) {
		    		renderCanvasBlock(result[i].title, result[i].url, result[i].iconUrl, result[i].position, result[i].id);
	    		}
	    		else {
	    			parseThroughIndexedDb(result[i].id, "get", undefined, result[i].position);
	    			hasImages = true;
	    			imageNum++
	    		}
	    	}
    	}
    	if (!hasImages) {
    		document.body.className = "fading-in";
    		setTimeout(() => {
				document.body.removeAttribute("class");
			}, "100")
    	}
    })
}


document.getElementById("reset").addEventListener("click", (elem) => {
	if (window.confirm("Delete all hyperlinks and reset preferences?")) {
		chrome.storage.local.clear();
		window.indexedDB.deleteDatabase("blobsDb");
		window.location.reload();
	}
})


document.getElementById("save").addEventListener("click", () => {
	let blocks = document.querySelectorAll(".canvas-elem");

	for (let i of blocks) {
		let position = i.getAttribute("style");
		let id = i.id;

		chrome.storage.local.get(id).then((result) =>{
			for (let i in result) {
				if (!result[i].isImage) {
					setStorageBlock(result[i].title, result[i].url, result[i].iconUrl, position, id);
				}
				else {
					setStorageBlock(...Array(3), position, id, true);
				}
			}
		})
	}
	[canvasSidebar, sidebarToggle, header].forEach((i) => {
	    i.classList.remove("active-sidebar", "sidebar-width", "reflect-toggle");
	})
	document.getElementById("editable").remove();
})


exportStorage.addEventListener("mousedown", () => {
	let images =  document.querySelectorAll(".image");
	let imageArray = [];

	for (let i of images) {
		imageArray.push(i.id);
	}
	chrome.storage.local.get((result) => {
		let jStorage = JSON.stringify(result, (key, value) => {
			if (imageArray.includes(key)) {
				return undefined
			}
			else {
				return value
			}
		});
		exportStorage.href = URL.createObjectURL(new Blob([jStorage], {type: "application/json"}));
	})
})


importStorage.addEventListener("change", () => {
	chrome.storage.local.clear();
	window.indexedDB.deleteDatabase("blobsDb");
 	const reader = new FileReader();

	reader.readAsText(importStorage.files[0]);
 	reader.onload = () => {
	 	chrome.storage.local.set(JSON.parse(reader.result))
	 	window.location.reload();
	}
})


function parseBlockInfo(title, url, position, local, lastVal, withIcon) {

	let urlFit, iconUrl;
	if (!withIcon) {
		if (local) {
			urlFit = encodeURIComponent(url);
			iconUrl = "_favicon/?pageUrl="+urlFit+"";
		}
		else {
		    urlFit = url.replace(/[h-t]+[:]\W+/, "").split(/[/]+/)[0];
		    iconUrl = "https://icons.duckduckgo.com/ip3/" + urlFit + ".ico";
		}
	}
	else {
		iconUrl = withIcon;
	}

    let id = Math.random().toString().substring(2, 6);
    renderCanvasBlock(title, url, iconUrl, position, id);

    if (lastVal) {
	    for (let i of ["sidebar-width", "active-sidebar", "reflect-toggle"]) {
	    	sidebarToggle.classList.add(i)
	    }
	    header.classList.add("sidebar-width");
	    canvasSidebar.classList.add("active-sidebar");
	}
    setStorageBlock(title, url, iconUrl, position, id)
}


function parseThroughIndexedDb(id, type, blob, position) {
    const request = window.indexedDB.open("blobsDb", 1);

    request.onsuccess = (e) => {
        const db = e.target.result;
        let transaction = db.transaction("imageBlobs", "readwrite");
        let blobStore = transaction.objectStore("imageBlobs");

        if (type == "save") {
            let addBlob = blobStore.add({id: id, blob: blob});
            addBlob.onsuccess = () => {
	            renderCanvasImage(URL.createObjectURL(blob), position, id);
	            setStorageBlock(...Array(3), position, id, true);
            }
        }
        else if (type == "get") {
	        let getBlob = blobStore.get(id);
	        getBlob.onsuccess = (e) => {
		        renderCanvasImage(URL.createObjectURL(e.target.result.blob), position, id);
            }
        }
        else {
            blobStore.delete(id);
        }

        transaction.oncomplete = (e) => {
            db.close();
        }
    }
    request.onupgradeneeded = (e) => {
        e.target.result.createObjectStore("imageBlobs", {keyPath: "id"});
    }

    request.onerror = (e) => {
        console.log(e.type);
    }
}


function setStorageBlock(title, url, iconUrl, position, id, isImage) {
    let root = {};
    root[id] = new blockTemplate(title, url, iconUrl, position, id, isImage);
    chrome.storage.local.set(root);
}


class blockTemplate {
    constructor(title, url, iconUrl, position, id, isImage) {
        this.title = title;
        this.url = url;
        this.iconUrl = iconUrl;
        this.position = position;
        this.id = id;
        this.isImage = isImage;
    }
}


function renderCanvasBlock(title, url, iconUrl, position, id) {

	const block = document.createElement("div");
	const blockWrapper = document.createElement("div");
	const blockUrl = document.createElement("a");
	const blockIcon = document.createElement("img");

	const textWrapper = document.createElement("div");
	const textTitle = document.createElement("p");
	const textUrl = document.createElement("p");

	position ? canvas.appendChild(block) : canvasSidebar.appendChild(block);

	block.id = id;
	block.className = "block canvas-elem";
	block.style = position;
	block.appendChild(blockWrapper).className = "block-content";
	blockWrapper.appendChild(blockUrl).className = "link";
	blockUrl.href = url;
	blockUrl.target = "_blank";
	blockWrapper.appendChild(blockIcon).src = iconUrl;
	blockIcon.className = "favicon";
	blockWrapper.appendChild(textWrapper).className = "text";
	textWrapper.appendChild(textTitle).innerText = title;
	textTitle.id = "block-title";
	textWrapper.appendChild(textUrl).className = "url";
	textUrl.id = "block-url";
	textUrl.innerText = url;
};


function renderCanvasImage(imageUrl, position, id) {

	const imageWrapper = document.createElement("div");
	const image = document.createElement("img");

	canvas.appendChild(imageWrapper);
	imageWrapper.id = id;
	imageWrapper.className = "image canvas-elem";
	imageWrapper.style = position;
	imageWrapper.appendChild(image).src = imageUrl;
	
	image.onload = () => {
		URL.revokeObjectURL(imageUrl);
		if (!--imageNum) {
			document.body.className = "fading-in";
			setTimeout(() => {
				document.body.removeAttribute("class");
			}, "100")
		}
	}
}




export {parseBlockInfo, parseThroughIndexedDb, pullStorageBlock, setStorageBlock}
