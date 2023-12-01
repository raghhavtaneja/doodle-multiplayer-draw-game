import React, { useEffect, useState } from "react";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [wordGuessed, setWordGuessed] = useState("");

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const now = new Date();
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: now.getHours() + ":" + now.getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      // console.log(data.author + " ---- " + data.message + " -> " + data.room);
      console.log(data,username);
      let author = data.author;
      if (data.author !== username && data.message === data.word) {
        // word has been guessed
        console.log("word has been guessed");
        socket.emit("game_over", { author, room });
      }
      setMessageList((list) => [...list, data]);
    });

    socket.on("admin_message", (data) => {
      setAdminMessage(data);
      setTimeout(() => {
        setAdminMessage("");
      }, 5000);
    });

    socket.on("word_guessed", (data) => {
      setWordGuessed(data);
      setTimeout(() => {
        setWordGuessed("");
      }, 5000);
    });
  }, [socket]);

  return (
    <div className="flex flex-col mt-10 mr-20 w-96">
      <div className="border-2 border-cyan-900 text-cyan-900 font-bold p-1 rounded-md">
        <p>Live Chat</p>
      </div>
      <div className="border border-black rounded-lg flex flex-col-reverse p-4 h-72 overflow-auto">
        {adminMessage && (
          <div className="text-red-500 justify-center items-center">
            admin: {adminMessage}
          </div>
        )}
        {wordGuessed && (
          <div className="text-green-600 justify-center items-center">
            admin: {wordGuessed}
          </div>
        )}
        <div className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className={`${
                  username === messageContent.author
                    ? "text-red-600"
                    : "text-gray-700"
                }
                bg-gray-100 border-b border-gray-400 rounded-md px-4 py-3
                `}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="author" className="text-xs">
                      {username === messageContent.author
                        ? "-you"
                        : `-${messageContent.author}`}
                    </p>
                    <p id="time" className="text-xs">
                      {messageContent.time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-row justify-between w-96">
        <input
          type="text"
          className="h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 font-sans font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:outline-0"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(e) => {
            setCurrentMessage(e.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button
          className="border border-black p-2 rounded-md hover:bg-gray-200"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
