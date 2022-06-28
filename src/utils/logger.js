
export function logger(level, msg) {
    let now = new Date()

    let dStr = [now.getDate(), 
                now.getMonth(),
                now.getFullYear()].join("-") +
                [now.getHours(),
                now.getMinutes(),
                now.getSeconds()].join(":")
    if(typeof(msg) != 'string') {
        console.dir(msg, {depth: null, colors: true})
    } else {
        console.log(dStr, "::[", level.toUpperCase(), "]::", msg)
    }

}