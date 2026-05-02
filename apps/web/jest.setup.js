require("@testing-library/jest-dom");

Element.prototype.animate = function () {
  return { finished: Promise.resolve(), cancel: function () {}, addEventListener: function () {}, removeEventListener: function () {} };
};

HTMLCanvasElement.prototype.getContext = function () {
  return null;
};

HTMLVideoElement.prototype.play = function () {
  return Promise.resolve();
};
HTMLVideoElement.prototype.pause = function () {};
