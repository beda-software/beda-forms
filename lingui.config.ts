import type { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
  locales: ["en", "es", "ru", "de"],
  format: "po",
  catalogs: [
    {
      path: "<rootDir>/src/locale/{locale}/messages",
      include: [
        "<rootDir>/src",
        "<rootDir>/node_modules/@beda.software/web-item-controls/src",
        "<rootDir>/node_modules/@beda.software/fhir-questionnaire/components",
      ],
    },
  ],
};

export default config;
