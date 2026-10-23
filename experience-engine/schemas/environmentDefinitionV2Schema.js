const freeze = value => {
  if (Array.isArray(value)) value.forEach(freeze);
  else if (value && typeof value === "object") Object.values(value).forEach(freeze);
  return value && typeof value === "object" ? Object.freeze(value) : value;
};

export const EnvironmentDefinitionV2Schema = freeze({
  contractVersion: "2.0.0",
  theoryVersion: "1.0.0",
  supportedLocales: ["es", "en"],
  required: {
    environmentRoot: ["contract_version", "environment", "visual", "hotspots", "theory"],
    theory: ["version", "default_locale", "supported_locales", "media", "sections"],
    media: ["id", "type", "src", "alt"],
    section: ["id", "title", "body", "media_ids"],
    locale: ["locale", "media", "sections"]
  },
  patterns: {
    theorySource: "^theory\\.yaml$",
    mediaId: "^TH-MEDIA-[A-Z0-9]+(?:-[A-Z0-9]+)*$",
    mediaSource: "^media/[A-Za-z0-9][A-Za-z0-9._-]*\\.png$",
    sectionId: "^TH-[0-9]{2}(?:-[A-Z0-9]+)+$"
  },
  mediaTypes: ["image"]
});
