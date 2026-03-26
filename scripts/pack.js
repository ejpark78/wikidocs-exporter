const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('Building extension...');
require('child_process').execSync('npm run build', { stdio: 'inherit' });

const distDir = path.join(__dirname, '..', 'dist');
const outputFile = path.join(__dirname, '..', 'wikidocs-exporter.zip');

if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
}

const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`\nPackage created: ${outputFile} (${(archive.pointer() / 1024).toFixed(1)} KB)`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(distDir, false);
archive.finalize();
