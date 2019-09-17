// Copyright (c) Alex Ellis 2017. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

"use strict"

const express = require('express')
const app = express()
const handler = require('./function/handler');
const bodyParser = require('body-parser')

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text({ type : "text/*" }));
app.disable('x-powered-by');

class FunctionContext {
    constructor(req) {
        this.body = req.body;
        this.headers = req.headers;
        this.method = req.method;
        this.query = req.query;
        this.path = req.path;

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
        this.succeedValue = (isArray(value) || isObject(value)) ? JSON.stringify(value) : value;
    }

    fail(message) {
        this.statusCode = 500;
        this.failMessage = message;
    }
}

const middleware = (req, res) => {
    let fnContext = new FunctionContext(req);

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

    let next = () => {
        handleResult(fnContext);
    }

    const result = handler(fnContext, next);

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

let isArray = (a) => {
    return (!!a) && (a.constructor === Array);
};

let isObject = (a) => {
    return (!!a) && (a.constructor === Object);
};