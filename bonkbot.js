//
// BonkBot Framework
//  - Version: 1.0.0
//

const axios = require('axios');

function sendInput(socket, input) { socket.send(`42[4,{"i":${input.input},"f":${input.frame},"c":${input.sequence}}]`) }
function joinTeam(socket, team) { socket.send(`42[6,{"targetTeam":${team}}]`) }
function toggleTeams(socket, locked) { socket.send(`42[7,{"teamLock":${locked}}]`) }
function banPlayer(socket, player){ socket.send(`42[9,{"banshortid":${player}}]`) }
function leaveGame(socket){ socket.send(`42[14]`); ws.close(); }
function setReady(socket, ready) { socket.send(`42[16,{"ready":${ready}}]`) }
function gainXP(socket){ socket.send(`42[38]`) }
function timesync(socket){ socket.send(`424[18,{"jsonrpc":"2.0","id":459,"method":"timesync"}]`) }
function giveHost(socket, newhost){ socket.send(`42[34,{"id":${newhost}}]`) }
function sendFriendRequest(socket,friendID){ socket.send(`42[35,{"id":${friendID}}]`) }
function recordGame(socket){ socket.send(`42[33]`) }
function setRounds(socket, rounds){ socket.send(`42[21,{"w":${rounds}}]`) }
function sendChat(socket, message){ socket.send(`42[10,{"message":"${message}"}]`) }

