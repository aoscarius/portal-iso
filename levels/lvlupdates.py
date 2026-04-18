import os
import json
import re

files = [f"levels/{name}" for name in os.listdir('.') if name.endswith('.js')]

def extract_lvln(file):
    num = re.findall(r'\d+', file)
    return int(num[0]) if num else 0

files.sort(key=extract_lvln)

lvls_manifest = {
  "description": "Portal ISO - Levels Manifest",
  "comment": "List of level files here in play order. Each file populates LEVELS and DIALOGUE_SCRIPTS arrays.",
  "files": files
}

open('levels.json','w', encoding='utf-8').write(json.dumps(lvls_manifest, indent=2))

print(f"levels.json updated with {len(files)} levels")