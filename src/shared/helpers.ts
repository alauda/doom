const PLAIN_VERSION_PATTERN = /^(\d+\.)*\d+$/

export const normalizeVersion = (version = '') =>
  PLAIN_VERSION_PATTERN.test(version) ? `v${version}` : version
