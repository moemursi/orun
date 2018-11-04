from statistics import mean


def to_values(iterable, member):
    for obj in iterable:
        yield getattr(obj, member)


def avg(iterable, member):
    vals = list(to_values(iterable, member))
    if vals:
        return mean(vals)


def total(iterable, member):
    vals = to_values(iterable, member)
    return sum(vals)

