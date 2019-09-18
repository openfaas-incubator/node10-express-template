"use strict"

// callback version
const delayCallback = cb => {
    const min = 1; // 1 sec
    const max = 5; // 5 sec
    const delay = Math.round((Math.random() * (max - min) + min));
    setTimeout(() => cb(delay),  delay * 1000);
}

module.exports = (event, context, next) => {
    delayCallback(delay => {
        const result = {
            status: "You said: " + JSON.stringify(event.body),
            delay
        };
        
        context
        .status(200)
        .succeed(result);

        next();        
    })
}

// Uncomment the following line to use it in the promise or async/await versions
// const delayPromise = () => new Promise((resolve, reject) => delayCallback(delay => resolve(delay)) )

// Promise version
/*
module.exports = (event, context) => new Promise((resolve, reject) => {
    delayPromise()
    .then(delay => {
        const result =             {
            status: "You said: " + JSON.stringify(event.body),
            delay
        };
    
        context
            .status(200)
            .succeed(result);
            
        return resolve(context);
    })
});
*/

// async/await version
/*
module.exports = async (event, context) => {  
    const delay = await delayPromise();

    const result =             {
        status: "You said: " + JSON.stringify(event.body),
        delay
    };

    context
        .status(200)
        .succeed(result);

    return context;
}
*/