import express from "express";

import {
    registerUser,
    registerHospital,
    login
} from "../controllers/auth.controller.js";

import upload from "../middlewares/upload.middleware.js";


const router= express.Router();


router.post("/register", registerUser);

router.post("/login",login);

router.post("/hospital/register",upload.single("document"),registerHospital,);

export default router;