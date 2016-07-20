
import React from 'react';
import Reflux from 'reflux';



var AnimationStore = require('./stores/animationstore.js');
var StudyStore = require('./stores/studystore.js');
var SaveLoadStore = require('./stores/saveloadstore.js');
var LogStore = require('./stores/logstore.js');


var UserAgreement = require('./useragreement.jsx');
var UserInstructions = require('./userinstructions.jsx');


var io = require('socket.io-client/socket.io');

var FileInput = require('react-file-input');

//for reset button
var VTIconStore = require('./stores/vticonstore.js');



var unshuffledBehaviours = [{title:"Behaviour b91",filename:"atEase.crumb"},
							{title:"Behaviour zvn",filename:"atRest.crumb"},
							{title:"Behaviour cbn",filename:"attentive.crumb"},
							{title:"Behaviour km4",filename:"bored.crumb"},
							{title:"Behaviour 2f2",filename:"calm.crumb"},
							{title:"Behaviour 54n",filename:"determined.crumb"},
							{title:"Behaviour 28l ",filename:"droopy.crumb"},
							{title:"Behaviour 2fp ",filename:"drowsy.crumb"},
							{title:"Behaviour agr ",filename:"dull.crumb"},
							{title:"Behaviour zoq ",filename:"enthusiastic.crumb"},
							{title:"Behaviour bua ",filename:"excited.crumb"},
							{title:"Behaviour ktk ",filename:"guilty.crumb"},
							{title:"Behaviour ne9 ",filename:"hostile.crumb"},
							{title:"Behaviour h57 ",filename:"nervous.crumb"},
							{title:"Behaviour 8tl ",filename:"proud.crumb"},
							{title:"Behaviour wvj ",filename:"relaxed.crumb"},
							{title:"Behaviour xe0 ",filename:"scared.crumb"},
							{title:"Behaviour ke7 ",filename:"serene.crumb"},
							{title:"Behaviour 6uw ",filename:"sluggish.crumb"},
							{title:"Behaviour ud2 ",filename:"upset.crumb"}]

//randomizes an array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


var shuffledBehaviours = shuffle(unshuffledBehaviours);


