import React, { useRef, useState, useEffect } from "react";
import socket from "../socket";

const Main = (props) => {
  const roomRef = useRef();
  const userRef = useRef();
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    socket.on("FE-error-user-exist", ({ error }) => {
      if (!error) {
        const roomName = roomRef.current.value;
        const userName = userRef.current.value;

        sessionStorage.setItem("user", userName);
        props.history.push(`/room/${roomName}`);
      } else {
        setErr(error);
        setErrMsg("User name already exist");
      }
    });
  }, [props.history]);

  function clickJoin() {
    const roomName = roomRef.current.value;
    const userName = userRef.current.value;

    if (!roomName || !userName) {
      setErr(true);
      setErrMsg("Enter Room Name or User Name");
    } else {
      // socket.emit("BE-check-user", { roomId: roomName, userName });
      socket.emit("join room", { roomId: roomName, userName });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginTop: "15px",
          lineHeight: "35px",
        }}
      >
        <div htmlFor="roomName">Room Name</div>
        <input
          style={{
            width: "150px",
            height: "35px",
            marginLeft: "15px",
            paddingLeft: "10px",
            outline: "none",
            borderRadius: "5px",
            border: "2px solid black",
          }}
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          type="text"
          id="roomName"
          ref={roomRef}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginTop: "15px",
          lineHeight: "35px",
        }}
      >
        <div htmlFor="userName">User Name</div>
        <input
          value={userName}
          style={{
            width: "150px",
            height: "35px",
            marginLeft: "15px",
            paddingLeft: "10px",
            outline: "none",
            borderRadius: "5px",
            border: "2px solid black",
          }}
          onChange={(e) => setUserName(e.target.value)}
          type="text"
          id="userName"
          ref={userRef}
        />
      </div>
      <button
        style={{
          height: "40px",
          marginTop: "35px",
          outline: "none",
          border: "none",
          borderRadius: "15px",
          backgroundColor: "#ddd",
          fontSize: "25px",
          fontWeight: "500",
        }}
        onClick={clickJoin}
      >
        {" "}
        Join{" "}
      </button>
    </div>
  );
};

export default Main;
