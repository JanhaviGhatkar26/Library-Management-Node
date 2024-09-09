import mongoose ,{Schema, model} from "mongoose";
import jwt from "jsonwebtoken";

const bookSchema  = new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    publishDate:{
        type:Date,
        required:true
    },
    shelfNo:{
        type:Number,
        required:true,
        default:1,
        min:1
    },
    quantity:{
        type:Number,
        required:true,
        min:0,
    },
    status:{
        type: Boolean,
        default:true,
    },
    librarianID:{
        type: Schema.Types.ObjectId,
        ref:"Librarian"
    },
    created_by:{
        type:String,
    },
    updated_by:{
        type:String
    },
},{
    timestamps:true
})
export const Book = model("Book", bookSchema)