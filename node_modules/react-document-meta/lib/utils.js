export function clone({
  title,
  description,
  base,
  canonical,
  meta,
  link,
  auto
}) {
  try {
    return JSON.parse(
      JSON.stringify({ title, description, base, canonical, meta, link, auto })
    );
  } catch (x) {
    return {};
  }
}

export function defaults(target, source) {
  return Object.keys(source).reduce((acc, key) => {
    if (!target.hasOwnProperty(key)) {
      target[key] = source[key];
    } else if (
      typeof target[key] === 'object' &&
      !Array.isArray(target[key]) &&
      target[key]
    ) {
      defaults(target[key], source[key]);
    }

    return target;
  }, target);
}

// This is needed as not all browsers,
// including Edge and IE has not implemented .forEach() on NodeList
export function forEach(nodes, fn) {
  if (nodes && nodes.length) {
    Array.prototype.slice.call(nodes).forEach(fn);
  }
}
