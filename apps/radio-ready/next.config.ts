import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  // Let OpenNext choose Workers-specific exports; include files Node tracing omits.
  serverExternalPackages: [
    "@libsql/client",
    "@libsql/hrana-client",
    "@libsql/core",
  ],
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/@libsql/**/*.js",
      "./node_modules/@libsql/**/*.mjs",
      "./node_modules/@libsql/**/*.cjs",
      "./node_modules/@libsql/**/package.json",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
    ];
  },
};
export default config;
