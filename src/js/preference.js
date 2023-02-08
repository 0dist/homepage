

const colorWrap = document.getElementById("color-preference-wrapper");

const background = document.getElementById("background");
const foreground = document.getElementById("foreground");
const subColor = document.getElementById("sub");

const stylesheet = document.getElementById("stylesheet");
const root = stylesheet.sheet.rules[0].style;

const changeFontSize = document.getElementById("font-size");
const changeFont = document.getElementById("font-selection");

let font, newPreference;


function setPreferenceVal() {
    chrome.storage.local.get("theme").then((result) => {
        for (let i in result) {
            background.value = result[i].background;
            foreground.value = result[i].foreground;
            subColor.value = result[i].sub;
            changeFontSize.value = result[i].fontSize;

            if (result[i].font) {
                font = changeFont.value = result[i].font;
            }
        }
    })
}


colorWrap.addEventListener("click", (cursor) => {
    let elem = cursor.target;
    if (elem != colorWrap) {
        elem.addEventListener("input", setProperty)

        elem.onchange = () => {
            applyPreference();
        }
    }
})


function setProperty(input) {
    let elem = input.target;
    root.setProperty("--global-"+elem.id+"-color", elem.value, "important");
}


changeFontSize.addEventListener("mouseup", () => {
    root.setProperty("--font-size", changeFontSize.value + "px", "important");
    applyPreference();
})


changeFont.addEventListener("change", () => {
    font = changeFont.value;
    applyPreference();
    window.location.reload();
})


function applyPreference() {
    let theme = new themeTemplate(background.value, foreground.value, subColor.value, changeFontSize.value);
    chrome.storage.local.set({theme});
}


class themeTemplate {
    constructor(background, foreground, sub, fontSize) {
        this.background = background;
        this.foreground = foreground;
        this.sub = sub;
        this.root = ":root{--global-background-color:"+background+";--global-foreground-color:"+foreground+";--global-sub-color:"+sub+";--font-size:"+fontSize+"px;}"+applyFont()+"";
        this.font = font;
        this.fontSize = fontSize;
    }
}


function applyFont() {
     if (font) {
        return "@font-face{font-family:"+font+"-Regular"+";src:url(fonts/"+font+"-Regular"+".woff2);}body,button,input{font-family:"+font+"-Regular"+"}";
    }
    else {
        return "";
    }
}



export {setPreferenceVal}


