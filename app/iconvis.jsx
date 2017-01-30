
import React from 'react';
import Reflux from 'reflux';
import d3 from 'd3';

var TimelineMixin = require('./util/timelinemixin.js');
var WaveformPathMixin = require('./util/waveformpathmixin.js');

var VTIconStore = require('./stores/vticonstore.js');
var DragStore = require('./stores/dragstore.js');

{ /* var io = require('socket.io-client/socket.io') */}
var io = require('./../thirdparty/socket/socket.io.js');

var IconVis = React.createClass({
	getInitialState: function(){
		return{
			socket:{}
		}
	},
	loadPosition : function(setPoints) {
		// still a stub
		var points = setPoints.map(function(p,i){
			var obj = {
				selected : false,
				t: i * 34,
				value: p 
			}
			return obj;
		});

		var parameter_keyframe_map = {
			position: points,
		};

		VTIconStore.actions.newMultipleKeyframes(parameter_keyframe_map);
		console.log("loaded position");
		
	},
	componentDidMount: function(){
		var socket = io.connect("http://localhost:3000");
		socket.on("process_buffer_done",function(){
			socket.emit("get_setPoints")
		})
		socket.on("send_setPoints",function(msg){
			this.loadPosition(msg);
		}.bind(this))
		this.setState({socket:socket});
	},
	emit: function(st,msg) {
		this.state.socket.emit(st,msg)
	},
	mixins : [
		TimelineMixin("divWrapper"),
		WaveformPathMixin,
		Reflux.listenTo(VTIconStore.store,"onVTIconChange")
	],
	propTypes: {
		vticon : React.PropTypes.object.isRequired,
		currentTime: React.PropTypes.number.isRequired,
		keyframeCircleRadius: React.PropTypes.number.isRequired,
		playheadFill: React.PropTypes.string.isRequired,
		interpolateParameters: React.PropTypes.func.isRequired,
		name : React.PropTypes.string.isRequired,
		selection : React.PropTypes.object.isRequired
	},
	getDefaultProps: function() {
	    return {
	      height: 100, //was 25
	      width:'100%',
	      visColor:'#4C4233',
	      background:"#FAFAFA",
	      resolution:3000,
	      maxFrequencyRendered:125,
	      limitFrequencies:true,
  	      selectionColor:'#676767',
	      selectionOpacity:0.2,
  	      selectable:false, //was false
	  	  logValues:false
	    }
	},

	onVTIconChange: function(vticon) {
	 	var scaleY = d3.scale.linear()
                    .domain( [-1, 1]) // return value from sine
                    .range([0, this.props.height]);
        var scaleX = this.props.scaleX;
        this._visPath = this.computePositionPath(
							this.props.vticon,
							scaleX, 
							scaleY,
							this.props.resolution
        )
		var actual_height = this.props.height / 2;

		if (this.props.logValues) {
			
			var the_path = {
				range: actual_height,
				path: this._visPath,
				name: this.props.name
			}
			this.emit('path', the_path);
		}
	},
	onMouseDown: function(e) {
		VTIconStore.actions.selectVTIcon(this.props.name);
		if(this.props.selectable) {
			DragStore.actions.startTimeSelectDrag(this.props.name);
		}
	},

	render : function() {
		var divStyle = {
			height:this.props.height,
			width:this.props.width,
			background:this.props.background
		};

        var scaleY = d3.scale.linear()
                    .domain( [-1, 1]) // return value from sine
                    .range([0, this.props.height]);

        var scaleX = this.props.scaleX;

		//current time vis
		//TODO: put this in a seperate location
		var currentTimeLineFunc = d3.svg.line()
								.x(function(d) {
									return d[0]
								})
								.y(function(d) {
									return d[1]
								});
		var currentTimePath = currentTimeLineFunc([
						[scaleX(this.props.currentTime), 0],
						[scaleX(this.props.currentTime), this.props.height]
				]);

		var playheadLine = <path />;
		if(this.props.vticon.selected) {
			playheadLine = <path stroke={this.props.playheadFill} strokeWidth="2" fill="none" d={currentTimePath} />;
		}


		var selectable = this.props.selectable;
		//selection square
		var selectionSquare = <rect />;
		if(selectable && this.props.vticon.selectedTimeRange.active) {
			var tLeft = this.props.vticon.selectedTimeRange.time1;
			var tRight = this.props.vticon.selectedTimeRange.time2;
			if(tLeft > tRight) {
				tLeft = this.props.vticon.selectedTimeRange.time2;
				tRight = this.props.vticon.selectedTimeRange.time1;
			}

			var x = scaleX(tLeft);
			var y = 0;
			var width = scaleX(tRight) - x;
			var height = this.props.height;

			selectionSquare = <rect
				x={x}
				y={y}
				width={width}
				height={height}
				fill={this.props.selectionColor}
				opacity={this.props.selectionOpacity} />
		}

		return (
			<div ref="divWrapper" style={divStyle} onMouseDown={this.onMouseDown}>
				<svg height="100%" width="100%">
					<path stroke={this.props.visColor} strokeWidth="0.5" fill="none" d={this._visPath} />
					{playheadLine}
					{selectionSquare}
				</svg>

			</div>
			);
	}

});

module.exports = IconVis;
