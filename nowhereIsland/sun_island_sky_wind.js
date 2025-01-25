//#####################
// SUN ISLAND SKY WIND WATER MANAGER
// Alezia Kurdis
// November 2020.
//#####################
(function(){ 
    var zoneID = Uuid.NULL;
    var waterID = Uuid.NULL;
    var waterMaterialID = Uuid.NULL;
    var waterUnderID = Uuid.NULL;
    var waterUnderMaterialID = Uuid.NULL;    
    var universeCenter;
    var universeDimension;
    var waterOriginPosition;
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    var HALF = 0.5;    
    var UPDATE_TIMER_INTERVAL = 100; //0.10 sec
    var skyTimer = 0;
    var processTimer = 0;
    var YEAR_DURATION = 3600 * 19 * 36 * 10; //10 months of 36 days de 19h;
    var MONTH_DURATION = 3600 * 19 * 36;
 
    this.preload = function(entityID) {
        if (zoneID == Uuid.NULL){
            if (positionIsInsideEntityBounds(entityID, MyAvatar.position)) {
                initiate(entityID);
            }
        }
    };

    this.enterEntity = function(entityID) {
        if (zoneID == Uuid.NULL){
            initiate(entityID);
        }
    };

    this.leaveEntity = function(entityID) {
        shutdown();
    };
    
    this.unload = function(entityID) {
        shutdown();
    };    

    function myTimer(deltaTime) {
        var today = new Date();
        var timeInterval = today.getTime() - processTimer;
        if (timeInterval > UPDATE_TIMER_INTERVAL ) {
            skyTimer = skyTimer + 1;
            if (skyTimer >= 100) {
                updateSky();
                skyTimer = 0;
            }
            
            moveWater();
            
            today = new Date();
            processTimer = today.getTime(); 
        } 
    }

    function shutdown() {
        if (zoneID != Uuid.NULL){

            Script.update.disconnect(myTimer);
        
            //Delete
            Entities.deleteEntity(zoneID);
            Entities.deleteEntity(waterID);
            Entities.deleteEntity(waterMaterialID);
            Entities.deleteEntity(waterUnderID);
            Entities.deleteEntity(waterUnderMaterialID);               
            waterUnderID = Uuid.NULL;
            waterUnderMaterialID = Uuid.NULL;                
            waterID = Uuid.NULL;
            waterMaterialID = Uuid.NULL;   
            zoneID = Uuid.NULL;
        }
    }

    function initiate(EntID) { 
        var myAvPos = MyAvatar.position;
        var properties = Entities.getEntityProperties(EntID, ["position", "dimensions", "renderWithZones"]);
        universeCenter = properties.position;
        universeDimension = properties.dimensions;
        waterOriginPosition = Vec3.sum(universeCenter, { "x": 0, "y": -92.1934, "z": 0 });
        //Create Zone
        var nova = {
            "type": "Zone",
            "name": "TROPICAL_SKY_ZONE",
            "renderWithZones": properties.renderWithZones,
            "locked": false,
            "dimensions": {
                "x": 3000,
                "y": 400,
                "z": 3000
            },
            "rotation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "position": universeCenter,
            "grab": {
                "grabbable": false
            },
            "shapeType": "box",
            "keyLight": {
                "color": {
                    "red": 242,
                    "green": 216,
                    "blue": 160
                },
                "intensity": 3.5,
                "direction": {
                    "x": 0.033253610134124756,
                    "y": -0.7643289566040039,
                    "z": -0.6439685225486755
                },
                "castShadows": true,
                "shadowBias": 0.15000000596046448,
                "shadowMaxDistance": 100
            },
            "ambientLight": {
                "ambientIntensity": 0.4,
                "ambientURL": "http://metaverse.bashora.com/sun_island/skies/day.ktx"
            },
            "skybox": {
                "color": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                },
                "url": "http://metaverse.bashora.com/sun_island/skies/day.ktx"
            },
            "bloom": {
                "bloomIntensity": 0.5009999871253967,
                "bloomThreshold": 0.7059999704360962,
                "bloomSize": 0.890999972820282
            },            
            "haze": {
                "hazeColor": {
                    "red": 16,
                    "green": 20,
                    "blue": 46
                },
                "hazeAltitudeEffect": true,
                "hazeCeiling": -6130,
                "hazeBaseRef": -6150
            },
            "ghostingAllowed": false,
            "flyingAllowed": false,
            "keyLightMode": "enabled",
            "ambientLightMode": "enabled",
            "skyboxMode": "enabled",
            "hazeMode": "enabled",
            "bloomMode": "enabled"
        };
        
        zoneID = Entities.addEntity(nova, "local");          

        waterID = Entities.addEntity({
            "type": "Model",
            "name": "WATER",
            "locked": false,
            "dimensions": {
                "x": 52780.78515625,
                "y": 0.276664674282074,
                "z": 45709.49609375
            },
            "rotation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "position": waterOriginPosition,
            "renderWithZones": properties.renderWithZones,
            "grab": {
                "grabbable": false
            },
            "modelURL": "http://metaverse.bashora.com/sun_island/WATER_LEVEL_200.fbx"
        }, "local");
 
        waterMaterialID = Entities.addEntity({
            "type": "Material",
            "parentID": waterID,
            "name": "WATER_MATERIAL",
            "locked": false,
            "position": waterOriginPosition,
            "rotation": {
                "x": -0.0000457763671875,
                "y": -0.0000457763671875,
                "z": -0.0000457763671875,
                "w": 1
            },
            "renderWithZones": properties.renderWithZones,
            "grab": {
                "grabbable": false
            },
            "materialURL": "http://metaverse.bashora.com/sun_island/water_material.json",
            "priority": 2,
            "parentMaterialName": "[mat::WATER]",
            "materialMappingScale": {
                "x": 80,
                "y": 80
            }
        }, "local");


        waterUnderID = Entities.addEntity({
            "type": "Model",
            "name": "WATER",
            "locked": false,
            "dimensions": {
                "x": 52780.78515625,
                "y": 0.276664674282074,
                "z": 45709.49609375
            },
            "rotation": {
                "x": 0,
                "y": 0,
                "z": -1,
                "w": -4.371138828673793e-8
            },
            "position": waterOriginPosition,
            "renderWithZones": properties.renderWithZones,
            "grab": {
                "grabbable": false
            },
            "modelURL": "http://metaverse.bashora.com/sun_island/WATER_LEVEL_200.fbx"
        }, "local");
 
        waterUnderMaterialID = Entities.addEntity({
            "type": "Material",
            "parentID": waterUnderID,
            "name": "WATER_MATERIAL",
            "locked": false,
            "position": waterOriginPosition,
            "rotation": {
                "x": -0.0000457763671875,
                "y": -0.0000457763671875,
                "z": -0.0000457763671875,
                "w": 1
            },
            "renderWithZones": properties.renderWithZones,
            "grab": {
                "grabbable": false
            },
            "materialURL": "http://metaverse.bashora.com/sun_island/water_material.json",
            "priority": 2,
            "parentMaterialName": "[mat::WATER]",
            "materialMappingScale": {
                "x": 80,
                "y": 80
            }
        }, "local");


      
        updateSky();

		var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer);        
    }

    function moveWater() {
        //WATER MOVEMENT
        var aquaRotor = GetCurrentCycleValue(360, 60); //360 deg over 60 sec (1 minute)
        var mareCycle = GetCurrentCycleValue(3600, 10); //360 deg over 8 sec 
        var mareCycleBeta = GetCurrentCycleValue(3600, 5); //360 deg over 7 sec 
        var sinMare = Math.sin((mareCycle/10) * DEGREES_TO_RADIANS);
        var sinMareBeta = Math.sin((mareCycleBeta/10) * DEGREES_TO_RADIANS);
        if (Math.abs(sinMareBeta) > Math.abs(sinMare)) {sinMare = sinMareBeta;}
        var waterVelocity = Vec3.multiplyQbyV( Quat.fromVec3Degrees( {"x": 0, "y": aquaRotor, "z": 0} ), {"x": 0,"y": 0.015 * sinMare,"z": 0.3} );
        /*##### DEBUG ===============
        print("VELOCITY" + JSON.stringify(waterVelocity));
        var properties = Entities.getEntityProperties(waterID, ["position"]);
        var curposition = properties.position;
        print("DISTANCE FROM ORIGIN: " + Vec3.distance(waterOriginPosition, curposition));
        //=========== END DUBUG ##### */
        var watertest = Entities.editEntity(waterID, {"damping": 0.0, "friction": 0.0, "velocity": waterVelocity});
        var watertest2 = Entities.editEntity(waterUnderID, {"damping": 0.0, "friction": 0.0, "velocity": waterVelocity});
    }
    
    function updateSky() {
        if (zoneID != Uuid.NULL){
            var myAvPos = MyAvatar.position;
            
            var DAY_DURATION = 68400;
            //SUN POSITION
            var azimuth = GetCurrentCycleValue(360, DAY_DURATION);
            var inWorldAzimuth = azimuth + 30;
            if (inWorldAzimuth >= 360) {inWorldAzimuth = inWorldAzimuth - 360;}
            var sunDirection = Quat.fromPitchYawRollDegrees(0, inWorldAzimuth, 0 );

            //UPDATE

            
            var propertiesToChanges = {
                "type": "Zone",
                "name": "TROPICAL_SKY_ZONE",
                "locked": false,
                "dimensions": {
                    "x": 3000,
                    "y": 400,
                    "z": 3000
                },
                "rotation": sunDirection,
                "position": universeCenter,
                "grab": {
                    "grabbable": false
                },
                "shapeType": "box",
                "keyLight": {
                    "color": {
                        "red": 242,
                        "green": 216,
                        "blue": 160
                    },
                    "intensity": 3.5,
                    "direction": {
                        "x": 0.033253610134124756,
                        "y": -0.7643289566040039,
                        "z": -0.6439685225486755
                    },
                    "castShadows": true,
                    "shadowBias": 0.15000000596046448,
                    "shadowMaxDistance": 100
                },
                "ambientLight": {
                    "ambientIntensity": 0.4,
                    "ambientURL": "http://metaverse.bashora.com/sun_island/skies/day.ktx"
                },
                "skybox": {
                    "color": {
                        "red": 255,
                        "green": 255,
                        "blue": 255
                    },
                    "url": "http://metaverse.bashora.com/sun_island/skies/day.ktx"
                },
                "bloom": {
                    "bloomIntensity": 0.5009999871253967,
                    "bloomThreshold": 0.7059999704360962,
                    "bloomSize": 0.890999972820282
                },                
                "haze": {
                    "hazeColor": {
                        "red": 16,
                        "green": 20,
                        "blue": 46
                    },
                    "hazeAltitudeEffect": true,
                    "hazeCeiling": -6130,
                    "hazeBaseRef": -6150
                },
                "ghostingAllowed": false,
                "flyingAllowed": false,
                "keyLightMode": "enabled",
                "ambientLightMode": "enabled",
                "skyboxMode": "enabled",
                "hazeMode": "enabled",
                "bloomMode": "enabled"
            };            

            var test = Entities.editEntity(zoneID, propertiesToChanges);            


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

    function nightCompressedCycle(deg) {
        if (deg <= 60) { return (deg/60) * 90; }
        if (deg >= 300) { return 360 - (((360 - deg)/60) * 90); }
        if (deg > 180) {
            return 180 + (((deg - 180)/120) * 90);
        } else {
            return 90 + (((deg-60)/120) * 90);
        }
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
    
})