export function scheduleTelegramPostFetch(interval?: number): {
  setNewInterval: (interval: number) => void;
  start: () => void;
  stop: () => void;
  onTick: (callback: () => Promise<void>) => void;
} {
  let localInterval = interval || 60000;
  let localCallback = async () => {
    console.log('local callback ready to be subscribed');
  };
  let timeoutId: NodeJS.Timeout | null = null;
  return {
    setNewInterval: (newInterval: number) => {
      localInterval = newInterval;
      console.log('interval set to:', localInterval);
    },
    start: () => {
      function reUse() {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          await localCallback();
          reUse();
        }, localInterval);
      }
      reUse();
      console.log('interval started');
    },
    onTick: (callback: () => Promise<void>) => {
      localCallback = callback;
      console.log('subscribed to callback');
    },
    stop: () => {
      if (timeoutId) clearInterval(timeoutId);
      console.log('interval stopped');
    },
  };
}
