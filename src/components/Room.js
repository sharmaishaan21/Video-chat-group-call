// import React, { useState, useEffect, useRef } from 'react';
// import Peer from 'simple-peer';
// import socket from '../socket';
// import VideoCard from './VideoCard';
// import BottomBar from './BottomBar';
// // import Chat from './Chat';

// const hardCodedUser = {
//   "email": "test@gmail.com"
// }

// const Room = (props) => {
//   const currentUser = sessionStorage.getItem('user');
//   const [peers, setPeers] = useState([]);
//   const [userVideoAudio, setUserVideoAudio] = useState({
//     localUser: { video: true, audio: true },
//   });
//   const [videoDevices, setVideoDevices] = useState([]);
//   const [displayChat, setDisplayChat] = useState(false);
//   const [screenShare, setScreenShare] = useState(false);
//   const [showVideoDevices, setShowVideoDevices] = useState(false);
//   const peersRef = useRef([]);
//   const userVideoRef = useRef();
//   const screenTrackRef = useRef();
//   const userStream = useRef();
//   const roomId = props.match.params.roomId;

//   useEffect(() => {
//     // Get Video Devices
//     navigator.mediaDevices.enumerateDevices().then((devices) => {
//       const filtered = devices.filter((device) => device.kind === 'videoinput');
//       setVideoDevices(filtered);
//     });

//     // Set Back Button Event
//     window.addEventListener('popstate', goToBack);

//     // Connect Camera & Mic
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         userVideoRef.current.srcObject = stream;
//         userStream.current = stream;

//         socket.emit('join room', { room: roomId, email: "test@gmail.com", user:  hardCodedUser});
//         socket.on('all users', (users) => {
//           // all users
//           const peers = [];
//           users.forEach(({ userId, info }) => {
//             let { userName, video, audio } = info;

//             if (userName !== currentUser) {
//               const peer = createPeer(userId, socket.id, stream);

//               peer.userName = userName;
//               peer.peerID = userId;

//               peersRef.current.push({
//                 peerID: userId,
//                 peer,
//                 userName,
//               });
//               peers.push(peer);

//               setUserVideoAudio((preList) => {
//                 return {
//                   ...preList,
//                   [peer.userName]: { video, audio },
//                 };
//               });
//             }
//           });

//           setPeers(peers);
//         });

//         socket.on('user joined', ({ signal, from, info }) => {
//           let { userName, video, audio } = info;
//           const peerIdx = findPeer(from);

//           if (!peerIdx) {
//             const peer = addPeer(signal, from, stream);

//             peer.userName = userName;

//             peersRef.current.push({
//               peerID: from,
//               peer,
//               userName: userName,
//             });
//             setPeers((users) => {
//               return [...users, peer];
//             });
//             setUserVideoAudio((preList) => {
//               return {
//                 ...preList,
//                 [peer.userName]: { video, audio },
//               };
//             });
//           }
//         });

//         socket.on('receiving returned signal', ({ signal, answerId }) => {
//           const peerIdx = findPeer(answerId);
//           peerIdx.peer.signal(signal);
//         });

//         socket.on('user left', ({ userId, userName }) => {
//           const peerIdx = findPeer(userId);
//           peerIdx.peer.destroy();
//           setPeers((users) => {
//             users = users.filter((user) => user.peerID !== peerIdx.peer.peerID);
//             return [...users];
//           });
//           peersRef.current = peersRef.current.filter(({ peerID }) => peerID !== userId);
//         });
//       });

//     socket.on('camera', ({ userId, switchTarget }) => {
//       const peerIdx = findPeer(userId);

//       setUserVideoAudio((preList) => {
//         let video = preList[peerIdx.userName].video;
//         let audio = preList[peerIdx.userName].audio;

//         if (switchTarget === 'video') video = !video;
//         else audio = !audio;

//         return {
//           ...preList,
//           [peerIdx.userName]: { video, audio },
//         };
//       });
//     });

//     return () => {
//       socket.disconnect();
//     };
//     // eslint-disable-next-line
//   }, []);

//   function createPeer(userId, caller, stream) {
//     const peer = new Peer({
//       initiator: true,
//       stream: stream,
//       trickle: false,
//       reconnectTimer: 1000,
//       iceTransportPolicy: 'relay',
//       config: {
//           iceServers:[
//             {
//                 urls:['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
//             }
//         ]
//       }
//   })
//     // const peer = new Peer({
//     //   initiator: true,
//     //   trickle: false,
//     //   stream,
//     // });

