//
//  tagApp.js
//
//  Created by Alezia Kurdis, September 23rd, 2024.
//  Copyright 2024 Overte e.V.
//
//  tag, replacement avatar and other feature app. for CTF-face.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var jsMainFileName = "tagApp.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    var channelComm = "ak.ctf.ac.communication";
    var APP_NAME = "CTF GAME";
    var APP_ICON_INACTIVE = ROOT + "tag/icon_template_inactive.png";
    var APP_ICON_ACTIVE = ROOT + "tag/icon_template_active.png";
    var appStatus = false;
    var initiated = false;
    var thisPosition;
    var thisEntityID;
    var MAX_DIST = 3000; //in meters
    var channel = "ak.client.application.tag.communication";
    
    var RED_AVARTAR_SETTING = "CTF-FACE-AK-RedAvatarUrl";
    var BLUE_AVARTAR_SETTING = "CTF-FACE-AK-BlueAvatarUrl";

    var ICON_CAPTION_COLOR = "#ffae00";
    var APP_URL = ROOT + "tag/tag.html";
    
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

    var tagID = Uuid.NULL;
    var cftRedAvatar = Settings.getValue(RED_AVARTAR_SETTING, "");
    var cftBlueAvatar = Settings.getValue(BLUE_AVARTAR_SETTING, "");
    
    var button;
    
    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID, ["position"]);
        thisPosition = properties.position;
        thisEntityID = entityID;
        
        if (Vec3.distance(thisPosition, MyAvatar.position) > MAX_DIST) {
            //Do not start
            initiated = false;
        } else {
            initiate();
        }
    }

    this.unload = function(entityID) {
        terminate();
    }

    function initiate() {
        //set
        button = tablet.addButton({
            "text": APP_NAME,
            "icon": APP_ICON_INACTIVE,
            "activeIcon": APP_ICON_ACTIVE,
            "sortOrder": 0,
            "captionColor": ICON_CAPTION_COLOR
        });
        button.clicked.connect(clicked);
        initiated = true;
        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
        tablet.screenChanged.connect(onScreenChanged);
    }

    function terminate() {
        if (tagID !== Uuid.NULL) {
            Entities.deleteEntity(tagID);
            tagID = Uuid.NULL;
        }
        
        if (initiated) {
            //shutdown app
            if (appStatus) {
                tablet.gotoHomeScreen();
                tablet.webEventReceived.disconnect(onAppWebEventReceived);
            }
            tablet.screenChanged.disconnect(onScreenChanged);
            button.clicked.disconnect(clicked);
            tablet.removeButton(button);
            Messages.messageReceived.disconnect(onMessageReceived);
            Messages.unsubscribe(channelComm);
            initiated = false;
        }
    }

    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "PLAYER_LIST") {
                if (Vec3.distance(thisPosition, MyAvatar.position) > MAX_DIST) {
                    terminate();
                } else {
                    if (!initiated) {
                        initiate();
                    }
                    manageTag(data.players);
                }
            }
        }
    }

    function manageTag(players) {
        var i;
        var team = "";
        for (i = 0; i < players.length; i++) {
            if (players[i].avatarID === MyAvatar.sessionUUID) {
                team = players[i].team;
                break;
            }
        }
        if (tagID !== Uuid.NULL) {
            Entities.deleteEntity(tagID);
            tagID = Uuid.NULL;
        }
        var height = MyAvatar.getHeight();
        switch(team) {
            case "RED":
                if (cftRedAvatar === "") {
                    tagID = Entities.addEntity({
                        "type": "Shape",
                        "shape": "Dodecahedron",
                        "name": "redTag",
                        "parentID": MyAvatar.sessionUUID,
                        "localPosition": {"x": 0.0, "y": height * 0.65, "z": 0.0},
                        "color": {"red": 200, "green": 0, "blue": 0},
                        "dimensions": {"x": 0.07, "y": 0.07, "z": 0.07}
                    }, "avatar");
                } else {
                    MyAvatar.useFullAvatarURL(cftRedAvatar);
                }
                break;
            case "BLUE":
                if (cftBlueAvatar === "") {
                    tagID = Entities.addEntity({
                        "type": "Shape",
                        "shape": "Dodecahedron",
                        "name": "redTag",
                        "parentID": MyAvatar.sessionUUID,
                        "localPosition": {"x": 0.0, "y": height * 0.65, "z": 0.0},
                        "color": {"red": 0, "green": 0, "blue": 200},
                        "dimensions": {"x": 0.07, "y": 0.07, "z": 0.07}
                    }, "avatar");
                } else {
                    MyAvatar.useFullAvatarURL(cftBlueAvatar);
                }
                break;
            case "":
                //do nothing
        } 
    }

    function onAppWebEventReceived(message) {
        var messageSent;
        if (typeof message === "string") {
            var d = new Date();
            var n = d.getTime();
            var instruction = JSON.parse(message);
            if (instruction.channel === channel) {
                if (instruction.action === "JOIN_BACK" && (n - timestamp) > INTERCALL_DELAY) { 
                    d = new Date();
                    timestamp = d.getTime();
                    //Call a function to do something here TODO
                    messageSent = {
                        "action": "JOIN",
                        "avatarID": MyAvatar.sessionUUID
                    };
                    Messages.sendMessage(channelComm, JSON.stringify(messageSent));
                } else if (instruction.action === "UI_READY") {
                    messageSent = {
                        "channel": channel,
                        "action": "TAG_APP_DATA",
                        "cftRedAvatar": Settings.getValue(RED_AVARTAR_SETTING, ""),
                        "cftBlueAvatar": Settings.getValue(BLUE_AVARTAR_SETTING, "")
                    };
                    tablet.emitScriptEvent(JSON.stringify(messageSent));
                } else if (instruction.action === "UPDATE_SETTING_RED") {
                    Settings.setValue(RED_AVARTAR_SETTING, instruction.avatarUrl);
                    cftRedAvatar = instruction.avatarUrl;
                } else if (instruction.action === "UPDATE_SETTING_BLUE") {
                    Settings.setValue(BLUE_AVARTAR_SETTING, instruction.avatarUrl);
                    cftBlueAvatar = instruction.avatarUrl;
                }
            }
        }
    }

    function onScreenChanged(type, url) {
        if (type === "Web" && url.indexOf(APP_URL) !== -1) {
            colorCaption = "#000000";
            appStatus = true;
        } else {
            colorCaption = ICON_CAPTION_COLOR;
            appStatus = false;
        }
        
        button.editProperties({
            isActive: appStatus,
            captionColor: colorCaption
        });
    }

    function clicked(){
        var colorCaption;
        if (appStatus === true) {
            tablet.webEventReceived.disconnect(onAppWebEventReceived);
            tablet.gotoHomeScreen();
            colorCaption = ICON_CAPTION_COLOR;
            appStatus = false;
        }else{
            tablet.gotoWebScreen(APP_URL);
            tablet.webEventReceived.connect(onAppWebEventReceived);
            colorCaption = "#000000";
            appStatus = true;
        }

        button.editProperties({
            "isActive": appStatus,
            "captionColor": colorCaption
        });
    }

//######################## CYCLE & COLOR #############################
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
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}
//######################## END CYCLE & COLOR #############################

})
