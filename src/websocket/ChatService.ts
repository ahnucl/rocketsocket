import { container } from 'tsyringe';
import { io } from '../http';
import { CreateChatRoomService } from '../services/CreateChatRoomService';
import { CreateMessageService } from '../services/CreateMessageService';
import { CreateUserService } from '../services/CreateUserService';
import { GetAllUsersService } from '../services/GetAllUsersService';
import { GetChatRoomByIdService } from '../services/GetChatRoomByIdService';
import { GetChatRoomByUsersService } from '../services/GetChatRoomByUsersService';
import { GetMessagesByChatRoomService } from '../services/GetMessagesByChatRoomService';
import { GetUserBySocketIdService } from '../services/GetUserBySocketIdService';

io.on('connect', socket => {
  socket.on('start', async data => { // Tipar esse retorno do Websocket?
    const { email, avatar, name } = data
    const createUserService = container.resolve(CreateUserService)

    const user = await createUserService.execute({
      avatar,
      email,
      name,
      socket_id: socket.id  
    })

    socket.broadcast.emit('new_users', user)
  })

  socket.on('get_users', async (callback) => {
    const getAllUsersService = container.resolve(GetAllUsersService)
    const users = await getAllUsersService.execute()

    callback(users)
  })

  socket.on('start_chat', async (data, callback) => {
    const createChatRoomService = container.resolve(CreateChatRoomService)
    const getChatRoomByUsersService = container.resolve(GetChatRoomByUsersService)
    const getUserBySocketIdService = container.resolve(GetUserBySocketIdService)
    const getMessagesByChatRoomService = container.resolve(GetMessagesByChatRoomService)

    const userLogged = await getUserBySocketIdService.execute(socket.id)

    let room = await getChatRoomByUsersService.execute([data.idUser, userLogged._id])

    if(!room) {
      room = await createChatRoomService.execute([data.idUser, userLogged._id])
    }

    socket.join(room.idChatRoom)

    const messages = await getMessagesByChatRoomService.execute(room.idChatRoom)

    callback({ room, messages })
  })

  socket.on('message', async data => {
    /**
     * Se um usuário cair, ainda vai ser posível ver as mensagens? As mensagens estão ligadas
     * à sala, e a sala não depende dos socket.id e sim dos user._id
     */

    const getUserBySocketIdService = container.resolve(GetUserBySocketIdService)
    const getChatRoomByIdService = container.resolve(GetChatRoomByIdService)
    const createMessageService = container.resolve(CreateMessageService)

    const user = await getUserBySocketIdService.execute(socket.id)

    const message = await createMessageService.execute({
      from: user._id,
      roomId: data.idChatRoom,
      text: data.message,
    })

    // Enviar mensagem para outros usuários da sala
    io.to(data.idChatRoom).emit('message', { message, user }) // já não tem o user na message?

    // Enviar notificação para o usuário correto
    const room = await getChatRoomByIdService.execute(data.idChatRoom)

    const destinationUser = room.idUsers.find(roomUser => String(roomUser._id) !== String(user._id))

    io.to(destinationUser.socket_id).emit('notification', {
      from: user
    })
  })
})