//     peer.on('signal', (signal) => {
//       socket.emit('sending signal', {
//         userToCall: userId,
//         from: caller,
//         signal,
//       });
//     });
//     peer.on('disconnect', () => {
//       peer.destroy();
//     });

//     return peer;
//   }

//   function addPeer(incomingSignal, callerId, stream) {
//     const peer = new Peer({
//       initiator: true,
//       stream: stream,
//       trickle: false,
//       reconnectTimer: 1000,
//       iceTransportPolicy: 'relay',
//       config: {
//           iceServers:[
//             {
//                 urls:['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
//             }
//         ]
//       }
//     });

//     peer.on('signal', (signal) => {
//       socket.emit('returning signal', { signal, to: callerId });
//     });

//     peer.on('disconnect', () => {
//       peer.destroy();
//     });

//     peer.signal(incomingSignal);

//     return peer;
//   }

//   function findPeer(id) {
//     return peersRef.current.find((p) => p.peerID === id);
//   }

//   function createUserVideo(peer, index, arr) {
//     return (
//       <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
//         className={`width-peer${peers.length > 8 ? '' : peers.length}`}
//         onClick={expandScreen}
//         key={index}
//       >
//         {writeUserName(peer.userName)}
//         <VideoCard key={index} peer={peer} number={arr.length} />
//       </div>
//     );
//   }

//   function writeUserName(userName, index) {
//     if (userVideoAudio.hasOwnProperty(userName)) {
//       if (!userVideoAudio[userName].video) {
//         return <div style={{ position: "absolute", fontSize: "calc(20px + 5vmin)", zIndex: 1, color: "white" }} key={userName}>{userName}</div>;
//       }
//     }
//   }

//   // Open Chat
//   const clickChat = (e) => {
//     e.stopPropagation();
//     setDisplayChat(!displayChat);
//   };

//   // BackButton
//   const goToBack = (e) => {
//     e.preventDefault();
//     socket.emit('leave', { roomId, leaver: currentUser });
//     sessionStorage.removeItem('user');
//     window.location.href = '/';
//   };

//   const toggleCameraAudio = (e) => {
//     const target = e.target.getAttribute('data-switch');

//     setUserVideoAudio((preList) => {
//       let videoSwitch = preList['localUser'].video;
//       let audioSwitch = preList['localUser'].audio;

//       if (target === 'video') {
//         const userVideoTrack = userVideoRef.current.srcObject.getVideoTracks()[0];
//         videoSwitch = !videoSwitch;
//         userVideoTrack.enabled = videoSwitch;
//       } else {
//         const userAudioTrack = userVideoRef.current.srcObject.getAudioTracks()[0];
//         audioSwitch = !audioSwitch;

//         if (userAudioTrack) {
//           userAudioTrack.enabled = audioSwitch;
//         } else {
//           userStream.current.getAudioTracks()[0].enabled = audioSwitch;
//         }
//       }

//       return {
//         ...preList,
//         localUser: { video: videoSwitch, audio: audioSwitch },
//       };
//     });

//     socket.emit('mic', { roomId, switchTarget: target });
//   };

//   const clickScreenSharing = () => {
//     if (!screenShare) {
//       navigator.mediaDevices
//         .getDisplayMedia({ cursor: true })
//         .then((stream) => {
//           const screenTrack = stream.getTracks()[0];

//           peersRef.current.forEach(({ peer }) => {
//             // replaceTrack (oldTrack, newTrack, oldStream);
//             peer.replaceTrack(
//               peer.streams[0]
//                 .getTracks()
//                 .find((track) => track.kind === 'video'),
//               screenTrack,
//               userStream.current
//             );
//           });

//           // Listen click end
//           screenTrack.onended = () => {
//             peersRef.current.forEach(({ peer }) => {
//               peer.replaceTrack(
//                 screenTrack,
//                 peer.streams[0]
//                   .getTracks()
//                   .find((track) => track.kind === 'video'),
//                 userStream.current
//               );
//             });
//             userVideoRef.current.srcObject = userStream.current;
//             setScreenShare(false);
//           };

//           userVideoRef.current.srcObject = stream;
//           screenTrackRef.current = screenTrack;
//           setScreenShare(true);
//         });
//     } else {
//       screenTrackRef.current.onended();
//     }
//   };

//   const expandScreen = (e) => {
//     const elem = e.target;

