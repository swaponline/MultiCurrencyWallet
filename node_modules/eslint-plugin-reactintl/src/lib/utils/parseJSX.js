export default function parseJSX({
    code,
    errors,
    options,
}) {
  return {
    code,
    errors,
    options,
    parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
            jsx: true,
        },
    },
  };
}
