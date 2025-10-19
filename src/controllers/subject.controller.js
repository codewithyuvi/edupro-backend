import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Subject } from "../models/subject.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const createSubject = asyncHandler( async (req, res ) => {
    
    const { subjectName } = req.body
    // console.log(subjectName);
    
    if(!subjectName){
        throw new ApiError(400, "Subject Name can't be empty")
    }

    //check if subject name already exists 
    const existedSubjectName = await Subject.findOne({subjectName})

    if(existedSubjectName){
        console.log("exists");
        
        throw new ApiError(400, "Subject Name already exists")
    }
    
    const createdSubject = await Subject.create({
        subjectName
    })

    if(!createdSubject){
        throw new ApiError(500, "Something went wrong while creating a new subject ")
    }

    return res.status(201).json(
        new ApiResponse(201, createdSubject, "New Subject Added Successfully")
    )
})

const getSubjects = asyncHandler(async (req, res) => {

    const allSub = await Subject.find({}) // empty {} means we are finding with no creteria so we are getting all. if we want on any basis then {role: "admin"}
    // console.log(allSub);
    
    return res
    .status(200)
    .json( new ApiResponse(

        200,
        allSub,
        "All subjects fetched Successfully"
    )
    )
})

const updateSubjectName = asyncHandler(async (req, res) => {
    //todo later
})

const deleteSubject = asyncHandler(async (res, req) => {
    //todo later
})

export {
    createSubject,
    getSubjects,
    updateSubjectName,
    deleteSubject
}
