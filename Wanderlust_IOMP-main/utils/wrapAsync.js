module.exports = (fn) => {
    if (typeof fn !== 'function') {
        console.error("wrapAsync called with:", fn);
        throw new Error("wrapAsync requires a function");
    }
    return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};
