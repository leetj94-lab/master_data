import {readdirSync,copyFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const name of readdirSync(path.join(root,'dist')))copyFileSync(path.join(root,'dist',name),path.join(root,name));
writeFileSync(path.join(root,'.nojekyll'),'');
console.log('Static site prepared in repository root for main / (root) Pages publishing.');
