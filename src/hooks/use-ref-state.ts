import { useEffect, useRef, useState, Dispatch, MutableRefObject, SetStateAction } from "react";

/**
 * Combines useState and useRef hooks to provide a state value that can be referenced
 * from function callbacks that would otherwise close around a stale state value.
 * cf. https://blog.castiel.me/posts/2019-02-19-react-hooks-get-current-state-back-to-the-future/
 * @param {*} initialValue
 */
export const useRefState = <T extends unknown>(initialValue: T)
              : [T, MutableRefObject<T>, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(initialValue);
  const stateRef = useRef<T>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  return [state, stateRef, setState];
};