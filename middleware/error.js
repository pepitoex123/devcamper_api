const ErrorResponse = require("./../utils/errorResponse");


const errorHandler = (error,req,res,next) => {
    let err = {
        ...error
    }

    error.message = err.message;


    console.log(error.stack);

    if(error.name === "CastError"){
        const message = `Bootcamp not found with id of ${error.value}`
        error = new ErrorResponse(message, 404);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error"
    });
}

module.exports = errorHandler;