"""Reduce screenshot size: 256-colour palette PNG (screenshots are flat UI colours)."""
import glob, os
from PIL import Image
here = os.path.dirname(os.path.abspath(__file__))
tot0 = tot1 = 0
for f in sorted(glob.glob(os.path.join(here, '..', 'img', '*.png'))):
    s0 = os.path.getsize(f); im = Image.open(f)
    if im.mode == 'P': tot0 += s0; tot1 += s0; continue
    q = im.convert('RGB').quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    q.save(f, optimize=True); s1 = os.path.getsize(f); tot0 += s0; tot1 += s1
print(f'{tot0/1e6:.1f} MB -> {tot1/1e6:.1f} MB')
