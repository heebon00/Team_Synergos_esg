const fs = require('fs');

const filePath = 'C:\\Users\\PC\\.gemini\\antigravity-cli\\brain\\9e7af0cb-8b08-4e0c-b2af-2379b5239a8a\\.system_generated\\steps\\16\\output.txt';

if (!fs.existsSync(filePath)) {
  console.log('File not found:', filePath);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

let isReadingNodes = false;
const nodeLines = [];

for (let line of lines) {
  if (line.startsWith('NODES:')) {
    isReadingNodes = true;
    continue;
  }
  if (isReadingNodes) {
    nodeLines.push(line);
  }
}

console.log('--- Geometry / Layout Analysis ---');
for (let line of nodeLines) {
  if (!line.trim()) continue;
  
  const match = line.match(/^(\s*)/);
  const spaces = match ? match[1].length : 0;
  const level = spaces / 2;
  const displayIndent = '  '.repeat(level);
  
  // 노드 이름과 layout 및 dimensions, location 속성 파싱
  const nodeMatch = line.match(/\[([A-Z\-]+)\]\s*"([^"]*)"\s*#([^\s]+)/);
  if (nodeMatch) {
    const [, type, name, id] = nodeMatch;
    
    // 단순 문자열 매칭으로 width, height, x, y 정보 추출
    const wMatch = line.match(/"width":\s*([0-9\.]+)/);
    const hMatch = line.match(/"height":\s*([0-9\.]+)/);
    const xMatch = line.match(/"x":\s*([0-9\.-]+)/);
    const yMatch = line.match(/"y":\s*([0-9\.-]+)/);
    const modeMatch = line.match(/"mode":\s*"([^"]+)"/);
    
    let geom = '';
    if (wMatch && hMatch) {
      geom += ` size=[${wMatch[1]}x${hMatch[1]}]`;
    }
    if (xMatch && yMatch) {
      geom += ` loc=[${xMatch[1]}, ${yMatch[1]}]`;
    }
    if (modeMatch) {
      geom += ` flex-dir=[${modeMatch[1]}]`;
    }
    
    console.log(`${displayIndent}- [${type}] ${name} (#${id})${geom}`);
  }
}
