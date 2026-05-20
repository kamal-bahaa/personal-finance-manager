exports.sendSuccess = (res, statusCode, data = null, message = null) => {
    const response = { status: "success" };
    if (message) response.message = message;
    if (data !== null) response.data = data;
    return res.status(statusCode).json(response);
};

exports.sendFail = (res, statusCode, message) => {
    return res.status(statusCode).json({ status: "fail", message });
};