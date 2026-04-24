import fs from 'node:fs';
import path from 'node:path';

const serverDir = './server';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(serverDir).filter(f => f.endsWith('.ts'));

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Clean up mangled Express imports
  content = content.replace(/import pkgexpress from 'express';\r?\nconst pkg = pkgexpress;;\r?\nconst \{ (.*) \} = pkg;;/g, "import express, { $1 } from 'express';");
  content = content.replace(/import pkg, \{ (.*) \} from 'express';\r?\nconst \{ Router \} = pkg;/g, "import express, { Router, $1 } from 'express';");
  
  // 2. Fix invalid JWT import
  content = content.replace(/import pkgjsonwebtoken from 'jsonwebtoken';\r?\nconst pkg = pkgjsonwebtoken;;\r?\nconst jwt = pkg;/g, "import jwt from 'jsonwebtoken';");
  content = content.replace(/import pkg = pkgjsonwebtoken;;/g, "");
  
  // 3. Fix otplib (Standard way)
  if (content.includes('otplib')) {
     content = content.replace(/import pkgotplib from 'otplib';/g, "import { authenticator } from 'otplib';");
     content = content.replace(/const \{ authenticator \} = otplib;/g, "");
  }

  // 4. Ensure local imports have .js
  content = content.replace(/import (.*) from '\.\/(.*)(?<!\.js)'/g, "import $1 from './$2.js'");
  content = content.replace(/import (.*) from '\.\.\/(.*)(?<!\.js)'/g, "import $1 from '../$2.js'");

  if (content !== original) {
    console.log(`[Fixed] ${filePath}`);
    fs.writeFileSync(filePath, content);
  }
});

console.log('Cleanup complete.');
