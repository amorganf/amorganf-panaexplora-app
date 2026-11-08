"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

const KEY = "panaexplora_consent_v1";
// Volver a preguntar pasado un año.
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export const OPEN_SETTINGS_EVENT = "panaexplora-cookie-settings";

type Choice = "accepted" | "rejected";
type Stored = { choice: Choice; date: number };

// localStorage puede fallar (modo privado, almacenamiento bloqueado).
function readConsent(): Choice | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Stored>;
    const valid = data.choice === "accepted" || data.choice === "rejected";
    const fresh =
      typeof data.date === "number" && Date.now() - data.date < MAX_AGE_MS;
    return valid && fresh ? (data.choice as Choice) : null;
  } catch {
    return null;
  }
}

function saveConsent(choice: Choice) {
  try {
    const data: Stored = { choice, date: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Si no se puede guardar, la elección vale solo para esta visita.
  }
}

// Borra las cookies de Google Analytics y AdSense al retirar el consentimiento.
function deleteTrackingCookies() {
  const parts = window.location.hostname.split(".");
  const domains = parts.map((_, i) => `.${parts.slice(i).join(".")}`);
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter(
      (n) =>
        n === "_ga" ||
        n.startsWith("_ga_") ||
        n === "_gid" ||
        n.startsWith("_gat") ||
        n === "__gads" ||
        n === "__gpi" ||
        n === "__eoi",
    );

  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
    }
  }
}

export default function CookieConsent({
  analyticsId,
  adsenseClient,
}: {
  analyticsId: string;
  adsenseClient: string;
}) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setChoice(stored);
    setOpen(stored === null);
    setReady(true);

    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  function choose(next: Choice) {
    const wasAccepted = choice === "accepted";
    saveConsent(next);
    setOpen(false);

    // Los scripts ya cargados siguen activos aunque React los desmonte:
    // al retirar el consentimiento se borran sus cookies y se recarga.
    if (next === "rejected" && wasAccepted) {
      deleteTrackingCookies();
      window.location.reload();
      return;
    }
    setChoice(next);
  }

  const accepted = ready && choice === "accepted";

  return (
    <>
      {ready && open && (
        <section
          aria-label="Preferencias de cookies"
          className="position-fixed bottom-0 start-0 end-0 bg-body border-top shadow-lg p-3"
          style={{ zIndex: 1090 }}
        >
          <div className="container d-flex flex-column flex-md-row gap-3 align-items-md-center">
            <div className="flex-grow-1">
              <strong>Cookies y privacidad</strong>
              <p className="mb-0">
                Usamos cookies opcionales de analítica y publicidad únicamente
                si las aceptas.{" "}
                <Link href="/politica-de-cookies">Más información</Link>.
                {choice && (
                  <>
                    {" "}
                    Tu elección actual:{" "}
                    <strong>
                      {choice === "accepted" ? "aceptadas" : "rechazadas"}
                    </strong>
                    .
                  </>
                )}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => choose("rejected")}
              >
                Rechazar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => choose("accepted")}
              >
                Aceptar opcionales
              </button>
            </div>
          </div>
        </section>
      )}

      {accepted && analyticsId && (
        <>
          <Script
            id="panaexplora-gtag-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`}
            strategy="afterInteractive"
          />
          <Script id="panaexplora-ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(analyticsId)});`}
          </Script>
        </>
      )}

      {accepted && adsenseClient && (
        <Script
          id="panaexplora-adsense"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`}
          crossOrigin="anonymous"
        />
      )}
    </>
  );
}
