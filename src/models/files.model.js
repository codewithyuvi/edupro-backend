import mongoose, {Schema} from "mongoose";

const fileSchema = Schema(
    {
        fileName: {
            type: String,
            required: true,
            lowercase: true,
        },

        fileType: {
            type: String,
            required: true,
            lowercase: true,
            enum: ['pyq', 'notes', 'syllabus']
        },

        fileUrl: {
            type: String,
            required: true,
        },
        
        subjectId: {
            type: Schema.Types.ObjectId,
            ref: "Subject",
            required: function(){
                return this.fileType === "notes"
            }
        },
        
        unitName: {
             type: String,
        },

        adminId:{
            type: Schema.Types.ObjectId,
            ref: "Admin"
        },

    },
    
    {
        timestamps: true
    }
)

fileSchema.pre("validate", function(next) {
  if (this.subjectId === "") {
    this.subjectId = undefined;  // avoids casting empty string to ObjectId
  }
  if (this.unitName === "") {
    this.unitName = undefined; // optional: clean empty unitName as well
  }
  next();
});

export const File = mongoose.model("File", fileSchema)