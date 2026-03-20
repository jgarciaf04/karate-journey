"""
Generate player character sprite sheet for Karate Journey.
Karate Champ NES aesthetic: white gi, thin dark hair, red headband, barefoot.
7 frames of 32x48: idle, walk1, walk2, punch, kick, block, hurt.

Uses dark outline around entire character silhouette so white limbs
are visible against any background. This is standard NES sprite technique.
"""
from PIL import Image
import os

FRAME_W, FRAME_H = 32, 48
NUM_FRAMES = 7

T = (0, 0, 0, 0)
W = (255, 255, 255, 255)
S = (222, 184, 135, 255)
D = (26, 26, 46, 255)
R = (204, 34, 34, 255)
OUTLINE = (20, 20, 40, 255)  # slightly lighter than D for outline


def make():
    return Image.new('RGBA', (FRAME_W, FRAME_H), T)

def px(img, x, y, c):
    if 0 <= x < FRAME_W and 0 <= y < FRAME_H:
        img.putpixel((x, y), c)

def fill(img, x1, y1, x2, y2, c):
    for y in range(min(y1,y2), max(y1,y2)+1):
        for x in range(min(x1,x2), max(x1,x2)+1):
            px(img, x, y, c)

def hline(img, x1, x2, y, c):
    for x in range(min(x1,x2), max(x1,x2)+1):
        px(img, x, y, c)


def add_outline(img):
    """Add 1px dark outline around all non-transparent pixels."""
    result = img.copy()
    pixels = img.load()
    out_pixels = result.load()

    for y in range(FRAME_H):
        for x in range(FRAME_W):
            if pixels[x, y][3] == 0:  # transparent pixel
                # Check if any neighbor is non-transparent
                for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
                    nx, ny = x+dx, y+dy
                    if 0 <= nx < FRAME_W and 0 <= ny < FRAME_H:
                        if pixels[nx, ny][3] > 0:
                            out_pixels[x, y] = OUTLINE
                            break
    return result


def draw_head(img, cx, top, hurt=False):
    hline(img, cx-2, cx+2, top, D)
    hline(img, cx-3, cx+3, top+1, S)
    hline(img, cx-3, cx+4, top+2, R)
    hline(img, cx-4, cx+4, top+3, S)
    hline(img, cx-4, cx+4, top+4, S)
    if hurt:
        px(img, cx-3, top+4, D); px(img, cx-1, top+4, D)
        px(img, cx+1, top+4, D); px(img, cx+3, top+4, D)
    else:
        px(img, cx-2, top+4, D); px(img, cx+2, top+4, D)
    hline(img, cx-4, cx+4, top+5, S)
    if hurt: px(img, cx, top+5, D)
    hline(img, cx-3, cx+3, top+6, S)
    hline(img, cx-2, cx+2, top+7, S)
    hline(img, cx-1, cx+1, top+8, S)
    return top + 9


def draw_torso(img, cx, sy):
    fill(img, cx-6, sy, cx+6, sy+1, W)
    px(img, cx, sy+1, S)
    fill(img, cx-5, sy+2, cx+5, sy+2, W)
    px(img, cx-1, sy+2, S); px(img, cx+1, sy+2, S)
    fill(img, cx-5, sy+3, cx+5, sy+4, W)
    hline(img, cx-5, cx+5, sy+5, D)
    fill(img, cx-5, sy+6, cx+5, sy+8, W)
    return sy + 9


# ============================================================
# FRAME 0: IDLE
# ============================================================
def frame_idle():
    img = make()
    cx = 16
    sy = draw_head(img, cx, 2)
    ly = draw_torso(img, cx, sy)

    # Left arm: guard position (fist up near chest)
    fill(img, cx-9, sy, cx-7, sy+3, W)      # upper arm
    fill(img, cx-9, sy-2, cx-7, sy-1, W)     # forearm up
    fill(img, cx-9, sy-4, cx-7, sy-3, S)     # fist

    # Right arm: guard position
    fill(img, cx+7, sy, cx+9, sy+3, W)
    fill(img, cx+7, sy-2, cx+9, sy-1, W)
    fill(img, cx+7, sy-4, cx+9, sy-3, S)

    # Legs
    fill(img, cx-4, ly, cx-2, ly+7, W)
    fill(img, cx+2, ly, cx+4, ly+7, W)
    fill(img, cx-5, ly+8, cx-2, ly+9, S)
    fill(img, cx+2, ly+8, cx+5, ly+9, S)

    return add_outline(img)


