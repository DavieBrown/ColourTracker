
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var chalk = require('chalk');
var app = express();
var gpio = require('rpi-gpio');
// There's 2 different mappings which can be used for the pins.
gpio.setMode(gpio.MODE_BCM);
var COLOURS_FILE = path.join(__dirname, 'colours.json');
app.set('port', (process.env.PORT || 3500));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// These are the pin numbers which shoukd be configured for the rgb
var red = 18;
var green = 23;
var blue = 24;s


var buzzer = 22;
// The delay between buzzer 'beeps' - ms
var buzzerDelay = 10;
// The count of timeswe've beeped
var buzzCount = 0;
// the maximum number of beeps.
var buzzCountMax   = 100;

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always geSt the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/colours/off', function(req, res) {
  turnOffRgb();
});

app.get('/api/colours', function(req, res) {
  fs.readFile(COLOURS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/colours', function(req, res) {
  fs.readFile(COLOURS_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var colours = JSON.parse(data);
    var newColour = {
      id: Date.now(),
      red: req.body.red,
      green: req.body.green,
      blue: req.body.blue
    };

    //setUpPins(chooseWhichToLight, newColour);
    setUpPinsDisco(flashLights);
    colours.push(newColour);

    // TODO: This isn't safe to read and write to this file. Change to use db.
    fs.writeFile(COLOURS_FILE, JSON.stringify(colours, null, 4), function(err) {
      if (err) {
        console.error(err);
        // release lock - there's been an error.
        release();
        process.exit(1);
      }
      res.json(colours);
    });
  });
});


unexportPins = function() {
    gpio.destroy(function() {
        console.log('All pins unexported');
    });
}

setUpPinsDisco = function(argCallBack)
{
  gpio.setup(red, gpio.DIR_OUT);
  gpio.setup(green, gpio.DIR_OUT);
  // We've finished setting up the pins so supply the callback function.
  gpio.setup(blue, gpio.DIR_OUT, function() {
    if(argCallBack && typeof argCallBack == "function")
    {
      argCallBack();
    }
  });
}

setUpPins = function(argCallBack, argParams) {


  gpio.setup(red, gpio.DIR_OUT);
  gpio.setup(green, gpio.DIR_OUT);
  // We've finished setting up the pins so supply the callback function.
  gpio.setup(blue, gpio.DIR_OUT, function() {
    if(argCallBack && typeof argCallBack == "function")
    {
      argCallBack(argParams);
    }
  });
}

chooseWhichToLight = function(argNewColour)
{
  console.log('Choosing which to light:');

  if ( (argNewColour.red == 0)
      && (argNewColour.green == 0)
      && (argNewColour.blue == 0) )
  {
    turnOffRgb();
  }
  else
  {
    // Work out which value is at the max so we can light up this colour.
    var lvMax = Math.max(Math.max(argNewColour.red, argNewColour.green), argNewColour.blue);

    // Make sure we're lighting up any colours which are at the max
    if(lvMax == argNewColour.red)
    {
      lightUpRed();
    }

    if(lvMax == argNewColour.blue)
    {
      lightUpBlue();
    }

    if(lvMax == argNewColour.green)
    {
      lightUpGreen();
    }
  }

  // Make the buzzer sound (for a defined time) - this is an indicator that we've just changed.
  gpio.setup(buzzer, gpio.DIR_OUT, buzzerOn);

}

switchOffAllThen = function (argCallBack)
{
  gpio.write(red, 0);
  gpio.write(green, 0);
  gpio.write(blue, 0);

  if(argCallBack && typeof argCallBack == "function")
  {
    argCallBack();
  }
}


flashLights = function()
{
  // Every 3 seconds we want to cycle through and change the lights

  setInterval(function(){
    // Note that it is imperative we use callbacks. The framework is asynchrnous so
    // we need to guarantee the previous state before triggering a new one.
    setTimeout(function(){ switchOffAllThen(LightUpRed);  }, 0);
    setTimeout(function(){ switchOffAllThen(lightUpGreen); }, 1000);
    setTimeout(function(){ switchOffAllThen(lightUpBlue);}, 2000);
  }, 3000);
}




lightUpRed = function()
{
  gpio.write(red, 1, function(){
    console.log(chalk.red.bold('Red lit'));
  });
}

lightUpGreen = function()
{
  gpio.write(green, 1, function(){
    console.log(chalk.green.bold('Green lit'));
  });
}

lightUpBlue = function()
{

  gpio.write(blue, 1, function(){
    console.log(chalk.blue.bold('Blue lit'));
  });
}


lightUpAll = function()
{

  gpio.write(red, 1, function(){
    gpio.write(green, 1, function(){
      gpio.write(blue, 1, function(){
        console.log(chalk.white.bold('All lit'));
      });
    });
  });
}


turnOffRgb = function()
{

    gpio.setup(red, gpio.DIR_OUT, closePin(red));
    gpio.setup(green, gpio.DIR_OUT, closePin(green));
    gpio.setup(blue, gpio.DIR_OUT, closePin(blue));

}

turnOffBuzzer = function()
{
    gpio.setup(buzzer, gpio.DIR_OUT, closePin(buzzer));
}

closePin = function(argPinNum)
{
  gpio.write(argPinNum, 0);
}




function buzzerOn() {

    // Check the count to see if we shouldn't be buzzing.
    if (buzzCount >= buzzCountMax) {

        turnOffBuzzer();
        // reset the count so we can start it again.
        buzzCount = 0;
        return;
    }
      //console.log(buzzCount);
    setTimeout(function() {
        gpio.write(buzzer, 1, buzzerOff);
        buzzCount += 1;
    }, buzzerDelay);
}

function buzzerOff() {
    setTimeout(function() {
        gpio.write(buzzer, 0, buzzerOn);
    }, buzzerDelay);
}

app.listen(app.get('port'), function() {
  try {
    unexportPins();
    // By default make sure the rgb is off.
    turnOffRgb();
    turnOffBuzzer();
    console.log(chalk.white.bgRed.bold('Colour server listening: http://localhost:%d/') + ' you ran as sudo - right?', app.get('port'));
  } catch (e) {
    //TODO: check formatting
    console.log('Exception: %s', e.message);
  } finally {

  }


});
