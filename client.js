'use strict'

const wsConnection = new WebSocket("ws://192.168.1.102:9090");

// handle messages from the server
wsConnection.onmessage = (message) => {
  console.log(`Got message ${message.data}`);
  const data = JSON.parse(message.data);

  switch (data.type) {
    case "login": {
      onLogin(data.success);
      break;
    }
    case "offer": {
      onOffer(data.offer, data.name);
      break;
    }
    case "answer": {
      onAnswer(data.answer);
      break;
    }
    case "candidate": {
      onCandidate(data.candidate);
      break;
    }
    default: {
      break;
    }
  }
};

// handle web socket initial connection
wsConnection.onopen = () => {
  console.warn("wsConnection.onopen:: ");
}

// handle web socket eeor
wsConnection.onerror = (error) => {
  console.warn("wsConnection.onerror:: error", error);
}

// Sending messages in JSON format via web socket
const send = (message) => {
  if (connectedUser) {
    message.name = connectedUser;
  }
  wsConnection.send(JSON.stringify(message));
}


let name = undefined;           // the username [string]
let connectedUser = undefined;  // the connected username [string]
let peerConnection = undefined; // RTCPeerConnection object
let sendingDataChannel = undefined     // RTCDataChannel object

const loginInput = document.querySelector("#loginInput");
const loginBtn = document.querySelector("#loginBtn");

const otherUsernameInput = document.querySelector("#otherUsernameInput");
const connectToOtherUsernameBtn = document.querySelector("#connectToOtherUsernameBtn");

const msgInput = document.querySelector("#msgInput");
const sendMsgBtn = document.querySelector("#sendMsgBtn");


// when a user click the login button
loginBtn.addEventListener("click", (event) => {
  console.warn("loginBtn click:: event", event);
  name = loginInput.value;
  if (name.length > 0) {
    send({
      type: "login",
      name: name,
    });
  }
});

// setup a peer connection with another user
connectToOtherUsernameBtn.addEventListener("click", (event) => {
  console.warn("connectToOtherUsernameBtn click:: event", event);
  const otherUsername = otherUsernameInput.value;
  connectedUser = otherUsername;
  if (otherUsername.length > 0) {
    // make an offer
    console.warn("Start Making Offer:: ");
    peerConnection.createOffer()
      .then((offer) => {
        console.warn("RTCPeerConnection:: Offer", offer);
        peerConnection.setLocalDescription(offer);
        send({
          type: "offer",
          offer: offer
        });
      })
      .catch((error) => {
        alert("An error has occurred.", error);
      })
  }
});

// when a user click the send message button
sendMsgBtn.addEventListener("click", (event) => {
  console.warn("sendMsgBtn click:: event", event);
  const message = msgInput.value;
  sendingDataChannel.send(message);
});

// when a user login
const onLogin = (success) => {
  console.warn("onLogin:: success", success);
  if (success === false) {
    alert(`oops... try a different username`);
  } else {
    const mediaStreamConstraints = {
      audio: true,
      video: true,
    }

    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
      .then((mediaStream) => {
        const localVideo = document.querySelector("#local-video");
        localVideo.srcObject = mediaStream;


        // creating our RTCPeerConnection object
        const peerConnectionConfig = {
          iceServers: [{
            url: "stun:stun.1.google.com:19302"
          }]
        };

        peerConnection = new RTCPeerConnection(peerConnectionConfig);
        console.log("RTCPeerConnection object was created");
        console.log(peerConnection);

        mediaStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, mediaStream);
        });

        peerConnection.ontrack = (event) => {
          const remoteVideo = document.querySelector("#remote-video");
          remoteVideo.srcObject = event.streams[0];
        }

        // setup ice handling
        // when the browser finds an ice candidate we send it to another peer
        peerConnection.onicecandidate = (peerConnectionIceEvent) => {
          console.warn("RTCPeerConnection.onicecandidate:: peerConnectionIceEvent", peerConnectionIceEvent);
          if (peerConnectionIceEvent.candidate) {
            send({
              type: "candidate",
              candidate: peerConnectionIceEvent.candidate
            });
          }
        }

        peerConnection.ondatachannel = receiveDataChannelHandler;
        openDataChannel();

      })
      .catch((error) => {
        console.log(error);
      });
  }
}

// when somebody wants to call us
const onOffer = (offer, name) => {
  console.warn("onOffer:: offer", offer);
  console.warn("onOffer:: name", name);
  connectedUser = name;
  peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  peerConnection.createAnswer()
    .then((answer) => {
      console.warn("RTCPeerConnection:: Answer", answer);
      peerConnection.setLocalDescription(answer);
      send({
        type: "answer",
        answer: answer
      });
    })
    .catch((error) => {
      alert("An error has occurred.", error);
    });
};

// when another user answers to our offer
const onAnswer = (answer) => {
  console.warn("onAnswer:: answer", answer);
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
};

const onCandidate = (candidate) => {
  console.warn("onCandidate:: candidate", candidate);
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
};

const receiveDataChannelHandler = (event) => {
  const receivedDataChannel = event.channel;
  receivedDataChannel.onopen = (event) => {
    console.log("receivedDataChannel.onopen:: event", event);
  };
  receivedDataChannel.onmessage = (event) => {
    console.log("receivedDataChannel.onmessage:: event", event);
  };
  receivedDataChannel.onclose = (event) => {
    console.log("receivedDataChannel.onclose:: event", event);
  };
}

// creating data channel
const openDataChannel = () => {
  console.warn("openDataChannel:: ");

  sendingDataChannel = peerConnection.createDataChannel("myDataChannel");

  sendingDataChannel.onmessage = (event) => {
    console.warn("dataChannel.onmessage:: event", event);
  };

  sendingDataChannel.onerror = (error) => {
    console.warn("dataChannel.onerror:: error", error);
  };
}