import fs from 'fs';
import path from 'path';

const root = process.argv[2] || '.';
const dependencies = new Set();

function scan(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        scan(fullPath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.matchAll(/import.*from\s+['"]([^.][^'"]+)['"]/g);
      for (const match of matches) {
        let dep = match[1];
        if (dep.includes('/')) {
            if (dep.startsWith('@')) {
                dep = dep.split('/').slice(0, 2).join('/');
            } else {
                dep = dep.split('/')[0];
            }
        }
        dependencies.add(dep);
      }
    }
  }
}

scan(root);
console.log(Array.from(dependencies).sort().join('\n'));
