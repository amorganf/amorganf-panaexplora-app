"use client";

import { OPEN_SETTINGS_EVENT } from "./CookieConsent";

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="btn btn-link p-0 align-baseline"
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
    >
      Configurar cookies
    </button>
  );
}
