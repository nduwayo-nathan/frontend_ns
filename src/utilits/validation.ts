export const validateSlotNumber = (slotNumber: string): boolean => {
  return /^[A-Za-z0-9\-_]{1,10}$/.test(slotNumber);
};