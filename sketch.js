//let referenceImg; //Pictures to be copied

let scaleFactor = 1;//set window scale to 1 max
let imgSize = 500;
let padding = 150; 

//An array used to store the circular area 
//of ​​the main body and its decorate of the screen
let basicCircles = []; //basic circle parts 
let ringFills = [];    //Line ring decoration of the core
let pinkCurveSet;      //Pink curve
let innerDotRings = [];//Dot ring decoration of the core
let dotRings = [];     //Dot ring decoration of the body to edge of circle
let spokeRings = [];   //Spoke rings decoration

//An array of chains that fill the gaps between circles
let chains = [];

// Store loaded audio
let sounds = [];

// Define the main clock
let masterBPM = 120;
let beatInterval = 60 / masterBPM; // Duration of one beat in seconds
let startTime; 
let lastBeatChecked = 0; // used for beat checking
let audioStarted = false;

//each position dot color map
const dotRingColorMap = {
//line one
  "71,64"   : "#231775",
  "366,-3"  : "#F11006",
//line two
  "19,204"  : "#231775", 
  "169,177" : "#177822", 
  "319,137" : "#CC90DF", 
  "475,101" : "#073575",
//line three
  "-20,353" : "#0C9482", 
  "280,278" : "#D0363F",
  "428,242" : "#EC660F",
//line four
  "80,458"  : "#F31D14",
  "230,423" : "#D8196D",
  "370,390" : "#207AB9",
//line five
  "335,530" : "#F23C32",
  "480,510" : "#5CC272"
};

function preload() {
// referenceImg = loadImage('image/Group_Pic.jpg');
// originally used to store artwork during the group’s code iteration
// Now it's used to store audio
// all music assets are sourced from the free audio site https://www.bandlab.com/
  sounds = [
    loadSound("audio/808_120BPM_Dm_Fight_bass_120BPM_Dminor_BANDLAB.MP3"),
    loadSound("audio/Afflecks_120_Perc_4bars_percussion_120BPM_BANDLAB.MP3"),
    loadSound("audio/CowboyCandy_SportsChant_120_C_Vox_voice_120BPM_Cmajor_BANDLAB.MP3"),
    loadSound("audio/DirtBreaks_120bpm_ShuffleDrums_4bar_drum_120BPM_BANDLAB.MP3"),
    loadSound("audio/DirtyRecords_Horror1_120_Drums8_beats_120BPM_BANDLAB.MP3"),
    loadSound("audio/Elm_120_Fm_Vocal_8bars_female-vocals_120BPM_Fminor_BANDLAB.MP3"),
    loadSound("audio/FRBDRNB_Section_120_C_Pad_pad_120BPM_Cmajor_BANDLAB.MP3"),
    loadSound("audio/HappySounds_120bpm_Drums_drum_120BPM_BANDLAB.MP3"),
    loadSound("audio/KPOL_VoxWelcome_120_Em_Vocals_1_female-vocals_120BPM_Eminor_BANDLAB.MP3"),
    loadSound("audio/MUHH_Yeahboy_120_Bm_Full_Track_sample_120BPM_Bminor_BANDLAB.MP3"),
    loadSound("audio/NightVibes_120_Drums13_6bar_drum_120BPM_BANDLAB.MP3"),
    loadSound("audio/PiccadillyExpress_120_Cm_Bass_4bars_bass_120BPM_Cminor_BANDLAB.MP3"),
    loadSound("audio/Swallow_120_C_Guitar_02_4bars_guitar_120BPM_Cmajor_BANDLAB.MP3"),
    loadSound("audio/TLPG_120_Eb_Electric_Guitar_3_4bars_guitar_120BPM_E♭major_BANDLAB.MP3"),
    loadSound("audio/TLPG_120_Eb_Electric_Guitar_6_4bars_guitar_120BPM_E♭major_BANDLAB.MP3"),
    loadSound("audio/TrapPiper_Squared_120_Fm_Flutes_woodwinds_120BPM_Fminor_BANDLAB.MP3"),
    loadSound("audio/Travisty_Stub_120_Bm_Pad_8bar_pad_120BPM_Bminor_BANDLAB.MP3")
  ] ;
}

