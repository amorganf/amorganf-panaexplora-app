export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-ppd_session" : "ppd_session";
export const SESSION_ISSUER = "panaexplora";
export const SESSION_AUDIENCE = "panaexplora-admin";