//
//  skyManagerD7.js
//
//  Created by Alezia Kurdis on January 15th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Manage Atmospheric event, day night cycle. (D7)
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var jsMainFileName = "skyManagerD7.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    
    var isInitiated = false;
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    var HALF = 0.5;

    var UPDATE_TIMER_INTERVAL = 4000; // 4 sec 
    var processTimer = 0;

    var renderWithZones = [];
    
    var hasAlreadyShutdown = false;
    
    var thisEntity;
    var skyID = Uuid.NULL;
    var universeCenter;
    var universeDimensions;
    
    var dayDurationInSec = 25200; //7 days

    this.preload = function(entityID) {
        thisEntity = entityID;
        if (!isInitiated){
            if (positionIsInsideEntityBounds(entityID, MyAvatar.position)) {
                initiate(thisEntity);
            }
        }  
        
    };

    this.enterEntity = function(entityID) {
        thisEntity = entityID;
        if (!isInitiated){
            initiate(thisEntity);
        }
    };

    this.leaveEntity = function(entityID) {
        shutdown();
    };

    this.unload = function(entityID) {
        shutdown();
    };

    function initiate(EntID) {
        
        var properties = Entities.getEntityProperties(EntID, ["position", "dimensions", "renderWithZones"]);
        universeCenter = properties.position;
        universeDimensions = properties.dimensions;
        renderWithZones = properties.renderWithZones;

        isInitiated = true; 
        hasAlreadyShutdown = false;

        var today = new Date();
        processTimer = today.getTime();
        
        manageSky();
        
        Script.update.connect(myTimer);
    }

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            manageSky();
            
            today = new Date();
            processTimer = today.getTime();
        }
    }

    function shutdown() {
        if (!hasAlreadyShutdown) {
            hasAlreadyShutdown = true;
            if (isInitiated){            
                Script.update.disconnect(myTimer);
                isInitiated = false;
            }
            if (skyID !== Uuid.NULL) {
                Entities.deleteEntity(skyID);
                skyID = Uuid.NULL;
            }
        }
    }

    function create2DArray(rows) {
        var arr = [];
        for (var i=0;i<rows;i++) {
            arr[i] = [];
        }
        return arr;
    }

    function manageSky(){
        var skyproperty = [];

        //current rotation
		var curRotAngle = 360.0 - GetCurrentCycleValue(360.0, dayDurationInSec);
		var curAngle = {"x": 0.0, "y": curRotAngle, "z": 0.0};
        var curRotation = Quat.fromVec3Degrees(curAngle);

        //current sky index
        var sky = create2DArray(24);
        sky[0][0] = 1; //*night 21h to 3h
        sky[1][0] = 2; //*morning 3h to 9h
        sky[2][0] = 10; //*day 9h to 15h
        sky[3][0] = 12; //*evening 15h to 21h

        sky[0][1] = 1; //*night 21h to 3h
        sky[1][1] = 6; //*morning 3h to 9h
        sky[2][1] = 17; //*day 9h to 15h
        sky[3][1] = 5; //*evening 15h to 21h

        sky[0][2] = 1; //*night 21h to 3h
        sky[1][2] = 13; //*morning 3h to 9h
        sky[2][2] = 7; //*day 9h to 15h
        sky[3][2] = 12; //*evening 15h to 21h

        sky[0][3] = 1; //*night 21h to 3h
        sky[1][3] = 0; //*morning 3h to 9h
        sky[2][3] = 3; //*day 9h to 15h
        sky[3][3] = 9; //*evening 15h to 21h

        sky[0][4] = 1; //*night 21h to 3h
        sky[1][4] = 2; //*morning 3h to 9h
        sky[2][4] = 10; //*day 9h to 15h
        sky[3][4] = 5; //*evening 15h to 21h

        sky[0][5] = 1; //*night 21h to 3h
        sky[1][5] = 15; //*morning 3h to 9h
        sky[2][5] = 3; //*day 9h to 15h
        sky[3][5] = 9; //*evening 15h to 21h
    
        let periodOfDay;
        let hour = GetCurrentCycleValue(24, dayDurationInSec);
        let dayOfCylce = Math.floor(GetCurrentCycleValue(6, dayDurationInSec * 6));
        let transiFog = 0.0;
        const fogDuration = 0.2; //hours (12 minutes)
        if (hour >= 21.0 || hour < 3.0) {
            periodOfDay = 0; //night
            if (Math.abs(hour - 21.0) < fogDuration) {
                transiFog = 1 - (Math.abs(hour - 21.0)/fogDuration);
            }
            if (Math.abs(hour - 3.0) < fogDuration) {
                transiFog = 1 - (Math.abs(hour - 3.0)/fogDuration);
            }
        } else if (hour >= 3.0 && hour < 9.0) {
            periodOfDay = 1; //morning
            if (Math.abs(hour - 3.0) < fogDuration) {
                transiFog = 1 - (Math.abs(hour - 3.0)/fogDuration);
            }
            if (Math.abs(hour - 9.0) < fogDuration) {
                transiFog = 1 - (Math.abs(hour - 9.0)/fogDuration);
            }
        } else if (hour >= 9.0 && hour < 15.0) {
            periodOfDay = 2; //day
            if (Math.abs(hour - 9.0) < fogDuration) {
                transiFog = 1 - (Math.abs(hour - 9.0)/fogDuration);
            }
            if (Math.abs(hour - 15.0) < fogDuration) {
                transiFog = 1 - (Math.abs(hour - 15.0)/fogDuration);
            }
        } else if (hour >= 15.0 && hour < 21.0) {
            periodOfDay = 3; //evening
            if (Math.abs(hour - 15.0) < fogDuration) {
                transiFog = 1 - (Math.abs(hour - 15.0)/fogDuration);
            }
            if (Math.abs(hour - 21.0) < fogDuration) {
                transiFog = 1 - (Math.abs(hour - 21.0)/fogDuration);
            }
        }

        
        var skyIndex = sky[periodOfDay][dayOfCylce];
        //print("SKY: " + skyIndex + "(" + periodOfDay + " | " + dayOfCylce + ") - FRACTION: " + fraction + " TRANSIFOG: " + transiFog);
        
        // SUNSET A (Sunset)
        skyproperty[0] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 228, "blue": 156 },
              "intensity": 3,
              "castShadows": true,
              "direction": Vec3.fromPolar( 21 * DEGREES_TO_RADIANS, 129 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.3,
              "ambientURL": ROOT + "skies360/SL001_CLOUDY_SUNRISE.jpg"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SL001_CLOUDY_SUNRISE.jpg"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 900,
              "hazeColor": { "red": 128, "green": 154, "blue": 179 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 197, "blue": 115 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // DUSK A (Dusk)
        skyproperty[1] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 132, "blue": 0 },
              "intensity": 0.1,
              "castShadows": true,
              "direction": Vec3.fromPolar( 5 * DEGREES_TO_RADIANS, -116 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.01,
              "ambientURL": ROOT + "skies360/SKYGEN02.jpg"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKYGEN02.jpg"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 16000,
              "hazeColor": { "red": 128, "green": 154, "blue": 179 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 197, "blue": 115 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 3000 - 5000 + universeCenter.y,
              "hazeCeiling": 3500 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // MORNING SAND (Morning)
        skyproperty[2] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 230, "green": 133, "blue": 60 },
              "intensity": 2,
              "castShadows": true,
              "direction": Vec3.fromPolar( 20 * DEGREES_TO_RADIANS, -58 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.5,
              "ambientURL": ROOT + "skies360/SL003_SANDY_SUNSET.jpg"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SL003_SANDY_SUNSET.jpg"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 300,
              "hazeColor": { "red": 54, "green": 47, "blue": 33 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 219, "green": 185, "blue": 138 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // 10h AM A (Day)
        skyproperty[3] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 236, "blue": 184 },
              "intensity": 5,
              "castShadows": true,
              "direction": Vec3.fromPolar( 35 * DEGREES_TO_RADIANS, -74 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.5,
              "ambientURL": ROOT + "skies360/SUPER_DAY.jpg"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SUPER_DAY.jpg"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 600,
              "hazeColor": { "red": 128, "green": 154, "blue": 255 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 236, "blue": 184 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // SKY_SUNSET_10-2018-E (Sunset)
        skyproperty[4] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 208, "blue": 128 },
              "intensity": 3.3,
              "castShadows": true,
              "direction": Vec3.fromPolar( 14 * DEGREES_TO_RADIANS, 180 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.35,
              "ambientURL": ROOT + "skies360/SKY_SUNSET_10-2018-E.png"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKY_SUNSET_10-2018-E.png"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 1100,
              "hazeColor": { "red": 128, "green": 154, "blue": 179 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 197, "blue": 115 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // SKY_DUSK_10-2018-B (Dusk)
        skyproperty[5] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 168, "blue": 102 },
              "intensity": 1,
              "castShadows": true,
              "direction": Vec3.fromPolar( 4 * DEGREES_TO_RADIANS, 179 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.03,
              "ambientURL": ROOT + "skies360/SKY_DUSK_10-2018-B.png"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKY_DUSK_10-2018-B.png"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 3500,
              "hazeColor": { "red": 42, "green": 58, "blue": 176 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 212, "green": 232, "blue": 255 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // SKY_MORNING_10-2018-E (Morning)
        skyproperty[6] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 213, "blue": 130 },
              "intensity": 3.8,
              "castShadows": true,
              "direction": Vec3.fromPolar( 13 * DEGREES_TO_RADIANS, 22 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.25,
              "ambientURL": ROOT + "skies360/SKY_MORNING_10-2018-E.png"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKY_MORNING_10-2018-E.png"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 1150,
              "hazeColor": { "red": 86, "green": 137, "blue": 214 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 229, "blue": 179 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // DAY A (Day)
        skyproperty[7] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 251, "blue": 217 },
              "intensity": 6,
              "castShadows": true,
              "direction": Vec3.fromPolar( 50 * DEGREES_TO_RADIANS, -164 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.2,
              "ambientURL": ROOT + "skies360/SL002_SUNNY_13H.jpg"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SL002_SUNNY_13H.jpg"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 900,
              "hazeColor": { "red": 128, "green": 154, "blue": 179 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 197, "blue": 115 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // SKY_SUNSET_10-2018-C (Sunset)
        skyproperty[8] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 229, "blue": 176 },
              "intensity": 1,
              "castShadows": true,
              "direction": Vec3.fromPolar( 20 * DEGREES_TO_RADIANS, 167 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.32,
              "ambientURL": ROOT + "skies360/SKY_SUNSET_10-2018-C.png"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKY_SUNSET_10-2018-C.png"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 1300,
              "hazeColor": { "red": 128, "green": 154, "blue": 179 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 117, "green": 112, "blue": 104 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // SKY_MORNING_10-2018-A (Morning)
        skyproperty[9] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 248, "blue": 212 },
              "intensity": 4.3,
              "castShadows": true,
              "direction": Vec3.fromPolar( 50 * DEGREES_TO_RADIANS, 36 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.2,
              "ambientURL": ROOT + "skies360/SKY_MORNING_10-2018-A.png"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKY_MORNING_10-2018-A.png"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 500,
              "hazeColor": { "red": 128, "green": 154, "blue": 179 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 229, "blue": 179 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // SKY_DAY_10-2018-D (Day)
        skyproperty[10] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 216, "blue": 168 },
              "intensity": 4,
              "castShadows": true,
              "direction": Vec3.fromPolar( 29 * DEGREES_TO_RADIANS, 178 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.45,
              "ambientURL": ROOT + "skies360/SKY_DAY_10-2018-D.png"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKY_DAY_10-2018-D.png"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 800,
              "hazeColor": { "red": 116, "green": 147, "blue": 179 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 211, "blue": 150 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // SKY_SUNSET_10-2018-A (Sunset)
        skyproperty[11] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 190, "blue": 133 },
              "intensity": 2,
              "castShadows": true,
              "direction": Vec3.fromPolar( 13 * DEGREES_TO_RADIANS, -173 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.19,
              "ambientURL": ROOT + "skies360/SKY_SUNSET_10-2018-A.png"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKY_SUNSET_10-2018-A.png"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 2000,
              "hazeColor": { "red": 107, "green": 152, "blue": 219 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 212, "blue": 196 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // SKY_DUSK_10-2018-A (Dusk)
        skyproperty[12] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 244, "blue": 143 },
              "intensity": 1.5,
              "castShadows": true,
              "direction": Vec3.fromPolar( 10 * DEGREES_TO_RADIANS, -179 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.1,
              "ambientURL": ROOT + "skies360/SKY_DUSK_10-2018-A.png"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKY_DUSK_10-2018-A.png"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 1000,
              "hazeColor": { "red": 118, "green": 133, "blue": 204 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 221, "blue": 143 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // SKY_MORNING_10-2018-C (Morning)
        skyproperty[13] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 228, "blue": 191 },
              "intensity": 4.6,
              "castShadows": true,
              "direction": Vec3.fromPolar( 26 * DEGREES_TO_RADIANS, 17 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.35,
              "ambientURL": ROOT + "skies360/SKY_MORNING_10-2018-C.png"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKY_MORNING_10-2018-C.png"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 1400,
              "hazeColor": { "red": 95, "green": 136, "blue": 212 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 229, "blue": 179 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // SKY_DAY_10-2018-F (Day)
        skyproperty[14] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 251, "blue": 212 },
              "intensity": 2.9,
              "castShadows": true,
              "direction": Vec3.fromPolar( 40 * DEGREES_TO_RADIANS, -137 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.6,
              "ambientURL": ROOT + "skies360/SKY_DAY_10-2018-F.png"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKY_DAY_10-2018-F.png"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 1100,
              "hazeColor": { "red": 116, "green": 147, "blue": 179 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 211, "blue": 150 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // SKY_SUNSET_10-2018-B (Sunset)
        skyproperty[15] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 209, "blue": 117 },
              "intensity": 3,
              "castShadows": true,
              "direction": Vec3.fromPolar( 17 * DEGREES_TO_RADIANS, 180 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.24,
              "ambientURL": ROOT + "skies360/SKY_SUNSET_10-2018-B.png"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKY_SUNSET_10-2018-B.png"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 1400,
              "hazeColor": { "red": 128, "green": 154, "blue": 179 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 197, "blue": 115 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // SKY_MORNING_10-2018-B (Morning)
        skyproperty[16] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 228, "blue": 191 },
              "intensity": 4.8,
              "castShadows": true,
              "direction": Vec3.fromPolar( 43 * DEGREES_TO_RADIANS, 12 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.35,
              "ambientURL": ROOT + "skies360/SKY_MORNING_10-2018-B.png"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKY_MORNING_10-2018-B.png"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 2300,
              "hazeColor": { "red": 116, "green": 143, "blue": 194 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 229, "blue": 179 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        // SKY_DAY_10-2018-C (Day)
        skyproperty[17] = {
           "type": "Zone",
           "keyLightMode": "enabled",
           "keyLight": {
              "color": { "red": 255, "green": 233, "blue": 173 },
              "intensity": 4.5,
              "castShadows": true,
              "direction": Vec3.fromPolar( 31 * DEGREES_TO_RADIANS, 170 * DEGREES_TO_RADIANS)
           },
           "ambientLightMode": "enabled",
           "ambientLight": {
              "ambientIntensity": 0.4,
              "ambientURL": ROOT + "skies360/SKY_DAY_10-2018-C.png"
           },
           "skyboxMode": "enabled",
           "skybox": {
              "color": { "red": 255, "green": 255, "blue": 255 },
              "url": ROOT + "skies360/SKY_DAY_10-2018-C.png"
           },
           "hazeMode": "enabled",
           "haze": {
              "hazeRange": 700,
              "hazeColor": { "red": 116, "green": 147, "blue": 179 },
              "hazeBackgroundBlend": 0,
              "hazeEnableGlare": true,
              "hazeGlareColor": { "red": 255, "green": 211, "blue": 150 },
              "hazeGlareAngle": 37,
              "hazeAltitudeEffect": true,
              "hazeBaseRef": 4900 - 5000 + universeCenter.y,
              "hazeCeiling": 5100 - 5000 + universeCenter.y
           },
           "bloomMode": "enabled",
           "bloom": {
              "bloomIntensity": 0.03,
              "bloomThreshold": 0.33,
              "bloomSize": 0.15
           },
           "flyingAllowed": true
        };

        var properties = skyproperty[skyIndex];
        properties.rotation = curRotation;
        properties.position = universeCenter;
        properties.dimensions = {"x": universeDimensions.x - 10, "y": universeDimensions.y - 10, "z": universeDimensions.z - 10};
        properties.shapeType = "cylinder-y";
        properties.name = "SKY";
        properties.keyLight.shadowBias = 0.02;
        properties.keyLight.shadowMaxDistance = 200;
        
        var fog = properties.haze.hazeRange;
        var deltaFog = fog - 100;
        var fogIncreasment = deltaFog * transiFog;
        properties.haze.hazeRange = fog - fogIncreasment;
        
        
        var nightFactor = 1;
        if (periodOfDay === 0 && hour >= 21.0) {
            nightFactor = 1-((hour - 21.0)/3);
        } else if (periodOfDay === 0 && hour < 3.0) {
            nightFactor = 1-(Math.abs(hour - 3.0)/3);
        }
        var nightTint = hslToRgb(230/360, 0.63, nightFactor);
        
        properties.skybox.color = { "red": nightTint[0], "green": nightTint[1], "blue": nightTint[2] };
        properties.ambientLight.ambientColor = { "red": nightTint[0], "green": nightTint[1], "blue": nightTint[2] };
        
        if (skyID === Uuid.NULL) {
            //CREATE
            skyID = Entities.addEntity(properties, "local");
        } else {
            //UPDATE
            Entities.editEntity(skyID, properties);
        }
    }

    function positionIsInsideEntityBounds(entityID, targetPosition) {
        targetPosition = targetPosition || MyAvatar.position;

        var properties = Entities.getEntityProperties(entityID, ["position", "dimensions", "rotation"]);
        var entityPosition = properties.position;
        var entityDimensions = properties.dimensions;
        var entityRotation = properties.rotation;

        var worldOffset = Vec3.subtract(targetPosition, entityPosition);
        targetPosition = Vec3.multiplyQbyV(Quat.inverse(entityRotation), worldOffset);

        var minX = -entityDimensions.x * HALF;
        var maxX = entityDimensions.x * HALF;
        var minY = -entityDimensions.y * HALF;
        var maxY = entityDimensions.y * HALF;
        var minZ = -entityDimensions.z * HALF;
        var maxZ = entityDimensions.z * HALF;

        return (targetPosition.x >= minX && targetPosition.x <= maxX
            && targetPosition.y >= minY && targetPosition.y <= maxY
            && targetPosition.z >= minZ && targetPosition.z <= maxZ);
    }
    
    // ################## CYLCE AND TIME FUNCTIONS ###########################
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

})
