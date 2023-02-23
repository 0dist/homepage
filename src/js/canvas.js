

import {parseBlockInfo, setStorageBlock, parseThroughIndexedDb} from "./storage.js";


const header = document.getElementsByTagName("header")[0];

const canvas = document.getElementById("canvas");
const canvasSidebar = document.getElementById("canvas-sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");

const context = document.getElementById("context");
const contextDelete = document.getElementById("context-delete");
const contextUpdate = document.getElementById("context-update");
const contextClone = document.getElementById("context-clone");

const contextTitle = document.getElementById("edit-block-title");
const contextUrl = document.getElementById("edit-block-url");

const contextSmaller = document.getElementById("image-smaller");
const contextBigger = document.getElementById("image-bigger");

const disableContext = [contextDelete, contextClone, contextUpdate, contextBigger, contextSmaller];

let editable, block, image, moving, sidebarParent, activeContext;
let offsetX, offsetY, windowWidth, windowHeight, blockWidth, blockHeight;

let blockTitle, blockUrl;


canvas.addEventListener("mousedown", (cursor) =>{
	if (document.getElementById("editable")) {
		editable = true;
		if (cursor.target.classList[1] == "canvas-elem") {
			block = cursor.target;

			if (block.parentElement.id == "canvas-sidebar") {
				sidebarParent = true;
			}
			if (block.classList[0] == "image") {
				image = true;
			}

			windowWidth = window.innerWidth, windowHeight = window.innerHeight;
			blockWidth = block.offsetWidth, blockHeight = block.offsetHeight;
			offsetX = cursor.offsetX, offsetY = cursor.offsetY;

			if (cursor.button != 2) {
				mouseMove(true);
			}
		}
		resetContextLayout(false);
	}
	else {
		editable = false;
	}
})


function mouseMove(state) {
	state ? window.addEventListener("mousemove", transform) : window.removeEventListener("mousemove", transform);
}


function transform(cursor) {
	if (!moving && sidebarParent) {
		block.style.zIndex = 99;
		canvas.append(block);

		sidebarLastBlock();
		moving = true;
	}
	let borderX = cursor.clientX + (blockWidth - offsetX);
	let borderY = cursor.clientY + (blockHeight - offsetY);

	let x = Math.round(((cursor.clientX - offsetX) / windowWidth) * 100);
	let y = Math.round(((cursor.clientY - offsetY) / windowHeight) * 100);

	block.style.left = moveX(x, borderX, windowWidth, blockWidth) + "vw";
	block.style.top = moveY(y, borderY, windowHeight, blockHeight) + "vh";
}


function moveX(x, borderX, windowWidth, blockWidth) {
	if (!image && windowWidth < borderX) {
		return Math.round(((windowWidth - blockWidth) / windowWidth) * 100);
	}
	if (borderX - blockWidth <= 0) {
		return 0;
	}
	else {
		return x;
	}
}


function moveY(y, borderY, windowHeight, blockHeight) {
	if (!image && windowHeight < borderY) {
		return Math.round(((windowHeight - blockHeight) / windowHeight) * 100);
	}
	if (borderY - blockHeight <= 0) {
		return 0;
	}
	else {
		return y;
	}
}


window.addEventListener("mouseup", () =>{
	if (editable) {
		mouseMove(false);

		if (sidebarParent) {
			block.style.removeProperty("z-index");
			sidebarParent = false;
		}
		moving = image = false;
	}
})


header.addEventListener("mousedown", (cursor) =>{
	if (editable) {
		resetContextLayout(false);
	}
})


canvas.addEventListener("contextmenu", (cursor) => {
	if (editable && cursor.target == block) {
		cursor.preventDefault();
		if (block.classList[0] == "image") {
			if (activeContext != "image") {
				
				[contextClone, contextTitle, contextUrl, contextUpdate].forEach((i) => {
					i.style.display = "none";
				})
				contextSmaller.style.display = "flex";
				contextBigger.style.display = "flex";
				activeContext = "image";
			}
		}
		else {
			blockTitle = block.querySelector(".block-title");
			blockUrl = block.querySelector(".block-url");

			contextTitle.value = blockTitle.innerText;
			contextUrl.value = blockUrl.innerText;

			if (activeContext != "block") {
				resetContextLayout(true);
				activeContext = "block";
			}
		}

		context.style.display = "unset";
		let x, y;
		let contextWidth = context.offsetWidth;
		let contextHeight = context.offsetHeight;

		if (cursor.clientX + contextWidth >= windowWidth) {
			x = windowWidth - contextWidth;
		}
		else {
			x = cursor.clientX;
		}
		if (cursor.clientY + contextHeight >= windowHeight) {
			y = windowHeight - contextHeight;
		}
		else {
			y = cursor.clientY;
		}

		context.style.left = x + "px";
		context.style.top = y + "px";
	}
})


disableContext.forEach((i) => {
	i.addEventListener("contextmenu", (e) => {
		e.preventDefault();
	})
})


contextDelete.addEventListener("click", () => {
	block.remove();
	context.removeAttribute("style");

	sidebarLastBlock();
	chrome.storage.local.remove(block.id);

	if (block.firstChild.src) {
		parseThroughIndexedDb(block.id, "delete")
	}
})

 
contextClone.addEventListener("click", () => {
	parseBlockInfo(blockTitle.innerText, blockUrl.innerText, "", true, true, block.getElementsByTagName("*")[2].getAttribute("src"));
})


contextUpdate.addEventListener("click", () => {

	let contextUrlVal = contextUrl.value;
	if (contextUrlVal) {
		let blockLink = block.querySelector(".link");
		let blockImage = block.querySelector(".favicon");

		blockTitle.innerText !== contextTitle.value ? blockTitle.innerText = contextTitle.value : null;
		blockUrl.innerText !== contextUrlVal ? blockUrl.innerText = contextUrlVal : null;

		let iconUrl = compareUrls(blockLink.getAttribute("href"), contextUrlVal, blockImage);

		blockLink.href = contextUrlVal;
		blockImage.src = iconUrl;

		setStorageBlock(contextTitle.value, contextUrlVal, iconUrl, block.getAttribute("style"), block.getAttribute("id"));
	}
})


contextUrl.addEventListener("keydown", (key) => {
	if (key.key == "Enter") {
		contextUpdate.click();
	}
})


function compareUrls(blockUrl, contextUrlVal, blockImage) {
	let shortContextUrl = shortenUrl(contextUrlVal);
	let shortBlockUrl = shortenUrl(blockUrl) 

	if (shortBlockUrl !== shortContextUrl) {
		let urlFit = shortenUrl(contextUrlVal);
		return "https://icons.duckduckgo.com/ip3/" + urlFit + ".ico";
	}
	else {
		return blockImage.getAttribute("src");
	}
}


function shortenUrl(varible) {
	return varible.replace(/[h-t]+[:]\W+/, "").split(/[/]+/)[0];
}


contextSmaller.addEventListener("click", () => {
	block.style.width = block.offsetWidth - 15 + "px";
})
contextBigger.addEventListener("click", () => {
	block.style.width = block.offsetWidth + 15 + "px";
})


function resetContextLayout(reset) {
	if (!reset) {
		context.style.display = "none";
	}
	else {
		[context, contextClone, contextTitle, contextUrl, contextUpdate, contextSmaller, contextBigger].forEach((i) => {
			i.removeAttribute("style");
		})
	}
}


function sidebarLastBlock() {
	if (!canvasSidebar.children.length) {
		[canvasSidebar, sidebarToggle, header].forEach((i) => {
	        i.classList.remove("active-sidebar", "sidebar-width", "reflect-toggle");
	    })
	};
}
