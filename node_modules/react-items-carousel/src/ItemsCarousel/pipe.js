export default (...fns) => (arg) => fns.reduce((acc, fn) => fn(acc), arg);