# ============================================================
# FRAME 1: WALK1 - right foot forward, left arm forward
# ============================================================
def frame_walk1():
    img = make()
    cx = 16
    sy = draw_head(img, cx, 2)
    ly = draw_torso(img, cx, sy)

    # Left arm forward-up
    fill(img, cx-9, sy, cx-7, sy+1, W)
    fill(img, cx-11, sy-1, cx-9, sy, W)
    fill(img, cx-13, sy-2, cx-11, sy-1, W)
    fill(img, cx-14, sy-3, cx-13, sy-2, S)    # fist

    # Right arm back-down
    fill(img, cx+7, sy, cx+9, sy+1, W)
    fill(img, cx+7, sy+2, cx+9, sy+4, W)
    fill(img, cx+7, sy+5, cx+9, sy+6, S)      # fist

    # Right leg forward
    fill(img, cx+2, ly, cx+4, ly+1, W)
    fill(img, cx+3, ly+2, cx+5, ly+3, W)
    fill(img, cx+4, ly+4, cx+6, ly+5, W)
    fill(img, cx+5, ly+6, cx+7, ly+7, W)
    fill(img, cx+5, ly+8, cx+8, ly+9, S)

    # Left leg back
    fill(img, cx-4, ly, cx-2, ly+1, W)
    fill(img, cx-5, ly+2, cx-3, ly+3, W)
    fill(img, cx-6, ly+4, cx-4, ly+5, W)
    fill(img, cx-7, ly+6, cx-5, ly+7, W)
    fill(img, cx-8, ly+8, cx-5, ly+9, S)

    return add_outline(img)


# ============================================================
# FRAME 2: WALK2 - left foot forward, right arm forward
# ============================================================
def frame_walk2():
    img = make()
    cx = 16
    sy = draw_head(img, cx, 2)
    ly = draw_torso(img, cx, sy)

    # Right arm forward-up
    fill(img, cx+7, sy, cx+9, sy+1, W)
    fill(img, cx+9, sy-1, cx+11, sy, W)
    fill(img, cx+11, sy-2, cx+13, sy-1, W)
    fill(img, cx+13, sy-3, cx+14, sy-2, S)

    # Left arm back-down
    fill(img, cx-9, sy, cx-7, sy+1, W)
    fill(img, cx-9, sy+2, cx-7, sy+4, W)
    fill(img, cx-9, sy+5, cx-7, sy+6, S)

    # Left leg forward
    fill(img, cx-4, ly, cx-2, ly+1, W)
    fill(img, cx-5, ly+2, cx-3, ly+3, W)
    fill(img, cx-6, ly+4, cx-4, ly+5, W)
    fill(img, cx-7, ly+6, cx-5, ly+7, W)
    fill(img, cx-8, ly+8, cx-5, ly+9, S)

    # Right leg back
    fill(img, cx+2, ly, cx+4, ly+1, W)
    fill(img, cx+3, ly+2, cx+5, ly+3, W)
    fill(img, cx+4, ly+4, cx+6, ly+5, W)
    fill(img, cx+5, ly+6, cx+7, ly+7, W)
    fill(img, cx+5, ly+8, cx+8, ly+9, S)

    return add_outline(img)


# ============================================================
# FRAME 3: PUNCH
# ============================================================
def frame_punch():
    img = make()
    cx = 10
    sy = draw_head(img, cx, 2)
    ly = draw_torso(img, cx, sy)

    # Left arm at side
    fill(img, cx-9, sy, cx-7, sy+4, W)
    fill(img, cx-9, sy+5, cx-7, sy+6, S)

    # Right arm: LONG PUNCH
    fill(img, cx+7, sy+1, cx+19, sy+2, W)     # arm bar
    fill(img, cx+19, sy, cx+21, sy+2, S)        # big fist

    # Legs
    fill(img, cx-4, ly, cx-2, ly+7, W)
    fill(img, cx+2, ly, cx+4, ly+7, W)
    fill(img, cx-5, ly+8, cx-2, ly+9, S)
    fill(img, cx+2, ly+8, cx+5, ly+9, S)

    return add_outline(img)


# ============================================================
# FRAME 4: KICK
# ============================================================
def frame_kick():
    img = make()
    cx = 9
    sy = draw_head(img, cx, 2)
    ly = draw_torso(img, cx, sy)

    # Arms up for balance
    fill(img, cx-9, sy, cx-7, sy+1, W)
    fill(img, cx-11, sy-2, cx-9, sy-1, W)
    fill(img, cx-12, sy-4, cx-11, sy-3, S)

    fill(img, cx+7, sy, cx+9, sy+1, W)
    fill(img, cx+9, sy-2, cx+11, sy-1, W)
    fill(img, cx+11, sy-4, cx+12, sy-3, S)

    # Left leg standing
    fill(img, cx-4, ly, cx-2, ly+7, W)
    fill(img, cx-5, ly+8, cx-2, ly+9, S)

    # Right leg kicking horizontally (3px thick)
    fill(img, cx+2, ly, cx+7, ly+2, W)       # thigh
    fill(img, cx+8, ly, cx+14, ly+2, W)      # shin
    fill(img, cx+15, ly, cx+17, ly+2, S)     # foot

    return add_outline(img)


