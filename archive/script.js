console.clear();

// instigate our audio context

// for cross browser
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// load some sound
const audioElement = document.querySelector('audio');
const track = audioCtx.createMediaElementSource(audioElement);

const playButton = document.querySelector('.play');

// play pause audio
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

// if track ends
audioElement.addEventListener('ended', () => {
	playButton.dataset.playing = 'false';
	playButton.setAttribute( "aria-checked", "false" );
}, false);

// Biquad Filter
const biquadFilterOptions = {type: 'lowpass', frequency: 6};
const biquadFilter = new BiquadFilterNode(audioCtx, biquadFilterOptions);

const biquadFilterControl = document.querySelector('[data-action="filter"]');
biquadFilterControl.addEventListener('input', function() {
	biquadFilter.frequency.value = this.value;
}, false);

// connect our graph
track.connect(biquadFilter).connect(audioCtx.destination);


// Track credit: Outfoxing the Fox by Kevin MacLeod under Creative Commons 




