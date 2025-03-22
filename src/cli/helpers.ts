export const parseBoolean = (value: string) =>
  !!value && !['0', 'false'].includes(value)
