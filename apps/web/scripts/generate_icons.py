"""Generate the Nutribio PWA icons (192, 512 and maskable 512) as PNG files.

Design: emerald gradient background, white plate circle and a green leaf —
simple and readable at small sizes.
"""

import math
import os

from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
SIZE = 512

# --- palette ---------------------------------------------------------------
BG_TOP = (6, 145, 102)      # emerald-600
BG_BOTTOM = (4, 120, 87)    # emerald-700
WHITE = (255, 255, 255)
LEAF = (167, 243, 208)      # emerald-200
LEAF_DARK = (52, 211, 153)  # emerald-400


def vertical_gradient(size, top, bottom):
    img = Image.new("RGBA", (size, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        color = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        for x in range(size):
            px[x, y] = (*color, 255)
    return img


def draw_leaf(draw, cx, cy, scale, fill):
    """Draw a simple leaf: two mirrored ellipses forming a pointed shape."""
    w = int(0.34 * scale)
    h = int(0.52 * scale)
    # left half
    draw.pieslice(
        [cx - w, cy - h, cx, cy + h], 90, 270, fill=fill
    )
    # right half
    draw.pieslice(
        [cx, cy - h, cx + w, cy + h], -90, 90, fill=fill
    )


def build_icon(scale, leaf_scale):
    img = vertical_gradient(SIZE, BG_TOP, BG_BOTTOM)
    draw = ImageDraw.Draw(img)

    cx = cy = SIZE // 2

    # plate (white circle with subtle ring)
    plate_r = int(0.42 * scale)
    draw.ellipse(
        [cx - plate_r, cy - plate_r, cx + plate_r, cy + plate_r], fill=WHITE
    )
    ring_r = int(0.30 * scale)
    ring_w = max(3, int(0.045 * scale))
    draw.ellipse(
        [cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r],
        outline=(234, 244, 240),
        width=ring_w,
    )

    # leaf on the plate, slightly rotated via shear-free ellipse trick:
    # draw a vertical leaf then rotate the whole image is complex; instead
    # draw a horizontal ellipse pair tilted by drawing with a rotated canvas.
    leaf = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(leaf)
    draw_leaf(ldraw, cx, cy, leaf_scale, LEAF)
    draw_leaf(ldraw, cx, cy - int(0.06 * leaf_scale), int(0.30 * leaf_scale), LEAF_DARK)

    # stem
    stem_len = int(0.36 * leaf_scale)
    ldraw.line(
        [cx, cy - stem_len // 2, cx, cy + stem_len // 2],
        fill=(6, 78, 59),
        width=max(4, int(0.03 * leaf_scale)),
    )

    leaf = leaf.rotate(30, center=(cx, cy), resample=Image.BICUBIC)
    img = Image.alpha_composite(img, leaf)
    return img


def main():
    os.makedirs(ROOT, exist_ok=True)

    # Regular icons: art fills ~92% of the canvas.
    regular = build_icon(scale=0.92, leaf_scale=0.52)
    regular.resize((192, 192), Image.LANCZOS).save(
        os.path.join(ROOT, "icon-192.png"), optimize=True
    )
    regular.save(os.path.join(ROOT, "icon-512.png"), optimize=True)

    # Maskable: art inside the safe zone (~72% of the canvas).
    maskable = build_icon(scale=0.72, leaf_scale=0.40)
    maskable.save(os.path.join(ROOT, "maskable-512.png"), optimize=True)

    print("Icons generated in", ROOT)


if __name__ == "__main__":
    main()
