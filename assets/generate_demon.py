"""
Generate demon enemy sprite sheet for Karate Journey.
Same frame layout as the player (7 frames x 48px each = 336x48).

Frame layout:
  0: IDLE
  1: WALK1  (stride pose)
  2: WALK2  (horizontally flipped stride)
  3: PUNCH  (from FLYING PUNCH pose)
  4: KICK   (from MID-AIR KICK pose)
  5: BLOCK  (from PARRY pose)
  6: HURT   (from LOW SWEEP pose)
"""
from PIL import Image, ImageFilter, ImageOps
import numpy as np
import os
import sys

# --- Configuration ---
SRC_PATH = r"C:\Users\jgarc\Downloads\deamon-badguy.png"
OUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_PATH = os.path.join(OUT_DIR, "sprites", "enemy-oni.png")

FRAME_W, FRAME_H = 48, 48
NUM_FRAMES = 7

# Approximate crop regions for each pose in the source image (4480x960).
# Format: (x_start, x_end)
POSE_REGIONS = {
    "IDLE":          (50,  480),
    "WALK":          (520, 1050),
    "MID_AIR_KICK":  (1050, 1750),
    "PARRY":         (1780, 2300),
    "FLYING_PUNCH":  (2320, 2850),
    "LOW_SWEEP":     (2880, 3450),
    "VICTORY":       (3480, 4050),
}

# Y range to search for sprite content (excludes header text and labels)
Y_MIN, Y_MAX = 170, 810


def load_source():
    img = Image.open(SRC_PATH).convert("RGBA")
    print(f"Source image: {img.size[0]}x{img.size[1]} {img.mode}")
    return np.array(img)


def detect_bg_color(arr):
    """Sample background color from corners of the image."""
    corners = [
        arr[Y_MIN+10:Y_MIN+30, 10:30, :3],
        arr[Y_MIN+10:Y_MIN+30, -30:-10, :3],
    ]
    samples = np.concatenate([c.reshape(-1, 3) for c in corners])
    bg = np.median(samples, axis=0)
    print(f"Detected background color: RGB({bg[0]:.0f}, {bg[1]:.0f}, {bg[2]:.0f})")
    return bg


def make_char_mask(rgb, bg_color):
    """
    Simple approach: background is any neutral (low saturation) pixel
    that isn't very dark. Character pixels are dark OR colorful.
    """
    r = rgb[:, :, 0].astype(float)
    g = rgb[:, :, 1].astype(float)
    b = rgb[:, :, 2].astype(float)

    chan_max = np.maximum(np.maximum(r, g), b)
    chan_min = np.minimum(np.minimum(r, g), b)
    chan_spread = chan_max - chan_min

    # Background = neutral (low spread) AND not very dark
    # Grid lines ~(140,153,162), grid cells ~(180-240,180-240,180-240)
    # Character dark gi ~(30-80), skin/purple have high spread
    is_background = (chan_min > 100) & (chan_spread < 40)

    char_mask = ~is_background
    return char_mask


def extract_sprite(arr, x1, x2, bg_color):
    region = arr[Y_MIN:Y_MAX, x1:x2].copy()
    h, w = region.shape[:2]
    rgb = region[:, :, :3]

    char_mask = make_char_mask(rgb, bg_color)

    # Find bounding box
    row_has = char_mask.any(axis=1)
    col_has = char_mask.any(axis=0)
    rows = np.where(row_has)[0]
    cols = np.where(col_has)[0]

    if len(rows) == 0 or len(cols) == 0:
        print("  WARNING: No character pixels detected!")
        return Image.new("RGBA", (1, 1), (0, 0, 0, 0))

    r_min, r_max = rows[0], rows[-1]
    c_min, c_max = cols[0], cols[-1]

    pad = 3
    r_min = max(0, r_min - pad)
    r_max = min(h - 1, r_max + pad)
    c_min = max(0, c_min - pad)
    c_max = min(w - 1, c_max + pad)

    cropped = region[r_min:r_max + 1, c_min:c_max + 1].copy()
    cropped_mask = char_mask[r_min:r_max + 1, c_min:c_max + 1]

    from scipy import ndimage

    # Only fill small interior holes (e.g. single-pixel gaps inside the sprite)
    labeled, num_features = ndimage.label(~cropped_mask)
    final_mask = cropped_mask.copy()
    for label_id in range(1, num_features + 1):
        hole = labeled == label_id
        # Only fill tiny holes that don't touch edges
        if hole.sum() < 50:
            if not (hole[0, :].any() or hole[-1, :].any() or hole[:, 0].any() or hole[:, -1].any()):
                final_mask[hole] = True

    result = cropped.copy()
    result[:, :, 3] = np.where(final_mask, 255, 0).astype(np.uint8)

    return Image.fromarray(result)


