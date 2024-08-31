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
                initiateGame();
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
                registerADeath(data.avatarID);
                messageToSent = {
                    "action": "PLAYER_LIST",
                    "players": players,
                };
                Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
            }
        }
    }
}

function initiateGame() {
    clearFlagGarbadge();
    var today = new Date();
    gameStartTime = today.getTime();
    swapTeamColorAndResetDeath();
    var messageToSent = {
        "action": "PLAYER_LIST",
        "players": players,
    };
    Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
    joinEveryPlayer();
    scoreRed = 0;
    scoreBlue = 0;
    
    var currentGravity = (Math.sin(GetCurrentCycleValue(Math.PI * 2, Math.floor((DAY_DURATION/24) * 1.618))) * 3.5) - 6.3; // -9.8 to -2.8 m/s2
    
    //set flags
    flagBlueID = Entities.addEntity({
        "type": "Model",
        "position": FLAG_HOME_BLUE,
        "name": "x!!==$%CTF-FLAG%$==!!x",
        "dimensions": {
            "x": 0.16388998925685883,
            "y": 1.7259058952331543,
            "z": 0.04999999701976776
        },
        "rotation": Quat.fromVec3Degrees( {"x": 0, "y": 90, "z": 0 } ),
        "ignorePickIntersection": true,
        "grab": {
            "grabbable": true
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
    
    flagRedID = Entities.addEntity({
        "type": "Model",
        "position": FLAG_HOME_RED,
        "name": "x!!==$%CTF-FLAG%$==!!x",
        "dimensions": {
            "x": 0.16388998925685883,
            "y": 1.7259058952331543,
            "z": 0.04999999701976776
        },
        "rotation": Quat.fromVec3Degrees( {"x": 0, "y": 90, "z": 0 } ),
        "ignorePickIntersection": true,
        "grab": {
            "grabbable": true
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
    flagBlueStatus = "HOME";
    flagRedStatus = "HOME";
    gameStatus = "PLAYING";
    processTimer = 0;
    Script.update.connect(myTimer);
    audioAnnouncement("GAME_BEGIN");
}


function myTimer(deltaTime) {
    var i, holder, player;
    var today = new Date();
    var messageToSent, remainingDuration;
    
    if ((today.getTime() - processGameTimer) > gameTimerInterval ) {
        EntityViewer.queryOctree();
        var currentRedFlagPosition = Entities.getEntityProperties(flagRedID,["position"]).position;
        var currentBlueFlagPosition = Entities.getEntityProperties(flagBlueID,["position"]).position;
        if (Vec3.distance(currentRedFlagPosition, FLAG_HOME_RED) > 0.3) {
            //flag possibly taken
            if (Vec3.distance(currentRedFlagPosition, FLAG_TRAP_BLUE_SIDE) < 0.3 && flagBlueStatus === "HOME") {
                //flag getting captured
                scoreBlue = scoreBlue + 1;
                Entities.editEntity(flagRedID, {"position": FLAG_HOME_RED, "rotation": Quat.fromVec3Degrees( {"x": 0, "y": 90, "z": 0 } ), "velocity": {"x": 0, "y": 0, "z": 0 }});
                EntityViewer.queryOctree();
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
                            Entities.editEntity(flagRedID, {"position": FLAG_HOME_RED, "rotation": Quat.fromVec3Degrees( {"x": 0, "y": 90, "z": 0 } ), "velocity": {"x": 0, "y": 0, "z": 0 }});
                            EntityViewer.queryOctree();
                            flagRedStatus = "HOME";
                            audioAnnouncement("RED_FLAG_RETURNED");
                        }
                    }
                } else if (holder === "RED") {
                    //Returning the flag
                    Entities.editEntity(flagRedID, {"position": FLAG_HOME_RED, "rotation": Quat.fromVec3Degrees( {"x": 0, "y": 90, "z": 0 } ), "velocity": {"x": 0, "y": 0, "z": 0 }});
                    EntityViewer.queryOctree();
                    flagRedStatus = "HOME";
                    audioAnnouncement("RED_FLAG_RETURNED");
                } else if (holder === "BLUE") {
                    if (flagRedStatus !== "TAKEN") {
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
                Entities.editEntity(flagBlueID, {"position": FLAG_HOME_BLUE, "rotation": Quat.fromVec3Degrees( {"x": 0, "y": 90, "z": 0 } ), "velocity": {"x": 0, "y": 0, "z": 0 }});
                EntityViewer.queryOctree();
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
                            Entities.editEntity(flagBlueID, {"position": FLAG_HOME_BLUE, "rotation": Quat.fromVec3Degrees( {"x": 0, "y": 90, "z": 0 } ), "velocity": {"x": 0, "y": 0, "z": 0 }});
                            EntityViewer.queryOctree();
                            flagBlueStatus = "HOME";
                            audioAnnouncement("BLUE_FLAG_RETURNED");
                        }
                    }
                } else if (holder === "BLUE") {
                    //Returning the flag
                    Entities.editEntity(flagBlueID, {"position": FLAG_HOME_BLUE, "rotation": Quat.fromVec3Degrees( {"x": 0, "y": 90, "z": 0 } ), "velocity": {"x": 0, "y": 0, "z": 0 }});
                    EntityViewer.queryOctree();
                    flagBlueStatus = "HOME";
                    audioAnnouncement("BLUE_FLAG_RETURNED");
                } else if (holder === "RED") {
                    if (flagBlueStatus !== "TAKEN") {
                        audioAnnouncement("BLUE_FLAG_TAKEN");
                    }
                    flagBlueStatus = "TAKEN";
                }
            }
        }

        today = new Date();
        processGameTimer = today.getTime();
    }
    
    if ((today.getTime() - processTimer) > updateTimerInterval ) {

        //processing here to sent remining time
        remainingDuration = Math.floor((gameStartTime + GAME_DURATION - today.getTime()) / 1000);
        if (remainingDuration < 0) {
            //#### END OF GAME HERE #######################
            Script.update.disconnect(myTimer);
            gameStatus = "IDLE";

            if (flagBlueID !== Uuid.NULL) {
                Entities.deleteEntity(flagBlueID);
                EntityViewer.queryOctree();
                flagBlueID = Uuid.NULL;
            }
            if (flagRedID !== Uuid.NULL) {
                Entities.deleteEntity(flagRedID);
                EntityViewer.queryOctree();
                flagRedID = Uuid.NULL;
            }

            var winner; 
            if (scoreRed > scoreBlue) {
                winner = "RED HAVE WON!";
                audioAnnouncement("RED_TEAM_IS_THE_WINNER");
            } else if (scoreRed === scoreBlue) {
                winner = "EVEN GAME!";
                audioAnnouncement("EVEN_GAME");
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

function swapTeamColorAndResetDeath() {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].team === "RED") {
            players[i].team = "BLUE";
        } else {
            players[i].team = "RED";
        }
        players[i].death = 0;
    }
}

function registerADeath(avatarID) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].avatarID === avatarID) {
            players[i].death = players[i].death + 1;
            break;
        }
    }
}

