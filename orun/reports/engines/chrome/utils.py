

def to_values(iterable, member):
    for obj in iterable:
        yield getattr(obj, member)
