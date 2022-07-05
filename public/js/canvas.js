const canvas = document.getElementById("canvas");
canvas.width = 0.5*window.innerWidth;
canvas.height = 0.8*window.innerHeight;

let context = canvas.getContext("2d");
context.fillStyle = "white";
context.fillRect(0,0,canvas.width,canvas.height);

let draw_color = "black";
let draw_width = "8";
let is_drawing = false;
let x,y;

//change color of paint
socket.on('changeDrawColor',(color)=>{
    draw_color = color;
})

//Recieving drawn data on the canvas from server
socket.on('drawData',(data)=>{
    console.log("client recieved : ",data.x + " " + data.y);
    x = data.x;
    y = data.y;
    context.lineTo(x,y);
    context.strokeStyle = data.draw_color;
    context.lineWidth = draw_width;
    context.lineJoin = "round";
    context.lineCap = "round";
    context.stroke();
})

socket.on('onMouseDown',(data)=>{
    context.moveTo(data.x,data.y);
})

window.onmouseup = (e)=>{
    is_drawing = false;
}

window.onmousedown = (e)=>{
    context.moveTo(x,y);
    const data = {x,y};
    socket.emit('down',data);
    is_drawing = true;
}

window.onmousemove = (e)=>{
    x = e.clientX - canvas.offsetLeft;
    y = e.clientY - canvas.offsetTop;

    const data = {x,y,draw_color};
    if(is_drawing){
        socket.emit('draw',data);
        context.lineTo(x,y);
        context.strokeStyle = draw_color;
        context.lineWidth = draw_width;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.stroke();
        context.beginPath();
    }
   
}

//change color
function change_color(element){
    socket.emit('changeColor',element.style.background);
    // draw_color = element.style.background;
}

//erase the canvas
socket.on('clearCanvas',()=>{
    context.fillStyle = "white";
    context.clearRect(0,0,canvas.width,canvas.height);
    context.fillRect(0,0,canvas.width,canvas.height);
})

function erase_canvas(){
    socket.emit('clearCanvas');
    context.fillStyle = "white";
    context.clearRect(0,0,canvas.width,canvas.height);
    context.fillRect(0,0,canvas.width,canvas.height);
}

//use the eraser
function start_eraser(){
    draw_color = "white";
}
