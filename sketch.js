const TS = 32;

// Raw JSON data (from levels.json).
let levelsData;

// Array of Level instances.
let levels = [];

// Current level index.
let li = 0;

// Player instance (tile-based).
let player;

function preload() {
  // Ensure level data is ready before setup runs.
  levelsData = loadJSON("levels.json");
}

function setup() {
  levels = levelsData.levels.map((grid) => new Level(copyGrid(grid), TS));

  // --- DYNAMIC ERROR BLOCK GENERATION FOR LEVEL 3 ---
  // Index 2 is Level 3
  let level3 = levels[2];
  let rows = level3.rows();
  let cols = level3.cols();

  // 1. Horizontal Obstacles: Iterate through columns and place an ERROR block (4)
  // every 3 tiles along row index 3 to create a broken barrier.
  for (let c = 1; c < cols - 2; c += 3) {
    level3.grid[3][c] = 4;
  }

  // 2. Vertical Obstacles (Set A): Create a dashed vertical line in column 3.
  // The 'if' statement ensures a gap is left at row 2 so the player isn't fully trapped.
  for (let r = 1; r < rows - 1; r += 3) {
    if (r !== 2) level3.grid[r][3] = 4;
  }
  // 3. Vertical Obstacles (Set B): Create another dashed line in column 5.
  // This uses a different step (r += 2) and skips row 3 to create staggered movement paths.
  for (let r = 2; r < rows - 2; r += 2) {
    if (r !== 3) level3.grid[r][5] = 4;
  }
  // This loop is currently configured to target row 1, but the inner loop condition
  // (cols - 1 < cols - 2) is logically false, so it acts as a placeholder for
  // future top-row obstacles.
  for (let r = 1; r < 2; r++) {
    for (let c = cols - 1; c < cols - 2; c += 2) {
      level3.grid[r][c] = 4;
    }
  }

  // 4. NEW Checkerboard "Corridor": Adds obstacles to every even column in
  // the second-to-last row, forcing the player to "zigzag" to reach the goal.
  for (let c = 1; c < cols - 1; c++) {
    if (c % 2 === 0) {
      level3.grid[rows - 3][c] = 4;
    }
  }
  // -------------------------------------------------

  player = new Player(TS);
  loadLevel(0);
  noStroke();
  textFont("sans-serif");
}

function draw() {
  background(240);

  // Draw current level then player on top.
  levels[li].draw();
  player.draw();

  drawHUD();
}

function drawHUD() {
  // HUD matches your original idea: show level count and controls.
  fill(255);
  textSize(12);
  textAlign(LEFT, TOP);
  text(`Level ${li + 1}/${levels.length} — WASD/Arrows to move`, 10, 16);
}

function keyPressed() {
  /*
  Convert key presses into a movement direction. (WASD + arrows)
  */
  let dr = 0;
  let dc = 0;

  if (keyCode === LEFT_ARROW || key === "a" || key === "A") dc = -1;
  else if (keyCode === RIGHT_ARROW || key === "d" || key === "D") dc = 1;
  else if (keyCode === UP_ARROW || key === "w" || key === "W") dr = -1;
  else if (keyCode === DOWN_ARROW || key === "s" || key === "S") dr = 1;
  else return; // not a movement key

  // Try to move. If blocked, nothing happens.
  const moved = player.tryMove(levels[li], dr, dc);

  // If the player moved onto a goal tile, advance levels.
  if (moved && levels[li].isGoal(player.r, player.c)) {
    nextLevel();
  }
}

// ----- Level switching -----

function loadLevel(idx) {
  li = idx;

  const level = levels[li];

  // Place player at the level's start tile (2), if present.
  if (level.start) {
    player.setCell(level.start.r, level.start.c);
  } else {
    // Fallback spawn: top-left-ish (but inside bounds).
    player.setCell(1, 1);
  }

  // Ensure the canvas matches this level’s dimensions.
  resizeCanvas(level.pixelWidth(), level.pixelHeight());
}

function nextLevel() {
  // Wrap around when we reach the last level.
  const next = (li + 1) % levels.length;
  loadLevel(next);
}

// ----- Utility -----

function copyGrid(grid) {
  /*
  Make a deep-ish copy of a 2D array:
  - new outer array
  - each row becomes a new array

  Why copy?
  - Because Level constructor may normalize tiles (e.g., replace 2 with 0)
  - And we don’t want to accidentally mutate the raw JSON data object. 
  */
  return grid.map((row) => row.slice());
}
