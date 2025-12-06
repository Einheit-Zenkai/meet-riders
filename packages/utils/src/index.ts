export const formatDisplayDate = (value: string | Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? "" : date.toLocaleDateString();
};
