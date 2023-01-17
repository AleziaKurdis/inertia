"use strict";
//
//  hytrionClock.js
//
//  Created by Alezia Kurdis, January 14th 2023.
//  Copyright 2023, Overte e.V.
//
//  Display a Configurable HUT (D19) clock. (Day duration = 19h)
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
<?php
header('Content-type: text/javascript');

if ((isset($_GET["mode24"])) && (!empty($_GET["mode24"]))){

    $mode24 = $_GET["mode24"];

}else{

    $mode24 = "true";

}

if ($mode24 != "true" && $mode24 != "false"){ 
    $mode24 = "true"; 
}


if ((isset($_GET["effect"])) && (!empty($_GET["effect"]))){

    $effect = $_GET["effect"];

}else{

    $effect = "none";
}

if ($effect != "outline" && $effect != "none"){ 
    $effect = "none"; 
}

/* ################### display parameter #####################################

0- Time only (ex: "5:54 AM" or "22:45")
1- Date only (ex: Virsunday, November 27, 65)
2- Date and Time (ex: "Virsunday, November 27, 65 | 3h34 AM")
3- Day and Time (ex: "Virsunday 3:43 PM" or "Virsunday 15:33")
4- Small Date only (ex: "November 23, 65" )
5- Greeting (ex: "Good morning")

########################################################################### */



if ((isset($_GET["display"])) && (!empty($_GET["display"]))){

    $display = $_GET["display"];

}else{

    $display = "0";
}

if ($display != "0" && $display != "1" && $display != "2" && $display != "3" && $display != "4" && $display != "5"){ 
    $display = "0"; 
}


if ((isset($_GET["upper"])) && (!empty($_GET["upper"]))){

    $upper = $_GET["upper"];

}else{

    $upper = "false";
}

if ($upper != "true" && $upper != "false"){ 
    $upper = "false"; 
}



