import { Router } from "express";
import { uploadFile, deleteFile, getPdfByType, getUnitNameofSubject, getPdf } from "../controllers/files.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router()

router.route("/uploadFile").post(
    // verifyJWT,
    upload.fields(
        [
            {
                name: "fileUrl",
                maxCount: 1
            }
        ]
    ),
    uploadFile
)

router.route("/deleteFile/:id").delete(
    verifyJWT,
    deleteFile
)

router.route("/getType").get(
    getPdfByType
)

router.route("/subject").get(
    getUnitNameofSubject
)

router.route("/getPdf").get(
    getPdf
)



export default router