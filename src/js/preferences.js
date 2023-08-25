






let preferences = new class Preferences {
    constructor() {
        this.colorWrap = document.getElementById("color-preference-wrapper");

        this.background = document.getElementById("background");
        this.foreground = document.getElementById("foreground");
        this.subColor = document.getElementById("sub");

        this.titleField = document.getElementById("title");
        this.submitTitle = document.getElementById("submit-title");

        this.stylesheet = document.getElementById("stylesheet");
        this.root = this.stylesheet.sheet.rules[0].style;
        this.body = this.stylesheet.sheet.rules[3].style;

        this.fontSize = document.getElementById("font-size");
        this.fontFamily = document.getElementById("font-selection");
        this.fontSet = document.fonts;






        for (let i of [this.background, this.foreground, this.subColor]) {
            i.addEventListener("input", (e) => {
                let elem = e.target;
                this.root.setProperty("--global-"+elem.id+"-color", elem.value, "important");  
            })
        }


        this.fontSize.addEventListener("mousemove", () => {
            this.root.setProperty("--font-size", this.fontSize.value + "px", "important");
        })


        this.fontFamily.addEventListener("change", () => {
            let font = this.fontFamily.value;
            if (font) {
                let newFont = new FontFace(font, "url(fonts/"+font+".woff2)");
                newFont.load().then(() => {
                    this.fontSet.clear();
                    this.fontSet.add(newFont);
                    this.body.setProperty("font-family", ""+font+"", "important");
                })
            }
            else {
                this.body.removeProperty("font-family");
                this.fontSet.clear();
            }
        })


        this.submitTitle.addEventListener("click", () => {
            let docTitle = document.getElementsByTagName("title")[0]
            docTitle.innerText != this.titleField.value ? [docTitle.innerText = this.titleField.value, this.setPreferences("save")] : null;

        })

        this.titleField.addEventListener("keydown", (key) => {
            if (key.key == "Enter") {
                this.submitTitle.click();
            }
        })


    }



    setPreferences(type) {
        let pref = JSON.parse(localStorage.getItem("preferences"));
        if (pref) {
            let elems = [[this.background, "background"], [this.foreground, "foreground"], [this.subColor, "sub"], [this.fontSize, "fontSize"], [this.fontFamily, "fontFamily"], [this.titleField, "title"]], total = elems.length, obj = Object;

            if (type == "set") {
                for (let elem of elems) {
                    // skip if it's identical to the storage value
                    elem[0].value != pref[elem[1]] ? elem[0].value = pref[elem[1]] : null
                }
            }
            else {
                for (let elem of elems) {
                    pref[elem[1]] != elem[0].value ? pref[elem[1]] = elem[0].value : null

                    if (!--total) {
                        localStorage.setItem("preferences", JSON.stringify(pref));
                    }
                }
            }
        }
        // initiate
        else {
            pref = new Theme(this.background.value, this.foreground.value, this.subColor.value, this.fontSize.value, this.fontFamily.value, this.titleField.value);
            localStorage.setItem("preferences", JSON.stringify(pref));
        }

    }





}




class Theme {
    constructor(background, foreground, sub, fontSize, fontFamily, title) {
        this.background = background;
        this.foreground = foreground;
        this.sub = sub;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.title = title;
    }
}




export {preferences}