?>(function(){ 

    function findGetParameter(parameterName) {
        var address = Script.resolvePath("");
        var result = null,
            tmp = [];
        var items = address.search.substr(1).split("&");
        for (var index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        }
        return result;
    }

    var DISPLAY_FORMAT = parseInt(findGetParameter("display"),10);
    if(DISPLAY_FORMAT === null) {
        DISPLAY_FORMAT = 0;
    }

    /* ################### display parameter #####################################

    0- Time only (ex: "5:54 AM" or "22:45")
    1- Date only (ex: Virsunday, November 27, 65)
    2- Date and Time (ex: "Virsunday, November 27, 65 | 3h34 AM")
    3- Day and Time (ex: "Virsunday 3:43 PM" or "Virsunday 15:33")
    4- Small Date only (ex: "November 23, 65" )
    5- Greeting (ex: "Good morning")

    ########################################################################### */


    var DISPLAY_IN_UPPERCASE = false;
    var parameter = findGetParameter("upper");
    if(parameter === "true") {
        DISPLAY_IN_UPPERCASE = true;
    }    

    var EFFECT = findGetParameter("effect");
    if(EFFECT === null || (EFFECT !== "none" && EFFECT !== "outline")) {
        EFFECT = "none";
    }

    /* ################### effect parameter #####################################
    none | outline
    ########################################################################### */
    
    var TIME_24H = true; // set false for 12h AM/PM, Since 2022, the Official DXX time is 24h.
    
    var DAY_DURATION = 68400; //19h
    var WEEK_DURATION = 615600; //9 days of 19h
    var YEAR_DURATION = 3600 * 19 * 36 * 10; //10 months of 36 days de 19h
    var MONTH_DURATION = 3600 * 19 * 36; //36 days de 19h
    
    var weekDaysNames = [
        "Virmonday",
        "Virtuesday",
        "Virwednesday",
        "Virthursday",
        "Virfriday",
        "Friturday",
        "Virsaturday",
        "Sameday",
        "Virsunday"
    ];

    var monthsNames = [
        "Primum",
        "Secundum",
        "Tertium",
        "Quartum",
        "Quintilis",
        "Sextilis",
        "September",
        "October",
        "November",
        "December"
    ];    
    

    var textEntityID = Uuid.NULL;
    var UPDATE_TIMER_INTERVAL = 45000; //each 45 sec timer
    var processTimer = 0;
    var clockPosition;
    var thisID;
    
    this.preload = function(entityID) {
        //Generate the Clock text local entity.
        thisID = entityID;
        initiate();
    };


    this.unload = function(entityID) {
		//Delete the clock text entity
        shutdown();
        
    };    

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            //print("Galaxy: ITERATION CHECKING!");
        
            updateClock();
            
            today = new Date();
            processTimer = today.getTime();
        }  
    }


    function shutdown() {
        if (textEntityID != Uuid.NULL){

            
            //End Loop
            Script.update.disconnect(myTimer);
        
            //Delete text Clock entity
            Entities.deleteEntity(textEntityID);
            textEntityID = Uuid.NULL;
         
        }
    }

    function initiate() {

        var properties = Entities.getEntityProperties(thisID);


        //Create Clock Text entity
        var nova = {
            "type": "Text",
            "name": "HYTRION CLOCK",
            "dimensions": properties.dimensions,
            "position": properties.position,
            "rotation": properties.rotation,
            "grab": {
                "grabbable": false
            },
            "text": "",
            "renderWithZones": properties.renderWithZones,
            "lineHeight": properties.dimensions.y * 0.85,
            "textColor": properties.color,
            "backgroundAlpha": 0,
            "unlit": true,
            "textEffect": EFFECT,
            "textEffectColor": properties.color,
            "textEffectThickness": 0.4
        };
        
        textEntityID = Entities.addEntity(nova, "local");          

        updateClock();

		var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer);        
    }
    
    function updateClock() {
        if (textEntityID != Uuid.NULL){
            
            //TEXT
            var timeInfo = getHourFromSec((GetCurrentCycleValue(8640000, DAY_DURATION)/100), TIME_24H);
            var curDayOfWeek = weekDaysNames[Math.floor(GetCurrentCycleValue(9, WEEK_DURATION))];
            
            var today = new Date();
            var secSince1970 = today.getTime()/1000;
            
            var curYear = Math.ceil(secSince1970 / YEAR_DURATION);
            
            var curMonth = monthsNames[Math.floor(GetCurrentCycleValue(10, YEAR_DURATION))];
            
            var curDayOfMonth = 1 + Math.floor(GetCurrentCycleValue(36, MONTH_DURATION));
            
            var greeting = "Good night";
            var mathematicalHour = (GetCurrentCycleValue(8640000, DAY_DURATION)/100)/3600;
            if (mathematicalHour < 22.0){
                greeting = "Good evening";
                if (mathematicalHour < 17.0) {
                    greeting = "Good afternoon";
                    if (mathematicalHour < 12.0) {
                        greeting = "Good morning";
                        if (mathematicalHour < 5.0) {
                            greeting = "Good night";
                        }
                    }
                }
            }
            
            var displayText = "";
            switch(DISPLAY_FORMAT) {
                case 0:
                    displayText = timeInfo;
                    break;
                case 1:
                    displayText = curDayOfWeek + ", " + curMonth + " " + curDayOfMonth + ", " + curYear;
                    break;
                case 2:
                    displayText = curDayOfWeek + ", " + curMonth + " " + curDayOfMonth + ", " + curYear + " | " + timeInfo;
                    break;
                case 3:
                    displayText = curDayOfWeek + " " + timeInfo;
                    break;
                case 4:
                    displayText = curMonth + " " + curDayOfMonth + ", " + curYear;
                    break;   
                case 5:
                    displayText = greeting;
                    break;
                default:
                    displayText = "";
            }

            if (DISPLAY_IN_UPPERCASE) {
                displayText = displayText.toUpperCase();
            }
            
            //UPDATE
            
            var properties = Entities.getEntityProperties(thisID);

            //Create Clock Text entity
            var propertiesToChanges = {
                "type": "Text",
                "name": "HYTRION CLOCK",
                "dimensions": properties.dimensions,
                "position": properties.position,
                "rotation": properties.rotation,
                "grab": {
                    "grabbable": false
                },
                "text": displayText,
                "renderWithZones": properties.renderWithZones,
                "lineHeight": properties.dimensions.y * 0.85,
                "textColor": properties.color,
                "backgroundAlpha": 0,
                "unlit": true,
                "textEffect": EFFECT,
                "textEffectColor": properties.color,
                "textEffectThickness": 0.4
            };
        
            var test = Entities.editEntity(textEntityID, propertiesToChanges);            
        }
    } 

 

	/*
	* Return the current position in a cycle 
	* for specific time length
	*
    * @param   {number integer}  cyclelength       a cycle goes from 0 to cyclelength
	* @param   {number integer}  cycleduration     duration of a cycle in seconds.
    * @return  {number double}           		current position in the cycle (double)
	*/
    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}

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

    //#####################################
    function getHourFromSec(daysec, is24h){
        var hours = Math.floor(daysec/3600);
        var minutes = Math.floor(daysec/60) - (hours * 60);
        var ampm = hours >= 12 ? 'PM' : 'AM';
        var hoursTwelve = hours % 12;
        hoursTwelve = hoursTwelve ? hoursTwelve : 12; // the hour '0' should be '12'
        
        var minuteZeroized = minutes <= 9 ? '0' + minutes : '' + minutes;
        
        if (is24h == true) {
            return hours + ":" + minuteZeroized;
        }else{
            return hoursTwelve + ":" + minuteZeroized + " " + ampm
        }
    }
    
})
