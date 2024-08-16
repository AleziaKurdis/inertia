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

var updateTimerInterval = 4000; //4sec.
var processTimer = 0;

var players = [];



function onMessageReceived(channel, message, sender, localOnly) {
    var message;
    if (channel === channelComm) {
        var data = JSON.parse(message);
        if (data.action === "GET_PLAYER_LIST") { 
            message = {
                "action": "PLAYER_LIST",
                "players": players,
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
            
        } else if (data.action === "SET_PLAYER_TEAM") {
            addPlayer(data.avatarID, data.team);
            message = {
                "action": "PLAYER_LIST",
                "players": players,
            };
            Messages.sendMessage(channelComm, JSON.stringify(message));
        }
    }
}

function addPlayer(avatarID, team) {
    var currentTeam = isPlayerKnown(avatarID);
    if (currentTeam === "NONE") {
        var player = {"avatarID": avatarID, "team": team };
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

function myTimer(deltaTime) {
    var today = new Date();
    
    if ((today.getTime() - processTimer) > updateTimerInterval ) {

        //processing here
        updatePlayersList();

        today = new Date();
        processTimer = today.getTime();
    }
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

Messages.subscribe(channelComm);
Messages.messageReceived.connect(onMessageReceived);

var SOUND_AVATAR_KILLED = SoundCache.getSound(ROOT + "sounds/avatarKilled.wav");


Script.scriptEnding.connect(function () {
    Messages.messageReceived.disconnect(onMessageReceived);
    Messages.unsubscribe(channelComm);
    Script.update.disconnect(myTimer);
});

