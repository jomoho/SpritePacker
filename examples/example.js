var path = require('path');
var fs = require('fs');
var packer = require('../lib/packer.js');
var images = [];

for (var i = 1; i < 24; i++) {
	images.push('./images/' + (i < 10? '0':'') + i + '.png');
}

packer.run(images, 1024, 1024, 0.5);

console.log(packer.toString());
console.log(packer.toCss());
console.log(packer.toJSON());

packer.pngExport(__dirname);