function setup() {
  createCanvas(imgSize * 2 + padding, imgSize);
  //referenceImg.resize(imgSize, imgSize); // make both 500
  //noLoop(); // Delete this line to enable animation
  
  //set circle and its docoration
  setupCircle();
  setupDotRings();
  setupInnerDotRings()
  setupSpokeRings();
  setupRingFill()
  setupPinkCurveSet();
  
  //set chain
  setupChains();
  
  // Set up the association between decorations and their corresponding circles
  linkDecorationsToCircles();
}

function draw() {
  background(255);
  scale(scaleFactor);

  if (audioStarted) {
    checkPendingTracks();
  }

  // Draw static elements 
  noStroke();
  fill('#2D5574');
  rect(0, 0, imgSize, imgSize);
  for (let ch of chains) ch.display();

  // Draw all interactive circles
  for (let basicCircle of basicCircles) {
    basicCircle.update();
    basicCircle.display();
  }

  // Draw UI elements (outside the main loop) 
  noStroke();
  fill(255);
  rect(imgSize, 0, padding, imgSize);

  if (!audioStarted) {
    fill(0);
    textAlign(CENTER, CENTER);
    text("Click to start audio", imgSize / 2, imgSize / 2);
  }
}

//window resize
function windowResized() {
  const availableWidth = windowWidth;
  scaleFactor = min(availableWidth / (imgSize * 2 + padding), 1);
  resizeCanvas(windowWidth, imgSize * scaleFactor);
  redraw();
}

// Detect mouse press
// If the audio context is not running, resume it and record the start time
// Then handle any interaction with circles 
function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
    startTime = getAudioContext().currentTime;
    audioStarted = true;
  }
  handleCircleClick();
}

// Handle mouse click on circles
function handleCircleClick() {
  for (let i = basicCircles.length - 1; i >= 0; i--) { // Loop through the basicCircles array in reverse order
    const bc = basicCircles[i];
    // Calculate the distance between the mouse position and the circle's center
    const d = dist(mouseX / scaleFactor, mouseY / scaleFactor, bc.x, bc.y);
    // If the mouse is within the circle's outer radius
    if (d < bc.outerRadius) {
      // Trigger the circle's click handler with the corresponding sound
      bc.handleClick(sounds[i]);
      break;// Stop checking after the first match
    }
  }
}

// Check and activate pending tracks based on the current beat
function checkPendingTracks() {
  let currentTime = getAudioContext().currentTime;
  let currentBeat = floor((currentTime - startTime) / beatInterval);

  if (currentBeat > lastBeatChecked) {
    lastBeatChecked = currentBeat;

    // Find all circles that are pending playback
    const pendingCircles = basicCircles.filter(bc => bc.state === 'PENDING');
    for (let pendingCircle of pendingCircles) {
      pendingCircle.state = 'PLAYING';
      const index = basicCircles.indexOf(pendingCircle);
      if (sounds[index]) {
        // Calculate the time for the next beat
        let nextBeatTime = startTime + (currentBeat + 1) * beatInterval;
        // Set up and start the audio loop
        sounds[index].playMode('sustain');
        sounds[index].loop();
        console.log(`Track ${index} has synced and is now playing.`);
      }
    }
  }
}


// Link each circle to its corresponding decorative elements
function linkDecorationsToCircles() {
  for (let bc of basicCircles) {
    bc.linkedDotRing = dotRings.find(d => d.x === bc.x && d.y === bc.y);
    bc.linkedInnerDotRing = innerDotRings.find(d => d.x === bc.x && d.y === bc.y);
    bc.linkedSpokeRing = spokeRings.find(s => s.x === bc.x && s.y === bc.y);
    bc.linkedRingFill = ringFills.find(rf => rf.x === bc.x && rf.y === bc.y);
  }
}

