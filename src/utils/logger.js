
export function logger(level, msg) {
    let now = new Date()

    let dStr = [now.getDate(), 
                now.getMonth(),
                now.getFullYear()].join("-") +
                [now.getHours(),
                now.getMinutes(),
                now.getSeconds()].join(":")
    if(typeof(msg) != 'string') {
        msg = JSON.stringify(msg)
    }
    console.log(dStr, "::[", level.toUpperCase(), "]::", msg)
}