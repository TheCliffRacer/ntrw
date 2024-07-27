import { log, error } from "../logger.js";

export class redditWallpaperService {
    async * fetchWallpaperUrls(imageCount) {
        let imageUrls = [];

        try {
            let lastEvaluatedKey = "";
            let fetchAttempt = 0;
            const MAX_FETCH_ATTEMPTS = 50;

            // TODO: Add support for hot, top and rising
            let url = `https://www.reddit.com/r/Animewallpaper/new.json?limit=${imageCount}`;
            log("Using url: ", url);

            while (imageUrls.length < imageCount && fetchAttempt < MAX_FETCH_ATTEMPTS) {
                fetchAttempt++;

                if (lastEvaluatedKey !== "")
                    url = `${url}&after=${lastEvaluatedKey}`

                const response = await fetch(url);
                const { data } = await response.json()

                for (let image of data.children) {
                    const imageUrl = image.data.url;
                    log("Fetching wallpaper: ", imageUrl);

                    if (!this.isWallpaperValid(image))
                        continue;

                    imageUrls.push(imageUrl);
                    log("Fetched wallpaper: ", imageUrl);

                    yield await imageUrl;

                    if (imageUrls.length >= imageCount) {
                        log("Finished fetching wallpaper urls.");
                        break;
                    }
                }

                lastEvaluatedKey = data.children[data.children.length - 1].data.name;
            }
        } catch (err) {
            error(error);
        }
    }

    isWallpaperValid(image) {
        const isDesktopWallpaper = image.data.link_flair_text == "Desktop";
        if (!isDesktopWallpaper) {
            log("Skipping non Desktop wallpaper.");
            return false;
        }

        const isNsfwWallpaper = image.data.over_18;
        if (isNsfwWallpaper) {
            log("Skipping NSFW wallpaper.");
            return false;
        }

        const isValidWallpaperFormat = /(jpg|png|jpeg)$/.test(image.data.url);
        if (!isValidWallpaperFormat) {
            log("Skipping invalid wallpaper format.");
            return false;
        }

        return true;
    }
}