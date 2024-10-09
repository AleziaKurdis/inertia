//
//
//  AC_ctfGameManager.js
//
//  Created by Alezia Kurdis on August 14th, 2024
//  Copyright 2024 Alezia Kurdis.
//
//  Server side game manager for Capture The Flag game.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

print("CTF: start running.");
var jsMainFileName = "AC_ctfGameManager.js";
var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

var channelComm = "ak.ctf.ac.communication";

var ORIGIN_POSITION = { "x": -4000, "y": 4000, "z": -4000};
var EFFECTIVE_RANGE = 800; //in meters

var FLAG_HOME_RED = Vec3.sum(ORIGIN_POSITION, { "x": -130.7705078125, "y": -7.169189453125, "z": -1.6572265625});
var FLAG_HOME_BLUE = Vec3.sum(ORIGIN_POSITION, { "x": 130.7705078125, "y": -7.169189453125, "z": 1.6572265625});
var FLAG_TRAP_RED_SIDE = Vec3.sum(ORIGIN_POSITION, { "x": -128.54296875, "y": -7.169189453125, "z": -1.6572265625});
var FLAG_TRAP_BLUE_SIDE = Vec3.sum(ORIGIN_POSITION, { "x": 128.54296875, "y": -7.169189453125, "z": 1.6572265625});

var flagBlueID = Uuid.NULL;
var flagRedID = Uuid.NULL;

var flagRedLapCounter = 0;
var flagBlueLapCounter = 0;
var ABANDON_TIME_RECOVER = 21;

var flagBlueStatus = "HOME"; //HOME, TAKEN, ABANDONNED
var flagRedStatus = "HOME"; //HOME, TAKEN, ABANDONNED

var updateTimerInterval = 1000; //1sec.
var processTimer = 0;

var gameTimerInterval = 700; //0.7sec.
var processGameTimer = 0;

var gunsTimerInterval = 60000; //minutes.
var processGunsTimer = 0;

//PLANNED:
/*var guns = [
    {"model": "BASIC", "position": {"x": -115.3169,"y": -7.3716, "z": 2.2122}, "rezDelay": 20000}, //#RED 1
    {"model": "BASIC", "position": {"x": -115.3169,"y": -7.3716, "z": -5.3416}, "rezDelay": 20000}, //#RED 2
    {"model": "ANIL-8M", "position": {"x": -99.8276,"y": 9.3313, "z": -3.4102}, "rezDelay": 180000}, //#RED
    {"model": "ANIL-16M", "position": {"x": -108.0322,"y": 27.4490, "z": 0.9851}, "rezDelay": 300000}, //#RED
    {"model": "ANIL-4M", "position": {"x": -118.6899,"y": -8.7787, "z": -18.3021}, "rezDelay": 20000}, //#RED
    {"model": "ELECTRO", "position": {"x": -124.4175,"y": -7.3716, "z": 1.0249}, "rezDelay": 20000}, //#RED 1
    {"model": "ELECTRO", "position": {"x": -124.4175,"y": -7.3716, "z": -4.3853}, "rezDelay": 20000}, //#RED 1 
    {"model": "BASIC", "position": {"x": 115.3169,"y": -7.3716, "z": -2.2122}, "rezDelay": 20000}, //#BLUE 1
    {"model": "BASIC", "position": {"x": 115.3169,"y": -7.3716, "z": 5.3416}, "rezDelay": 20000}, //#BLUE 2
    {"model": "ANIL-8M", "position": {"x": 99.8276,"y": 9.3313, "z": 3.4731}, "rezDelay": 180000}, //#BLUE
    {"model": "ANIL-16M", "position": {"x": 108.0322,"y": 27.4490, "z": -1.1755}, "rezDelay": 300000}, //#BLUE
    {"model": "ANIL-4M", "position": {"x": 118.6899,"y": -8.7787, "z": 18.3021}, "rezDelay": 20000}, //#BLUE
    {"model": "ELECTRO", "position": {"x": 124.4175,"y": -7.3716, "z": -1.0249}, "rezDelay": 20000}, //#BLUE
    {"model": "ELECTRO", "position": {"x": 124.4175,"y": -7.3716, "z": 4.3853}, "rezDelay": 20000}, //#BLUE 
    
];*/
//Temporary cause only Electro is working for now.
var guns = [
    {"model": "ELECTRO", "position": {"x": -115.3169,"y": -7.3716, "z": 2.2122}, "rezDelay": 20000}, //#RED 1
    {"model": "ELECTRO", "position": {"x": -115.3169,"y": -7.3716, "z": -5.3416}, "rezDelay": 20000}, //#RED 2
    {"model": "ELECTRO", "position": {"x": -99.8276,"y": 9.3313, "z": -3.4102}, "rezDelay": 20000}, //#RED
    {"model": "ELECTRO", "position": {"x": -108.0322,"y": 27.4490, "z": 0.9851}, "rezDelay": 20000}, //#RED
    {"model": "ELECTRO", "position": {"x": -118.6899,"y": -8.7787, "z": -18.3021}, "rezDelay": 20000}, //#RED
    {"model": "ELECTRO", "position": {"x": -124.4175,"y": -7.3716, "z": 1.0249}, "rezDelay": 20000}, //#RED 1
    {"model": "ELECTRO", "position": {"x": -124.4175,"y": -7.3716, "z": -4.3853}, "rezDelay": 20000}, //#RED 1 
    {"model": "ELECTRO", "position": {"x": 115.3169,"y": -7.3716, "z": -2.2122}, "rezDelay": 20000}, //#BLUE 1
    {"model": "ELECTRO", "position": {"x": 115.3169,"y": -7.3716, "z": 5.3416}, "rezDelay": 20000}, //#BLUE 2
    {"model": "ELECTRO", "position": {"x": 99.8276,"y": 9.3313, "z": 3.4731}, "rezDelay": 20000}, //#BLUE
    {"model": "ELECTRO", "position": {"x": 108.0322,"y": 27.4490, "z": -1.1755}, "rezDelay": 20000}, //#BLUE
    {"model": "ELECTRO", "position": {"x": 118.6899,"y": -8.7787, "z": 18.3021}, "rezDelay": 20000}, //#BLUE
    {"model": "ELECTRO", "position": {"x": 124.4175,"y": -7.3716, "z": -1.0249}, "rezDelay": 20000}, //#BLUE
    {"model": "ELECTRO", "position": {"x": 124.4175,"y": -7.3716, "z": 4.3853}, "rezDelay": 20000}, //#BLUE 
    
];

