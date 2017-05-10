'use strict';

const http = require('http');

// url provides nice tools for encoding and decoding strings for URL-safety
const url = require('url');

// start a new server instance, and defining the common callback for all req's
const server = http.createServer((request, response) => {
  // not important, just start a timer
  let start = process.hrtime();

  // initiate an accumulator object to build up our response
  let echo = {};

  // copy the httpVersion property of the request object onto the echo object
  echo.httpVersion = request.httpVersion;

  // similarly copy the method property
  echo.method = request.method;

  // copy the url property, but first break it into its constituent parts
  echo.url = url.parse(request.url, true);

  // clean up the echo object's url prop by removing props with null values
  let keys = Object.keys(echo.url);
  keys.forEach((key) => {
    if (echo.url[key] === null) {
      delete echo.url[key];
    }
  });

  // copy headers prop from request to echo object
  echo.headers = request.headers;

  // initiate a data string to accumulate data if it is present on the req
  echo.data = '';

  // this looks familiar
  request.on('data', (chunk) => {
    echo.data += chunk;
  });

  // when node notifies our server that the req is received, start your res
  request.on('end', () => {
    // start serializing by stringifying
    let echoJSON = JSON.stringify(echo);

    // write the status code and mandatory headers
    response.writeHead(200, 'OK', {
      'Content-Length': echoJSON.length,
      'Content-Type': 'application/json',
    });

    // add the response body to the response object
    response.write(echoJSON);

    // tell the server to send the response
    response.end();

    // end the timer
    let elapsed = process.hrtime(start);

    // log the time it took to process the req and write a res
    console.log(`Request processed in ${elapsed[0] * 1e9 + elapsed[1]} nanoseconds`);
  });
});

server.on('listening', () => {
  console.log('echo server listening');
});

server.listen(3000);
