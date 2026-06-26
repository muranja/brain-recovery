#!/usr/bin/env python3
import os
import re
import glob

SITE_ROOT = "/home/vin/brain-recovery/site"

def get_depth_prefix(filepath):
    rel = os.path.relpath(filepath, SITE_ROOT)
    depth = len(rel.split(os.sep)) - 1
    if depth == 0:
        return ""
    elif depth == 1:
        return "../"
    elif depth == 2:
        return "../../"
    elif depth == 3:
        return "../../../"
    else:
        return "../" * depth

def update_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    original = content

    prefix = get_depth_prefix(filepath)
    changed = False

    # --- Add Terms link after Sponsor link if Sponsor exists but Terms link doesn't follow ---
    sponsor_re = r'(<a\s+href="https://github\.com/sponsors/muranja">Sponsor</a>)'
    terms_link_tag = '<a href="{}terms.html">Terms</a>'.format(prefix)

    if re.search(sponsor_re, content):
        # Only add Terms if the specific Terms link tag doesn't already follow nearby
        # Check within 300 chars after each Sponsor occurrence
        def add_terms(match):
            after = match.string[match.end():match.end()+300]
            if terms_link_tag in after:
                return match.group(1)
            return match.group(1) + ' &middot;\n    ' + terms_link_tag

        new_content = re.sub(sponsor_re, add_terms, content)
        if new_content != content:
            content = new_content
            changed = True

    # --- Add copyright/CC line before </footer> if not already present ---
    cc_line = '  <p style="margin-top:0.5rem;font-size:0.8rem;color:var(--neutral-500);">&copy; 2026 muranja. Licensed under <a href="{}terms.html" style="color:var(--neutral-500);">CC BY-NC-SA 4.0</a>.</p>'.format(prefix)

    # Check for existing CC line more precisely
    cc_pattern = r'&copy;\s*2026\s*muranja\.\s*Licensed\s*under.*CC BY-NC-SA 4\.0'
    if not re.search(cc_pattern, content):
        last_footer = content.rfind('</footer>')
        if last_footer != -1:
            content = content[:last_footer] + cc_line + '\n' + content[last_footer:]
            changed = True

    if changed:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False

def main():
    files = sorted(glob.glob(os.path.join(SITE_ROOT, "**/*.html"), recursive=True))
    updated = 0
    skipped = 0
    no_footer = 0
    for filepath in files:
        if '</footer>' not in open(filepath, encoding='utf-8').read():
            no_footer += 1
            continue
        if update_file(filepath):
            updated += 1
        else:
            skipped += 1
    print(f"Updated: {updated}, Already correct: {skipped}, No footer tag: {no_footer}")

if __name__ == "__main__":
    main()
