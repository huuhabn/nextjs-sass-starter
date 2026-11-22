const UUID_RE = /^[\dA-F]{8}-[\dA-F]{4}-[\dA-F]{4}-[\dA-F]{4}-[\dA-F]{12}$/i;

export const isUuid = (value: string): boolean => UUID_RE.test(value);
