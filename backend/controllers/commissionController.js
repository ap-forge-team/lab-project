import CommissionSetting from "../models/CommissionSetting.js";
import CommissionHistory from "../models/CommissionHistory.js";
import MESSAGES from "../Utils/messages.js";
import logger from "../Utils/logger.js";


// Create Commission
export const createCommission = async (req, res) => {
  try {
    const {
      commissionType,
      commissionValue
    } = req.body;

    if (!commissionType || commissionValue == null) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.COMMISSION.TYPE_VALUE_REQUIRED
      });
    }

    // Allow only one active commission
    const existing = await CommissionSetting.findOne({
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: MESSAGES.COMMISSION.ALREADY_EXISTS
      });
    }

    const commission =
      await CommissionSetting.create({
        commissionType,
        commissionValue,
        isActive: true
      });

    res.status(201).json({
      success: true,
      message: MESSAGES.COMMISSION.CREATED,
      commission
    });

  } catch (error) {

    logger.error("Create commission error", { message: error.message });

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



export const getCommission = async (req, res) => {

  try {

    const commission =
      await CommissionSetting.findOne({
        isActive: true
      });

    if (!commission) {

      return res.status(404).json({
        success: false,
        message: MESSAGES.COMMISSION.NOT_FOUND
      });

    }

    res.json({
      success: true,
      commission
    });

  } catch (error) {

    logger.error("Get commission error", { message: error.message });

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

export const updateCommission = async (req,res)=>{

try{

const {
commissionType,
commissionValue,
reason
}=req.body;

const current=
await CommissionSetting.findOne({
isActive:true
});

if(!current){

return res.status(404).json({
success:false,
message:MESSAGES.COMMISSION.NOT_FOUND
});

}

// Save history

await CommissionHistory.create({

oldCommissionType:
current.commissionType,

oldCommissionValue:
current.commissionValue,

newCommissionType:
commissionType,

newCommissionValue:
commissionValue,

changedBy:
req.user._id,

reason

});

// Update current setting

current.commissionType=
commissionType;

current.commissionValue=
commissionValue;

await current.save();

res.json({

success:true,

message:MESSAGES.COMMISSION.UPDATED,

commission:current

});

}catch(error){

logger.error("Update commission error", { message: error.message });

res.status(500).json({

success:false,

message:error.message

});

}

};

export const getCommissionHistory =
async(req,res)=>{

try{

const history=
await CommissionHistory
.find()
.populate(
"changedBy",
"name email"
)
.sort({
createdAt:-1
});

res.json({
success:true,
history
});

}catch(error){

logger.error("Get commission history error", { message: error.message });

res.status(500).json({
success:false,
message:error.message
});

}

};

export const deleteCommission = async (req, res) => {

  try {

    await CommissionSetting.findOneAndDelete({
      isActive: true
    });

    res.json({
      success: true,
      message: MESSAGES.COMMISSION.DELETED
    });

  } catch (error) {

    logger.error("Delete commission error", { message: error.message });

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
