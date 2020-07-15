#!/usr/bin/env node
const { spawnSync } = require('child_process');
const { resolve } = require('path');

// Say our original entrance script is `app.js`

let param2 = '';
let param3 = '';
if (process.argv[2]) param2 = ' ' + process.argv[2];
if (process.argv[3]) param3 = ' ' + process.argv[3];
const cmd = 'node --experimental-modules --no-warnings ' + resolve(__dirname, 'cumbion-cli.mjs' + param2 + param3);
spawnSync(cmd, { stdio: 'inherit', shell: true });
