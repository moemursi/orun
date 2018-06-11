from sqlalchemy.ext.compiler import compiles
from sqlalchemy.types import Integer


class Identity(Integer):
    pass


@compiles(Identity, 'oracle')
def compile_identity(element, compiler, **kwargs):
    return 'NUMBER GENERATED ALWAYS AS IDENTITY'
