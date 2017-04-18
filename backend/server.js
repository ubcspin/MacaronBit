//------------------------------------------------------------------------------
// MacaronBit
//------------------------------------------------------------------------------

// Requires
//------------------------------------------------------------------------------
var express = require('express');
var app = express();
var five = require("johnny-five");
var fs = require('fs');
var path = require('path');
var csv = require ('fast-csv')
var pitchFinder = require('pitchfinder');
var server = require('http').Server(app);
var colors = require('colors');
var io = require('socket.io')(server);
var serialPort = require('serialport'); // for checking if serial ports are open


var functions = require('./functions.js')
var MotorHandler = require('./motor.js')
//var Encoder = require('./encoder.js')
var motorh = new MotorHandler();

//------------------------------------------------------------------------------
// Globals
//------------------------------------------------------------------------------
var board, myServo, myMotor, myBiMotor, myFlexSensor, myMotorPin;
var rendered_path_main = [];
var rendered_path_example = [];
var parameters;
var detectPitchAMDF;
var orgSetPoints =[];
var smoothOut =0;
var timeouts = [];

//----------------------------------------------------------------------------------
// Functions
//----------------------------------------------------------------------------------
function makepath(msg) {
    var frameheight = msg['range']
    var values = msg['path'].split(',')
    var name = msg['name']

    var scaled_points = [];
    var unscaled_points = [];
    
    var scale_factor = parameters.servoMax - parameters.servoMin

    var offset = parameters.servoMin



    if (name=="example") {
        scale_factor = 255;
        offset = 100
    }

    for (var i=10; i<values.length; i++) { //TODO: was i=10 a typo? Should it be =0? Who kno
        var v = parseFloat(values[i].split('L')[0]);
        var value = mapValue(v,frameheight,(frameheight * 2),parameters.servoMin,parameters.servoMax);
        unscaled_points.push(v); //!!! for RibBit3
        scaled_points.push(parameters.servoMax-value);
    }

    //log("max",getMaxOfArray(scaled_points),"min",getMinOfArray(scaled_points))
    //log("max",getMaxOfArray(unscaled_points),"min",getMinOfArray(unscaled_points))

    rendered_path(scaled_points,name);
}

function rendered_path(sp,name) {
    if (name=="example") {
        rendered_path_example = sp;
    } else if (name=="main") {
        rendered_path_main = sp;
		rendered_path_example = sp;
    }
}

function render() {
    stop_render();
     console.log('rendered path: ',getMaxOfArray(rendered_path_main),getMinOfArray(rendered_path_main))
    if (rendered_path_main.length==0 || rendered_path_example.length == 0) {
        log('No path to render yet...');
    }
    else {
        for(var i=0; i < rendered_path_main.length; i++) {
			timeouts.push(doSetTimeout(i));
        }
    }
}

