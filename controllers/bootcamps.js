const Bootcamp = require("./../models/Bootcamp");
const ErrorResponse = require("./../utils/errorResponse");
const asyncHandler = require("./../middleware/async");
const geocoder = require("../utils/geocoder");

// @desc Get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async(req,res,next) => {
        let query;
        const reqQuery = {...req.query};

        const removeFields = ["select","sort","page","limit"];

        // Loop over removeFields and delete them from reqQuery

        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => {`$${match}`});

        query = Bootcamp.find(JSON.parse(queryStr).populate("courses"))

        // Select Fields
        if(req.query.select){
            const fields = req.query.select.split(",").join(" ");
            query = query.select(fields);
        }

        // Sort

        if(req.query.sort){
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        }else{
            query = query.sort("-createdAt");
        }

        // Pagination

        const page = parseInt(req.query.page,10) || 1;
        const limit = parseInt(req.query.limit,10) || 100;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Bootcamp.countDocuments();

        query = query.skip(startIndex).limit(limit);



        // Execution

        const bootcamps = await query;

        // Pagination result

        const pagination = {};

        if(endIndex < total){
            pagination.next = {
                page: page+1,
                limit
            }
        }

        if(startIndex > 0){
            pagination.prev = {
                page: page - 1,
                limit
            }
        }



        res.status(200).json({
            success: true,
            data: bootcamps,
            count: bootcamps.length,
            pagination
        })
});

// @desc Get single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async(req,res,next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }
        res.status(200).json({
            success: true,
            data: bootcamp
        })
})

// @desc Create single bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = asyncHandler(async(req,res,next) => {
        const bootcamp = await Bootcamp.create(req.body)
        res.status(201).json({
            success: true,
            data: bootcamp
        })
})

// @desc Update single bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asyncHandler(async(req,res,next) => {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
            new: true,
            runValidators: true
        })
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }
        res.status(200).json({
            success: true,
            data: bootcamp
        })
})

// @desc Delete single bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asyncHandler(async(req,res,next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }

        bootcamp.remove();

        res.status(200).json({
            success: true,
            data: {}
        })
})


// @desc Get bootcamps within a radius
// @route GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = asyncHandler(async(req,res,next) => {
    const { zipcode, distance } = req.params;

    // Get latitude and longitude from geocoder

    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide distance by radius of the earth
    // Earth Radius = 3963 miles / 6378 km

    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: { $centerSphere: [[lng,lat],radius] }
        }
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})

// @desc Upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private
exports.bootcampPhotoUpload = asyncHandler(async(req,res,next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);


    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
    }

    if(!req.files){
        return next(new ErrorResponse(`Please upload a file`,400));
    }

    let file = req.files.file;

    // Make sure that the image is a photo

    if(!file.mimetype.startsWith("image")){
        return next(new ErrorResponse(`Please upload an image file`,400));
    }

    // Check file size

    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`The image is too big, please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,400));
    }


    // Create custom filename

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (error) => {
        if(error){
            console.error(error);
            return next(new ErrorResponse(`Problem with file upload`,500));
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name});
        res.status(200).json({
            success: true,
            data: file.name
        })
    })

    console.log(file.name);

})

