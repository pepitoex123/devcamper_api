const express = require("express");

const router = express.Router();



router.get("/", (req,res) => {
    res.status(200).json({
        success: true,
        message: "Show all bootcamps!"
    });
})

router.get("/:id", (req,res) => {
    res.status(200).json({
        success: true,
        message: `The bootcamp with id ${req.params.id} was sent to you`
    })
})

router.post("/", (req,res) => {
    res.status(200).json({
        success: true,
        message: "The new bootcamp was created!"
    })
})

router.put("/:id", (req,res) => {
    res.status(200).json({
        success: true,
        message: `The bootcamp with id ${req.params.id} was updated`
    })
})

router.delete("/:id", (req,res) => {
    res.status(200).json({
        success: true,
        message: `The bootcamp with id ${req.params.id} was deleted`
    })
})

module.exports = router