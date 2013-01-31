
var packer = require('./packer.js');
var stdin = process.stdin;
var stream;

stdin.resume();
stdin.setEncoding( 'utf8' );

// on any data into stdin
stdin.on( 'data', function(chunk){
	packer.run(chunk);
	packer.exportpng();
});