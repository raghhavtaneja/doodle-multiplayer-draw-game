import { useState } from "react";
import io from "socket.io-client";
import Chat from "./components/Chat";
import Canvas from "./components/Canvas";
import { FaPaintBrush } from "react-icons/fa";

const socket = io.connect("http://localhost:3000");

function App() {
  const [userName, setUserName] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");
  const [roomEntered, setRoomEntered] = useState(false);

  const joinRoom = () => {
    if (userName === "" || room === "") {
      setError("Enter valid username and room ID");
      return;
    }
    if (
      userName.length > 4 ||
      userName.length < 2 ||
      room.length > 4 ||
      room.length < 2
    ) {
      setError("! Username and room ID must be 2 to 4 characters");
      return;
    }
    setError(false);
    setRoomEntered(true);
    socket.emit("join_room", { userName, room });
  };

  return (
    <>
      <div className="border border-cyan-950 bg-cyan-900 text-white p-1">
        <div className="flex flex-row mt-1">
          <h3 className="text-3xl font-bold ml-5 mb-3 mr-2">Doodle</h3>
          <FaPaintBrush size={25} />
        </div>
        {roomEntered === false ? (
          <div className="flex flex-row">
            <input
              className="text-sm ml-4 rounded-[7px] border border-cyan-800 bg-transparent px-3 py-2.5 font-sans font-normal outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200"
              type="text"
              placeholder="Name..."
              onChange={(e) => {
                setUserName(e.target.value);
              }}
            />
            <input
              className="text-sm ml-4 rounded-[7px] border border-cyan-800 bg-transparent px-3 py-2.5 font-sans font-normal outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200"
              type="text"
              placeholder="Room ID..."
              onChange={(e) => {
                setRoom(e.target.value);
              }}
            />
            <button
              className="border border-cyan-800 rounded-[7px] ml-4 px-2 py-2 hover:bg-cyan-700 hover:border-white"
              onClick={joinRoom}
            >
              Join Now
            </button>
            {error !== "" && (
              <div className="text-gray-400 mt-2 ml-4">
                <h3>{error}</h3>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-row ">
            <input
              className="text-sm ml-4 rounded-[7px] border border-cyan-800 bg-transparent px-3 py-2.5 font-sans font-normal outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200"
              value={`USER - ${userName}`}
              disabled
              id="filled_success"
            />
            <input
              className="text-sm ml-4 rounded-[7px] border border-cyan-800 bg-transparent px-3 py-2.5 font-sans font-normal outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200"
              value={`ROOM - ${room}`}
              disabled
            />
            <input
              className="w-72 text-sm ml-4 rounded-[7px] border border-cyan-800 bg-transparent px-3 py-2.5 font-sans font-normal outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200"
              value={`Invite other users to this room to play.`}
              disabled
            />
          </div>
        )}
      </div>

      <hr />

      <div className="flex flex-row">
        <Canvas socket={socket} username={userName} room={room} />
        <Chat socket={socket} username={userName} room={room} />
      </div>
    </>
  );
}

export default App;
