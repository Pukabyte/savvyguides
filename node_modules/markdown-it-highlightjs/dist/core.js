var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var core_exports = {};
__export(core_exports, {
  default: () => core
});
module.exports = __toCommonJS(core_exports);
function registerLangs(hljs, register) {
  for (const [lang, fn] of Object.entries(register)) {
    hljs.registerLanguage(lang, fn);
  }
}
function highlight(md, hljs, ignoreIllegals, code, lang) {
  try {
    return hljs.highlight(code, { language: lang !== "" ? lang : "plaintext", ignoreIllegals }).value;
  } catch (e) {
    return md.utils.escapeHtml(code);
  }
}
function highlightAuto(md, hljs, ignoreIllegals, code, lang) {
  if (lang !== "") {
    return highlight(md, hljs, ignoreIllegals, code, lang);
  }
  try {
    return hljs.highlightAuto(code).value;
  } catch (e) {
    return md.utils.escapeHtml(code);
  }
}
function wrapCodeRenderer(renderer) {
  return function wrappedRenderer(...args) {
    return renderer(...args).replace('<code class="', '<code class="hljs ').replace("<code>", '<code class="hljs">');
  };
}
function inlineCodeLanguageRule(state) {
  var _a, _b;
  for (const parentToken of state.tokens) {
    if (parentToken.type !== "inline") {
      continue;
    }
    if (parentToken.children == null) {
      continue;
    }
    for (const [i, token] of parentToken.children.entries()) {
      if (token.type !== "code_inline") {
        continue;
      }
      const next = parentToken.children[i + 1];
      if (next == null) {
        continue;
      }
      const match = /^{:?\.([^}]+)}/.exec(next.content);
      if (match == null) {
        continue;
      }
      const lang = match[1];
      next.content = next.content.slice(match[0].length);
      let className = (_a = token.attrGet("class")) != null ? _a : "";
      className += `${(_b = state.md.options.langPrefix) != null ? _b : "language-"}${lang}`;
      token.attrSet("class", className);
      token.meta = __spreadProps(__spreadValues({}, token.meta), { highlightLanguage: lang });
    }
  }
}
function inlineCodeRenderer(tokens, idx, options, env, slf) {
  var _a, _b;
  const token = tokens[idx];
  if (options.highlight == null) {
    throw new Error("`options.highlight` was null, this is not supposed to happen");
  }
  const highlighted = options.highlight(token.content, (_b = (_a = token.meta) == null ? void 0 : _a.highlightLanguage) != null ? _b : "", "");
  return `<code${slf.renderAttrs(token)}>${highlighted}</code>`;
}
function core(md, opts) {
  const optsWithDefaults = __spreadValues(__spreadValues({}, core.defaults), opts);
  if (optsWithDefaults.hljs == null) {
    throw new Error("Please pass a highlight.js instance for the required `hljs` option.");
  }
  if (optsWithDefaults.register != null) {
    registerLangs(optsWithDefaults.hljs, optsWithDefaults.register);
  }
  md.options.highlight = (optsWithDefaults.auto ? highlightAuto : highlight).bind(null, md, optsWithDefaults.hljs, optsWithDefaults.ignoreIllegals);
  if (md.renderer.rules.fence != null) {
    md.renderer.rules.fence = wrapCodeRenderer(md.renderer.rules.fence);
  }
  if (optsWithDefaults.code && md.renderer.rules.code_block != null) {
    md.renderer.rules.code_block = wrapCodeRenderer(md.renderer.rules.code_block);
  }
  if (optsWithDefaults.inline) {
    md.core.ruler.before("linkify", "inline_code_language", inlineCodeLanguageRule);
    md.renderer.rules.code_inline = wrapCodeRenderer(inlineCodeRenderer);
  }
}
core.defaults = {
  auto: false,
  code: false,
  inline: false,
  ignoreIllegals: false
};
