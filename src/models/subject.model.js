import mongoose, {Schema} from "mongoose";

const subjectSchema = Schema (
    {
        subjectName: {
            type: String,
            required: true,
            lowercase: true,
            unique: true
        }
    },
    {
        timestamps: true
    }
)

export const Subject = mongoose.model("Subject", subjectSchema)