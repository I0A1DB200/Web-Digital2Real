export function createLabCard(lab, onOpen) {
  if (!lab || typeof lab !== "object") {
    throw new TypeError("Lab card requires laboratory data.");
  }

  if (typeof onOpen !== "function") {
    throw new TypeError("Lab card requires an activation callback.");
  }

  const title = getText(lab.title, "Laboratory");
  const technologies = Array.isArray(lab.technologies) ? lab.technologies : [];
  const visibleTechnologies = technologies.slice(0, 3);

  const card = document.createElement("button");
  card.type = "button";
  card.className = "lab-card reveal";
  card.setAttribute("aria-label", `Open laboratory ${title}`);
  card.style.border = "0";
  card.style.padding = "0";
  card.style.width = "100%";
  card.style.background = "transparent";
  card.style.textAlign = "inherit";

  const media = document.createElement("div");
  media.className = "lab-card__media";

  if (typeof lab.cover === "string" && lab.cover.length > 0) {
    const image = document.createElement("img");
    image.src = lab.cover;
    image.alt = `${title} laboratory preview`;
    image.loading = "lazy";
    media.appendChild(image);
  }

  const body = document.createElement("div");
  body.className = "lab-card__body";

  const metadata = document.createElement("div");
  metadata.className = "lab-card__meta";
  appendTextItem(metadata, lab.id);
  appendTextItem(metadata, lab.status);

  const heading = document.createElement("h2");
  heading.textContent = title;

  const tags = document.createElement("div");
  tags.className = "lab-card__tags";

  visibleTechnologies.forEach(technology => {
    appendTextItem(tags, technology);
  });

  body.append(metadata, heading, tags);
  card.append(media, body);
  card.addEventListener("click", () => onOpen(lab, card));

  return card;
}

function appendTextItem(container, value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return;
  }

  const item = document.createElement("span");
  item.textContent = String(value);
  container.appendChild(item);
}

function getText(value, fallback) {
  return typeof value === "string" && value.trim() ? value : fallback;
}
