import { ExperiencePlayer } from "../experience-engine/player/experiencePlayer.js";

/**
 * Replay a transcript using a trusted, locally selected assessment artifact.
 * The caller owns artifact selection, authorization and session persistence.
 */
export function replayAssessment(artifact, commands) {
  if (artifact?.identity?.class !== "assessment") {
    throw new TypeError("A trusted assessment artifact is required");
  }
  if (!Array.isArray(commands) || commands.length > 256) {
    throw new TypeError("Invalid assessment transcript length");
  }

  const player = new ExperiencePlayer({ experience: artifact });
  for (const command of commands) {
    if (command === "start") {
      player.start();
    } else if (command === "continue") {
      player.continue();
    } else if (typeof command?.decisionId === "string"
      && Object.keys(command).length === 1
      && command.decisionId.length > 0 && command.decisionId.length <= 96) {
      player.selectDecision(command.decisionId);
    } else {
      throw new TypeError("Invalid assessment command");
    }
  }

  const state = player.getState();
  if (state.completionStatus !== "completed" || !state.evaluationResult) {
    return null;
  }
  return {
    experience: state.experience.id,
    contentVersion: state.experience.contentVersion,
    evaluation: state.evaluationResult
  };
}
