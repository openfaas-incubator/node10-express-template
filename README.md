OpenFaaS Node.js 10 (LTS) and Express.js template
=============================================

This template provides additional context and control over the HTTP response from your function.

## Status of the template

This template is pre-release and is likely to change - please provide feedback via https://github.com/openfaas/faas

The template makes use of the OpenFaaS incubator project [of-watchdog](https://github.com/openfaas-incubator/of-watchdog).

## Supported platforms

* x86_64 - `node10-express` and `node10-express-service`
* armhf - `node10-express-armhf`

## Trying the template

```
$ faas template pull https://github.com/openfaas-incubator/node10-express-template
$ faas new --lang node10-express
```

## Example usage - node10-express, node10-express-arm64, node10-express-armhf

### Success and JSON body

```js
"use strict"

module.exports = (event, context) => {
    let err;
    const result =             {
        status: "You said: " + JSON.stringify(event.body)
    };

    context.
        succeed(result);
}
```

### Custom HTTP status code

```js
"use strict"

module.exports = (event, context) => {
    let err;
    const result = {"message": "The record requested was not found."};

    context
        .status(404)
        .succeed(result);
}
```

### Failure code and plain-text body:

```js
"use strict"

module.exports = (event, context) => {
    let err;
    const result = "Unable to process this event.";

    context
        .fail(result);
}
```

### Using the optional `callback` parameter:

```js
"use strict"

module.exports = (event, context, callback) => {
    let err;

    callback(err, {"result": "message received"});
}
```

### Redirect (setting Location header):

```js
"use strict"

module.exports = (event, context) => {
  context
    .headers({'Location': 'https://www.google.com/'})
    .status(307)    // Temporary
    .succeed('Page has moved.')
}
```


### Path-based routing (multiple-handlers):

```js
"use strict"

module.exports = (event, context) => {
  if(event.path == "/login") {
      return login(event, context);
  }

  return context
        .status(200)
        .succeed('Welcome to the homepage.')
}

function login(event, context) {
    return context
        .status(200)
        .succeed('Please log in.')
}
```

Other reference:

* `.status(code)` - overrides the status code used by `fail`, or `succeed`
* `.fail(object)` - returns a 500 error if `.status(code)` was not called prior to that
* `.succeed(object)` - returns a 200 code if `.status(code)` was not called prior to that

## Example usage - node10-express-service
This template provides Node.js 10 (LTS) and full access to [express.js](http://expressjs.com/en/api.html#req.is) for building microservices for [OpenFaaS](https://www.openfaas.com), Docker, Knative and Cloud Run.

With this template you can create a new microservice and deploy it to a platform like [OpenFaaS](https://www.openfaas.com) for:

* scale-to-zero
* horizontal scale-out
* metrics & logs
* automated health-checks
* sane Kubernetes defaults like running as a non-root user

### Minimal example with one route

```js
"use strict"

module.exports = async (config) => {
    const app = config.app;

    app.get('/', (req, res) => {
        res.send("Hello world");
    });
}
```

### Minimal example with one route and `npm` package

```
npm install --save moment
```

```js
"use strict"

const moment = require('moment');

module.exports = async (config) => {
    const app = config.app;

    app.get('/', (req, res) => {
        res.send(moment());
    });
}
```

### Example usage with multiple routes, middleware and ES6

```js
"use strict"

module.exports = async (config) => {
    const routing = new Routing(config.app);
    routing.configure();
    routing.bind(routing.handle);
}

class Routing {
    constructor(app) {
        this.app = app;
    }

    configure() {
        const bodyParser = require('body-parser')
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.raw());
        this.app.use(bodyParser.text({ type : "text/*" }));
    }

    bind(route) {
        this.app.post('/*', route);
        this.app.get('/*', route);
        this.app.patch('/*', route);
        this.app.put('/*', route);
        this.app.delete('/*', route);
    }

    handle(req, res) {
        res.send(JSON.stringify(req.body));
    }
}
```

*handler.js*
