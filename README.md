OpenFaaS Node.js 10 (LTS) and Express.js template
=============================================

This template provides additional context and control over the HTTP response from your function.

## Status of the template

This template is pre-release and is likely to change - please provide feedback via https://github.com/openfaas/faas

The template makes use of the OpenFaaS incubator project [of-watchdog](https://github.com/openfaas-incubator/of-watchdog).

## Supported platforms

* x86_64 - `node10-express`
* armhf - `node10-express-armhf`

## Trying the template

```
$ faas template pull https://github.com/openfaas-incubator/node10-express-template
$ faas new --lang node10-express
```

## Example usage

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
