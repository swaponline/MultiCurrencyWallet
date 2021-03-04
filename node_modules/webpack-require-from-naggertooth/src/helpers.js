const { PLUGIN_NAME } = require("./constants");
const { SyncWaterfallHook } = require("tapable");

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function dashToCamelCase(value) {
  const dashed = value.split("-");
  const cameled = dashed.map((el, i) => {
    if (i === 0) return el;
    return capitalizeFirstLetter(el);
  });
  return cameled.join("");
}

function fixJsonpScriptHook(tapable) {
  if (!tapable.hooks.jsonpScript) {
    tapable.hooks.jsonpScript = new SyncWaterfallHook([
      "source",
      "chunk",
      "hash"
    ]);
  }
}

exports.isLegacyTapable = function(tapable) {
  return tapable.plugin && tapable.plugin.name !== "deprecated";
};

exports.getHook = function(tapable, hookName) {
  if (exports.isLegacyTapable(tapable)) {
    // webpack < 4
    return tapable.plugin.bind(tapable, [hookName]);
  }

  fixJsonpScriptHook(tapable);

  const newHookName = dashToCamelCase(hookName);
  return tapable.hooks[newHookName].tap.bind(
    tapable.hooks[newHookName],
    PLUGIN_NAME
  );
};
