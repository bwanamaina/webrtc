const socket = io('/');
const presenters = window.document.querySelector('#presenters');
const peer = new Peer(undefined, {
  host: '/',
  port: '3010',
});
const videoElement = window.document.createElement('VIDEO');
const peers = {};
const constraints = (window.constraints = {
  audio: false,
  video: true,
});

// mute so presenter don't hear themselves
videoElement.muted = true;

// get presenter stream from device camera and mic
navigator.mediaDevices.getUserMedia(constraints).then((stream) => {

  onPresenterJoin(videoElement, stream);

  peer.on('call', (call) => {
    call.answer(stream);

    const video = window.document.createElement('VIDEO');

    call.on('stream', (videoStream) => {
      onPresenterJoin(video, videoStream);
    });
  });

  socket.on('connected', (presenterId) => {
    onPresenterKnock(presenterId, stream);
  });
});

socket.on('disconnected', (presenterId) => {
  if (peers[presenterId]) peers[presenterId].close();
});

peer.on('open', (id) => {
  socket.emit('joined', CHANNEL_ID, id);
});

function onPresenterKnock(presenterId, stream) {
  const call = peer.call(presenterId, stream);
  const video = window.document.createElement('VIDEO');

  call.on('stream', (videoStream) => {
    onPresenterJoin(video, videoStream);
  });

  call.on('close', () => {
    video.remove();
  });

  peers[presenterId] = call;
}

function onPresenterJoin(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });

  presenters.append(video);
}
