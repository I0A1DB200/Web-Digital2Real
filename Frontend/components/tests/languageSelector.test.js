import test from "node:test";
import assert from "node:assert/strict";
import { createLocalePreference, localeStorageKey } from "../../data/locale.js";
import { createLanguageSelector } from "../languageSelector.js";

function documentStub() {
  return { createElement() { return { children: [], attributes: {}, listeners: {},
    appendChild(child) { this.children.push(child); },
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(key, value) { this.listeners[key] = value; },
    focus() { this.focused = true; }
  }; } };
}

test("global selector exposes ES/EN, selected state, persistence and native buttons", async () => {
  const values = new Map([[localeStorageKey, "es"]]);
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const preference = createLocalePreference({ storage });
  const selector = createLanguageSelector(preference, { documentRef: documentStub() });
  const [es, en] = selector.element.children;
  assert.equal(es.type, "button");
  assert.equal(es.textContent, "ES");
  assert.equal(es.attributes["aria-pressed"], "true");
  await en.listeners.click();
  assert.equal(en.attributes["aria-pressed"], "true");
  assert.equal(en.focused, true);
  assert.equal(createLocalePreference({ storage }).getLocale(), "en");
  assert.equal(values.size, 1);
  selector.destroy();
});

test("failed or pending Experience transition cannot commit a different global language", async () => {
  const preference = createLocalePreference({ storage: null, initialLocale: "en" });
  let release;
  const remove = preference.beforeChange(() => new Promise(resolve => { release = resolve; }));
  const transition = preference.setLocale("es");
  assert.equal(preference.isPending(), true);
  assert.equal(await preference.setLocale("en"), false);
  release(false);
  assert.equal(await transition, false);
  assert.equal(preference.getLocale(), "en");
  remove();
  assert.equal(await preference.setLocale("es"), true);
  assert.equal(preference.getLocale(), "es");
  assert.equal(await preference.setLocale("it"), true);
  assert.equal(preference.getLocale(), "en");
});
