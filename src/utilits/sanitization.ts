export const sanitizeInput = (input: string): string => {
  return input.replace(/[^a-zA-Z0-9\s\-_]/g, '');
};

export const sanitizeNumberInput = (input: string): number => {
  const num = parseInt(input.replace(/\D/g, ''), 10);
  return isNaN(num) ? 0 : num;
};