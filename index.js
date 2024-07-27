import { context } from "./context.js";
import { wallpaperRepository } from "./repositories/wallpaperRepository.js";
import { wallpaperService } from "./services/wallpaperService.js"
import { redditWallpaperService } from "./services/redditWallpaperService.js";
import { log, error } from "./logger.js";

let totalImagesToCache = 100;

(async function () {
    new context().open()
        .then(db => {
            const repository = new wallpaperRepository(db);
            const wallpaper = new wallpaperService();

            repository.getAllWallpapers().then(async (images) => {

                const noImagesToChooseFrom = images.length < 1;

                const lastRefreshDate = new Date(localStorage.getItem("ntrw.lastRefreshDate"));
                const todayDate = new Date();
                const timeSinceLastCache = todayDate.getTime() - lastRefreshDate.getTime();
                const daysSinceLastCache = Math.round(timeSinceLastCache / (1000 * 3600 * 24));
                log("Days since last cache", daysSinceLastCache);

                if (noImagesToChooseFrom || daysSinceLastCache >= 7) {
                    log("Fetching images.");

                    let showFirstWallpaperImmediately = true;

                    let reddit = new redditWallpaperService();
                    for await (let imageUrl of reddit.fetchWallpaperUrls(totalImagesToCache)) {
                        repository.addWallpaper(imageUrl)
                            .then(imageBlob => {
                                if (showFirstWallpaperImmediately) {
                                    wallpaper.setWallpaper(imageBlob);
                                    localStorage.setItem("ntrw.lastRefreshDate", new Date());
                                    showFirstWallpaperImmediately = false;
                                }
                            });
                    }
                }

                const noImagesToChooseFromAfterFetching = images.length === 0;
                if (noImagesToChooseFromAfterFetching) {
                    log("No images to choose from.");
                    return;
                }

                // TODO: Use better random to avoid the same index to spawn twice or more in a row 
                const randomImageIndex = Math.floor(Math.random() * images.length);
                log("Dice roll", randomImageIndex);

                const randomImage = images[randomImageIndex];

                log(`Wallpaper ${randomImage.imageUrl} will be used.`);
                wallpaper.setWallpaper(randomImage.imageBlob);
            });
        });
})();