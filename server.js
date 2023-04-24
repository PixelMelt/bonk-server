const axios = require('axios');
const express = require('express');
const cors = require('cors');
const ws = require('ws');
const fs = require('fs');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const BonkBot = require('./bonkbot');
const decoder = require('./decoder.js');


const bonkserver = {
    name: "BOSS",// Bonk.io Online Server Software
    version: "1.0.0",
    bossport: 7635,

    randomMaps: false, // if true, will pick random maps from the picks map pool
}



const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const servers = require('http').createServer(app);

const io = require("socket.io")(servers, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});

async function getPicks(){
    var url = "https://bonk2.io/scripts/hotmaps/picks.txt";
	return new Promise((resolve, reject) => {
        axios.get(url)
            .then(function (response) {
                if(response.data.r == `success`){
                    resolve(response.data)
                }else{
                    resolve(null)
                }
            });
    })
}

// info about game modes
let gameengines = {
    f: "Football",
    b: "Bonk"
}
let gamemodes = {
    f: "Football",
    bs: "Simple",
    ard: "Death Arrows",
    ar: "Arrows",
    sp: "Grapple",
    v: "VTOL",
    b: "Classic"
}
let num2team = {
    0: "spectator",
    1: "ffa",
    2: "red",
    3: "blue",
    4: "green",
    5: "yellow",
}

function logload(msg){
    console.log(chalk.yellow(`[${bonkserver.name}]`), chalk.white(msg));
}
function logsuccess(msg){
    console.log(chalk.green(`[${bonkserver.name}]`), chalk.white(msg));
}
function logchat(msg){
    console.log(chalk.blue(`[CHAT]`), chalk.white(msg));
}
function loginfo(msg){
    console.log(chalk.cyan(`[${bonkserver.name}]`), chalk.white(msg));
}
function logerror(msg){
    console.log(chalk.red(`[${bonkserver.name}]`), chalk.white(msg));
}

var pserver = {
    id: 1,
    players: 0,
    roomname: `Private Server: ${bonkserver.name}`,
    roomid: "pserver",
    roombypass: "amogus",
    latitude: 19.6631,
    longitude: -155.98,
    maxplayers: "∞",
    password: 0,
    version: 44,
    country: "US",
    mode_ga: "b",// game engine
    mode_mo: "b",// game mode
    gt: 2,// dont know but its usually 2
    ingame: 0,
    minlevel: 0,
    maxlevel: 999,
    
    map: false,

    is: false,
    framecount: 0,
    stateID: 0,
    inputs: [],
    admin: [],

    pinfriend: `Private server: ${bonkserver.name}`,

    hostid: 0,
    quickplay: false,
    rounds: 3,
    balance: [],
    teamslocked: false,
    teamson: false,

    framecount: 100,

    playersd: [],

    botsd: [],
}

logload(`Starting Bonk.io Online Server Software (BOSS)...`);

if(bonkserver.randomMaps){
    async function setDefaultMap(){
        // set the default map to a random map
        let picks = await getPicks();
        // chose a random item from the picks array
        let rmap = picks.maps[Math.floor(Math.random() * picks.maps.length)];
        map = rmap.leveldata
        pserver.map = map
        logsuccess(`Set default map to ${rmap.name} by ${rmap.authorname}\n`);
        logsuccess(`BOSS Server Ready!`);
    }
    setDefaultMap();
}else{
    // set the default map to the default map file
    let map = fs.readFileSync('./defaultmap.json', 'utf8');
    pserver.map = JSON.parse(map);
    logsuccess(`Set default map to ${JSON.parse(map).m.n} by ${JSON.parse(map).m.a}`);
}

