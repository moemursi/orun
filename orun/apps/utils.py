from .registry import registry


def get_dependencies(addon):
    r = []
    if isinstance(addon, str):
        addon = registry.app_configs[addon]
    deps = addon.depends
    if deps:
        for dep in addon.depends:
            r += get_dependencies(dep)
        return r + list(addon.depends)
    return []


def adjust_dependencies(addons):
    # adjust module dependency priority
    lst = list(addons)
    for entry in lst:
        deps = get_dependencies(entry)
        if deps:
            addons.remove(entry)
            i = 0
            for dep in deps:
                if not dep in addons:
                    addons.append(dep)
                    i = len(addons) - 1
                    continue
                i = max(i, addons.index(dep))
            if i == 0:
                addons.append(entry)
            else:
                addons.insert(i + 1, entry)
    return addons
