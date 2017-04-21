//------------------------------------------------------------------------------
// MacaronBit
//------------------------------------------------------------------------------
// encoder.js attempts to mirror the Twiddlerino.cpp code that is used in the PID lab
// but in JavaScript and Johnny-Five
//
// !!!!!!!!!!
// NOTE: Not all utility from Twiddlerino.cpp has been translated over to this file yet
// may require additional work. Current issues are in regards to query/read pin callbacks
// ReadEncoder currently returns 0 and does not seem to be reading pin values

// Requires
//------------------------------------------------------------------------------
//var express = require('express');
//var app = express();
var five = require('johnny-five');
var fs = require('fs');
//------------------------------------------------------------------------------
// Globals
//------------------------------------------------------------------------------
var board, motor, led;

var OutputEnable = 'A0';
var Select = 'A1';
var ResetEncoder = 'A2';

var pin2; 
var pin3; 
var pin4; 
var pin5; 
var pin6;
var pin7; 
var pin8;
var pin9;
var pin10; 
var pin11; 
var pin12;
var dataBusArray = [];

var oePin;
var selPin;
var resPin;

// Constructor
function EncoderHandler() {
	
}

function EncoderInit() {
	// DATA BUS
	//used to read in a byte from the encoder
	pin2 = new five.Pin({
		pin: 2,
		mode: five.Pin.INPUT
	});
	pin3 = new five.Pin({
		pin: 3,
		mode: five.Pin.INPUT
	});
	pin4 = new five.Pin({
		pin: 4,
		mode: five.Pin.INPUT
	});
	pin5 = new five.Pin({
		pin: 5,
		mode: five.Pin.INPUT
	});
	pin6 = new five.Pin({
		pin: 6,
		mode: five.Pin.INPUT
	});
	pin7 = new five.Pin({
		pin: 7,
		mode: five.Pin.INPUT
	});
	pin8 = new five.Pin({
		pin: 8,
		mode: five.Pin.INPUT
	});
	pin9 = new five.Pin({
		pin: 9,
		mode: five.Pin.INPUT
	});
	
	// For convenience of reading pins later
	// pin2 not included because it has slightly different use case
	dataBusArray = [pin9, pin8, pin7, pin6, pin5, pin4, pin3]
	
	// Motor
	// 11 and 12 control motor direction
	pin10 = new five.Pin({
		pin: 10,
		mode: five.Pin.OUTPUT
	});
	pin11 = new five.Pin({
		pin: 11,
		mode: five.Pin.OUTPUT
	});
	pin12 = new five.Pin({
		pin: 12,
		mode: five.Pin.OUTPUT
	});
	
	
	// Encoder
	oePin = new five.Pin({
		pin: OutputEnable,
		mode: five.Pin.OUTPUT
	});
	selPin = new five.Pin({
		pin: Select,
		mode: five.Pin.OUTPUT
	});
	resPin = new five.Pin({
		pin: ResetEncoder,
		mode: five.Pin.OUTPUT
	});
	
	 //disable encoder output, enabling the encoder value to be updated
	five.Pin.write(oePin, 1);
	
	//initial reset of the encoder
	ZeroEncoder();
}

//This resets the encoder's position value to 0
function ZeroEncoder() {
	resPin.high();
	resPin.low();
}

function ReadEncoder() {
	oePin.write(0);
	
	//tell the encoder we want the high byte
    selPin.write(0);
    //read the high byte value
    var high_byte = 0;
	for (i = 0; i < 7; i++) {
		var pinToRead = dataBusArray[i];
		var pinValue;
		pinToRead.query(function(state) {
			pinValue = state.value;
			//console.log("pin value is: " + pinValue);
		});
		while (pinValue === undefined) {
			console.log("pin value is undefined");
		}
		high_byte += state.value;
		high_byte = high_byte << 1;
	}
	
	//Need to avoid shifting the last time
	pin2.query(function(state) {
		high_byte += state.value;
	});
  
	//tell the encoder we want the low byte
	selPin.write(1);
	//read the high byte value
	var low_byte = 0;
	for (i = 0; i < 7; i++) {
		var pinToRead = dataBusArray[i];
		pinToRead.query(function(state) {
			low_byte += state.value;
			low_byte = low_byte << 1;
		});
	}
	pin2.query(function(state) {
		low_byte += state.value;
	});

	//disable data output, allowing encoder value to be updated
	oePin.write(0);
  
	//compute the final value of the encoder
	var encoder_value = (high_byte<<8) + low_byte;
	return encoder_value;
}

// class methods
EncoderHandler.prototype.encoderInit = function() {
	EncoderInit();
};

EncoderHandler.prototype.zeroEncoder = function() {
	ZeroEncoder();
};

EncoderHandler.prototype.readEncoder = function() {
	return ReadEncoder(); 
};

// export the class
module.exports = EncoderHandler;



