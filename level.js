class Level {
  constructor(grid, tileSize) {
    this.grid = grid;
    this.ts = tileSize;
    this.start = this.findStart();

    if (this.start) {
      this.grid[this.start.r][this.start.c] = 0;
    }
  }

  rows() {
    return this.grid.length;
  }
  cols() {
    return this.grid[0].length;
  }
  pixelWidth() {
    return this.cols() * this.ts;
  }
  pixelHeight() {
    return this.rows() * this.ts;
  }
  inBounds(r, c) {
    return r >= 0 && c >= 0 && r < this.rows() && c < this.cols();
  }
  tileAt(r, c) {
    return this.grid[r][c];
  }

  // Detect both Walls (1) and Error Blocks (4) as obstacles
  isWall(r, c) {
    const v = this.tileAt(r, c);
    return v === 1 || v === 4;
  }

  isGoal(r, c) {
    return this.tileAt(r, c) === 3;
  }

  findStart() {
    for (let r = 0; r < this.rows(); r++) {
      for (let c = 0; c < this.cols(); c++) {
        if (this.grid[r][c] === 2) return { r, c };
      }
    }
    return null;
  }

  draw() {
    for (let r = 0; r < this.rows(); r++) {
      for (let c = 0; c < this.cols(); c++) {
        const v = this.grid[r][c];

        if (v === 1)
          fill(30, 50, 60); // Wall
        else if (v === 4)
          fill(200, 50, 50); // Error Block Background (Reddish)
        else fill(232); // Floor

        rect(c * this.ts, r * this.ts, this.ts, this.ts);

        // Render "ERROR" text for tile type 4
        if (v === 4) {
          fill(255);
          textAlign(CENTER, CENTER);
          textSize(8);
          text("ERROR", c * this.ts + this.ts / 2, r * this.ts + this.ts / 2);
        }

        if (v === 3) {
          noStroke();
          fill(255, 200, 120, 200);
          rect(c * this.ts + 4, r * this.ts + 4, this.ts - 8, this.ts - 8, 6);
        }
      }
    }
  }
}
