const bonkserver = require('./config.json');
const chalk = require('chalk');
const axios = require('axios');

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


// fancy logging :sunglasses:
function logload(msg){
    console.log(chalk.yellow(`[${bonkserver.log_name}]`), chalk.white(msg));
}
function logsuccess(msg){
    console.log(chalk.green(`[${bonkserver.log_name}]`), chalk.white(msg));
}
function logchat(msg){
    console.log(chalk.blue(`[CHAT]`), chalk.white(msg));
}
function loginfo(msg){
    console.log(chalk.cyan(`[${bonkserver.log_name}]`), chalk.white(msg));
}
function logerror(msg){
    console.log(chalk.red(`[${bonkserver.log_name}]`), chalk.white(msg));
}


module.exports = {
    getPicks,
    gameengines,
    gamemodes,
    num2team,
    logload,
    logsuccess,
    logchat,
    loginfo,
    logerror
}