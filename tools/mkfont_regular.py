import sys
from fontTools.ttLib import TTCollection, TTFont
from fontTools import subset
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib.tables._g_l_y_f import table__g_l_y_f
import fontTools.ttLib as tt

def chars():
    s=set()
    for a in range(0x81,0xFD):
        for b in range(0x40,0xFD):
            try: c=bytes([a,b]).decode('cp932')
            except: continue
            if len(c)==1: s.add(ord(c))
    for c in range(0x20,0x7F): s.add(c)
    s.update(map(ord,"㎡㎥㎏㎝㎜①②③④⑤⑥⑦⑧⑨⑩〒～・※→"))
    return sorted(s)

def otf2ttf(font):
    glyphOrder=font.getGlyphOrder()
    gs=font.getGlyphSet()
    glyf=table__g_l_y_f(); glyf.glyphOrder=glyphOrder; glyf.glyphs={}
    for n in glyphOrder:
        pen=TTGlyphPen(gs)
        gs[n].draw(Cu2QuPen(pen,1.0,reverse_direction=True))
        glyf.glyphs[n]=pen.glyph()
    font['loca']=tt.newTable('loca'); font['glyf']=glyf
    maxp=font['maxp']; maxp.tableVersion=0x00010000
    for a in ('maxZones','maxTwilightPoints','maxStorage','maxFunctionDefs','maxInstructionDefs','maxStackElements','maxSizeOfInstructions','maxComponentElements'): setattr(maxp,a,0)
    maxp.maxZones=1; maxp.maxComponentDepth=0; maxp.maxPoints=maxp.maxContours=maxp.maxCompositePoints=maxp.maxCompositeContours=0
    font['head'].glyphDataFormat=0
    del font['CFF ']
    if 'VORG' in font: del font['VORG']
    font.sfntVersion='\x00\x01\x00\x00'
    post=font['post']; post.formatType=2.0; post.extraNames=[]; post.mapping={}; post.glyphOrder=glyphOrder

src,idx,out=sys.argv[1],int(sys.argv[2]),sys.argv[3]
ttc=TTCollection(src)
for i,f in enumerate(ttc.fonts):
    print(i,f['name'].getDebugName(1))
f=ttc.fonts[idx]
opts=subset.Options(); opts.layout_features=['vert','vrt2','palt','kern']; opts.name_IDs=[1,2]; opts.notdef_outline=True; opts.hinting=False; opts.glyph_names=False
sub=subset.Subsetter(opts); sub.populate(unicodes=chars()); sub.subset(f)
f.save('tmp.otf')
g=TTFont('tmp.otf')
otf2ttf(g)
g.save(out)
