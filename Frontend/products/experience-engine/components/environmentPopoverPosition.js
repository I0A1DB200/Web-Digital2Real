const defaultGap = 16;
const defaultPadding = 12;
const defaultSafety = 8;

export function chooseEnvironmentPopoverPlacement({
  viewer,
  popover,
  anchor,
  obstacles = [],
  gap = defaultGap,
  padding = defaultPadding,
  safety = defaultSafety
}) {
  assertRect(viewer, "viewer");
  assertSize(popover, "popover");
  assertRect(anchor, "anchor");
  obstacles.forEach((rect, index) => assertRect(rect, `obstacles[${index}]`));

  const centerX = anchor.x + (anchor.width / 2);
  const centerY = anchor.y + (anchor.height / 2);
  const candidates = [
    candidate("right", anchor.x + anchor.width + gap, centerY - (popover.height / 2)),
    candidate("left", anchor.x - gap - popover.width, centerY - (popover.height / 2)),
    candidate("above", centerX - (popover.width / 2), anchor.y - gap - popover.height),
    candidate("below", centerX - (popover.width / 2), anchor.y + anchor.height + gap)
  ];
  const evaluated = candidates.map((item, order) => evaluate({
    ...item,
    order,
    viewer,
    popover,
    obstacles,
    padding,
    safety,
    centerX,
    centerY,
    docked: false
  }));
  const adjacent = evaluated
    .filter(item => item.overflow === 0 && item.collision === 0)
    .sort(compareScores)[0];
  if (adjacent) return freezePlacement(adjacent, popover, centerX, centerY);

  const minX = viewer.x + padding;
  const minY = viewer.y + padding;
  const maxX = viewer.x + viewer.width - padding - popover.width;
  const maxY = viewer.y + viewer.height - padding - popover.height;
  const docked = [
    candidate("dock-right", maxX, clamp(centerY - (popover.height / 2), minY, maxY)),
    candidate("dock-left", minX, clamp(centerY - (popover.height / 2), minY, maxY)),
    candidate("dock-top", clamp(centerX - (popover.width / 2), minX, maxX), minY),
    candidate("dock-bottom", clamp(centerX - (popover.width / 2), minX, maxX), maxY)
  ].map((item, order) => evaluate({
    ...item,
    order,
    viewer,
    popover,
    obstacles,
    padding,
    safety,
    centerX,
    centerY,
    docked: true
  })).sort(compareScores)[0];
  return freezePlacement(docked, popover, centerX, centerY);
}

function candidate(placement, x, y) {
  return { placement, x, y };
}

function evaluate(options) {
  const rect = { x: options.x, y: options.y, ...options.popover };
  const collision = options.obstacles.reduce((total, obstacle) => (
    total + overlapArea(rect, expand(obstacle, options.safety))
  ), 0);
  const overflow = overflowAmount(rect, options.viewer, options.padding);
  const nearestX = clamp(options.centerX, rect.x, rect.x + rect.width);
  const nearestY = clamp(options.centerY, rect.y, rect.y + rect.height);
  return {
    placement: options.placement,
    x: options.x,
    y: options.y,
    collision,
    overflow,
    distance: Math.hypot(nearestX - options.centerX, nearestY - options.centerY),
    order: options.order,
    docked: options.docked
  };
}

function compareScores(left, right) {
  return left.overflow - right.overflow
    || left.collision - right.collision
    || left.distance - right.distance
    || left.order - right.order;
}

function freezePlacement(result, popover, anchorX, anchorY) {
  const targetX = clamp(anchorX, result.x, result.x + popover.width);
  const targetY = clamp(anchorY, result.y, result.y + popover.height);
  const deltaX = targetX - anchorX;
  const deltaY = targetY - anchorY;
  return Object.freeze({
    placement: result.placement,
    docked: result.docked,
    x: result.x,
    y: result.y,
    connector: Object.freeze({
      x: anchorX,
      y: anchorY,
      length: Math.hypot(deltaX, deltaY),
      angle: Math.atan2(deltaY, deltaX) * (180 / Math.PI)
    })
  });
}

function overflowAmount(rect, viewer, padding) {
  const left = Math.max(0, viewer.x + padding - rect.x);
  const top = Math.max(0, viewer.y + padding - rect.y);
  const right = Math.max(0, rect.x + rect.width - (viewer.x + viewer.width - padding));
  const bottom = Math.max(0, rect.y + rect.height - (viewer.y + viewer.height - padding));
  return left + top + right + bottom;
}

function overlapArea(left, right) {
  const width = Math.max(0, Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x));
  const height = Math.max(0, Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y));
  return width * height;
}

function expand(rect, amount) {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    width: rect.width + (amount * 2),
    height: rect.height + (amount * 2)
  };
}

function clamp(value, minimum, maximum) {
  if (maximum < minimum) return minimum;
  return Math.min(Math.max(value, minimum), maximum);
}

function assertRect(rect, name) {
  assertSize(rect, name);
  if (!Number.isFinite(rect.x) || !Number.isFinite(rect.y)) {
    throw new TypeError(`${name} must provide finite x and y values.`);
  }
}

function assertSize(rect, name) {
  if (!rect || !Number.isFinite(rect.width) || !Number.isFinite(rect.height)
    || rect.width < 0 || rect.height < 0) {
    throw new TypeError(`${name} must provide finite non-negative dimensions.`);
  }
}
