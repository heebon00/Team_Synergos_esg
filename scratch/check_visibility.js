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

console.log('--- Visibility and Opacity Check ---');
for (let line of nodeLines) {
  if (!line.trim()) continue;
  
  const match = line.match(/^(\s*)/);
  const spaces = match ? match[1].length : 0;
  const level = spaces / 2;
  const displayIndent = '  '.repeat(level);
  
  const nodeMatch = line.match(/\[([A-Z\-]+)\]\s*"([^"]*)"\s*#([^\s]+)/);
  if (nodeMatch) {
    const [, type, name, id] = nodeMatch;
    
    // visible 속성이나 opacity 속성이 있는지 확인
    const visibleMatch = line.match(/"visible":\s*(false|true)/);
    const opacityMatch = line.match(/"opacity":\s*([0-9\.]+)/);
    
    let info = '';
    if (visibleMatch) {
      info += ` visible=${visibleMatch[1]}`;
    }
    if (opacityMatch) {
      info += ` opacity=${opacityMatch[1]}`;
    }
    
    // 만약 visible=false 이거나 opacity가 0이면 숨김 노드
    if (visibleMatch && visibleMatch[1] === 'false') {
      info += ' ⚠️ [HIDDEN NODE]';
    }
    
    if (info) {
      console.log(`${displayIndent}- [${type}] ${name} (#${id})${info}`);
    }
  }
}
