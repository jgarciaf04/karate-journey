"""
Generate player character sprite sheet for Karate Journey.
Extracts sprite poses from a reference sprite sheet image,
removes the background, scales to 48x48 frames.
Output: 336x48 sprite sheet (7 frames x 48px each).

Frame layout:
  0: IDLE
  1: WALK1  (stride pose - one leg forward)
  2: WALK2  (horizontally flipped stride - opposite leg forward)
  3: PUNCH (from FLYING PUNCH pose)
  4: KICK (from MID-AIR KICK pose)
  5: BLOCK (from PARRY pose)
  6: HURT (from LOW SWEEP pose)

Walk animation strategy:
  The source image only contains a single walk pose (mid-stride).
  WALK2 is created by horizontally flipping WALK1, which gives the
  appearance of the opposite leg being forward. When alternated,
  this produces a convincing two-frame walk cycle -- a classic
  technique used in retro pixel-art games.
"""
from PIL import Image, ImageFilter, ImageOps
import numpy as np
import os
import sys

# --- Configuration ---
SRC_PATH = r"c:\Users\3D_Modelling_Studio\Downloads\Gemini_Generated_Image_qke9zbqke9zbqke9.png"
OUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(OUT_DIR, "sprites", "player.png")

FRAME_W, FRAME_H = 48, 48
NUM_FRAMES = 7

# Approximate crop regions for each pose in the source image.
# Format: (name, x_start, x_end)
# The y range is auto-detected per sprite.
POSE_REGIONS = {
    "IDLE":          (140,  510),
    "WALK":          (700, 1150),   # Full walk cycle pose (single stride)
    "MID_AIR_KICK":  (1260, 1800),
    "PARRY":         (2060, 2490),
    "FLYING_PUNCH":  (2580, 3060),
    "LOW_SWEEP":     (3190, 3740),
    "VICTORY":       (3830, 4380),
}

# Background color (sampled from gap areas in source image)
BG_COLOR = np.array([143.0, 157.0, 165.0])

# Y range to search for sprite content (excludes header text and labels)
Y_MIN, Y_MAX = 210, 870


def load_source():
    """Load the source sprite sheet image."""
    img = Image.open(SRC_PATH).convert("RGBA")
    print(f"Source image: {img.size[0]}x{img.size[1]} {img.mode}")
    return np.array(img)


def make_char_mask(rgb):
    """
    Create a boolean mask identifying character pixels based on color.
    The character has: white gi, skin tones, red headband/belt, dark hair/outlines.
    The background is a blue-gray around RGB(143, 157, 165).
    """
    r = rgb[:, :, 0].astype(float)
    g = rgb[:, :, 1].astype(float)
    b = rgb[:, :, 2].astype(float)

    # Color distance from background
    bg_dist = np.sqrt((r - BG_COLOR[0])**2 + (g - BG_COLOR[1])**2 + (b - BG_COLOR[2])**2)

    # White gi: bright, relatively neutral
    white_gi = (r > 185) & (g > 175) & (b > 145)

    # Skin tone: warm, R dominant
    skin = (r > 145) & (b < 145) & ((r - b) > 20) & (bg_dist > 40)

    # Red (headband, belt): high R, low G and B
    red = (r > 110) & (g < 95) & (b < 95) & ((r - g) > 30)

    # Very dark (hair, outlines, pupils, shoes)
    very_dark = (r < 55) & (g < 55) & (b < 70)

    # Medium dark (shading, clothing folds) - must also be far from bg
    med_dark = (r < 95) & (g < 95) & (b < 105) & (bg_dist > 50)

    # Brown tones (hair highlights, shoe details)
    brown = (r > 75) & (r < 165) & (g > 35) & (g < 125) & (b < 105) & ((r - b) > 15) & (bg_dist > 40)

    # Combine all character color detections
    char_mask = white_gi | skin | red | very_dark | med_dark | brown

    # Also include anything very far from bg (catches edge cases)
    char_mask = char_mask | (bg_dist > 95)

    return char_mask


def extract_sprite(arr, x1, x2):
    """
    Extract a single sprite from the source image array.
    Returns an RGBA PIL Image with background removed and tightly cropped.
    """
    region = arr[Y_MIN:Y_MAX, x1:x2].copy()
    h, w = region.shape[:2]
    rgb = region[:, :, :3]

    # Build character mask
    char_mask = make_char_mask(rgb)

    # Find bounding box of character pixels
    row_has = char_mask.any(axis=1)
    col_has = char_mask.any(axis=0)
    rows = np.where(row_has)[0]
    cols = np.where(col_has)[0]

    if len(rows) == 0 or len(cols) == 0:
        print("  WARNING: No character pixels detected!")
        return Image.new("RGBA", (1, 1), (0, 0, 0, 0))

    r_min, r_max = rows[0], rows[-1]
    c_min, c_max = cols[0], cols[-1]

    # Crop to bounding box with small padding
    pad = 3
    r_min = max(0, r_min - pad)
    r_max = min(h - 1, r_max + pad)
    c_min = max(0, c_min - pad)
    c_max = min(w - 1, c_max + pad)

    cropped = region[r_min:r_max + 1, c_min:c_max + 1].copy()
    cropped_mask = char_mask[r_min:r_max + 1, c_min:c_max + 1]

    # Fill holes in the mask (internal bg-colored pixels within the sprite)
    from scipy import ndimage
    filled_mask = ndimage.binary_fill_holes(cropped_mask)

    # Slight dilation to catch anti-aliased edge pixels
    struct = ndimage.generate_binary_structure(2, 2)
    dilated = ndimage.binary_dilation(cropped_mask, structure=struct, iterations=1)

    # Include dilated pixels only if they are somewhat different from bg
    cropped_rgb = cropped[:, :, :3].astype(float)
    cropped_dist = np.sqrt(((cropped_rgb - BG_COLOR) ** 2).sum(axis=2))
    final_mask = filled_mask | (dilated & (cropped_dist > 35))

    # Set alpha channel
    result = cropped.copy()
    result[:, :, 3] = np.where(final_mask, 255, 0).astype(np.uint8)

    return Image.fromarray(result)