var gunsIDtoDelete = [];

var players = [];

var gameStatus = "IDLE"; //IDLE | PLAYING
var gameStartTime;
var GAME_DURATION = 15 * 60 * 1000; //15 minutes
var scoreRed = 0;
var scoreBlue = 0;

var DAY_DURATION = 104400;// D29

function onMessageReceived(channel, message, sender, localOnly) {
    var messageToSent;
    if (channel === channelComm) {
        var data = JSON.parse(message);
        if (data.action === "GET_PLAYER_LIST") { 
            messageToSent = {
                "action": "PLAYER_LIST",
                "players": players,
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
            
            
            var visible = true;
            if (gameStatus === "PLAYING") {
                visible = false;
            }
            messageToSent = {
                "action": "MANAGE_START_BUTTON",
                "visible": visible,
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
            
        } else if (data.action === "SET_PLAYER_TEAM") {
            addPlayer(data.avatarID, data.team);
            messageToSent = {
                "action": "PLAYER_LIST",
                "players": players,
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
        } else if (data.action === "START") {
            if (gameStatus === "IDLE") {
                gameStatus = "PLAYING";
                messageToSent = {
                    "action": "MANAGE_START_BUTTON",
                    "visible": false,
                };
                Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
                initiateGame(true);
            }
            
        } else if (data.action === "START_KC") {
            if (gameStatus === "IDLE") {
                gameStatus = "PLAYING";
                messageToSent = {
                    "action": "MANAGE_START_BUTTON",
                    "visible": false,
                };
                Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
                initiateGame(false);
            }
            
        } else if (data.action === "SWAP") {
            swapPlayer(data.avatarID);
            messageToSent = {
                "action": "PLAYER_LIST",
                "players": players,
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
        } else if (data.action === "DECLARE_A_DEATH") {
            if (gameStatus === "PLAYING") {
                EntityViewer.queryOctree();
                registerADeath(data.avatarID, data.flagFoundID, data.flagFoundPosition, data.by);
                messageToSent = {
                    "action": "PLAYER_LIST",
                    "players": players,
                };
                Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
            }
        } else if (data.action === "DELETE_GUN") {
            Entities.deleteEntity(data.entityID);
            EntityViewer.queryOctree();
        } else if (data.action === "KILL") {
            ejectBones(data.position);
        }
    }
}

function initiateGame(mustSwap) {
    clearFlagGarbadge();
    var today = new Date();
    gameStartTime = today.getTime();
    swapTeamColorAndResetDeath(mustSwap);
    var messageToSent = {
        "action": "PLAYER_LIST",
        "players": players,
    };
    Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
    joinEveryPlayer();
    scoreRed = 0;
    scoreBlue = 0;
    flagBlueID = Uuid.NULL;
    flagRedID = Uuid.NULL;
    regenerateFlag("BLUE", FLAG_HOME_BLUE);
    regenerateFlag("RED", FLAG_HOME_RED);
    flagBlueStatus = "HOME";
    flagRedStatus = "HOME";
    gameStatus = "PLAYING";
    processGameTimer = 0;
    processTimer = 0;
    processGunsTimer = 0;
    initializeGuns();
    Script.update.connect(myTimer);
    audioAnnouncement("GAME_BEGIN");
}

function regenerateFlag(flagColor, flagPosition) {
    var currentGravity = (Math.sin(GetCurrentCycleValue(Math.PI * 2, Math.floor((DAY_DURATION/24) * 1.618))) * 3.5) - 6.3; // -9.8 to -2.8 m/s2
    switch(flagColor) {
        case "RED":
            if (flagRedID !== Uuid.NULL) {
                Entities.deleteEntity(flagRedID);
                EntityViewer.queryOctree();
            }
            flagRedID = Entities.addEntity({
                "type": "Model",
                "position": flagPosition,
                "name": "x!!==$%CTF-FLAG%$==!!x",
                "dimensions": {
                    "x": 0.16388998925685883,
                    "y": 1.7259058952331543,
                    "z": 0.04999999701976776
                },
                "rotation": Quat.fromVec3Degrees( {"x": 0, "y": 90, "z": 0 } ),
                "ignorePickIntersection": true,
                "grab": {
                    "grabbable": true,
                    "equippable": true,
                    "equippableLeftPosition": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "equippableLeftRotation": {
                        "w": 0.49999237060546875,
                        "x": 0.49999237060546875,
                        "y": -0.5000228881835938,
                        "z": 0.49999237060546875
                    },
                    "equippableRightPosition": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "equippableRightRotation": {
                        "w": 0.49999237060546875,
                        "x": 0.49999237060546875,
                        "y": 0.49999237060546875,
                        "z": -0.5000228881835938
                    }
                },
                "gravity": {
                    "x": 0,
                    "y": currentGravity,
                    "z": 0
                },
                "damping": 0,
                "angularDamping": 0,
                "shapeType": "box",
                "modelURL": ROOT + "models/FLAG_RED.fst",
                "useOriginalPivot": true,
                //"dynamic": true,
                "lifetime": 920,
                "serverScripts": ROOT + "dummy.js"
            }, "domain");
            break;
        case "BLUE":
            if (flagBlueID !== Uuid.NULL) {
                Entities.deleteEntity(flagBlueID);
                EntityViewer.queryOctree();
            }
            flagBlueID = Entities.addEntity({
                "type": "Model",
                "position": flagPosition,
                "name": "x!!==$%CTF-FLAG%$==!!x",
                "dimensions": {
                    "x": 0.16388998925685883,
                    "y": 1.7259058952331543,
                    "z": 0.04999999701976776
                },
                "rotation": Quat.fromVec3Degrees( {"x": 0, "y": 90, "z": 0 } ),
                "ignorePickIntersection": true,
                "grab": {
                    "grabbable": true,
                    "equippable": true,
                    "equippableLeftPosition": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "equippableLeftRotation": {
                        "w": 0.49999237060546875,
                        "x": 0.49999237060546875,
                        "y": -0.5000228881835938,
                        "z": 0.49999237060546875
                    },
                    "equippableRightPosition": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "equippableRightRotation": {
                        "w": 0.49999237060546875,
                        "x": 0.49999237060546875,
                        "y": 0.49999237060546875,
                        "z": -0.5000228881835938
                    }
                },
                "gravity": {
                    "x": 0,
                    "y": currentGravity,
                    "z": 0
                },
                "damping": 0,
                "angularDamping": 0,
                "shapeType": "box",
                "modelURL": ROOT + "models/FLAG_BLUE.fst",
                "useOriginalPivot": true,
                //"dynamic": true,
                "lifetime": 920,
                "serverScripts": ROOT + "dummy.js"
            }, "domain");
            break;
        default:
            return;
    }
}

function myTimer(deltaTime) {
    var i, holder, player;
    var today = new Date();
    var messageToSent, remainingDuration;
    
    if ((today.getTime() - processGameTimer) > gameTimerInterval ) {
        EntityViewer.queryOctree();
        var currentRedFlagPosition = Entities.getEntityProperties(flagRedID,["position"]).position;
        EntityViewer.queryOctree();
        var currentBlueFlagPosition = Entities.getEntityProperties(flagBlueID,["position"]).position;
        if (Vec3.distance(currentRedFlagPosition, FLAG_HOME_RED) > 0.3) {
            //flag possibly taken
            if (Vec3.distance(currentRedFlagPosition, FLAG_TRAP_BLUE_SIDE) < 0.3 && flagBlueStatus === "HOME") {
                //flag getting captured
                scoreBlue = scoreBlue + 1;
                regenerateFlag("RED", FLAG_HOME_RED);
                flagRedStatus = "HOME";
                audioAnnouncement("RED_FLAG_CAPTURED");
            } else {
                //check users... flag is potentially TAKEN or ABANDONNED
                holder = "";
                for (i = 0; i < players.length; i++) {
                    player = AvatarList.getAvatar(players[i].avatarID);
                    if (Vec3.distance(currentRedFlagPosition, player.position) < 1.0) {
                        if (holder !== "BLUE") {
                            holder = players[i].team;
                        }
                    }
                }
                if (holder === "") {
                    //abandonned
                    if (flagRedStatus !== "ABANDONNED") {
                        flagRedLapCounter = ABANDON_TIME_RECOVER;
                        flagRedStatus = "ABANDONNED";
                    } else {
                        flagRedLapCounter = flagRedLapCounter - 1;
                        if (flagRedLapCounter < 1) {
                            //Returning the flag
                            regenerateFlag("RED", FLAG_HOME_RED);
                            flagRedStatus = "HOME";
                            audioAnnouncement("RED_FLAG_RETURNED");
                        }
                    }
                } else if (holder === "RED") {
                    //Returning the flag
                    regenerateFlag("RED", FLAG_HOME_RED);
                    flagRedStatus = "HOME";
                    audioAnnouncement("RED_FLAG_RETURNED");
                } else if (holder === "BLUE") {
                    if (flagRedStatus !== "TAKEN" && Vec3.distance(currentRedFlagPosition, FLAG_HOME_RED) < 5) {
                        audioAnnouncement("RED_FLAG_TAKEN");
                    }
                    flagRedStatus = "TAKEN";
                }
            }
        }
        if (Vec3.distance(currentBlueFlagPosition, FLAG_HOME_BLUE) > 0.3) {
            //flag possibly taken
            if (Vec3.distance(currentBlueFlagPosition, FLAG_TRAP_RED_SIDE) < 0.3 && flagRedStatus === "HOME") {
                //flag getting captured
                scoreRed = scoreRed + 1;
                regenerateFlag("BLUE", FLAG_HOME_BLUE);
                flagBlueStatus = "HOME";
                audioAnnouncement("BLUE_FLAG_CAPTURED");
            } else {
                //check users... flag is potentially TAKEN or ABANDONNED
                holder = "";
                for (i = 0; i < players.length; i++) {
                    player = AvatarList.getAvatar(players[i].avatarID);
                    if (Vec3.distance(currentBlueFlagPosition, player.position) < 1.0) {
                        if (holder !== "RED") {
                            holder = players[i].team;
                        }
                    }
                }
                if (holder === "") {
                    //abandonned
                    if (flagBlueStatus !== "ABANDONNED") {
                        flagBlueLapCounter = ABANDON_TIME_RECOVER;
                        flagBlueStatus = "ABANDONNED";
                    } else {
                        flagBlueLapCounter = flagBlueLapCounter - 1;
                        if (flagBlueLapCounter < 1) {
                            //Returning the flag
                            regenerateFlag("BLUE", FLAG_HOME_BLUE);
                            flagBlueStatus = "HOME";
                            audioAnnouncement("BLUE_FLAG_RETURNED");
                        }
                    }
                } else if (holder === "BLUE") {
                    //Returning the flag
                    regenerateFlag("BLUE", FLAG_HOME_BLUE);
                    flagBlueStatus = "HOME";
                    audioAnnouncement("BLUE_FLAG_RETURNED");
                } else if (holder === "RED") {
                    if (flagBlueStatus !== "TAKEN" && Vec3.distance(currentBlueFlagPosition, FLAG_HOME_BLUE) < 5) {
                        audioAnnouncement("BLUE_FLAG_TAKEN");
                    }
                    flagBlueStatus = "TAKEN";
                }
            }
        }

        today = new Date();
        processGameTimer = today.getTime();
    }
    
    if ((today.getTime() - processGunsTimer) > gunsTimerInterval ) {
        //GUNS LOOP
        var id, g, entityFoundIDs;
        remainingDuration = Math.floor((gameStartTime + GAME_DURATION - today.getTime()) / 1000);
        for (g = 0; g < guns.length; g++) {
            EntityViewer.queryOctree();
            entityFoundIDs = Entities.findEntitiesByName(guns[g].model, Vec3.sum(ORIGIN_POSITION, guns[g].position), 0.2, true);
            if (entityFoundIDs.length === 0) {
                id = generateGun(guns[g].model, Vec3.sum(ORIGIN_POSITION, guns[g].position), guns[g].rezDelay, remainingDuration);
                if (id !== Uuid.NULL) {
                    gunsIDtoDelete.push(id);
                }
            }
        }
        
        today = new Date();
        processGunsTimer = today.getTime();
    }
    
    if ((today.getTime() - processTimer) > updateTimerInterval ) {

        //processing here to sent remining time
        remainingDuration = Math.floor((gameStartTime + GAME_DURATION - today.getTime()) / 1000);
        if (remainingDuration < 0) {
            //#### END OF GAME HERE #######################
            Script.update.disconnect(myTimer);
            gameStatus = "IDLE";
            clearGuns();

            if (flagBlueID !== Uuid.NULL) {
                EntityViewer.queryOctree();
                Entities.deleteEntity(flagBlueID);
                EntityViewer.queryOctree();
                flagBlueID = Uuid.NULL;
            }
            if (flagRedID !== Uuid.NULL) {
                EntityViewer.queryOctree();
                Entities.deleteEntity(flagRedID);
                EntityViewer.queryOctree();
                flagRedID = Uuid.NULL;
            }

            var winner; 
            if (scoreRed > scoreBlue) {
                winner = "RED HAVE WON!";
                audioAnnouncement("RED_TEAM_IS_THE_WINNER");
            } else if (scoreRed === scoreBlue) {
                var teamsStat = getTeamsKilledAndDeath();
                if (teamsStat.redKilled > teamsStat.blueKilled) {
                    winner = "RED HAVE WON!";
                    audioAnnouncement("RED_TEAM_IS_THE_WINNER");
                } else if (teamsStat.redKilled === teamsStat.blueKilled) {
                    if (teamsStat.redDeath < teamsStat.blueDeath) {
                        winner = "RED HAVE WON!";
                        audioAnnouncement("RED_TEAM_IS_THE_WINNER");
                    } else if (teamsStat.redDeath === teamsStat.blueDeath) {
                        winner = "EVEN GAME!";
                        audioAnnouncement("EVEN_GAME");
                    } else {
                        winner = "BLUE HAVE WON!";
                        audioAnnouncement("BLUE_TEAM_IS_THE_WINNER");
                    }
                } else {
                    winner = "BLUE HAVE WON!";
                    audioAnnouncement("BLUE_TEAM_IS_THE_WINNER");
                }
            } else {
                winner = "BLUE HAVE WON!";
                audioAnnouncement("BLUE_TEAM_IS_THE_WINNER");
            }
            
            messageToSent = {
                "action": "DISPLAY_GAME_TIME",
                "value": winner,
                "scoreRed": scoreRed,
                "scoreBlue": scoreBlue
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
            messageToSent = {
                "action": "MANAGE_START_BUTTON",
                "visible": true,
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
        } else {
            messageToSent = {
                "action": "DISPLAY_GAME_TIME",
                "value": getSecInMinuteFormat(remainingDuration),
                "scoreRed": scoreRed,
                "scoreBlue": scoreBlue
            };
            Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
            if (remainingDuration === 300) {
                audioAnnouncement("FIVE_MINUTES_REMAIN");
            } else if (remainingDuration === 60) {
                audioAnnouncement("ONE_MINUTES_REMAIN");
            }
        }


        today = new Date();
        processTimer = today.getTime();
    }
}

function getTeamsKilledAndDeath() {
    var blueKilled, blueDeath, redKilled, redDeath;
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].team === "RED") {
            redKilled = redKilled + players[i].kill;
            redDeath = redDeath + players[i].death;
        } else {
            blueKilled = blueKilled + players[i].kill;
            blueDeath = blueDeath + players[i].death;
        }
    }
    return {
        "blueDeath": blueDeath,
        "blueKilled": blueKilled,
        "redDeath": redDeath,
        "redKilled": redKilled
    };
}

function initializeGuns() {
    var id, g;
    var today = new Date();
    remainingDuration = Math.floor((gameStartTime + GAME_DURATION - today.getTime()) / 1000);
    for (g = 0; g < guns.length; g++) {
        id = generateGun(guns[g].model, Vec3.sum(ORIGIN_POSITION, guns[g].position), 0, remainingDuration);
        if (id !== Uuid.NULL) {
            gunsIDtoDelete.push(id);
        }
    }
}

function generateGun(model, position, rezDelay, remainingDuration) {
    var id, properties;
    if ((remainingDuration - Math.floor(rezDelay/1000)) > 0) {
        Script.setTimeout(function () {
            switch (model) {
                case "ELECTRO":
                    id = Entities.addEntity({
                        "name": model,
                        "position": position,
                        "shapeType": "box",
                        "type": "Model",
                        "dimensions": {"x":0.09806843847036362,"y":0.1949957311153412,"z":0.6852444410324097},
                        "useOriginalPivot": false,
                        "grab": {
                            "grabbable": true,
                            "equippable": true,
                            "equippableLeftPosition": {
                                "x": -0.05,
                                "y": 0.16,
                                "z": 0.02
                            },
                            "equippableLeftRotation": {
                                "w": 0.49999237060546875,
                                "x": 0.49999237060546875,
                                "y": -0.5000228881835938,
                                "z": 0.49999237060546875
                            },
                            "equippableRightPosition": {
                                "x": 0.05,
                                "y": 0.16,
                                "z": 0.02
                            },
                            "equippableRightRotation": {
                                "w": 0.49999237060546875,
                                "x": 0.49999237060546875,
                                "y": 0.49999237060546875,
                                "z": -0.5000228881835938
                            },
                            "equippableIndicatorURL": ROOT + "electroGuns/instructions.glb",
                            "equippableIndicatorScale": {"x": 0.12, "y": 0.06, "z": 0.12},
                            "equippableIndicatorOffset": {"x": 0.0, "y": 0.3, "z": 0.0}
                        },
                        "lifetime": remainingDuration - Math.floor(rezDelay/1000),
                        "modelURL": ROOT + "electroGuns/electroGun.fst",
                        "script": ROOT + "electroGuns/electroGun.js"
                    }, "domain");
                    break;
                case "BASIC":
                    id = Entities.addEntity({
                        "name": model,
                        "position": position,
                        "shapeType": "box",
                        "type": "Model",
                        "dimensions": {"x":0.033772632479667664,"y":0.1770840883255005,"z":0.37516123056411743},
                        "useOriginalPivot": false,
                        "grab": {
                            "grabbable": true,
                            "equippable": true,
                            "equippableLeftPosition": {
                                "x": -0.01,
                                "y": 0.16,
                                "z": 0.025
                            },
                            "equippableLeftRotation": {
                                "w": 0.49999237060546875,
                                "x": 0.49999237060546875,
                                "y": -0.5000228881835938,
                                "z": 0.49999237060546875
                            },
                            "equippableRightPosition": {
                                "x": 0.01,
                                "y": 0.16,
                                "z": 0.025
                            },
                            "equippableRightRotation": {
                                "w": 0.49999237060546875,
                                "x": 0.49999237060546875,
                                "y": 0.49999237060546875,
                                "z": -0.5000228881835938
                            },
                            "equippableIndicatorURL": ROOT + "basicGuns/instructions.glb",
                            "equippableIndicatorScale": {"x": 0.12, "y": 0.06, "z": 0.12},
                            "equippableIndicatorOffset": {"x": 0.0, "y": 0.3, "z": 0.0}
                        },
                        "lifetime": remainingDuration - Math.floor(rezDelay/1000),
                        "modelURL": ROOT + "basicGuns/basicGun.fst",
                        "script": ROOT + "basicGuns/basicGun.js"
                    }, "domain");
                    break;
                case "ANIL-16M":
                case "ANIL-8M":
                case "ANIL-4M":
                    id = Entities.addEntity({
                        "name": model,
                        "position": position,
                        "shapeType": "box",
                        "type": "Model",
                        "dimensions": {"x":0.11555665731430054,"y":0.2598230838775635,"z":0.48354044556617737},
                        "useOriginalPivot": true,
                        "grab": {
                            "grabbable": true,
                            "equippable": true,
                            "equippableLeftPosition": {
                                "x": -0.035,
                                "y": 0.08,
                                "z": 0.02
                            },
                            "equippableLeftRotation": {
                                "w": 0.49999237060546875,
                                "x": 0.49999237060546875,
                                "y": -0.5000228881835938,
                                "z": 0.49999237060546875
                            },
                            "equippableRightPosition": {
                                "x": 0.035,
                                "y": 0.08,
                                "z": 0.02
                            },
                            "equippableRightRotation": {
                                "w": 0.49999237060546875,
                                "x": 0.49999237060546875,
                                "y": 0.49999237060546875,
                                "z": -0.5000228881835938
                            },
                            "equippableIndicatorURL": ROOT + "rocketGuns/instructions.glb",
                            "equippableIndicatorScale": {"x": 0.12, "y": 0.06, "z": 0.12},
                            "equippableIndicatorOffset": {"x": 0.0, "y": 0.3, "z": 0.0}
                        },
                        "lifetime": remainingDuration - Math.floor(rezDelay/1000),
                        "modelURL": ROOT + "rocketGuns/" + model + ".fst",
                        "script": ROOT + "rocketGuns/rocketGun.js"
                    }, "domain");
                    break;
            }

            return id;
        }, rezDelay);
    } else {
        return Uuid.NULL;
    }
}

function audioAnnouncement(recordingCode) {
    var messageToSent = {
        "action": recordingCode
    };
    Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
}

function getSecInMinuteFormat(sec) {
    var nbrMinutes = Math.floor(sec/60);
    var nbrSec = sec - (nbrMinutes * 60);
    if (nbrSec < 10) {
        return nbrMinutes + ":" + "0" + nbrSec;
    } else {
        return nbrMinutes + ":" + nbrSec;
    }
}

function clearFlagGarbadge() {
    var i;
    EntityViewer.queryOctree();
    var entityIDs = Entities.findEntitiesByName("x!!==$%CTF-FLAG%$==!!x", ORIGIN_POSITION, 3000, true);
    if (entityIDs.length > 0) {
        for (i = 0; i < entityIDs.length; i++) {
            EntityViewer.queryOctree();
            Entities.deleteEntity(entityIDs[i]);
            EntityViewer.queryOctree();
        }
    }
}

function joinEveryPlayer() {
    var i, messageToSent;
    for (i = 0; i < players.length; i++) {
        messageToSent = {
            "action": "JOIN",
            "avatarID": players[i].avatarID
        };
        Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
    }
}

function swapTeamColorAndResetDeath(mustSwap) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (mustSwap) {
            if (players[i].team === "RED") {
                players[i].team = "BLUE";
            } else {
                players[i].team = "RED";
            }
        }
        players[i].death = 0;
        players[i].kill = 0;
    }
}

function registerADeath(avatarID, flagFoundID, flagFoundPosition, by) {
    var victimeTeam = isPlayerKnown(avatarID);
    var byTeam = isPlayerKnown(by);
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].avatarID === avatarID) {
            if (flagFoundID === flagRedID) {
                //red flag
                regenerateFlag("RED", flagFoundPosition);
            } else if (flagFoundID === flagBlueID) {
                //blue flag
                regenerateFlag("BLUE", flagFoundPosition);
            }
            players[i].death = players[i].death + 1;
            break;
        }
        if (players[i].avatarID === by) {
            if (victimeTeam !== byTeam && victimeTeam !== "NONE" && byTeam !== "NONE") {
                players[i].kill = players[i].kill + 1;
            }
        }
    }
}

