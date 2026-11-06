import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The support chat reads docs/foodly_customer_policies.md at runtime, so it
  // must be traced into the server bundle for the /api/chat route.
  outputFileTracingIncludes: {
    "/api/chat": ["./docs/foodly_customer_policies.md"],
  },
};

export default nextConfig;
