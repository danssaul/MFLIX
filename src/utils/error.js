export function createError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

export function errorHandler(error, req, res, next) {
    let { status, message } = error;
    status = status ?? 500;
    message = message ?? "internal error server" + error
    res.status(status).send(message);
}