
import React from 'react';
import d3 from 'd3';

var PlaybackStore = require('./stores/playbackstore.js');
var VTIconStore = require('./stores/vticonstore.js');

var io = require('./../thirdparty/socket/socket.io.js');
var socket = io.connect("http://localhost:3000");

var ControlBar = React.createClass({

	propTypes: {
		name : React.PropTypes.string.isRequired,
		playing: React.PropTypes.bool.isRequired,
		mute: React.PropTypes.bool.isRequired
			},

	getDefaultProps: function() {
	    return {
	      width:'100%',
	      background:'lightgrey',
	      fontSize: "20pt",


	    }
	},


	/**
	* Event handlers
	* 
	*/
	_onMuteClick : function (event) {
		PlaybackStore.actions.toggleMute();
	},

	_onPlayClick : function (event) {
		VTIconStore.actions.selectVTIcon(this.props.name);
		PlaybackStore.actions.togglePlaying();
		console.log("_onRenderClick called!!")
		socket.emit('render');
	},

	_onSkipBackwardClick : function (event) {
		VTIconStore.actions.selectVTIcon(this.props.name);
		PlaybackStore.actions.skipBackward();
	},

	_onSkipForwardClick : function (event) {
		VTIconStore.actions.selectVTIcon(this.props.name);
		PlaybackStore.actions.skipForward();
	},

	/**
	* Rendering
	* 
	*/

	render : function() {

		var divStyle = {
			height:this.props.height,
			width:this.props.width,
			background:this.props.background,
			fontSize:this.props.fontSize,
			className:'unselectable'
		};

		var timeControlStyle  = {
			marginLeft:'auto',
			marginRight:'auto',
			textAlign:'center'
		};

		var buttonStyle = {
			marginLeft:'0.5em',
			marginRight:'0.5em',
			className:'unselectable'
		};

		var iconText = "fa fa-play";
		if (this.props.playing) {
			iconText = "fa fa-pause";
		}

		return (
			<div className="controlbar" style={divStyle}>
				<div className="time-control" style={timeControlStyle}>
					
					 
					 
				</div>	
			</div>
			);
	}

});

module.exports = ControlBar;