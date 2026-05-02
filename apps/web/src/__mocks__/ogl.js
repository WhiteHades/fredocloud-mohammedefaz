module.exports = {
  Camera: function () {},
  Mesh: function () {},
  Plane: function () {},
  Program: function () {},
  Renderer: function () { this.gl = { canvas: { parentNode: { removeChild: function () {} } }, clearColor: function () {} }; },
  Texture: function () {},
  Transform: function () {},
};
