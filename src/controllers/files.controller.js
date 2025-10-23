import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { File } from "../models/files.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Subject } from "../models/subject.model.js";

const uploadFile = asyncHandler(async (req, res) => {
  let { fileName, fileType, subjectId, unitName } = req.body;
    
  // Trim all string fields
  fileName = fileName?.trim();
  fileType = fileType?.trim();
  unitName = unitName?.trim();

    if (subjectId === "") subjectId = undefined;
    if (unitName === "") unitName = undefined;

  if ([fileName, fileType].some((field) => (field) === "")) {
    throw new ApiError(400, "File name, file type are required.")
  }

  // Validate type
  const allowedTypes = ["pyq", "notes", "syllabus"];
  if (!allowedTypes.includes(fileType)) {
    throw new ApiError(400, "Invalid fileType.");
  }

  // Validation for notes
  if (fileType === "notes" && (!subjectId || !unitName)) {
    throw new ApiError(400, "Subject id and unit name required for notes.");
  }

  let fileLocalPath;
  if(req.files && Array.isArray(req.files.fileUrl) && req.files.fileUrl.length>0){
      fileLocalPath = req.files.fileUrl[0].path;
  }
  // console.log(fileLocalPath);
  // console.log(req.files[0]);
  // console.log(req.files.fileUrl[0]);
  
  if(!fileLocalPath){
      throw new ApiError(400, "File is required")
  }
  
  const fileUrl = await uploadOnCloudinary(fileLocalPath);
  // console.log(fileUrl);
  
  if(!fileUrl){
    throw new ApiError(400, "File url is required")
  }

  const uploadedFile = await File.create({
    fileName, 
    fileType, 
    fileUrl: fileUrl.secure_url, 
    subjectId, 
    unitName,
  });

  if (!uploadedFile) {
    throw new ApiError(500, "Something went wrong while uploading the PDF.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, uploadedFile, "Uploaded Successfully"));
});

const deleteFile = asyncHandler(async (req, res) => {
  const {id} = req.params

  if(!id){
    throw new ApiError(400, "Invalid PDF id")
  }

  const pdf = await File.findById(id);

  if(!pdf){
    throw new ApiError(404, "PDF not found")
  }

  const deletedFile = await File.deleteOne( {_id: id} )

  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      deletedFile,
      "PDF deleted successfully"
    )
  )
})

const getPdfByType = asyncHandler(async (req, res) => {
  const { type } = req.query
  const allowedValues = ['pyq', 'notes', 'syllabus']
  if(!allowedValues.includes(type)){
    throw new ApiError(400, "Select a Valid PDF Type")
  } 

  let result;
  if(type === 'pyq' || type === 'syllabus' ){
    result = await File.find({fileType: type})
  }
  else{
    result = await Subject.find({})
  }
  // console.log(file);

  return res
  .status(200)
  .json(new ApiResponse(200,result,"Pdf Filtered by type successfully"))
})

const getUnitNameofSubject = asyncHandler(async (req, res) => {
  const {subjectId} = req.query
  if(!subjectId){
    throw new ApiError(400, "Please select Subject First")
  }

  const units = await File.find({subjectId: subjectId})
  
  return res
  .status(200)
  .json(new ApiResponse(200,units,"Pdf Filtered by subjectId successfully"))
})

const getPdf = asyncHandler(async (req, res) => {
  const {pdfId} = req.query
  if(!pdfId){
    throw new ApiError(400, "Please select a pdf")
  }

  const pdf = await File.findById(pdfId)

  if(!pdf){
    throw new ApiError(500, "Could not find pdf")
  }

  return res
  .status(200)
  .json(new ApiResponse(200, pdf, "Pdf found successfully"))

})

export {uploadFile, deleteFile, getPdfByType, getUnitNameofSubject, getPdf}