import { Router } from "express";
import { registerAdmin, loginAdmin, logoutAdmin, refreshAccessToken } from "../controllers/admin.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields( //.fields multiple files accept krta h in array
        [
            {
                name: "avatar",// this name should be the name in input in frontend.
                maxCount: 1
            }
        ]
    ), 
    registerAdmin //https://localhost:8000/api/v1/users/register
)  

router.route("/login").post(loginAdmin)

//secured routes
router.route("/logout").post(verifyJWT, logoutAdmin)
router.route("/refresh-token").post(refreshAccessToken)

export default router
