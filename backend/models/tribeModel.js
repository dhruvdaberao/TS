import mongoose from 'mongoose';

const tribeSchema = mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    avatarUrl: { 
        type: String, 
        default: null
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    members: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
  },
  {
    timestamps: true,
  }
);

tribeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Tribe = mongoose.model('Tribe', tribeSchema);
export default Tribe;
