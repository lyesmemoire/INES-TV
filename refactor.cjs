const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace relative imports with absolute ones
code = code.replace(/from '\.\/components/g, "from '@/src/components");
code = code.replace(/from '\.\/types/g, "from '@/src/types");
code = code.replace(/from '\.\/utils/g, "from '@/src/utils");
code = code.replace(/from '\.\/context/g, "from '@/src/context");
code = code.replace(/from '\.\/services/g, "from '@/src/services");

// Change the exported name
code = code.replace(/export default function App\(\) {/, 'export default function HomeContent({ lang }: { lang: string }) {');

// Ensure 'use client' is at the top
if (!code.startsWith("'use client'")) {
    code = "'use client';\n" + code;
}

fs.mkdirSync('components/home', { recursive: true });
fs.writeFileSync('components/home/HomeContent.tsx', code);
console.log('Created components/home/HomeContent.tsx successfully');
