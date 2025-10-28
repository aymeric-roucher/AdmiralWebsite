#!/usr/bin/env python3
"""
Trim top and bottom lines from ASCII animation frames.
Removes the top N and bottom N lines from each frame.
"""

import json
import sys

def trim_frame(frame_text, top_lines=20, bottom_lines=20):
    """Remove top and bottom lines from a frame."""
    lines = frame_text.split('\n')

    # If frame has fewer lines than we want to trim, return empty or minimal
    total_trim = top_lines + bottom_lines
    if len(lines) <= total_trim:
        return ""

    # Trim top and bottom
    trimmed_lines = lines[top_lines:-bottom_lines] if bottom_lines > 0 else lines[top_lines:]

    return '\n'.join(trimmed_lines)

def main():
    input_file = 'animation_2.json'
    output_file = 'animation_3.json'
    top_trim = 25
    bottom_trim = 20

    # Load input animation
    print(f"Loading {input_file}...")
    with open(input_file, 'r') as f:
        data = json.load(f)

    original_frame_count = len(data['frames'])
    print(f"Original frames: {original_frame_count}")

    # Show sample of first frame before trimming
    if data['frames']:
        first_frame_lines = data['frames'][0].split('\n')
        print(f"First frame has {len(first_frame_lines)} lines")

    # Trim all frames
    print(f"Trimming top {top_trim} and bottom {bottom_trim} lines from each frame...")
    trimmed_frames = []
    for i, frame in enumerate(data['frames']):
        trimmed = trim_frame(frame, top_trim, bottom_trim)
        trimmed_frames.append(trimmed)

        if i == 0:
            trimmed_lines = trimmed.split('\n')
            print(f"First frame after trimming: {len(trimmed_lines)} lines")

    # Update data
    data['frames'] = trimmed_frames

    # Save output
    print(f"Saving to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✓ Done! Trimmed animation saved to {output_file}")
    print(f"  Frames: {len(trimmed_frames)}")

if __name__ == '__main__':
    main()
