//
//  d29_library.js
//
//  Created by Alezia Kurdis on May 11th, 2022.
//  Copyright 2023, Overte e.V.
//
//  D29 (Dilatation 29 Hours Time) library.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

//##########################################################
//Time (D29) notation system Functions
//##########################################################
function getDayLenghtInSec() {
    return 104400;
}

function getOfficialColor() {
    return {"red": 255, "green": 255, "blue": 255};
}

function getOfficialUnit() {
    return "D29";
}

function getClockText(displayFormat, time24h, forceUppercase) {

    //time24h: true for 24h mode or set false for 12h AM/PM
    //forceUppercase: true display in uppercase
    //displayFormat: 0 - Time only | 1- Date only | 2- Date and Time | 3- Day and Time | 4- Small Date only | 5- Greeting | 6- | 7- Day only

    
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
    var timeInfo = getHourFromSec((GetCurrentCycleValue(8640000, DAY_DURATION)/100), time24h);
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
        case 7: 
            displayText = curDayOfWeek;
            break;
        default:
            displayText = "";
    }

    if (forceUppercase) {
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

//##########################################################

// ################## CYLCE AND TIME FUNCTIONS ###########################
function GetCurrentCycleValue(cyclelength, cycleduration){
    var today = new Date();
    var TodaySec = today.getTime()/1000;
    var CurrentSec = TodaySec%cycleduration;
    
    return (CurrentSec/cycleduration)*cyclelength;
    
}    
// ################## END CYLCE AND TIME FUNCTIONS ########################### 

exports.getClockText = getClockText;
exports.GetCurrentCycleValue = GetCurrentCycleValue;
