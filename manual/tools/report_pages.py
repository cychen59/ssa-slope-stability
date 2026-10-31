"""Make a thumbnail sheet of the tutorial report (examples/tutorial-report.pdf -> img/08-report-pages.png)."""
import subprocess, glob, os, tempfile
from PIL import Image, ImageDraw
here = os.path.dirname(os.path.abspath(__file__))
pdf = os.path.join(here, '..', 'examples', 'tutorial-report.pdf')
tmp = tempfile.mkdtemp()
subprocess.run(['pdftoppm', '-r', '80', '-png', pdf, os.path.join(tmp, 'p')], check=True)
pages = [Image.open(f).convert('RGB') for f in sorted(glob.glob(os.path.join(tmp, 'p*.png')))]
cols = 3; rows = (len(pages) + cols - 1) // cols; w, h = pages[0].size; g = 24
sheet = Image.new('RGB', (cols * w + (cols + 1) * g, rows * h + (rows + 1) * g), (236, 240, 238))
d = ImageDraw.Draw(sheet)
for i, im in enumerate(pages):
    x = g + (i % cols) * (w + g); y = g + (i // cols) * (h + g)
    sheet.paste(im, (x, y)); d.rectangle([x - 1, y - 1, x + w, y + h], outline=(180, 190, 186))
sheet.save(os.path.join(here, '..', 'img', '08-report-pages.png')); print(len(pages), sheet.size)
