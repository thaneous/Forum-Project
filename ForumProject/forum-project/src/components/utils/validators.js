export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    console.debug('Invalid URL:', error);
    return false;
  }
};