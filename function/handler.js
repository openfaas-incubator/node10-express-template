"use strict"

module.exports = (context, callback) => {
    callback(undefined, {status: "You said: " + JSON.stringify(context)});
}