//     if (elem.requestFullscreen) {
//       elem.requestFullscreen();
//     } else if (elem.mozRequestFullScreen) {
//       /* Firefox */
//       elem.mozRequestFullScreen();
//     } else if (elem.webkitRequestFullscreen) {
//       /* Chrome, Safari & Opera */
//       elem.webkitRequestFullscreen();
//     } else if (elem.msRequestFullscreen) {
//       /* IE/Edge */
//       elem.msRequestFullscreen();
//     }
//   };

//   const clickBackground = () => {
//     if (!showVideoDevices) return;

//     setShowVideoDevices(false);
//   };

//   const clickCameraDevice = (event) => {
//     if (event && event.target && event.target.dataset && event.target.dataset.value) {
//       const deviceId = event.target.dataset.value;
//       const enabledAudio = userVideoRef.current.srcObject.getAudioTracks()[0].enabled;

//       navigator.mediaDevices
//         .getUserMedia({ video: { deviceId }, audio: enabledAudio })
//         .then((stream) => {
//           const newStreamTrack = stream.getTracks().find((track) => track.kind === 'video');
//           const oldStreamTrack = userStream.current
//             .getTracks()
//             .find((track) => track.kind === 'video');

//           userStream.current.removeTrack(oldStreamTrack);
//           userStream.current.addTrack(newStreamTrack);

//           peersRef.current.forEach(({ peer }) => {
//             // replaceTrack (oldTrack, newTrack, oldStream);
//             peer.replaceTrack(
//               oldStreamTrack,
//               newStreamTrack,
//               userStream.current
//             );
//           });
//         });
//     }
//   };

//   return (
//     <div style={{ display: "flex", width: '100%', maxHeight: "100vh", flexDirection: 'row' }} onClick={clickBackground}>
//       <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
//         <div style={{ maxWidth: "100%", height: "92%", display: " flex", flexDirection: "row", justifyContent: "space-around", flexWrap: "wrap", alignItems: "center", padding: "15px", boxSizing: "border-box", gap: "10px" }}>

//           {/* Current User Video */}
//           <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
//             className={`width-peer${peers.length > 8 ? '' : peers.length}`}
//           >
//             {userVideoAudio['localUser'].video ? null : (
//               <div style={{ position: "absolute", fontSize: "calc(20px + 5vmin)", zIndex: 1, color: "white" }}>{currentUser}</div>
//             )}
//             <video
//               ref={userVideoRef}
//               muted
//               autoPlay
//               playInline
//             ></video>
//           </div>

//           {/* Joined User Vidoe */}
//           {peers &&
//             peers.map((peer, index, arr) => createUserVideo(peer, index, arr))}
//         </div>
//         <BottomBar
//           clickScreenSharing={clickScreenSharing}
//           clickChat={clickChat}
//           clickCameraDevice={clickCameraDevice}
//           goToBack={goToBack}
//           toggleCameraAudio={toggleCameraAudio}
//           userVideoAudio={userVideoAudio['localUser']}
//           screenShare={screenShare}
//           videoDevices={videoDevices}
//           showVideoDevices={showVideoDevices}
//           setShowVideoDevices={setShowVideoDevices}
//         />
//       </div>
//       {/* <Chat display={displayChat} roomId={roomId} /> */}
//     </div>
//   );
// };

// export default Room;
// // import Chat from './Chat';

import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import socket from "../socket";
import VideoCard from "./VideoCard";
import BottomBar from "./BottomBar";