function addPlayer(avatarID, team) {
    var currentTeam = isPlayerKnown(avatarID);
    if (currentTeam === "NONE") {
        var player = {"avatarID": avatarID, "team": team, "death": 0, "kill": 0 };
        players.push(player);
    } else {
        for (var i = 0; i < players.length; i++) {
            if (players[i].avatarID === avatarID) {
                players[i].team = team;
                break;
            }
        }
    }
}

function swapPlayer(avatarID) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].avatarID === avatarID) {
            if (players[i].team === "RED") {
                players[i].team = "BLUE";
            } else {
                players[i].team = "RED";
            }
            break;
        }
    }
}

function isPlayerKnown(avatarID) {
    if (players.length > 0) {
        var team = "NONE";
        for (var i = 0; i < players.length; i++) {
            if (players[i].avatarID === avatarID) {
                team = players[i].team;
                break;
            }
        }
        return team;
    } else {
        return "NONE";
    }
}

function updatePlayersList() {
    var processedPlayers = [];
    if (players.length > 0) {
        var presentAvatarIDs = AvatarList.getAvatarsInRange(ORIGIN_POSITION, EFFECTIVE_RANGE);
        for (var i = 0; i < players.length; i++) {
            if (presentAvatarIDs.indexOf(players[i].avatarID) !== -1) {
                processedPlayers.push(players[i]);
            }
        }
        players = processedPlayers.slice();
        
        var message = {
            "action": "PLAYER_LIST",
            "players": players,
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));
    }
}