def scale_to_frame(sprite_img, frame_w=FRAME_W, frame_h=FRAME_H):
    """
    Scale sprite to fit within frame, preserving aspect ratio.
    Sprite is centered horizontally and aligned to the bottom of the frame.
    Uses LANCZOS for quality downscaling.
    """
    bbox = sprite_img.getbbox()
    if bbox is None:
        return Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))

    trimmed = sprite_img.crop(bbox)
    tw, th = trimmed.size

    # Scale to fit
    scale = min(frame_w / tw, frame_h / th)
    new_w = max(1, int(tw * scale))
    new_h = max(1, int(th * scale))

    # Use LANCZOS for smooth downscaling, then the pixelArt:true in Phaser
    # will keep it crisp when scaled up for display
    scaled = trimmed.resize((new_w, new_h), Image.LANCZOS)

    # Place in frame: center horizontally, align to bottom with 1px padding
    frame = Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))
    x_off = (frame_w - new_w) // 2
    y_off = frame_h - new_h - 1
    frame.paste(scaled, (x_off, y_off), scaled)

    return frame


def main():
    print("=== Karate Journey Player Sprite Generator ===\n")
    print("Loading source image...")
    arr = load_source()

    # Extract each needed pose
    poses = {}
    for name, (x1, x2) in POSE_REGIONS.items():
        print(f"Extracting {name} (x={x1}-{x2})...")
        sprite = extract_sprite(arr, x1, x2)
        bbox = sprite.getbbox()
        if bbox:
            bw, bh = bbox[2] - bbox[0], bbox[3] - bbox[1]
            print(f"  -> {bw}x{bh} pixels")
        poses[name] = sprite

    # Create WALK2 by horizontally flipping the WALK1 pose.
    # This gives the opposite leg/arm forward, producing a convincing
    # two-frame walk cycle when the frames alternate.
    walk1_sprite = poses["WALK"]
    walk2_sprite = ImageOps.mirror(walk1_sprite)
    print(f"  WALK2 created by mirroring WALK1")

    # Build the 7 frames in game order
    frame_assignments = [
        ("IDLE",         poses["IDLE"]),
        ("WALK1",        walk1_sprite),
        ("WALK2",        walk2_sprite),
        ("PUNCH",        poses["FLYING_PUNCH"]),
        ("KICK",         poses["MID_AIR_KICK"]),
        ("BLOCK",        poses["PARRY"]),
        ("HURT",         poses["LOW_SWEEP"]),
    ]

    print(f"\nScaling to {FRAME_W}x{FRAME_H} frames...")
    frames = []
    for name, sprite in frame_assignments:
        frame = scale_to_frame(sprite)
        frame_arr = np.array(frame)
        opaque = (frame_arr[:, :, 3] > 0).sum()
        total = FRAME_W * FRAME_H
        print(f"  Frame {len(frames)} ({name}): {opaque}/{total} opaque pixels ({opaque*100//total}%)")
        frames.append(frame)

    # Assemble sprite sheet
    sheet_w = NUM_FRAMES * FRAME_W
    sheet_h = FRAME_H
    print(f"\nAssembling sprite sheet ({sheet_w}x{sheet_h})...")
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        sheet.paste(frame, (i * FRAME_W, 0), frame)

    # Save
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    sheet.save(OUT_PATH)
    print(f"\nSaved to: {OUT_PATH}")
    print(f"Sheet size: {sheet_w}x{sheet_h}")

    # Debug output
    if '--debug' in sys.argv:
        dbg_dir = os.path.join(OUT_DIR, "sprites", "debug_frames")
        os.makedirs(dbg_dir, exist_ok=True)
        names = ["idle", "walk1", "walk2", "punch", "kick", "block", "hurt"]
        for i, name in enumerate(names):
            f = sheet.crop((i * FRAME_W, 0, (i + 1) * FRAME_W, FRAME_H))
            scaled = f.resize((FRAME_W * 8, FRAME_H * 8), Image.NEAREST)
            scaled.save(os.path.join(dbg_dir, f"{i}_{name}.png"))

            # Also save the raw extracted (pre-scale) sprite
            _, raw = frame_assignments[i]
            if raw.getbbox():
                raw.save(os.path.join(dbg_dir, f"{i}_{name}_raw.png"))
        print(f"Debug frames saved to {dbg_dir}")


if __name__ == "__main__":
    main()
