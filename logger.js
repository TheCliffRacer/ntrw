export function log(...args) {
    const loggingEnabled = localStorage.getItem("ntrw.loggingEnabled");
    
    if(!loggingEnabled)
        return;

    console.log(args);
}

export function error(...args) {
    const loggingEnabled = localStorage.getItem("ntrw.loggingEnabled");
    
    if(!loggingEnabled)
        return;

    console.error(args);
}