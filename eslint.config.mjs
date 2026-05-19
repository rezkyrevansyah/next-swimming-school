import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Supabase join results are untyped objects; casting as any is intentional
      "@typescript-eslint/no-explicit-any": "warn",
      // Closing drawer on pathname change is intentional setState-in-effect
      "react-hooks/set-state-in-effect": "warn",
      // Refs-during-render pattern used in page-transition (state-based now, but keep warn for others)
      "react-hooks/refs": "warn",
    },
  },
]);

export default eslintConfig;
