




import {main} from "./index.js";
import {storage, StorageBlock} from "./storage.js";





let canvas = new class Canvas {
	constructor() {
		this.canvas = document.getElementById("canvas");

		this.ctx = document.getElementById("context");
		this.ctxDelete = document.getElementById("context-delete");
		this.ctxUpdate = document.getElementById("context-update");
		this.ctxClone = document.getElementById("context-clone");
		this.ctxTitle = document.getElementById("edit-block-title");
		this.ctxUrl = document.getElementById("edit-block-url");

		this.ctxSmaller = document.getElementById("image-smaller");
		this.ctxBigger = document.getElementById("image-bigger");




		document.addEventListener("mousedown", (e) => {
			if (main.editable && !e.target.closest("#context")) {
				this.ctx.style.display ? this.ctx.style.display = "none" : null;
			}
		})

		this.canvas.addEventListener("mousedown", (e) =>{
			if (main.editable) {
				let elem = e.target, eClass = elem.classList[0];
				if (e.button != 2 && ["block", "image"].includes(eClass)) {

					this.elemInfo = new ElemInfo(elem, e.target.offsetWidth, e.target.offsetHeight, window.innerWidth, window.innerHeight, e.offsetX, e.offsetY, elem.parentElement == main.sidebar, eClass == "image");
					// create a reference then remove on mouse up
					this.moveFunc = (e) => {this.moveElem(e)};
					this.mouseMove(true);
				}
			}
		})


		window.addEventListener("mouseup", () =>{
			if (main.editable) {
				this.mouseMove(false);
				if (this.elemInfo) {
					if (this.elemInfo.elem.style.zIndex) {
						this.elemInfo.elem.style.removeProperty("z-index");
					}
				}
			}
		})







		this.canvas.addEventListener("contextmenu", (e) => {
			let elem = e.target, eClass = elem.classList[0];
			if (main.editable && ["block", "image"].includes(eClass)) {
				e.preventDefault();
				this.elemInfo = new ElemInfo(elem, ...Array(7), eClass == "image")

				if (eClass == "image") {
					this.showCtxElems(["none", "flex"]);
				}
				else {
					this.showCtxElems(["flex", "none"]);
					this.ctxTitle.value = elem.querySelector(".block-title").innerText;
					this.ctxUrl.value = elem.querySelector(".block-url").innerText;
				}

				this.ctx.style.display = "inline-flex";
				let x, y, ctxWidth = this.ctx.offsetWidth, ctxHeight = this.ctx.offsetHeight, wWidth = window.innerWidth, wHeight = window.innerHeight;

				if (e.clientX + ctxWidth >= wWidth) {
					x = wWidth - ctxWidth;
				}
				else {
					x = e.clientX;
				}
				if (e.clientY + ctxHeight >= wHeight) {
					y = wHeight - ctxHeight;
				}
				else {
					y = e.clientY;
				}
				this.ctx.style.left = x + "px", this.ctx.style.top = y + "px";
			}
		})



		this.ctxDelete.addEventListener("click", () => {
			this.elemInfo.elem.remove();
			this.checkIfLast();
			this.ctx.style.display = "none";

			!this.elemInfo.image ? this.removeFromStorage("blocks") : [this.removeFromStorage("images"), storage.requestIndexedDb("delete", this.elemInfo.elem.id)];
		})


		this.ctxClone.addEventListener("click", () => {
			let obj = {}, elem = this.elemInfo.elem;

			obj[storage.generateId()] = new StorageBlock(elem.querySelector(".block-title").innerText, elem.querySelector(".block-url").innerText, elem.querySelector(".favicon").getAttribute("src"), "");
			storage.setBlockInfo([obj]);
			main.openSidebar();
		})


		this.ctxUpdate.addEventListener("click", () => {
			let elem = this.elemInfo.elem, ctxTitle = this.ctxTitle.value, ctxUrl = this.ctxUrl.value, elemTitle = elem.querySelector(".block-title"), elemUrl = elem.querySelector(".block-url"), elemLink = elem.querySelector(".link");

			if (elemTitle.innerText != ctxTitle || elemUrl.innerText != ctxUrl) {
				elemTitle.innerText = ctxTitle;
				elemUrl.innerText = elemLink.href = ctxUrl;
				this.updateStorage(elem.id, ctxTitle, ctxUrl);
			}
		})

		for (let i of [this.ctxTitle, this.ctxUrl]) {
			i.addEventListener("keydown", (e) => {
	            if (e.key == "Enter") {
	            	this.ctxUpdate.click();
	            }
	        })
		}


		this.ctxSmaller.addEventListener("click", () => {
			this.elemInfo.elem.style.width = this.elemInfo.elem.offsetWidth - 30 + "px";
		})
		this.ctxBigger.addEventListener("click", () => {
			this.elemInfo.elem.style.width = this.elemInfo.elem.offsetWidth + 30 + "px";
		})






	}


	mouseMove(state) {
		state ? window.addEventListener("mousemove", this.moveFunc) : window.removeEventListener("mousemove", this.moveFunc);
	}

	moveElem(e) {
		let info = this.elemInfo;
		if (info.sidebar && !info.elem.style.zIndex) {
			info.elem.style.zIndex = 99;
			this.canvas.append(info.elem);
			this.checkIfLast();
		}
		let borderX = e.clientX + (info.width - info.offsetX), borderY = e.clientY + (info.height - info.offsetY);
		let x = Math.round(((e.clientX - info.offsetX) / info.wWidth) * 100), y = Math.round(((e.clientY - info.offsetY) / info.wHeight) * 100);

		// don't include boundaries if image
		info.elem.style.left = info.image ? x + "vw" : this.moveX(x, borderX, info.wWidth, info.width) + "vw";
		info.elem.style.top = info.image ? y + "vh" : this.moveY(y, borderY, info.wHeight, info.height) + "vh";
	}

	moveX(x, borderX, wWidth, eWidth) {
		if (borderX - eWidth <= 0) {
			return 0
		}
		if (borderX <= wWidth) {
			return x
		}
	}

	moveY(y, borderY, wHeight, eHeight) {
		if (borderY - eHeight <= 0) {
			return 0
		}
		if (borderY <= wHeight) {
			return y
		}
	}


	checkIfLast() {
		if (!main.sidebar.children.length) {
			main.resetSidebar();
		}
	}


	showCtxElems(val) {
		for (let i of [this.ctxClone, this.ctxTitle, this.ctxUrl, this.ctxUpdate]) {
			i.style.display = val[0];
		}
		for (let i of [this.ctxSmaller, this.ctxBigger]) {
			i.style.display = val[1];
		}
	}


	removeFromStorage(key) {
		let data = JSON.parse(localStorage.getItem(key)), obj = Object;
		data.splice(data.findIndex((i) => {return obj.keys(i)[0] == this.elemInfo.elem.id;}), 1);
		data.length ? localStorage.setItem(key, JSON.stringify(data)) : localStorage.removeItem(key);
	}


	updateStorage(id, title, url) {
		let blocks = JSON.parse(localStorage.getItem("blocks")), obj = Object;
		for (let i of blocks) {
			if (obj.keys(i)[0] == id) {
				obj.values(i)[0].title = title;
				obj.values(i)[0].url = url;
				localStorage.setItem("blocks", JSON.stringify(blocks));
				break
			}
		}

	}





}





class ElemInfo {
	constructor(elem, width, height, wWidth, wHeight, offsetX, offsetY, sidebar, image) {
		this.elem = elem;
		this.width = width;
		this.height = height;
		this.wWidth = wWidth;
		this.wHeight = wHeight;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.sidebar = sidebar;
		this.image = image;
	}
}




export {canvas}

