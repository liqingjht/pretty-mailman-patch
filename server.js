const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const port = 3000;
let count = 0;
let www = path.join(__dirname, 'www');

const valid = {
	'demo.gif': 'image/gif',
	'pretty.js': 'application/x-javascript',
	'index.html': 'text/html'
}

const validFiles = Object.keys(valid);

let cache = {};
for(let i=0; i<validFiles.length; i++) {
	let file = validFiles[i];
	try {
		let buf = fs.readFileSync(path.join(www, file));
		cache[file] = buf;
	}
	catch(err) {
		console.log(err);
		process.exit(1);
	}
}

fs.watch(www, (type, file) => {
	if(type !== "change")
		return;
	try {
		let buf = fs.readFileSync(path.join(www, file));
		cache[file] = buf;
		console.log('updated', file, (new Date()).toLocaleString());
	}
	catch(err) {
		console.log('Occur error when update', file);
	}
})

http.createServer((req, res) => {
	let pathname;
	try {
		pathname = url.parse(req.url, true).pathname.slice(1);
		if(validFiles.includes(pathname) === false) {
			pathname = 'index.html';
		}
	}
	catch(err) {
		pathname = 'index.html';
	}
	
	res.setHeader('Content-Type', valid[pathname]);

	res.write(cache[pathname]);

	res.end();

}).listen(port);