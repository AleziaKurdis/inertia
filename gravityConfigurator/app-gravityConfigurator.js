//
//  app-gravityConfigurator.js
//
//  Created by Alezia Kurdis, October 1st, 2024.
//  Copyright 2024 Overte e.V.
//
//  Application to configure the Gravity on a place temporarily or persitently.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var jsMainFileName = "app-gravityConfigurator.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    
    var APP_NAME = "GRAVITY";
    var APP_URL = ROOT + "gravityConfigurator.html";
    var APP_ICON_INACTIVE = ROOT + "icon_gravityConf_inactive_white.png";
    var ICON_CAPTION_COLOR = "#FFFFFF";
    if (ROOT.substr(0, 4) !== "http") {
        APP_ICON_INACTIVE = ROOT + "icon_gravityConf_inactive_green.png";
        ICON_CAPTION_COLOR = "#00FF00";
    }
    var APP_ICON_ACTIVE = ROOT + "icon_gravityConf_active.png";

    var appStatus = false;
    var channel = "overte.application.more.gravityConfigurator";
    var timestamp = 0;
    var INTERCALL_DELAY = 200; //0.3 sec
    
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

    tablet.screenChanged.connect(onScreenChanged);

    var gravityID = Uuid.NULL;
    var originalGravity = MyAvatar.getGravity();
    var currentGravity;
    


    var button = tablet.addButton({
        text: APP_NAME,
        icon: APP_ICON_INACTIVE,
        activeIcon: APP_ICON_ACTIVE,
        captionColor: ICON_CAPTION_COLOR
    });


    function clicked(){
        var colorCaption;
        if (appStatus === true) {
            tablet.webEventReceived.disconnect(onAppWebEventReceived);
            tablet.gotoHomeScreen();
            colorCaption = ICON_CAPTION_COLOR;
            appStatus = false;
        }else{
            //Launching the Application UI.
            tablet.gotoWebScreen(APP_URL);
            tablet.webEventReceived.connect(onAppWebEventReceived);
            colorCaption = "#000000";
            appStatus = true;
        }

        button.editProperties({
            isActive: appStatus,
            captionColor: colorCaption
        });
    }

    button.clicked.connect(clicked);

    //This recieved the message from the UI(html) for a specific actions
    function onAppWebEventReceived(message) {
        if (typeof message === "string") {
            var d = new Date();
            var n = d.getTime();
            var instruction = JSON.parse(message);
            if (instruction.channel === channel) {
                if (instruction.action === "INSTALL_GRAVITY" && (n - timestamp) > INTERCALL_DELAY) { 
                    d = new Date();
                    timestamp = d.getTime();
                    if (instruction.entityHostType === "local") {
                        currentGravity = -9.8 * (instruction.gravity/100);
                        MyAvatar.setGravity(currentGravity);
                        sendMessageToUser('<font style="color:#00ff00;">Gravity configured for you only.</font>');
                    } else {
                        var genUserData = {
                            "gravity": -9.8 * (instruction.gravity/100),
                            "radius": instruction.radius
                        };
                        
                        if (instruction.entityHostType = "avatar") {
                            if (Entities.canRezAvatarEntities) {
                                if (gravityID !== Uuid.NULL) {
                                    Entities.deleteEntity(gravityID);
                                    gravityID = Uuid.NULL;
                                }
                                gravityID = Entities.addEntity({
                                    "type": "Shape",
                                    "shape": "Cube",
                                    "name": "Gravity Modifier",
                                    "dimensions": {"x": 0.5, "y":0.5, "z": 0.5},
                                    "visible": false,
                                    "localPosition": {"x": 0.0, "y":0.0, "z": 0.0},
                                    "parentID": MyAvatar.sessionUUID,
                                    "script": ROOT + "gravitySetter.js",
                                    "userData": JSON.stringify(genUserData),
                                    "lifetime": 7200,
                                    "collisionless": true,
                                    "grab": {
                                        "grabbable": false
                                    }
                                }, "avatar");
                                //response
                                sendMessageToUser('<font style="color:#00ff00;">Temporary gravity configured.</font>');
                            } else {
                                //response No Perm
                                sendMessageToUser('<font style="color:#ff0000;">No permission to rez avatar entities on this domain.</font>');
                            }
                            
                        } else {
                            if (Entities.canRez) {
                                var id = Entities.addEntity({
                                    "type": "Shape",
                                    "shape": "Cube",
                                    "name": "Gravity Modifier",
                                    "dimensions": {"x": 0.5, "y":0.5, "z": 0.5},
                                    "visible": false,
                                    "position": Vec3.sum(MyAvatar.position, {"x": 0.0, "y":0.0, "z": 2.0}),
                                    "script": ROOT + "gravitySetter.js",
                                    "userData": JSON.stringify(genUserData),
                                    "collisionless": true,
                                    "grab": {
                                        "grabbable": false
                                    }, 
                                    "locked": true
                                }, "domain");
                                //response
                                sendMessageToUser('<font style="color:#00ff00;">Persistent gravity configured.</font>');
                            } else {
                                //response No Perm
                                sendMessageToUser('<font style="color:#ff0000;">No permission to rez entities on this domain.</font>');
                            }
                        }
                    }

                } else if (instruction.action === "SELF_UNINSTALL" && (n - timestamp) > INTERCALL_DELAY) {
                    d = new Date();
                    timestamp = d.getTime();
                    ScriptDiscoveryService.stopScript(Script.resolvePath(''), false);
                }
            }
        }
    }

    function sendMessageToUser(theText) {
        var messageSent = {
            "channel": channel,
            "action": "MESSAGE_TO_USER",
            "message": theText
        };

        tablet.emitScriptEvent(JSON.stringify(messageSent));
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

    function cleanup() {
        if (gravityID !== Uuid.NULL) {
            Entities.deleteEntity(gravityID);
            gravityID = Uuid.NULL;
        }
        if (appStatus) {
            tablet.gotoHomeScreen();
            tablet.webEventReceived.disconnect(onAppWebEventReceived);
        }

        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.removeButton(button);
        MyAvatar.setGravity(originalGravity);
    }

    Script.scriptEnding.connect(cleanup);
}());
