#!/usr/bin/env node
const { spawnSync } = require('child_process');
const { resolve } = require('path');

let argumentsStr = '';
for (let i = 2; i < process.argv.length; i++) {
  argumentsStr += ' ' + process.argv[i];
}

let cmd = 'node --experimental-modules --no-warnings ' + resolve(__dirname, 'cumbion-cli.mjs' + argumentsStr);
cmd = cmd.replace(RegExp('"', 'g'), '\\"');
spawnSync(cmd, { stdio: 'inherit', shell: true });
