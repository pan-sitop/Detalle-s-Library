import os
import re

def fix_glows(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content

    # Remove self-closing div with blur and absolute
    content = re.sub(r'<div\s+className="absolute[^>]*blur-\[\d+px\][^>]*/>', '', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Removed glows in {filepath}")

for root, dirs, files in os.walk(r"c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src"):
    for file in files:
        if file.endswith('.jsx'):
            fix_glows(os.path.join(root, file))
