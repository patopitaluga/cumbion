// import * as fs from 'fs';
// import * as path from 'path';
// import * as http from 'http';
const fs = require('fs');
const path = require('path');
const http = require('http');

http.createServer((req, res) => {
  switch (req.url) {
  case '/':
    res.end(fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8'));
    break;
  case '/style.css':
    res.setHeader('Content-Type', 'text/css');
    res.end(fs.readFileSync(path.resolve(__dirname, './style.css'), 'utf8'));
    break;
  case '/script.js':
    res.setHeader('Content-Type', 'text/javascript');
    res.end(fs.readFileSync(path.resolve(__dirname, './script.js'), 'utf8'));
    break;
  default:
    if (fs.existsSync(path.resolve(__dirname, '.' + req.url))) {
      if (req.url.slice(-4) === '.mjs') {
        res.setHeader('Content-Type', 'text/javascript');
        res.end(fs.readFileSync(path.resolve(__dirname, '.' + req.url), 'utf8'));
      }
      if (req.url.slice(-4) === '.png') {
        res.setHeader('Content-Type', 'image/png');
        res.end(fs.readFileSync(path.resolve(__dirname, '.' + req.url)));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write('404 Not found');
      res.end();
    }
  }
}).listen(4000, () => console.log('Listening port 4000'));
