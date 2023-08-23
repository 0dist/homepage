



let pref = JSON.parse(localStorage.getItem("preferences"))
if (pref) {
    let stylesheet = document.getElementById("stylesheet"), root = stylesheet.sheet.rules[0].style, body = stylesheet.sheet.rules[3].style;

    root.setProperty("--font-size", pref.fontSize + "px", "important")
    for (let i of [["background", pref.background], ["foreground", pref.foreground], ["sub", pref.sub]]) {
            root.setProperty("--global-"+i[0]+"-color", i[1], "important")
    }

    if (pref.fontFamily) {
        let fontSet = document.fonts, font = pref.fontFamily, newFont = new FontFace(font, "url(fonts/"+font+".woff2)");

        newFont.load().then(() => {
            fontSet.add(newFont);
            body.setProperty("font-family", ""+font+"", "important");
        })
    }
}


