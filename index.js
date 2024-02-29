
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const shortid = require('shortid');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+@');
//console.log(shortid.generate(456));
app.use(cors());


var vacantrooms = {}
var activerooms = {}
var privaterooms = {}

app.post('/roomvialink', (req, res) => {
    let room = req.body.room
    let out='Not'
    if(room in privaterooms){
        out='Found'
    }
    res.send({status:out})
})
app.get('/createprivate', (req, res) => {
    let roomid = shortid.generate()
    privaterooms[roomid]={id:roomid,member:"nota"}
    res.send({check:"created",key:roomid})
})

app.get('/checkrooms',(req,res)=>{
    if(JSON.stringify(vacantrooms)==='{}'){
        let roomid = shortid.generate()
        vacantrooms[roomid]={id:roomid,member:"nota"}
        res.send({check:"created",roomdetails:vacantrooms[roomid],key:roomid})
    }else{
        // keys array will form
        let keys =Object.keys(vacantrooms)
        let selectedroom= keys[0]
        res.send({check:"found",roomdetails:vacantrooms[selectedroom],key:selectedroom})
    }
})



const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["POST", "GET"],
    },

});

io.on("connection", (socket) => {


    socket.on('testroom',()=>{
        socket.join('wasdfghjgygfyt')
    })

    socket.on('newroom',(room)=>{
        socket.join(room);
    })
    socket.on('ResultUpdate',(data)=>{
        let cur=activerooms[data.id][data.plid]
        activerooms[data.id][data.plid]=cur+1
        socket.nsp.to(data.id).emit('UpdatedResult',activerooms[data.id])
    })

    socket.on('jointheroom', (data) => {
        let room = data.key
        socket.join(room);
        socket.to(room).emit('playerfound',room);
        if(data.type==='pvt'){
            delete  privaterooms[room];
        }else{
            delete  vacantrooms[room];
        }
        activerooms[room] ={id:room,pl1id:0,pl2id:0}
    })
    socket.on('MoveSelected',(data)=>{
        socket.to(data[0]).emit('Movebyopp',data[1]);
    })

    socket.on('GameEnd',(room)=>{
        socket.to(room).emit('ShowResult','final')
    })


})



server.listen(8000, () => {
    console.log("Server has been started");
})