function ejectBones(position){
    var i;
    playSound(SOUND_AVATAR_KILLED, position, 1);
    for (i = 0; i < 40; i++) {
        var ejectionBoneVelocity = {"x": (Math.random() * 10)-5, "y": (Math.random() * 10)-5, "z": (Math.random() * 10)-5};
        var angularBoneVelocity = {"x": (Math.random() * 6)-3, "y": (Math.random() * 6)-3, "z": (Math.random() * 6)-3};
        var boneScale = 0.9 + (Math.random() * 1.4);
        if (Math.random() > 0.7) {
            boneID = Entities.addEntity({
                "name": "AVATAR-BONE",
                "type": "Model",
                "modelURL": ROOT + "models/avatarBone.fst",
                "useOriginalPivot": false,
                "shapeType": "box",
                "dimensions": Vec3.multiply({"x": 0.035, "y": 0.2, "z": 0.035}, boneScale),
                "position": position,
                "grab": {
                    "grabbable": true
                },            
                "dynamic": true,
                "gravity": { "x": 0, "y": -9.8, "z": 0 },
                "restitution": 0.4,
                "friction": 0.3,
                "angularVelocity": angularBoneVelocity,
                "velocity": ejectionBoneVelocity,
                "lifetime": 20 + (Math.floor(Math.random() * 21))
            }, "domain");
        } else {
            boneID = Entities.addEntity({
                "name": "AVATAR-VOXEL",
                "type": "Shape",
                "shape": "Cube",
                "dimensions": {"x": 0.04, "y": 0.04, "z": 0.04},
                "position": position,
                "grab": {
                    "grabbable": true
                },
                "color": {
                    "red": 196,
                    "green": 0,
                    "blue": 0
                },
                "dynamic": true,
                "gravity": { "x": 0, "y": -9.8, "z": 0 },
                "restitution": 0.4,
                "friction": 0.3,
                "angularVelocity": angularBoneVelocity,
                "velocity": ejectionBoneVelocity,
                "lifetime": 10 + (Math.floor(Math.random() * 8))
            }, "domain");
        }
    }
}

