var expect = require('chai').expect,
    sinon = require('sinon'),
    $ = require('jquery'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    View = require('../chaplin.view');

describe('Backbone.Chaplin.View', function() {
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
    model = new Backbone.Model({
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
  //     expect(view[name]).to.equal(EventBroker[name]);
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
    }).to.throw(Error, /must be overridden/);
  });
  it('should attach itself to an element automatically', function() {
    view = new TestView({
      container: testbed
    });
    expect(renderCalled).to.be.false;
    expect(view.el.parentNode).to.equal(null);
    view.render();
    expect(view.el.parentNode).to.equal(testbed);
  });
  it('should attach itself to a selector automatically', function() {
    view = new TestView({
      container: '#testbed'
    });
    view.render();
    expect(view.el.parentNode).to.equal(testbed);
  });
  it('should attach itself to a jQuery object automatically', function() {
    view = new TestView({
      container: $('#testbed')
    });
    view.render();
    expect(view.el.parentNode).to.equal(testbed);
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
    expect(view.el).to.equal(testbed.nextSibling);
    expect(view.el.parentNode).to.equal(testbed.parentNode);
  });
  it('should consider autoRender, container and containerMethod properties', function() {
    view = new ConfiguredTestView();
    expect(renderCalled).to.be.true;
    expect(view.el).to.equal(testbed.previousSibling);
    expect(view.el.parentNode).to.equal(testbed.parentNode);
  });
  it('should not attach itself more than once', function() {
    var spy;
    spy = sinon.spy(testbed, 'appendChild');
    view = new TestView({
      container: testbed
    });
    view.render();
    view.render();
    expect(spy.calledOnce).to.be.true;
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
      var parent = view.el.parentNode;
      if (parent) {
        return expect(parent.nodeType).to.equal(11);
      } else {
        return expect(parent).to.equal(null);
      }
    };
    var view1 = new NoAutoAttachView1;
    window.view1 = view1;
    expect(view1.attach.called).to.be.false
    check(view1);
    var view2 = new NoAutoAttachView2;
    expect(view2.attach.called).to.be.false;
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
  //   expect(instance2.el.parentElement.querySelector('section')).to.equal(null);
  //   instance1.dispose();
  //   return instance2.dispose();
  // });
  // it('should not wrap el with `tagName`', function() {
  //   var Test3View = View.extend({
  //     autoRender: true,
  //     tagName: 'section',
  //     noWrap: true,
  //     container: testbed,
  //     getTemplateFunction: function() {
  //       return function() {
  //         return '<div><p>View is not wrapped!</p><p>baz</p></div>';
  //       };
  //     }
  //   });
  //   var instance1 = new Test3View();
  //   expect(instance1.el.parentElement.querySelector('section')).to.equal(null);
  //   return instance1.dispose();
  // });
  it('should fire an addedToDOM event attaching itself to the DOM', function() {
    var spy;
    view = new TestView({
      container: testbed
    });
    spy = sinon.spy();
    view.on('addedToDOM', spy);
    view.render();
    expect(spy.called).to.be.true;
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
    expect(spy.called).to.be.true;
    view.undelegate();
    window.clickOnElement(view.el);
    expect(spy.callCount).to.equal(1);
    spy = sinon.spy();
    handler = view.delegate('click', 'p', spy);
    expect(handler).to.be.a('function');
    p = view.el.querySelector('p');
    window.clickOnElement(p);
    expect(spy.called).to.be.true;
    expect(function() {
      return view.delegate(spy);
    }).to.throw(Error);
    view.undelegate();
    window.clickOnElement(p);
    expect(spy.callCount).to.equal(1);
  });

  var simulateEvent = function(target, eventName, options) {
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
    expect(spy.calledOnce).to.be.true;
    expect(spy2.called).to.be.false;
    view.undelegate('click');
    simulateEvent(view.el, 'focus');
    window.clickOnElement(view.el);
    expect(spy.calledOnce).to.be.true;
    expect(spy2.calledOnce).to.be.true;
  });
  it('should check delegate parameters', function() {
    expect(function() {
      return view.delegate(1, 2, 3);
    }).to.throw(Error);
    expect(function() {
      return view.delegate('click', 'foo');
    }).to.throw(Error);
    expect(function() {
      return view.delegate('click', 'foo', 'bar');
    }).to.throw(Error);
    expect(function() {
      return view.delegate('click', 123);
    }).to.throw(Error);
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
        expect(d["a" + index + "Handler"].calledOnce).to.be.true;
      }
      for (_j = 0, _len = bcd.length; _j < _len; _j++) {
        index = bcd[_j];
        expect(d["" + index + "Handler"].called).to.be.false;
        d.click(index);
      }
      delay(function() {
        var _k, _len1;
        for (_k = 0, _len1 = bcd.length; _k < _len1; _k++) {
          index = bcd[_k];
          expect(d["" + index + "Handler"].calledOnce).to.be.true;
        }
        expect(d.globalHandler.callCount).to.equal(4);
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
    }).to.throw(Error);
  });
  it('should add and return subviews', function() {
    var subview, subview2;
    expect(view.subview).to.be.a('function');
    subview = new View();
    view.subview('fooSubview', subview);
    expect(view.subview('fooSubview')).to.equal(subview);
    expect(view.subviews.length).to.equal(1);
    subview2 = new View();
    view.subview('fooSubview', subview2);
    expect(view.subview('fooSubview')).to.equal(subview2);
    expect(view.subviews.length).to.equal(1);
  });
  it('should remove subviews', function() {
    var subview;
    expect(view.removeSubview).to.be.a('function');
    subview = new View();
    view.subview('fooSubview', subview);
    view.removeSubview('fooSubview');
    expect(typeof view.subview('fooSubview')).to.equal('undefined');
    expect(view.subviews.length).to.equal(0);
    subview = new View();
    view.subview('barSubview', subview);
    view.removeSubview(subview);
    expect(typeof view.subview('barSubview')).to.equal('undefined');
    expect(view.subviews.length).to.equal(0);
    view.removeSubview('');
    expect(view.subviews.length).to.equal(0);
  });
  it('should return empty template data without a model', function() {
    var templateData = view.getTemplateData();
    expect(templateData).to.be.an('object');
    expect(_.isEmpty(templateData)).to.be.true;
  });
  it('should return proper template data for a Chaplin model', function() {
    setModel();
    var templateData = view.getTemplateData();
    expect(templateData).to.be.an('object');
    expect(templateData.foo).to.equal('foo');
    expect(templateData.bar).to.equal('bar');
  });
  it('should return template data that protects the model', function() {
    setModel();
    var templateData = view.getTemplateData();
    templateData.qux = 'qux';
    expect(model.get('qux')).to.be.undefined;
  });
  it('should return proper template data for a Backbone model', function() {
    model = new Backbone.Model({
      foo: 'foo',
      bar: 'bar'
    });
    view.model = model;
    var templateData = view.getTemplateData();
    expect(templateData).to.be.an('object');
    expect(templateData.foo).to.equal('foo');
    expect(templateData.bar).to.equal('bar');
  });
  it('should return proper template data for Chaplin collections', function() {
    var model1 = new Backbone.Model({foo: 'foo'}), model2 = new Backbone.Model({bar: 'bar'});
    collection = new Backbone.Collection([model1, model2]);
    view.collection = collection;
    var data = view.getTemplateData();
    expect(data).to.be.an('object');
    expect(data).to.only.have.keys('items', 'length');
    expect(data.length).to.equal(2);
    var items = data.items;
    expect(items).to.be.an('array');
    expect(data.length).to.equal(items.length);
    expect(items[0]).to.be.an('object');
    expect(items[0].foo).to.equal('foo');
    expect(items[1]).to.be.an('object');
    expect(items[1].bar).to.equal('bar');
  });
  it('should return proper template data for Backbone collections', function() {
    var model1 = new Backbone.Model({foo: 'foo'}),
        model2 = new Backbone.Model({bar: 'bar'});
    collection = new Backbone.Collection([model1, model2]);
    view.collection = collection;
    var data = view.getTemplateData();
    expect(data).to.be.an('object');
    expect(data).to.only.have.keys('items', 'length');
    expect(data.length).to.equal(2);
    var items = data.items;
    expect(items).to.be.an('array');
    expect(items.length).to.equal(2);
    expect(items[0]).to.be.an('object');
    expect(items[0].foo).to.equal('foo');
    expect(items[1]).to.be.an('object');
    expect(items[1].bar).to.equal('bar');
  });
  // it('should add the SyncMachine state to the template data', function() {
  //   setModel();
  //   _.extend(model, SyncMachine);
  //   var templateData = view.getTemplateData();
  //   expect(templateData.synced).to.be.false;
  //   model.beginSync();
  //   model.finishSync();
  //   templateData = view.getTemplateData();
  //   expect(templateData.synced).to.be.true;
  // });
  // it('should not cover existing SyncMachine properties', function() {
  //   setModel();
  //   _.extend(model, SyncMachine);
  //   model.set({
  //     syncState: 'foo',
  //     synced: 'bar'
  //   });
  //   var templateData = view.getTemplateData();
  //   expect(templateData.syncState).to.equal('foo');
  //   expect(templateData.synced).to.equal('bar');
  // });
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
        View.prototype.initialize.apply(this, arguments);
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
        // 'ns:a mediator': 'a2Handler',
        // 'ns:b mediator': 'b2Handler'
      },

      initialize: function() {
        EventedViewParent.prototype.initialize.apply(this, arguments);
        this.a2Handler = sinon.spy();
        this.b2Handler = sinon.spy();
      }
    });
    it('should bind to own events declaratively', function() {
      view = new EventedView({
        model: new Backbone.Model
      });
      expect(view.a1Handler.called).to.be.false;
      expect(view.a2Handler.called).to.be.false;
      expect(view.b1Handler.called).to.be.false;
      expect(view.b2Handler.called).to.be.false;
      view.trigger('ns:a');
      expect(view.a1Handler.calledOnce).to.be.true;
      expect(view.a2Handler.calledOnce).to.be.true;
      expect(view.b1Handler.called).to.be.false;
      expect(view.b2Handler.called).to.be.false;
      view.trigger('ns:b');
      expect(view.a1Handler.calledOnce).to.be.true;
      expect(view.a2Handler.calledOnce).to.be.true;
      expect(view.b1Handler.calledOnce).to.be.true;
      expect(view.b2Handler.calledOnce).to.be.true;
    });
    it('should bind to model events declaratively', function() {
      model = new Backbone.Model();
      view = new EventedView({
        model: model
      });
      expect(view.a1Handler.called).to.be.false;
      expect(view.a2Handler.called).to.be.false;
      expect(view.b1Handler.called).to.be.false;
      expect(view.b2Handler.called).to.be.false;
      model.set('a', 1);
      expect(view.a1Handler.calledOnce).to.be.true;
      expect(view.a2Handler.calledOnce).to.be.true;
      expect(view.b1Handler.called).to.be.false;
      expect(view.b2Handler.called).to.be.false;
      model.set('b', 2);
      expect(view.a1Handler.calledOnce).to.be.true;
      expect(view.a2Handler.calledOnce).to.be.true;
      expect(view.b1Handler.calledOnce).to.be.true;
      expect(view.b2Handler.calledOnce).to.be.true;
    });
    it('should bind to collection events declaratively', function() {
      collection = new Backbone.Collection();
      view = new EventedView({
        collection: collection
      });
      expect(view.a1Handler.called).to.be.false;
      expect(view.a2Handler.called).to.be.false;
      expect(view.b1Handler.called).to.be.false;
      expect(view.b2Handler.called).to.be.false;
      collection.reset([{a: 1}]);
      expect(view.a1Handler.calledOnce).to.be.true;
      expect(view.a2Handler.calledOnce).to.be.true;
      expect(view.b1Handler.called).to.be.false;
      expect(view.b2Handler.called).to.be.false;
      collection.trigger('custom');
      expect(view.a1Handler.calledOnce).to.be.true;
      expect(view.a2Handler.calledOnce).to.be.true;
      expect(view.b1Handler.calledOnce).to.be.true;
      expect(view.b2Handler.calledOnce).to.be.true;
    });
    // it('should bind to mediator events declaratively', function() {
    //   view = new EventedView();
    //   expect(view.a1Handler.called).to.be.false;
    //   expect(view.a2Handler.called).to.be.false;
    //   expect(view.b1Handler.called).to.be.false;
    //   expect(view.b2Handler.called).to.be.false;
    //   mediator.publish('ns:a');
    //   expect(view.a1Handler.calledOnce).to.be.true;
    //   expect(view.a2Handler.calledOnce).to.be.true;
    //   expect(view.b1Handler.called).to.be.false;
    //   expect(view.b2Handler.called).to.be.false;
    //   mediator.publish('ns:b');
    //   expect(view.a1Handler.calledOnce).to.be.true;
    //   expect(view.a2Handler.calledOnce).to.be.true;
    //   expect(view.b1Handler.calledOnce).to.be.true;
    //   expect(view.b2Handler.calledOnce).to.be.true;
    // });
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
      }).to.throw(Error);
      expect(function() {
        new Error2View;
      }).to.throw(Error);
    });
    it('should allow passing params to delegateEvents', function(done) {
      var spy = sinon.spy();
      view = new AutoRenderView;
      view.delegateEvents({
        'click p': spy
      });
      window.clickOnElement(view.el.querySelector('p'));
      delay(function() {
        expect(spy.calledOnce).to.be.true;
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
      expect(spy1.called).to.be.true;
      expect(spy2.called).to.be.true;
      view.dispose();
      window.clickOnElement(el);
      expect(spy1.callCount).to.equal(1);
      expect(spy2.callCount).to.equal(1);
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
      expect(spy1.called).to.be.true;
      expect(spy2.called).to.be.true;
      view.undelegateEvents();
      window.clickOnElement(el);
      expect(spy1.callCount).to.equal(1);
      expect(spy2.callCount).to.equal(1);
      parent.parentNode.removeChild(parent);
    });
  });
  it('should pass model attributes to the template function', function() {
    setModel();
    sinon.spy(view, 'getTemplateData');
    var passedTemplateData = null;
    var templateFunc = sinon.stub().returns(template);
    sinon.stub(view, 'getTemplateFunction').returns(templateFunc);
    view.render();
    expect(view.getTemplateFunction.called).to.be.true;
    expect(view.getTemplateData.called).to.be.true;
    expect(templateFunc.called).to.be.true;
    var templateData = templateFunc.lastCall.args[0];
    expect(templateData).to.be.an('object');
    expect(templateData.foo).to.equal('foo');
    expect(templateData.bar).to.equal('bar');
  });
  describe('Disposal', function() {
    it('should dispose itself correctly', function() {
      expect(view.dispose).to.be.a('function');
      view.dispose();
      expect(view.disposed).to.be.true;
      if (Object.isFrozen) {
        expect(Object.isFrozen(view)).to.be.true;
      }
    });
    it('should remove itself from the DOM', function() {
      view.el.id = 'disposed-view';
      document.body.appendChild(view.el);
      expect(!!document.querySelector('#disposed-view')).to.be.true;
      view.dispose();
      expect(!!document.querySelector('#disposed-view')).to.be.false;
    });
    it('should call Backbone.View#remove', function() {
      sinon.spy(view, 'remove');
      view.dispose();
      expect(view.remove.called).to.be.true;
    });
    it('should dispose subviews', function() {
      var subview = new View();
      sinon.spy(subview, 'dispose');
      view.subview('foo', subview);
      view.dispose();
      expect(subview.disposed).to.be.true;
      expect(subview.dispose.called).to.be.true;
    });
    // it('should unsubscribe from Pub/Sub events', function() {
    //   var spy = sinon.spy();
    //   view.subscribeEvent('foo', spy);
    //   view.dispose();
    //   mediator.publish('foo');
    //   expect(spy.called).to.be.false;
    // });
    // it('should unsubscribe from model events', function() {
    //   setModel();
    //   var spy = sinon.spy();
    //   view.listenTo(view.model, 'foo', spy);
    //   view.dispose();
    //   model.trigger('foo');
    //   expect(spy.called).to.be.false;
    // });
    it('should remove all event handlers from itself', function() {
      var spy = sinon.spy();
      view.on('foo', spy);
      view.dispose();
      view.trigger('foo');
      expect(spy.called).to.be.false;
    });
    it('should remove instance properties', function() {
      view.dispose();
      var properties = ['el', '$el', 'options', 'model', 'collection', 'subviews', 'subviewsByName', '_callbacks'];
      _.each(properties, function(prop) {
        expect(view).not.to.have.ownProperty(prop);
      });
    });
    it('should dispose itself when the model is disposed', function() {
      model = new Backbone.Model();
      view = new TestView({
        model: model
      });
      model.trigger('dispose');
      // expect(model.disposed).to.be.true;
      expect(view.disposed).to.be.true;
    });
    it('should dispose itself when the collection is disposed', function() {
      collection = new Backbone.Collection;
      view = new TestView({
        collection: collection
      });
      collection.trigger('dispose');
      // expect(collection.disposed).to.be.true;
      expect(view.disposed).to.be.true;
    });
    it('should not dispose itself when the collection model is disposed', function() {
      collection = new Backbone.Collection([{a: 1}, {a: 2}, {a: 3}]);
      view = new TestView({
        collection: collection
      });
      collection.at(0).trigger('dispose');
      // expect(collection.disposed).to.be.false;
      expect(view.disposed).to.be.false;
    });
    it('should not render when disposed given render wasn’t overridden', function() {
      view = new View();
      view.getTemplateFunction = TestView.prototype.getTemplateFunction;
      sinon.spy(view, 'attach');
      var renderResult = view.render();
      expect(renderResult).to.equal(view);
      view.dispose();
      renderResult = view.render();
      expect(renderResult).to.be.false;
      expect(view.attach.callCount).to.equal(1);
    });
    it('should not render when disposed given render was overridden', function() {
      var initial = testbed.children.length;
      view = new TestView({
        container: '#testbed'
      });
      sinon.spy(view, 'attach');
      var renderResult = view.render();
      expect(renderResult).to.equal(view);
      expect(view.attach.callCount).to.equal(1);
      expect(renderCalled).to.be.true;
      expect(view.el.parentNode).to.equal(testbed);
      view.dispose();
      renderResult = view.render();
      expect(renderResult).to.be.false;
      expect(renderCalled).to.be.true;
      expect(testbed.children.length).to.equal(initial);
      expect(view.attach.callCount).to.equal(1);
    });
  });
});
