module.exports = (err, req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        console.error("[ERROR]", err);
    }

    const statusCode = err.statusCode || 500;
    const status = err.status || "error";
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        status,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};