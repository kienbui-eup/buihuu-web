"""Giảm bảng màu các bản icon đã xuất, giữ nguyên kích thước và thiết kế."""

from pathlib import Path
import sys

from PIL import Image


def optimize(path: Path, colors: int) -> None:
    with Image.open(path) as source:
        rgb = source.convert("RGB")
        reduced = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT)
        reduced.save(path, format="PNG", optimize=True)


def main() -> None:
    asset_dir = Path(sys.argv[1])
    files = {
        "logo-bui-huu.png": 128,
        "icon-bui-huu-192.png": 128,
        "icon-bui-huu-512.png": 128,
        "apple-touch-bui-huu.png": 128,
        "favicon-bui-huu-16.png": 32,
        "favicon-bui-huu-32.png": 48,
        "favicon-bui-huu-48.png": 64,
    }
    for name, colors in files.items():
        optimize(asset_dir / name, colors)


if __name__ == "__main__":
    main()
