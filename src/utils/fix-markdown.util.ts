export const removeStars = (text: string): string => {
  return text.replace(/[\*\n]/g, '');
};
