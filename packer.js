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

Packer.prototype.run = function (images, width, height) {
	this.sprites = [];
	var sprites = this.sprites;
	
	images.forEach(function (val, index, array) {
		var img = new Image();
		img.src = val;
		sprites.push(img);
	});

	this.pack(sprites, width, height);
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
	return this.pack(nextsprites);
};

Packer.prototype.toString = function() {
	var res = '';
	for (var i = 0; i < this.sheets.length; i++) {
		res += 'sheet '+ (i+1) +'\n';
		res += this.sheets[i];
	}
	return res;
};

Packer.prototype.pngExport = function() {
	for (var i = 0; i < this.sheets.length; i++) {
		this.sheets[i].pngSave(__dirname + '/sheet'+(i+1)+'.png');
	}
};

Packer.prototype.svgExport = function() {
	res = '';
	for (var i = 0; i < this.sheets.length; i++) {
		res += this.sheets[i].svg();
	}
	return res;
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
			height: sprite.height
		};
		this.lines[line].push(newsprite);
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

Sheet.prototype.pngSave = function(filename) {
	var canvas = new Canvas(this.width, this.height),
	out = fs.createWriteStream(filename),
	stream = canvas.pngStream();

	var ctx = canvas.getContext('2d');
	
	//fill background
	ctx.fillStyle="#FFFFFF";
	ctx.fillRect(0, 0, this.width, this.height);

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

	//fill background
	ctx.fillStyle="#FFFFFF";
	ctx.fillRect(0, 0, this.width, this.height);

	//draw all sprites
	var sprite;
	for (var i = 0; i < this.lines.length; i++) {
		for (var j = 0; j < this.lines[i].length; j++) {
			sprite = this.lines[i][j];
			ctx.fillStyle = clr();
			ctx.fillRect(sprite.x ,sprite.y, sprite.width, sprite.height);
		}
	}
};

Sheet.prototype.svgExport = function(){
	//draw all sprites
	var sprite, res = '';

	//svg
	res += '<svg xmlns="http://www.w3.org/2000/svg" ';
	res += 'style="width:'+this.width+'px; height:'+this.height+'px; border: 1px solid black;" version="1.1">';

	for (var i = 0; i < this.lines.length; i++) {
		for (var j = 0; j < this.lines[i].length; j++) {
			sprite = this.lines[i][j];
			res += '<rect x="'+sprite.x+'" y="'+sprite.y+'" ';
			res += 'width="'+ sprite.width +'" height="'+sprite.height+'" ';
			res += 'style="fill:'+clr()+';"/>';
		}
	}
	return res + '</svg>';
}

//random color
var clr = function(){
	return 'rgb('+Math.floor(128+Math.random()*128)+','+Math.floor(Math.random()*64)+','+Math.floor(Math.random()*128)+')';
};

module.exports = new Packer();