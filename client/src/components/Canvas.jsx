import { useEffect, useState } from "react";
import { useDraw } from "../hooks/useDraw";
import { CirclePicker } from "react-color";
import { drawLine } from "../utils/drawLine";

const Canvas = ({ socket, username, room }) => {
  const { canvasRef, onMouseDown, clear } = useDraw(createLine);
  const [color, setColor] = useState("#000");

  function createLine({ prevPoint, currentPoint, ctx }) {
    socket.emit("draw_line", { prevPoint, currentPoint, color, room });
    drawLine({ prevPoint, currentPoint, ctx, color });
  }

  function clearCanvas() {
    socket.emit("clear_canvas", { room });
    clear();
  }

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    socket.on("draw_line", ({ prevPoint, currentPoint, color }) => {
      if (!ctx) return;
      drawLine({ prevPoint, currentPoint, ctx, color });
    });

    socket.on("clear_canvas", clear);
  }, [canvasRef]);

  return (
    <div className="w-full h-full flex bg-white justify-start items-center m-10">
      <div className="flex flex-col gap-10 pr-10 ">
        <CirclePicker color={color} onChange={(e) => setColor(e.hex)} />
        <button
          type="button"
          className="p-2 rounded-md border border-black hover:bg-gray-200"
          onClick={clearCanvas}
        >
          Clear canvas
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        height={400}
        width={500}
        className="border border-black rounded-md cursor-crosshair"
      />
    </div>
  );
};

export default Canvas;
