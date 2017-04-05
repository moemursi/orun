from lxml import etree


def get_xml_fields(xml):
    return etree.fromstring(xml).findall('field')