//Set function for each part
function setupCircle(){ // basic circle positon, core color and main color set
//layout reference up to down, left to right
//line one 
  basicCircles.push(new BasicCircle(71, 64, 0, 'w'));
  basicCircles.push(new BasicCircle(217, 27, 0 ));
  basicCircles.push(new BasicCircle(366, -3, 0, 'w'));
//line two
  basicCircles.push(new BasicCircle(19, 204, 1));
  basicCircles.push(new BasicCircle(169, 177, 0, 'w'));
  basicCircles.push(new BasicCircle(319, 137, 1));
  basicCircles.push(new BasicCircle(475, 101, 1));
//line three
  basicCircles.push(new BasicCircle(-20, 353, 0, 'w'));
  basicCircles.push(new BasicCircle(125, 318, 1));
  basicCircles.push(new BasicCircle(280, 278, 0, 'w'));
  basicCircles.push(new BasicCircle(428, 242, 0, 'w'));
//line four
  basicCircles.push(new BasicCircle(80, 458, 0, 'w'));
  basicCircles.push(new BasicCircle(230, 423, 1));
  basicCircles.push(new BasicCircle(370, 390, 1));
  basicCircles.push(new BasicCircle(515, 367, 0));
//line five
  basicCircles.push(new BasicCircle(335, 530, 1, 'w'));
  basicCircles.push(new BasicCircle(480, 510, 1, 'w'));
}

function setupDotRings() {//Dot set for main area
  const skip = new Set(['217,27', '125,318', '515,367']); //skip drawing these position

  //Traverse all basic circles and generate DotRing
  for (const bc of basicCircles) { 
    if (skip.has(bc.x + ',' + bc.y)) continue;

    //According to map to set each position's color
    const col = dotRingColorMap[bc.x + ',' + bc.y];
    dotRings.push(
      new DotRing(
        bc.x, bc.y,
        bc.innerRadius, bc.outerRadius,
        5, 6, col
      )
    );
  }
}

function setupSpokeRings() {//Spoke Rings setting
  const rings = [
    // spoke in main area
    { x: 217, y: 27, inner: 35, outer: 70, col: "#EE1D02" },  // spoke in main area
    { x: 125, y: 318, inner: 35, outer: 70, col: "#EE1D02" },
    { x: 515, y: 367, inner: 35, outer: 70, col: "#EE1D02" },
    // spoke in core area
    { x: 280, y: 278, inner: 10, outer: 35, col: "#FD603A" }, 
  ];

  //set each spoke ring according to above data
  for (const r of rings) {
    spokeRings.push(new SpokeRing(r.x, r.y, r.inner, r.outer, 40, 2, r.col));
  }
}

function setupInnerDotRings() {//Set dot in core part, include pos and col
  innerDotRings.push(new DotRing(217, 27, 15, 35, 3, 6, '#FA5F21'));
  innerDotRings.push(new DotRing(19, 204, 15, 35, 3, 6, '#FA5F21'));
  innerDotRings.push(new DotRing(475, 101, 15, 35, 3, 6, '#F5DCF4'));
  innerDotRings.push(new DotRing(125, 318, 15, 35, 3, 6, '#F01318'));
  innerDotRings.push(new DotRing(335, 530, 15, 35, 3, 6, '#5CB677'));
}

function setupRingFill(){//set core line ring pos and col
  ringFills.push(new RingFill(71, 64, 'g'));
  ringFills.push(new RingFill(169, 177,'r'));
  ringFills.push(new RingFill(319, 137, 'b'));
  ringFills.push(new RingFill(428, 242, 'g'));
  ringFills.push(new RingFill(80, 458, 'b'));
  ringFills.push(new RingFill(370, 390, 'r'));
  ringFills.push(new RingFill(515, 367, 'g'));
}

function setupPinkCurveSet() {//set pink curve pos
  const curvePairs = [
    [[ 71,  64], [100, 146]],
    [[169, 177], [245, 119]],
    [[-10, 353], [ 52, 301]],
    [[370, 300], [280, 278]],
    [[366,  -3], [451,  28]],
    [[428, 242], [496, 180]],
    [[ 80, 458], [176, 481]]
  ];
  pinkCurveSet = new PinkCurveSet(curvePairs, 35);
}

