




import {storage} from "./storage.js";



let image = new class ImageFile {
    chooseImage(btn) {
        const file = btn.files[0];
        if (file) {
            const img = new Image();
            const src = URL.createObjectURL(file);
            img.src = src;
            let imgType;

            file.type == "image/png" && file.size < 100000 ? imgType = "image/png" : imgType = "image/jpeg";

            img.onload = () => {
                let imgWidth = img.width, imgHeight = img.height;
                let windowWidth = window.innerWidth, windowHeight = window.innerHeight;
                let ratio = imgWidth/imgHeight;

                let widthGap = windowWidth - imgWidth, heightGap = windowHeight - imgHeight;
                let drawWidth = imgWidth + (heightGap * ratio), drawHeight = imgHeight;


                if (heightGap <= 0) {
                    drawHeight = windowHeight;
                }
                else if (widthGap >= 0) {
                    drawWidth = imgWidth;
                }
    
                const canvas = document.createElement("canvas");
                canvas.width = drawWidth, canvas.height = drawHeight;
                canvas.getContext("2d").drawImage(img, 0, 0, drawWidth, drawHeight)

                canvas.toBlob((blob) => {
                    let top = Math.round((((windowHeight - drawHeight) / 2) / windowHeight) * 100);
                    let left = Math.round((((windowWidth - drawWidth) / 2) / windowWidth) * 100);

                    storage.requestIndexedDb("save", storage.generateId(), blob, "top: "+top+"vh; left: "+left+"vw;");
                    URL.revokeObjectURL(src);
                }, imgType, 0.4)
                canvas.width += 0;
            }
        }
    }
}



export {image}