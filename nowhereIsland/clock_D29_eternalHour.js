"use strict";
//
//  clock_D29_eternalHour.js
//
//  Created by Alezia Kurdis, May 6th, 2022.
//  Copyright 2022 Alezia Kurdis.
//
//  Generate a D29 Clock that loop infinitely from 13h40 to 14h39.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    /* how to use:
    
    Set such json in the userData property of a box entity:
            {
                "time24h": true,
                "uppercase": true,
                "outlineText": false
            }

    Have this script in the "script" property


    */

    var textEntityID = Uuid.NULL;
    var UPDATE_TIMER_INTERVAL = 70000; //each 70 sec timer
    var processTimer = 0;
    var clockPosition;
    var thisID;
    
    this.preload = function(entityID) {
        thisID = entityID;
        updateClock();
		var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer);        
    };


    this.unload = function(entityID) {
        Script.update.disconnect(myTimer);

        if (textEntityID !== Uuid.NULL) {
            Entities.deleteEntity(textEntityID);
            textEntityID = Uuid.NULL;
        }
    };    

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            updateClock();
            today = new Date();
            processTimer = today.getTime();
        }  
    }


    
    function updateClock() {
        var properties = Entities.getEntityProperties(thisID);
        var userData;
        if (properties.userData === "") {
            userData = {
                "time24h": true,
                "uppercase": true,
                "outlineText": false
            };
        } else {
            userData = JSON.parse(properties.userData);
        }
        
        var effect = "none";
        if (userData.outlineText) {
            effect = "outline";
        }

        var displayText = getClockText(userData.time24h, userData.uppercase);
        
        var clockData = {
            "type": "Text",
            "name": "D29 CLOCK ETERNAL HOUR",
            "parentID": thisID,
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
            "textEffect": effect,
            "textEffectColor": properties.color,
            "textEffectThickness": 0.4
        };        
        
        
        if (textEntityID === Uuid.NULL){
            textEntityID = Entities.addEntity(clockData, "local");             
        } else {
            Entities.editEntity(textEntityID, clockData);            
        }
    } 

    

    //##########################################################
    //Dilatation 29h Time System (D29) Functions
    //##########################################################
    
    function getClockText(time24h, forceToUppercase) {
        var displayFormat = 0;
        //time24h: true for 24h mode or set false for 12h AM/PM
        //forceToUppercase: true display in uppercase
 
        
        var DAY_DURATION = 104400; //29h
        var WEEK_DURATION = DAY_DURATION * 9;
        var MONTH_DURATION = WEEK_DURATION * 4;
        var YEAR_DURATION = MONTH_DURATION * 10;
        
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

        
        //TEXT
        //var timeInfo = getHourFromSec(52200 + (GetCurrentCycleValue(360000, (DAY_DURATION/24))/100), time24h);
        var timeInfo = getHourFromSec(49200 + (GetCurrentCycleValue(360000, (DAY_DURATION/24))/100), time24h);
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
        switch(displayFormat) {
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
            case 6:
                displayText = timeInfo + "\n" + curDayOfWeek + "\n" + curMonth + " " + curDayOfMonth + ", " + curYear;
                break;                
            default:
                displayText = "";
        }

        if (forceToUppercase) {
            displayText = displayText.toUpperCase();
        }
        
        return displayText; 

    } 

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

    // ################## CYLCE AND TIME FUNCTIONS ###########################
    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}   

})