def scale_to_frame(sprite_img, frame_w=FRAME_W, frame_h=FRAME_H):
    bbox = sprite_img.getbbox()
    if bbox is None:
        return Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))

    trimmed = sprite_img.crop(bbox)
    tw, th = trimmed.size

    scale = min(frame_w / tw, frame_h / th)
    new_w = max(1, int(tw * scale))
    new_h = max(1, int(th * scale))

    scaled = trimmed.resize((new_w, new_h), Image.LANCZOS)

    frame = Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))
    x_off = (frame_w - new_w) // 2
    y_off = frame_h - new_h - 1
    frame.paste(scaled, (x_off, y_off), scaled)

    return frame


def main():
    print("=== Karate Journey Demon Sprite Generator ===\n")
    print("Loading source image...")
    arr = load_source()

    bg_color = detect_bg_color(arr)

    poses = {}
    for name, (x1, x2) in POSE_REGIONS.items():
        print(f"Extracting {name} (x={x1}-{x2})...")
        sprite = extract_sprite(arr, x1, x2, bg_color)
        bbox = sprite.getbbox()
        if bbox:
            bw, bh = bbox[2] - bbox[0], bbox[3] - bbox[1]
            print(f"  -> {bw}x{bh} pixels")
        poses[name] = sprite

    walk1_sprite = poses["WALK"]
    walk2_sprite = ImageOps.mirror(walk1_sprite)
    print("  WALK2 created by mirroring WALK1")

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

    sheet_w = NUM_FRAMES * FRAME_W
    sheet_h = FRAME_H
    print(f"\nAssembling sprite sheet ({sheet_w}x{sheet_h})...")
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        sheet.paste(frame, (i * FRAME_W, 0), frame)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

    # Backup old oni sprite if it exists
    if os.path.exists(OUT_PATH):
        bak = OUT_PATH + ".bak"
        if os.path.exists(bak):
            os.remove(bak)
        os.rename(OUT_PATH, bak)
        print(f"Backed up old sprite to {bak}")

    sheet.save(OUT_PATH)
    print(f"\nSaved to: {OUT_PATH}")
    print(f"Sheet size: {sheet_w}x{sheet_h}")

    # Debug output
    if '--debug' in sys.argv:
        dbg_dir = os.path.join(OUT_DIR, "sprites", "debug_demon")
        os.makedirs(dbg_dir, exist_ok=True)
        names = ["idle", "walk1", "walk2", "punch", "kick", "block", "hurt"]
        for i, name in enumerate(names):
            f = sheet.crop((i * FRAME_W, 0, (i + 1) * FRAME_W, FRAME_H))
            scaled = f.resize((FRAME_W * 8, FRAME_H * 8), Image.NEAREST)
            scaled.save(os.path.join(dbg_dir, f"{i}_{name}.png"))

            _, raw = frame_assignments[i]
            if raw.getbbox():
                raw.save(os.path.join(dbg_dir, f"{i}_{name}_raw.png"))
        print(f"Debug frames saved to {dbg_dir}")


if __name__ == "__main__":
    main()
