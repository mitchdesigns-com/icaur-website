/* ═══════════════════════════════════════════════════════════
   CircularGallery — vanilla JS port of the React Bits component
   Requires: ogl (via importmap)
   ═══════════════════════════════════════════════════════════ */

import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';

function lerp(p1, p2, t) { return p1 + (p2 - p1) * t; }

function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function getFontSize(font) {
  const m = font.match(/(\d+)px/);
  return m ? parseInt(m[1], 10) : 30;
}

function createTextTexture(gl, text, font = 'bold 30px sans-serif', color = '#ffffff') {
  const cv = document.createElement('canvas');
  const ctx = cv.getContext('2d');
  ctx.font = font;
  const tw = Math.ceil(ctx.measureText(text).width);
  const th = Math.ceil(getFontSize(font) * 1.4);
  cv.width  = tw + 24;
  cv.height = th + 16;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(text, cv.width / 2, cv.height / 2);
  const tex = new Texture(gl, { generateMipmaps: false });
  tex.image = cv;
  return { texture: tex, width: cv.width, height: cv.height };
}

class Title {
  constructor({ gl, plane, text, textColor, font }) {
    const { texture, width, height } = createTextTexture(gl, text, font, textColor);
    const geo = new Plane(gl);
    const prog = new Program(gl, {
      vertex: `attribute vec3 position; attribute vec2 uv;
        uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragment: `precision highp float;
        uniform sampler2D tMap; varying vec2 vUv;
        void main(){ vec4 c=texture2D(tMap,vUv); if(c.a<0.1)discard; gl_FragColor=c; }`,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });
    this.mesh = new Mesh(gl, { geometry: geo, program: prog });
    const aspect = width / height;
    const textH = plane.scale.y * 0.12;
    const textW = textH * aspect;
    this.mesh.scale.set(textW, textH, 1);
    this.mesh.position.y = -plane.scale.y * 0.5 - textH * 0.5 - 0.05;
    this.mesh.setParent(plane);
  }
}

class MediaItem {
  constructor({ geometry, gl, image, index, length, scene, screen, viewport,
                bend, textColor, borderRadius, font, text }) {
    this.extra = 0;
    this.gl = gl; this.image = image; this.index = index; this.length = length;
    this.scene = scene; this.screen = screen; this.viewport = viewport;
    this.bend = bend; this.textColor = textColor; this.borderRadius = borderRadius;
    this.font = font; this.text = text;
    this._geometry = geometry;
    this._createShader();
    this._createMesh();
    this._createTitle();
    this.onResize();
  }

  _createShader() {
    const tex = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false, depthWrite: false,
      vertex: `precision highp float;
        attribute vec3 position; attribute vec2 uv;
        uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
        uniform float uTime; uniform float uSpeed;
        varying vec2 vUv;
        void main(){
          vUv=uv; vec3 p=position;
          p.z=(sin(p.x*4.0+uTime)*1.5+cos(p.y*2.0+uTime)*1.5)*(0.1+uSpeed*0.5);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
        }`,
      fragment: `precision highp float;
        uniform vec2 uImageSizes; uniform vec2 uPlaneSizes;
        uniform sampler2D tMap; uniform float uBorderRadius;
        varying vec2 vUv;
        float roundedBoxSDF(vec2 p,vec2 b,float r){
          vec2 d=abs(p)-b; return length(max(d,vec2(0.0)))+min(max(d.x,d.y),0.0)-r;
        }
        void main(){
          vec2 ratio=vec2(
            min((uPlaneSizes.x/uPlaneSizes.y)/(uImageSizes.x/uImageSizes.y),1.0),
            min((uPlaneSizes.y/uPlaneSizes.x)/(uImageSizes.y/uImageSizes.x),1.0)
          );
          vec2 uv=vec2(vUv.x*ratio.x+(1.0-ratio.x)*0.5,vUv.y*ratio.y+(1.0-ratio.y)*0.5);
          vec4 color=texture2D(tMap,uv);
          float d=roundedBoxSDF(vUv-0.5,vec2(0.5-uBorderRadius),uBorderRadius);
          float alpha=1.0-smoothstep(-0.002,0.002,d);
          gl_FragColor=vec4(color.rgb,alpha);
        }`,
      uniforms: {
        tMap: { value: tex },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed:  { value: 0 },
        uTime:   { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      tex.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  _createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this._geometry, program: this.program });
    this.plane.setParent(this.scene);
  }

  _createTitle() {
    new Title({ gl: this.gl, plane: this.plane, text: this.text,
                textColor: this.textColor, font: this.font });
  }

  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const Babs = Math.abs(this.bend);
      const R = (H * H + Babs * Babs) / (2 * Babs);
      const ex = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - ex * ex);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(ex / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(ex / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const po = this.plane.scale.x / 2;
    const vo = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + po < -vo;
    this.isAfter  = this.plane.position.x - po > vo;

    if (direction === 'right' && this.isBefore) { this.extra -= this.widthTotal; }
    if (direction === 'left'  && this.isAfter)  { this.extra += this.widthTotal; }
  }

  onResize({ screen, viewport } = {}) {
    if (screen)   this.screen   = screen;
    if (viewport) this.viewport = viewport;
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (620 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width  * (1100 * this.scale)) / this.screen.width;
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding    = 2;
    this.width      = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x          = this.width * this.index;
  }
}

export class CircularGallery {
  constructor(container, {
    items       = [],
    bend        = 3,
    textColor   = '#ffffff',
    borderRadius = 0.05,
    font        = 'bold 18px GothamMedium, Montserrat, sans-serif',
    scrollSpeed = 2,
    scrollEase  = 0.05,
    onItemClick = null,
  } = {}) {
    this.container   = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll      = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.isDown      = false;
    this.onItemClick = onItemClick;
    this._onCheckDebounce = debounce(this._onCheck.bind(this), 200);
    this._lastScrollY = window.scrollY;

    this._createRenderer();
    this._createCamera();
    this._createScene();
    this._onResize();
    this._createGeometry();
    this._createMedias(items, bend, textColor, borderRadius, font);
    this._update();
    this._addListeners();
  }

  _createRenderer() {
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }

  _createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  _createScene() { this.scene = new Transform(); }

  _createGeometry() {
    this.planeGeo = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });
  }

  _createMedias(items, bend, textColor, borderRadius, font) {
    const doubled = items.concat(items);
    this.items = items;
    this.medias = doubled.map((d, i) => new MediaItem({
      geometry: this.planeGeo, gl: this.gl,
      image: d.image, index: i, length: doubled.length,
      scene: this.scene, screen: this.screen, viewport: this.viewport,
      bend, textColor, borderRadius, font, text: d.text,
    }));

    /* Click to open lightbox — use plane boundary, matching React version */
    this.gl.canvas.addEventListener('click', (e) => {
      if (this._wasDragging) return;
      if (!this.onItemClick || !this.viewport || !this.screen) return;
      const rect  = this.gl.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const vpX    = ((clickX / this.screen.width) - 0.5) * this.viewport.width;
      let best = null, bestDist = Infinity;
      for (const m of this.medias) {
        const dist = Math.abs(m.plane.position.x - vpX);
        if (dist < m.plane.scale.x / 2 && dist < bestDist) { bestDist = dist; best = m; }
      }
      if (best) {
        const origIdx = best.index % items.length;
        this.onItemClick(origIdx, e.clientX, e.clientY);
      }
    });
  }

  _onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const w = this.medias[0].width;
    const idx = Math.round(Math.abs(this.scroll.target) / w);
    const snap = w * idx;
    this.scroll.target = this.scroll.target < 0 ? -snap : snap;
  }

  _onResize() {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const h = 2 * Math.tan(fov / 2) * this.camera.position.z;
    this.viewport = { width: h * this.camera.aspect, height: h };
    if (this.medias) {
      this.medias.forEach(m => m.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }

  _onScroll() {
    const delta = window.scrollY - this._lastScrollY;
    this._lastScrollY = window.scrollY;
    this.scroll.target += delta * 0.015;
  }

  _onDown(e) {
    this.isDown = true;
    this._wasDragging = false;
    this._start = e.touches ? e.touches[0].clientX : e.clientX;
    this._scrollPos = this.scroll.current;
  }

  _onMove(e) {
    if (!this.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const dist = (this._start - x) * (this.scrollSpeed * 0.025);
    if (Math.abs(dist) > 3) this._wasDragging = true;
    this.scroll.target = this._scrollPos + dist;
  }

  _onUp() {
    this.isDown = false;
    this._onCheck();
  }

  _update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const dir = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) this.medias.forEach(m => m.update(this.scroll, dir));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this._raf = requestAnimationFrame(this._update.bind(this));
  }

  _addListeners() {
    this._rBound  = this._onResize.bind(this);
    this._sBound  = this._onScroll.bind(this);
    this._dBound  = this._onDown.bind(this);
    this._mBound  = this._onMove.bind(this);
    this._uBound  = this._onUp.bind(this);
    window.addEventListener('resize', this._rBound);
    /* Passive scroll listener — subtle parallax, no hijacking */
    window.addEventListener('scroll', this._sBound, { passive: true });
    /* Drag starts on container only; move/up on window to handle fast cursor exits */
    this.container.addEventListener('mousedown',  this._dBound);
    window.addEventListener('mousemove',  this._mBound);
    window.addEventListener('mouseup',    this._uBound);
    this.container.addEventListener('touchstart', this._dBound, { passive: true });
    this.container.addEventListener('touchmove',  this._mBound, { passive: true });
    this.container.addEventListener('touchend',   this._uBound);
  }

  destroy() {
    cancelAnimationFrame(this._raf);
    window.removeEventListener('resize',    this._rBound);
    window.removeEventListener('scroll',    this._sBound);
    this.container.removeEventListener('mousedown', this._dBound);
    window.removeEventListener('mousemove', this._mBound);
    window.removeEventListener('mouseup',   this._uBound);
    if (this.gl.canvas.parentNode) this.gl.canvas.parentNode.removeChild(this.gl.canvas);
  }
}
