import mongoose from "mongoose";

const commissionHistorySchema = new mongoose.Schema(
{
    oldCommissionType:{
        type:String,
        enum:["Percentage","Fixed"]
    },

    oldCommissionValue:{
        type:Number
    },

    newCommissionType:{
        type:String,
        enum:["Percentage","Fixed"]
    },

    newCommissionValue:{
        type:Number
    },

    changedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    reason:{
        type:String,
        default:""
    }

},{
    timestamps:true
});

export default mongoose.model(
    "CommissionHistory",
    commissionHistorySchema
);
