export const pingServer = async (pingUrl: string): Promise<void> => {
  try {
    const response = await fetch(pingUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    console.log(`Ping successful. Status: ${response.status}`);
  } catch (error) {
    console.error(`Ping failed. Error: ${(error as Error).message}`);
  } finally {
    setTimeout(() => pingServer(pingUrl), 60000);
  }
};
