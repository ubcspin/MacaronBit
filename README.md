# Macaron
Vibrotactile Icon Editor


### Fun keyboard shortcuts:

`arrow keys` : move playhead left or right.  
`ctrl`+(`>`/`<`) : x-scale  
`ctrl`+`/` : Divides selected keyframes in half.  
`space` : play.  
`backspace`/`delete` : remove selected keyframe(s)  
`ctrl`+(`left`/`right`) : increment playhead  


#### Changelog:

2016.05.31 : added a random noise parameter.  
2016.05.31 : changed simplify shortcut from ctrl+s to ctrl+/ because ctrl+s also saves the page.  
2016.05.30 : added x-scale functionality with ctrl-< and ctrl->, where selected points are scaled, and the rest are translated.  
2016.05.30 : added a simplify functionality with ctrl-s, where points are decimated by half  

##

Quick install:

`npm install`

`npm run deploy`

Run with:

`node server.js`

## Build Environment

Macaron requires the following libraries:

 - [React][react]
 - [NodeJS tools][nodejs]
 - [NodeJS Package Manager (NPM)][npm]
 - [Webpack][webpack]
 - [d3][d3]
 - [reflux][reflux]

Begin by installing [NPM][npm] for your OS. Once NPM is installed, install react as follows:

 `npm install react --save`

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
