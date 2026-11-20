const TOTAL_MS = 5000;
const SPRAY_MS = 3000;
const random = (min, max) => min + Math.random() * (max - min);

function layer(kind) {
  const element = document.createElement("div");
  element.className = "dock-effect " + kind;
  element.setAttribute("aria-hidden", "true");
  element.inert = true;
  return element;
}

function toolGradient(ctx, left, right, colors) {
  const result = ctx.createLinearGradient(left, 0, right, 0);
  colors.forEach(([stop, color]) => result.addColorStop(stop, color));
  return result;
}
function drawClipper(ctx) {
  const steel = toolGradient(ctx, 17, 143, [[0,"#5d5f69"],[.22,"#e8e8ed"],[.5,"#93949f"],[.78,"#f2f0f2"],[1,"#565763"]]);
  const casing = toolGradient(ctx, 28, 132, [[0,"#222127"],[.22,"#51424a"],[.44,"#28232b"],[.78,"#17171b"],[1,"#56444c"]]);
  const paint = (path, fill) => {
    ctx.beginPath();
    path(ctx);
    ctx.fillStyle = fill;
    ctx.fill();
  };
  paint(p => {
    p.moveTo(27,67); p.quadraticCurveTo(10,102,32,143); p.lineTo(42,246);
    p.quadraticCurveTo(80,285,119,246); p.lineTo(130,140);
    p.quadraticCurveTo(150,103,132,67); p.closePath();
  }, casing);
  paint(p => p.roundRect(40,118,80,108,24), "#100f15");
  paint(p => p.roundRect(47,123,66,90,19), casing);
  for (let i = 0; i < 7; i++) paint(p => p.roundRect(54,147+i*7.5,52,2.5,1.25), "#76626b");
  paint(p => p.roundRect(34,79,92,19,7), steel);
  paint(p => p.roundRect(17,34,126,50,7), steel);
  paint(p => p.roundRect(32,57,96,12,5), "#292a32");
  for (let i = 0; i < 12; i++) paint(p => p.roundRect(19+i*10.6,12+(i%2),7,28,2), steel);
  paint(p => p.roundRect(63,106,34,7,3.5), "#d7606c");
  paint(p => p.roundRect(61,239,38,11,5), steel);
  paint(p => p.roundRect(129,89,16,26,4), "#7a7580");
}

function snapshot(side) {
  const panel = document.createElement("div");
  panel.className = "tear-panel tear-" + side;
  const flow = document.createElement("div");
  flow.className = "tear-flow";
  flow.style.top = -window.scrollY + "px";
  // A clipped copy of the current viewport preserves the actual photos and layout.
  const subjects = document.querySelectorAll("body > main, body > .site-head, body > .site-footer, body > .dock, body > .scroll-top, body > .preview-bar");
  for (const original of subjects) {
    const copy = original.cloneNode(true);
    if (copy.id) copy.removeAttribute("id");
    copy.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
    copy.querySelectorAll("iframe").forEach(node => node.remove());
    copy.querySelectorAll(".booking-nudge").forEach(node => node.remove());
    copy.querySelectorAll(".schedule[open]").forEach(node => { node.open = false; });
    const originals = original.querySelectorAll(".reveal.visible");
    copy.querySelectorAll(".reveal.visible").forEach((node, index) => {
      const current = originals[index];
      node.style.animation = "none";
      if (current) {
        const style = getComputedStyle(current);
        node.style.opacity = style.opacity;
        node.style.transform = style.transform;
      }
    });
    (getComputedStyle(original).position === "fixed" ? panel : flow).append(copy);
  }
  panel.prepend(flow);
  return panel;
}

function clipper() {
  const stage = layer("clipper-stage");
  const tool = document.createElement("canvas");
  tool.className = "clipper-tool";
  tool.width = 320;
  tool.height = 540;
  const ctx = tool.getContext("2d");
  if (ctx) {
    ctx.scale(2,2);
    drawClipper(ctx);
  }
  stage.append(snapshot("left"), snapshot("right"), tool);
  document.body.append(stage);
  return stage;
}

