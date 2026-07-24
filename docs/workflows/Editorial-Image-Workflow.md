# Editorial Image Workflow

## Purpose

Define the visual standard for Digital2Real Notebook and Experience assets.

## 1. Determine the image function

The image must serve one clear purpose:

- Explain an industrial concept
- Establish a credible industrial context
- Support diagnosis
- Represent a device, architecture or process
- Provide an editorial cover

Do not create decorative images without technical value.

## 2. Define the industrial subject

Specify:

- Equipment or process
- Physical environment
- Relevant components
- Camera position
- Lighting
- Level of realism
- Technical details that must be visible
- Elements that must not appear

## 3. Visual standard

Default requirements:

- Photorealistic
- Industrial
- Cinematic but technically credible
- Clean composition
- Realistic materials and lighting
- 16:9 aspect ratio
- No embedded text
- No logos
- No watermarks
- No fictional brand markings

The image must not depict unsafe or technically impossible equipment arrangements unless the experience explicitly requires them.

## 4. Technical consistency

Before accepting the image, verify:

- Device type is visually plausible
- Cabling and connectors are credible
- Sensor placement makes sense
- Machine geometry is coherent
- Safety elements are not misleading
- The visual matches the article or experience
- No accidental text or symbols create false information

## 5. File naming

Notebook images:

```text
article-XXX-topic.png
```

Experience images should follow the naming convention defined by the relevant experience specification.

Use lowercase, hyphen-separated names.

## 6. Storage

Notebook assets:

```text
Frontend/assets/images/notebook/
```

Experience assets must be stored in the existing experience asset structure. Do not create a new asset hierarchy without an architectural decision.

## 7. Integration

Codex must use the image unchanged unless the task explicitly authorizes editing, conversion or renaming.

The code must reference the existing repository path and follow the current asset-loading pattern.

## 8. Validation

Verify:

- Correct filename and path
- Correct aspect ratio
- Image loads in the application
- No visible text, logos or watermark
- No obvious technical inconsistency
- Responsive cropping remains acceptable
- Existing assets remain unchanged
