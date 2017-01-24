// Constructor
function Parameters() {
  // always initialize all instance properties
  // this.io = io;
  // this.baz = 'baz'; // default value
  this.parameters = {

							position : {
								valueScale:[0,1], //normalized
								data : [
									{ id: 1, t: 1500, value:0.5, selected:false}],
								fun: function(out,paramvalue){
									return paramvalue
								}
							},

							random : {
								valueScale:[0,1],
								data : [
								{id:2,t:1500,value:0,selected:false}],
								fun: function(out,paramvalue){
									return out+mapValue(Math.random(),0,1,0,paramvalue)
								}
							},

	 						 smooth : {
		 						 valueScale:[0,1],
		 						 data : [{id:5, t:1500, value:0, selected:false}],
		 						 fun: function(output, previousTimeOutput, currentParamValue) {
								  if (currentParamValue === 0) {
									  return output
								  }
									 var smoothOutput = output;
									 var smoothTimes = Math.round(currentParamValue * 10);
									 for (var i = 0; i < smoothTimes; i++) {
									 	smoothOutput = (smoothOutput + previousTimeOutput)/2;
									 }
									  return smoothOutput;
		  							},
								 pointValues: {}
	 						 },

							maxValue : {
								valueScale:[0,1],
								data : [
									{id:3,t:1500,value:1, selected:false}],
								fun: function(out,paramvalue){
									if (out > paramvalue){
										return paramvalue
									}
									else{
										return out
									}
								}
							},

							minValue : {
								valueScale:[0,1],
								data : [
									{id:3,t:1500,value:0, selected:false}],
								fun: function(out,paramvalue){
									if (out < paramvalue){
										return paramvalue
									}
									else{
										return out
									}
								}
							},
				}
 
}
// class methods
Parameters.prototype.getParameters = function() {
		return this.parameters;
};
Parameters.prototype.getParameterKeyArray = function() {
		return Object.keys(this.parameters);
};
Parameters.prototype.initParamsWith = function(val) {
		var ret = {}
		Object.keys(this.parameters).forEach(function(key){
			ret[key] = val
		})
		return ret;
};



// export the class
module.exports = Parameters;


function mapValue(value, minIn, maxIn, minOut, maxOut){
    if (value>maxIn){
        value = maxIn;
    }
    if (value<minIn){
        value = minIn;
    }
    return (value / (maxIn - minIn) )*(maxOut - minOut);
}