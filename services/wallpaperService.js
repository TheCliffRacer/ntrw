import { log, error } from "../logger.js";

export class wallpaperService {
    setWallpaper(wallpaperBlob) {
        if(wallpaperBlob === null || wallpaperBlob === undefined){
            error("Wallpaper blob is null or undefined.");
            return;
        }

        const background = document.getElementById("bg");
        if(background === null || background === undefined){
            error("Unable to find background element.");
            return;
        }

        const wallpaperUrl = URL.createObjectURL(wallpaperBlob);
        background.style.backgroundImage = "url('" + wallpaperUrl + "')";
    }
}