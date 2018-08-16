
class Node:
    pass


class Repeater:
    def __init__(self, element):
        self.set_element(element)

    def set_element(self, element):
        self._element = element
        self.data_source = element.attrib['data-source']

    def process(self, context):
        output = ''
        ds = context[self.data_source]
        for row in ds:
            pass
