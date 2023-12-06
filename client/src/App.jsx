import { useEffect, useState } from "react";
import io from "socket.io-client";
import Chat from "./components/Chat";
import Canvas from "./components/Canvas";
import { FaPaintBrush } from "react-icons/fa";


// const socket = io.connect("http://localhost:3000");
const socket = io.connect("https://doodle-be.onrender.com");


function App() {
  const [userName, setUserName] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");
  const [roomEntered, setRoomEntered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

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

  const startGame = () => {
    console.log(`${userName} is starting the game in room ${room} `);
    let word_to_guess = prompt("What will you draw?");
    console.log(word_to_guess);
    if (word_to_guess !== null && word_to_guess !== "") {
      socket.emit("start_game", { userName, room });
      socket.emit("word_to_guess", word_to_guess);
      socket.emit("game_running", { room, running: true });
    }
  };

  useEffect(() => {
    socket.on("game_timer", (counter) => {
      console.log(counter);
      setTimeLeft(counter);
    });

    socket.on("game_over", () => {
      setTimeLeft(0);
    });
  }, []);

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
          <div className="flex flex-row justify-between">
            <div className="flex flex-row">
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
            <div>
              {timeLeft === 0 ? (
                <button
                  onClick={startGame}
                  className="border border-cyan-800 rounded-[7px] mr-10 px-10 py-2 hover:bg-cyan-700 hover:border-white"
                >
                  Start
                </button>
              ) : (
                <input
                  className="w-40 text-sm mr-10 rounded-[7px] border border-cyan-800 bg-transparent px-5 py-2.5 font-sans font-normal outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200"
                  value={`Time Left: ${timeLeft}s`}
                  disabled
                />
              )}
            </div>
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
