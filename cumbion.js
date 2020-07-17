#!/usr/bin/env node
const { spawnSync } = require('child_process');
const { resolve } = require('path');

// Say our original entrance script is `app.js`

let arguments = '';
for (let i = 2; i < process.argv.length; i++) {
  arguments += ' ' + process.argv[i];
}

const cmd = 'node --experimental-modules --no-warnings ' + resolve(__dirname, 'cumbion-cli.mjs' + arguments);
spawnSync(cmd, { stdio: 'inherit', shell: true });
