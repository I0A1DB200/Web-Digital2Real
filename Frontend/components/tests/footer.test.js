import assert from "node:assert/strict";
import test from "node:test";
import { getSite } from "../../data/site.js";
import { createFooter } from "../footer.js";

test("corporate footer updates in place and only links to the approved contact", () => {
  const documentRef = {
    createElement(tagName) {
      return {
        tagName,
        children: [],
        append(...children) { this.children.push(...children); }
      };
    }
  };

  const footer = createFooter(getSite("en"), documentRef);
  const [copyright, contact] = footer.element.children[0].children;

  assert.equal(footer.element.tagName, "footer");
  assert.equal(copyright.textContent, `© Digital2Real — ${new Date().getFullYear()}`);
  assert.equal(contact.tagName, "a");
  assert.equal(contact.textContent, "Contact");
  assert.equal(contact.href, "mailto:hello@d2rautomation.com");

  footer.update(getSite("es"));
  assert.deepEqual(footer.element.children[0].children, [copyright, contact]);
  assert.equal(contact.textContent, "Contacto");
  assert.equal(contact.href, "mailto:hello@d2rautomation.com");
});
