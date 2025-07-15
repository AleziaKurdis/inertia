//
//  astrobion.js
//
//  Created by Alezia Kurdis, July 14th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Generate a the ASTROBION components.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("astrobion.js")[0];
    var thisEntity;

    var channelComm = "ak.serverTimeService.overte";
    var deltaWithServerTime = 0;
    
    var generatorPosition;
    var renderWithZones;
    
    var matId = Uuid.NONE;
    var lightTableID = Uuid.NONE;
    
    var D29_DAY_DURATION = 104400; //sec
    var DEGREES_TO_RADIANS = Math.PI / 180.0;

    var entitiesToDelete = [];

    function onMessageReceived(channel, message, sender, localOnly) {
        var messageToSent;
        var i;
        var displayText = "";
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "SERVER_TIME") {
                var today = new Date();
                deltaWithServerTime = today.getTime() - data.time;
            }
        }
    }

    this.preload = function(entityID) { 
        thisEntity = entityID;
        
        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
        
        var messageToSend = {
            "action": "GET_SERVER_TIME"
        };
        Messages.sendMessage(channelComm, JSON.stringify(messageToSend));
        
        var prop = Entities.getEntityProperties(entityID, ["renderWithZones", "position"]);
        renderWithZones = prop.renderWithZones;
        generatorPosition = prop.position;
        
        //CORTEX####################################################
        var rotation = Quat.fromVec3Degrees( {
            "x": - GetCurrentCycleValue(360, 1500),
            "y": GetCurrentCycleValue(360, 300),
            "z": - GetCurrentCycleValue(360, 900)
        } );
        
        var id = Entities.addEntity({
            "type": "Model",
            "position": generatorPosition,
            "name": "CORTEX",
            "dimensions": {
                "x": 1034.142578125,
                "y": 1056.9639892578125,
                "z": 1011.7808837890625
            },
            "rotation": rotation,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularVelocity": {
                "x": -0.24 * (Math.PI / 180),
                "y": 1.2 * (Math.PI / 180),
                "z": -0.4 * (Math.PI / 180)
            },
            "damping": 0,
            "angularDamping": 0,
            "modelURL": ROOT + "models/CORTEX.fst",
            "useOriginalPivot": true,
            "lifetime": 864000
        }, "local");
        entitiesToDelete.push(id);
        
        //BRAINSTORMER #####################################
        rotation = Quat.fromVec3Degrees( {
            "x": GetCurrentCycleValue(360, 800),
            "y": GetCurrentCycleValue(360, 1200),
            "z": GetCurrentCycleValue(360, 360)
        } );
        
        id = Entities.addEntity({
            "type": "Model",
            "position": generatorPosition,
            "name": "BRAINSTORMER",
            "dimensions": {
                "x": 1570.51318359375,
                "y": 1656.6041259765625,
                "z": 1178.34814453125
            },
            "rotation": rotation,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularVelocity": {
                "x": 0.45 * (Math.PI / 180),
                "y": 0.3 * (Math.PI / 180),
                "z": 1 * (Math.PI / 180)
            },
            "damping": 0,
            "angularDamping": 0,
            "modelURL": ROOT + "models/BRAINSTORMER.fst",
            "useOriginalPivot": true,
            "lifetime": 864000
        }, "local");
        entitiesToDelete.push(id);
    }


    this.unload = function(entityID) {
        var i;
        for (i = 0; i < entitiesToDelete.length; i++ ) {
            Entities.deleteEntity(entitiesToDelete[i]);
        }
        entitiesToDelete = [];

        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelComm);

    };

    /*
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {Array}           The RGB representation
     */
    function hslToRgb(h, s, l){
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = (today.getTime()- deltaWithServerTime)/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}

})
