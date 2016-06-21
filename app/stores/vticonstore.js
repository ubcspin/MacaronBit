import Reflux from 'reflux';

var LogStore = require('./logstore.js');
var Parameters = require('../classes/parameters.js');
var params = new Parameters();

var vticonActions = Reflux.createActions(
	[
		'selectVTIcon',

		'setVTIcon',

		'newKeyframe',
		'newMultipleKeyframes',

		'selectKeyframe',
		'selectKeyframes',
		'addSelectedKeyframe',
		'addSelectedKeyframes',
		'addToggleSelectedKeyframe',
		'selectKeyframesInRange',
		'addSelectedKeyframesInRange',
		'unselectKeyframe',
		'unselectKeyframes',
		'selectAllKeyframes',

		'selectTimeRange',
		'selectAllTimeRange',
		'unselectTimeRange',

		'moveSelectedKeyframes',
		'startMovingSelectedKeyframes',

		'undo',
		'redo',
		'reset', 

		'deleteSelectedKeyframes',
		'simplifyKeyframes',
		'xScaleKeyframes',
		'invertKeyframes',
	]

);


var vticonStore = Reflux.createStore({

	listenables: [vticonActions],
	init : function() {
		// console.log(ParameterStore.actions.getParameters())
		this._defaultParams = { //left side editor
						duration: 3000, //ms //was 3000

						selected: true,

						selectedTimeRange: {
							active:false,
							time1:0,
							time2:0
						},
						parameters: params.getParameters(),
		};

		this._data = {
					main: deepCopy(this._defaultParams),
					example: deepCopy(this._defaultParams),
		};


		this._previousStates = []; //for undo
		this._nextStates = []; //for redo
		this._kfuidCount = 0;
		for (var n in this._data) {
			for (var p in this._data[n].parameters) {
				for (var d in this._data[n].parameters[p].data)
				{
					this._kfuidCount += 1;
				}
			}
		}
		
	},

	getInitialState : function() {
		return this._data;

	},

	/**
	*
	* VTIcon Selection
	* 
	*/

	_selectVTIcon(name="") {
		var rv = "";
		if (name in this._data) {
			rv = name;
			for (var n in this._data) {
				this._data[n].selected = (name === n);
			}
		} else {
			for (var n in this._data) {
				if (this._data[n].selected) {
					rv = n;
				}
			}
		}
		LogStore.actions.log("VTICON_SELECT_"+rv);
		return rv;
	},

	onSelectVTIcon(name) {
		this._selectVTIcon(name);
		this.trigger(this._data);
	},


	/*
	*
	* Set VT Icon
	*
	*/

	onSetVTIcon(vticon, name) {
		if (name in this._data)
		{
			this._data[name].duration = vticon.duration;

			this._data[name].selectedTimeRange.active=false;

			for (var p in this._data[name].parameters) {
				this._data[name].parameters[p].valueScale = vticon.parameters[p].valueScale;
				this._data[name].parameters[p].data = [];
				for (var i = 0; i < vticon.parameters[p].data.length; i++) {
					var d = vticon.parameters[p].data[i];
					this._addNewKeyframe(p, d.t, d.value, false, name=name);
				}
				this._setAllKeyframes(false, name);
			}

		}
		this.trigger(this._data);
	
	},

	/*
	*
	* Keyframe creation
	*
	*/

	onNewKeyframe(parameter, t, value, addToSelection=false, name="") {
		this._saveStateForUndo();
		name = this._selectVTIcon(name);

		LogStore.actions.log("VTICON_NEWKEYFRAME_"+name);

		var new_id = this._addNewKeyframe(parameter, t, value, addToSelection, name=name);
		if (new_id >= 0)
		{
			if (addToSelection)
			{
				this.trigger(this._data);
			} else {
				this.onSelectKeyframe(new_id);
			}
		}
	},

	onNewMultipleKeyframes(parameter_keyframe_map, overwrite=true, name="")
	{
		console.log("onNewMultipleKeyframes", parameter_keyframe_map)
		this._saveStateForUndo();
		name = this._selectVTIcon(name);
		var leftover_ids_to_delete = [];

		if (overwrite) {

			//find range of parameter_keyframe_map
			var min = {};
			var max = {};
			for (var p in parameter_keyframe_map) {
				if (!(p in min)) {
					min[p] = -1;
				}
				if (!(p in max)) {
					max[p] = -1;
				}
				for (var i = 0; i < parameter_keyframe_map[p].length; i++)
				{
					if (min[p] == -1 || parameter_keyframe_map[p][i].t < min[p])
					{
						min[p] = parameter_keyframe_map[p][i].t;
					}

					if (max[p] == -1 || parameter_keyframe_map[p][i].t > max[p])
					{
						max[p] = parameter_keyframe_map[p][i].t;
					}
				}
			}

			//delete keyframes in range
			var ids_to_delete = [];
			for (var p in this._data[name].parameters) {
				for (var i = 0; i < this._data[name].parameters[p].data.length; i++)
				{
					if (this._data[name].parameters[p].data[i].t >= min[p] &&
						this._data[name].parameters[p].data[i].t <= max[p])
					{
						ids_to_delete.push(this._data[name].parameters[p].data[i].id);
					}
				}
			}

			this._setSelectedKeyframes(ids_to_delete, true, name=name);
			this.onDeleteSelectedKeyframes(name);

			//store any remaining keyframes (e.g., if we deleted the last of them)
			for (var p in this._data[name].parameters) {
				for (var i = 0; i < this._data[name].parameters[p].data.length; i++)
				{
					if (this._data[name].parameters[p].data[i].t >= min[p] &&
						this._data[name].parameters[p].data[i].t <= max[p])
					{
						leftover_ids_to_delete.push(this._data[name].parameters[p].data[i].id);
					}
				}
			}
		} 


		this._setAllKeyframes(false, name=name);
		for (var p in parameter_keyframe_map) {
			for (var i = 0; i < parameter_keyframe_map[p].length; i++)
			{
				this._addNewKeyframe(p, parameter_keyframe_map[p][i].t, parameter_keyframe_map[p][i].value, true, name=name);
			}
		}

		//delete leftover ids
		var not_leftover_id = function(kf) {
			return (leftover_ids_to_delete.indexOf(kf.id) < 0);
		};

		for (var p in this._data[name].parameters) {
			this._data[name].parameters[p].data = this._data[name].parameters[p].data.filter(not_leftover_id);
		}

		this.trigger(this._data);
		
	},

	_addNewKeyframe(parameter, t, value, addToSelection=false, name="") {

		name = this._selectVTIcon(name);

		var new_id = -1;
		if (this._isValidKeyframePosition(parameter, t, value, name=name))
		{
			new_id = this._getNewKFUID();
			this._data[name].parameters[parameter].data.push({
				id:new_id,
				t:t,
				value:value,
				selected:true
			});

			this._data[name].parameters[parameter].data.sort(this._keyframeCompare);
		}
		return new_id;

	},

	/**
	* Selection
	*/

	onSelectKeyframe(id, name="") {
		name = this._selectVTIcon(name);

		this._setSelectedKeyframes([id], true, name=name);
	},

	onSelectKeyframes(ids, name="") {
		name = this._selectVTIcon(name);
		this._setSelectedKeyframes(ids, true, name=name);
	},

	onAddSelectedKeyframe(id, name="") {
		name = this._selectVTIcon(name);
		this._setSelectedKeyframes([id], false, name=name);
	},

	onAddSelectedKeyframes(ids, name="") {
		name = this._selectVTIcon(name);
		this._setSelectedKeyframes(ids, true, name=name);
	},

	onAddToggleSelectedKeyframe(id, name="") {
		name = this._selectVTIcon(name);
		for (var p in this._data[name].parameters) {
			for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
				if(this._data[name].parameters[p].data[i].id == id)
				{
					this._data[name].parameters[p].data[i].selected = !this._data[name].parameters[p].data[i].selected;
				}
			}
		}
		this.trigger(this._data);
	},

	onUnselectKeyframe(id, name="") {
		name = this._selectVTIcon(name);
		this._setUnselectedKeyframes([id], false, name=name);
	},

	onUnselectKeyframes(name="") {
		name = this._selectVTIcon(name);
		this._setAllKeyframes(false, name=name);
	},

	onSelectAllKeyframes(name="") {
		name = this._selectVTIcon(name);
		this._setAllKeyframes(true, name=name);
	},

	//Range select
	onSelectKeyframesInRange(time1, time2, parameter_value_map, name="") {
		name = this._selectVTIcon(name);
		var ids = this._getKFIDSInRange(time1, time2, parameter_value_map, name=name);
		this._setSelectedKeyframes(ids, true, name=name);

	},

	onAddSelectedKeyframesInRange(time1, time2, parameter_value_map, name="") {
		name = this._selectVTIcon(name);
		var ids = this._getKFIDSInRange(time1, time2, parameter_value_map, name=name);
		this._setSelectedKeyframes(ids, false, name=name);
	},

	//helpers
	//need to refactor into one function at some point?

	_getKFIDSInRange(time1, time2, parameter_value_map, name="") {
		name = this._selectVTIcon(name);
		var tLeft = time1;
		var tRight = time2;
		if(tLeft > tRight)
		{
			tLeft = time2;
			tRight = time1;
		}

		var rv =[];

		for (var p in parameter_value_map) {
			var vTop = parameter_value_map[p].value1;
			var vBottom = parameter_value_map[p].value2;
			if(vTop < vBottom)
			{
				vTop = parameter_value_map[p].value2;
				vBottom = parameter_value_map[p].value1;
			}

			for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
					if(this._data[name].parameters[p].data[i].t >= tLeft
						&& this._data[name].parameters[p].data[i].t <= tRight
						&& this._data[name].parameters[p].data[i].value <= vTop
						&& this._data[name].parameters[p].data[i].value >= vBottom)
					{
						rv.push(this._data[name].parameters[p].data[i].id);
					}
				}
		}

		return rv;
	},

	_setAllKeyframes(bool, name="") {
		name = this._selectVTIcon(name);
		for (var p in this._data[name].parameters) {
			for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
					this._data[name].parameters[p].data[i].selected = bool;
			}
		}
		this.trigger(this._data);
	},

	_setSelectedKeyframes(ids, setUnselected, name="") {
		name = this._selectVTIcon(name);
		for (var p in this._data[name].parameters) {
			for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
				if (ids.indexOf(this._data[name].parameters[p].data[i].id) >= 0 ) {
					this._data[name].parameters[p].data[i].selected = true;
				} else if (setUnselected) {
					this._data[name].parameters[p].data[i].selected = false;
				}
			}
		}
		this.trigger(this._data);
	},

	_setUnselectedKeyframes(ids, setSelected, name="") {
		name = this._selectVTIcon(name);
		for (var p in this._data[name].parameters) {
			for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
				if (ids.indexOf(this._data[name].parameters[p].data[i].id) >= 0 ) {
					this._data[name].parameters[p].data[i].selected = false;
				} else if (setSelected) {
					this._data[name].parameters[p].data[i].selected = true;
				}
			}
		}
		this.trigger(this._data);
	},


	/**
	* Set selection range
	*/

	onSelectTimeRange(time1, time2, name="")
	{
		name = this._selectVTIcon(name);
		//TODO: Select keyframes in here?

		this._data[name].selectedTimeRange.active = true;
		this._data[name].selectedTimeRange.time1 = Math.max(0, Math.min(this._data[name].duration, time1));
		this._data[name].selectedTimeRange.time2 = Math.max(0, Math.min(this._data[name].duration, time2));

		this.trigger(this._data);
	},

	onSelectAllTimeRange(name="")
	{
		name = this._selectVTIcon(name);
		LogStore.actions.log("VTICON_SELECTALLTIME_"+name);
		this.onSelectTimeRange(0, this._data[name].duration, name);
	},

	onUnselectTimeRange(name="")
	{
		name = this._selectVTIcon(name);
		//TODO: Unselect keyframes in here?

		this._data[name].selectedTimeRange.active = false;

		this.trigger(this._data);
	},

	/**
	* Move Keyframes
	*/

	onMoveSelectedKeyframes(dt, dv, name="") {
		name = this._selectVTIcon(name);
		//guard
		var valid_move = true;
		for (var p in this._data[name].parameters) {
			for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
				if (this._data[name].parameters[p].data[i].selected) {
					if (!this._isValidKeyframePosition(p, this._data[name].parameters[p].data[i].t+dt, this._data[name].parameters[p].data[i].value+dv[p], name=name))
					{
						valid_move = false;
					}
				}
			}
		}

		if (valid_move)
		{
			//move
			for (var p in this._data[name].parameters) {
				for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
						if (this._data[name].parameters[p].data[i].selected) {
							this._data[name].parameters[p].data[i].t += dt;
							this._data[name].parameters[p].data[i].value += dv[p];
						}
				}
				this._data[name].parameters[p].data.sort(this._keyframeCompare);
			}
			this.trigger(this._data);
		}

	},

	onStartMovingSelectedKeyframes(name="") {
		name = this._selectVTIcon(name);
		this._saveStateForUndo();
	},

	/**
	* Delete Keyframes
	*/

	onDeleteSelectedKeyframes(name="") {
		name = this._selectVTIcon(name);

		LogStore.actions.log("VTICON_DELETEKEYFRAMES_"+name);

		var kfNotSelected = function(value) {
			return !value.selected;
		};

		this._saveStateForUndo();

		for (var p in this._data[name].parameters) {
			this._data[name].parameters[p].data = this._data[name].parameters[p].data.filter(kfNotSelected);
			if (this._data[name].parameters[p].data.length == 0) {
				//can't have an empty keyframe track, create new keyframe
				var new_id = this._getNewKFUID(p);
				var new_t = this._data[name].duration/2;
				//assign a midway value
				var new_value = (this._data[name].parameters[p].valueScale[0] + this._data[name].parameters[p].valueScale[1])/2; 

				this._data[name].parameters[p].data.push({
					id:new_id,
					t:new_t,
					value:new_value,
					selected:false
				});
			}
		}

		this.trigger(this._data);
	},

	onSimplifyKeyframes(name="") {
		// right now scales between first and last selected point
		// TODO add this to a in/outpoint framework
		// var inpoint = 0;
		// var outpoint = 100;

		var kfNotSelected = function(value) {
			return !value.selected;
		};
		var kfSelected = function(value) {
			return value.selected;
		};

		var compare = function (a, b) {
		  if (a.t < b.t) {
		    return -1;
		  }
		  if (a.t > b.t) {
		    return 1;
		  }
		  // a must be equal to b
		  return 0;
		}


		name = this._selectVTIcon(name);

		LogStore.actions.log("VTICON_SIMPLIFYKEYFRAMES_"+name);

		this._saveStateForUndo();

		for (var p in this._data[name].parameters) {
			// for(var i = 3; )
			var keep = this._data[name].parameters[p].data.filter(kfNotSelected);
			var simplify = this._data[name].parameters[p].data.filter(kfSelected).filter(function(e,i,arr){
				if (i % 2 == 0 || i == arr.length - 1) {
					return true;
				} else {
					return false;
				}
			});
			this._data[name].parameters[p].data = keep.concat(simplify).sort(compare);
		}

		this.trigger(this._data);
	},

	onXScaleKeyframes(scaleFactor,name="") {

		var kfNotSelected = function(value) {
			return !value.selected;
		};
		var kfSelected = function(value) {
			return value.selected;
		};

		var compare = function (a, b) {
		  if (a.t < b.t) {
		    return -1;
		  }
		  if (a.t > b.t) {
		    return 1;
		  }
		  // a must be equal to b
		  return 0;
		}

		name = this._selectVTIcon(name);

		LogStore.actions.log("VTICON_XSCALEKEYFRAMES_"+name);

		this._saveStateForUndo();

		for (var p in this._data[name].parameters) {
			
			var originalPoints = this._data[name].parameters[p].data.sort(compare)
			// middle is selected points
			var middle = originalPoints.filter(kfSelected);

			if (middle.length > 0) {
				var start_i = originalPoints.indexOf(middle[0])
				var end_i = originalPoints.indexOf(middle[middle.length - 1])
				var end_t = middle[middle.length - 1].t
				var start_t = middle[0].t


				var start = originalPoints.slice(0,start_i);
				var end = originalPoints.slice(end_i + 1,originalPoints.length);
				// m is keyframe
				// i is index of keyframe in arr
				// arr is the array of keyframes, i.e. middle
				middle.forEach(function(m,i,arr){
					m.t = Math.floor(m.t + ((m.t - start_t) * scaleFactor));
				})

				var end_pos = middle[middle.length - 1].t;
				
				end.forEach(function(e){
					e.t = (e.t - end_t) + end_pos
				})

				var ret = start.concat(end).concat(middle).sort(compare).filter(function(kf){
					if (kf.t > this._defaultParams.duration) {
						return false;
					} else {
						return true;
					}
				}.bind(this));
				this._data[name].parameters[p].data = ret;
			}
		}

		this.trigger(this._data);
	},