function setupChains() {//set each chain pos, step num, step size
//line1
  chains.push(new ChainLink([5,3], [-10,114], 5, 4));
  chains.push(new ChainLink([131,4], [160,91], 6, 6));
  chains.push(new ChainLink([-10,114], [89,147], 4, 4));
  chains.push(new ChainLink([160,91], [89,147], 4, 5));
  chains.push(new ChainLink([160,91], [230,113], 3, 6));
  chains.push(new ChainLink([297,55], [230,113], 4, 5));
  chains.push(new ChainLink([297,55], [287,-10], 4, 5));
  chains.push(new ChainLink([297,55], [387,80], 5, 3));
  chains.push(new ChainLink([469,0], [387,80], 7, 6));
//line2
  chains.push(new ChainLink([101,232], [89,147], 4, 5));
  chains.push(new ChainLink([101,232], [40,289], 4, 6));
  chains.push(new ChainLink([-11,277], [40,289], 4, 6));
  chains.push(new ChainLink([101,232], [189,263], 5, 3));
  chains.push(new ChainLink([256,195], [189,263], 4, 5));
  chains.push(new ChainLink([256,195], [230,113], 3, 6));
  chains.push(new ChainLink([256,195], [345,220], 4, 4));
  chains.push(new ChainLink([405,155], [345,220], 5, 5));
  chains.push(new ChainLink([405,155], [387,80], 3, 9));
  chains.push(new ChainLink([405,155], [500,190], 4, 4));
//line 3
chains.push(new ChainLink([63,375], [40,289], 3, 5));
chains.push(new ChainLink([63,375], [0,435], 5, 2));
chains.push(new ChainLink([0,490], [0,435], 1, 4));
chains.push(new ChainLink([63,375], [147,402], 4, 3));
chains.push(new ChainLink([207,338], [147,402], 4, 4));
chains.push(new ChainLink([207,338], [189,263], 3, 5));
chains.push(new ChainLink([207,338], [290,362], 4, 6));
chains.push(new ChainLink([360,305], [290,362], 5, 2));
chains.push(new ChainLink([360,305], [345,220], 3, 4));
chains.push(new ChainLink([360,305], [435,330], 4, 6));
chains.push(new ChainLink([498,283], [435,330], 2, 6));
//line4
chains.push(new ChainLink([170,495], [147,402], 4, 5));
chains.push(new ChainLink([308,444], [290,362], 4, 2));
chains.push(new ChainLink([308,444], [253,510], 4, 4));
chains.push(new ChainLink([170,495], [253,510], 4, 4));
chains.push(new ChainLink([308,444], [399,475], 4, 2));
chains.push(new ChainLink([450,430], [399,475], 3, 3));
chains.push(new ChainLink([450,430], [435,330], 4, 2));
chains.push(new ChainLink([450,430], [513,440], 4, 2));
chains.push(new ChainLink([405,510], [399,475], 3, 3));
}






class BasicCircle {
  constructor(x, y, colorFlag = 0, outerType = '') {
    this.x = x;
    this.y = y;
    this.outerRadius = 70;
    this.innerRadius = 35;
    this.colorFlag = colorFlag;
    this.outerType = outerType;

    this.state = 'INACTIVE';
    this.currentAngle = 0;
    this.rotationSpeed = 0.01;

    this.linkedDotRing = null;
    this.linkedInnerDotRing = null;
    this.linkedSpokeRing = null;
    this.linkedRingFill = null;
  }

  update() {
    if (this.state === 'PLAYING') {
      // Calculate rotation speed based on BPM so that one full rotation equals one beat
      this.rotationSpeed = TWO_PI / (60 / masterBPM * 60); // Convert to rotation angle per frame
      this.currentAngle += this.rotationSpeed;
    }
  }

