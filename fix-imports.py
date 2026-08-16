#!/usr/bin/env python3

import os
from pathlib import Path

persistence_dir = Path("backend/infrastructure/persistence/src/main/java/global/oei/infrastructure/persistence")

def fix_imports(java_file):
    with open(java_file, 'r') as f:
        content = f.read()

    lines = content.split('\n')
    package_line = ""
    imports = []
    code_start_idx = 0

    # Extract package and imports
    for i, line in enumerate(lines):
        if line.startswith('package '):
            package_line = line
        elif line.startswith('import '):
            imports.append(line)
        elif line.strip() == '' and i < len(lines) - 1:
            continue
        elif line.strip() != '' and not line.startswith('package') and not line.startswith('import'):
            code_start_idx = i
            break

    # Group imports by type
    java_imports = sorted([l for l in imports if l.startswith('import java.')])
    jakarta_imports = sorted([l for l in imports if l.startswith('import jakarta.')])
    javax_imports = sorted([l for l in imports if l.startswith('import javax.')])
    spring_imports = sorted([l for l in imports if l.startswith('import org.springframework')])
    other_imports = sorted([l for l in imports if not any(l.startswith(f'import {p}.') for p in ['java', 'jakarta', 'javax', 'org.springframework'])])

    # Build new import section
    new_imports = []
    groups = [java_imports, jakarta_imports, javax_imports, spring_imports, other_imports]
    for group in groups:
        if group:
            new_imports.extend(group)
            new_imports.append('')

    # Remove trailing blank line
    while new_imports and new_imports[-1] == '':
        new_imports.pop()

    # Get code section
    code_lines = lines[code_start_idx:]
    while code_lines and code_lines[0].strip() == '':
        code_lines.pop(0)

    # Reconstruct file
    result = package_line + '\n\n' + '\n'.join(new_imports) + '\n\n' + '\n'.join(code_lines)

    with open(java_file, 'w') as f:
        f.write(result)

    return True

fixed_count = 0
for java_file in persistence_dir.rglob("*.java"):
    try:
        fix_imports(java_file)
        fixed_count += 1
        print(f"✓ {java_file.relative_to('backend')}")
    except Exception as e:
        print(f"✗ {java_file.relative_to('backend')}: {e}")

print(f"\nFixed {fixed_count} files")

