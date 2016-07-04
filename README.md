# Macaron
Vibrotactile Icon Editor

### Mouse commands:
`double click` : add a keyframe  
`click`+`drag` : box select  
`shift`+`click` : add keyframe to selection  

### Fun keyboard shortcuts:  
#### General:  
`arrow keys` : move playhead left or right.  
`-`/`delete` : remove selected keyframe(s)  

#### Windows: 

`ctrl`+(`>`/`<`) : x-scale  
`ctrl`+`/` : simplifies selected keyframe points by removing half of them.  
`ctrl`+(`left`/`right`) : increment playhead  
`ctrl`+`i` : invert selected keyframes  
`ctrl`+`c` : copy  
`ctrl`+`v` : paste (at playhead)  
`ctrl`+`shift`+`i`  open console (Chrome shortcut)

#### OSX: 
`cmd`+(`>`/`<`) : x-scale  
`cmd`+`/` : simplifies selected keyframe points by removing half of them.  
`cmd`+(`left`/`right`) : increment playhead  
`cmd`+`i` : invert selected keyframes  
`cmd`+`c` : copy  
`cmd`+`v` : paste (at playhead)  
`cmd`+`shift`+`c` : open console (Chrome shortcut)

#### Changelog:

2016.05.31 : added a random noise parameter.  
2016.05.31 : changed simplify shortcut from ctrl+s to ctrl+/ because ctrl+s also saves the page.  
2016.05.30 : added x-scale functionality with ctrl-< and ctrl->, where selected points are scaled, and the rest are translated.  
2016.05.30 : added a simplify functionality with ctrl-s, where points are decimated by half  

##

## Quick install:

0. Make sure you have [node][nodejs] and [NodeJS Package Manager (NPM)][npm] in your path. You can install node [here][https://nodejs.org/en/].

1. Clone the git repository by opening a terminal window and navigating to a directory of your choise and typing `git clone https://github.com/ubcspin/MacaronBit.git`

2. If you are on mac or linux rename "package[mac_use_this].json" -> "package.json". If you are on windows, rename "package[windows_use_this].json" -> "package.json".

3. In terminal, navigate into the newly cloned MacaronBit folder and type `npm install`.

## Running Macaron Bit:

1. Open a terminal window, navigate to /MacaronBit, and type `npm run dev`.

2. While the server is running, open a *new* terminal window, navigate to /MacaronBit, and type `npm start`.

3. Open a web browser and navigate to `localhost:8080`.

### Build Environment

Macaron requires the following libraries:

 - [React][react]
 - [NodeJS tools][nodejs]
 - [NodeJS Package Manager (NPM)][npm]
 - [Webpack][webpack]
 - [d3][d3]
 - [reflux][reflux]

Begin by installing [NPM][npm] for your OS. Once NPM is installed, install react as follows:

 - `npm install react --save`
 - `npm install react-file-input --save`

and install webpack:

 - `npm install -g webpack`
 - `npm i webpack --save-dev`
 - `npm i webpack-dev-server --save`

and the JSX syntax handler:

- `npm install babel-loader --save-dev`

You will also need to install the following libraries:

- [d3][d3]: `npm install d3 --save`
- [reflux][reflux]: `npm install reflux --save`
- [firebase][firebase]: `npm install firebase --save`

And you will need two custom loaders for webpack, to import Audiolet, a non-NPM library contained in `thirdparty/audiolet`:

 - `npm install imports-loader --save`
 - `npm install script-loader --save`

 As well, the following two loaders for loading CSS stylesheets:

 - `npm install style-loader css-loader --save-dev`

You'll need this for websockets:

- `npm install socket.io --save`
- `npm install express --save`

And this to talk to the Arduino:

- `npm install johnny-five --save`

Now, you can build the environment with `npm run deploy`.
Note that there are two packages for windows and mac users: "package[mac use this].json", and "package[windows use this].json". Rename the package corresponding to your OS to "package.json". Also note that .gitignore has been updated to ignore "package.json", so if you are adding packages...beware!

Make sure the Arduino is loaded up with StandardFirmata (Examples > Firmata > Standard Firmata). The Bit should be plugged in as follows:

- Data pin (usually orange or yellow) : 9
- High/positive (usually red) : 5V
- Low/negative/ground (usually black or brown) : any GND

You can start serving on `localhost:8080` with `node server`.

[nodejs]: http://nodejs.org
[npm]: https://www.npmjs.org
[react]: http://facebook.github.io/react/
[webpack]: http://webpack.github.io
[d3]: http://d3js.org
[reflux]: https://github.com/spoike/refluxjs
[firebase]: https://www.firebase.com


###Setting up the Arduino

![wiring diagram](https://raw.githubusercontent.com/ubcspin/MacaronBit/master/images/wiring_diagram.jpg)

Power pin can be any 3-6V source. Ground pin must be common with the microcontroller, i.e., you can use any ground as long as it is connected to an Arduino ground. Data pin must be one of the PWM pins on the Arduino. In this case, it’s pin 10.
