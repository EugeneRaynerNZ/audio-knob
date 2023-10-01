let knobPositionX;
let knobPositionY;
let mouseX;
let mouseY;
let knobCenterX;
let knobCenterY;
let adjacentSide;
let oppositeSide;
let currentRadiansAngle;
let getRadiansInDegrees;
let finalAngleInDegrees;
let tickHighlightPosition;
let filterValue = 1;
const filterKnob = document.getElementById("knob");
const boundingRectangle = filterKnob.getBoundingClientRect(); // Get the bounding rectangle of the knob (x, y, width, height)

// For cross-browser support
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Load some sound
const audioElement = document.querySelector('audio');
const track = audioCtx.createMediaElementSource(audioElement);

// Create biquad filter and set initial value
const biquadFilter = audioCtx.createBiquadFilter();
biquadFilter.type = "lowpass";
biquadFilter.frequency.value = filterValue;



function main() {
    addEventListeners();
    connectPlayButton();
    track.connect(biquadFilter).connect(audioCtx.destination);
}

function addEventListeners() {
    filterKnob.addEventListener(getMouseDown(), onMouseDown); // Listen for mouse button click
    document.addEventListener(getMouseUp(), onMouseUp); // Listen for mouse button release
}

function connectPlayButton() {
    const playButton = document.querySelector('.play');
    playButton.addEventListener('click', function () {
        handlePlayButtonClick(this);
    }, false);
}

function handlePlayButtonClick(button) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (button.dataset.playing === 'false') {
        audioElement.play();
        button.dataset.playing = 'true';
        button.innerHTML = 'Stop';
    } else if (button.dataset.playing === 'true') {
        audioElement.pause();
        button.dataset.playing = 'false';
        button.innerHTML = 'Play';
    }

    let state = button.getAttribute('aria-checked') === "true" ? true : false;
    button.setAttribute('aria-checked', state ? "false" : "true");
}

// On mouse button down
function onMouseDown() {
    document.addEventListener(getMouseMove(), onMouseMove); // Start drag
}

// On mouse button release
function onMouseUp() {
    document.removeEventListener(getMouseMove(), onMouseMove); // Stop drag
    console.log(biquadFilter)
}

// Compute mouse angle relative to the center of the filter knob
function onMouseMove(event) {
    updateKnobPosition(event);
    computeRotationAngle();
}

function updateKnobPosition(event) {
    knobPositionX = boundingRectangle.left; // Get knob's global x position
    knobPositionY = boundingRectangle.top; // Get knob's global y position
    mouseX = event.pageX; // Get mouse's x global position
    mouseY = event.pageY; // Get mouse's y global position
    knobCenterX = boundingRectangle.width / 2 + knobPositionX; // Get global horizontal center position of the knob relative to mouse position
    knobCenterY = boundingRectangle.height / 2 + knobPositionY; // Get global vertical center position of the knob relative to mouse position
    adjacentSide = knobCenterX - mouseX; // Compute adjacent value of the imaginary right-angle triangle
    oppositeSide = knobCenterY - mouseY; // Compute opposite value of the imaginary right-angle triangle
}

function computeRotationAngle() {
    currentRadiansAngle = Math.atan2(adjacentSide, oppositeSide);
    getRadiansInDegrees = currentRadiansAngle * 180 / Math.PI; // Convert radians into degrees
    finalAngleInDegrees = -(getRadiansInDegrees - 135); // Knob is already starting at -135 degrees due to visual design, so 135 degrees needs to be subtracted to compensate for the angle offset (negative value represents clockwise direction)

    // Only allow rotation if the angle is greater than or equal to 0 degrees and less than or equal to 270 degrees
    if (finalAngleInDegrees >= 0 && finalAngleInDegrees <= 271) {
        filterKnob.style.transform = "rotate(" + finalAngleInDegrees + "deg)"; // Use dynamic CSS transform to rotate the filter knob

        // Calculate the filter setting based on the rotation angle
        let filterSetting = Math.floor(finalAngleInDegrees / (270 / 100));
        biquadFilter.frequency.value = filterSetting * 50;
        document.getElementById("frequencyValue").innerHTML = `${filterSetting}%`; // Update the filter text
    }
}

// Detect mobile devices
function detectMobile() {
    const result = (navigator.userAgent.match(/(iphone)|(ipod)|(ipad)|(android)|(blackberry)|(windows phone)|(symbian)/i));

    if (result !== null) {
        return "mobile";
    } else {
        return "desktop";
    }
}

function getMouseDown() {
    return detectMobile() === "desktop" ? "mousedown" : "touchstart";
}

function getMouseUp() {
    return detectMobile() === "desktop" ? "mouseup" : "touchend";
}

function getMouseMove() {
    return detectMobile() === "desktop" ? "mousemove" : "touchmove";
}

main();
