import mongoose from 'mongoose';

const messageSchema = mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    imageUrl: { type: String, default: null },
}, {
    timestamps: true,
});

messageSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.senderId = returnedObject.sender.toString();
    returnedObject.receiverId = returnedObject.receiver.toString();
    returnedObject.text = returnedObject.message;
    returnedObject.timestamp = returnedObject.createdAt;
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.sender;
    delete returnedObject.receiver;
    delete returnedObject.message;
    delete returnedObject.createdAt;
    delete returnedObject.updatedAt;
  }
});

const Message = mongoose.model('Message', messageSchema);
export default Message;