

class Fixture(object):
    def __init__(self, filename):
        self.filename = filename
        self.data = None

    def get_deserializer(self, format):
        pass

    def load(self, migration):
        pass

    def save(self, model):
        pass
