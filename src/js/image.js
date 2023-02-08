

import {parseThroughIndexedDb} from "./storage.js";


const input = document.getElementById("input-image");


input.addEventListener("change", () => {

    let imageType;
    const img = new Image();
    const inputFile = input.files[0];

    if (inputFile) {
        const src = URL.createObjectURL(inputFile);
        img.src = src;

        if (inputFile.type == "image/png" && inputFile.size < 100000) {
            imageType = "image/png";
        }
        else {
            imageType = "image/jpeg";
        }

        img.onload = () => {
            URL.revokeObjectURL(src);

            let imgWidth = img.width, imgHeight = img.height;
            let windowWidth = window.innerWidth, windowHeight = window.innerHeight;
            let ratio = imgWidth/imgHeight;

            let heightGap = windowHeight - imgHeight;
            let widthGap = windowWidth - imgWidth;
            let drawWidth, drawHeight;

            let finalWidth = imgWidth + (heightGap * ratio);

            if (imgHeight > windowHeight || imgWidth > windowWidth) {
                if (finalWidth > windowWidth) {
                    drawWidth = windowWidth;
                    drawHeight = imgHeight + (widthGap / ratio);
                }
                else {
                    drawWidth = finalWidth;
                    drawHeight = windowHeight;
                }
            }
            else {
                drawWidth = imgWidth;
                drawHeight = imgHeight;
            }

            const canvasTag = document.createElement("canvas");
            const ctx = canvasTag.getContext("2d");

            canvasTag.width = drawWidth;
            canvasTag.height = drawHeight;
            ctx.drawImage(img, 0, 0, drawWidth, drawHeight)

            canvasTag.toBlob((blob) => {
                let id = Math.random().toString().substring(2, 6);

                let top = Math.round((((windowHeight - drawHeight) / 2) / windowHeight) * 100);
                let left = Math.round((((windowWidth - drawWidth) / 2) / windowWidth) * 100);

                parseThroughIndexedDb(id, "save", blob, "width: "+Math.round(drawWidth)+"px; top: "+top+"vh; left: "+left+"vw;") 

            }, imageType, 0.4)
            canvasTag.width += 0;
        }
    }
})

