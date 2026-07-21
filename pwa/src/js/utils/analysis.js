export const analysis = {
  canvas: null,
  ctx: null,

  init() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  },

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },

  getImageData(img, maxSize = 150) {
    const ratio = Math.min(maxSize / img.width, maxSize / img.height);
    this.canvas.width = img.width * ratio;
    this.canvas.height = img.height * ratio;
    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  },

  getAverageColor(data) {
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.data.length; i += 4) {
      r += data.data[i];
      g += data.data[i + 1];
      b += data.data[i + 2];
      count++;
    }
    return {
      r: Math.round(r / count),
      g: Math.round(g / count),
      b: Math.round(b / count)
    };
  },

  getColorHistogram(data) {
    const hist = { r: new Array(8).fill(0), g: new Array(8).fill(0), b: new Array(8).fill(0) };
    for (let i = 0; i < data.data.length; i += 4) {
      hist.r[Math.floor(data.data[i] / 32)]++;
      hist.g[Math.floor(data.data[i + 1] / 32)]++;
      hist.b[Math.floor(data.data[i + 2] / 32)]++;
    }
    const total = data.data.length / 4;
    for (let c of ['r', 'g', 'b']) hist[c] = hist[c].map(v => v / total);
    return hist;
  },

  getEdgeMap(data, w, h) {
    const edges = [];
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = (y * w + x) * 4;
        const l = data.data[((y) * w + (x - 1)) * 4];
        const r = data.data[((y) * w + (x + 1)) * 4];
        const t = data.data[((y - 1) * w + x) * 4];
        const b = data.data[((y + 1) * w + x) * 4];
        const gx = Math.abs(r - l);
        const gy = Math.abs(b - t);
        edges.push(Math.sqrt(gx * gx + gy * gy));
      }
    }
    return edges;
  },

  compareSimilarity(hist1, hist2) {
    let similarity = 0;
    for (let c of ['r', 'g', 'b']) {
      for (let i = 0; i < 8; i++) {
        similarity += Math.min(hist1[c][i], hist2[c][i]);
      }
    }
    return Math.round((similarity / 3) * 100);
  },

  compareEdges(edges1, edges2) {
    const len = Math.min(edges1.length, edges2.length);
    let dot = 0, mag1 = 0, mag2 = 0;
    for (let i = 0; i < len; i++) {
      dot += edges1[i] * edges2[i];
      mag1 += edges1[i] * edges1[i];
      mag2 += edges2[i] * edges2[i];
    }
    if (mag1 === 0 || mag2 === 0) return 0;
    return Math.round((dot / (Math.sqrt(mag1) * Math.sqrt(mag2))) * 100);
  },

  async comparePhotos(capturedSrc, referenceSrc) {
    if (!this.canvas) this.init();
    const img1 = await this.loadImage(capturedSrc);
    const img2 = await this.loadImage(referenceSrc);

    const data1 = this.getImageData(img1);
    const data2 = this.getImageData(img2);

    const hist1 = this.getColorHistogram(data1);
    const hist2 = this.getColorHistogram(data2);

    const colorSim = this.compareSimilarity(hist1, hist2);

    const edges1 = this.getEdgeMap(data1, this.canvas.width, this.canvas.height);
    const edges2 = this.getEdgeMap(data2, this.canvas.width, this.canvas.height);

    const edgeSim = this.compareEdges(edges1, edges2);

    const score = Math.round(colorSim * 0.55 + edgeSim * 0.45);
    const passed = score >= 35 && colorSim >= 30;

    return {
      score: Math.min(100, Math.max(0, score)),
      passed,
      colorSimilarity: colorSim,
      edgeSimilarity: edgeSim,
      averageColor: this.getAverageColor(data1),
      referenceColor: this.getAverageColor(data2)
    };
  },

  async detectColorInPhoto(photoSrc, targetColor) {
    if (!this.canvas) this.init();
    const img = await this.loadImage(photoSrc);
    const data = this.getImageData(img, 200);

    const target = this.parseColor(targetColor);
    let matchCount = 0;
    let totalPixels = 0;
    let bestMatch = { r: 0, g: 0, b: 0, distance: Infinity };

    for (let i = 0; i < data.data.length; i += 4) {
      const r = data.data[i], g = data.data[i + 1], b = data.data[i + 2];
      const dist = Math.sqrt(
        Math.pow(r - target.r, 2) +
        Math.pow(g - target.g, 2) +
        Math.pow(b - target.b, 2)
      );
      totalPixels++;
      if (dist < 45) matchCount++;
      if (dist < bestMatch.distance) {
        bestMatch = { r, g, b, distance: dist };
      }
    }

    const percentage = Math.round((matchCount / totalPixels) * 100);
    const rawScore = percentage * 2.5 + Math.max(0, 40 - bestMatch.distance);
    const score = Math.min(100, Math.round(rawScore));

    const minPercentage = 12;
    const passed = percentage >= minPercentage && score >= 50;

    return {
      score,
      percentage,
      passed,
      closestColor: bestMatch,
      targetColor: target
    };
  },

  parseColor(color) {
    const colors = {
      'rouge': { r: 220, g: 40, b: 40 },
      'bleu': { r: 40, g: 80, b: 220 },
      'vert': { r: 40, g: 180, b: 60 },
      'jaune': { r: 240, g: 200, b: 40 },
      'orange': { r: 240, g: 130, b: 30 },
      'rose': { r: 240, g: 100, b: 150 },
      'violet': { r: 130, g: 60, b: 200 },
      'blanc': { r: 240, g: 240, b: 240 },
      'noir': { r: 30, g: 30, b: 30 },
      'gris': { r: 128, g: 128, b: 128 },
      'marron': { r: 139, g: 90, b: 43 },
      'turquoise': { r: 64, g: 224, b: 208 }
    };
    if (typeof color === 'object') return color;
    return colors[color.toLowerCase()] || { r: 128, g: 128, b: 128 };
  },

  async detectObjectPresence(photoSrc, objectName) {
    if (!this.canvas) this.init();
    const img = await this.loadImage(photoSrc);
    const data = this.getImageData(img, 200);

    const avg = this.getAverageColor(data);
    const hist = this.getColorHistogram(data);
    const edges = this.getEdgeMap(data, this.canvas.width, this.canvas.height);

    const edgeDensity = edges.filter(e => e > 30).length / edges.length;

    const objects = {
      'statue': { expectedEdge: 0.15, expectedColors: ['gris', 'blanc'], label: 'Statue' },
      'pont': { expectedEdge: 0.25, expectedColors: ['gris', 'marron'], label: 'Pont' },
      'arbre': { expectedEdge: 0.2, expectedColors: ['vert', 'marron'], label: 'Arbre' },
      'fontaine': { expectedEdge: 0.18, expectedColors: ['bleu', 'blanc', 'gris'], label: 'Fontaine' },
      'fleuve': { expectedEdge: 0.08, expectedColors: ['bleu', 'vert'], label: 'Fleuve' },
      'murale': { expectedEdge: 0.22, expectedColors: ['rouge', 'bleu', 'vert', 'jaune'], label: 'Murale' },
      'eglise': { expectedEdge: 0.2, expectedColors: ['blanc', 'gris', 'marron'], label: 'Église' },
      'plaza': { expectedEdge: 0.12, expectedColors: ['gris', 'blanc'], label: 'Plaza' }
    };

    const obj = objects[objectName.toLowerCase()] || { expectedEdge: 0.15, expectedColors: [], label: objectName };

    const edgeScore = Math.max(0, 100 - Math.abs(edgeDensity - obj.expectedEdge) * 600);

    let colorScore = 0;
    if (obj.expectedColors.length > 0) {
      const colorMatches = obj.expectedColors.filter(c => {
        const tc = this.parseColor(c);
        return Math.sqrt(Math.pow(avg.r - tc.r, 2) + Math.pow(avg.g - tc.g, 2) + Math.pow(avg.b - tc.b, 2)) < 90;
      });
      colorScore = (colorMatches.length / obj.expectedColors.length) * 100;
    } else {
      colorScore = 40;
    }

    const rawScore = edgeScore * 0.5 + colorScore * 0.5;
    const score = Math.round(rawScore);
    const passed = score >= 55 && colorScore >= 40;

    return {
      score,
      passed,
      edgeScore: Math.round(edgeScore),
      colorScore: Math.round(colorScore),
      objectName: obj.label,
      averageColor: avg
    };
  }
};