function clearGuns() {
    var i;
    for (i=0; i < gunsIDtoDelete.length; i++) {
        Entities.deleteEntity(gunsIDtoDelete[i]);
        EntityViewer.queryOctree();
    }
    gunsIDtoDelete = [];
}

function setUpEntityViewer() {
    EntityViewer.setPosition(ORIGIN_POSITION);
    EntityViewer.setCenterRadius(8000);
    EntityViewer.queryOctree();
}

function playSound(sound, position, volume) {
    var injectorOptions = {
        "position": position,
        "volume": volume,
        "loop": false,
        "localOnly": false
    };
    var injector = Audio.playSound(sound, injectorOptions);
}

function playLoopingSound(sound, position, volume) {
    var injectorOptions = {
        "position": position,
        "volume": volume,
        "loop": true,
        "localOnly": false
    };
    return injector = Audio.playSound(sound, injectorOptions);
}

// ################## CYLCE AND TIME FUNCTIONS ###########################
function GetCurrentCycleValue(cyclelength, cycleduration){
    var today = new Date();
    var TodaySec = today.getTime()/1000;
    var CurrentSec = TodaySec%cycleduration;
    
    return (CurrentSec/cycleduration)*cyclelength;
    
}
// ################## END CYLCE AND TIME FUNCTIONS ###########################

Messages.subscribe(channelComm);
Messages.messageReceived.connect(onMessageReceived);
AvatarList.avatarRemovedEvent.connect(updatePlayersList);

var SOUND_AVATAR_KILLED = SoundCache.getSound(ROOT + "sounds/avatarKilled.wav");
setUpEntityViewer();
clearFlagGarbadge();

Script.scriptEnding.connect(function () {
    if (flagBlueID !== Uuid.NULL) {
        EntityViewer.queryOctree();
        Entities.deleteEntity(flagBlueID);
        EntityViewer.queryOctree();
        flagBlueID = Uuid.NULL;
    }
    if (flagRedID !== Uuid.NULL) {
        EntityViewer.queryOctree();
        Entities.deleteEntity(flagRedID);
        EntityViewer.queryOctree();
        flagRedID = Uuid.NULL;
    }
    
    clearGuns();
    
    Messages.messageReceived.disconnect(onMessageReceived);
    Messages.unsubscribe(channelComm);
    if (gameStatus === "PLAYING") {
        Script.update.disconnect(myTimer);
    }
    AvatarList.avatarRemovedEvent.disconnect(updatePlayersList);
});

