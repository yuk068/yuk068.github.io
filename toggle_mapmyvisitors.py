#!/usr/bin/env python3
"""
Toggle the mapmyvisitors-container section in all HTML files.
Detects current state, prompts Y/N, then comments out or uncomments.
"""

import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))

# Matches the block when active (not commented)
ACTIVE_PATTERN = re.compile(
    r'([ \t]*<div class="mapmyvisitors-container".*?</div>[ \t]*)',
    re.DOTALL
)

# Matches the block when properly commented out as a single HTML comment
COMMENTED_PATTERN = re.compile(
    r'([ \t]*<!-- MAPMYVISITORS_START.*?MAPMYVISITORS_END -->[ \t]*)',
    re.DOTALL
)

# Matches the old broken format (separate marker comments, content not actually commented)
BROKEN_PATTERN = re.compile(
    r'([ \t]*<!--\s*MAPMYVISITORS_START\s*-->'
    r'.*?'
    r'<!--\s*MAPMYVISITORS_END\s*-->[ \t]*)',
    re.DOTALL
)


def find_html_files(root):
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip _site (generated output) to avoid double-processing
        dirnames[:] = [d for d in dirnames if d not in ('_site', 'node_modules', '.git')]
        for fname in filenames:
            if fname.endswith('.html'):
                yield os.path.join(dirpath, fname)


def detect_state(content):
    """Return 'active', 'commented', 'broken', or 'absent'."""
    if COMMENTED_PATTERN.search(content):
        return 'commented'
    if BROKEN_PATTERN.search(content):
        return 'broken'
    if ACTIVE_PATTERN.search(content):
        return 'active'
    return 'absent'


def comment_out(content):
    # First fix any broken format before commenting out
    content = fix_broken(content)
    def replacer(m):
        inner = m.group(1)
        return f'<!-- MAPMYVISITORS_START{inner}MAPMYVISITORS_END -->'
    return ACTIVE_PATTERN.sub(replacer, content)


def uncomment(content):
    def replacer(m):
        block = m.group(1)
        # Remove the outer comment wrapper, preserve indented inner content
        inner = re.sub(r'^[ \t]*<!-- MAPMYVISITORS_START', '', block)
        inner = re.sub(r'MAPMYVISITORS_END -->[ \t]*$', '', inner)
        return inner
    return COMMENTED_PATTERN.sub(replacer, content)


def fix_broken(content):
    """Convert old broken marker format into plain active block."""
    def replacer(m):
        block = m.group(1)
        inner = re.sub(r'^[ \t]*<!--\s*MAPMYVISITORS_START\s*-->', '', block)
        inner = re.sub(r'<!--\s*MAPMYVISITORS_END\s*-->[ \t]*$', '', inner)
        return inner
    return BROKEN_PATTERN.sub(replacer, content)


def main():
    files = list(find_html_files(ROOT))

    active_files = []
    commented_files = []
    broken_files = []
    absent_files = []

    for path in files:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        state = detect_state(content)
        if state == 'active':
            active_files.append(path)
        elif state == 'commented':
            commented_files.append(path)
        elif state == 'broken':
            broken_files.append(path)
        else:
            absent_files.append(path)

    # Treat broken (old marker format, content still visible) as active
    all_active = active_files + broken_files

    print("=" * 60)
    print(f"  Active   (visible):     {len(active_files)} file(s)")
    print(f"  Broken markers (visible): {len(broken_files)} file(s)  <- will be fixed")
    print(f"  Commented (hidden):     {len(commented_files)} file(s)")
    print(f"  Absent (no block):      {len(absent_files)} file(s)")
    print("=" * 60)

    if not all_active and not commented_files:
        print("No mapmyvisitors blocks found in any HTML file. Nothing to do.")
        return

    # Determine the dominant current state for the prompt
    if all_active and not commented_files:
        current_state = 'active'
        action_desc = f"Comment OUT (hide) the block in {len(all_active)} file(s)"
    elif commented_files and not all_active:
        current_state = 'commented'
        action_desc = f"Uncomment (show) the block in {len(commented_files)} file(s)"
    else:
        # Mixed state — show both options
        print("\nMixed state detected:")
        print(f"  {len(all_active)} file(s) have a visible block.")
        print(f"  {len(commented_files)} file(s) have a commented block.")
        print("\nChoose action:")
        print("  1) Comment OUT all visible blocks")
        print("  2) Uncomment all commented blocks")
        print("  3) Cancel")
        choice = input("Enter 1, 2, or 3: ").strip()
        if choice == '1':
            current_state = 'active'
            action_desc = f"Comment OUT {len(all_active)} file(s)"
        elif choice == '2':
            current_state = 'commented'
            action_desc = f"Uncomment {len(commented_files)} file(s)"
        else:
            print("Cancelled.")
            return

    print(f"\nAction: {action_desc}")
    confirm = input("Proceed? [Y/N]: ").strip().lower()
    if confirm != 'y':
        print("Cancelled.")
        return

    target_files = all_active if current_state == 'active' else commented_files
    transform = comment_out if current_state == 'active' else uncomment

    changed = 0
    for path in target_files:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content = transform(content)
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            rel = os.path.relpath(path, ROOT)
            print(f"  Updated: {rel}")
            changed += 1

    print(f"\nDone. {changed} file(s) updated.")


if __name__ == '__main__':
    main()
