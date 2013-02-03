(function() {
    var fs = require('fs'),
    path = require('path'),
    packer = require ('./packer');

    var width = 1024,
    height = 1024,
    scale = 1,
    cssout = null,
    jsonout = null,
    sprites = [],
    dir = process.cwd();

	process.argv.forEach(function (val, index, array) {
		if(index < 2){

			if(val === '-width'){
				width = parseInt(array[index+1], 10);
			}

			if(val === '-height'){
				height = parseInt(array[index+1], 10);
			}

			if(val === '-scale'){
				scale = Number(array[index+1]);
			}

			if(val === '-css'){
				cssout = dir +'/sheets.css';
			}

			if(val === '-json'){
				jsonout = dir + '/sheets.json';
			}

			if(val.substring(val.length -4).toLowerCase() === '.png'){
				sprites.push(val);
			}
		}
	});
	packer.run(sprites, width, height, scale);
	packer.pngExport(dir);

	if(typeof cssout === 'string'){
		fs.writeFilySync(cssout, packer.toCss());
	}
	if(typeof jsonout === 'string'){
		fs.writeFilySync(cssout, packer.toJSON());
	}

}).call(this);