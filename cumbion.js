#!/usr/bin/env node
const { spawnSync } = require('child_process');
const { resolve } = require('path');

let arguments = '';
for (let i = 2; i < process.argv.length; i++) {
  arguments += ' ' + process.argv[i];
}

let cmd = 'node --experimental-modules --no-warnings ' + resolve(__dirname, 'cumbion-cli.mjs' + arguments);
cmd = cmd.replace(RegExp('"', 'g'), '\\"')
spawnSync(cmd, { stdio: 'inherit', shell: true });
