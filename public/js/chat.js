const socket = io('http://localhost:3000')
let idChatRoom = ''

function onLoad() {
  const urlParams = new URLSearchParams(window.location.search)
  const name = urlParams.get('name')
  const avatar = urlParams.get('avatar')
  const email = urlParams.get('email')

  document.querySelector('.user_logged').innerHTML += `
    <img
      class="avatar_user_logged"
      src=${avatar}
    />
    <strong id="user_logged">${name}</strong>
  `

  socket.emit('start', {
    email,
    name,
    avatar,
  })
  
  socket.on('new_users', user => {
    
    const existInDiv = document.getElementById(`user_${user._id}`)

    if(!existInDiv) {
      addUser(user)
    }
  })

  socket.emit('get_users', (users) => {
    users.map(user => {
      if(user.email !== email) {
        addUser(user)
      }
    })
  })

  socket.on('message', (data) => {
    if(data.message.roomId === idChatRoom){
      addMessage(data)
    } else {
      // Acender bolinha na outra room - pelo visto não funciona por aqui
      /**
       * Do jeito que está o backend, isso aqui só funcionaria se a room já fosse criada no login.
       * Se o destinatário clicar no remetente ele (dest) será adicionado à room. Antes disso ele
       * não está na room. Nesse caso, realmente o evento de notificação resolve bem melhor
       */
      
      // console.log('Teste')
      // const userNotification = document.querySelector(`li[idUser="${data.message.from}"]`)
      // console.log('Notificação', userNotification)
    }
  })

  socket.on('notification', data => {

    if(data.roomId !== idChatRoom){
      const user = document.getElementById(`user_${data.from._id}`)
      
      user.insertAdjacentHTML('afterbegin', `
      <div class="notification"></div>
      `)
    }
  })
}

function addMessage(data) {
  const divMessageUser = document.getElementById('message_user')

  const formatedDate = dayjs(data.message.created_at).format('DD/MM/YYYY HH:mm')

  divMessageUser.innerHTML +=  `
    <span class="user_name user_name_date">
      <img
        class="img_user"
        src=${data.user.avatar}
      />
      <strong>${data.user.name}</strong>
      <span> ${formatedDate}</span>
    </span>
    <div class="messages">
      <span class="chat_message">${data.message.text}</span>
    </div>
  `
}

function addUser(user) {
  const usersList = document.getElementById('users_list') 
  
  usersList.innerHTML += `
    <li
       class="user_name_list"
       id="user_${user._id}"
       idUser="${user._id}"
     >
       <img
         class="nav_avatar"
         src=${user.avatar}
       />
       ${user.name}
     </li>
  `
 }

document.getElementById('users_list').addEventListener('click', (event) => {
  
  document.getElementById('message_user').innerHTML = ''
  if(event.target && event.target.matches('li.user_name_list')) {
    const idUser = event.target.getAttribute('idUser')

    const notification = document.querySelector(`#user_${idUser} .notification`)
    if(notification) {
      notification.remove()
    }

    socket.emit('start_chat', { idUser }, (response) => {
      idChatRoom = response.room.idChatRoom

      response.messages.forEach(message => {

        addMessage({
          message,
          user: message.from
        })
      })
    })
  }
})

document.getElementById('user_message').addEventListener('keypress', (e) => {
  if(e.key === 'Enter') {
    const message = e.target.value

    socket.emit('message', { message, idChatRoom })

    e.target.value = ''
  }
})

onLoad()
