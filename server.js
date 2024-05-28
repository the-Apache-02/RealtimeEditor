// const express = require('express');
const express=require('express')
const app=express();
const http=require('http');
const {Server}=require('socket.io');
const ACTIONS = require('./src/Actions');


const server=http.createServer(app);

const io=new Server(server);

app.use(express.static('build'))

app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'build','index.html'));
})

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
//create a map to store socket id map with username
const userSocketMap={};

function getAllClients(roomId){
    return Array.from(io.sockets.adapter.rooms.get(roomId)||[]).map(
        (socketId)=>{
            return {
                socketId,
                username: userSocketMap[socketId],
            };
    });
}

//when connection is established from client side
io.on('connection',(socket)=>{
    console.log('socket connected',socket.id);
    // socket.on("chatMessage", (message) => {
    //     io.emit("chat message", message);
    //   })
    
    // socket.on("disconnect", () => {
    // io.emit("Chat disconnected");
    // })

    socket.on(ACTIONS.JOIN,({roomId,username})=>{
        
        userSocketMap[socket.id]=username;
        socket.join(roomId);
        //get all clients to notify them that this one use in joined
        const clients=getAllClients(roomId);
        //console.log(clients);

        clients.forEach(({socketId})=>{
            io.to(socketId).emit(ACTIONS.JOINED,{
                clients,
                username,
                socketId:socket.id  //socket.id is the current socket id
            });
        });
    });

    //invoke the event emitted on first joining and auto syncing

    socket.on(ACTIONS.SYNC_CODE,({socketId,code})=>{
        io.to(socketId).emit(ACTIONS.CODE_CHANGE,{code});
    })

    //send code to the server
    socket.on(ACTIONS.CODE_CHANGE,({roomId,code})=>{
        //emit by the server and this below is listen on the client side
        //this below statement broadcast to all the users including the sender thats why cursor is pointing to the initial level
        //io.to(roomId).emit(ACTIONS.CODE_CHANGE,{code});

        //to resolve the abocve issue we use socket.in which broadcast except the sender

        socket.in(roomId).emit(ACTIONS.CODE_CHANGE,{code});
    })


    socket.on('disconnecting',()=>{
        const rooms=[...socket.rooms];
        rooms.forEach((roomId)=>{
            socket.in(roomId).emit(ACTIONS.DISCONNECTED,{
                socketId:socket.id,
                username:userSocketMap[socket.id]
            });
        });

        delete userSocketMap[socket.id];
        socket.leave();
    });
    
});

const PORT=process.env.PORT || 5000;

server.listen(PORT,()=>console.log(`Listening on port ${PORT}`));