const en = {
  note: "Engineering Note", read: "Read", close: "Close article", readingTime: "min read",
  carousel: "Engineering Notes carousel", filter: "Filter Engineering Notes by category",
  choose: "Choose Engineering Notes category", previous: "Previous Engineering Note", next: "Next Engineering Note",
  all: "All", of: "of", empty: "No Engineering Notes are available in this category."
};
const es = {
  note: "Nota de ingeniería", read: "Leer", close: "Cerrar artículo", readingTime: "min de lectura",
  carousel: "Carrusel de notas de ingeniería", filter: "Filtrar notas de ingeniería por categoría",
  choose: "Elegir categoría de notas de ingeniería", previous: "Nota de ingeniería anterior", next: "Nota de ingeniería siguiente",
  all: "Todas", of: "de", empty: "No hay notas de ingeniería en esta categoría."
};
export function notebookUi(locale) { return locale === "es" ? es : en; }
