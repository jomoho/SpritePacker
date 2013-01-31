//var fs = require('fs'),
//	Canvas = require('canvas');

// The sprite packer
function packer(){
	this.sheets = [];
}

packer.prototype.parse = function(stream) {
	var sprites = stream.split(' ');
	var tmp;
	for (var i = 0; i < sprites.length; i++) {
		tmp = sprites[i].split('x');
		sprites[i] = {width: parseInt(tmp[0], 10), height: parseInt(tmp[1], 10)};
	}
	return sprites;
};

packer.prototype.run = function(stream) {
	var sprites = this.parse(stream);
	this.pack(sprites);
	console.log(this.toString());
};

packer.prototype.pack = function(sprites) {
	if(sprites.length === 0){
		return true;
	}

	this.currentsheet = new sheet();
	this.sheets.push(this.currentsheet);

	sprites.sort(function(a,b){
		return b.height - a.height;
	});
	var nextsprites = [];
	for (var i = 0; i < sprites.length; i++) {
		if( this.currentsheet.pack(sprites[i]) === false){
			nextsprites.push(sprites[i]);
		}
	}
	return this.pack(nextsprites);
};

packer.prototype.toString = function() {
	var res = '';
	for (var i = 0; i < this.sheets.length; i++) {
		res += 'sheet '+ (i+1) +'\n';
		res += this.sheets[i];
	}
	return res;
};

packer.prototype.exportpng = function() {
	for (var i = 0; i < this.sheets.length; i++) {
		this.sheets[i].savepng(__dirname + '/sheet'+(i+1)+'.png');
	}
};

packer.prototype.svg = function() {
	res = '';
	for (var i = 0; i < this.sheets.length; i++) {
		res += this.sheets[i].svg();
	}
	return res;
};

//The Sprite sheet aka a single texture
function sheet(){
	this.width = 1024;
	this.height = 1024;
	this.lines = [];
	this.lines.push([]);
}

sheet.prototype.posheight = function(x, line) {
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

sheet.prototype.findline = function(width) {
	for (var i = 0; i < this.lines.length; i++) {
		if(this.lineright(i) + width < this.width){
			return i;
		}
	}
	this.lines.push([]);
	return this.lines.length-1;
};

sheet.prototype.lineright = function(line) {
	var xpos = 0;
	for (var i = 0; i < this.lines[line].length; i++) {
		xpos += this.lines[line][i].width;
	}
	return xpos;
};

sheet.prototype.pack = function(sprite) {
	if( sprite.width > this.width || sprite.height > this.height){
		throw new Error('Couldn\'t pack sprite, it is to big for sheet size');
	}
	var line = this.findline(sprite.width);
	var x = this.lineright(line);
	var y = this.posheight(x, line);

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

sheet.prototype.toString = function() {
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

sheet.prototype.savepng = function(filename) {
	var canvas = new Canvas(this.width, this.height),
	out = fs.createWriteStream(filename),
	stream = canvas.pngStream();

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
	this.drawcanvas(canvas);
};

sheet.prototype.drawcanvas = function(canvas) {
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

sheet.prototype.svg = function(){
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

//module.exports = new packer();