



import {main} from "./index.js";
import {bookmarks} from "./bookmarks.js";


let storage = new class Storage {
	constructor() {
		this.imageCount = 0;
	}


	pullLocalStorage() {
		let blocks = JSON.parse(localStorage.getItem("blocks"));
		let images = JSON.parse(localStorage.getItem("images"));
		let obj = Object;
		
		if (blocks) {
			for (let i of blocks) {
				let val = obj.values(i)[0];
				this.renderBlock(val.title, val.url, val.icon, val.position, obj.keys(i)[0]);
			}
		}
		if (images) {
			this.imageCount = images.length
			for (let i of images) {
				let val = obj.values(i)[0];
				this.requestIndexedDb("get", obj.keys(i)[0], null, val.position);
			}
		}
		else {
			this.showCanvas();
		}
	}


	setBlockInfo(blockList) {
		let blocks = JSON.parse(localStorage.getItem("blocks") || "[]"), total = blockList.length, obj = Object;

		for (let i of blockList) {
		    let val = obj.values(i)[0];
		    this.renderBlock(val.title, val.url, val.icon, val.position, obj.keys(i)[0]);
		    blocks.push(i);

	        if (!--total) {
	            localStorage.setItem("blocks", JSON.stringify(blocks));
	        }
        }
	}


	requestIndexedDb(type, id, blob, position) {
	    const request = window.indexedDB.open("blobsDb");
	    request.onsuccess = (e) => {
	        const db = e.target.result;
	        let transaction = db.transaction("images", "readwrite");
	        let blobStore = transaction.objectStore("images");

	        if (type == "save") {
	            this.renderImage(URL.createObjectURL(blob), position, id);
	            let images = JSON.parse(localStorage.getItem("images") || "[]"), obj = {};

				obj[id] = new StorageBlock(...Array(3), position);
			    images.push(obj);
				localStorage.setItem("images", JSON.stringify(images));
	            blobStore.add({id: id, blob: blob});
	        }
	        else if (type == "get") {
		        blobStore.get(id).onsuccess = (e) => {
			        this.renderImage(URL.createObjectURL(e.target.result.blob), position, id);
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
	        e.target.result.createObjectStore("images", {keyPath: "id"});
	    }
	    request.onerror = (e) => {
	        console.log(e.type);
	    }
	}



	renderBlock(title, url, icon, position, id) {
		const block = document.createElement("div");
		const blockWrapper = document.createElement("div");
		const blockUrl = document.createElement("a");
		const blockIcon = document.createElement("img");

		const textWrapper = document.createElement("div");
		const textTitle = document.createElement("p");
		const textUrl = document.createElement("p");

		position ? main.canvas.appendChild(block) : main.sidebar.appendChild(block);

		block.id = id;
		block.className = "block canvas-elem";
		block.style = position;
		block.appendChild(blockWrapper).className = "block-content";
		blockWrapper.appendChild(blockUrl).className = "link";
		blockUrl.href = url;
		blockUrl.target = "_blank";
		blockWrapper.appendChild(blockIcon).src = icon;
		blockIcon.className = "favicon";
		blockWrapper.appendChild(textWrapper).className = "text";
		textWrapper.appendChild(textTitle).innerText = title;
		textTitle.className = "block-title";
		textWrapper.appendChild(textUrl).className = "block-url";
		textUrl.innerText = url;
	}


	renderImage(src, position, id) {
		const imgWrapper = document.createElement("div");
		const img = document.createElement("img");

		main.canvas.appendChild(imgWrapper);
		imgWrapper.id = id;
		imgWrapper.className = "image canvas-elem";
		imgWrapper.style = position;
		imgWrapper.appendChild(img).src = src;
		
		img.onload = () => {
			URL.revokeObjectURL(src);
			// show when the last image is loaded
			if (!--this.imageCount) {
				this.showCanvas();
			}
		}
	}

	showCanvas() {
		document.body.className = "fading-in";
		setTimeout(() => {
			document.body.removeAttribute("class");
		}, "100");

	}

	generateId() {
		return Math.random().toString().substring(2, 7)
	}







}



class StorageBlock {
	constructor(title, url, icon, position) {
		this.title = title;
		this.url = url;
		this.icon = icon;
		this.position = position;
	}
}






export {storage, StorageBlock}


