import Reflux from 'reflux';

var LogStore = require('./logstore.js');
var VTIconStore = require('./vticonstore.js');
var PlaybackStore = require('./playbackstore.js');
var Parameters = require('../classes/parameters.js');
var params = new Parameters();
var EXAMPLE_KEY = "example"; //TODO: More general?


// var sineExample = function(frequency, duration, dt) {
//   var rv = {};
//   rv.duration = duration;
//   rv.selected=false;
//   rv.selectedTimeRange={
//             active:false,
//             time1:0,
//             time2:0
//           };

//   rv.parameters = params.getParameters()

//   for (var t = 0; t < duration; t+=dt)
//   {

//     rv.parameters.amplitude.data.push(
//       {
//         t:t,
//         value:Math.sin(2*Math.PI*frequency*t/1000 - Math.PI/2*frequency)/2.0+0.5
//       });
//   }

//   return rv;
// };

var examples = {
  //sineExample: sineExample(1, 3000, 25)
  paulsExample: params.getParameters()
}

var exampleActions = Reflux.createActions(
  [
    'selectExample'
  ]);


var exampleStore = Reflux.createStore({

  listenables: [exampleActions],

  init() { 
    this._data = { 
      selected:"test1",  
      examples:examples 
    };
  },

  getInitialState() {
    return this._data;
  },

  onSelectExample(newName) { 
    var foundName = "";
    for (var ex in this._data.examples) {
      if (ex === newName)
      {
        foundName = ex;
      }
    }

    if (foundName != "")
    {
      this._data.selected=foundName;
      for (var ex in this._data.examples) {
        this._data.examples[ex].selected = (ex === foundName);
      }
      VTIconStore.actions.setVTIcon(this._data.examples[foundName], name=EXAMPLE_KEY);
      PlaybackStore.actions.setTime(0);
      LogStore.actions.log("EXAMPLE_SELECT_"+foundName); //this causes a firebase error that we probably have to check for in there
    }

    this.trigger(this._data);
  }

});


module.exports = {
  actions:exampleActions,
  store:exampleStore
};

