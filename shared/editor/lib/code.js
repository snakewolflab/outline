"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRecentlyUsedCodeLanguage = exports.languagesWithFourSpaceIndent = exports.getRefractorLangForLanguage = exports.getRecentlyUsedCodeLanguage = exports.getLoaderForLanguage = exports.getLabelForLanguage = exports.getFrequentCodeLanguages = exports.codeLanguages = void 0;
var _Storage = _interopRequireDefault(require("../../utils/Storage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const RecentlyUsedStorageKey = "rme-code-language";
const StorageKey = "frequent-code-languages";
const frequentLanguagesToGet = 5;
const frequentLanguagesToTrack = 10;
/**
 * List of supported code languages.
 *
 * Object key is the language identifier used in the editor, lang is the
 * language identifier used by Refractor. Note mismatches such as `markup` and
 * `mermaid`.
 */
const codeLanguages = exports.codeLanguages = {
  none: {
    lang: "",
    label: "Plain text"
  },
  abap: {
    lang: "abap",
    label: "ABAP",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/abap"))).then(m => m.default)
  },
  bash: {
    lang: "bash",
    label: "Bash",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/bash"))).then(m => m.default)
  },
  clike: {
    lang: "clike",
    label: "C",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/clike"))).then(m => m.default)
  },
  cpp: {
    lang: "cpp",
    label: "C++",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/cpp"))).then(m => m.default)
  },
  csharp: {
    lang: "csharp",
    label: "C#",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/csharp"))).then(m => m.default)
  },
  css: {
    lang: "css",
    label: "CSS",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/css"))).then(m => m.default)
  },
  csv: {
    lang: "csv",
    label: "CSV",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/csv"))).then(m => m.default)
  },
  dart: {
    lang: "dart",
    label: "Dart",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/dart"))).then(m => m.default)
  },
  diff: {
    lang: "diff",
    label: "Diff",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/diff"))).then(m => m.default)
  },
  docker: {
    lang: "docker",
    label: "Docker",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/docker"))).then(m => m.default)
  },
  elixir: {
    lang: "elixir",
    label: "Elixir",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/elixir"))).then(m => m.default)
  },
  erb: {
    lang: "erb",
    label: "ERB",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/erb"))).then(m => m.default)
  },
  erlang: {
    lang: "erlang",
    label: "Erlang",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/erlang"))).then(m => m.default)
  },
  fortran: {
    lang: "fortran",
    label: "Fortran",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/fortran"))).then(m => m.default)
  },
  go: {
    lang: "go",
    label: "Go",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/go"))).then(m => m.default)
  },
  graphql: {
    lang: "graphql",
    label: "GraphQL",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/graphql"))).then(m => m.default)
  },
  groovy: {
    lang: "groovy",
    label: "Groovy",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/groovy"))).then(m => m.default)
  },
  haskell: {
    lang: "haskell",
    label: "Haskell",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/haskell"))).then(m => m.default)
  },
  hcl: {
    lang: "hcl",
    label: "HCL",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/hcl"))).then(m => m.default)
  },
  markup: {
    lang: "markup",
    label: "HTML",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/markup"))).then(m => m.default)
  },
  ini: {
    lang: "ini",
    label: "INI",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/ini"))).then(m => m.default)
  },
  java: {
    lang: "java",
    label: "Java",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/java"))).then(m => m.default)
  },
  javascript: {
    lang: "javascript",
    label: "JavaScript",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/javascript"))).then(m => m.default)
  },
  json: {
    lang: "json",
    label: "JSON",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/json"))).then(m => m.default)
  },
  jsx: {
    lang: "jsx",
    label: "JSX",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/jsx"))).then(m => m.default)
  },
  kotlin: {
    lang: "kotlin",
    label: "Kotlin",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/kotlin"))).then(m => m.default)
  },
  kusto: {
    lang: "kusto",
    label: "Kusto",
    // @ts-expect-error Mermaid is not in types but exists
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/kusto"))).then(m => m.default)
  },
  lisp: {
    lang: "lisp",
    label: "Lisp",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/lisp"))).then(m => m.default)
  },
  lua: {
    lang: "lua",
    label: "Lua",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/lua"))).then(m => m.default)
  },
  makefile: {
    lang: "makefile",
    label: "Makefile",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/makefile"))).then(m => m.default)
  },
  markdown: {
    lang: "markdown",
    label: "Markdown",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/markdown"))).then(m => m.default)
  },
  mermaid: {
    lang: "mermaid",
    label: "Mermaid",
    // @ts-expect-error Mermaid is not in types but exists
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/mermaid"))).then(m => m.default)
  },
  mermaidjs: {
    lang: "mermaid",
    label: "Mermaid",
    // @ts-expect-error Mermaid is not in types but exists
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/mermaid"))).then(m => m.default)
  },
  nginx: {
    lang: "nginx",
    label: "Nginx",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/nginx"))).then(m => m.default)
  },
  nix: {
    lang: "nix",
    label: "Nix",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/nix"))).then(m => m.default)
  },
  objectivec: {
    lang: "objectivec",
    label: "Objective-C",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/objectivec"))).then(m => m.default)
  },
  ocaml: {
    lang: "ocaml",
    label: "OCaml",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/ocaml"))).then(m => m.default)
  },
  perl: {
    lang: "perl",
    label: "Perl",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/perl"))).then(m => m.default)
  },
  php: {
    lang: "php",
    label: "PHP",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/php"))).then(m => m.default)
  },
  powershell: {
    lang: "powershell",
    label: "Powershell",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/powershell"))).then(m => m.default)
  },
  promql: {
    lang: "promql",
    label: "PromQL",
    // @ts-expect-error PromQL is not in types but exists
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/promql"))).then(m => m.default)
  },
  protobuf: {
    lang: "protobuf",
    label: "Protobuf",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/protobuf"))).then(m => m.default)
  },
  python: {
    lang: "python",
    label: "Python",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/python"))).then(m => m.default)
  },
  r: {
    lang: "r",
    label: "R",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/r"))).then(m => m.default)
  },
  regex: {
    lang: "regex",
    label: "Regex",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/regex"))).then(m => m.default)
  },
  ruby: {
    lang: "ruby",
    label: "Ruby",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/ruby"))).then(m => m.default)
  },
  rust: {
    lang: "rust",
    label: "Rust",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/rust"))).then(m => m.default)
  },
  scala: {
    lang: "scala",
    label: "Scala",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/scala"))).then(m => m.default)
  },
  sass: {
    lang: "sass",
    label: "Sass",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/sass"))).then(m => m.default)
  },
  scss: {
    lang: "scss",
    label: "SCSS",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/scss"))).then(m => m.default)
  },
  "splunk-spl": {
    lang: "splunk-spl",
    label: "Splunk SPL",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/splunk-spl"))).then(m => m.default)
  },
  sql: {
    lang: "sql",
    label: "SQL",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/sql"))).then(m => m.default)
  },
  solidity: {
    lang: "solidity",
    label: "Solidity",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/solidity"))).then(m => m.default)
  },
  swift: {
    lang: "swift",
    label: "Swift",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/swift"))).then(m => m.default)
  },
  toml: {
    lang: "toml",
    label: "TOML",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/toml"))).then(m => m.default)
  },
  tsx: {
    lang: "tsx",
    label: "TSX",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/tsx"))).then(m => m.default)
  },
  typescript: {
    lang: "typescript",
    label: "TypeScript",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/typescript"))).then(m => m.default)
  },
  vb: {
    lang: "vbnet",
    label: "Visual Basic",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/vbnet"))).then(m => m.default)
  },
  verilog: {
    lang: "verilog",
    label: "Verilog",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/verilog"))).then(m => m.default)
  },
  vhdl: {
    lang: "vhdl",
    label: "VHDL",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/vhdl"))).then(m => m.default)
  },
  yaml: {
    lang: "yaml",
    label: "YAML",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/yaml"))).then(m => m.default)
  },
  xml: {
    lang: "markup",
    label: "XML",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/markup"))).then(m => m.default)
  },
  zig: {
    lang: "zig",
    label: "Zig",
    loader: () => Promise.resolve().then(() => _interopRequireWildcard(require("refractor/lang/zig"))).then(m => m.default)
  }
};

/**
 * Get the human-readable label for a given language.
 *
 * @param language The language identifier.
 * @returns The human-readable label for the language.
 */
const getLabelForLanguage = language => {
  const lang = codeLanguages[language] ?? codeLanguages.none;
  return lang.label;
};

/**
 * Get the Refractor language identifier for a given language.
 *
 * @param language The language identifier.
 * @returns The Refractor language identifier for the language.
 */
exports.getLabelForLanguage = getLabelForLanguage;
const getRefractorLangForLanguage = language => codeLanguages[language]?.lang;

/**
 * Get the loader function for a given language.
 *
 * @param language The language identifier.
 * @returns The loader function for the language, or undefined if not available.
 */
exports.getRefractorLangForLanguage = getRefractorLangForLanguage;
const getLoaderForLanguage = language => codeLanguages[language]?.loader;

// Mermaid diagrams have a separate insertion entry point, so they should never
// be remembered as a recently or frequently used code language.
exports.getLoaderForLanguage = getLoaderForLanguage;
const nonPersistableLanguages = ["mermaid", "mermaidjs"];
const isPersistableCodeLanguage = language => !nonPersistableLanguages.includes(language);

/**
 * Set the most recent code language used.
 *
 * @param language The language identifier.
 */
const setRecentlyUsedCodeLanguage = language => {
  if (!isPersistableCodeLanguage(language)) {
    return;
  }
  const frequentLangs = _Storage.default.get(StorageKey) ?? {};
  if (Object.keys(frequentLangs).length === 0) {
    const lastUsedLang = _Storage.default.get(RecentlyUsedStorageKey);
    if (lastUsedLang) {
      frequentLangs[lastUsedLang] = 1;
    }
  }
  frequentLangs[language] = (frequentLangs[language] ?? 0) + 1;
  const frequentLangEntries = Object.entries(frequentLangs);
  if (frequentLangEntries.length > frequentLanguagesToTrack) {
    sortFrequencies(frequentLangEntries);
    const lastEntry = frequentLangEntries[frequentLanguagesToTrack];
    if (lastEntry[0] === language) {
      frequentLangEntries.splice(frequentLanguagesToTrack - 1, 1);
    } else {
      frequentLangEntries.splice(frequentLanguagesToTrack);
    }
  }
  _Storage.default.set(StorageKey, Object.fromEntries(frequentLangEntries));
  _Storage.default.set(RecentlyUsedStorageKey, language);
};

/**
 * Get the most recent code language used.
 *
 * @returns The most recent code language used, or undefined if none is set.
 */
exports.setRecentlyUsedCodeLanguage = setRecentlyUsedCodeLanguage;
const getRecentlyUsedCodeLanguage = () => {
  const language = _Storage.default.get(RecentlyUsedStorageKey);
  return language && isPersistableCodeLanguage(language) ? language : undefined;
};

/**
 * Get the most frequent code languages used.
 *
 * @returns An array of the most frequent code languages used.
 */
exports.getRecentlyUsedCodeLanguage = getRecentlyUsedCodeLanguage;
const getFrequentCodeLanguages = () => {
  const recentLang = getRecentlyUsedCodeLanguage();
  const frequentLangEntries = Object.entries(_Storage.default.get(StorageKey) ?? {}).filter(_ref => {
    let [lang] = _ref;
    return isPersistableCodeLanguage(lang);
  });
  const frequentLangs = sortFrequencies(frequentLangEntries).slice(0, frequentLanguagesToGet).map(_ref2 => {
    let [lang] = _ref2;
    return lang;
  });
  const isRecentLangPresent = !!recentLang && frequentLangs.includes(recentLang);
  if (recentLang && !isRecentLangPresent) {
    frequentLangs.pop();
    frequentLangs.push(recentLang);
  }
  return frequentLangs;
};
exports.getFrequentCodeLanguages = getFrequentCodeLanguages;
const sortFrequencies = freqs => freqs.sort((a, b) => a[1] >= b[1] ? -1 : 1);
const languagesWithFourSpaceIndent = exports.languagesWithFourSpaceIndent = ["python", "java", "cpp", "csharp", "rust"];