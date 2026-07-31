import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { parseExperienceYaml } from "../../adapter/yamlExperienceAdapter.js";
import { normalizeExperienceDefinition } from "../../normalization/experienceDefinitionNormalizer.js";
import { ExperiencePlayer } from "../../player/experiencePlayer.js";
import { validateExperienceDefinition } from "../../validation/experienceDefinitionValidator.js";
import { validateGeneratedWebArtifact } from "../../validation/generatedWebArtifactValidator.js";
import { validateNormalizedExperience } from "../../validation/normalizedExperienceValidator.js";
import { packageExperience } from "../experiencePackagingPipeline.js";

const experienceDirectory = new URL(
  "../../../content/experiences/io-link/EE-0008-io-link-device-offline/",
  import.meta.url
);
const authoringUrl = new URL("experience.yaml", experienceDirectory);
const assetDirectory = new URL("assets/", experienceDirectory);
const readAuthoring = async () =>
  parseExperienceYaml(await readFile(authoringUrl, "utf8"));
const clone = value => JSON.parse(JSON.stringify(value));

const assetExpectations = Object.freeze({
  "cover.webp": { type: "webp", width: 1280, height: 720 },
  "intro-incident.mp4": { type: "mp4", width: 1280, height: 720 },
  "evidence-sensor-led.gif": { type: "gif", width: 960, height: 540 },
  "evidence-master-port-3.gif": { type: "gif", width: 960, height: 540 },
  "evidence-online-diagnostics.gif": { type: "gif", width: 960, height: 540 },
  "evidence-topology.webp": { type: "webp", width: 1280, height: 720 },
  "evidence-voltage-check.webp": { type: "webp", width: 1280, height: 720 },
  "evidence-loose-m12.gif": { type: "gif", width: 960, height: 540 },
  "outro-recovery.mp4": { type: "mp4", width: 1280, height: 720 }
});

test("EE-0008 is a valid Authoring Definition using only governed references", async () => {
  const authoring = await readAuthoring();
  const validation = validateExperienceDefinition(authoring);

  assert.equal(validation.valid, true);
  assert.deepEqual(validation.incidents, []);
  assert.equal(authoring.metadata.id, "EXP-IOLINK-DEVICE-008");
  assert.equal(authoring.public.slug, "io-link-device-offline");
  assert.deepEqual(authoring.capability_references, [
    {
      capability_id: "ICF-01",
      competency_ids: ["COMP-STATE-INTERPRETATION"]
    },
    {
      capability_id: "ICF-11",
      competency_ids: [
        "COMP-EVIDENCE-TROUBLESHOOTING",
        "COMP-CONTROLLED-RECOVERY"
      ]
    }
  ]);
  assert.equal(authoring.public.stages.length, 8);
  assert.equal(authoring.public.decisions.length, 28);
  assert.equal(authoring.public.visual.assets.length, 9);
});

test("EE-0008 normalizes to a valid immutable Runtime with media associations", async () => {
  const authoring = await readAuthoring();
  const before = clone(authoring);
  const normalization = normalizeExperienceDefinition(authoring);
  const validation = validateNormalizedExperience(normalization.value);

  assert.equal(normalization.ok, true);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.incidents, []);
  assert.equal(normalization.value.public.visual.assets.length, 9);
  assert.deepEqual(normalization.value.public.stages[0].media_ids, ["MEDIA-INTRO-INCIDENT"]);
  assert.equal(normalization.value.public.completion.title, "Lección industrial");
  assert.deepEqual(authoring, before);
  assert.equal(Object.isFrozen(normalization.value), true);
});

test("EE-0008 produces a valid deterministic Web Artifact without reserved structures", async () => {
  const authoring = await readAuthoring();
  const first = packageExperience(authoring);
  const second = packageExperience(clone(authoring));
  const validation = validateGeneratedWebArtifact(first);

  assert.equal(validation.valid, true);
  assert.deepEqual(validation.incidents, []);
  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
  assert.equal(JSON.parse(JSON.stringify(first)).identity.id, "EXP-IOLINK-DEVICE-008");

  const forbiddenKeys = new Set([
    "private",
    "fault_model",
    "diagnostic_model",
    "decision_logic",
    "scoring",
    "score_effect",
    "safety_effect",
    "rationale",
    "consequence",
    "correct_answer",
    "technical_validation"
  ]);
  walk(first, key => assert.equal(forbiddenKeys.has(key), false, key));
});

test("EE-0008 Player reveals stage media progressively and public completion only at the end", async () => {
  const artifact = packageExperience(await readAuthoring());
  const player = new ExperiencePlayer({ experience: artifact });
  assert.equal(player.getState().completion, null);

  player.start();
  player.continue();
  assert.equal(player.getState().currentStage.id, "STAGE-01-INCIDENT");
  assert.deepEqual(player.getState().media.map(item => item.id), ["MEDIA-INTRO-INCIDENT"]);
  player.continue();

  for (const stage of artifact.public.stages.slice(1)) {
    assert.equal(player.getState().currentStage.id, stage.id);
    player.selectDecision(stage.decisions[0].id);
    player.continue();
  }

  const completed = player.getState();
  assert.equal(completed.interaction, "completion");
  assert.equal(completed.completion.title, "Lección industrial");
  assert.equal(completed.decisionHistory.length, 7);
  assert.deepEqual(completed.media.map(item => item.id), ["MEDIA-OUTRO-RECOVERY"]);
  assert.match(completed.completion.summary, /conector M12 parcialmente desenroscado/);
});

