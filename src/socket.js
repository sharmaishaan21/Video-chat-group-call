import io from "socket.io-client";
// const sockets = io('http://localhost:3001', { autoConnect: true, forceNew: true });
// const sockets = io("https://video-chat-hoster1.herokuapp.com")  // hamara server
// const sockets = io("https://myworld-signalling-server.herokuapp.com", {
//   transports: ["websocket"],
// });  //myworld server
const sockets = io("http://localhost:8000", {
  transports: ["websocket"],
  autoConnect: true,
  forceNew: true,
}); //myworld server
export default sockets;
