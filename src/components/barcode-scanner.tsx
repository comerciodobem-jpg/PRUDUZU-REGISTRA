"use client";

import { useEffect, useRef, useState } from "react";

interface DetectorResult {
  rawValue: string;
}

interface DetectorInstance {
  detect(source: HTMLVideoElement): Promise<DetectorResult[]>;
}

interface DetectorConstructor {
  new (options?: { formats?: string[] }): DetectorInstance;
}

type ScannerWindow = Window & {
  BarcodeDetector?: DetectorConstructor;
};

export function BarcodeScanner({
  onDetected,
}: {
  onDetected: (barcode: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");

  function stop() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  }

  useEffect(() => stop, []);

  async function start() {
    setError("");
    const Detector = (window as ScannerWindow).BarcodeDetector;
    if (!Detector) {
      setError("Leitura automática indisponível neste navegador. Digite o código abaixo.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setActive(true);

      const detector = new Detector({
        formats: ["ean_13", "ean_8", "code_128", "upc_a", "upc_e"],
      });

      timerRef.current = window.setInterval(async () => {
        try {
          const results = await detector.detect(video);
          const value = results[0]?.rawValue?.trim();
          if (value) {
            navigator.vibrate?.(35);
            stop();
            onDetected(value);
          }
        } catch {
          // Frame sem leitura: continuar procurando.
        }
      }, 450);
    } catch {
      stop();
      setError("Não foi possível abrir a câmera. Use a digitação manual.");
    }
  }

  return (
    <div className={active ? "scanner scanner-active" : "scanner"}>
      <div className="scanner-viewport">
        <video ref={videoRef} muted playsInline aria-label="Câmera do leitor" />
        <div className="scanner-frame" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        {!active ? (
          <div className="scanner-placeholder">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8" />
            </svg>
            <strong>Leitor de código de barras</strong>
            <span>Aponte para o código do produto</span>
          </div>
        ) : null}
      </div>
      <button
        type="button"
        className={active ? "button button-ghost" : "button button-primary"}
        onClick={active ? stop : start}
      >
        {active ? "Fechar câmera" : "Abrir câmera"}
      </button>
      {error ? <p className="field-help warning-text">{error}</p> : null}
    </div>
  );
}