test("all EE-0008 media references resolve to valid required files", async () => {
  const authoring = await readAuthoring();
  const referenced = authoring.public.visual.assets.map(asset => path.basename(asset.src));

  assert.deepEqual(referenced.sort(), Object.keys(assetExpectations).sort());
  for (const [fileName, expected] of Object.entries(assetExpectations)) {
    const location = new URL(fileName, assetDirectory);
    await access(location);
    const bytes = await readFile(location);
    assert.ok(bytes.length > 1000, `${fileName} is unexpectedly small`);
    const metadata = inspectMedia(bytes, expected.type);
    assert.equal(metadata.width, expected.width, fileName);
    assert.equal(metadata.height, expected.height, fileName);
    if (expected.type === "gif") assert.equal(metadata.looping, true, fileName);
    if (expected.type === "mp4") {
      assert.ok(metadata.duration >= 4.5 && metadata.duration <= 5.8, fileName);
    }
  }
});

test("EE-0008 introduces no ID-specific Engine, Player, packaging or Frontend logic", async () => {
  const sources = await Promise.all([
    readFile(new URL("../experiencePackagingPipeline.js", import.meta.url), "utf8"),
    readFile(new URL("../../normalization/experienceDefinitionNormalizer.js", import.meta.url), "utf8"),
    readFile(new URL("../../projection/runtimeToWebArtifactProjector.js", import.meta.url), "utf8"),
    readFile(new URL("../../player/experiencePlayer.js", import.meta.url), "utf8"),
    readFile(new URL("../../../scripts/package-experience-engine.mjs", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../../../Frontend/products/experience-engine/components/experienceWorkspace.js",
        import.meta.url
      ),
      "utf8"
    )
  ]);

  sources.forEach(source => assert.doesNotMatch(source, /EE-0008|EXP-IOLINK-DEVICE-008/));
});

function walk(value, visitKey) {
  if (Array.isArray(value)) return value.forEach(item => walk(item, visitKey));
  if (!value || typeof value !== "object") return;
  Object.entries(value).forEach(([key, item]) => {
    visitKey(key);
    walk(item, visitKey);
  });
}

function inspectMedia(bytes, type) {
  if (type === "gif") {
    assert.equal(bytes.subarray(0, 6).toString("ascii"), "GIF89a");
    return {
      width: bytes.readUInt16LE(6),
      height: bytes.readUInt16LE(8),
      looping: bytes.includes(Buffer.from("NETSCAPE2.0"))
    };
  }
  if (type === "webp") {
    assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP");
    return webpDimensions(bytes);
  }
  assert.equal(bytes.subarray(4, 8).toString("ascii"), "ftyp");
  const movieHeader = findBox(bytes, "mvhd");
  assert.ok(movieHeader, "MP4 movie header is missing");
  const version = bytes[movieHeader];
  const timescaleOffset = movieHeader + (version === 1 ? 20 : 12);
  const durationOffset = movieHeader + (version === 1 ? 24 : 16);
  const timescale = bytes.readUInt32BE(timescaleOffset);
  const duration = version === 1
    ? Number(bytes.readBigUInt64BE(durationOffset))
    : bytes.readUInt32BE(durationOffset);
  const trackHeader = findBox(bytes, "tkhd");
  assert.ok(trackHeader, "MP4 track header is missing");
  const width = bytes.readUInt32BE(findBoxEnd(bytes, "tkhd") - 8) / 65536;
  const height = bytes.readUInt32BE(findBoxEnd(bytes, "tkhd") - 4) / 65536;
  return { width, height, duration: duration / timescale };
}

function webpDimensions(bytes) {
  const chunk = bytes.subarray(12, 16).toString("ascii");
  if (chunk === "VP8X") {
    return {
      width: 1 + bytes.readUIntLE(24, 3),
      height: 1 + bytes.readUIntLE(27, 3)
    };
  }
  if (chunk === "VP8 ") {
    return {
      width: bytes.readUInt16LE(26) & 0x3fff,
      height: bytes.readUInt16LE(28) & 0x3fff
    };
  }
  throw new Error(`Unsupported WebP chunk ${chunk}`);
}

function findBox(bytes, target, start = 0, end = bytes.length) {
  let offset = start;
  while (offset + 8 <= end) {
    const size = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString("ascii");
    if (type === target) return offset + 8;
    if (["moov", "trak", "mdia", "minf", "stbl"].includes(type)) {
      const nested = findBox(bytes, target, offset + 8, offset + size);
      if (nested) return nested;
    }
    if (size < 8) break;
    offset += size;
  }
  return null;
}

function findBoxEnd(bytes, target) {
  const content = findBox(bytes, target);
  if (!content) return null;
  return content - 8 + bytes.readUInt32BE(content - 8);
}
