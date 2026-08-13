import type { T_Dictionary, T_Locale } from "./types";

export const dictionaries: Record<T_Locale, T_Dictionary> = {
  uk: {
    "language.uk": "Українська",
    "language.en": "Англійська",
    "language.de": "Німецька",
    "language.ru": "Російська",
    "language.switcherLabel": "Мова",

    "nav.home": "Головна",
    "nav.popular": "Популярне",
    "nav.battle": "Батл",
    "nav.movies": "Фільми",

    "pagination.rowsPerPage": "Рядків на сторінці",
    "pagination.pageOf": "Сторінка {page} з {totalPages}",
    "pagination.previous": "Назад",
    "pagination.next": "Далі",
  },

  en: {
    "language.uk": "Ukrainian",
    "language.en": "English",
    "language.de": "German",
    "language.ru": "Russian",
    "language.switcherLabel": "Language",

    "nav.home": "Home",
    "nav.popular": "Popular",
    "nav.battle": "Battle",
    "nav.movies": "Movies",

    "pagination.rowsPerPage": "Rows per page",
    "pagination.pageOf": "Page {page} of {totalPages}",
    "pagination.previous": "Previous",
    "pagination.next": "Next",
  },

  de: {
    "language.uk": "Ukrainisch",
    "language.en": "Englisch",
    "language.de": "Deutsch",
    "language.ru": "Russisch",
    "language.switcherLabel": "Sprache",

    "nav.home": "Startseite",
    "nav.popular": "Beliebt",
    "nav.battle": "Battle",
    "nav.movies": "Filme",

    "pagination.rowsPerPage": "Zeilen pro Seite",
    "pagination.pageOf": "Seite {page} von {totalPages}",
    "pagination.previous": "Zurück",
    "pagination.next": "Weiter",
  },

  ru: {
    "language.uk": "Украинский",
    "language.en": "Английский",
    "language.de": "Немецкий",
    "language.ru": "Русский",
    "language.switcherLabel": "Язык",

    "nav.home": "Главная",
    "nav.popular": "Популярное",
    "nav.battle": "Батл",
    "nav.movies": "Фильмы",

    "pagination.rowsPerPage": "Строк на странице",
    "pagination.pageOf": "Страница {page} из {totalPages}",
    "pagination.previous": "Назад",
    "pagination.next": "Дальше",
  },
};