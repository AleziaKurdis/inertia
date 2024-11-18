"use strict";
/*jslint vars: true, plusplus: true*/
/*global Agent, Avatar, Script, Entities, Vec3, Quat, print*/
//
//  aCAgentTest-1.js
//
//  Created by Alezia Kurdis on November 17th, 2024
//  Copyright 2015 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// An assignment client script that animates one avatar at random location within 'spread' meters of 'origin'.
// In Domain Server Settings, go to scripts and give the url of this script. Press '+', and then 'Save and restart'.

var ROOT = Script.resolvePath('').split("aCAgentTest-1.js")[0];
var origin = {x: -11, y: 1.1, z: -6};
var spread = 20; // meters
var turnSpread = 90.0; // How many degrees should turn from front range over.
var animationData = {
    "url": ROOT + "animations/walk_fwd.fbx", 
    "lastFrame": 35
};

var models = [ 
    {"url": "http://metaverse.bashora.com/avatars/ALEZIA/avatar.fst?dna=AE_AA_AA_AB_AG_AA_AA", "displayName": "Nebula"}
];

var chosenAvatar = Math.round(Math.random() * (models.length - 1));
Avatar.skeletonModelURL = models[chosenAvatar].url;
Avatar.displayName = models[chosenAvatar].displayName;

var millisecondsToWaitBeforeStarting = 10 * 1000; // To give the various servers a chance to start.

Agent.isAvatar = true;
function coord() { return (Math.random() * spread) - (spread / 2); }  // randomly distribute a coordinate zero += spread/2.
Script.setTimeout(function () {
    Avatar.position = Vec3.sum(origin, {x: coord(), y: 0, z: coord()});
    Avatar.orientation = Quat.fromVec3Degrees({"x": 0.0, "y": turnSpread * (Math.random() - 0.5),"z": 0.0});
    print("Starting at", JSON.stringify(Avatar.position));
    Avatar.startAnimation(animationData.url, animationData.fps || 30, 1, true, false, animationData.firstFrame || 0, animationData.lastFrame);
}, millisecondsToWaitBeforeStarting);
