export const reducePrompt = ({
  lang = 'en',
  message = '',
  payload = '',
}: { lang?: string; message?: string; payload?: string } = {}): string => {
  return `
    The response must be in the specified language: ${lang}.
    Message of user: ${message}.
    Payload: ${payload}.
  `;
};
