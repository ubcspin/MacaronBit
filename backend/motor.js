//------------------------------------------------------------------------------
// MacaronBit
//------------------------------------------------------------------------------

// Requires
//------------------------------------------------------------------------------
var express = require('express');
var app = express();
var five = require('johnny-five');
var fs = require('fs');

//------------------------------------------------------------------------------
// Globals
//------------------------------------------------------------------------------
var board, motor, led;

var parameters = {
//	smoothValue: 0.80,
//	gain_for_amp: 0.19685039370078738,
//	gain_for_pitch: 0.8031496062992126,
//	scaleFactor: 1.9291338582677164,
//	servoMax: 75,
//	servoMin: 10,
//	motorMinSpeed: 0,
//	motorMaxSpeed: 255,
//	frameRate: 34,
//	framesPerBuffer: 10,
//	sampleRate: 1000,
//	reverse: false,
//	on: true,
//	minFrequency: 0,
//	maxFrequency: 0,
//	p: 0.5,
//	i: 0,
//	d: 0.031496062992125984,
//	r: 0,
//	wheelControl: false
}

//board = new five.Board();
//
//board.on("ready", function() {
//  // Create a new `motor` hardware instance.
//  motor = new five.Motor({
//    pin: 5
//  });
//
//  // Inject the `motor` hardware into
//  // the Repl instance's context;
//  // allows direct command line access
//  board.repl.inject({
//    motor: motor
//  });
//
//  // Motor Event API
//
//  // "start" events fire when the motor is started.
//  motor.on("start", function() {
//    console.log("start", Date.now());
//
//    // Demonstrate motor stop in 2 seconds
//    board.wait(2000, function() {
//      motor.stop();
//    });
//  });
//
//  // "stop" events fire when the motor is stopped.
//  motor.on("stop", function() {
//    console.log("stop", Date.now());
//  });
//
//  // Motor API
//
//  // start([speed)
//  // Start the motor. `isOn` property set to |true|
//  // Takes an optional parameter `speed` [0-255]
//  // to define the motor speed if a PWM Pin is
//  // used to connect the motor.
//  motor.start();
//
//  // stop()
//  // Stop the motor. `isOn` property set to |false|
//});

// Constructor
function MotorHandler() {
  // always initialize all instance properties
  // this.io = io;
  // this.baz = 'baz'; // default value
}

// class methods
MotorHandler.prototype.test = function() {
	console.log("Tested MotorHandler as class")
};

// Motor requires minimum 50 speed to show output
// value is between 0 - 1 taken from position
MotorHandler.prototype.calculateMotorSpeed = function(value) {
	return value + 50;
};



// export the class
module.exports = MotorHandler;