function stop_render() {
    console.log("Stopping render...");
    myMotor.start(0)
    for (var i=0; i<timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
     myMotor.stop();
     myBiMotor.stop();
    log("Stopped render.");
}


var motorSpeed = 0;
var previousSensorValue = 5000;
var myMotorForward = true;
var targetValue;
function sensorPIDControl() {
	myFlexSensor.scale([0, 255]).on("data", function() {
		calculateMotorSpeedPID(targetValue, this.scaled);
		if (Math.round(this.scaled) == Math.round(targetValue)) {
			myMotor.stop();
			previousSensorValue = this.scaled;
			console.log("motor stopped");
		}
		else if (this.scaled > targetValue) {
			myMotor.start(motorSpeed);
			previousSensorValue = this.scaled;
			console.log("motor speed: " + motorSpeed);
			console.log("motor going forward");
			console.log("target value: " + targetValue);
			console.log("sensor reads: " + this.scaled + "\n");
		}
		else if (this.scaled < targetValue && previousSensorValue > this.scaled){
			myMotor.reverse(motorSpeed*-1);
			previousSensorValue = this.scaled;
			console.log("motor speed: " + motorSpeed);
			console.log("previous sensor value: " + previousSensorValue);
			console.log("motor going reverse");
			console.log("target value: " + targetValue);
			console.log("sensor reads: " + this.scaled + "\n");
			
		}
		else if (this.scaled < targetValue && previousSensorValue < this.scaled) {
			myMotor.forward(motorSpeed*-1);
			previousSensorValue = this.scaled;
			console.log("motor speed: " + motorSpeed);
			console.log("previous sensor value: " + previousSensorValue);
			console.log("motor going forward");
			console.log("target value: " + targetValue);
			console.log("sensor reads: " + this.scaled + "\n");
		}
		
	});
}

function calculateMotorSpeedPID(target, value) {
	var pidOutput = calculatePID(target, value);
	var roundMotorSpeed = Math.round(pidOutput);
	motorSpeed = Math.max(-250, Math.min(roundMotorSpeed, 250));
}

var flexSensorPresent = false;
var motorPresent = true;
// Get initialized when board is ready
var startSensorValue = 0;
function doSetTimeout(i) {
    //console.log('set timeout called!')
    var t = setTimeout(function(){
        myServo.to(rendered_path_main[i]);
        // random = Math.max((Math.random()*80),15)
        // myServo.to(random);
        //log('random val: ',random)
		if (flexSensorPresent && motorPresent) {
			var sensorPositionMap = rendered_path_main.map(mapPositionToSensor);	
			targetValue = sensorPositionMap[i];
		//	console.log("target position:" + rendered_path_main[i]);
		//	console.log("target sensor-position:" + sensorPositionMap[i]);
		//	sensorPIDControl(sensorPositionMap[i]);
		//	myMotor.start(sensorPositionMap[i]);
			
		//	if (rendered_path_main[i] < rendered_path_main[i-1]) {
		//		myMotorForward = false;
		//	}
		//	else if (rendered_path_main[i] == rendered_path_main[i-1] && !myMotorForward) {
		//		myFlexSensor.scale([0, 255]).on("data", function() {
		//			if (this.scaled >= mapPositionToSensor(rendered_path_main[i]) || this.scaled >= startSensorValue) {
		//				myMotorForward = true;
		//				myMotor.forward(sensorPositionMap[i]);
		//			}
		//		});
		//	}
			
		//	if (!myMotorForward) {
		//		myMotor.reverse(sensorPositionMap[i]);
		//	}
			//myMotor.start(10);
			
			
		}
		else {
			motorSpeed = motorh.calculateMotorSpeed(rendered_path_main[i]);
			myMotor.start(motorSpeed);
			console.log('Setting speed to ' + rendered_path_example[i]);
			//log('Rotating servo to ' + rendered_path_main[i]);
			
			if (i == 0) {
				myBiMotor.forward(motorSpeed);
			}
			else if (motorSpeed < motorh.calculateMotorSpeed(rendered_path_main[i-1])) {
				myBiMotor.reverse(motorSpeed);
			}
			else {
				myBiMotor.forward(motorSpeed);
			}
		}
		
    },i*3);
    return t;
}

// Using y = -0.0272x + 56.783 where y is motor speed and x is sensor value
function mapPositionToSpeed(positionValue) {
	var mappedSensorValue = mapPositionToSensor(positionValue)
	return Math.round((mappedSensorValue - 56.783)/ (-0.0272))
}

// Using y = -0.2208x + 59.575 where y is the sensorValue and x is position. 
function mapPositionToSensor(positionValue) {
	//return -0.1748*positionValue + 56.103
	//return -0.2208*positionValue + 59.575
	return -0.1781*positionValue + 59.326
}

var lastError = 0;
var integratedError = 0;
//var pValue = -51.0272;
//var dValue = 5;
//var iValue = -1;
var pValue = -51.0272;
var dValue = 5.25;
var iValue = -0.7;

function calculatePID(target, sensorValue) {
	var currentError = target - sensorValue
	var pCalc = pValue * currentError 
	//console.log("pValue: " + pCalc);

	var changeInError = 0;
	if(!isNaN(lastError)) {
		changeInError = currentError - lastError
	}
	lastError = currentError
	var dCalc = dValue * changeInError
	//console.log("dValue: " + dCalc);
	
	if(!isNaN(currentError)) {
		integratedError = integratedError + currentError;
	}
	var iCalc = iValue * integratedError
	//console.log("iValue: " + iCalc);
	
	return pCalc + dCalc + iCalc
}

function mapMotorSpeedToSensor() {
}

function processBuffer( inputBuffer ) {
    log('inside processbuffer!')
    log('parameters:',parameters)
    var stepSize = Math.floor(parameters.sampleRate/parameters.frameRate);
    var buffer;
    log('step size: ',stepSize,'inputBuffer length: ',inputBuffer.length)
    for (i=stepSize;i<inputBuffer.length;i+=stepSize){
        if (i==stepSize){
            log('for loop in process()')
        }
        j = (i-parameters.framesPerBuffer)
        
        buffer = inputBuffer.slice(j,i)
            
        if (buffer.length==0){
           log('buffer length 0')
            break
        }
        renderBuffer(buffer)
    }
    log("emitted processed buffer")
    io.emit("process_buffer_done");
}

function renderBuffer(inputBuffer) {
        //log('inside renderbuffer')
        var ampRaw = Math.abs(Math.max.apply(Math, inputBuffer));

        //start of pitch analysis///////////////////////////////////////////        
        var pitch = detectPitchAMDF(inputBuffer);
        
        if (pitch==null){
            pitch = 0
        }
        else{
            pitch = functions.mapValue(pitch, 0,1000,0,1)
        }
        //end of pitch analysis///////////////////////////////////////////
        
        //mixes amplitude and frequency, while scaling it up by scaleFactor.
        var ampPitchMix = (parameters.gain_for_amp * ampRaw + parameters.gain_for_pitch * pitch) * parameters.scaleFactor;
        
        //smooths values
        //Note: smoothValue is a number between 0-1
        smoothOut = parameters.smoothValue * smoothOut + (1 - parameters.smoothValue) * ampPitchMix;
        
        orgSetPoints.push(smoothOut);
        
}

function importParameters(paramatersFile){
    var content = fs.readFileSync(paramatersFile)
    var jsonContent = JSON.parse(content)
    parameters = jsonContent;
}

function log() {
    var out = []
    var r = Array.from(arguments)

    var date = new Date().toLocaleTimeString() + "\t"
    console.log(" ")
    console.log(repeat(date.length * 4,"=").rainbow)
    console.log(date.rainbow)
    
    r.forEach(function(item){
        console.log(item)
    })
    console.log(repeat(date.length * 4,"-").rainbow)
}

function repeat(n,l) {
    if (n == 0) {
        return l
    } else {
        return l + repeat(n-1,l)
    }
}

function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}

