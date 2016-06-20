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

// export the class
module.exports = MotorHandler;