
/**
Spritesheet Shader

Made By Matti 'Menithal' Lahtinen
Released under Creative Commons Attribution
OI 29/5/2017

This simple shader allows you to create a looping animated sheet within High Fidelity
 or any other software that supports a Fragment Shader of the similar type.
**/


// These are defined as floats, because apparently high fidelity userdata json, still gets parsed as floats (as JS Only has Numbers),
//  so if they were ints, the configuration parameters would be completely skipped. Very very annoying.

// Sprite sheet rows
uniform float uRows = 3.0;
// Sprite sheet columns
uniform float uColumns = 4.0;
// Default FPS the sprite sheet would be played back at.
uniform float uFps = 5.0;


// Frame definition
/*
 Frames are defined by Rows So, forexample the above default values would be a sheet with 2 rows and 2 columns.
 The frames would be as:
		 ------------
		| 0 | 1 | 2 | 3 |
		-------------
		| 4 | 5 | 6 | 7 |
		-------------
		| 8 | 9 |10 |11 |
		-------------
*/

// The starting frame. If this is larger than lastFrame, it becomes same as lastFrame
uniform float uStartFrame = 0.0;
// The ending frame. If this is negative, then this is the same as the total size. If smaller than startFrame, its same as it.
uniform float uEndFrame = -1.0;
// shine of the value. set from 0-255
uniform float uShine = 1.0;
// Emit, 0-1;
uniform float uEmit = 1.0;
// Since shaders don't support alpha mapping, this is used
uniform float uAlphaCutoff = 0.5;
// Experimental Feature: Adjusts the cutoff, so you can put the shader on a Sphere.
uniform float uZCutOff = -0.49;

// This is what HiFidelity calls on shader call
float getProceduralColors( inout vec3 diffuse, inout vec3 specular, inout float shininess )
{
	// This makes sure only the very front of the entity (supports only boxes) gets used, everything else gets distacted (-z is front in hifi)
	// _position is basically the very position of the current pixel fragment thats being rendered.
	if (_position.z > uZCutOff) {
		discard;
	}
	// gets the position of the current pixel fragment
	vec3 position = _position.xyz;
	// Converts the uRows into an integers. This wouldnt normally be needed
	int _uRows = int(uRows);
	int _uColumns = int(uColumns);
	int _uStartFrame = int(uStartFrame);

	// Calculates total amount of frames
	int _total = _uRows * _uColumns;
	// By default sets the total as the lastFrame
	int _uEndFrame = _total;

	// But if customizable LastFrame is something different from default -1, lets do some logic.
	if (uEndFrame > -1) {
		if (_uEndFrame < _uStartFrame) {
			_uEndFrame = _uStartFrame;
		} else if (uEndFrame < _total ){
			_uEndFrame = int(uEndFrame+1);
		}
	}
	// Defiine a starting texture
	int _startFrameOffset = 0;

	float uCurrentPosition = 0;

	// If starting frame is different from 0, do some offsets
	if( _uStartFrame > 0) {
		uCurrentPosition =  mod(iGlobalTime*uFps, _uEndFrame - _uStartFrame) + _uStartFrame;
	} else if (_uStartFrame < _uEndFrame) {
		// startFrame is smaller than last frame, then
		uCurrentPosition =  mod(iGlobalTime*uFps, _uEndFrame - _uStartFrame);
	} else {
		// if startFrame is greated than the endFrame, but not -1, then use startFrame as current Position
		uCurrentPosition = _uStartFrame;
	}
	// Make sure position is int for the next steps
	int _currentPos = int(uCurrentPosition);

	// Calculate position by
	/*
		row = floor (position / columns)
		column = position % columns
	*/
	int currentRow = int(_currentPos / _uColumns);
	int currentColumn = int(mod(_currentPos, _uColumns));
	/*
		Move to center, and then use the calculated column and row for the fragment pixel
	*/
	position.x -= currentColumn + 0.5;
	position.y -= currentRow + 0.5;
	/*
		Grab the texture from the iChannel0  Sampler, and make it into a texture, with the position being calculated from the row and the column and the current pixel.

	*/
    vec4 iTexture = texture(iChannel0, -position.xy / vec2(_uColumns,_uRows)).rgba;
	/*
		If the alpha for the position is less than contrast value, then discard it
	*/
	if ( iTexture.a < uAlphaCutoff ) {
		discard;
	}
	/*
		Now applying the fragments color, shine, and returning the emit;
	*/
	diffuse = iTexture.rgb;
	shininess = uShine;
	return uEmit;
}