function getMinOfArray(numArray) {
  return Math.min.apply(null, numArray);
}

function mapValue(value, minIn, maxIn, minOut, maxOut){
    return (((value - minIn) / (maxIn - minIn)) * (maxOut - minOut)) + minOut;
}


function processCsv(csvfile){
    orgSetPoints = []
    log('csvfile path: '+csvfile)
    var stream = fs.createReadStream(csvfile);

    var audioBuffer = []

    var csvStream = csv()
        .on("data", function(d){
             audioBuffer.push(d[1])
        })
        .on("end", function(lines){
            //log('audioBuffer: ',audioBuffer)
            processBuffer(audioBuffer); 
        });

    stream.pipe(csvStream);
}

function boardload(portName) {
    //------------------------------------------------------------------------------
    // Board setup
    //------------------------------------------------------------------------------
    board = new five.Board({port:portName});
    
    board.on("ready", function() {
        log('board is ready!')
        var standby = new five.Pin(7);
        standby.high()

		// Using ADAFRUIT MOTOR SHIELD
		var configs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V2;
		myMotor = new five.Motor(configs.M1);
		myBiMotor = new five.Motor(configs.M1);


        myServo = new five.Servo({
            pin:10,
            center:true,
            range: [parameters.servoMin,parameters.servoMax] 
        });
		
		myFlexSensor = new five.Sensor({
			pin: "A0",
			freq: 125
		});
		
		myFlexSensor.scale([0, 255]).on("data", function() {
				startSensorValue = this.scaled;
				//console.log("sensor reads: " + this.scaled);
		});


//        board.repl.inject({
//            motor: myMotor,
//            servo: myServo
//        });

        board.repl.inject({
            motor: myBiMotor,
            servo: myServo
        });
        io.emit('server_message','Ready to start board.');
            log('Sweep away, my captain.');
		
		if (flexSensorPresent && motorPresent) {	
			sensorPIDControl();
		}
		
//		board.firmata.setMaxListeners(100)

//		var movement = [0, 0]
		var movementA = 0;
		var movementB = 0;
	
		var encodeA = new five.Pin("A1");
		var encodeB = new five.Pin("A2");
		var encodeArray = [];
		
		setupEncoder(movementA, movementB, encodeA, encodeB, encodeArray);
		myMotor.start(100);
		
		board.wait(3000, function() {
			myMotor.stop();
			console.log("encodeArray has: " + encodeArray);
			encodeArray.forEach(function(element) {
				console.log(element);
			});
			if(encodeDirectionClockwise) {
				console.log("motor going forward");
			} else{
				console.log("motor going backward");
			}
		});
	});
	
	
}


