"""
Dummy email backend that does nothing.
"""

from orun.core.mail.backends.base import BaseEmailBackend


class EmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        return len(list(email_messages))
