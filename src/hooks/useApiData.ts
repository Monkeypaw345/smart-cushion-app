import { useCallback, useEffect, useRef, useState } from 'react';

type State<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// Generic data hook: runs `fetcher` on mount, on tab visibility-return,
// and on manual refresh(). `deps` re-trigger the fetch when changed.
export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): State<T> & { refresh: () => void } {
  const [state, setState] = useState<State<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState({
        data: null,
        loading: false,
        error: e instanceof Error ? e.message : 'Request failed',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    run();
    const onVisible = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, refresh: run };
}
