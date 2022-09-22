import mongoose, { Document, Schema} from 'mongoose';

type Message = Document & {
  to: String
  text: String
  created_at: Date
  roomId: String
}

const MessageSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: "Users"
  },
  text: String,
  created_at: {
    type: Date,
    default: Date.now()
  },
  roomId: {
    type: String,
    ref: "ChatRooms"
  },
})

const Message = mongoose.model<Message>("Messages", MessageSchema)

export { Message }

