import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // Dummy secrets — encryption.ts / webhook-signature.ts read these
    // at module load. Tests never hit a real Meta/Supabase service, so
    // any 32-byte hex / non-empty string will do; keep them lexically
    // identical to the CI build env so behaviour matches.
    env: {
      ENCRYPTION_KEY:
        "b8c6cf6c8922518110171cffb6d0a102099adfa37b3a8492c5120b2a02cbf704",
      META_APP_SECRET: "204015b39c5c1378d8f594eca1774ff9",
    },
    clearMocks: true,
  },
});

