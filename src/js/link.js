

import {parseBlockInfo} from "./storage.js";



const titleInput = document.getElementById("title-link");
const urlInput = document.getElementById("url-link");
const inputs = [titleInput, urlInput];

const addLink = document.getElementById("submit-link-value");


addLink.addEventListener("click", () => {
	if (urlInput.value) {
		parseBlockInfo(titleInput.value, urlInput.value, "", "", true);
		resetLinkLayout();
	}
})

inputs.forEach((i) => {
	i.addEventListener("keydown", (key) => {

		if (key.target == titleInput && key.key == "Enter") {
			urlInput.focus();
		}
		else if (key.target == urlInput && key.key == "Enter" && urlInput.value) {
			addLink.click();
		}
		else if (key.key == "Escape") {
			resetLinkLayout();
		}
	})
})


function resetLinkLayout() {
	[document.getElementById("link-layout-wrapper"), document.getElementById("blur")].forEach((i) => {
	    i.removeAttribute("style");  
    })
}

