const { PLUGIN_NAME } = require("./constants");

exports.buildLegacySrcReplaceCode = function(
  source,
  methodName,
  shouldSupressErrors = false
) {
  return [
    `// ${PLUGIN_NAME} monkey-patching`,
    `var originalScript = (function (document) {`,
    source,
    `return script;`,
    `})({`,
    `  createElement: function () { return {`,
    `       setAttribute: function (name, val) { this.name = val; }`,
    `     }; `,
    `  }`,
    `});`,
    ``,
    `try {`,
    `  if (typeof ${methodName} !== "function") {`,
    `    throw new Error("${PLUGIN_NAME}: '${methodName}' is not a function or not available at runtime. See https://github.com/agoldis/webpack-require-from#troubleshooting");`,
    `  }`,
    `  var newSrc = ${methodName}(originalScript.src);`,
    `  if (!newSrc || typeof newSrc !== 'string') {`,
    `    throw new Error("${PLUGIN_NAME}: '${methodName}' does not return string. See https://github.com/agoldis/webpack-require-from#troubleshooting");`,
    `  }`,
    `  originalScript.src = newSrc;`,
    `} catch (e) {`,
    `  if (!${shouldSupressErrors}) {`,
    `    console.error(e);`,
    `  }`,
    `}`,
    `var script = document.createElement('script');`,
    `Object.keys(originalScript).forEach(function (key) { script[key] = originalScript[key]; });`
  ].join("\n");
};

exports.buildSrcReplaceCode = function(
  source,
  methodName,
  shouldSupressErrors = false
) {
  return [
    source,
    `// ${PLUGIN_NAME} - monkey-patching`,
    `if (typeof jsonpScriptSrc === 'function') {`,
    `  var original_jsonpScriptSrc = jsonpScriptSrc;`,
    `  function patchJsonpScriptSrc () {`,
    `    try {`,
    `      if (typeof ${methodName} !== "function") {`,
    `        throw new Error("${PLUGIN_NAME}: '${methodName}' is not a function or not available at runtime. See https://github.com/agoldis/webpack-require-from#troubleshooting");`,
    `      }`,
    `      var newSrc = ${methodName}(original_jsonpScriptSrc.apply(this, arguments));`,
    `      if (!newSrc || typeof newSrc !== 'string') {`,
    `        throw new Error("${PLUGIN_NAME}: '${methodName}' does not return string. See https://github.com/agoldis/webpack-require-from#troubleshooting");`,
    `      }`,
    `      return newSrc;`,
    `    } catch (e) {`,
    `      if (!${shouldSupressErrors}) {`,
    `        console.error(e);`,
    `      }`,
    `      return original_jsonpScriptSrc.apply(this, arguments);`,
    `    }`,
    `  }`,
    `  jsonpScriptSrc = patchJsonpScriptSrc`,
    `}`
  ].join("\n");
};

exports.buildSrcReplaceCodeWebworker = function(source, methodName) {
  return [
    source,
    ``,
    `// ${PLUGIN_NAME} - monkey-patching`,
    `if (typeof importScripts === 'function') {`,
    `  var original  = importScripts;`,
    `  function patch () {`,
    `    original(${methodName}.apply(this, arguments));`,
    `  }`,
    `  importScripts  = patch;`,
    `}`
  ].join("\n");
};

exports.buildStringCode = function(pathString) {
  return `return "${pathString}";`;
};

exports.buildMethodCode = function(
  methodName,
  defaultPublicPath,
  shouldSupressErrors = false
) {
  return [
    `try {`,
    `  if (typeof ${methodName} !== "function") {`,
    `    throw new Error("${PLUGIN_NAME}: '${methodName}' is not a function or not available at runtime. See https://github.com/agoldis/webpack-require-from#troubleshooting");`,
    `  }`,
    `  return ${methodName}();`,
    `} catch (e) {`,
    `  if (!${shouldSupressErrors}) {`,
    `    console.error(e);`,
    `  }`,
    `  return "${defaultPublicPath.replace(/\\/g, "\\\\")}";`,
    `}`
  ].join("\n");
};

exports.buildVariableCode = function(
  variableName,
  defaultPublicPath,
  shouldSupressErrors = false
) {
  return [
    `try {`,
    `  if (typeof ${variableName} !== "string") {`,
    `    throw new Error("${PLUGIN_NAME}: '${variableName}' is not a string or not available at runtime. See https://github.com/agoldis/webpack-require-from#troubleshooting");`,
    `  }`,
    `  return ${variableName};`,
    `} catch (e) {`,
    `  if (!${shouldSupressErrors}) {`,
    `    console.error(e);`,
    `  }`,
    `  return "${defaultPublicPath.replace(/\\/g, "\\\\")}";`,
    `}`
  ].join("\n");
};


exports.buildWindowVariableCode = function(
  variableName,
  defaultPublicPath,
  shouldSupressErrors = false
) {
  return [
    `try {`,
    `  if (typeof window === "undefined") {`,
    `    return "${defaultPublicPath.replace(/\\/g, "\\\\")}";`,
    `  }`,
    `  window.${variableName} = "${defaultPublicPath.replace(/\\/g, "\\\\")}";`,
    `  return "${defaultPublicPath.replace(/\\/g, "\\\\")}";`,
    `} catch (e) {`,
    `  if (!${shouldSupressErrors}) {`,
    `    console.error(e);`,
    `  }`,
    `  return "${defaultPublicPath.replace(/\\/g, "\\\\")}";`,
    `}`
  ].join("\n");
};
