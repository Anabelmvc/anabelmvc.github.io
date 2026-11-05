/* =========================================================
   Little pixel cat that wanders along the bottom of the page.
   It walks to a random spot, sits for a while, then walks on.
   Click it and it hops. Used on home2.html and index.html.
========================================================= */
(function () {
  // Pixel drawings, facing right. "#" = cat, "." = empty.
  var FRAMES = {
    walkA: [
      '............#..#',
      '............####',
      '#...........#.##',
      '.#..############',
      '.##############.',
      '..############..',
      '..##........##..',
      '..#.#......#.#..'
    ],
    walkB: [
      '............#..#',
      '............####',
      '.#..........#.##',
      '.#..############',
      '.##############.',
      '..############..',
      '...##......##...',
      '...##.....#..#..'
    ],
    sit: [
      '...........#..#.',
      '...........####.',
      '...........#.##.',
      '..........#####.',
      '.........######.',
      '........#######.',
      '..#.....#######.',
      '...############.'
    ]
  };

  var PIXEL = 3;                 // size of one "pixel" on screen
  var COLOR = '#000000';         // black cat, to show on the beige site
  var SPEED = 55;                // walking speed in px per second
  var W = 16 * PIXEL, H = 8 * PIXEL;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.title = 'meow';
  canvas.style.cssText =
    'position:fixed;left:0;bottom:10px;z-index:150;width:' + W + 'px;height:' + H + 'px;' +
    'image-rendering:pixelated;cursor:pointer;will-change:transform;';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  function draw(name) {
    var rows = FRAMES[name];
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = COLOR;
    for (var y = 0; y < rows.length; y++) {
      for (var x = 0; x < rows[y].length; x++) {
        if (rows[y][x] === '#') ctx.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL);
      }
    }
  }

  var x = Math.random() * Math.max(0, window.innerWidth - W);
  var target = x;
  var facing = 1;               // 1 = right, -1 = left
  var state = 'sit';
  var sitUntil = performance.now() + 1500;
  var hop = 0;                  // hop height while jumping
  var hopStart = 0;
  var last = performance.now();
  var stepTimer = 0;
  var frame = 'sit';

  function pickTarget() {
    var maxX = Math.max(0, window.innerWidth - W);
    target = Math.random() * maxX;
    facing = target > x ? 1 : -1;
    state = 'walk';
  }

  function place() {
    canvas.style.transform =
      'translate(' + Math.round(x) + 'px,' + Math.round(-hop) + 'px) scaleX(' + facing + ')';
  }

  canvas.addEventListener('click', function () {
    hopStart = performance.now();
  });

  window.addEventListener('resize', function () {
    var maxX = Math.max(0, window.innerWidth - W);
    if (x > maxX) x = maxX;
    if (target > maxX) target = maxX;
  });

  function tick(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // Hop: a short jump arc after a click
    if (hopStart) {
      var t = (now - hopStart) / 450;
      if (t >= 1) { hop = 0; hopStart = 0; }
      else hop = Math.sin(t * Math.PI) * 18;
    }

    if (state === 'walk') {
      var dist = target - x;
      var step = SPEED * dt;
      if (Math.abs(dist) <= step) {
        x = target;
        state = 'sit';
        sitUntil = now + 2000 + Math.random() * 5000;
        frame = 'sit';
      } else {
        x += step * facing;
        stepTimer += dt;
        if (stepTimer > 0.16) {
          stepTimer = 0;
          frame = frame === 'walkA' ? 'walkB' : 'walkA';
        }
      }
    } else if (now > sitUntil && !reduceMotion) {
      pickTarget();
      frame = 'walkA';
    }

    draw(frame);
    place();
    requestAnimationFrame(tick);
  }

  draw('sit');
  place();
  requestAnimationFrame(tick);
})();
