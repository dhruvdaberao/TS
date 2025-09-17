import mongoose from 'mongoose';

const tribeMessageSchema = mongoose.Schema(
  {
    tribe: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tribe', 
        required: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    text: { 
        type: String, 
        required: true 
    },
    imageUrl: {
        type: String,
        default: null
    }
  },
  {
    timestamps: true,
  }
);

tribeMessageSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.tribeId = returnedObject.tribe.toString();
    returnedObject.senderId = returnedObject.sender.toString();
    returnedObject.timestamp = returnedObject.createdAt;
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.tribe;
    delete returnedObject.sender;
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
  }
});

const TribeMessage = mongoose.model('TribeMessage', tribeMessageSchema);
export default TribeMessage;