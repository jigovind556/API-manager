const { ApiError } = require("./ApiError");

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((error) => {
                console.log('Error Handler Middleware', error);
                if (error instanceof ApiError) {
                    // If it's an ApiError, send a custom error response
                    if (!res.headersSent) {
                        res.status(error.statusCode).json({ message: error.message ,...error });
                    }
                } else {
                    // For other errors, send a generic Internal Server Error response
                    if (!res.headersSent) {
                        res.status(500).json({ message: 'Internal Server Error' });
                    }
                }

                next(error);
            }
            );
    }
}

module.exports = { asyncHandler }