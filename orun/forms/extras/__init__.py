import warnings

from orun.forms.widgets import SelectDateWidget
from orun.utils.deprecation import RemovedInOrun20Warning

__all__ = ['SelectDateWidget']


warnings.warn(
    "orun.forms.extras is deprecated. You can find "
    "SelectDateWidget in orun.forms.widgets instead.",
    RemovedInOrun20Warning, stacklevel=2)