onInvertKeyframes(scaleFactor,name="") {

		var kfNotSelected = function(value) {
			return !value.selected;
		};
		var kfSelected = function(value) {
			return value.selected;
		};

		var compare = function (a, b) {
		  if (a.t < b.t) {
		    return -1;
		  }
		  if (a.t > b.t) {
		    return 1;
		  }
		  // a must be equal to b
		  return 0;
		}

		name = this._selectVTIcon(name);

		LogStore.actions.log("VTICON_INVERTKEYFRAMES_"+name);

		this._saveStateForUndo();

		for (var p in this._data[name].parameters) {
			
			var originalPoints = this._data[name].parameters[p].data.sort(compare)
			// middle is selected points
			var middle = originalPoints.filter(kfSelected);

			if (middle.length > 0) {
				var start_i = originalPoints.indexOf(middle[0])
				var end_i = originalPoints.indexOf(middle[middle.length - 1])
				var end_t = middle[middle.length - 1].t
				var start_t = middle[0].t

				var start = originalPoints.slice(0,start_i);
				var end = originalPoints.slice(end_i + 1,originalPoints.length);
				var maxVal = this._data[name].parameters[p].valueScale[1];
				// m is keyframe
				// i is index of keyframe in arr
				// arr is the array of keyframes, i.e. middle
				middle.forEach(function(m,i,arr){
					
					m.value =  maxVal - m.value;
				}.bind(this))


				var ret = start.concat(end).concat(middle).sort(compare);
				this._data[name].parameters[p].data = ret;
			}
		}

		this.trigger(this._data);
	},
	/**
	 * KF Guards
	 */
	 _isValidKeyframePosition(parameter, t, v, name="") 
	 {
	 	name = this._selectVTIcon(name);
	 	var valid = false;

	 	if(t >= 0 && t <= this._data[name].duration)
	 	{
	 		var min = Math.min(this._data[name].parameters[parameter].valueScale[0], this._data[name].parameters[parameter].valueScale[1]);
	 		var max = Math.max(this._data[name].parameters[parameter].valueScale[0], this._data[name].parameters[parameter].valueScale[1]);

	 		if (v >= min &&
	 			v <= max)
	 		{
	 			valid = true;
	 		}
	 	}
	 	return valid;
	 },


	 /**
	 * Undo/Redo
	 */

	 _copyState() {
	 	//TODO: Make this more general, right now it's very brittle
	 	var state = {};
	 	for (name in this._data)
	 	{
	 		state[name] = {};
	 		state[name].duration = this._data[name].duration;
	 		state[name].selectedTimeRange = this._data[name].selectedTimeRange;
	 		state[name].selected = this._data[name].selected;
		 	state[name].parameters = {};
		 	for (var p in this._data[name].parameters)
		 	{
		 		state[name].parameters[p] = {};
		 		state[name].parameters[p].valueScale = this._data[name].parameters[p].valueScale;
		 		state[name].parameters[p].data = [];
		 		for (var i = 0; i < this._data[name].parameters[p].data.length; i++)
		 		{
		 			var d = this._data[name].parameters[p].data[i];
		 			state[name].parameters[p].data.push({
		 				t:d.t,
		 				value:d.value,
		 				selected:d.selected,
		 				id:d.id
		 			});
		 		}
		 	}

	 	}
	 	

	 	return state;
	 },

	 _hasStateChanged() {
	 	var rv = true;
	 	//TODO: Make this less brittle
	 	if (this._previousStates.length > 0) {
	 		rv = false;
	 		var pState = this._previousStates[this._previousStates.length-1];

	 		for (var name in this._data)
	 		{
	 			if (this._data[name].duration != pState.duration)
		 		{
		 			rv = true;
		 		}

			 	for (var p in this._data[name].parameters)
			 	{
			 		if (this._data[name].parameters[p].valueScale != pState[name].parameters[p].valueScale)
			 		{
			 			rv = true;
			 		}

			 		if (this._data[name].parameters[p].data.length != pState[name].parameters[p].data.length)
			 		{
			 			rv = true;
			 		} else {
			 			for (var i = 0; i < this._data[name].parameters[p].data.length; i++)
				 		{
				 			var d = this._data[name].parameters[p].data[i];
				 			var pd = pState[name].parameters[p].data[i];
				 			if (d.t != pd.t || d.value != pd.value || d.id != pd.id)
				 			{
				 				rv = true;
				 			}
				 		}
			 		}
			 	}

	 		}

	 	}
	 	return rv;
	 },

	 _saveStateForUndo() {
	 	if (this._hasStateChanged())
	 	{
		 	this._previousStates.push(this._copyState());
		 	this._nextStates = [];	
	 	}
	 },

	 onUndo() {
	 	if (this._previousStates.length > 0 )
	 	{
			LogStore.actions.log("UNDO");
	 		this._nextStates.push(this._copyState());
	 		this._data = this._previousStates.pop();
	 		this.trigger(this._data);
	 	}
	 },

	 onRedo() {
	 	if (this._nextStates.length > 0 )
	 	{
			LogStore.actions.log("REDO");
	 		this._previousStates.push(this._copyState());
	 		this._data = this._nextStates.pop();
	 		this.trigger(this._data);
	 	}

	 },

	 //for resetting to init data settings
	 onReset() {
	 	this._data = {

					main: deepCopy(this._defaultParams),
					example: deep(this._defaultParams),
						
					};

					this.trigger(this._data);
	 }, 

	/**
	* KFUID helper functions
	*/

	//returns a new, unique, kfid
	_getNewKFUID(parameter) {
		this._kfuidCount  += 1;
		return this._kfuidCount;
	},

	//compares two keyframes
	_keyframeCompare(a, b) {
		return (a.t - b.t);
	}



	});


// recursive function to clone an object. If a non object parameter
// is passed in, that parameter is returned and no recursion occurs.
function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    var temp = obj.constructor(); // give temp the original obj's constructor
    for (var key in obj) {
        temp[key] = deepCopy(obj[key]);
    }
 
    return temp;
}

module.exports = {
	actions:vticonActions,
	store:vticonStore
};

