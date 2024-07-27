import { log, error } from "../logger.js";

export class context {
    open() {
        log("Opening database...");
        return new Promise((resolve, reject) => {
            const openRequest = window.indexedDB.open("NTRW", 1);

            openRequest.addEventListener("upgradeneeded", (e) => {
                const db = e.target.result;

                db.createObjectStore("images", {
                    keyPath: "imageUrl",
                    autoIncrement: false,
                });

                // db.createIndex("imageUrl", "imageUrl", { unique: true });

                log("Database initialized successfully.");
            });

            openRequest.addEventListener("success", () => {
                const db = openRequest.result;
                log("Database opened successfully.");

                resolve(db);
            });

            openRequest.addEventListener("error", () => {
                error("Database failed to open.");

                reject();
            });
        });
    }

    purge() {
        window.indexedDB.deleteDatabase("NTRW");
    }
}