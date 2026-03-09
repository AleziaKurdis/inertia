//
//  passport_app.js
//
//  Created by Alezia Kurdis, March 8th 2026.
//  Copyright 2026 Overte e.V.
//
//  passport application for the Virtual Route.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var jsMainFileName = "passport_app.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    
    var APP_NAME = "PASSPORT";
    var APP_URL = ROOT + "application/passport.html";
    var APP_ICON_INACTIVE = ROOT + "application/icon_orange.svg";
    var APP_ICON_ACTIVE = ROOT + "application/icon_black.svg";
    var appStatus = false;
    var ICON_CAPTION_COLOR = "#ffae00";
    var button;
    var isRunning = false;
    
    var thisPosition;
    var processTimer = 0;
    var UPDATE_TIMER_INTERVAL = 5000;
    
    var channel = "virtualRoute.application.ak.passport";
    var timestamp = 0;
    var INTERCALL_DELAY = 200; //0.3 sec
    
    const PASSPORT_SETTING = "virtualRouteAKpassport";
    const PASSPORT_SORT_SETTING = "virtualRouteAKpassportSort";
    
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    
    const virtualRoute = Script.require(ROOT + "../virtualRoute.json");
    
    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID, ["position"]);
        thisPosition = properties.position;
        
        var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer); 
    }

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {

            if (Vec3.distance(MyAvatar.position, thisPosition) > 10000) {
                if (isRunning) {
                    tablet.screenChanged.disconnect(onScreenChanged);
                    tablet.removeButton(button);
                    isRunning = false;
                }
            } else {
                if (!isRunning) {
                    tablet.screenChanged.connect(onScreenChanged);

                    button = tablet.addButton({
                        "text": APP_NAME,
                        "icon": APP_ICON_INACTIVE,
                        "activeIcon": APP_ICON_ACTIVE,
                        "sortOrder": 0,
                        "captionColor": ICON_CAPTION_COLOR
                    });
                    isRunning = true;
                    
                    button.clicked.connect(clicked);
                }
            }
            
            today = new Date();
            processTimer = today.getTime();
        }  
    } 

    function onAppWebEventReceived(message) {
        if (typeof message === "string") {
            var d = new Date();
            var n = d.getTime();
            var instruction = JSON.parse(message);
            if (instruction.channel === channel) {
                if (instruction.action === "SET_SORT" && (n - timestamp) > INTERCALL_DELAY) {
                    d = new Date();
                    timestamp = d.getTime();
                    Settings.setValue(PASSPORT_SORT_SETTING, instruction.sorting);
                } else if (instruction.action === "UI_READY") {
                    
                    var payload = {
                        "virtualRoute": virtualRoute,
                        "list": Settings.getValue(PASSPORT_SETTING, []),
                        "sort": Settings.getValue(PASSPORT_SORT_SETTING, "OMEGA"),
                    };
                    
                    var messageToSent = {
                        "channel": channel,
                        "action": "PASSPORT_DATA",
                        "data": payload
                    };
                    tablet.emitScriptEvent(JSON.stringify(messageToSent));
                }
            }
        }
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
        if (appStatus) {
            tablet.gotoHomeScreen();
            tablet.webEventReceived.disconnect(onAppWebEventReceived);
        }
        if (isRunning) {
            tablet.screenChanged.disconnect(onScreenChanged);
            tablet.removeButton(button);
            isRunning = false;
        }
        Script.update.disconnect(myTimer);
    }

    Script.scriptEnding.connect(cleanup);
})
