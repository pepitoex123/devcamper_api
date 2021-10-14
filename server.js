const express = require("express");
const dotenv = require("dotenv");

// Load env vars

dotenv.config({path: "./config/config.env"});

const app = express();

app.get("/api/v1/bootcamps", (req,res) => {
    res.status(200).json({
        success: true,
        message: "Show all bootcamps!"
    });
})

app.get("/api/v1/bootcamps/:id", (req,res) => {
    res.status(200).json({
        success: true,
        message: `The bootcamp with id ${req.params.id} was sent to you`
    })
})

app.post("/api/v1/bootcamps", (req,res) => {
    res.status(200).json({
        success: true,
        message: "The new bootcamp was created!"
    })
})

app.put("/api/v1/bootcamps/:id", (req,res) => {
    res.status(200).json({
        success: true,
        message: `The bootcamp with id ${req.params.id} was updated`
    })
})

app.delete("/api/v1/bootcamps/:id", (req,res) => {
    res.status(200).json({
        success: true,
        message: `The bootcamp with id ${req.params.id} was deleted`
    })
})



const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}...`));