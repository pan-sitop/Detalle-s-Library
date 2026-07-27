import os
import re

def replace_in_file(filepath, pattern, replacement):
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content = re.sub(pattern, replacement, content)
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")

# 1. Admin files
admin_dir = r'c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src\pages\admin'
for file in os.listdir(admin_dir):
    if file.endswith('.jsx'):
        path = os.path.join(admin_dir, file)
        replace_in_file(path, r'font-display italic', 'font-serif font-bold')
        replace_in_file(path, r'font-display font-bold', 'font-serif font-bold')

# 2. AdminConsolaSQL
replace_in_file(r'c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src\pages\admin\AdminConsolaSQL.jsx', r'className="text-3xl font-bold', 'className="font-serif text-3xl font-bold')

# 3. Explorar.jsx
replace_in_file(r'c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src\pages\Explorar.jsx', r'className="text-4xl', 'className="font-serif text-4xl')

# 4. Proximamente.jsx
replace_in_file(r'c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src\pages\Proximamente.jsx', r'className="text-3xl font-bold', 'className="font-serif text-3xl font-bold')

# 5. ScrollMagicFeature.jsx
replace_in_file(r'c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src\components\ScrollMagicFeature.jsx', r'className="\s*bg-gradient-to-r from-purple-400 to-purple-600"', 'className="text-purple-400"')

print("Done")
