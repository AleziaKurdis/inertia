//cycler by Alezia Kurdis - December 2018

(function(){
	var Startcycle;
	var Finishcycle;
	
	this.preload = function(entityID) {
		Startcycle = Math.floor(Math.random()* 300) + 30;
		Finishcycle = Math.floor(Math.random()* 300) + 30;

		
		Update(entityID);
		
		var ProcessInterval = Script.setInterval(function() {
			
			Update(entityID);

		}, 30000); //30 sec
		
		
		
	}

	function Update(MyEntity){
			var colo = hslToRgb(GetCurrentCycleValue(1, 900), 1, 0.5);
			var colo2 = hslToRgb(GetCurrentCycleValue(1, Startcycle), 1, 0.5);
			var colo3 = hslToRgb(GetCurrentCycleValue(1, Finishcycle), 1, 0.5);
			
			Entities.editEntity(MyEntity, {
				"color": {"red": colo[0], "green": colo[1], "blue": colo[2] },
				"colorFinish": {"red": colo2[0], "green": colo2[1], "blue": colo2[2] },
				"colorStart": {"red": colo3[0], "green": colo3[1], "blue": colo3[2] },
				});		
	}
	
    this.unload = function(entityID) {
		
		//Do nothing
		
    };	 
	
	// ############# UTILITIES #############	

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
		var TodaySec = Math.floor(today.getTime()/1000);
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}

	// ############# UTILITIES END #############	
			
})