import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const useUpdateNotification = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  const {
    needRefresh: [needRefreshState, setNeedRefreshState],
    offlineReady: [offlineReadyState, setOfflineReadyState],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    setNeedRefresh(needRefreshState);
    setOfflineReady(offlineReadyState);
  }, [needRefreshState, offlineReadyState]);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setOfflineReadyState(false);
    setNeedRefreshState(false);
  };

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    close,
  };
};