

def make_model_tuple(model):
    """
    Takes a model or a string of the form "app_label.ModelName" and returns a
    corresponding ("app_label", "modelname") tuple. If a tuple is passed in,
    it's assumed to be a valid model tuple already and returned unchanged.
    """
    try:
        if isinstance(model, tuple):
            model_tuple = model
        elif isinstance(model, str):
            return model
        else:
            return model._meta.name
            model_tuple = (model._meta.app_label, model.__name__.lower())
        assert len(model_tuple) == 2
        return model_tuple
    except (ValueError, AssertionError):
        raise ValueError(
            "Invalid model reference '%s'. String model references "
            "must be of the form 'app_label.ModelName'." % model
        )
