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

var middleware = (req, res) => {
    handler(req.body, (err, functionResult) => {
        if (err) {
            return console.error(err);
        }
        if(isArray(functionResult) || isObject(functionResult)) {
            res.send(JSON.stringify(functionResult));
        } else {
            res.send(functionResult);
        }
    });
};

app.post('/', middleware);
app.get('/', middleware);

app.listen(3000, () => {
    console.log('OpenFaaS Node.js listening on port: 3000')
});

let isArray = (a) => {
    return (!!a) && (a.constructor === Array);
};

let isObject = (a) => {
    return (!!a) && (a.constructor === Object);
};
