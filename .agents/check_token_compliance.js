const fs = require('fs');

function checkContent(content, filepath) {
    const filepathNormalized = filepath.replace(/\\/g, "/");
    // tokens.css, hooks.json, check_token_compliance 등은 검사 제외
    if (filepathNormalized.includes("tokens.css") || 
        filepathNormalized.endsWith(".py") || 
        filepathNormalized.endsWith(".js") || 
        filepathNormalized.endsWith(".json") || 
        filepathNormalized.endsWith(".md")) {
        return null;
    }

    const arbitraryPattern = /-\[[^\]]+\]/;
    const pxPattern = /\b\d+px\b/;
    const rgbHslPattern = /\b(rgba?|hsla?)\([^\)]*\)/i;
    const hexPattern = /#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;

    const lines = content.split('\n');
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        const lineNum = lineIdx + 1;

        if (line.includes("token-exempt")) {
            continue;
        }

        // 1. Arbitrary Tailwind
        if (arbitraryPattern.test(line)) {
            return `Line ${lineNum}: Arbitrary Tailwind value found: '${line.trim()}'`;
        }

        // 2. px unit check
        if (pxPattern.test(line)) {
            const isCss = filepathNormalized.endsWith(".css");
            const hasStyleIndicator = ["class=", "style=", "<style", "class :", "style :"].some(x => line.includes(x));
            if (isCss || hasStyleIndicator) {
                return `Line ${lineNum}: Raw pixel unit (px) found: '${line.trim()}'`;
            }
        }

        // 3. rgb/hsl color
        if (rgbHslPattern.test(line)) {
            return `Line ${lineNum}: Raw rgb/hsl color found: '${line.trim()}'`;
        }

        // 4. Hex Color check
        let match;
        hexPattern.lastIndex = 0;
        while ((match = hexPattern.exec(line)) !== null) {
            const hexVal = match[0];
            const startIdx = match.index;

            const contextBefore = line.substring(Math.max(0, startIdx - 15), startIdx).toLowerCase();
            const isAnchorOrId = ['href="', "href='", 'id="', "id='", 'url(', 'href=#', 'xlink:href="', 'target="'].some(x => contextBefore.includes(x));
            if (isAnchorOrId) {
                continue;
            }

            const isCss = filepathNormalized.endsWith(".css");
            const hasStyleIndicator = ["class=", "style=", "<style", "color:", "background:", "border:", "fill:", "stroke:"].some(x => line.includes(x));
            if (isCss || hasStyleIndicator) {
                return `Line ${lineNum}: Raw hex color found: '${hexVal}' in line '${line.trim()}'`;
            }
        }
    }
    return null;
}

function main() {
    try {
        // stdin에서 데이터 읽기
        const inputData = fs.readFileSync(0, 'utf-8');
        if (!inputData) {
            console.log(JSON.stringify({ decision: "allow" }));
            return;
        }

        const payload = JSON.parse(inputData);
        const toolCall = payload.toolCall || {};
        const toolName = toolCall.name;
        const args = toolCall.args || {};

        const targetFile = args.TargetFile || "";
        if (!targetFile) {
            console.log(JSON.stringify({ decision: "allow" }));
            return;
        }

        let contentToCheck = "";
        if (toolName === "write_to_file") {
            contentToCheck = args.CodeContent || "";
        } else if (toolName === "replace_file_content") {
            contentToCheck = args.ReplacementContent || "";
        } else if (toolName === "multi_replace_file_content") {
            const chunks = args.ReplacementChunks || [];
            contentToCheck = chunks.map(chunk => chunk.ReplacementContent || "").join("\n");
        }

        if (!contentToCheck) {
            console.log(JSON.stringify({ decision: "allow" }));
            return;
        }

        const errorMessage = checkContent(contentToCheck, targetFile);
        if (errorMessage) {
            console.log(JSON.stringify({
                decision: "deny",
                reason: `Design System Token Compliance Violation: ${errorMessage}`
            }));
        } else {
            console.log(JSON.stringify({ decision: "allow" }));
        }

    } catch (e) {
        console.log(JSON.stringify({
            decision: "allow",
            reason: `Hook error: ${e.message}`
        }));
    }
}

main();
