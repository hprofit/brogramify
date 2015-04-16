Ponify
=========

A small utility for converting certain strings to pony phrases or words.
This was a test to get into writing an npm plugin.

## Installation

  npm install ponify --save

## Usage

  var pony = require('ponify')
      ponify = ponify.ponify;

  var string = 'Hey there, everybody!',
      ponied = ponify(string);

  console.log('string', string, 'ponified', ponied);

## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release