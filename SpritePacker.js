
var packer = require('./packer.js');

var sprites = [];
process.argv.forEach(function (val, index, array) {
	if(index > 1){
		if(val.substring(val.length-3).toLowerCase() === 'png' ){
			sprites.push(val);
		}

	}
  console.log(index + ': ' + val);
});

packer.runText('864x480 78x107 410x321 188x167 315x274 229x163 629x236 39x32 193x56 543x155');
packer.pngExport();