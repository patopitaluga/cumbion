require('http').createServer((req, res) => {
  switch(req.url) {
    case '/':
      res.end(require('fs').readFileSync(require('path').resolve(__dirname, './index.html'), 'utf8'));
      break;
    case '/style.css':
      res.setHeader('Content-Type', 'text/css');
      res.end(require('fs').readFileSync(require('path').resolve(__dirname, './style.css'), 'utf8'));
      break;
    case '/script.js':
      res.setHeader('Content-Type', 'text/javascript');
      res.end(require('fs').readFileSync(require('path').resolve(__dirname, './script.js'), 'utf8'));
      break;
    case '/lib/cumbion-to-js.mjs':
      res.setHeader('Content-Type', 'text/javascript');
      res.end(require('fs').readFileSync(require('path').resolve(__dirname, './lib/cumbion-to-js.mjs'), 'utf8'));
      break;
    case '/lib/cumbion-to-js__helpers.mjs':
      res.setHeader('Content-Type', 'text/javascript');
      res.end(require('fs').readFileSync(require('path').resolve(__dirname, './lib/cumbion-to-js__helpers.mjs'), 'utf8'));
      break;
    case '/lib/cumbion-to-js__handle-first-word__uppercase.mjs':
      res.setHeader('Content-Type', 'text/javascript');
      res.end(require('fs').readFileSync(require('path').resolve(__dirname, './lib/cumbion-to-js__handle-first-word__uppercase.mjs'), 'utf8'));
      break;
    default:
      res.end('');
  }
}).listen(4000, () => console.log('Listening port 4000'));
