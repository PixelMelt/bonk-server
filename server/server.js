const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const BonkBot = require('./bonkbot');
const decoder = require('./decoder.js');
const utils = require('./utils.js');
const bonkserver = require('./config.json');
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

var pserver = {
    id: Math.floor(Math.random() * 99999999),
    players: 0,
    roomname: bonkserver.room_name,
    roomid: "pserver",
    roombypass: "amogus",
    latitude: 0,
    longitude: 0,
    maxplayers: bonkserver.max_players,
    password: 0,
    version: 1,
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

    pinfriend: bonkserver.room_name,

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

utils.logload(`Starting Bonk.io Online Server Software (BOSS)...`);

if(bonkserver.randomMaps){
    async function setDefaultMap(){
        // set the default map to a random map
        let picks = await utils.getPicks();
        // chose a random item from the picks array
        let rmap = picks.maps[Math.floor(Math.random() * picks.maps.length)];
        pserver.map = rmap.leveldata
        utils.logsuccess(`Set default map to ${rmap.name} by ${rmap.authorname}`);
        utils.logsuccess(`BOSS Server Ready!`);
    }
    setDefaultMap();
}else{
    // set the default map to the default map file
    let map = fs.readFileSync('./server/defaultmap.json', 'utf8');
    pserver.map = JSON.parse(map);
    utils.logsuccess(`Set default map to ${JSON.parse(map).m.n} by ${JSON.parse(map).m.a}`);
}

// log when a client connects
io.on('connection', (socket) => {
    utils.logload(`Client connected`);

    let playerroomid = undefined;
    let socketid = socket.id;

    socket.on('disconnect', () => {
        
        // remove the player from the pserver objects playersd array and replace it with null
        if(playerroomid != undefined){

            // remove every player with the same socket id
            for(let i = 0; i < pserver.playersd.length; i++){
                if(pserver.playersd[i] != null){
                    if(pserver.playersd[i].socketid == socketid){
                        pserver.playersd[i] = null;
                        // also remove 1 from the player count
                        pserver.players--;
                        // and also tell the clients that the player left
                        io.emit(5, playerroomid, 0);
                        utils.logload(`A player left the server`);
                    }
                }
            }
        }else{
            utils.logload(`A client disconnected`);
        }
    });

    

    // syncronize client time with server time
    socket.on(18, async (msg) => {
        let unixtime = Date.now();
        io.to(socketid).emit(23, {"id":msg.id,"result":unixtime});
    })

    // client join attempt
    if(pserver.map != false){
        socket.on(13, async (msg) => {
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
                    utils.logerror(`Error getting users token: ${error}`);
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
                    utils.loginfo(`Sent map to player ${msg.userName}`);
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
    
                utils.logsuccess(`Player ${msg.userName} joined the server at level ${msg.level} with id ${msg.id}!`);
    
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
        utils.loginfo(`Sent game state to the new player`);
    })


    // when recieving a chat message
    socket.on(10, async (msg) => {
        // look for the player in the playersd array with the socketid and get their id
        let playerid = undefined;
        let playername = `UnknownPlayer`;
        let playerobj = undefined;
        for(let i = 0; i < pserver.playersd.length; i++){
            let player = pserver.playersd[i];
            if(player != null){
                if(player.socketid == socketid){
                    playerid = player.id;
                    playername = player.userName;
                    playerobj = player;
                }
            }
        }

        // check if message is a command starting with !
        let regex = /^!/;
        if(regex.test(msg.message)){
            // if it is, remove the ! and split the message into an array
            let command = msg.message.replace(regex, "").split(" ");
            let commandname = command[0];
            let commandargs = command.slice(1);

            utils.logsuccess(`${playername} ran command: ${commandname} ${commandargs}`);

            if(commandname == "help"){
                let help = `Commands: !help, !hello`
                io.to(playerobj.socketid).emit(20, playerid, help);
            }

            if(commandname == "hello"){
                io.to(playerobj.socketid).emit(20, playerid, `Hello ${playername}! How are you?`);
            }

            utils.logchat(`${playername}: ${msg.message}`);
        }else{
            utils.logchat(`${playername}: ${msg.message}`);
            // send the chat message to all clients
            io.emit(20, playerid, msg.message);
        }

    })

    // whem nap changed by the host tell all clients and save the map
    socket.on(23, async (data) => {
        // 42[29,"map"]
        io.emit(29, data.m);
        pserver.map = data.m;
        
        utils.loginfo(`Map changed`);
    });

    // the countdown until the game starts
    socket.on(36, async (data) => {
        utils.loginfo(`Game starting in ${data.t} seconds`);
        io.emit(43, data.num);
    });

    // the game start
    socket.on(5, async (data) => {
        let unixtime = Date.now();
        let is = data.is;
        pserver.is = is;
        let gameinfo = data.gs;
    
        // save the values in gs to the pserver object
        pserver.gt = gameinfo.gt;
        pserver.rounds = gameinfo.wl;
        pserver.quickplay = gameinfo.q;
        pserver.teamslocked = gameinfo.tl;
        pserver.teamson = gameinfo.tea;
        pserver.mode_ga = gameinfo.ga;
        pserver.mode_mo = gameinfo.mo;
        pserver.balance = gameinfo.bal;

        // here you could do weird things with the is

        // set in game to 1
        pserver.ingame = 1;

        // send the game start to all clients with the id 15
        utils.loginfo(`Game started`);
        io.emit(15, unixtime, is, gameinfo);
    });

    // when receive sent [6,{"targetTeam":1}] reply with [18,player id,team number] its the team change
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
        utils.loginfo(`${playername} changed teams to ${utils.num2team[data.targetTeam]}`);
    });

    // when receive sent keypress
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
    
    // when receive sent [20,{"ga":"b","mo":"ard"}] set the game engine and mode
    socket.on(20, async (data) => {
        pserver.mode_ga = data.ga;
        pserver.mode_mo = data.mo;

        io.emit(26, data.ga, data.mo);

        // if ga is f then turn on teams
        if(data.ga == "f"){
            pserver.teamson = true;
            utils.loginfo(`Teams turned on`);
            io.emit(19, data.t);
        }
    });

    //when receive [21,{"w":9}] change the rounds
    socket.on(21, async (data) => {
        pserver.rounds = data.w;
        utils.loginfo(`Rounds changed to ${data.w}`);
        io.emit(27, data.w);
    });

    // when receive [32,{"t":false}] change the teamson to whatever value is in t
    socket.on(32, async (data) => {
        pserver.teamson = data.t;
        if(data.t){
            utils.loginfo(`Teams turned on`);
        }else{
            utils.loginfo(`Teams turned off`);
        }
        io.emit(39, data.t);
    });

    // when receive [7,{"teamLock":false}] change the teamslocked to whatever value is in teamLock
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

    rooms.rooms.push({
        id: pserver.id,
        players: pserver.players,
        roomname: pserver.roomname,
        roomid: pserver.roomid,
        roombypass: pserver.roombypass,
        latitude: pserver.latitude,
        longitude: pserver.longitude,
        maxplayers: pserver.maxplayers,
        password: pserver.password,
        version: pserver.version,
        country: pserver.country,
        mode_ga: pserver.mode_ga,
        mode_mo: pserver.mode_mo,
        gt: pserver.gt,
        ingame: pserver.ingame,
        minlevel: pserver.minlevel,
        maxlevel: pserver.maxlevel,
    });

    rooms = pinPrivateServer(rooms, pserver.id);

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
    utils.logsuccess(`BOSS server started on port ${bonkserver.bossport}!`);
    if(!bonkserver.randomMaps){
        utils.logsuccess(`BOSS Server Ready!`);
    }
});