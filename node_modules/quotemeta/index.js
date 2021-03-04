module.exports = function (str) {
    return String(str).replace(/(\W)/g, '\\$1');
};
