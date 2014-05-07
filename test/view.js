var jsdom = require('jsdom').jsdom;
global.document = jsdom('<html><body><div id="mocha"></div><div id="testbed"></div></body></html>');
global.window = document.parentWindow;

var expect = require('chai').expect,
    sinon = require('sinon'),
    $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    View = require('../chaplin.view');

Backbone.$ = $;

describe('Backbone.Chaplin.View', function() {
  var simulateEvent;
  var renderCalled = false;
      view = model = collection = null,
      template = '<p>content</p>',
      testbed = document.getElementById('testbed');

  beforeEach(function() {
    renderCalled = false;
    view = new TestView;
  });
  afterEach(function() {
    view.dispose();
    view = null;
    if (model) {
      if (typeof model.dispose === "function") {
        model.dispose();
      }
      model = null;
    }
    if (collection) {
      if (typeof collection.dispose === "function") {
        collection.dispose();
      }
      collection = null;
    }
  });
  var setModel = function() {
    model = new Model({
      foo: 'foo',
      bar: 'bar'
    });
    return view.model = model;
  };
  var setCollection = function() {
    collection = new Collection;
    view.collection = collection;
  };
  var delay = function(callback) {
    return window.setTimeout(callback, 40);
  };

  var TestView = View.extend({
    id: 'test-view',

    getTemplateFunction: function() {
      return function() {
        return template;
      };
    },

    render: function() {
      View.prototype.render.apply(this, arguments);
      renderCalled = true;
    },

  });

  var AutoRenderView = TestView.extend({
    autoRender: true,
    container: '#testbed'
  });

  var ConfiguredTestView = TestView.extend({
    autoRender: true,
    container: '#testbed',
    containerMethod: 'before',
  })

  // it('should mixin a EventBroker', function() {
  //   for (var name in EventBroker) {
  //     if (!_.has(EventBroker, name)) continue;
  //     var value = EventBroker[name];
  //     expect(view[name]).to.be(EventBroker[name]);
  //   }
  // });
  it('should render', function() {
    expect(view.render).to.be.a('function');
    var renderResult = view.render();
    expect(renderResult).to.equal(view);
  });
  it('should render a template', function() {
    view.render();
    var innerHTML = view.el.innerHTML.toLowerCase();
    var lowerCaseTemplate = template.toLowerCase();
    expect(innerHTML).to.equal(lowerCaseTemplate);
  });
  it('should render automatically', function() {
    view = new TestView({
      autoRender: true
    });
    expect(renderCalled).to.be.true;
    expect(view.el.parentNode).to.be.null;
  });
  it('should not render without proper getTemplateFunction', function() {
    expect(function() {
      return new View({
        autoRender: true
      });
    }).to.throw();
  });
  it('should attach itself to an element automatically', function() {
    view = new TestView({
      container: testbed
    });
    expect(renderCalled).to.be(false);
    expect(view.el.parentNode).to.be(null);
    view.render();
    expect(view.el.parentNode).to.be(testbed);
  });
  it('should attach itself to a selector automatically', function() {
    view = new TestView({
      container: '#testbed'
    });
    view.render();
    expect(view.el.parentNode).to.be(testbed);
  });
  it('should attach itself to a jQuery object automatically', function() {
    view = new TestView({
      container: $('#testbed')
    });
    view.render();
    expect(view.el.parentNode).to.be(testbed);
  });
  it('should use the given attach method', function() {
    var containerMethod, customContainerMethod;
    customContainerMethod = function(container, el) {
      var p;
      p = container.parentNode;
      return p.insertBefore(el, container.nextSibling);
    };
    containerMethod = $ ? 'after' : customContainerMethod;
    view = new TestView({
      container: testbed,
      containerMethod: containerMethod
    });
    view.render();
    expect(view.el).to.be(testbed.nextSibling);
    expect(view.el.parentNode).to.be(testbed.parentNode);
  });
  it('should consider autoRender, container and containerMethod properties', function() {
    view = new ConfiguredTestView();
    expect(renderCalled).to.be(true);
    expect(view.el).to.be(testbed.previousSibling);
    expect(view.el.parentNode).to.be(testbed.parentNode);
  });
  it('should not attach itself more than once', function() {
    var spy;
    spy = sinon.spy(testbed, 'appendChild');
    view = new TestView({
      container: testbed
    });
    view.render();
    view.render();
    expect(spy.calledOnce).to.be(true);
  });
  it('should not attach itself if autoAttach is false', function() {
    var NoAutoAttachView1 = View.extend({
      autoAttach: false,
      autoRender: true,
      container: testbed,
      getTemplateFunction: TestView.prototype.getTemplateFunction,
      attach: sinon.spy(),
    });

    var NoAutoAttachView2 = TestView.extend({
      autoAttach: false,
      autoRender: true,
      container: testbed,
      attach: sinon.spy()
    });

    var check = function(view) {
      var parent;
      parent = view.el.parentNode;
      if (parent) {
        return expect(parent.nodeType).to.be(11);
      } else {
        return expect(parent).to.be(null);
      }
    };
    var view1 = new NoAutoAttachView1;
    window.view1 = view1;
    expect(view1.attach).was.notCalled();
    check(view1);
    var view2 = new NoAutoAttachView2;
    expect(view2.attach).was.notCalled();
    check(view2);
  });
  // it('should not wrap el with `tagName` when using a region', function() {
  //   var Test1View, Test2View, instance1, instance2, view1, view2;
  //   mediator.setHandler('region:register', function() {});
  //   mediator.setHandler('region:show', function() {});
  //   mediator.setHandler('region:find', function() {});
  //   view1 = Test1View = View.extend({
  //     autoRender: true,
  //     container: testbed,
  //     getTemplateFunction: function() {
  //       return function() {
  //         return '<main><div id="test0"></div></main>';
  //       };
  //     },
  //     regions: {
  //       'region1': '#test0'
  //     }
  //   });
  //   view2 = Test2View = (function(_super) {
  //     __extends(Test2View, _super);

  //     function Test2View() {
  //       return Test2View.__super__.constructor.apply(this, arguments);
  //     }

  //     Test2View.prototype.autoRender = true;

  //     Test2View.prototype.region = 'region1';

  //     Test2View.prototype.tagName = 'section';

  //     Test2View.prototype.noWrap = true;

  //     Test2View.prototype.regions = {
  //       'test1': '#test1'
  //     };

  //     Test2View.prototype.getTemplateFunction = function() {
  //       return function() {
  //         return '<div><p>View is not wrapped!</p><p id="test1">foo</p></div>';
  //       };
  //     };

  //     return Test2View;

  //   })(View);
  //   instance1 = new Test1View();
  //   instance2 = new Test2View();
  //   expect(instance2.el.parentElement.querySelector('section')).to.be(null);
  //   instance1.dispose();
  //   return instance2.dispose();
  // });
  it('should not wrap el with `tagName`', function() {
    var Test3View, instance1, viewWrap;
    viewWrap = Test3View = (function(_super) {
      __extends(Test3View, _super);

      function Test3View() {
        return Test3View.__super__.constructor.apply(this, arguments);
      }

      Test3View.prototype.autoRender = true;

      Test3View.prototype.tagName = 'section';

      Test3View.prototype.noWrap = true;

      Test3View.prototype.container = testbed;

      Test3View.prototype.getTemplateFunction = function() {
        return function() {
          return '<div><p>View is not wrapped!</p><p>baz</p></div>';
        };
      };

      return Test3View;

    })(View);
    instance1 = new Test3View();
    expect(instance1.el.parentElement.querySelector('section')).to.be(null);
    return instance1.dispose();
  });
  it('should fire an addedToDOM event attaching itself to the DOM', function() {
    var spy;
    view = new TestView({
      container: testbed
    });
    spy = sinon.spy();
    view.on('addedToDOM', spy);
    view.render();
    expect(spy).was.called();
  });
  it('should register and remove user input event handlers', function() {
    var handler, p, spy;
    view.dispose();
    view = new TestView({
      container: testbed
    });
    expect(view.delegate).to.be.a('function');
    expect(view.undelegate).to.be.a('function');
    spy = sinon.spy();
    handler = view.delegate('click', spy);
    expect(handler).to.be.a('function');
    view.render();
    window.clickOnElement(view.el);
    expect(spy).was.called();
    view.undelegate();
    window.clickOnElement(view.el);
    expect(spy.callCount).to.be(1);
    spy = sinon.spy();
    handler = view.delegate('click', 'p', spy);
    expect(handler).to.be.a('function');
    p = view.el.querySelector('p');
    window.clickOnElement(p);
    expect(spy).was.called();
    expect(function() {
      return view.delegate(spy);
    }).to.throwError();
    view.undelegate();
    window.clickOnElement(p);
    expect(spy.callCount).to.be(1);
  });
  simulateEvent = function(target, eventName, options) {
    var evt, oEvent;
    if (options == null) {
      options = {};
    }
    eventName = eventName.toLowerCase();
    if (document.createEvent) {
      evt = document.createEvent('HTMLEvents');
      evt.initEvent(eventName, true, true);
      target.dispatchEvent(evt);
    } else {
      options.clientX = 0;
      options.clientY = 0;
      evt = document.createEventObject();
      oEvent = _.extend(evt, options);
      target.fireEvent("on" + eventName, oEvent);
    }
    return target;
  };
  it('should allow undelegating one event', function() {
    var spy, spy2;
    spy = sinon.spy();
    spy2 = sinon.spy();
    view.delegate('click', spy);
    view.delegate('focus', spy2);
    view.render();
    window.clickOnElement(view.el);
    expect(spy).was.calledOnce();
    expect(spy2).was.notCalled();
    view.undelegate('click');
    simulateEvent(view.el, 'focus');
    window.clickOnElement(view.el);
    expect(spy).was.calledOnce();
    expect(spy2).was.calledOnce();
  });
  it('should check delegate parameters', function() {
    expect(function() {
      return view.delegate(1, 2, 3);
    }).to.throwError();
    expect(function() {
      return view.delegate('click', 'foo');
    }).to.throwError();
    expect(function() {
      return view.delegate('click', 'foo', 'bar');
    }).to.throwError();
    expect(function() {
      return view.delegate('click', 123);
    }).to.throwError();
  });
  it('should correct inheritance of events object', function(done) {
    var A, B, C, D, bcd, d;
    A = TestView.extend({
      autoRender: true,

      container: testbed,

      getTemplateFunction: function() {
        return function() {
          return '<div id="a"></div> <div id="b"></div> <div id="c"></div> <div id="d"></div>';
        };
      },

      events: {
        'click #a': 'a1Handler'
      },

      a1Handler: sinon.spy(),

      click: function(index) {
        return window.clickOnElement(this.el.querySelector("#" + index));
      }
    });
    B = A.extend({
      events: {
        'click #a': 'a2Handler',
        'click #b': 'bHandler'
      },
      a2Handler: sinon.spy(),
      bHandler: sinon.spy()
    });
    C = B.extend({
      events: {
        'click #a': 'a3Handler',
        'click #c': 'cHandler'
      },
      a3Handler: sinon.spy(),
      cHandler: sinon.spy()
    });
    D = C.extend({
      events: {
        'click #a': 'a4Handler',
        'click #d': 'dHandler',
        'click': 'globalHandler'
      },
      a4Handler: sinon.spy(),
      dHandler: sinon.spy(),
      globalHandler: sinon.spy(),
    });

    bcd = ['b', 'c', 'd'];
    d = new D;
    d.click('a');
    delay(function() {
      var index, _i, _j, _len;
      for (index = _i = 1; _i < 5; index = ++_i) {
        expect(d["a" + index + "Handler"]).was.calledOnce();
      }
      for (_j = 0, _len = bcd.length; _j < _len; _j++) {
        index = bcd[_j];
        expect(d["" + index + "Handler"]).was.notCalled();
        d.click(index);
      }
      delay(function() {
        var _k, _len1;
        for (_k = 0, _len1 = bcd.length; _k < _len1; _k++) {
          index = bcd[_k];
          expect(d["" + index + "Handler"]).was.calledOnce();
        }
        expect(d.globalHandler.callCount).to.be(4);
        done();
      });
    });
  });
  it('should throw an error when function is passed as second arg', function() {
    var E = TestView.extend({
      events: function() {}
    });
    expect(function() {
      return new E;
    }).to.throwError();
  });
  it('should add and return subviews', function() {
    var subview, subview2;
    expect(view.subview).to.be.a('function');
    subview = new View();
    view.subview('fooSubview', subview);
    expect(view.subview('fooSubview')).to.be(subview);
    expect(view.subviews.length).to.be(1);
    subview2 = new View();
    view.subview('fooSubview', subview2);
    expect(view.subview('fooSubview')).to.be(subview2);
    expect(view.subviews.length).to.be(1);
  });
  it('should remove subviews', function() {
    var subview;
    expect(view.removeSubview).to.be.a('function');
    subview = new View();
    view.subview('fooSubview', subview);
    view.removeSubview('fooSubview');
    expect(typeof view.subview('fooSubview')).to.be('undefined');
    expect(view.subviews.length).to.be(0);
    subview = new View();
    view.subview('barSubview', subview);
    view.removeSubview(subview);
    expect(typeof view.subview('barSubview')).to.be('undefined');
    expect(view.subviews.length).to.be(0);
    view.removeSubview('');
    expect(view.subviews.length).to.be(0);
  });
  it('should return empty template data without a model', function() {
    var templateData = view.getTemplateData();
    expect(templateData).to.be.an('object');
    expect(_.isEmpty(templateData)).to.be(true);
  });
  it('should return proper template data for a Chaplin model', function() {
    var templateData;
    setModel();
    templateData = view.getTemplateData();
    expect(templateData).to.be.an('object');
    expect(templateData.foo).to.be('foo');
    expect(templateData.bar).to.be('bar');
  });
  it('should return template data that protects the model', function() {
    setModel();
    var templateData = view.getTemplateData();
    templateData.qux = 'qux';
    expect(model.get('qux')).to.be(void 0);
  });
  it('should return proper template data for a Backbone model', function() {
    var templateData;
    model = new Backbone.Model({
      foo: 'foo',
      bar: 'bar'
    });
    view.model = model;
    templateData = view.getTemplateData();
    expect(templateData).to.be.an('object');
    expect(templateData.foo).to.be('foo');
    expect(templateData.bar).to.be('bar');
  });
  it('should return proper template data for Chaplin collections', function() {
    var data, items, model1, model2;
    model1 = new Model({
      foo: 'foo'
    });
    model2 = new Model({
      bar: 'bar'
    });
    collection = new Collection([model1, model2]);
    view.collection = collection;
    data = view.getTemplateData();
    expect(data).to.be.an('object');
    expect(data).to.only.have.keys('items', 'length');
    expect(data.length).to.be(2);
    items = data.items;
    expect(items).to.be.an('array');
    expect(data.length).to.be(items.length);
    expect(items[0]).to.be.an('object');
    expect(items[0].foo).to.be('foo');
    expect(items[1]).to.be.an('object');
    expect(items[1].bar).to.be('bar');
  });
  it('should return proper template data for Backbone collections', function() {
    var data, items, model1, model2;
    model1 = new Backbone.Model({
      foo: 'foo'
    });
    model2 = new Backbone.Model({
      bar: 'bar'
    });
    collection = new Backbone.Collection([model1, model2]);
    view.collection = collection;
    data = view.getTemplateData();
    expect(data).to.be.an('object');
    expect(data).to.only.have.keys('items', 'length');
    expect(data.length).to.be(2);
    items = data.items;
    expect(items).to.be.an('array');
    expect(items.length).to.be(2);
    expect(items[0]).to.be.an('object');
    expect(items[0].foo).to.be('foo');
    expect(items[1]).to.be.an('object');
    expect(items[1].bar).to.be('bar');
  });
  it('should add the SyncMachine state to the template data', function() {
    var templateData;
    setModel();
    _.extend(model, SyncMachine);
    templateData = view.getTemplateData();
    expect(templateData.synced).to.be(false);
    model.beginSync();
    model.finishSync();
    templateData = view.getTemplateData();
    expect(templateData.synced).to.be(true);
  });
  it('should not cover existing SyncMachine properties', function() {
    var templateData;
    setModel();
    _.extend(model, SyncMachine);
    model.set({
      syncState: 'foo',
      synced: 'bar'
    });
    templateData = view.getTemplateData();
    expect(templateData.syncState).to.be('foo');
    expect(templateData.synced).to.be('bar');
  });
  describe('Events', function() {
    var EventedViewParent = View.extend({
      listen: {
        'ns:a': 'a1Handler',
        'ns:b': function() {
          return this.b1Handler.apply(this, arguments);
        },
        'change:a model': 'a1Handler',
        'change:b model': 'b1Handler',
        'reset collection': 'a1Handler',
        'custom collection': 'b1Handler',
        'ns:a mediator': 'a1Handler',
        'ns:b mediator': 'b1Handler'
      },

      initialize: function() {
        EventedViewParent.__super__.initialize.apply(this, arguments);
        this.a1Handler = sinon.spy();
        this.b1Handler = sinon.spy();
      }
    });
    var EventedView = EventedViewParent.extend({

      listen: {
        'ns:a': 'a2Handler',
        'ns:b': function() {
          return this.b2Handler.apply(this, arguments);
        },
        'change:a model': 'a2Handler',
        'change:b model': 'b2Handler',
        'reset collection': 'a2Handler',
        'custom collection': 'b2Handler',
        'ns:a mediator': 'a2Handler',
        'ns:b mediator': 'b2Handler'
      },

      initialize: function() {
        EventedView.__super__.initialize.apply(this, arguments);
        this.a2Handler = sinon.spy();
        this.b2Handler = sinon.spy();
      }
    });
    it('should bind to own events declaratively', function() {
      view = new EventedView({
        model: new Model()
      });
      expect(view.a1Handler).was.notCalled();
      expect(view.a2Handler).was.notCalled();
      expect(view.b1Handler).was.notCalled();
      expect(view.b2Handler).was.notCalled();
      view.trigger('ns:a');
      expect(view.a1Handler).was.calledOnce();
      expect(view.a2Handler).was.calledOnce();
      expect(view.b1Handler).was.notCalled();
      expect(view.b2Handler).was.notCalled();
      view.trigger('ns:b');
      expect(view.a1Handler).was.calledOnce();
      expect(view.a2Handler).was.calledOnce();
      expect(view.b1Handler).was.calledOnce();
      expect(view.b2Handler).was.calledOnce();
    });
    it('should bind to model events declaratively', function() {
      model = new Model();
      view = new EventedView({
        model: model
      });
      expect(view.a1Handler).was.notCalled();
      expect(view.a2Handler).was.notCalled();
      expect(view.b1Handler).was.notCalled();
      expect(view.b2Handler).was.notCalled();
      model.set('a', 1);
      expect(view.a1Handler).was.calledOnce();
      expect(view.a2Handler).was.calledOnce();
      expect(view.b1Handler).was.notCalled();
      expect(view.b2Handler).was.notCalled();
      model.set('b', 2);
      expect(view.a1Handler).was.calledOnce();
      expect(view.a2Handler).was.calledOnce();
      expect(view.b1Handler).was.calledOnce();
      expect(view.b2Handler).was.calledOnce();
    });
    it('should bind to collection events declaratively', function() {
      collection = new Collection();
      view = new EventedView({
        collection: collection
      });
      expect(view.a1Handler).was.notCalled();
      expect(view.a2Handler).was.notCalled();
      expect(view.b1Handler).was.notCalled();
      expect(view.b2Handler).was.notCalled();
      collection.reset([{a: 1}]);
      expect(view.a1Handler).was.calledOnce();
      expect(view.a2Handler).was.calledOnce();
      expect(view.b1Handler).was.notCalled();
      expect(view.b2Handler).was.notCalled();
      collection.trigger('custom');
      expect(view.a1Handler).was.calledOnce();
      expect(view.a2Handler).was.calledOnce();
      expect(view.b1Handler).was.calledOnce();
      expect(view.b2Handler).was.calledOnce();
    });
    it('should bind to mediator events declaratively', function() {
      view = new EventedView();
      expect(view.a1Handler).was.notCalled();
      expect(view.a2Handler).was.notCalled();
      expect(view.b1Handler).was.notCalled();
      expect(view.b2Handler).was.notCalled();
      mediator.publish('ns:a');
      expect(view.a1Handler).was.calledOnce();
      expect(view.a2Handler).was.calledOnce();
      expect(view.b1Handler).was.notCalled();
      expect(view.b2Handler).was.notCalled();
      mediator.publish('ns:b');
      expect(view.a1Handler).was.calledOnce();
      expect(view.a2Handler).was.calledOnce();
      expect(view.b1Handler).was.calledOnce();
      expect(view.b2Handler).was.calledOnce();
    });
    it('should throw an error when corresponding method doesn’t exist', function() {
      var ErrorView = View.extend({
        listen: {
          'stuff': 'stuff'
        }
      });

      var Error2View = ConfiguredTestView.extend({
        events: {
          'stuff': 'stuff'
        },
      });
      expect(function() {
        new ErrorView;
      }).to.throwError();
      expect(function() {
        new Error2View;
      }).to.throwError();
    });
    it('should allow passing params to delegateEvents', function(done) {
      var spy;
      spy = sinon.spy();
      view = new AutoRenderView;
      view.delegateEvents({
        'click p': spy
      });
      window.clickOnElement(view.el.querySelector('p'));
      delay(function() {
        expect(spy).was.calledOnce();
        done();
      });
    });
    it('should register event handlers on the document declaratively', function() {
      var spy1 = sinon.spy(), spy2 = sinon.spy();
      var PreservedView = TestView.extend({
        autoRender: true,
        container: 'body',
        keepElement: true,
        events: {
          'click p': 'testClickHandler',
          click: spy2
        },
        testClickHandler: spy1,
      });
      view = new PreservedView;
      var parent = view.el;
      var el = parent.querySelector('p');
      window.clickOnElement(el);
      expect(spy1).was.called();
      expect(spy2).was.called();
      view.dispose();
      window.clickOnElement(el);
      expect(spy1.callCount).to.be(1);
      expect(spy2.callCount).to.be(1);
      parent.parentNode.removeChild(parent);
    });
    it('should register event handlers on the document programatically', function() {
      var spy1 = sinon.spy(), spy2 = sinon.spy();
      var PreservedView = TestView.extend({
        autoRender: true,

        container: 'body',

        keepElement: true
      });
      view = new PreservedView;
      view.testClickHandler = spy1;
      view.delegateEvents({
        'click p': 'testClickHandler',
        click: spy2
      });
      var parent = view.el;
      var el = parent.querySelector('p');
      window.clickOnElement(el);
      expect(spy1).was.called();
      expect(spy2).was.called();
      view.undelegateEvents();
      window.clickOnElement(el);
      expect(spy1.callCount).to.be(1);
      expect(spy2.callCount).to.be(1);
      parent.parentNode.removeChild(parent);
    });
  });
  it('should pass model attributes to the template function', function() {
    var passedTemplateData, templateData, templateFunc;
    setModel();
    sinon.spy(view, 'getTemplateData');
    passedTemplateData = null;
    templateFunc = sinon.stub().returns(template);
    sinon.stub(view, 'getTemplateFunction').returns(templateFunc);
    view.render();
    expect(view.getTemplateFunction).was.called();
    expect(view.getTemplateData).was.called();
    expect(templateFunc).was.called();
    templateData = templateFunc.lastCall.args[0];
    expect(templateData).to.be.an('object');
    expect(templateData.foo).to.be('foo');
    expect(templateData.bar).to.be('bar');
  });
  describe('Disposal', function() {
    it('should dispose itself correctly', function() {
      expect(view.dispose).to.be.a('function');
      view.dispose();
      expect(view.disposed).to.be(true);
      if (Object.isFrozen) {
        expect(Object.isFrozen(view)).to.be(true);
      }
    });
    it('should remove itself from the DOM', function() {
      view.el.id = 'disposed-view';
      document.body.appendChild(view.el);
      expect(document.querySelector('#disposed-view')).to.be["true"];
      view.dispose();
      expect(document.querySelector('#disposed-view')).to.be["false"];
    });
    it('should call Backbone.View#remove', function() {
      sinon.spy(view, 'remove');
      view.dispose();
      expect(view.remove).was.called();
    });
    it('should dispose subviews', function() {
      var subview;
      subview = new View();
      sinon.spy(subview, 'dispose');
      view.subview('foo', subview);
      view.dispose();
      expect(subview.disposed).to.be(true);
      expect(subview.dispose).was.called();
    });
    it('should unsubscribe from Pub/Sub events', function() {
      var spy;
      spy = sinon.spy();
      view.subscribeEvent('foo', spy);
      view.dispose();
      mediator.publish('foo');
      expect(spy).was.notCalled();
    });
    it('should unsubscribe from model events', function() {
      var spy;
      setModel();
      spy = sinon.spy();
      view.listenTo(view.model, 'foo', spy);
      view.dispose();
      model.trigger('foo');
      expect(spy).was.notCalled();
    });
    it('should remove all event handlers from itself', function() {
      var spy;
      spy = sinon.spy();
      view.on('foo', spy);
      view.dispose();
      view.trigger('foo');
      expect(spy).was.notCalled();
    });
    it('should remove instance properties', function() {
      view.dispose();
      var properties = ['el', '$el', 'options', 'model', 'collection', 'subviews', 'subviewsByName', '_callbacks'];
      _.each(properties, function(prop) {
        expect(view).not.to.have.own.property(prop);
      });
    });
    it('should dispose itself when the model is disposed', function() {
      model = new Model();
      view = new TestView({
        model: model
      });
      model.dispose();
      expect(model.disposed).to.be(true);
      expect(view.disposed).to.be(true);
    });
    it('should dispose itself when the collection is disposed', function() {
      collection = new Collection();
      view = new TestView({
        collection: collection
      });
      collection.dispose();
      expect(collection.disposed).to.be(true);
      expect(view.disposed).to.be(true);
    });
    it('should not dispose itself when the collection model is disposed', function() {
      collection = new Collection([{a: 1}, {a: 2}, {a: 3}]);
      view = new TestView({
        collection: collection
      });
      collection.at(0).dispose();
      expect(collection.disposed).to.be(false);
      expect(view.disposed).to.be(false);
    });
    it('should not render when disposed given render wasn’t overridden', function() {
      var renderResult;
      view = new View();
      view.getTemplateFunction = TestView.prototype.getTemplateFunction;
      sinon.spy(view, 'attach');
      renderResult = view.render();
      expect(renderResult).to.be(view);
      view.dispose();
      renderResult = view.render();
      expect(renderResult).to.be(false);
      expect(view.attach.callCount).to.be(1);
    });
    it('should not render when disposed given render was overridden', function() {
      var initial, renderResult;
      initial = testbed.children.length;
      view = new TestView({
        container: '#testbed'
      });
      sinon.spy(view, 'attach');
      renderResult = view.render();
      expect(renderResult).to.be(view);
      expect(view.attach.callCount).to.be(1);
      expect(renderCalled).to.be(true);
      expect(view.el.parentNode).to.be(testbed);
      view.dispose();
      renderResult = view.render();
      expect(renderResult).to.be(false);
      expect(renderCalled).to.be(true);
      expect(testbed.children.length).to.be(initial);
      expect(view.attach.callCount).to.be(1);
    });
  });
});
