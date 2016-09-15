"""Redis cache backend"""
import pickle

from orun.core.cache.backends.base import DEFAULT_TIMEOUT, BaseCache


class RedisCache(BaseCache):
    def __init__(self, host='localhost', port=6379, password=None, db=0, *args, **kwargs):
        BaseCache.__init__(self, *args, **kwargs)
        try:
            import redis
        except:
            raise RuntimeError('Redis module not found!')
        if isinstance(host, str):
            self._client = redis.Redis(host=host, port=port, password=password, db=db, **kwargs)
        else:
            self._client = host

    def _get_value(self, value, default=None):
        try:
            return pickle.loads(value)
        except pickle.PickleError:
            return default

    def _get_timeout(self, timeout):
        if timeout is None:
            timeout = DEFAULT_TIMEOUT
        if timeout == 0:
            timeout = -1
        return timeout

    def add(self, key, value, timeout=DEFAULT_TIMEOUT, version=None):
        key = self.make_key(key, version=version)
        self.validate_key(key)
        value = pickle.dumps(value)
        self._client.setnx(name=key, value=value)
        self._client.expire(name=key, time=self._get_timeout(timeout))
        return True

    def get(self, key, default=None, version=None):
        key = self.make_key(key, version=version)
        self.validate_key(key)
        return self._get_value(self._client.get(key), default)
    
    def set(self, key, value, timeout=DEFAULT_TIMEOUT, version=None):
        key = self.make_key(key, version=version)
        self.validate_key(key)
        value = pickle.dumps(value)
        if timeout == -1:
            return self._client.set(name=key, value=value)
        else:
            return self._client.setex(name=key, value=value, time=self._get_timeout(timeout))

    def delete(self, key, version=None):
        key = self.make_key(key, version=version)
        self.validate_key(key)
        self._client.delete(key)

    def get_many(self, keys, version=None):
        return {key: self._get_value(self._client.get(name=self.make_key(key))) for key in keys}

    def has_key(self, key, version=None):
        key = self.make_key(key, version=version)
        self.validate_key(key)
        return self._client.exists(key)

    def set_many(self, data, timeout=DEFAULT_TIMEOUT, version=None):
        timeout = self._get_timeout(timeout)
        pipe = self._client.pipeline(transaction=False)
        for k, v in data.items():
            v = pickle.dumps(v)
            k = self.make_key(k, version=version)
            if timeout == -1:
                pipe.set(name=k, value=v)
            else:
                pipe.setex(name=k, value=v, time=timeout)
        return pipe.execute()

    def delete_many(self, keys, version=None):
        self._client.delete(map(lambda x: self.make_key(x, version=version), keys))

    def clear(self):
        if self.key_prefix:
            keys = self._client.keys(self.key_prefix + '*')
            return self._client.delete(*keys)
        else:
            return self._client.flushdb()

    def close(self, **kwargs):
        del self._client

    def incr(self, key, delta=1, version=None):
        self._client.incr(name=self.make_key(key, version=version), amount=delta)
        
    def decr(self, key, delta=1, version=None):
        self._client.decr(name=self.make_key(key, version=version), amount=delta)
