// Synthetic public artifact shared by Player, workspace and browser QA.
// No production Experience or physical asset mapping is modified.
export function evidenceMediaArtifact(language = "en") {
  const es = language === "es";
  const actions = es
    ? ["Inspeccionar conector", "Evaluar la medición", "Verificar recuperación"]
    : ["Inspect connector", "Assess measurement", "Verify recovery"];
  const assets = ["CONTEXT", "CONNECTOR", "DETAIL", "NEXT", "VERIFY", "RECOVERY"].map(id => ({
    id, type: "image", src: `assets/fixture/${id}.svg`,
    alt: es ? `Vista de prueba ${id}` : `Test view ${id}`,
    caption: es ? `Referencia visual ${id}` : `Visual reference ${id}`,
    purpose: "evidence"
  }));
  const evidence = (id, source, content, media_ids) => ({
    id, source, content, type: "inspection", reliability: "confirmed", visibility: "public",
    ...(media_ids === undefined ? {} : { media_ids })
  });
  return {
    web_artifact_version: "2.0.0",
    identity: { id: "EXP-RESULT-FIXTURE", content_version: "1.0.0", class: "learning" },
    metadata: { slug: "result-fixture", title: es ? "Prueba de resultados" : "Result fixture",
      summary: es ? "Diagnóstico de prueba." : "Test diagnosis.", estimated_duration: 5, language },
    capabilities: [],
    public: {
      scenario: { initial_context: es ? "Máquina detenida." : "Machine stopped.",
        operational_state: es ? "Estado seguro" : "Safe state", initiating_event: es ? "Parada" : "Stop",
        learner_role: es ? "Técnico" : "Technician", safety_context: {} },
      stages: ["incident", "investigation", "solution"].map((phase, index) => ({
        id: `STAGE-${index + 1}`, phase, title: actions[index],
        situation: es ? `Situación de prueba ${index + 1}.` : `Test situation ${index + 1}.`,
        media_ids: [["CONTEXT"], ["NEXT"], ["VERIFY"]][index],
        decisions: [
          { id: `DEC-${index + 1}-YES`, action: actions[index], action_token: `YES-${index + 1}` },
          { id: `DEC-${index + 1}-NO`, action: es ? "Cambiar sin comprobar" : "Replace without checking", action_token: `NO-${index + 1}` }
        ]
      })),
      interactions: actions.flatMap((_, index) => [
        { action_token: `YES-${index + 1}`, outcome: "advance", next: index === 2 ? "COMPLETE" : `STAGE-${index + 2}`,
          unlocks: [["EVID-CONNECTOR", "EVID-NOTE"], [], ["EVID-RECOVERY"]][index] },
        { action_token: `NO-${index + 1}`, outcome: "retry", message: es ? "Revisa la evidencia e inténtalo de nuevo." : "Review the evidence and try again." }
      ]),
      evidence: [
        evidence("EVID-CONNECTOR", es ? "Inspección M12" : "M12 inspection", es ? "El conector está suelto." : "The connector is loose.", ["DETAIL", "CONNECTOR"]),
        evidence("EVID-NOTE", es ? "Observación" : "Observation", es ? "No hay daños visibles." : "No visible damage."),
        evidence("EVID-RECOVERY", es ? "Prueba funcional" : "Functional test", es ? "La señal y el ciclo se han recuperado." : "Signal and cycle recovered.", ["RECOVERY"])
      ],
      feedback: [],
      evaluation_policy: { provisional: true, outcomes: ["PASS", "PASS_WITH_GUIDANCE", "RETRY_RECOMMENDED"],
        mastery_outcomes: ["PASS"], thresholds: [
          { outcome: "RETRY_RECOMMENDED", minimum: 0, maximum: 49 },
          { outcome: "PASS_WITH_GUIDANCE", minimum: 50, maximum: 79 },
          { outcome: "PASS", minimum: 80, maximum: 100 }
        ] },
      visual: { educational_purpose: es ? "Relacionar acciones y evidencias." : "Connect actions and evidence.",
        representation: "illustrated", cover_asset_id: "CONTEXT", assets },
      completion: { title: es ? "Debrief de prueba" : "Test debrief", summary: es ? "Verificación completada." : "Verification completed.", media_ids: ["RECOVERY"] }
    }
  };
}