var encodeDirectionClockwise = true;
function setupEncoder(movementA, movementB, encodeA, encodeB, encodeArray) {
	console.log("setting up encoder");

	
	function startRead() {

		try {
			encodeA.INPUT
			encodeA.high()
			encodeB.INPUT
			encodeB.high()
		} catch(e) {
			console.log('Err ', e)
		}
		five.Pin.read(encodeA, function(error, valueA) {
			if (valueA > 200) {
				movementA = 1;
			}
			else {
				movementA = 0;
			}
		});
		five.Pin.read(encodeB, function(error, valueB) {
			if (valueB > 200) {
				movementB = 1;
			}
			else {
				movementB = 0;
			}
		});
	}
	startRead()
	

	setInterval(function() {
		var includes = false;
		var movementCombo = [movementA, movementB]
		encodeArray.forEach(function(element) {
			var is_same = (element.length == movementCombo.length) && element.every(function(move, index) {
				return move === movementCombo[index]; 
			});
			if (is_same) {
				includes = true;
			}
		});
		if(!includes) {
			encodeArray.push([movementA, movementB]);
		}
		if (encodeArray.length > 1) {
			var position1 = encodeArray[0];
			var position2 = encodeArray[1];
			if(position1[0] == 0 && position2[1] == 0 || position1[0] == 1 && position2[1] == 1) {
				encodeDirectionClockwise = true;
				//console.log('Direction going forward');
			}
			else {
				encodeDirectionClockwise = false;
				//console.log('Direction going reverse');
			}
			//encodeArray = []
		}
		//console.log('Movement: ' + movementA )
		//console.log('Movement: '+ movementB + "\n")
	}, 1)
	
	
}


//----------------------------------------------------------------------------------
// Main
//----------------------------------------------------------------------------------
function main() {
    
    //------------------------------------------------------------------------------
    // Server setup
    //------------------------------------------------------------------------------
    server.listen(3000);

    app.use("/thirdparty", express.static(__dirname + '/thirdparty'));
    app.use("/recordings", express.static(__dirname+'/recordings'));
    app.use(express.static(__dirname + '/js'));

    app.get('/', function (req, res) {
      res.sendfile(__dirname + '/index.html');
      console.log(__dirname)
    });
     app.use("/css", express.static(__dirname + '/css'));

    var host = server.address().address;
    var port = server.address().port;

    log('Example app listening at http://%s:%s', host, port);

    //------------------------------------------------------------------------------
    // json poop
    //------------------------------------------------------------------------------
    importParameters("recordings/test_parameters.json")
    console.log('default parameters: ',parameters)
    ///////////////////////////////////////////////////////////
    // Voodle code
    ///////////////////////////////////////////////////////////

    detectPitchAMDF = new pitchFinder.AMDF({
            sampleRate:40000,
            minFrequency:5,
            maxFrequency:1200
        });
///------legacy box, delete soon-------------------------//
    //processCsv('recordings/1464126410068_recording.csv') //
///------------------------------------------------------//
    //------------------------------------------------------------------------------
    // Socket setup
    //------------------------------------------------------------------------------
    io.on('connection', function(socket){
        log('User connected.');

        //User disconnects
        socket.on('disconnect', function(){
            log('User disconnected.');
        });

        // Test servo motion
        socket.on('test', function(){
                io.emit('server_message', 'Started arduino sweep.');
                myMotor.start(255);
            log('Arduino test.');
        });

        // Move to degree
        socket.on('degree', function(degree){
                var d = parseInt(degree);
                io.emit('server_message', 'Moving to degree ' + degree + ".");
                myMotor.start(255);
            log('Moving to degree ' + degree + ".");
        });

        socket.on('stop_render', function() {
            stop_render();
        });

        socket.on('path', function(msg){
            makepath(msg);
        });

        socket.on('render', function(){
            console.log('socket render event!')
            log('Rendering...');
            render();
        });
        socket.on('load_setPoints', function(filename){
            console.log('loading set points with', filename)
            if (filename == undefined){
                console.log('filename undefined')
            }
            else {
                
                log('importing new params!')
                importParameters('recordings/'+filename.split("_")[0]+'_parameters.json')
                log('params file path: ','recordings/'+filename.split("_")[0]+'_parameters.json')
                log('processing csv!')
                console.log("file name:"+filename)
                processCsv('recordings/'+filename)
                
            }
        });
        socket.on('get_setPoints', function(filename){
           
                io.emit('send_setPoints', orgSetPoints);
           
           });
    });

    //------------------------------------------------------------------------------
    // Deal with the stupid boards
    //------------------------------------------------------------------------------
    serialPort.list(function (err, ports) {
		console.log(ports);
        /*var filtered = ports.filter(function(port){
            // SerialPort(path,options,openImmediately)
            var srlport = new serialPort.SerialPort(port.comName,{},false)
            return  (port.comName.slice(0,11) == '/dev/cu.usb') &&
                    (!srlport.isOpen()) ? true : false;
        })
        if (filtered.length > 1) {
            boardload(filtered[1].comName); // this is probably stupid...
        } else {
            boardload(filtered[0].comName);
        }
        console.log(filtered)*/
		//boardload('COM5');
		boardload('COM12');
    });
}





main()