// log when a client connects
io.on('connection', (socket) => {
    logload(`Client connected`);

    let playerroomid = undefined;
    let socketid = socket.id;

    socket.on('disconnect', () => {
        
        // remove the player from the pserver objects playersd array and replace it with null
        if(playerroomid != undefined){
            // pserver.playersd[playerroomid] = null;
            // // also remove 1 from the player count
            // pserver.players--;
            // // and also tell the clients that the player left
            // io.emit(5, playerroomid, 0);
            // logload(`A player left the server`);

            // remove every player with the same socket id
            for(let i = 0; i < pserver.playersd.length; i++){
                if(pserver.playersd[i] != null){
                    if(pserver.playersd[i].socketid == socketid){
                        pserver.playersd[i] = null;
                        // also remove 1 from the player count
                        pserver.players--;
                        // and also tell the clients that the player left
                        io.emit(5, playerroomid, 0);
                        logload(`A player left the server`);
                    }
                }
            }
        }else{
            logload(`A client disconnected`);
        }
    });

    

    // syncronize client time with server time
    socket.on(18, async (msg) => {
        // console.log(msg);
        // send back hi
        let unixtime = Date.now();
        // io.emit(23, {"id":msg.id,"result":unixtime});
        // send only to the client that sent the message
        io.to(socketid).emit(23, {"id":msg.id,"result":unixtime});
    })

    // client join attempt
    if(pserver.map != false){
        socket.on(13, async (msg) => {
            // console.log(msg);
    
            // check if the server is full
            if(pserver.players >= pserver.maxplayers){
                io.emit(16, "room_full");
                return;
            }else{
    
                // use the token to get the user's info
                let token = {}
                try {
                    token = JSON.parse(msg.token);
                } catch (error) {
                    console.log(token);
                    logerror(`Error getting users token: ${error}`);
                    return;
                }
                msg.userName = token.name;
                msg.level = token.level;
    
                msg.team = 0;
                msg.guest = false;
                msg.tabbed = false;
                msg.ready = false;
                msg.id = pserver.playersd.length;
    
                // save the socket id
                msg.socketid = socketid;
    
                playerroomid = msg.id;
    
    
                // add the players to the server and increment the player count
                pserver.players++;
                pserver.playersd.push(msg);
                //A list of players, starting at ID 0 and increasing by 1 each item. null indicates that player left. Each player still present is represented by an object:
                let playerobjs = [];
                for(let i = 0; i < pserver.playersd.length; i++){
                    let player = pserver.playersd[i];
                    if(player != null){
                        playerobjs.push({
                            "peerID": player.peerID,
                            "userName": player.userName,
                            "guest": player.guest,
                            "team": player.team,
                            "level": player.level,
                            "ready": player.ready,
                            "tabbed": player.tabbed,
                            "avatar": player.avatar,
                        });
                    }else{
                        playerobjs.push(null);
                    }
                }
    
                // tell only the joinee the server info
                io.to(socketid).emit(3, msg.id, /*pserver.hostid*/ msg.id, playerobjs, Date.now(), pserver.teamslocked, pserver.roomid, pserver.roombypass, null);
    
                let map = pserver.map;
    
                let gameinfo = {}
                let defaultgame = {
                    map: map,
                    gt: pserver.gt,
                    wl: pserver.rounds,
                    q: pserver.quickplay,
                    tl: pserver.teamslocked,
                    tea: pserver.teamson,
                    ga: pserver.mode_ga,
                    mo: pserver.mode_mo,
                    bal: pserver.balance,
                }
                // check if there is a map already
                if(pserver.map == false){
                    // if not, set the default map
                    // console.log("setting default map for new user");
                    gameinfo = defaultgame;
                }else{
                    // if there is, send that in decode form
                    gameinfo = defaultgame
                    // if the map vars type isnt json, then send the map in decode form
                    if(typeof pserver.map != "object"){
                        gameinfo.map = decoder.mapDecode(pserver.map);
                    }else{
                        gameinfo.map = pserver.map;
                    }
                }
    
                
                
                // send the map to only the joining client
                // io.emit(21, gameinfo);
                // check if the game is already started
                if(!pserver.ingame == 1){
                    io.to(socketid).emit(21, gameinfo);
                    loginfo(`Sent map to player ${msg.userName}`);
                }
    
                // tell everyone exempt the joinee that a player joined
                for(let i = 0; i < pserver.playersd.length; i++){
                    let player = pserver.playersd[i];
                    if(player != null){
                        if(player.id != msg.id){
                            io.to(player.socketid).emit(4, msg.id, msg.peerID, msg.userName, msg.guest, msg.level, msg.tabbed, msg.avatar);
                        }
                    }
                }
    
    
                logsuccess(`Player ${msg.userName} joined the server at level ${msg.level} with id ${msg.id}!`);
    
            }
        })
    }


    socket.on(40, (msg) => {
        
        let gamestate = {
            "state": msg.allData.state,
            "stateID": msg.allData.stateID,
            "fc": msg.allData.fc,
            "inputs": msg.allData.inputs,
            "admin": msg.allData.admin,
            "gs": msg.allData.gs,
            "random": msg.allData.random,
        }

        // send the game state to the player with the highest id
        let highestid = 0;
        for(let i = 0; i < pserver.playersd.length; i++){
            let player = pserver.playersd[i];
            if(player != null){
                if(player.id > highestid){
                    highestid = player.id;
                }
            }
        }
        io.to(pserver.playersd[highestid].socketid).emit(48, gamestate);
        loginfo(`Sent game state to the new player`);
    })


    // when recieving a chat message
    socket.on(10, async (msg) => {
        // look for the player in the playersd array with the socketid and get their id
        let playerid = undefined;
        let playername = `UnknownPlayer`;
        for(let i = 0; i < pserver.playersd.length; i++){
            let player = pserver.playersd[i];
            if(player != null){
                if(player.socketid == socketid){
                    playerid = player.id;
                    playername = player.userName;
                }
            }
        }

        // regex to check if the message is a command starting with !
        let regex = /^!/;
        if(regex.test(msg.message)){
            // // if it is, remove the ! and split the message into an array
            // let command = msg.message.replace(regex, "").split(" ");
            // let commandname = command[0];
            // let commandargs = command.slice(1);


            // if(commandname == "hello"){
            //     // send only the player the help message
            //     io.to(player.socketid).emit(20, playerid, msg.message);
            //     io.to(player.socketid).emit(20, playerid, `Hello ${playername}! How are you?`);
            //     // console.log(`Player ${playerid} ran command ${commandname} with args ${commandargs}`);
            //     logsuccess(`${playername} ran command ${commandname} ${commandargs}`);
            // }




            // console.log(`Player ${playerid} sent a message: ${msg.message}`);
            logchat(`${playername}: ${msg.message}`);
            // send the chat message to all clients
            io.emit(20, playerid, msg.message);
        }else{
            // console.log(`Player ${playerid} sent a message: ${msg.message}`);
            logchat(`${playername}: ${msg.message}`);
            // send the chat message to all clients
            io.emit(20, playerid, msg.message);
        }

    })

    // whem nap changed by the host tell all clients and save the map
    socket.on(23, async (data) => {
        // 42[29,"map"]
        io.emit(29, data.m);
        pserver.map = data.m;
        
        // console.log("map changed");
        loginfo(`Map changed`);
    });

    // the countdown until the game starts
    socket.on(36, async (data) => {
        loginfo(`Game starting in ${data.t} seconds`);
        io.emit(43, data.num);
    });

    // the game start
    socket.on(5, async (data) => {
        let unixtime = Date.now();
        let is = data.is;
        pserver.is = is;
        let gameinfo = data.gs;
    
        // save the values in gs to the pserver
        pserver.gt = gameinfo.gt;
        pserver.rounds = gameinfo.wl;
        pserver.quickplay = gameinfo.q;
        pserver.teamslocked = gameinfo.tl;
        pserver.teamson = gameinfo.tea;
        pserver.mode_ga = gameinfo.ga;
        pserver.mode_mo = gameinfo.mo;
        pserver.balance = gameinfo.bal;

        // do weird things with the is
        // is = decoder.ISdecode(is)
        // // add 20 { id: 0, team: 3 } to is.players with never the same id even though there is only 1 player
        // is.ball.xv = 100

        // console.log(is);
        // is = decoder.ISencode(is);

        // set in game to 1
        pserver.ingame = 1;

        // send the game start to all clients with the id 15
        loginfo(`Game started`);
        io.emit(15, unixtime, is, gameinfo);
    });

    // when u get sent [6,{"targetTeam":1}] reply with [18,player id,team number] its the team change
    socket.on(6, async (data) => {
        // look for the player in the playersd array with the socketid and get their id
        let playerid = undefined;
        let playername = `UnknownPlayer`;
        for(let i = 0; i < pserver.playersd.length; i++){
            let player = pserver.playersd[i];
            if(player != null){
                if(player.socketid == socketid){
                    playerid = player.id;
                    playername = player.userName;
                }
            }
        }
        // change the team of the player
        pserver.playersd[playerid].team = data.targetTeam;
        io.emit(18, playerid, data.targetTeam);
        // console.log(`Player ${playerid} changed teams to ${data.targetTeam}`);
        loginfo(`${playername} changed teams to ${num2team[data.targetTeam]}`);
    });

    // when u get sent keypress
    socket.on(4, async (data) => {
        // look for the player in the playersd array with the socketid and get their id
        let playerid = undefined;
        for(let i = 0; i < pserver.playersd.length; i++){
            let player = pserver.playersd[i];
            if(player != null){
                if(player.socketid == socketid){
                    playerid = player.id;
                }
            }
        }
        // up the framecount by 1
        pserver.framecount++;

        // save the keypress to the pservers inputs array {
        pserver.inputs.push({
            "p": playerid,
            "f": pserver.framecount,
            "i": data
        });

        io.emit(7, playerid, data);
    });
    
    // when u get sent [20,{"ga":"b","mo":"ard"}] set the game engine and mode
    socket.on(20, async (data) => {
        pserver.mode_ga = data.ga;
        pserver.mode_mo = data.mo;

        io.emit(26, data.ga, data.mo);

        // if ga is f then turn on teams
        if(data.ga == "f"){
            pserver.teamson = true;
            loginfo(`Teams turned on`);
            io.emit(19, data.t);
        }
    });

    //when u get [21,{"w":9}] change the rounds
    socket.on(21, async (data) => {
        pserver.rounds = data.w;
        loginfo(`Rounds changed to ${data.w}`);
        io.emit(27, data.w);
    });

    // when u get [32,{"t":false}] change the teamson to whatever value is in t
    socket.on(32, async (data) => {
        pserver.teamson = data.t;
        // log 
        if(data.t){
            loginfo(`Teams turned on`);
        }else{
            loginfo(`Teams turned off`);
        }
        io.emit(39, data.t);
    });

    // when u get [7,{"teamLock":false}] change the teamslocked to whatever value is in teamLock
    socket.on(7, async (data) => {
        pserver.teamslocked = data.teamLock;
        io.emit(19, data.teamLock);
    });

    //[14] send [13] this is close game
    socket.on(14, async (data) => {
        pserver.ingame = 0;
        io.emit(13);
    });

    //[44,{"out":true}] send [52,3,false] this is player tabbed out
    socket.on(44, async (data) => {
        io.emit(52, 3, data.out);
    });

    // [16,{"ready":true}] 
    // case 8:
    // console.log(`detected player ready`)
    // return `{"type":"playerready","id":"${message[1]}","ready":${message[2]}}`
    // break;
    socket.on(16, async (data) => {
        let playerid = undefined;
        for(let i = 0; i < pserver.playersd.length; i++){
            let player = pserver.playersd[i];
            if(player != null){
                if(player.socketid == socketid){
                    playerid = player.id;
                }
            }
        }
        io.emit(8, playerid, data.ready);
    });

    // for later
    // send the chat message to only the sender
    //io.to('socket#id').emit('hey')


    socket.on(`error`, (err) => {
        console.log(err);
    })
})

function pinPrivateServer(rooms, pserverid){
    if(rooms.friends == null){
        rooms.friends = [];
    }
    rooms.friends.push({
        "name": pserver.pinfriend,
        "roomid": pserverid,
    });
    return rooms;
}

app.post('/getrooms', async (req, res) => {
    let token = req.body.token;
    let protocolversion = req.body.version;

    let rooms = await BonkBot.getRooms(token, protocolversion);
    rooms = rooms.rooms.push(pserver);
    rooms = pinPrivateServer(rooms, 1);
    res.send(rooms);
});

app.post('/getroomaddress', async (req, res) => {
    if(req.body.id == pserver.id){
        let roomaddr = {
            "r": "success",
            "address": "pserver",
            "id": pserver.id,
            "server": "private"
        };
        res.send(roomaddr);
        return;
    }
    let roomaddr = await BonkBot.getRoomAddress(req.body.id.toString());
    res.send(roomaddr);
});


// create the server
servers.listen(bonkserver.bossport, () => {
    logsuccess(`BOSS server started on port ${bonkserver.bossport}!`);
    if(!bonkserver.randomMaps){
        logsuccess(`BOSS Server Ready!`);
    }
});