import sys
import json
import re
import os

def check_content(content, filepath):
    filepath_normalized = filepath.replace("\\", "/")
    # tokens.css, hooks.json, check_token_compliance.py 등은 검사 제외
    if "tokens.css" in filepath_normalized or filepath_normalized.endswith(".py") or filepath_normalized.endswith(".json") or filepath_normalized.endswith(".md"):
        return None

    # 검사할 패턴들
    # 1. Arbitrary Tailwind: w-[...], bg-[...] 등 클래스에서 대괄호 쓰는 것
    arbitrary_pattern = re.compile(r'-\[[^\]]+\]')
    
    # 2. px 단위 (단, 숫자가 포함된 px)
    px_pattern = re.compile(r'\b\d+px\b')
    
    # 3. rgb/hsl 색상
    rgb_hsl_pattern = re.compile(r'\b(rgba?|hsla?)\([^\)]*\)', re.IGNORECASE)
    
    # 4. Hex Color
    hex_pattern = re.compile(r'#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b')

    lines = content.split('\n')
    for line_idx, line in enumerate(lines, 1):
        # Arbitrary Tailwind 검사
        if arbitrary_pattern.search(line):
            return f"Line {line_idx}: Arbitrary Tailwind value found: '{line.strip()}'"
            
        # px 단위 검사 (단, id 나 href, 혹은 SVG의 viewBox 등 특수 속성은 예외 처리 가능)
        # 단, 단순 픽셀 단위 검사 시, SVG stroke-width 등에서 px가 사용될 수 있으므로
        # px 검사 시 line에 class= 나 style= 이 포함되거나 CSS 파일인 경우에 한하여 엄격히 검사
        if px_pattern.search(line):
            is_css = filepath_normalized.endswith(".css")
            has_style_indicator = any(x in line for x in ["class=", "style=", "<style", "class :", "style :"])
            if is_css or has_style_indicator:
                return f"Line {line_idx}: Raw pixel unit (px) found: '{line.strip()}'"
            
        # rgb/hsl 검사
        if rgb_hsl_pattern.search(line):
            return f"Line {line_idx}: Raw rgb/hsl color found: '{line.strip()}'"
            
        # Hex Color 검사 (앵커 및 ID 참조 제외)
        for match in hex_pattern.finditer(line):
            hex_val = match.group(0)
            start_idx = match.start()
            
            # 매치 이전 문자열을 확인하여 HTML 앵커나 ID, url(#...) 인지 검사
            context_before = line[max(0, start_idx - 15):start_idx].lower()
            if any(x in context_before for x in ['href="', "href='", 'id="', "id='", 'url(', 'href=#', 'xlink:href="', 'target="']):
                continue
            
            # 단순 ID 선택자나 앵커가 주석 또는 텍스트에 있는 경우도 필터링
            # 주로 CSS나 인라인 스타일, 클래스 내부의 hex만 필터링하도록 범위 좁히기
            is_css = filepath_normalized.endswith(".css")
            has_style_indicator = any(x in line for x in ["class=", "style=", "<style", "color:", "background:", "border:", "fill:", "stroke:"])
            if is_css or has_style_indicator:
                return f"Line {line_idx}: Raw hex color found: '{hex_val}' in line '{line.strip()}'"
            
    return None

def main():
    try:
        # stdin으로 JSON 데이터 읽기
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"decision": "allow"}))
            return
            
        payload = json.loads(input_data)
        tool_call = payload.get("toolCall", {})
        tool_name = tool_call.get("name")
        args = tool_call.get("args", {})
        
        # 검사 대상 파일 및 내용 추출
        target_file = args.get("TargetFile", "")
        if not target_file:
            print(json.dumps({"decision": "allow"}))
            return

        content_to_check = ""
        if tool_name == "write_to_file":
            content_to_check = args.get("CodeContent", "")
        elif tool_name == "replace_file_content":
            content_to_check = args.get("ReplacementContent", "")
        elif tool_name == "multi_replace_file_content":
            chunks = args.get("ReplacementChunks", [])
            content_to_check = "\n".join([chunk.get("ReplacementContent", "") for chunk in chunks])
            
        if not content_to_check:
            print(json.dumps({"decision": "allow"}))
            return
            
        # 검사 수행
        error_message = check_content(content_to_check, target_file)
        if error_message:
            print(json.dumps({
                "decision": "deny",
                "reason": f"Design System Token Compliance Violation: {error_message}"
            }))
        else:
            print(json.dumps({"decision": "allow"}))
            
    except Exception as e:
        # 에러 발생 시 진행을 방해하지 않기 위해 허용하거나 로그 출력
        print(json.dumps({
            "decision": "allow", 
            "reason": f"Hook error: {str(e)}"
        }))

if __name__ == "__main__":
    main()
