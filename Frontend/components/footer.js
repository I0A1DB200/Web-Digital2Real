export function createFooter(site, documentRef = document) {
  const element = documentRef.createElement("footer");
  element.className = "site-footer";

  const inner = documentRef.createElement("div");
  inner.className = "site-footer__inner";
  const copyright = documentRef.createElement("span");
  const contact = documentRef.createElement("a");
  inner.append(copyright, contact);
  element.append(inner);

  function update({ name, footer }) {
    copyright.textContent = `© ${name} — ${new Date().getFullYear()}`;
    contact.textContent = footer.contactLabel;
    contact.href = `mailto:${footer.contactEmail}`;
  }

  update(site);
  return { element, update };
}