const Room = (props) => {
  const currentUser = sessionStorage.getItem("user");
  const [peers, setPeers] = useState([]);
  const [userVideoAudio, setUserVideoAudio] = useState({
    localUser: { video: true, audio: true },
  });
  const [videoDevices, setVideoDevices] = useState([]);
  const [displayChat, setDisplayChat] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [showVideoDevices, setShowVideoDevices] = useState(false);
  const peersRef = useRef([]);
  const userVideoRef = useRef();
  const screenTrackRef = useRef();
  const userStream = useRef();
  const [userUpdate, setUserUpdate] = useState([]);
  // const roomId = props.match.params.roomId;
  // const [audioFlag, setAudioFlag] = useState(true);
  // const [videoFlag, setVideoFlag] = useState(true);
  // const socketRef = useRef();
  // const userVideo = useRef();

  const roomID = props.match.params.roomID;
  const videoConstraints = {
    minAspectRatio: 1.333,
    minFrameRate: 60,
    height: window.innerHeight / 1.8,
    width: window.innerWidth / 2,
  };
  useEffect(() => {
    //  Get Video Devices
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const filtered = devices.filter((device) => device.kind === "videoinput");
      setVideoDevices(filtered);
    });

    // Set Back Button Event
    window.addEventListener("popstate", goToBack);

    createStream();
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  function createStream() {
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        userVideoRef.current.srcObject = stream;

        // socket.emit('join room', { room: roomId, email: "test@gmail.com", user:  hardCodedUser});
        //         socket.on('all users', (users) => {
        //           // all users
        //           const peers = [];
        //           // users.forEach(({ userId, info }) => {
        //             let { userName, video, audio } = info;

        //             if (userName !== currentUser) {
        //               const peer = createPeer(userId, socket.id, stream);

        //               peer.userName = userName;
        //               peer.peerID = userId;

        //               peersRef.current.push({
        //                 peerID: userId,
        //                 peer,
        //                 userName,
        //               });
        //               peers.push(peer);

        //               setUserVideoAudio((preList) => {
        //                 return {
        //                   ...preList,
        //                   [peer.userName]: { video, audio },
        //                 };
        //               });
        //             }
        //           });

        //           setPeers(peers);
        //
        socket.emit("join room", { room: roomID });
        socket.on("all users", (users) => {
          console.log("users", users);
          const peers = [];
          users.forEach((userID) => {
            const peer = createPeer(userID, socket.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push({
              peerID: userID,
              peer,
            });
          });
          setPeers(peers);
        });
        socket.on("user joined", (payload) => {
          console.log("==", payload);
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });
          const peerObj = {
            peer,
            peerID: payload.callerID,
          };
          setPeers((users) => [...users, peerObj]);
        });

        socket.on("user left", (id) => {
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          const peers = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = peers;
          setPeers(peers);
        });

        socket.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });

        socket.on("change", (payload) => {
          setUserUpdate(payload);
        });
      });

    socket.on("camera", ({ userId, switchTarget }) => {
      const peerIdx = findPeer(userId);

      setUserVideoAudio((preList) => {
        let video = preList[peerIdx.userName].video;
        let audio = preList[peerIdx.userName].audio;

        if (switchTarget === "video") video = !video;
        else audio = !audio;

        return {
          ...preList,
          [peerIdx.userName]: { video, audio },
        };
      });
    });
  }

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      stream: stream,
      trickle: false,
      reconnectTimer: 1000,
      iceTransportPolicy: "relay",
      config: {
        iceServers: [
          {
            urls: ["stun:stun.joinmyworld.in"],
          },
          {
            urls: ["turn:turn.joinmyworld.in"],
            username: "testguest",
            credential: "secretpassword",
          },
        ],
      },
    });
    // const peer = new Peer({
    //   initiator: true,
    //   trickle: false,
    //   stream,
    // });

    peer.on("signal", (signal) => {
      socket.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      stream: stream,
      trickle: false,
      reconnectTimer: 1000,
      iceTransportPolicy: "relay",
      config: {
        iceServers: [
          {
            urls: ["stun:stun.joinmyworld.in"],
          },
          {
            urls: ["turn:turn.joinmyworld.in"],
            username: "testguest",
            credential: "secretpassword",
          },
        ],
      },
    });
    // const peer = new Peer({
    //   initiator: false,
    //   trickle: false,
    //   stream,
    // });

    peer.on("signal", (signal) => {
      socket.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function findPeer(id) {
    return peersRef.current.find((p) => p.peerID === id);
  }

  function createUserVideo(peer, index, arr) {
    return (
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        className={`width-peer${peers.length > 8 ? "" : peers.length}`}
        onClick={expandScreen}
        key={index}
      >
        {writeUserName(peer.userName)}
        <VideoCard key={index} peer={peer.peer} number={arr.length} />
      </div>
    );
  }

  function writeUserName(userName, index) {
    if (userVideoAudio.hasOwnProperty(userName)) {
      if (!userVideoAudio[userName].video) {
        return (
          <div
            style={{
              position: "absolute",
              fontSize: "calc(20px + 5vmin)",
              zIndex: 1,
              color: "white",
            }}
            key={userName}
          >
            {userName}
          </div>
        );
      }
    }
  }

  // Open Chat
  const clickChat = (e) => {
    e.stopPropagation();
    setDisplayChat(!displayChat);
  };

  // BackButton
  const goToBack = (e) => {
    e.preventDefault();
    socket.emit("leave", { roomID, leaver: currentUser });
    sessionStorage.removeItem("user");
    window.location.href = "/";
  };

  const toggleCameraAudio = (e) => {
    const target = e.target.getAttribute("data-switch");

    setUserVideoAudio((preList) => {
      let videoSwitch = preList["localUser"].video;
      let audioSwitch = preList["localUser"].audio;

      if (target === "video") {
        const userVideoTrack =
          userVideoRef.current.srcObject.getVideoTracks()[0];
        videoSwitch = !videoSwitch;
        userVideoTrack.enabled = videoSwitch;
      } else {
        const userAudioTrack =
          userVideoRef.current.srcObject.getAudioTracks()[0];
        audioSwitch = !audioSwitch;

        if (userAudioTrack) {
          userAudioTrack.enabled = audioSwitch;
        } else {
          userStream.current.getAudioTracks()[0].enabled = audioSwitch;
        }
      }

      return {
        ...preList,
        localUser: { video: videoSwitch, audio: audioSwitch },
      };
    });

    socket.emit("mic", { roomID, switchTarget: target });
  };

  const clickScreenSharing = () => {
    if (!screenShare) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((stream) => {
          const screenTrack = stream.getTracks()[0];

          peersRef.current.forEach(({ peer }) => {
            // replaceTrack (oldTrack, newTrack, oldStream);
            peer.replaceTrack(
              peer.streams[0]
                .getTracks()
                .find((track) => track.kind === "video"),
              screenTrack,
              userStream.current
            );
          });

          // Listen click end
          screenTrack.onended = () => {
            peersRef.current.forEach(({ peer }) => {
              peer.replaceTrack(
                screenTrack,
                peer.streams[0]
                  .getTracks()
                  .find((track) => track.kind === "video"),
                userStream.current
              );
            });
            userVideoRef.current.srcObject = userStream.current;
            setScreenShare(false);
          };

          userVideoRef.current.srcObject = stream;
          screenTrackRef.current = screenTrack;
          setScreenShare(true);
        });
    } else {
      screenTrackRef.current.onended();
    }
  };

  const expandScreen = (e) => {
    const elem = e.target;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  };

  const clickBackground = () => {
    if (!showVideoDevices) return;

    setShowVideoDevices(false);
  };

  const clickCameraDevice = (event) => {
    if (
      event &&
      event.target &&
      event.target.dataset &&
      event.target.dataset.value
    ) {
      const deviceId = event.target.dataset.value;
      const enabledAudio =
        userVideoRef.current.srcObject.getAudioTracks()[0].enabled;

      navigator.mediaDevices
        .getUserMedia({ video: { deviceId }, audio: enabledAudio })
        .then((stream) => {
          const newStreamTrack = stream
            .getTracks()
            .find((track) => track.kind === "video");
          const oldStreamTrack = userStream.current
            .getTracks()
            .find((track) => track.kind === "video");

          userStream.current.removeTrack(oldStreamTrack);
          userStream.current.addTrack(newStreamTrack);

          peersRef.current.forEach(({ peer }) => {
            // replaceTrack (oldTrack, newTrack, oldStream);
            peer.replaceTrack(
              oldStreamTrack,
              newStreamTrack,
              userStream.current
            );
          });
        });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        maxHeight: "100vh",
        flexDirection: "row",
      }}
      onClick={clickBackground}
    >
      <div style={{ position: "relative", width: "100%", height: "100vh" }}>
        <div
          style={{
            maxWidth: "100%",
            height: "92%",
            display: " flex",
            flexDirection: "row",
            justifyContent: "space-around",
            flexWrap: "wrap",
            alignItems: "center",
            padding: "15px",
            boxSizing: "border-box",
            gap: "10px",
          }}
        >
          {/* Current User Video */}
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            className={`width-peer${peers.length > 8 ? "" : peers.length}`}
          >
            {userVideoAudio["localUser"].video ? null : (
              <div
                style={{
                  position: "absolute",
                  fontSize: "calc(20px + 5vmin)",
                  zIndex: 1,
                  color: "white",
                }}
              >
                {currentUser}
              </div>
            )}
            <video ref={userVideoRef} muted autoPlay playInline></video>
          </div>

          {/* Joined User Vidoe */}
          {peers &&
            peers.map((peer, index, arr) => createUserVideo(peer, index, arr))}
        </div>
        <BottomBar
          clickScreenSharing={clickScreenSharing}
          clickChat={clickChat}
          clickCameraDevice={clickCameraDevice}
          goToBack={goToBack}
          toggleCameraAudio={toggleCameraAudio}
          userVideoAudio={userVideoAudio["localUser"]}
          screenShare={screenShare}
          videoDevices={videoDevices}
          showVideoDevices={showVideoDevices}
          setShowVideoDevices={setShowVideoDevices}
        />
      </div>
      {/* <Chat display={displayChat} roomId={roomId} /> */}
    </div>
  );
};

export default Room;