function drawBlade(ctx, blade, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(blade.x,blade.y);
  ctx.rotate(blade.angle);
  ctx.scale(blade.size,blade.size);
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = "#fdedf5";
  ctx.fillStyle = toolGradient(ctx,-17,16,[[0,"#6c747e"],[.42,"#f8f7fb"],[.7,"#adb7c2"],[1,"#e1e5ed"]]);
  ctx.beginPath();
  ctx.moveTo(-18,-3); ctx.lineTo(12,-6); ctx.quadraticCurveTo(19,-5,17,-1); ctx.lineTo(15,2); ctx.lineTo(-16,3); ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = blade.handle;
  ctx.beginPath();
  ctx.roundRect(-19,1,35,5,2.5);
  ctx.fill();
  ctx.strokeStyle = "#b598aa";
  ctx.stroke();
  ctx.restore();
}
function fountain(anchor, done) {
  const stage = layer("fountain-stage");
  const canvas = document.createElement("canvas");
  stage.append(canvas);
  const context = canvas.getContext("2d");
  if (!context) return null;
  document.body.append(stage);
  const bounds = stage.getBoundingClientRect();
  const button = anchor.querySelector(".lens").getBoundingClientRect();
  const dock = anchor.closest(".dock").getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(bounds.width * ratio);
  canvas.height = Math.round(bounds.height * ratio);
  context.scale(ratio,ratio);
  const floor = dock.top - 6;
  const origin = { x: button.left + button.width / 2, y: button.top + button.height / 2 };
  const blades = [];
  const piles = new Map();
  const start = performance.now();
  let last = start, nextParticle = 0;
  function animate(now) {
    const elapsed = now - start;
    if (elapsed >= TOTAL_MS || !stage.isConnected) { done(); return; }
    const delta = Math.min(.034,(now-last)/1000);
    last = now;
    if (elapsed < SPRAY_MS && elapsed >= nextParticle) {
      nextParticle = elapsed + random(24,55);
      const angle = random(-1.03,1.03);
      const velocity = random(390,780) * Math.min(1, bounds.height / 660);
      blades.push({
        x: origin.x + random(-5,5), y: origin.y, vx: Math.sin(angle)*velocity, vy: -Math.cos(angle)*velocity,
        size: random(.48,.86), angle: random(-Math.PI,Math.PI), spin: random(-10,10),
        handle: Math.random() > .5 ? "#6d303e" : "#242638", landed: false,
      });
    }
    context.clearRect(0,0,bounds.width,bounds.height);
    const fade = Math.min(1,(TOTAL_MS-elapsed)/350);
    for (const blade of blades) {
      if (!blade.landed) {
        blade.x += blade.vx * delta;
        blade.vy += 1020 * delta;
        blade.y += blade.vy * delta;
        blade.angle += blade.spin * delta;
        if (blade.x < 14 || blade.x > bounds.width-14) {
          blade.x = Math.max(14,Math.min(bounds.width-14,blade.x));
          blade.vx *= -.48;
        }
        if (blade.vy > 0 && blade.y >= floor) {
          const bin = Math.round(blade.x / 19);
          const count = piles.get(bin) || 0;
          piles.set(bin,count+1);
          blade.y = floor - Math.min(26,count*2.3);
          blade.angle = random(-.3,.3);
          blade.landed = true;
        }
      }
      drawBlade(context,blade,fade);
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
  return stage;
}

export function setupDockEffects(anchor, mode, canAnimate, onStart) {
  if (!anchor || !["clipper","fountain"].includes(mode)) return;
  let stage = null;
  let timer;
  function finish() {
    if (!stage) return;
    stage.remove();
    stage = null;
    clearTimeout(timer);
    window.scrollTo({ top: 0, behavior: canAnimate() ? "smooth" : "instant" });
  }
  anchor.addEventListener("click", event => {
    if (!canAnimate() || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (stage) return;
    onStart();
    stage = mode === "clipper" ? clipper() : fountain(anchor,finish);
    if (stage) timer = setTimeout(finish,TOTAL_MS);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("resize", () => { if (stage) finish(); }, { passive: true });
}