function sendRoomInfo(socket, id, username){
    let welcomemsg = `Welcome`
    if(username != undefined || username != null){
        welcomemsg = `Welcome ${username}!`
    }
    let msg = [11,{
            "sid": id,
            "gs": {
                "map": {
                    "v": 13,
                    "s": {
                        "re": false,
                        "nc": false,
                        "pq": 1,
                        "gd": 25,
                        "fl": false
                    },
                    "physics": {
                        "shapes": [],
                        "fixtures": [],
                        "bodies": [],
                        "bro": [],
                        "joints": [],
                        "ppm": 12
                    },
                    "spawns": [],
                    "capZones": [],
                    "m": {
                        "a": "🤓",
                        "n": welcomemsg,
                        "dbv": 2,
                        "dbid": 742086,
                        "authid": -1,
                        "date": "2022-07-29 17:46:46",
                        "rxid": 0,
                        "rxn": "",
                        "rxa": "",
                        "rxdb": 1,
                        "cr": [
                            "🤓"
                        ],
                        "pub": true,
                        "mo": "",
                        "vu": 0,
                        "vd": 0
                    }
                },
                "gt": 2,
                "wl": "21!?!",
                "q": false,
                "tl": false,
                "tea": false,
                "ga": "b",
                "mo": "b",
                "bal": [],
                "GMMode": ""
            }
        }]
    socket.send(`42${JSON.stringify(msg)}`)
}
function joinRoom(socket, options){
    if(options.joinid == undefined){ throw new Error("joinid is undefined") }
    if(options.guest == undefined){ options.guest = true }
    if(options.token == undefined){ if(options.guest != true){ throw new Error(`No token provided and is not a guest!`)} }
    if(options.peerid == undefined){options.peerid = Math.random().toString(36).substr(2, 10) + 'v00000'}
    if(options.username == undefined){options.username = `Robot${Math.random().toString().substr(2, 5)}`}
    if(options.roompassword == undefined){options.roompassword = ""}
    if(options.basecolor == undefined){options.basecolor = 0}
    if(options.skin == undefined){options.skin = `{"id":78,"scale":0.06428571790456772,"angle":90,"x":-9.300000190734863,"y":-0.04285714402794838,"flipX":false,"flipY":false,"color":16777215},{"id":72,"scale":0.14142857491970062,"angle":-65,"x":-15.771428108215332,"y":-2.2285714149475098,"flipX":false,"flipY":false,"color":5329233},{"id":78,"scale":0.06428571790456772,"angle":90,"x":9.300000190734863,"y":-0.04285714402794838,"flipX":false,"flipY":false,"color":16777215},{"id":76,"scale":0.06428571790456772,"angle":90,"x":2.7857143878936768,"y":3.5999999046325684,"flipX":false,"flipY":false,"color":16777215},{"id":76,"scale":0.06428571790456772,"angle":90,"x":-2.8714284896850586,"y":3.5999999046325684,"flipX":false,"flipY":false,"color":16777215},{"id":72,"scale":0.12857143580913544,"angle":90,"x":0,"y":3.5999999046325684,"flipX":false,"flipY":false,"color":0},{"id":30,"scale":0.17142857611179352,"angle":0,"x":3.0428571701049805,"y":-2.7428572177886963,"flipX":false,"flipY":false,"color":0},{"id":30,"scale":0.17142857611179352,"angle":0,"x":-3.0428571701049805,"y":-2.7428572177886963,"flipX":false,"flipY":false,"color":0},{"id":16,"scale":0.2142857164144516,"angle":0,"x":0,"y":-2.914285659790039,"flipX":false,"flipY":false,"color":16777215},{"id":85,"scale":0.5142857432365417,"angle":0,"x":0,"y":0,"flipX":false,"flipY":false,"color":16777215},{"id":74,"scale":0.24857142567634583,"angle":-65,"x":-4.199999809265137,"y":-10.885714530944824,"flipX":false,"flipY":false,"color":14145495},{"id":80,"scale":0.05686894804239273,"angle":-38.2320556640625,"x":7.242856979370117,"y":-3.5142858028411865,"flipX":false,"flipY":false,"color":6974058},{"id":75,"scale":0.08571428805589676,"angle":-65,"x":-12.771428108215332,"y":-4.199999809265137,"flipX":false,"flipY":false,"color":6974058},{"id":85,"scale":0.5571428537368774,"angle":-65,"x":-13.414285659790039,"y":-4.114285945892334,"flipX":false,"flipY":false,"color":8355711}`}
    if(options.guest == true){
        socket.send(`42[13,{"joinID":"${options.joinid}","roomPassword":"${options.roompassword}","guest":true,"dbid":2,"version":44,"peerID":"${options.peerid}","bypass":"","guestName":"${options.username}","avatar":{"layers":[${options.skin}],"bc":${options.basecolor}}}]`)
    }else{
        socket.send(`42[13,{"joinID":"${options.joinid}","roomPassword":"${options.roompassword}","guest":false,"dbid":2,"version":44,"peerID":"${options.peerid}","bypass":"","token":"${options.token}","avatar":{"layers":[${options.skin}],"bc":${options.basecolor}}}]`)
    }
    return true
}
async function getRoomByName(roomname, protcolversion=45) {
    var url = "https://bonk2.io/scripts/getrooms.php";
    var data = `version=${protcolversion}&gl=y&token=`;
    return new Promise((resolve, reject) => {
        axios.post(url, data)
        .then(function (response) {
            var roomdata = response.data
            for (var i = roomdata.rooms.length - 1; i >= 0; i--) {
                if (roomname != undefined) {
                    if (roomdata.rooms[i].roomname == roomname) {
                        resolve(roomdata.rooms[i])
                    }
                }
            }
            resolve(false)
        }).catch(function (error) {
            console.log(error);
        });
    })
}
async function getRooms(token, protcolversion=45) {
    var url = "https://bonk2.io/scripts/getrooms.php";
    var data = `version=${protcolversion}&gl=y&token=${token}`;
    return new Promise((resolve, reject) => {
        axios.post(url, data)
        .then(function (response) {
            var roomdata = response.data
            resolve(roomdata)
        }).catch(function (error) {
            console.log(error);
        });
    })
}
async function getSocketID(bonkserver){
    var url = `https://${bonkserver}.bonk.io/socket.io/?EIO=3&transport=polling&t=OB8AH_b`;
    return new Promise((resolve, reject) => {
        axios.get(url)
        .then(function (response) {
            var socketid = response.data.substring(12,32)
            resolve(socketid)
        });
    }).catch(function (error) {
        console.log(error);
    });
}
async function getPeerID(server){
    if(server == undefined){server = "b2ny1"}
    var url = `https://${server}.bonk.io/myapp/peerjs/id?ts=16614555700070.22818377123892764`;
    return new Promise((resolve, reject) => {
        axios.get(url)
        .then(function (response) {
            var peerid = response.data
            resolve(peerid)
        }).catch(function (error) {
            console.log(error);
        });
    }).catch(function (error) {
        console.log(error);
    });
}
function getPlayerMovement(stats){
    //verify that the keys i f and c are present and no others
    if(!stats.hasOwnProperty("f") || !stats.hasOwnProperty("c") || !stats.hasOwnProperty("i")){
        return false
    }

    stats = stats[`i`]

    let playermovement = {
        1: `left`,
        2: `right`,
        4: `up`,
        8: `down`,
        16: `heavy`,
        32: `special`
    }
    let playermove = stats
    if (playermove > 63) {
        console.log(`Status outside of scope!`)
    }
    let movement = []
    for (var key in playermovement) {
        if (playermove & key) {
            movement.push(playermovement[key])
        }
    }
    return movement
}
async function getToken(username, password){
    var url = "https://bonk2.io/scripts/login_legacy.php";
	return new Promise((resolve, reject) => {
        var headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        var data = `username=${username}&password=${password}&remember=true`
        axios.post(url, data, {headers: headers})
            .then(function (response) {
                // handle success
                resolve(response.data.token)
            });
    })
}
async function addFriend(token, username){
    var url = "https://bonk2.io/scripts/friends.php";
	return new Promise((resolve, reject) => {
        var headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        var data = `token=${token}&task=send&theirname=${username}`
        axios.post(url, data, {headers: headers})
            .then(function (response) {
                // handle success
                resolve(response.data.token)
            });
    })
}
async function getFriends(token){
    var url = "https://bonk2.io/scripts/friends.php";
    var data = `token=${token}&task=getfriends`;
    return new Promise((resolve, reject) => {
        axios.post(url, data)
        .then(function (response) {
            var friends = response.data.friends
            resolve(friends)
        }).catch(function (error) {
            console.log(error);
        });
    });
}
async function getTokenInfo(username, password){
    var url = "https://bonk2.io/scripts/login_legacy.php";
	return new Promise((resolve, reject) => {
        var headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        var data = `username=${username}&password=${password}&remember=true`
        axios.post(url, data, {headers: headers})
            .then(function (response) {
                // handle success
                resolve(response.data)
            });
    })
}
async function getRoomAddress(id) {
	var url = "https://bonk2.io/scripts/getroomaddress.php";
	var data = `id=${id}`;

    return new Promise((resolve, reject) => {
        axios.post(url, data)
        .then(function (response) {
            resolve(response.data)
        });
    })
}
function parsesocket(message) {
    // console.log(message)
    let numToTeam = {
        0: `spectator`,
        1: `ffa`,
        2: `red`,
        3: `blue`,
        4: `green`,
        5: `yellow`,
    }
    if (message == "3probe") {
        console.log(`3probe`)
        return `{"type":"3probe"}`
    }
    if (message == "40") {
        console.log(`40?`)
        return `{"type":"40"}`
    }
    if (message == "41") {
        console.log(`41?`)
        return `{"type":"41"}`
    }
	if (JSON.parse(message.substring(2))) {
		var message = JSON.parse(message.substring(2))
        function switchyswitch(message){
            switch (message[0]) {
                case 1:
                    // console.log(`detected server ping`)
                    return `{"type":"ping"}`
                    break;
                case 3:
                    console.log(`detected room join inital data packet`)
                    return `{"type":"roomjoin","roombypass":"${message[7]}","roomid":"${message[6]}","teamslocked":"${message[5]}","myid":"${message[1]}","hostid":"${message[2]}","playerdata":${JSON.stringify(message[3])}}`
                    break;
                case 4:
                    if (message[4] == true) {
                        console.log(`detected guest room join`)
                        return `{"type":"playerjoin","id":"${message[1]}","peerid":"${message[2]}","username":"${message[3]}","level":"0","guest":true,"skin":${JSON.stringify(message[7])},"tabbed":${message[6]}}`
                    }else{
                        console.log(`detected player room join`)
                        return `{"type":"playerjoin","id":"${message[1]}","peerid":"${message[2]}","username":"${message[3]}","level":"${message[5]}","guest":false,"skin":${JSON.stringify(message[7])},"tabbed":${message[6]}}`
                    }
                    break;
                case 5:
                    console.log(`detected player leave`)
                    return `{"type":"playerleave","id":"${message[1]}"}`
                    break;
                case 6:
                    if(message[2] == `-1`){
                        console.log(`detected game close`)
                        return `{"type":"gameclose"}`
                    }else{
                        console.log(`detected host leave`)
                        return `{"type":"hostleave","oldid":"${message[1]}","newid":"${message[2]}"}`
                    }
                    break;
                case 7:
                    console.log(`detected player input ${message[1]} ${message[2][`i`]}`)
                    // console.log(message)
                    console.log(getPlayerMovement(message[2]))
                    if(!message[2].hasOwnProperty("f") || !message[2].hasOwnProperty("c") || !message[2].hasOwnProperty("i")){
                        console.log(`could not verify movement`)
                        return `{"type":"playerinputerror"}`
                    }
                    return `{"type":"playerinput","id":"${message[1]}","input":${message[2][`i`]},"frame":${message[2][`f`]},"sequence":${message[2][`c`]}}`
                    break;
                case 8:
                    console.log(`detected player ready`)
                    return `{"type":"playerready","id":"${message[1]}","ready":${message[2]}}`
                    break;
                case 13:
                    console.log(`detected game cancel`)
                    return `{"type":"gamecancel"}`
                    break;
                case 15:
                    console.log(`detected game start`)
                    return `{"type":"gamestart"}`
                    break;
                case 16:
                    console.log(`detected rate limit ${message[1]}`)
                    return `{"type":"ratelimit","limit":"${message[1]}"}`
                case 18:
                    console.log(`detected player move team to ${numToTeam[message[2]]}`)
                    return `{"type":"playermove","id":"${message[1]}","team":${message[2]}}`
                    break;
                case 19:
                    console.log(`detected teams lock toggle to ${message[1]}`)
                    return `{"type":"teamslock","teamslocked":${message[1]}}`
                    break;
                case 20:
                    console.log(`detected chat message`)
                    return `{"type":"chatmessage","id":"${message[1]}","message":"${message[2]}"}`
                    break;
                case 21:
                    console.log(`detected map data`)
                    return `{"type":"mapdata","data":"${message[1]}"}`
                    break;
                case 23:
                    // console.log(`detected timesync ${message[1].result} id ${message[1].id}`)
                    return `{"type":"timesync","time":"${message[1].result}","id":"${message[1].id}"}`
                    break;
                case 24:
                    console.log(`detected kicked from room`)
                    return `{"type":"kickedfromroom"}`
                    break;
                case 26:
                    console.log(`detected mode change to ${message[2]} root mode ${message[1]}`)
                    return `{"type":"modechange","mode":"${message[2]}","rootmode":"${message[1]}"}`
                    break;
                case 27:
                    console.log(`detected rounds change to ${message[1]}`)
                    return `{"type":"roundschange","rounds":${message[1]}}`
                    break;
                case 33:
                    console.log(`detected host map request`)
                    return `{"type":"hostmaprequest","mapdata":"${message[1]}","id":"${message[2]}"}`
                    break;
                case 34:
                    console.log(`detected map request`)
                    return `{"type":"maprequest","map":"${message[1]}","author":"${message[2]}","id":"${message[3]}"}`
                    break;
                case 40:
                    console.log(`detected save replay`)
                    return `{"type":"savereplay","id":"${message[1]}"}`
                    break;
                case 41:
                    console.log(`detected host transfer`)
                    return `{"type":"hosttransfer","oldHost":"${message[1][`oldHost`]}","newHost":"${message[1][`newHost`]}"}`
                case 42:
                    console.log(`detected friend request from ${message[1]}`)
                    return `{"type":"friend","id":"${message[1]}"}`
                case 43:
                    console.log(`detected countdown ${message[1]}`)
                    return `{"type":"countdown","countdown":"${message[1]}"}`
                    break;
                case 44:
                    console.log(`detected countdown abort`)
                    return `{"type":"countdownabort"}`
                    break;
                case 45:
                    console.log(`detected player level up`)
                    return `{"type":"playerlevelup","id":"${message[1]}","level":"${message[2]}"}`
                    break;
                case 46:
                    console.log(`detected xp gain ${message[1][`newXP`]}`)
                    if(message[1][`newLevel`] != undefined){
                        return `{"type":"levelup","xp":${message[1][`newXP`]},"level":${message[1][`newLevel`]},"token","${message[1][`newToken`]}"}`
                    }else{
                        return `{"type":"xp","xp":${message[1][`newXP`]}}`
                    }
                case 52:
                    console.log(`detected player tabbed ${message[2]}`)
                    return `{"type":"playertabbed","id":"${message[1]}","tabbed":${message[2]}}`
                    break;
                case 58:
                    console.log(`detected room name change to ${message[1]}`)
                    return `{"type":"roomnamechange","name":"${message[1]}"}`
                    break;
                case 59:
                    if(message[1] == `1`){
                        console.log(`detected room password on`)
                        return `{"type":"roompassword","password":true}`
                    }else{
                        console.log(`detected room password off`)
                        return `{"type":"roompassword","password":false}`
                    }
                    break;
                case 39:
                    console.log(`detected team toggle ${message[1]}`)
                    return `{"type":"teamtoggle","teams":"${message[1]}"}`
                    break;
            }
            console.log(message)
            return `{"type":"none"}`
        }
        return JSON.parse(switchyswitch(message))
	}
}


module.exports = {
    parsesocket,

    sendInput,
    joinTeam,
    toggleTeams,
    banPlayer,
    sendChat,
    leaveGame,
    setReady,
    gainXP,
    timesync,
    giveHost,
    joinRoom,
    getRoomByName,
    getRooms,
    getSocketID,
    getPeerID,
    getPlayerMovement,
    getToken,
    getTokenInfo,
    sendFriendRequest,
    addFriend,
    getFriends,
    getRoomAddress,
    sendRoomInfo,
    setRounds,
    recordGame,
}