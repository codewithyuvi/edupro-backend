import { Router } from "express";
import { createSubject, getSubjects, updateSubjectName, deleteSubject } from "../controllers/subject.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/createSubject").post(
    // verifyJWT,
    createSubject
)

router.route("/getSubjects").get(
    // verifyJWT,
    getSubjects
)

router.route("/subjects/:id").put(
    verifyJWT,
    updateSubjectName
)

router.route("/subjects/:id").delete(
    verifyJWT,
    deleteSubject
)

export default router 