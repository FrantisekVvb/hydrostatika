const svg = document.querySelector(".scene__svg");
const tubeGroups = document.querySelectorAll(".js-tube");
const hit = document.querySelector(".tube-hit");

const MIN_Y = -420;
const MAX_Y = 720;

let offsetY = 0;
let drag = null;

function svgY(event) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return event.clientY;
  return (event.clientY - ctm.f) / ctm.d;
}

function applyOffset(y) {
  offsetY = Math.min(MAX_Y, Math.max(MIN_Y, y));
  const transform = `translate(0 ${offsetY})`;
  tubeGroups.forEach((group) => {
    group.setAttribute("transform", transform);
  });
}

function onPointerDown(event) {
  event.preventDefault();
  hit.setPointerCapture(event.pointerId);
  drag = {
    pointerId: event.pointerId,
    startSvgY: svgY(event),
    startOffset: offsetY,
  };
  svg.classList.add("is-dragging");
}

function onPointerMove(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  applyOffset(drag.startOffset + (svgY(event) - drag.startSvgY));
}

function onPointerUp(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  drag = null;
  svg.classList.remove("is-dragging");
}

hit.addEventListener("pointerdown", onPointerDown);
hit.addEventListener("pointermove", onPointerMove);
hit.addEventListener("pointerup", onPointerUp);
hit.addEventListener("pointercancel", onPointerUp);
