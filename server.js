const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);
const PORT = process.env.PORT || 3050;

app.set('view engine', 'ejs');

app.use(express.static('public'));

/**
 * randomly generate a channel id
 * redirect user to join that channel
 */
app.get('/', (req, res) => {
  res.redirect(`/${nanoid()}`);
});

app.get('/:channel', (req, res) => {
  res.render('channel', { channelId: req.params.channel });
});

io.on('connection', (socket) => {
  // join channel
  socket.on('joined', (channelId, userId) => {
    socket.join(channelId);

    // introduce yourself to channel members
    socket.to(channelId).broadcast.emit('connected', userId);

    // say adios
    socket.on('disconnect', () => {
      socket.to(channelId).broadcast.emit('disconnected', userId);
    });
  });
});

server.listen(PORT, () => console.info(`Server Running On Port : ${PORT}`));
