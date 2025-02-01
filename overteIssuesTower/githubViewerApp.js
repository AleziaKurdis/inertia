//
//  githubViewerApp.js
//
//  Created by Alezia Kurdis, January 31st, 2025.
//  Copyright 2025 Overte e.V.
//
//  App that open a github window for the current issues.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var jsMainFileName = "githubViewerApp.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
        
    var APP_NAME = "GITHUB";
    var APP_ICON_INACTIVE = ROOT + "icons/icon_template_inactive.png";
    var APP_ICON_ACTIVE = ROOT + "icons/icon_template_active.png";
    var appStatus = false;
    var ICON_CAPTION_COLOR = "#ffae00";
    
    var UPDATE_TIMER_INTERVAL = 1000;
    var processTimer = 0;
    var thisPosition;
    var thisEntityID;
    var currentBugNo = -1;
    
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

    var button = tablet.addButton({
        "text": APP_NAME,
        "icon": APP_ICON_INACTIVE,
        "activeIcon": APP_ICON_ACTIVE,
        "sortOrder": 0,
        "captionColor": ICON_CAPTION_COLOR
    });

    
    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID, ["position"]);
        thisPosition = properties.position;
        thisEntityID = entityID;
        
        if (Vec3.distance(thisPosition, MyAvatar.position) > 2500) {
             Script.stop();
        }

    }

    function showIssueWindow() {
        Script.update.connect(myTimer);
        //DrawWindow
    }

    function removeIssueWindow() {
        //Clear here
        Script.update.disconnect(myTimer);
    }

    function updateIssueWindow() {
        //currentBugNo
        var entityIDs = Entities.findEntitiesByType("Model", MyAvatar.position, 5);
        print("Number of Model entities within 5m: " + entityIDs.length);
    }

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            
            updateIssueWindow();
            
            today = new Date();
            processTimer = today.getTime();
        }  
    }

    this.unload = function(entityID) {
        removeIssueWindow();
    }

    function clicked(){
        var colorCaption;
        if (appStatus === true) {
            removeIssueWindow();
            colorCaption = ICON_CAPTION_COLOR;
            appStatus = false;
        }else{
            showIssueWindow();
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


    button.clicked.connect(clicked);

    function cleanup() {
        tablet.removeButton(button);
    }

    Script.scriptEnding.connect(cleanup);
})
