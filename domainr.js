#!/usr/bin/env node
/**
 * Command line utility for searching domains and checking availabilty with domai.nr API
 *
 * @author Francesco Laffi @francescolaffi
 * @license MIT
 */

var path = require('path'),
    https = require('https');

if (process.argv.length !== 3 || !process.argv[2].trim()) {
  var file = path.basename(process.argv[1]);
  console.error('Usage:', file, '{search}');
  process.exit(1);
}

// domainr api request
https.get('https://domai.nr/api/json/search?q=' + process.argv[2].trim())
  .on('error', function(err) {
    console.error('Request Error:');
    console.error(err);
    process.exit(1);
  })
  .on('response', saveBody(function(res) {
    // check response code
    if (res.statusCode !== 200) {
      console.error('HTTP Error:', res.statusCode);
      console.error(res.body);
      process.exit(1);
    }

    // parse and validate response
    var data = JSON.parse(res.body);
    if(!Array.isArray(data.results) || !data.results.length) {
      console.error('Invalid Response:');
      console.error(res.body);
      process.exit(1);
    }

    // print results
    data.results.forEach(function(domain) {
      console.log(
        availabiltySymbol(domain.availability), 
        '\033[1m'+domain.domain+'\033[0m', // bold
        '('+domain.availability+')'
      );
    });
  }));

// console colored symbol for domains availability
function availabiltySymbol(availability) {
  switch (availability) {
    case 'available': 
      return '\033[1;32m✔\033[0m'; // green ✔
    case 'taken':
    case 'unavailable':
      return '\033[1;31m✘\033[0m'; // red ✘
    default:
      return '\033[1;33m?\033[0m'; // yellow ?
  }
}

// helper to save chunked response
function saveBody(done) {
  return function(res) {
    var body = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      res.body = body;
      done(res);
    });    
  };
}
