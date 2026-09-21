export const unwrapList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

export const unwrapItem = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }

  if (
    payload.data &&
    typeof payload.data === 'object' &&
    !Array.isArray(payload.data) &&
    (payload.data._id || payload.data.code)
  ) {
    return payload.data;
  }

  return payload;
};

export const getRefId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const id = value._id ?? value.id;
    return id ? String(id) : '';
  }
  return String(value);
};

export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim()) return data;

  if (Array.isArray(data?.message) && data.message.length) {
    return data.message.filter(Boolean).join(' ');
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error;
  }

  return error?.message || fallback;
};

export const isApiUnavailable = (error) => {
  const status = error?.response?.status;

  if (!error?.response) return true;
  if (status >= 500) return true;
  if (status === 404) return true;

  return false;
};

export const createHttpError = (status, message) => {
  const error = new Error(message);
  error.response = {
    status,
    data: { message },
  };
  return error;
};

export const getChangedFields = (original = {}, next = {}) =>
  Object.entries(next).reduce((patch, [key, value]) => {
    const previous = original[key];
    const isObject =
      (value && typeof value === 'object') ||
      (previous && typeof previous === 'object');

    if (isObject) {
      if (JSON.stringify(previous) !== JSON.stringify(value)) {
        patch[key] = value;
      }
    } else if (value !== previous) {
      patch[key] = value;
    }

    return patch;
  }, {});