  display() {
    // Draw base circles (static part)
    noStroke();
    const outerFill = this.outerType === 'w' ? '#ffffff' : '#FEA80F';
    fill(outerFill);
    circle(this.x, this.y, this.outerRadius * 2);

    fill('#A9639C');
    circle(this.x, this.y, this.innerRadius * 2);

    // Draw rotating decorations (dynamic part) 
    if (this.linkedRingFill) this.linkedRingFill.display(this.currentAngle);
    if (this.linkedInnerDotRing) this.linkedInnerDotRing.display(this.currentAngle);
    if (this.linkedDotRing) this.linkedDotRing.display(this.currentAngle);
    if (this.linkedSpokeRing) this.linkedSpokeRing.display(this.currentAngle);

    // Draw topmost core circle and mask
    const ringFillColor = this.colorFlag === 0 ? '#00cc66' : '#cc3333';
    stroke(0);
    strokeWeight(6);
    fill(ringFillColor);
    circle(this.x, this.y, 20);

    noStroke();
    fill(150);
    circle(this.x, this.y, 10);

    // Draw gray overlay 
    if (this.state === 'PENDING') {
      fill(100, 100, 100, 150);
      noStroke();
      circle(this.x, this.y, this.outerRadius * 2);
    }
  }

  handleClick(sound) {
    switch (this.state) {
      case 'INACTIVE': {
        const isAnyPlaying = basicCircles.some(bc => bc.state === 'PLAYING');
        if (isAnyPlaying) {
          this.state = 'PENDING';
          this.pendingStartTime = millis();
          this.waitDuration = 2000;
        } else {
          this.state = 'PLAYING';
          this.currentAngle = 0;
          sound.loop();
        }
        break;
      }

      case 'PLAYING':
        this.state = 'INACTIVE';
        sound.stop();
        break;

      case 'PENDING':
        this.state = 'INACTIVE';
        break;
    }
  }
}




class RingFill {//set line ring circle logic
  constructor(x, y, colorFlag = 'r', innerRadius = 10, outerRadius = 35, count = 5) {
    this.x = x;
    this.y = y;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.count = count; //Number of rings

    //Set stroke color based on flag , g is green b is blue
    if (colorFlag === 'g') {
      this.color = color(0, 204, 102); // green
    } else if (colorFlag === 'b') {
      this.color = color(0, 102, 255); // blue
    } else {
      this.color = color(255, 51, 51); // red as default
    }
  }

  // Modify the display method to accept a rotation angle parameter, with a default value
  display(rotationAngle = 0) { //draw a the ring outlines
    push();
    translate(this.x, this.y); // Move the origin to the center of the circle
    rotate(rotationAngle);      // Rotate the coordinate system
    noFill();
    stroke(this.color);
    strokeWeight(3);
    for (let i = 0; i < this.count; i++) {
      let r = map(i, 0, this.count - 1, this.innerRadius, this.outerRadius);
      circle(0, 0, r * 2);
    }
    pop();
  }
}

class PinkCurveSet {//set pink curve log
  constructor(curvePairs, offset = 40) {
    this.curvePairs = curvePairs; //List of point pairs
    this.offset     = offset; //point vertical offset
  }

  //Draw pink curve between two points using quadratic curve
  drawPinkCurve(start, end) {
    const [x1, y1] = start;
    const [x4, y4] = end;
    const midX = (x1 + x4) / 2;
    const midY = (y1 + y4) / 2;

    //Flip control direction for specific pairs
    const downSet = new Set([
      '71,64,100,146',
      '80,458,176,481',
      '366,-3,451,28'
    ]);

    //Compute pos to define curve bending
    const key = `${x1},${y1},${x4},${y4}`;
    const dir = downSet.has(key) ? +this.offset : -this.offset;
    const ctrlY = midY + dir;
    const ctrlX = midX - Math.sign(x4 - x1) * this.offset;

    //using quadraticVertex
    // We learned about this code through interaction with the teacher in class,
    //  and decided to use it after checking the p5.js website and interacting with chatgpt.
    // The princeple itself is to use two coordinates for the starting point,
    // two coordinates for the stretching position,
    // and two coordinates for the end point.
    push();
    stroke(255, 28, 90);
    strokeWeight(5);
    strokeCap(ROUND);
    noFill();

    beginShape();
    vertex(x1, y1); //Start point
    quadraticVertex(ctrlX, ctrlY, x4, y4);
    endShape();

    pop();
  }
}


