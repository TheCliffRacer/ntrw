import { log, error } from "../logger.js";

export class wallpaperRepository {

    context;

    constructor(context) {
        this.context = context;
    }

    async addWallpaper(imageUrl) {
        return new Promise((resolve, reject) => {
            fetch(imageUrl)
                .then(response => response.blob())
                .then(imageBlob => {
                    log("Adding wallpaper", imageUrl);

                    const objectStore = this.context
                        .transaction(["images"], "readwrite")
                        .objectStore("images");

                    const getRequest = objectStore.get(imageUrl);
                    getRequest.addEventListener("success", () => {
                        if (getRequest.result) {
                            log(`Wallpaper ${imageUrl} was already cached. Skipping...`);

                            resolve(imageBlob);
                        }

                        const addRequest = objectStore.add({ 
                            imageUrl: imageUrl, 
                            imageBlob: imageBlob 
                        });

                        addRequest.addEventListener("success", () => {
                            log(`Wallpaper ${imageUrl} has been cached.`);

                            resolve(imageBlob);
                        });
                        addRequest.addEventListener("error", () => {
                            console.error(addRequest.error);

                            reject();
                        });
                    });

                });
        });
    }

    async getAllWallpapers() {
        return new Promise((resolve, reject) => {
            const objectStore = this.context
                .transaction(["images"], "readwrite")
                .objectStore("images");

            const getResponse = objectStore.getAll();

            getResponse.addEventListener("success", () => {
                let images = getResponse.result;
                log(`Found ${images.length} wallpaper(s).`);

                resolve(images);
            });

            getResponse.addEventListener("error", () => {
                error("Failed to get wallpaper(s).");

                reject();
            });
        });
    }
}