import { useEffect, useState } from 'react';

const CONTROL_KEYS = ['ArrowLeft', 'ArrowRight', 'q', 'd', 'Q', 'D'];

export default function useKeyboardControls() {
  const [keys, setKeys] = useState(() =>
    Object.fromEntries(CONTROL_KEYS.map(key => [key, false]))
  );

  useEffect(() => {
    const dispatch = (key, pressed) => {
      setKeys(prevKeys => ({
        ...prevKeys,
        [key]: pressed
      }));

      window.dispatchEvent(new CustomEvent('game-control', {
        detail: { action: key, pressed }
      }));
    };

    const handleKeyDown = (event) => {
      if (CONTROL_KEYS.includes(event.key)) {
        dispatch(event.key, true);
      }
    };

    const handleKeyUp = (event) => {
      if (CONTROL_KEYS.includes(event.key)) {
        dispatch(event.key, false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}
