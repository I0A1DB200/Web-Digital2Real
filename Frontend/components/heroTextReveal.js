export function applyCharacterReveal(element, {
  stagger = 32,
  duration = 480,
  startDelay = 0
} = {}) {
  if (!element || typeof element.replaceChildren !== "function") {
    throw new TypeError("Character reveal requires a text element.");
  }

  const documentRef = element.ownerDocument ?? globalThis.document;
  const text = element.textContent ?? "";
  const accessibleText = documentRef.createElement("span");
  accessibleText.className = "hero-text-reveal__accessible";
  accessibleText.textContent = text;

  const animatedText = documentRef.createElement("span");
  animatedText.className = "hero-text-reveal__animated";
  animatedText.setAttribute("aria-hidden", "true");

  let characterIndex = 0;
  text.split(/(\s+)/u).filter(Boolean).forEach(token => {
    if (/^\s+$/u.test(token)) {
      animatedText.appendChild(documentRef.createTextNode(token));
      return;
    }

    const word = documentRef.createElement("span");
    word.className = "hero-text-reveal__word";
    Array.from(token).forEach(character => {
      const span = documentRef.createElement("span");
      span.className = "hero-text-reveal__character";
      span.textContent = character;
      span.style.setProperty("--hero-character-delay", `${startDelay + (characterIndex * stagger)}ms`);
      span.style.setProperty("--hero-character-duration", `${duration}ms`);
      word.appendChild(span);
      characterIndex += 1;
    });
    animatedText.appendChild(word);
  });

  element.replaceChildren(accessibleText, animatedText);
  return characterIndex;
}

export function getCharacterRevealDuration(characterCount, stagger, duration) {
  return duration + (Math.max(0, characterCount - 1) * stagger);
}
