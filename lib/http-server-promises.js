'use strict';

const http = require('http');
const url = require('url');

const server = http.createServer((request, response) => {
  let start = process.hrtime();

  const processRequest = (resolve, reject) => {
    // initiate an accumulator for the request body, which streams in
    let body = '';

    request.on('error', (error) => {
      reject(error);
    });

    // build the body
    request.on('data', (chunk) => {
      body += chunk;
    });

    // send the body from the Promise
    request.on('end', () => {
      resolve(body);
    });
  };

  const buildResponse = (data) => {
    // create the URL object
    let parsedUrl = url.parse(request.url, true);

    // remove null props
    let keys = Object.keys(parsedUrl);
    keys.forEach((key) => {
      if (parsedUrl[key] === null) {
        delete parsedUrl[key];
      }
    });

    // build the response object declaratively (as opposed to procedurally)
    return {
      httpVersion: request.httpVersion,
      method: request.method,
      parsedUrl,
      headers: request.headers,
      data,
    };
  };

  const writeResponse = (json) => {
    // begin the response
    response.writeHead(200, 'OK', {
      'Content-Length': json.length,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': ['OPTIONS', 'POST', 'GET', 'PATCH', 'DELETE'],
    });

    // write a json string to the body of the response
    response.write(json);

    // send the response to the client
    response.end();
  };

  const logTimeTaken = () => {
    let elapsed = process.hrtime(start);
    console.log(`Request processed in ${elapsed[0] * 1e9 + elapsed[1]} nanoseconds`);
  };

  new Promise(processRequest)
    .then(buildResponse)
    .then(JSON.stringify)
    .then(writeResponse)
    .catch(console.error)
    .then(logTimeTaken);
});

server.on('listening', () => {
  console.log('echo server listening');
});

server.listen(3000);
