"""Check a built Hugo site without third-party Python packages."""
import argparse
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []
        self.ids = set()
        self.h1s = 0
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if tag == 'h1':
            self.h1s += 1
        for attr in ('href', 'src'):
            if attrs.get(attr):
                self.links.append(attrs[attr])


parser = argparse.ArgumentParser()
parser.add_argument('directory', nargs='?', default='public')
parser.add_argument('--preview', action='store_true')
args = parser.parse_args()
root = Path(args.directory).resolve()
assert root.is_dir(), f'Build directory not found: {root}'
pages = {file: Page(file.read_text()) for file in root.rglob('*.html')}
errors = []
for file, page in pages.items():
    relative = file.relative_to(root).as_posix()
    alias = relative == 'author/naman-aggarwal/index.html'
    if not alias and page.h1s != 1:
        errors.append(f'{relative}: expected one main heading, found {page.h1s}')
    base = 'https://nerdynaman.github.io/' + relative.removesuffix('index.html')
    text = file.read_text()
    if '/Users/' in text or 'file://' in text or '{: style=' in text:
        errors.append(f'{relative}: local path or unsupported Markdown leaked into output')
    for link in page.links:
        url = urlsplit(urljoin(base, link))
        if url.scheme not in ('http', 'https') or url.netloc != 'nerdynaman.github.io':
            continue
        path = unquote(url.path).lstrip('/')
        target = root / path
        if target.is_dir():
            target /= 'index.html'
        if not target.is_file():
            errors.append(f'{relative}: missing local target {link}')
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f'{relative}: missing anchor {link}')

required = ['index.html', 'about/index.html', 'experience/index.html', 'projects/index.html',
            'post/index.html', 'reading/index.html', 'uploads/resume.pdf', 'index.xml',
            'post/kerberos-with-ftp/index.html', 'post/private-tor-network/index.html',
            'post/tor-client-setup/index.html', 'post/create-firewall/index.html',
            'project/raft/index.html', 'project/ircchatserver/index.html']
for name in required:
    if not (root / name).is_file():
        errors.append(f'Missing preserved URL: {name}')

# Every original page-bundle asset must survive the theme migration.
for section in ('post', 'project'):
    for bundle in (Path('content') / section).iterdir():
        if not bundle.is_dir():
            continue
        for asset in bundle.rglob('*'):
            if asset.is_file() and asset.suffix != '.md':
                target = root / section / bundle.name.lower() / asset.relative_to(bundle)
                if not target.is_file() or target.read_bytes() != asset.read_bytes():
                    errors.append(f'Missing or changed asset: {asset}')

# Reading entries stay on the shelf; the imported long-form notes were removed.
for file in [*root.rglob('*.html'), *root.rglob('*.xml')]:
    text = file.read_text()
    if re.search(r'/reading/(ddia|redis)/', text):
        errors.append(f'{file.relative_to(root)}: removed note URL leaked into output')
for slug in ('ddia', 'redis'):
    if (root / 'reading' / slug).exists():
        errors.append(f'Removed reading page remains: {slug}')
shelf = (root / 'reading/index.html').read_text()
if ('Designing Data-Intensive Applications' in shelf) != args.preview:
    errors.append('DDIA shelf entry draft publication state incorrect')
if 'Redis Notes' in shelf or 'Chapter notes' in shelf:
    errors.append('Removed long-form notes remain on the shelf')

assert not errors, '\n'.join(errors)
print(f'PASS: {len(pages)} HTML pages; internal links, anchors, preserved URLs/assets, and draft isolation.')
