var knobPositionX;
var knobPositionY;
var mouseX;
var mouseY;
var knobCenterX;
var knobCenterY;
var adjacentSide;
var oppositeSide;
var currentRadiansAngle;
var getRadiansInDegrees;
var finalAngleInDegrees;
var tickHighlightPosition;
var startingTickAngle = -135;
var tickContainer = document.getElementById("tickContainer");
var volumeKnob = document.getElementById("knob");
var boundingRectangle = volumeKnob.getBoundingClientRect(); //get rectangular geometric data of knob (x, y, width, height)

// for cross browser
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// load some sound
const audioElement = document.querySelector('audio');
const track = audioCtx.createMediaElementSource(audioElement);

const playButton = document.querySelector('.play');

const biquadFilterOptions = {type: 'lowpass'};
const biquadFilter = new BiquadFilterNode(audioCtx, biquadFilterOptions);
biquadFilter.gain.value = 25;

function main()
{
    volumeKnob.addEventListener(getMouseDown(), onMouseDown); //listen for mouse button click
    document.addEventListener(getMouseUp(), onMouseUp); //listen for mouse button release
}

//on mouse button down
function onMouseDown()
{
    document.addEventListener(getMouseMove(), onMouseMove); //start drag
}

playButton.addEventListener('click', function() {
	
    // check if context is in suspended state (autoplay policy)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    if (this.dataset.playing === 'false') {
        audioElement.play();
        this.dataset.playing = 'true';
    // if track is playing pause it
    } else if (this.dataset.playing === 'true') {
        audioElement.pause();
        this.dataset.playing = 'false';
    }
    
    let state = this.getAttribute('aria-checked') === "true" ? true : false;
    this.setAttribute( 'aria-checked', state ? "false" : "true" );
    
}, false);

//on mouse button release
function onMouseUp()
{
    document.removeEventListener(getMouseMove(), onMouseMove); //stop drag
}

//compute mouse angle relative to center of volume knob
//For clarification, see my basic trig explanation at:
//https://www.quora.com/What-is-the-significance-of-the-number-pi-to-the-universe/answer/Kevin-Lam-15
function onMouseMove(event)
{
    knobPositionX = boundingRectangle.left; //get knob's global x position
    knobPositionY = boundingRectangle.top; //get knob's global y position

    mouseX = event.pageX; //get mouse's x global position
    mouseY = event.pageY; //get mouse's y global position
    
    knobCenterX = boundingRectangle.width / 2 + knobPositionX; //get global horizontal center position of knob relative to mouse position
    knobCenterY = boundingRectangle.height / 2 + knobPositionY; //get global vertical center position of knob relative to mouse position

    adjacentSide = knobCenterX - mouseX; //compute adjacent value of imaginary right angle triangle
    oppositeSide = knobCenterY - mouseY; //compute opposite value of imaginary right angle triangle

    //arc-tangent function returns circular angle in radians
    //use atan2() instead of atan() because atan() returns only 180 degree max (PI radians) but atan2() returns four quadrant's 360 degree max (2PI radians)
    currentRadiansAngle = Math.atan2(adjacentSide, oppositeSide);

    getRadiansInDegrees = currentRadiansAngle * 180 / Math.PI; //convert radians into degrees

    finalAngleInDegrees = -(getRadiansInDegrees - 135); //knob is already starting at -135 degrees due to visual design so 135 degrees needs to be subtracted to compensate for the angle offset, negative value represents clockwise direction

    //only allow rotate if greater than zero degrees or lesser than 270 degrees
    if(finalAngleInDegrees >= 0 && finalAngleInDegrees <= 270)
    {
        volumeKnob.style.transform = "rotate(" + finalAngleInDegrees + "deg)"; //use dynamic CSS transform to rotate volume knob

        //270 degrees maximum freedom of rotation / 100% volume = 1% of volume difference per 2.7 degrees of rotation
        volumeSetting = Math.floor(finalAngleInDegrees / (270 / 100));

        biquadFilter.frequency.value = volumeSetting;

        track.connect(biquadFilter).connect(audioCtx.destination);

        console.log(volumeSetting * 200)

        document.getElementById("volumeValue").innerHTML = volumeSetting + "%"; //update volume text
    }
}

//detect for mobile devices from https://www.sitepoint.com/navigator-useragent-mobiles-including-ipad/
function detectMobile()
{
    var result = (navigator.userAgent.match(/(iphone)|(ipod)|(ipad)|(android)|(blackberry)|(windows phone)|(symbian)/i));

    if(result !== null)
    {
        return "mobile";
    } else {
        return "desktop";
    }
}

function getMouseDown()
{
    if(detectMobile() == "desktop")
    {
        return "mousedown";
    } else {
        return "touchstart";
    }
}

function getMouseUp()
{
    if(detectMobile() == "desktop")
    {
        return "mouseup";
    } else {
        return "touchend";
    }
}

function getMouseMove()
{
    if(detectMobile() == "desktop")
    {
        return "mousemove";
    } else {
        return "touchmove";
    }
}

main();