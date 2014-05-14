var chai = require('chai'),
    sinonChai = require('sinon-chai'),
    Backbone = require('backbone');

chai.use(sinonChai);

var jsdom = require('jsdom').jsdom;
global.document = jsdom('<html><body><div id="mocha"></div><div id="testbed"></div></body></html>');
global.window = document.parentWindow;

window.clickOnElement = function(el) {
  if (el.click) {
    el.click();
  } else {
    var ev = document.createEvent('Events');
    ev.initEvent('click', true, false);
    el.dispatchEvent(ev);
  }
};

Backbone.$ = require('jquery');