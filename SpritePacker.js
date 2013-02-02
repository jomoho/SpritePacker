
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


var images = [];

for (var i = 1; i < 24; i++) {
	images.push('./images/' + (i < 10? '0':'') + i + '.png');
}

//packer.runText('864x480 78x107 410x321 188x167 315x274 229x163 629x236 39x32 193x56 543x155');
packer.run(images, 2048, 2048, 0.3);
console.log(packer.toCss());
packer.pngExport();