function addPlayer(avatarID, team) {
    var currentTeam = isPlayerKnown(avatarID);
    if (currentTeam === "NONE") {
        var player = {"avatarID": avatarID, "team": team, "death": 0 };
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

/*
function killPlayer(avatarID, ghostNo, deathPosition) {
    var playerNo = getPlayerNoFromSessionID(avatarID);
    var message;
    if (playerNo === -1 || gameStatus === "NOT_STARTED") {
        message = {
            "action": "TELEPORT_USER",
            "avatarID": avatarID,
            "position": determineExitGameToPosition(),
            "orientation": Quat.fromVec3Degrees({"x": 0, "y": (Math.random() * 360), "z": 0})        
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));        
    } else {
        var tpPosition;
        var isGameEnded = false;
        if (life === 0) {
            players[playerNo].state = "DEAD";
            tpPosition = determineExitGameToPosition();
            if (isAllPlayerDead()) {
                endGame();
                isGameEnded = true;
            }
        } else {
            players[playerNo].state = "ALIVE";
            tpPosition = determinePlayerInitialPosition();
        }

        life = life - 1;
        if (life < 0) { 
            life = 0; 
        }
        
        if (!isGameEnded) {
            message = {
                "action": "LIFE_COUNT_UPDATE",
                "life": life      
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
        }

        message = {
            "action": "TELEPORT_USER",
            "avatarID": avatarID,
            "position": tpPosition,
            "orientation": Quat.fromVec3Degrees({"x": 0, "y": (Math.random() * 360), "z": 0})        
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));
        playSound(SOUND_AVATAR_KILLED, deathPosition, 1);
        if (!isGameEnded) {
            var properties = Entities.getEntityProperties(ghost[ghostNo].id, ["velocity", "position"]);
            var ghostVelocity = properties.velocity;
            var ghostPosition = properties.position;
            Entities.deleteEntity(ghost[ghostNo].id);       
            ghost[ghostNo].id = Entities.addEntity({
                    "name": "VOXECUTOR-" + (ghostNo + 1),
                    "description": ghostNo,
                    "type": "Model",
                    "modelURL": getHunterModel(ghostNo + 1),
                    "useOriginalPivot": true,
                    "shapeType": "box",
                    "dimensions": {"x": GRID_POINT_SIDE_SIZE, "y": GRID_POINT_SIDE_SIZE, "z": GRID_POINT_SIDE_SIZE},
                    "position": ghostPosition,
                    "grab": {
                        "grabbable": false
                    },            
                    "collisionless": true,
                    "dynamic": true,
                    "damping": 0,
                    "friction": 0,
                    "script": ROOT + "attackMode.js",
                    "velocity": ghostVelocity,
                    "lifetime": LIFE_TIME_ANTI_JUNK,
                    "billboardMode": "none",
                    "angularDamping": 0, 
                    "angularVelocity": {"x": 0, "y": 10, "z": 0},
                    "renderWithZones": visibilityZone            
                }, "domain");
        }
        ejectBones(deathPosition);
        message = {
            "action": "I_DIED",
            "avatarID": avatarID       
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));
    }
    
}

function ejectBones(position){
    for (var i = 0; i < 40; i++) {
        var ejectionBoneVelocity = {"x": (Math.random() * 10)-5, "y": (Math.random() * 10)-5, "z": (Math.random() * 10)-5};
        var angularBoneVelocity = {"x": (Math.random() * 6)-3, "y": (Math.random() * 6)-3, "z": (Math.random() * 6)-3};
        var boneScale = 0.9 + (Math.random() * 1.4);
        if (Math.random() > 0.7) {
            boneID = Entities.addEntity({
                "name": "AVATAR-BONE",
                "type": "Model",
                "modelURL": ROOT + "AVATAR_BONE.fbx",
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
                "lifetime": 20 + (Math.floor(Math.random() * 21)),
                "renderWithZones": visibilityZone
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
                "lifetime": 10 + (Math.floor(Math.random() * 8)),
                "renderWithZones": visibilityZone
            }, "domain");            
        }
    }
}
*/


function setUpEntityViewer() {
    EntityViewer.setPosition({"x": -1, "y": 1, "z": -1});
    EntityViewer.setOrientation(Quat.lookAtSimple({"x": -1, "y": 1, "z": -1}, ORIGIN_POSITION));
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
        Entities.deleteEntity(flagBlueID);
        EntityViewer.queryOctree();
        flagBlueID = Uuid.NULL;
    }
    if (flagRedID !== Uuid.NULL) {
        Entities.deleteEntity(flagRedID);
        EntityViewer.queryOctree();
        flagRedID = Uuid.NULL;
    }
    
    Messages.messageReceived.disconnect(onMessageReceived);
    Messages.unsubscribe(channelComm);
    if (gameStatus === "PLAYING") {
        Script.update.disconnect(myTimer);
    }
    AvatarList.avatarRemovedEvent.disconnect(updatePlayersList);
});

