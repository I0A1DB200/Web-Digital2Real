import { immutableCopy } from "../core/signalDefinition.js";
import { PLCExpressionOperation, PLCInstructionOperation, PLCMemoryArea } from "./plcConstants.js";

export class PLCProgramError extends Error {
  constructor(code, message, context = {}) { super(message); this.name = "PLCProgramError"; this.code = code; this.context = immutableCopy(context); }
}

export function validatePrograms(candidates, memory) {
  if (!Array.isArray(candidates) || candidates.length === 0) throw new PLCProgramError("InvalidProgram", "At least one Program is required.");
  const programs = candidates.map(program => validateProgram(program, memory));
  ensureUniqueOrder(programs, "Program");
  return immutableCopy([...programs].sort(compareOrdered));
}

export function executePrograms(programs, memory, executionState) {
  const trace = [];
  for (const program of programs) {
    if (!program.enabled) continue;
    for (const network of program.networks) {
      if (!network.enabled) continue;
      for (const instruction of network.instructions) {
        const value = evaluateExpression(instruction.expression, memory, executionState);
        memory.write(executionState, instruction.operation === PLCInstructionOperation.WriteInternal ? PLCMemoryArea.Internal : PLCMemoryArea.Output, instruction.target, value);
        trace.push(immutableCopy({ programId: program.id, networkId: network.id, instructionId: instruction.id, target: instruction.target, value }));
      }
    }
  }
  return immutableCopy(trace);
}

export function evaluateExpression(expression, memory, executionState) {
  switch (expression.operation) {
    case PLCExpressionOperation.Literal: return expression.value;
    case PLCExpressionOperation.Read:
    case PLCExpressionOperation.NormallyOpen: return memory.read(executionState, expression.area, expression.address);
    case PLCExpressionOperation.NormallyClosed: return !memory.read(executionState, expression.area, expression.address);
    case PLCExpressionOperation.Not: return !evaluateExpression(expression.operand, memory, executionState);
    case PLCExpressionOperation.And: {
      let result = true;
      for (const operand of expression.operands) result = evaluateExpression(operand, memory, executionState) && result;
      return result;
    }
    case PLCExpressionOperation.Or: {
      let result = false;
      for (const operand of expression.operands) result = evaluateExpression(operand, memory, executionState) || result;
      return result;
    }
    default: throw new PLCProgramError("InvalidInstruction", `Unsupported expression operation: ${expression.operation}.`);
  }
}

function validateProgram(candidate, memory) {
  requireObject(candidate, "Program");
  const program = { id: requireId(candidate.id, "Program"), order: requireOrder(candidate.order, "Program"), enabled: candidate.enabled !== false, networks: null };
  if (!Array.isArray(candidate.networks) || candidate.networks.length === 0) throw new PLCProgramError("InvalidProgram", `Program ${program.id} requires Networks.`);
  program.networks = candidate.networks.map(network => validateNetwork(network, memory));
  ensureUniqueOrder(program.networks, "Network");
  program.networks.sort(compareOrdered);
  return program;
}

function validateNetwork(candidate, memory) {
  requireObject(candidate, "Network");
  const network = { id: requireId(candidate.id, "Network"), order: requireOrder(candidate.order, "Network"), enabled: candidate.enabled !== false, instructions: null };
  if (!Array.isArray(candidate.instructions) || candidate.instructions.length === 0) throw new PLCProgramError("InvalidProgram", `Network ${network.id} requires Instructions.`);
  network.instructions = candidate.instructions.map((instruction, index) => validateInstruction(instruction, memory, index));
  const ids = new Set();
  for (const instruction of network.instructions) { if (ids.has(instruction.id)) throw new PLCProgramError("InvalidInstruction", `Duplicate Instruction id: ${instruction.id}.`); ids.add(instruction.id); }
  return network;
}

function validateInstruction(candidate, memory, index) {
  requireObject(candidate, "Instruction");
  const operation = candidate.operation;
  if (!Object.hasOwn(PLCInstructionOperation, operation)) throw new PLCProgramError("InvalidInstruction", `Unsupported Instruction operation: ${operation}.`, { operation });
  const area = operation === PLCInstructionOperation.WriteInternal ? PLCMemoryArea.Internal : PLCMemoryArea.Output;
  const target = requireId(candidate.target, "Instruction target");
  if (!memory.has(area, target)) throw new PLCProgramError("InvalidMemoryReference", `Unknown ${area} target: ${target}.`, { area, target });
  return { id: requireId(candidate.id ?? `instruction-${index}`, "Instruction"), operation, target, expression: validateExpression(candidate.expression, memory) };
}

function validateExpression(candidate, memory) {
  requireObject(candidate, "Expression");
  const operation = candidate.operation;
  if (!Object.hasOwn(PLCExpressionOperation, operation)) throw new PLCProgramError("InvalidInstruction", `Unsupported expression operation: ${operation}.`, { operation });
  if (operation === PLCExpressionOperation.Literal) {
    if (typeof candidate.value !== "boolean") throw new PLCProgramError("InvalidInstruction", "Boolean Literal requires a Boolean value.");
    return { operation, value: candidate.value };
  }
  if ([PLCExpressionOperation.Read, PLCExpressionOperation.NormallyOpen, PLCExpressionOperation.NormallyClosed].includes(operation)) {
    if (!Object.hasOwn(PLCMemoryArea, candidate.area) || !memory.has(candidate.area, candidate.address)) throw new PLCProgramError("InvalidMemoryReference", `Unknown expression reference: ${candidate.area}/${candidate.address}.`, { area: candidate.area, address: candidate.address });
    return { operation, area: candidate.area, address: candidate.address };
  }
  if (operation === PLCExpressionOperation.Not) return { operation, operand: validateExpression(candidate.operand, memory) };
  if (!Array.isArray(candidate.operands) || candidate.operands.length < 2) throw new PLCProgramError("InvalidInstruction", `${operation} requires at least two operands.`);
  return { operation, operands: candidate.operands.map(operand => validateExpression(operand, memory)) };
}

function requireObject(value, label) { if (!value || typeof value !== "object" || Array.isArray(value)) throw new PLCProgramError("InvalidProgram", `${label} must be an object.`); }
function requireId(value, label) { if (typeof value !== "string" || !value.trim()) throw new PLCProgramError("InvalidProgram", `${label} requires a stable id.`); return value.trim(); }
function requireOrder(value, label) { if (!Number.isInteger(value) || value < 0) throw new PLCProgramError("InvalidProgram", `${label} order must be a non-negative integer.`); return value; }
function ensureUniqueOrder(items, label) { const orders = new Set(); for (const item of items) { if (orders.has(item.order)) throw new PLCProgramError("InvalidProgram", `${label} order values must be unique.`, { order: item.order }); orders.add(item.order); } }
function compareOrdered(left, right) { return left.order - right.order || left.id.localeCompare(right.id); }
