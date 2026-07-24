# Notebook Publishing Workflow

## Purpose

Define the standard process for publishing a Digital2Real Notebook Engineering Note.

## 1. Select the topic

The topic must provide reusable industrial automation knowledge and belong clearly to the Notebook.

## 2. Create the Engineering Note

Responsible: Notebook.

Required output:

- English
- Concise technical title
- Approximately one minute of reading
- Practical industrial focus
- Engineering Note
- No marketing language
- No invented technical information

## 3. Create the editorial image

Generate one industrial editorial image following the Editorial Image Workflow.

File naming convention:

```text
article-XXX-topic.png
```

Example:

```text
article-003-io-link.png
```

## 4. Add the image asset

Copy the image to:

```text
Frontend/assets/images/notebook/
```

Do not rename or modify existing assets.

## 5. Integrate with Codex

Codex must inspect the existing Notebook data model and add only the new article.

Current source of truth:

```text
Frontend/data/notebook.js
```

Codex may:

- Add the article data
- Reference the existing image
- Validate the implementation

Codex must not:

- Modify components
- Modify CSS
- Create new routes
- Refactor unrelated code
- Invent unspecified metadata

## 6. Validate

Verify:

- The new card appears
- The article ID is unique
- The image loads
- All sections render in order
- Code line breaks are preserved
- Modal close behavior works
- Keyboard behavior works
- Existing articles remain unchanged
- JavaScript syntax and repository checks pass

## Result

```text
Topic
  ↓
Engineering Note
  ↓
Editorial Image
  ↓
Asset Folder
  ↓
Codex Integration
  ↓
Validation
  ↓
Git Commit
```
