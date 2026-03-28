const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('Building extension...');
require('child_process').execSync('npm run build', { stdio: 'inherit' });

const distDir = path.join(__dirname, '..', 'dist');
const releaseDir = path.join(__dirname, '..', 'release'); // release 디렉토리 경로 정의
const outputFile = path.join(releaseDir, 'wikidocs-exporter.zip');

// 1. release 디렉토리가 없으면 생성 (recursive 옵션으로 상위 폴더까지 안전하게 생성)
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

// 2. 기존 출력 파일이 있으면 삭제
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
