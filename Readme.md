# Nox

Nox is a testing tool that helps you control the responses of all HTTP
requests that are made through it.

![Nox](https://github.com/Jetstar/nox/blob/master/docs/nox.png?raw=true)

## Depedencies

You will need to install `node.js` to run the app. For more info, see:

https://github.com/joyent/node

If you are on OSX, you can simply run:

```bash
$ brew install node
```

After install node, you'll also need to install `npm`. You can do this
by running:

```bash
$ curl http://npmjs.org/install.sh | sh
```

For more information on npm, see: http://npmjs.org/

To install the dependencies, run:

```bash
$ npm install
```

## Usage

To start the server:

```bash
$ foreman start
```

# Why is this usefull?

If you are working on an application that makes many HTTP requests, your
testers may want to stub our certain requests - or even just spy on them
to see if they are called. How can they do this easily? The answer is,
they can't. You need some sort of proxy between the app and the other
services.

Nox essentially acts like a proxy, but it allows you to modify the
response before it is returned to the requester.

## How does it work?

In this example, lets assume we want to download tweets from twitter.

Lets say your running Nox on localhost:7654 (the default). When you make
a request to "/request" that looks something like this:

```
POST /request HTTP/1.1
Nox-URL: https://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name=twitterapi&count=2
Content-Type: x-www-form-urlencoded

foo=bar&bar=foo
```

That request will be added to Nox web interface. You'll know when its
there, because it'll make a sound. From the interface, you'll be able to
do few things. Continue the request and modify the results, kill the
request, or create a whole new response from scratch.

The original request will be hanging until you make a decision in Nox.

## Development

Clone down the repo, and start hacking. There are no tests, because
is still a proof of concept, and I don't know node that well.

## Copyright

Copyright (c) 2012 Hooroo. See LICENSE for details.
