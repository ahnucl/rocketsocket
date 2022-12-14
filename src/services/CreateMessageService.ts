import { injectable } from "tsyringe";
import { Message } from "../schemas/Message";

interface CreateMessageDTO {
  from: string
  text: string
  roomId: string
}

@injectable()
class CreateMessageService {

  async execute({ from, text, roomId }: CreateMessageDTO) {
    const message = await Message.create({ from, text, roomId})

    return message
  }
}

export { CreateMessageService }