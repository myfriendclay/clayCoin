import io from 'socket.io-client'

const socket = io('http://localhost:3003/blockchain')

socket.on('connect', () => {
  socket.emit('subscribe', 'notifications')
});

export default socket;