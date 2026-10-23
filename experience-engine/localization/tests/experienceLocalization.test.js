import assert from "node:assert/strict";
import test from "node:test";

import {
  ExperienceLocalizationError,
  resolveExperienceLocalization
} from "../experienceLocalization.js";

function v2Authoring() {
  return {
    contract_version: "2.0.0",
    metadata: { language: "es" },
    public: {
      title: "Título",
      summary: "Resumen",
      scenario: {
        initial_context: "Contexto",
        operational_state: "Estado",
        initiating_event: "Evento",
        learner_role: "Rol",
        safety_context: { safe_state: "Seguro", intervention_constraints: ["Límite"] }
      },
      learning_objectives: [{ id: "OBJ-1", description: "Objetivo" }],
      stages: [{ id: "STAGE-1", title: "Etapa", situation: "Situación" }],
      evidence: [{ id: "EVID-1", source: "Fuente", content: "Contenido" }],
      decisions: [
        { id: "DEC-CORRECT", action: "Acción correcta" },
        { id: "DEC-RETRY", action: "Acción alternativa" }
      ],
      visual: {
        educational_purpose: "Propósito",
        assets: [{ id: "ART-1", alt: "Alternativo", caption: "Leyenda" }]
      },
      completion: {
        title: "Cierre",
        summary: "Resumen",
        process: ["Proceso"],
        lesson: "Lección",
        avoided_errors: ["Error"],
        industrial_value: ["Valor"]
      }
    },
    private: {
      decision_logic: [
        { decision_id: "DEC-CORRECT", is_correct: true },
        { decision_id: "DEC-RETRY", is_correct: false, retry_feedback: "Reintenta." }
      ]
    }
  };
}

function englishTranslations() {
  return {
    locale: "en",
    translations: {
      title: "Title",
      summary: "Summary",
      scenario: {
        initial_context: "Context",
        operational_state: "State",
        initiating_event: "Event",
        learner_role: "Role",
        safety_context: { safe_state: "Safe", intervention_constraints: ["Limit"] }
      },
      learning_objectives: { "OBJ-1": { description: "Objective" } },
      stages: { "STAGE-1": { title: "Stage", situation: "Situation" } },
      evidence: { "EVID-1": { source: "Source", content: "Content" } },
      decisions: {
        "DEC-CORRECT": { action: "Correct action" },
        "DEC-RETRY": { action: "Alternative action" }
      },
      retry_feedback: { "DEC-RETRY": "Review the evidence available at this point." },
      visual: { educational_purpose: "Purpose" },
      assets: { "ART-1": { alt: "Alternative", caption: "Caption" } },
      completion: {
        title: "Close",
        summary: "Summary",
        process: ["Process"],
        lesson: "Lesson",
        avoided_errors: ["Error"],
        industrial_value: ["Value"]
      }
    }
  };
}

test("localizes V2 retry feedback without changing decision authority", () => {
  const localized = resolveExperienceLocalization(v2Authoring(), englishTranslations());

  assert.equal(localized.metadata.language, "en");
  assert.equal(localized.private.decision_logic[0].is_correct, true);
  assert.equal(Object.hasOwn(localized.private.decision_logic[0], "retry_feedback"), false);
  assert.equal(
    localized.private.decision_logic[1].retry_feedback,
    "Review the evidence available at this point."
  );
});

test("rejects incomplete V2 retry feedback translations", () => {
  const translations = englishTranslations();
  delete translations.translations.retry_feedback["DEC-RETRY"];

  assert.throws(
    () => resolveExperienceLocalization(v2Authoring(), translations),
    error => error instanceof ExperienceLocalizationError
      && error.code === "MISSING_TRANSLATION"
      && error.details.field === "retry_feedback.DEC-RETRY"
  );
});

test("preserves V1 localization when no V2 retry authority exists", () => {
  const authoring = v2Authoring();
  authoring.contract_version = "1.1.0";
  delete authoring.private.decision_logic[0].is_correct;
  delete authoring.private.decision_logic[1].is_correct;
  delete authoring.private.decision_logic[1].retry_feedback;
  const translations = englishTranslations();
  delete translations.translations.retry_feedback;

  const localized = resolveExperienceLocalization(authoring, translations);
  assert.equal(localized.public.decisions[1].action, "Alternative action");
});
