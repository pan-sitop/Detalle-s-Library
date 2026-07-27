import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Branding replacements
    content = re.sub(r'libraris', "Detalle's Library", content, flags=re.IGNORECASE)
    content = re.sub(r'Library Management System', "Detalle's Library", content, flags=re.IGNORECASE)
    content = re.sub(r'Libris', "Detalle's Library", content)

    # 2. Design cleanups (remove glows and gradients)
    content = re.sub(r'<div className="absolute[^>]*bg-purple-\d+/\d+\s+rounded-full\s+blur-\[\d+px\][^>]*></div>', '', content)
    content = re.sub(r'<div className="absolute[^>]*bg-purple-\d+/\d+\s+rounded-full\s+blur-\[\d+px\][^>]*>\s*</div>', '', content)
    content = re.sub(r'bg-gradient-to-r from-purple-\d+ via-purple-\d+ to-purple-\d+', '', content)
    content = re.sub(r'text-transparent bg-clip-text', '', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

src_dir = r"c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src"
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.jsx', '.js', '.html', '.css')):
            process_file(os.path.join(root, file))

process_file(r"c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\index.html")

print("Done.")
