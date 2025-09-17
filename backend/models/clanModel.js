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
        default: 'https://i.pravatar.cc/150?u=tribe_default' 
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

const Tribe = mongoose.model('Tribe', tribeSchema);
export default Tribe;