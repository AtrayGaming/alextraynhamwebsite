"""Dependency-free structural, link, metadata and transfer-budget checks."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import gzip, json
ROOT=Path(__file__).resolve().parent.parent
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class Page(HTMLParser):
    def __init__(self,path):
        super().__init__(); self.path=path; self.ids=set(); self.links=[]; self.stack=[]; self.h1=0; self.meta={}; self.canonical=None
        self.feed(path.read_text()); assert not self.stack,(path.name,'unclosed tags',self.stack)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag not in VOID: self.stack.append(tag)
        if a.get('id'):
            assert a['id'] not in self.ids,(self.path.name,'duplicate id',a['id'])
            self.ids.add(a['id'])
        if tag=='h1': self.h1+=1
        if tag=='img':
            assert 'alt' in a and a.get('width') and a.get('height'),(self.path.name,'image accessibility/dimensions',a)
        for k in ['href','src']:
            if a.get(k): self.links.append(a[k])
        if tag=='meta': self.meta[a.get('name',a.get('property'))]=a.get('content')
        if tag=='link' and a.get('rel')=='canonical': self.canonical=a['href']
    def handle_endtag(self,tag):
        if tag in VOID:return
        assert self.stack and self.stack[-1]==tag,(self.path.name,'invalid nesting',tag,self.stack[-5:])
        self.stack.pop()
pages={p.name:Page(p) for p in ROOT.glob('*.html')}
count=0
for name,p in pages.items():
    assert p.h1==1,(name,'h1',p.h1)
    assert p.meta.get('description') and p.meta.get('og:image') and p.canonical,(name,'metadata')
    for link in p.links:
        u=urlsplit(link)
        if u.scheme or u.netloc: continue
        path=unquote(u.path) or name
        file=ROOT/path
        if not file.exists() and not file.suffix: file=file.with_suffix('.html')
        assert file.exists(),(name,'broken local resource',link)
        if u.fragment and file.suffix=='.html': assert u.fragment in pages[file.name].ids,(name,'missing anchor',link)
        count+=1
for alias in ['top','work','projects','content','about','experience','proof','contact']:
    assert alias in pages['index.html'].ids,('legacy anchor',alias)
for p in ROOT.glob('*.pdf'): assert p.read_bytes().startswith(b'%PDF-'),('invalid PDF',p.name)
files=['index.html','style.css','script.js','assets/alex-epic-universe.webp','assets/radio-ready/workspace-desktop.webp']
budget={f:{'bytes':(ROOT/f).stat().st_size,'gzip_bytes':len(gzip.compress((ROOT/f).read_bytes()))} for f in files}
assert budget['script.js']['bytes']<12000,'JS budget exceeded'
assert sum(v['bytes'] for v in budget.values())<400000,'Homepage + both images exceeds 400 KB raw budget'
assert '@import' not in (ROOT/'style.css').read_text(),'Remote CSS import'
print(json.dumps({'pages':len(pages),'local_references_checked':count,'status':'passed','asset_budget':budget},indent=2))