class DotRing {//set dot circle logic
  constructor(
    x,
    y,
    innerR,
    outerR,
    rows = 5,
    dotDiam = 6,
    col = '#05127E'
  ) {
    this.x = x;
    this.y = y;
    this.innerR = innerR;
    this.outerR = outerR;
    this.rows = rows;
    this.dotDiam = dotDiam;
    this.col = col;
  }

  display(rotationAngle = 0) {
    push();
    translate(this.x, this.y);
    rotate(rotationAngle);
    noStroke();
    fill(this.col);
    for (let i = 0; i < this.rows; i++) {
      const r = lerp(this.innerR + this.dotDiam / 2, this.outerR - this.dotDiam / 2, i / (this.rows - 1));
      const numDots = floor((TWO_PI * r) / (this.dotDiam * 1.6));
      for (let j = 0; j < numDots; j++) {
        const ang = (TWO_PI * j) / numDots;
        circle(r * cos(ang), r * sin(ang), this.dotDiam);
      }
    }
    pop();
  }
}

class SpokeRing {//set spoke ring logic
  constructor(
    x, y,
    innerR, outerR,
    nSpikes = 50,
    sw = 2,
    col = '#FF9933'
  ) {
    this.x = x;
    this.y = y;
    this.innerR = innerR;
    this.outerR = outerR;
    this.nSpikes = nSpikes;
    this.sw = sw;
    this.col = col;
  }

  display(rotationAngle = 0) {
    push();
    translate(this.x, this.y);
    rotate(rotationAngle);
    noFill();
    stroke(this.col);
    strokeWeight(this.sw);
    strokeCap(ROUND);
    strokeJoin(ROUND);
    const totalVerts = this.nSpikes * 2;
    const step = TWO_PI / totalVerts;
    beginShape();
    for (let i = 0; i < totalVerts; i++) {
      const ang = i * step;
      const radius = i % 2 === 0 ? this.outerR - this.sw : this.innerR + this.sw;
      vertex(radius * cos(ang), radius * sin(ang));
    }
    endShape(CLOSE);
    pop();
  }
}

//Chain Part
//Chain Part
//Chain Part
//Chain Part
class ChainLink {
  constructor(p1, p2, steps = 6, thickness = 5) {
    this.p1 = createVector(...p1); // vector from first endpoint
    this.p2 = createVector(...p2); // vector from second endpoint
    this.steps = steps;            // how many step between two point
    this.thickness = thickness;    // step size
  }

  display() {
    //Prepare ellipse chain direction and size info
    let dir = p5.Vector.sub(this.p2, this.p1);
    let totalDist = dir.mag();
    let segmentLength = totalDist / this.steps;
    let ellipseWidth = segmentLength; 

    //Loop to draw ellipse chain links
    for (let i = 0; i < this.steps; i++) {
      let t = (i + 0.5) / this.steps;
      let pos = p5.Vector.lerp(this.p1, this.p2, t);
      push();

      //Make sure the connection fill ellipse orientation shape is correct
      translate(pos.x, pos.y);
      rotate(dir.heading());
      stroke('#D26728');
      strokeWeight(1.5);
      fill(random(255), random(255), random(255));
      ellipse(0, 0, ellipseWidth, this.thickness);
      pop();
    }
    // draw anchor dots at both ends
    this.drawAnchorDot(this.p1);
    this.drawAnchorDot(this.p2);
  }
  //anchor dot drawing Para
  drawAnchorDot(p) {
    noStroke();
    fill('#DE6E2C');
    circle(p.x, p.y, 15);
    stroke(0);
    strokeWeight(2);
    fill(255);
    circle(p.x, p.y, 10);
  }
}
