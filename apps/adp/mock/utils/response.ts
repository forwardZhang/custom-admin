export function success<T>(data: T, message = 'ok') {
  return {
    code: 0,
    data,
    message,
  };
}

export function fail(message: string, code = 500) {
  return {
    code,
    data: null,
    message,
  };
}
