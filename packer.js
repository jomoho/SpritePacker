var fs = require('fs'),
	Canvas = require('canvas'),
	Image = Canvas.Image;

// The sprite Packer
function Packer() {
	this.sheets = [];
}

Packer.prototype.parseText = function (stream) {
	var sprites = stream.split(' ');
	var tmp;
	for (var i = 0; i < sprites.length; i++) {
		tmp = sprites[i].split('x');
		sprites[i] = {width: parseInt(tmp[0], 10), height: parseInt(tmp[1], 10)};
	}
	return sprites;
};

Packer.prototype.runText = function (stream) {
	var sprites = this.parseText(stream);
	this.pack(sprites);
	console.log(this.toString());
};

Packer.prototype.run = function (files, width, height, scale) {
	this.sprites = [];
	var sprites = this.sprites;
	scale = scale || 1;

	files.forEach(function (val, index, array) {
		var img = new Image();
		img.src = fs.readFileSync(val);
		var sprite = {
			name: val.substring(1 + val.lastIndexOf('/'), val.length-4),
			width: Math.floor(img.width * scale),
			height: Math.floor(img.height * scale),
			img : img
		};
		sprites.push(sprite);
	});

	this.pack(sprites, width, height, scale);
	console.log(this.toString());
};

Packer.prototype.pack = function (sprites, width, height) {
	if(sprites.length === 0){
		return true;
	}

	this.currentSheet = new Sheet(width, height);
	this.sheets.push(this.currentSheet);

	sprites.sort(function(a,b){
		return b.height - a.height;
	});
	var nextsprites = [];
	for (var i = 0; i < sprites.length; i++) {
		if( this.currentSheet.pack(sprites[i]) === false){
			nextsprites.push(sprites[i]);
		}
	}
	return this.pack(nextsprites, width, height);
};

Packer.prototype.toString = function() {
	var res = '';
	for (var i = 0; i < this.sheets.length; i++) {
		res += 'sheet '+ (i+1) +'\n';
		res += this.sheets[i];
	}
	return res;
};

Packer.prototype.toCss = function() {
	var res = '';
	for (var i = 0; i < this.sheets.length; i++) {
		res += this.sheets[i].toCss('./sheet'+ (i+1) +'.png');
	}
	return res;
};

Packer.prototype.pngExport = function() {
	for (var i = 0; i < this.sheets.length; i++) {
		this.sheets[i].pngSave(__dirname + '/sheet'+(i+1)+'.png');
	}
};


//The Sprite Sheet aka a single texture
function Sheet(width, height){
	this.width = width || 1024;
	this.height = height || 1024;
	this.lines = [];
	this.lines.push([]);
}

Sheet.prototype.posHeight = function(x, line) {
	if(line < 1){
		return 0;
	} else{
		var width = 0, sprite;
		for (var i = 0; i < this.lines[line-1].length; i++) {
			sprite = this.lines[line-1][i];
			if(width + sprite.width > x){
				return sprite.y + sprite.height;
			}
			width += sprite.width;
		}
	}
};

Sheet.prototype.findLine = function(width) {
	for (var i = 0; i < this.lines.length; i++) {
		if(this.lineRight(i) + width < this.width){
			return i;
		}
	}
	this.lines.push([]);
	return this.lines.length-1;
};

Sheet.prototype.lineRight = function(line) {
	var xpos = 0;
	for (var i = 0; i < this.lines[line].length; i++) {
		xpos += this.lines[line][i].width;
	}
	return xpos;
};

Sheet.prototype.pack = function(sprite) {
	if( sprite.width > this.width || sprite.height > this.height){
		throw new Error('Couldn\'t pack sprite, it is to big for sheet size');
	}
	var line = this.findLine(sprite.width);
	var x = this.lineRight(line);
	var y = this.posHeight(x, line);

	if( y + sprite.height < this.height){
		var newsprite = {
			x: x,
			y: y,
			width: sprite.width,
			height: sprite.height,
			img: sprite.img
		};

		sprite.x = x;
		sprite.y = y;
		this.lines[line].push(sprite);
		return true;
	}
	return false;
};

Sheet.prototype.toString = function() {
	var res = '';
	var sprite;
	for (var i = 0; i < this.lines.length; i++) {
		for (var j = 0; j < this.lines[i].length; j++) {
			sprite = this.lines[i][j];
			res += sprite.width + 'x' + sprite.height + ' '+ sprite.x + ' '+ sprite.y + '\n';
		}
	}
	return res+'\n';
};

Sheet.prototype.toCss = function(filename) {
	var res = '';

	var sprite;
	for (var i = 0; i < this.lines.length; i++) {
		for (var j = 0; j < this.lines[i].length; j++) {
			sprite = this.lines[i][j];
			res +=  '.sprite-' + sprite.name+ ' {\n';
			res	+= 'background: url(\'' + filename + '\') no-repeat -' + sprite.x + 'px -' + sprite.y + 'px;\n';
			res	+= 'width: ' + sprite.width + 'px\n';
			res	+= 'height: ' + sprite.height + 'px\n}\n';
		}
	}
	return res+'\n';
};

Sheet.prototype.pngSave = function(filename) {
	var canvas = new Canvas(this.width, this.height),
	out = fs.createWriteStream(filename),
	stream = canvas.pngStream();

	//output stream
	stream.on('data', function(chunk){
		out.write(chunk);
	});

	stream.on('end', function(){
		console.log('saved '+ filename);
	});

	//draw
	this.drawCanvas(canvas);
};

Sheet.prototype.drawCanvas = function(canvas) {
	var ctx = canvas.getContext('2d');

	//draw all sprites
	var sprite;
	for (var i = 0; i < this.lines.length; i++) {
		for (var j = 0; j < this.lines[i].length; j++) {
			sprite = this.lines[i][j];
			ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.width , sprite.height);
		}
	}
};

module.exports = new Packer();