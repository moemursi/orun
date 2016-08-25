from lxml import html as etree, etree as xpath
from jinja2 import nodes
from jinja2.ext import Extension


class XPathExtension(Extension):
    tags = {'xpath'}

    def parse(self, parser):
        lineno = next(parser.stream).lineno
        ctx = nodes.ContextReference()
        body = parser.parse_statements(['name:endxpath'], drop_needle=True)

        return nodes.CallBlock(self.call_method('_xpath', [ctx]), [], [], body).set_lineno(lineno)

    def _xpath(self, context, caller):
        r = caller()
        return r


class Template(object):
    def __init__(self, xml, children=None):
        if isinstance(xml, str):
            xml = etree.fromstring(xml)
        self.xml = xml
        if children:
            self.children = children
        else:
            self.children = []
        for child in self.children:
            self.merge(child)

    def merge(self, child):
        if isinstance(child, str):
            child = etree.fromstring(child)
        for node in child:
            if node.tag == 'xpath':
                pos = node.attrib.get('position', 'inside')
                for n in xpath.XPath(node.attrib['expr'])(self.xml):
                    p = n.getparent()
                    for sub in node:
                        sub = sub
                        if pos == 'inside':
                            n.append(sub)
                        elif pos == 'after':
                            n.addnext(sub)
                            n = sub
                        elif pos == 'replace' or pos == 'before':
                            n.addprevious(sub)
                    if pos == 'replace':
                        p.remove(n)

    def render(self):
        s = etree.tostring(self.xml)
        if isinstance(s, bytes):
            s = s.decode('utf-8')
        return s
