const deepFreeze = value => {
  if (Array.isArray(value)) {
    value.forEach(deepFreeze);
    return Object.freeze(value);
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  }
  return value;
};

export const EnvironmentDefinitionV1Schema = deepFreeze({
  name: "Digital2Real Environment Definition",
  contractVersion: "1.0.0",
  validationContractVersion: "1.0.0",
  identifierPatterns: {
    environment: "^ENV-[0-9]{3}$",
    experienceEditorial: "^EE-[0-9]{4}$",
    slug: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    background: "^media/[A-Za-z0-9][A-Za-z0-9._-]*$"
  },
  enums: {
    lifecycle: ["draft", "published"]
  },
  required: {
    root: ["environment", "visual", "hotspots"],
    environment: ["id", "slug", "lifecycle", "version"],
    visual: ["background", "width", "height"],
    hotspot: ["experience_editorial_id", "x", "y"]
  },
  hotspotFields: ["experience_editorial_id", "x", "y"],
  lifecycleRules: {
    draft: { minimumHotspots: 0, maximumHotspots: 10, requiresResolution: false },
    published: { minimumHotspots: 10, maximumHotspots: 10, requiresResolution: true }
  },
  aspectRatio: {
    source: ["visual.width", "visual.height"],
    rule: "width / height"
  }
});