var EditorHeader = React.createClass({



	getInitialState: function(){
		return{
			socket:{}
		}
	},
	emit: function(st,msg) {
		this.state.socket.emit(st,msg)
	},
	componentDidMount: function() {
		var socket = io.connect("http://localhost:3000");
		this.setState({socket:socket});
		socket.on("sendCrumb",function(crumbFile){
			this.renderCrumb(crumbFile)}.bind(this));
		socket.emit("saveBehaviourArray",shuffledBehaviours)

		

	},
	mixins : [
				Reflux.connect(AnimationStore.store, 'animation'), //emitted updates go to 'animation' key
				Reflux.connect(StudyStore.store, 'study'), //emitted updates go to 'study' key

			],

	propTypes: {
			},

	getDefaultProps: function() {
	    
	    return {
	    	displayAnimation:false,
	    	displayInterfaceMode:false, //was false
	    	displaySaveButton:false,
	    	displayStartButton:false,
			displayTestButton:false,
			displayRenderButton:false,
			displayStopButton:false,
			displayResetButton:false,
			displayGetSetPointsButton:false,
			displayLoadVoodleButton:false,
			uploadFileID:"uploadedFile",
			uploadVoodleFileID: "voodleFile",
			behaviours : shuffledBehaviours
			



	    }
	},


	logButtonOrder: function(array){
		console.log("logButtonOrder called");
		this.emit("saveBehaviourArray",array).bind(this);
	},

	renderCrumb: function(crumbData) {
		console.log("renderCrum called! ")

			VTIconStore.actions.setVTIcon(crumbData, "main");
			this._onRenderClick();
	},

	_onAnimationChange: function(val) {
		AnimationStore.actions.setAnimation(val.target.value);
	},

	_onDisplayModeChange: function(val) {
		StudyStore.actions.setDisplayMode(val.target.value);
	},

	_onStartClick : function(e) {
		LogStore.actions.log("START_TASK");
	},

	_onSaveClick : function(e) {
		SaveLoadStore.actions.save();
	},


	_onLoadButtonClick : function(e) {
		document.getElementById(this.props.uploadFileID).click();
	},

	_onLoadClick : function(e) {
		var uploadedFiles = document.getElementById(this.props.uploadFileID);
		console.log("uploadedFiles: ",uploadedFiles.value)
		console.log('normal _onLoadClick uploaded file: ',uploadedFiles.files[0].name)
		if (uploadedFiles.files.length > 0) {
			console.log("Hey buddy here's the uploaded file you asked for thanks talk soon: ", uploadedFiles.files[0]);
			SaveLoadStore.actions.loadMacaronFile(uploadedFiles.files[0]);
		}
		uploadedFiles.value = [];
	},
	_loadCrumb : function(crumbFile) {
		this.emit('getCrumb',crumbFile);
		
	},

	_onTestClick : function(e) {
		this.emit('test');
	},

	_onRenderClick : function(e) {
		console.log("_onRenderClick called!!")
		this.emit('render');
	},

	_onStopClick : function(e) {
		this.emit('stop_render');
	},

	_onResetClick : function(e) {
		VTIconStore.actions.reset();
	},
	_onGetSetPointsClick : function(e) {
		this.emit('get_setPoints');
	},

	_onLoadSetPointsClick: function(e){

		console.log('in _onLoadSetPointsClick!')
		var uploadedFiles = document.getElementById(this.props.uploadVoodleFileID);
		console.log('uploadedFiles: ',uploadedFiles)
		if (uploadedFiles.files.length > 0) {
			console.log('name of file: ',uploadedFiles.files[0].name)
			this.emit('load_setPoints',uploadedFiles.files[0].name)

		}
		uploadedFiles.value = [];

	},
	_onLoadSetPointsButtonClick: function(e){
		console.log('in _onLoadSetPoints~BUTTON~Click')
		document.getElementById(this.props.uploadVoodleFileID).click();
	},
	handleChange: function(event) {
	   console.log('Selected file:', event.target.files[0].name);
	   name = event.target.files[0].name
	   if(name != undefined){
	   		console.log('we are emitting!!!!')
	   		this.emit('load_setPoints', name);

	   	}
	 },
	/**
	* Rendering
	*
	*/

	render : function() {

		var headerStyle = {
		};

		var blockStyle = {
           display: 'block',
           /*padding: '10px 10px 10px 10px'*/
           height: '25px'
           
		};

		var animationOptions = this.state.animation.animationOptions;
		var displayOptions = this.state.study.modes;
		var animationChangeCallback = this._onAnimationChange;
		var displayChangeCallback = this._onDisplayModeChange;
		var selectedAnimation = this.state.animation.animation;
		var selectedDisplayMode = this.state.study.currentMode;


		var buttonStyle = {
			marginLeft:'0.5em',
			marginRight:'0.5em',
			className:'unselectable',
			fontSize:12
		};

		//The UBC Logo to be placed next to the title
        // var logo = new Image();
        // logo.src = require("../img/macaron-logo.png");
        // logo.style = "width:60px;height:71px;";
        // logo.alt = "Example Image Location";

        // var logoDisplay = <h8><img src={logo.src} alt={logo.alt} style={logo.style}/></h8>;

		var animationOptionDisplay = <span />
		if (this.props.displayAnimation)
		{
			animationOptionDisplay = (<select className="animationoptions unselectable" onChange={animationChangeCallback}>
					{animationOptions.map( (animationOption) => (
						<option value={animationOption} selected={animationOption==selectedAnimation}>{animationOption}</option>
						))}
				</select>);
		}

		var interfaceModeDisplay = <span />
		if (this.props.displayInterfaceMode)
		{
			interfaceModeDisplay = (<select className="displayoptions unselectable" onChange={displayChangeCallback}>
					{Object.keys(displayOptions).map( (displayOption) => (
						<option value={displayOption} selected={displayOption==selectedDisplayMode}>{displayOption}</option>
						))}
				</select>);
		}

		var startButton = <span />
		if (this.props.displayStartButton)
		{
			startButton = (<button onClick={this._onStartClick}>Start</button>);
		}

		var saveButton = <span />
		if (this.props.displaySaveButton)
		{
			saveButton = (<a class="btn header" style={buttonStyle} onClick={this._onSaveClick} ><i className="fa fa-download"></i>Save</a>);
			//saveButton = (<button onClick={this._onSaveClick}><i class="fa fa-download"></i>Finish</button>);
		}

		var loadButton = <span />
		if (this.props.displaySaveButton)
		{
			// loadButton = (<a class="btn header" style={buttonStyle} onClick={this._onLoadClick} ><i className="fa fa-upload"></i> Load</a>);

			loadButton = (<span>
					<input type="file" className="hidden" id={this.props.uploadFileID} onChange={this._onLoadClick}></input>
					<a class="btn header" style={buttonStyle} onClick={this._onLoadButtonClick} ><i className="fa fa-upload"></i>Load</a>
					</span>);
		}

		var testButton = <span />
		if (this.props.displayTestButton)
		{
			testButton = (<button onClick={this._onTestClick}>Test</button>);
		}

		var renderButton = <span />
		if (this.props.displayRenderButton){
			var renderButton = <button className="crumbFile" onClick={this._onRenderClick}>Render</button>
		}


		var stopButton = <span />
		if (this.props.displayStopButton)
		{
			stopButton = (<button onClick={this._onStopClick}>Stop</button>);
		}

		var resetButton = <span />
		if (this.props.displayResetButton)
		{
			resetButton = (<button onClick={this._onResetClick}>Reset</button>);
		}
		var getSetPointsButton = <span />
		if (this.props.displayGetSetPointsButton)
		{
			getSetPointsButton = (<button onClick={this._onGetSetPointsClick}>Render set points</button>);
		}	

		var loadVoodleButton = <span />
		if (this.props.displayLoadVoodleButton)
		{
			

			loadVoodleButton = (<span>
					<input type="file" className='hidden' id={this.props.uploadVoodleFileID} onChange={this._onLoadSetPointsClick}></input>
					<a class="btn header" style={buttonStyle} onClick={this._onLoadSetPointsButtonClick} ><i className="fa fa-upload"></i>Load Voodle</a>
					</span>);
		}

		var behaviourComponents = this.props.behaviours.map(behaviour => {
    	        return <a className="crumbFile" onClick={this._loadCrumb.bind(this,behaviour.filename)}>{behaviour.title}</a>;
    	    });

		return (
			
			<div>

			

			<div className="header" style={headerStyle}>
				<center>
				<span className="title unselectable" onload={this._loadCrumb.bind(this,"nothing")}> Behaviour player </span><p /></center>
				
				{interfaceModeDisplay}
				{saveButton}
				{loadButton}
				{testButton}
				{renderButton}
				{startButton}
				{stopButton}
				{resetButton}
				{getSetPointsButton}
				{loadVoodleButton}
				{behaviourComponents}

		
			</div>
				
		
		</div>
			
			);
	}

});










module.exports = EditorHeader;
