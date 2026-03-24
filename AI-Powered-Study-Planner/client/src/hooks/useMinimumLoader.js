import { useEffect, useState } from "react";

function useMinimumLoader(delay = 2500) {
  const [loaderDelayDone, setLoaderDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaderDelayDone(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return loaderDelayDone;
}

export default useMinimumLoader;