# ============================================================
# FRAME 5: BLOCK
# ============================================================
def frame_block():
    img = make()
    cx = 16
    sy = draw_head(img, cx, 2)
    ly = draw_torso(img, cx, sy)

    # Left arm: crosses from left to upper-center-right
    fill(img, cx-9, sy+1, cx-7, sy+2, W)
    fill(img, cx-7, sy, cx-5, sy+1, W)
    fill(img, cx-5, sy-1, cx-3, sy, W)
    fill(img, cx-3, sy-2, cx-1, sy-1, W)
    fill(img, cx-1, sy-4, cx+1, sy-3, S)

    # Right arm: crosses from right to upper-center-left
    fill(img, cx+7, sy+1, cx+9, sy+2, W)
    fill(img, cx+5, sy, cx+7, sy+1, W)
    fill(img, cx+3, sy-1, cx+5, sy, W)
    fill(img, cx+1, sy-2, cx+3, sy-1, W)
    fill(img, cx-1, sy-4, cx+1, sy-3, S)  # same fist spot

    # Wide stance legs
    fill(img, cx-5, ly, cx-3, ly+1, W)
    fill(img, cx+3, ly, cx+5, ly+1, W)
    fill(img, cx-6, ly+2, cx-4, ly+3, W)
    fill(img, cx+4, ly+2, cx+6, ly+3, W)
    fill(img, cx-7, ly+4, cx-5, ly+5, W)
    fill(img, cx+5, ly+4, cx+7, ly+5, W)
    fill(img, cx-8, ly+6, cx-6, ly+7, W)
    fill(img, cx+6, ly+6, cx+8, ly+7, W)
    fill(img, cx-9, ly+8, cx-6, ly+9, S)
    fill(img, cx+6, ly+8, cx+9, ly+9, S)

    return add_outline(img)


# ============================================================
# FRAME 6: HURT
# ============================================================
def frame_hurt():
    img = make()
    cx = 17
    sy = draw_head(img, cx, 3, hurt=True)
    ly = draw_torso(img, cx, sy)

    # Left arm flailing up-left
    fill(img, cx-9, sy, cx-7, sy+1, W)
    fill(img, cx-12, sy-2, cx-9, sy-1, W)
    fill(img, cx-14, sy-4, cx-12, sy-3, W)
    fill(img, cx-15, sy-5, cx-14, sy-4, S)

    # Right arm flailing up-right
    fill(img, cx+7, sy, cx+9, sy+1, W)
    fill(img, cx+9, sy-2, cx+12, sy-1, W)
    fill(img, cx+12, sy-4, cx+14, sy-3, W)
    fill(img, cx+14, sy-5, cx+15, sy-4, S)

    # Legs
    fill(img, cx-4, ly, cx-2, ly+7, W)
    fill(img, cx+2, ly, cx+4, ly+7, W)
    fill(img, cx-5, ly+8, cx-2, ly+9, S)
    fill(img, cx+2, ly+8, cx+5, ly+9, S)

    return add_outline(img)


# ---- Build ----
builders = [frame_idle, frame_walk1, frame_walk2, frame_punch, frame_kick, frame_block, frame_hurt]
names = ['idle', 'walk1', 'walk2', 'punch', 'kick', 'block', 'hurt']

sheet = Image.new('RGBA', (FRAME_W * NUM_FRAMES, FRAME_H), T)
for i, build in enumerate(builders):
    sheet.paste(build(), (i * FRAME_W, 0))

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sprites', 'player.png')
sheet.save(out)
print(f"Saved {out} ({sheet.size[0]}x{sheet.size[1]})")

# Optionally save debug frames (8x scaled) by passing --debug
import sys
if '--debug' in sys.argv:
    dbg = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sprites', 'debug_frames')
    os.makedirs(dbg, exist_ok=True)
    for i, n in enumerate(names):
        f = sheet.crop((i*FRAME_W, 0, (i+1)*FRAME_W, FRAME_H))
        f.resize((FRAME_W*8, FRAME_H*8), Image.NEAREST).save(os.path.join(dbg, f'{i}_{n}.png'))
    print(f"Debug frames saved to {dbg}")
