import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import { User } from '../schemas/User';
interface CreateUserDTO {
  email: string
  socket_id: string
  avatar: string
  name: string
}

@injectable()
class CreateUserService {

  async execute({ email, avatar, name, socket_id }: CreateUserDTO) {
    const userAlreadyExists = await User.findOne({
      email
    })

    if(userAlreadyExists) {
      const user = await User.findOneAndUpdate({
        _id: userAlreadyExists._id
      },
      {
        $set: { avatar, name, socket_id }
      },
      {
        new: true
      })

      return user
    }

    const user = await User.create({
      email,
      avatar,
      name,
      socket_id,
    })

    return user
  }
}

export { CreateUserService }