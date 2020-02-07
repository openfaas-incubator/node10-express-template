// Copyright (c) Alex Ellis 2017. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

"use strict"

const express = require('express')
const app = express()
const handler = require('./function/handler');
const bodyParser = require('body-parser')

if (process.env.RAW_BODY === 'true') {
    app.use(bodyParser.raw({ type: '*/*' }))
} else {
    var jsonLimit = process.env.MAX_JSON_SIZE || '100kb' //body-parser default
    app.use(bodyParser.json({ limit: jsonLimit}));
    app.use(bodyParser.raw()); // "Content-Type: application/octet-stream"
    app.use(bodyParser.text({ type : "text/*" }));
}

app.disable('x-powered-by');

let isObject = a => !!a && (a.constructor === Object);

class FunctionEvent {
    constructor(req) {
        this.body = req.body;
        this.headers = req.headers;
        this.method = req.method;
        this.query = req.query;
        this.path = req.path;
    }
}

class FunctionContext {
    constructor() {
        this.statusCode = 200;
        this.headerValues = {};       
    }

    status(value) {
        if (value) {
            this.statusCode = value;
        }

        return this;
    }

    headers(value) {
        if(value && value.constructor === Object) {
            this.headerValues = value;
        }

        return this;
    }

    succeed(value) {
        this.succeedValue = (Array.isArray(value) || isObject(value)) ? JSON.stringify(value) : value;
    }

    fail(message) {
        this.statusCode = 500;
        this.failMessage = message;
    }
}

const middleware = (req, res) => {
    let fnEvent = new FunctionEvent(req);
    let fnContext = new FunctionContext();

    const sendFail = () => {
        res.status(500).send(fnContext.failMessage);
    }

    const handleResult = result => {
        if (fnContext.failMessage) {
            sendFail()
        }
        else {
            res.set(fnContext.headers).status(fnContext.statusCode).send(fnContext.succeedValue);
        }
    }

    let next = () => handleResult(fnContext);

    const result = handler(fnEvent, fnContext, next);

    if (result instanceof FunctionContext) {
        handleResult(result);
    }
    else if (result instanceof Promise) {
        result
            .then(asyncResult => handleResult(asyncResult))
            .catch(err =>  {
                fnContext.fail(err);
                handleResult(fnContext);
            })        
    }
};

app.post('/*', middleware);
app.get('/*', middleware);
app.patch('/*', middleware);
app.put('/*', middleware);
app.delete('/*', middleware);

const port = process.env.http_port || 3000;

app.listen(port, () => {
    console.log(`OpenFaaS Node.js listening on port: ${port}`)
});
