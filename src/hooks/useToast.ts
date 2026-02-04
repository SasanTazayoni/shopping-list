import { useEffect, useRef, useState } from "react";

export function useToast(durationMs = 2500, fadeMs = 500) {
  const [message, setMessage] = useState("");
  const [fading, setFading] = useState(false);

  const mainRef = useRef<number | null>(null);
  const fadeRef = useRef<number | null>(null);

  const show = (msg: string) => {
    if (mainRef.current) clearTimeout(mainRef.current);
    if (fadeRef.current) clearTimeout(fadeRef.current);

    setMessage(msg);
    setFading(false);

    mainRef.current = window.setTimeout(() => {
      setFading(true);
      fadeRef.current = window.setTimeout(() => setMessage(""), fadeMs);
    }, durationMs);
  };

  useEffect(() => {
    return () => {
      if (mainRef.current) clearTimeout(mainRef.current);
      if (fadeRef.current) clearTimeout(fadeRef.current);
    };
  }, []);

  return { message, fading, show };
}
