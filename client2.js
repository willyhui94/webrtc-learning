'use strict'

// checks if the browser support WebRTC
const hasUserMedia = () => {
  navigator.mediaDevices.getUserMedia =
    navigator.mediaDevices.getUserMedia ||
    navigator.mediaDevices.webkitGetUserMedia ||
    navigator.mediaDevices.mozGetUserMedia ||
    navigator.mediaDevices.msGetUserMedia;
  return !!navigator.mediaDevices.getUserMedia;
}

let stream = null;

if (hasUserMedia()) {
  const mediaStreamConstraints = {
    video: true,
    audio: true,
  };
  // get both video and audio stream from user's camera;
  navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
    .then((mediaStream) => {
      stream = mediaStream;
      console.log(mediaStream);
      const video = document.querySelector('#video');
      video.srcObject = mediaStream;

    })
    .catch((error) => {
      console.error(error);
    });
} else {
  alert(`Error:: WebRTC is not support`);
}

const btnGetAudioTracks = document.querySelector("#btnGetAudioTracks");
btnGetAudioTracks.addEventListener("click", (event) => {
  // console.log(event);
  console.log("getAudioTracks");
  console.log(stream.getAudioTracks());
});

const btnGetTrackById = document.querySelector("#btnGetTrackById");
btnGetTrackById.addEventListener("click", (event) => {
  // console.log(event);
  console.log("getTrackById");
  console.log(stream.getTrackById(stream.getAudioTracks()[0].id));
});

const btnGetTracks = document.querySelector("#btnGetTracks");
btnGetTracks.addEventListener("click", (event) => {
  // console.log(event);
  console.log("getTracks");
  console.log(stream.getTracks());
});

const btnGetVideoTracks = document.querySelector("#btnGetVideoTracks");
btnGetVideoTracks.addEventListener("click", (event) => {
  // console.log(event);
  console.log("getVideoTracks");
  console.log(stream.getVideoTracks());
});

const btnRemoveAudioTracks = document.querySelector("#btnRemoveAudioTracks");
btnRemoveAudioTracks.addEventListener("click", (event) => {
  // console.log(event);
  console.log("removeTracks - audio");
  stream.removeTrack(stream.getAudioTracks()[0]);
});

const btnRemoveVideoTracks = document.querySelector("#btnRemoveVideoTracks");
btnRemoveVideoTracks.addEventListener("clicl", (event) => {
  // console.log(event);
  console.log("removeTracks - video");
  stream.removeTrack(stream.getVideoTracks()[0]);
});



var peerConnectionConfig = {
  iceServers: [
    // {
    //   urls: [
    //     "turn:173.194.72.127:19305?transport=udp",
    //     "turn:[2404:6800:4008:C01::7F]:19305?transport=udp",
    //     "turn:173.194.72.127:443?transport=tcp",
    //     "turn:[2404:6800:4008:C01::7F]:443?transport=tcp"
    //   ],
    //   username: "CKjCuLwFEgahxNRjuTAYzc/s6OMT",
    //   credential: "u1SQDR/SQsPQIxXNWQT7czc/G4c="
    // },
    { urls: ["stun:stun.l.google.com:19302"] }
  ]
};
const peerConnection = new RTCPeerConnection(peerConnectionConfig);
console.log(peerConnection);