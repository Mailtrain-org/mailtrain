(function () {
var mobile = (function () {
  'use strict';

  var noop = function () {
  };
  var noarg = function (f) {
    return function () {
      return f();
    };
  };
  var compose = function (fa, fb) {
    return function () {
      return fa(fb.apply(null, arguments));
    };
  };
  var constant = function (value) {
    return function () {
      return value;
    };
  };
  var identity = function (x) {
    return x;
  };
  var tripleEquals = function (a, b) {
    return a === b;
  };
  var curry = function (f) {
    var args = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++)
      args[i - 1] = arguments[i];
    return function () {
      var newArgs = new Array(arguments.length);
      for (var j = 0; j < newArgs.length; j++)
        newArgs[j] = arguments[j];
      var all = args.concat(newArgs);
      return f.apply(null, all);
    };
  };
  var not = function (f) {
    return function () {
      return !f.apply(null, arguments);
    };
  };
  var die = function (msg) {
    return function () {
      throw new Error(msg);
    };
  };
  var apply = function (f) {
    return f();
  };
  var call = function (f) {
    f();
  };
  var never = constant(false);
  var always = constant(true);
  var $_9njj9iwjjdud7eix = {
    noop: noop,
    noarg: noarg,
    compose: compose,
    constant: constant,
    identity: identity,
    tripleEquals: tripleEquals,
    curry: curry,
    not: not,
    die: die,
    apply: apply,
    call: call,
    never: never,
    always: always
  };

  var $_brmbwvwijdud7eiu = {
    contextmenu: $_9njj9iwjjdud7eix.constant('contextmenu'),
    touchstart: $_9njj9iwjjdud7eix.constant('touchstart'),
    touchmove: $_9njj9iwjjdud7eix.constant('touchmove'),
    touchend: $_9njj9iwjjdud7eix.constant('touchend'),
    gesturestart: $_9njj9iwjjdud7eix.constant('gesturestart'),
    mousedown: $_9njj9iwjjdud7eix.constant('mousedown'),
    mousemove: $_9njj9iwjjdud7eix.constant('mousemove'),
    mouseout: $_9njj9iwjjdud7eix.constant('mouseout'),
    mouseup: $_9njj9iwjjdud7eix.constant('mouseup'),
    mouseover: $_9njj9iwjjdud7eix.constant('mouseover'),
    focusin: $_9njj9iwjjdud7eix.constant('focusin'),
    keydown: $_9njj9iwjjdud7eix.constant('keydown'),
    input: $_9njj9iwjjdud7eix.constant('input'),
    change: $_9njj9iwjjdud7eix.constant('change'),
    focus: $_9njj9iwjjdud7eix.constant('focus'),
    click: $_9njj9iwjjdud7eix.constant('click'),
    transitionend: $_9njj9iwjjdud7eix.constant('transitionend'),
    selectstart: $_9njj9iwjjdud7eix.constant('selectstart')
  };

  var cached = function (f) {
    var called = false;
    var r;
    return function () {
      if (!called) {
        called = true;
        r = f.apply(null, arguments);
      }
      return r;
    };
  };
  var $_2nf0bewljdud7ej2 = { cached: cached };

  var firstMatch = function (regexes, s) {
    for (var i = 0; i < regexes.length; i++) {
      var x = regexes[i];
      if (x.test(s))
        return x;
    }
    return undefined;
  };
  var find = function (regexes, agent) {
    var r = firstMatch(regexes, agent);
    if (!r)
      return {
        major: 0,
        minor: 0
      };
    var group = function (i) {
      return Number(agent.replace(r, '$' + i));
    };
    return nu(group(1), group(2));
  };
  var detect = function (versionRegexes, agent) {
    var cleanedAgent = String(agent).toLowerCase();
    if (versionRegexes.length === 0)
      return unknown();
    return find(versionRegexes, cleanedAgent);
  };
  var unknown = function () {
    return nu(0, 0);
  };
  var nu = function (major, minor) {
    return {
      major: major,
      minor: minor
    };
  };
  var $_f0l90ewojdud7ej7 = {
    nu: nu,
    detect: detect,
    unknown: unknown
  };

  var edge = 'Edge';
  var chrome = 'Chrome';
  var ie = 'IE';
  var opera = 'Opera';
  var firefox = 'Firefox';
  var safari = 'Safari';
  var isBrowser = function (name, current) {
    return function () {
      return current === name;
    };
  };
  var unknown$1 = function () {
    return nu$1({
      current: undefined,
      version: $_f0l90ewojdud7ej7.unknown()
    });
  };
  var nu$1 = function (info) {
    var current = info.current;
    var version = info.version;
    return {
      current: current,
      version: version,
      isEdge: isBrowser(edge, current),
      isChrome: isBrowser(chrome, current),
      isIE: isBrowser(ie, current),
      isOpera: isBrowser(opera, current),
      isFirefox: isBrowser(firefox, current),
      isSafari: isBrowser(safari, current)
    };
  };
  var $_b24lawnjdud7ej4 = {
    unknown: unknown$1,
    nu: nu$1,
    edge: $_9njj9iwjjdud7eix.constant(edge),
    chrome: $_9njj9iwjjdud7eix.constant(chrome),
    ie: $_9njj9iwjjdud7eix.constant(ie),
    opera: $_9njj9iwjjdud7eix.constant(opera),
    firefox: $_9njj9iwjjdud7eix.constant(firefox),
    safari: $_9njj9iwjjdud7eix.constant(safari)
  };

  var windows = 'Windows';
  var ios = 'iOS';
  var android = 'Android';
  var linux = 'Linux';
  var osx = 'OSX';
  var solaris = 'Solaris';
  var freebsd = 'FreeBSD';
  var isOS = function (name, current) {
    return function () {
      return current === name;
    };
  };
  var unknown$2 = function () {
    return nu$2({
      current: undefined,
      version: $_f0l90ewojdud7ej7.unknown()
    });
  };
  var nu$2 = function (info) {
    var current = info.current;
    var version = info.version;
    return {
      current: current,
      version: version,
      isWindows: isOS(windows, current),
      isiOS: isOS(ios, current),
      isAndroid: isOS(android, current),
      isOSX: isOS(osx, current),
      isLinux: isOS(linux, current),
      isSolaris: isOS(solaris, current),
      isFreeBSD: isOS(freebsd, current)
    };
  };
  var $_7etfbawpjdud7ejh = {
    unknown: unknown$2,
    nu: nu$2,
    windows: $_9njj9iwjjdud7eix.constant(windows),
    ios: $_9njj9iwjjdud7eix.constant(ios),
    android: $_9njj9iwjjdud7eix.constant(android),
    linux: $_9njj9iwjjdud7eix.constant(linux),
    osx: $_9njj9iwjjdud7eix.constant(osx),
    solaris: $_9njj9iwjjdud7eix.constant(solaris),
    freebsd: $_9njj9iwjjdud7eix.constant(freebsd)
  };

  function DeviceType (os, browser, userAgent) {
    var isiPad = os.isiOS() && /ipad/i.test(userAgent) === true;
    var isiPhone = os.isiOS() && !isiPad;
    var isAndroid3 = os.isAndroid() && os.version.major === 3;
    var isAndroid4 = os.isAndroid() && os.version.major === 4;
    var isTablet = isiPad || isAndroid3 || isAndroid4 && /mobile/i.test(userAgent) === true;
    var isTouch = os.isiOS() || os.isAndroid();
    var isPhone = isTouch && !isTablet;
    var iOSwebview = browser.isSafari() && os.isiOS() && /safari/i.test(userAgent) === false;
    return {
      isiPad: $_9njj9iwjjdud7eix.constant(isiPad),
      isiPhone: $_9njj9iwjjdud7eix.constant(isiPhone),
      isTablet: $_9njj9iwjjdud7eix.constant(isTablet),
      isPhone: $_9njj9iwjjdud7eix.constant(isPhone),
      isTouch: $_9njj9iwjjdud7eix.constant(isTouch),
      isAndroid: os.isAndroid,
      isiOS: os.isiOS,
      isWebView: $_9njj9iwjjdud7eix.constant(iOSwebview)
    };
  }

  var never$1 = $_9njj9iwjjdud7eix.never;
  var always$1 = $_9njj9iwjjdud7eix.always;
  var none = function () {
    return NONE;
  };
  var NONE = function () {
    var eq = function (o) {
      return o.isNone();
    };
    var call = function (thunk) {
      return thunk();
    };
    var id = function (n) {
      return n;
    };
    var noop = function () {
    };
    var me = {
      fold: function (n, s) {
        return n();
      },
      is: never$1,
      isSome: never$1,
      isNone: always$1,
      getOr: id,
      getOrThunk: call,
      getOrDie: function (msg) {
        throw new Error(msg || 'error: getOrDie called on none.');
      },
      or: id,
      orThunk: call,
      map: none,
      ap: none,
      each: noop,
      bind: none,
      flatten: none,
      exists: never$1,
      forall: always$1,
      filter: none,
      equals: eq,
      equals_: eq,
      toArray: function () {
        return [];
      },
      toString: $_9njj9iwjjdud7eix.constant('none()')
    };
    if (Object.freeze)
      Object.freeze(me);
    return me;
  }();
  var some = function (a) {
    var constant_a = function () {
      return a;
    };
    var self = function () {
      return me;
    };
    var map = function (f) {
      return some(f(a));
    };
    var bind = function (f) {
      return f(a);
    };
    var me = {
      fold: function (n, s) {
        return s(a);
      },
      is: function (v) {
        return a === v;
      },
      isSome: always$1,
      isNone: never$1,
      getOr: constant_a,
      getOrThunk: constant_a,
      getOrDie: constant_a,
      or: self,
      orThunk: self,
      map: map,
      ap: function (optfab) {
        return optfab.fold(none, function (fab) {
          return some(fab(a));
        });
      },
      each: function (f) {
        f(a);
      },
      bind: bind,
      flatten: constant_a,
      exists: bind,
      forall: bind,
      filter: function (f) {
        return f(a) ? me : NONE;
      },
      equals: function (o) {
        return o.is(a);
      },
      equals_: function (o, elementEq) {
        return o.fold(never$1, function (b) {
          return elementEq(a, b);
        });
      },
      toArray: function () {
        return [a];
      },
      toString: function () {
        return 'some(' + a + ')';
      }
    };
    return me;
  };
  var from = function (value) {
    return value === null || value === undefined ? NONE : some(value);
  };
  var Option = {
    some: some,
    none: none,
    from: from
  };

  var rawIndexOf = function () {
    var pIndexOf = Array.prototype.indexOf;
    var fastIndex = function (xs, x) {
      return pIndexOf.call(xs, x);
    };
    var slowIndex = function (xs, x) {
      return slowIndexOf(xs, x);
    };
    return pIndexOf === undefined ? slowIndex : fastIndex;
  }();
  var indexOf = function (xs, x) {
    var r = rawIndexOf(xs, x);
    return r === -1 ? Option.none() : Option.some(r);
  };
  var contains = function (xs, x) {
    return rawIndexOf(xs, x) > -1;
  };
  var exists = function (xs, pred) {
    return findIndex(xs, pred).isSome();
  };
  var range = function (num, f) {
    var r = [];
    for (var i = 0; i < num; i++) {
      r.push(f(i));
    }
    return r;
  };
  var chunk = function (array, size) {
    var r = [];
    for (var i = 0; i < array.length; i += size) {
      var s = array.slice(i, i + size);
      r.push(s);
    }
    return r;
  };
  var map = function (xs, f) {
    var len = xs.length;
    var r = new Array(len);
    for (var i = 0; i < len; i++) {
      var x = xs[i];
      r[i] = f(x, i, xs);
    }
    return r;
  };
  var each = function (xs, f) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      f(x, i, xs);
    }
  };
  var eachr = function (xs, f) {
    for (var i = xs.length - 1; i >= 0; i--) {
      var x = xs[i];
      f(x, i, xs);
    }
  };
  var partition = function (xs, pred) {
    var pass = [];
    var fail = [];
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      var arr = pred(x, i, xs) ? pass : fail;
      arr.push(x);
    }
    return {
      pass: pass,
      fail: fail
    };
  };
  var filter = function (xs, pred) {
    var r = [];
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        r.push(x);
      }
    }
    return r;
  };
  var groupBy = function (xs, f) {
    if (xs.length === 0) {
      return [];
    } else {
      var wasType = f(xs[0]);
      var r = [];
      var group = [];
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        var type = f(x);
        if (type !== wasType) {
          r.push(group);
          group = [];
        }
        wasType = type;
        group.push(x);
      }
      if (group.length !== 0) {
        r.push(group);
      }
      return r;
    }
  };
  var foldr = function (xs, f, acc) {
    eachr(xs, function (x) {
      acc = f(acc, x);
    });
    return acc;
  };
  var foldl = function (xs, f, acc) {
    each(xs, function (x) {
      acc = f(acc, x);
    });
    return acc;
  };
  var find$1 = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        return Option.some(x);
      }
    }
    return Option.none();
  };
  var findIndex = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        return Option.some(i);
      }
    }
    return Option.none();
  };
  var slowIndexOf = function (xs, x) {
    for (var i = 0, len = xs.length; i < len; ++i) {
      if (xs[i] === x) {
        return i;
      }
    }
    return -1;
  };
  var push = Array.prototype.push;
  var flatten = function (xs) {
    var r = [];
    for (var i = 0, len = xs.length; i < len; ++i) {
      if (!Array.prototype.isPrototypeOf(xs[i]))
        throw new Error('Arr.flatten item ' + i + ' was not an array, input: ' + xs);
      push.apply(r, xs[i]);
    }
    return r;
  };
  var bind = function (xs, f) {
    var output = map(xs, f);
    return flatten(output);
  };
  var forall = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; ++i) {
      var x = xs[i];
      if (pred(x, i, xs) !== true) {
        return false;
      }
    }
    return true;
  };
  var equal = function (a1, a2) {
    return a1.length === a2.length && forall(a1, function (x, i) {
      return x === a2[i];
    });
  };
  var slice = Array.prototype.slice;
  var reverse = function (xs) {
    var r = slice.call(xs, 0);
    r.reverse();
    return r;
  };
  var difference = function (a1, a2) {
    return filter(a1, function (x) {
      return !contains(a2, x);
    });
  };
  var mapToObject = function (xs, f) {
    var r = {};
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      r[String(x)] = f(x, i);
    }
    return r;
  };
  var pure = function (x) {
    return [x];
  };
  var sort = function (xs, comparator) {
    var copy = slice.call(xs, 0);
    copy.sort(comparator);
    return copy;
  };
  var head = function (xs) {
    return xs.length === 0 ? Option.none() : Option.some(xs[0]);
  };
  var last = function (xs) {
    return xs.length === 0 ? Option.none() : Option.some(xs[xs.length - 1]);
  };
  var $_1g2cevwsjdud7ejp = {
    map: map,
    each: each,
    eachr: eachr,
    partition: partition,
    filter: filter,
    groupBy: groupBy,
    indexOf: indexOf,
    foldr: foldr,
    foldl: foldl,
    find: find$1,
    findIndex: findIndex,
    flatten: flatten,
    bind: bind,
    forall: forall,
    exists: exists,
    contains: contains,
    equal: equal,
    reverse: reverse,
    chunk: chunk,
    difference: difference,
    mapToObject: mapToObject,
    pure: pure,
    sort: sort,
    range: range,
    head: head,
    last: last
  };

  var detect$1 = function (candidates, userAgent) {
    var agent = String(userAgent).toLowerCase();
    return $_1g2cevwsjdud7ejp.find(candidates, function (candidate) {
      return candidate.search(agent);
    });
  };
  var detectBrowser = function (browsers, userAgent) {
    return detect$1(browsers, userAgent).map(function (browser) {
      var version = $_f0l90ewojdud7ej7.detect(browser.versionRegexes, userAgent);
      return {
        current: browser.name,
        version: version
      };
    });
  };
  var detectOs = function (oses, userAgent) {
    return detect$1(oses, userAgent).map(function (os) {
      var version = $_f0l90ewojdud7ej7.detect(os.versionRegexes, userAgent);
      return {
        current: os.name,
        version: version
      };
    });
  };
  var $_72dxucwrjdud7ejm = {
    detectBrowser: detectBrowser,
    detectOs: detectOs
  };

  var addToStart = function (str, prefix) {
    return prefix + str;
  };
  var addToEnd = function (str, suffix) {
    return str + suffix;
  };
  var removeFromStart = function (str, numChars) {
    return str.substring(numChars);
  };
  var removeFromEnd = function (str, numChars) {
    return str.substring(0, str.length - numChars);
  };
  var $_2u10wgwwjdud7ek7 = {
    addToStart: addToStart,
    addToEnd: addToEnd,
    removeFromStart: removeFromStart,
    removeFromEnd: removeFromEnd
  };

  var first = function (str, count) {
    return str.substr(0, count);
  };
  var last$1 = function (str, count) {
    return str.substr(str.length - count, str.length);
  };
  var head$1 = function (str) {
    return str === '' ? Option.none() : Option.some(str.substr(0, 1));
  };
  var tail = function (str) {
    return str === '' ? Option.none() : Option.some(str.substring(1));
  };
  var $_elr1mrwxjdud7ek8 = {
    first: first,
    last: last$1,
    head: head$1,
    tail: tail
  };

  var checkRange = function (str, substr, start) {
    if (substr === '')
      return true;
    if (str.length < substr.length)
      return false;
    var x = str.substr(start, start + substr.length);
    return x === substr;
  };
  var supplant = function (str, obj) {
    var isStringOrNumber = function (a) {
      var t = typeof a;
      return t === 'string' || t === 'number';
    };
    return str.replace(/\${([^{}]*)}/g, function (a, b) {
      var value = obj[b];
      return isStringOrNumber(value) ? value : a;
    });
  };
  var removeLeading = function (str, prefix) {
    return startsWith(str, prefix) ? $_2u10wgwwjdud7ek7.removeFromStart(str, prefix.length) : str;
  };
  var removeTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? $_2u10wgwwjdud7ek7.removeFromEnd(str, prefix.length) : str;
  };
  var ensureLeading = function (str, prefix) {
    return startsWith(str, prefix) ? str : $_2u10wgwwjdud7ek7.addToStart(str, prefix);
  };
  var ensureTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? str : $_2u10wgwwjdud7ek7.addToEnd(str, prefix);
  };
  var contains$1 = function (str, substr) {
    return str.indexOf(substr) !== -1;
  };
  var capitalize = function (str) {
    return $_elr1mrwxjdud7ek8.head(str).bind(function (head) {
      return $_elr1mrwxjdud7ek8.tail(str).map(function (tail) {
        return head.toUpperCase() + tail;
      });
    }).getOr(str);
  };
  var startsWith = function (str, prefix) {
    return checkRange(str, prefix, 0);
  };
  var endsWith = function (str, suffix) {
    return checkRange(str, suffix, str.length - suffix.length);
  };
  var trim = function (str) {
    return str.replace(/^\s+|\s+$/g, '');
  };
  var lTrim = function (str) {
    return str.replace(/^\s+/g, '');
  };
  var rTrim = function (str) {
    return str.replace(/\s+$/g, '');
  };
  var $_2e2eauwvjdud7ek5 = {
    supplant: supplant,
    startsWith: startsWith,
    removeLeading: removeLeading,
    removeTrailing: removeTrailing,
    ensureLeading: ensureLeading,
    ensureTrailing: ensureTrailing,
    endsWith: endsWith,
    contains: contains$1,
    trim: trim,
    lTrim: lTrim,
    rTrim: rTrim,
    capitalize: capitalize
  };

  var normalVersionRegex = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/;
  var checkContains = function (target) {
    return function (uastring) {
      return $_2e2eauwvjdud7ek5.contains(uastring, target);
    };
  };
  var browsers = [
    {
      name: 'Edge',
      versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
      search: function (uastring) {
        var monstrosity = $_2e2eauwvjdud7ek5.contains(uastring, 'edge/') && $_2e2eauwvjdud7ek5.contains(uastring, 'chrome') && $_2e2eauwvjdud7ek5.contains(uastring, 'safari') && $_2e2eauwvjdud7ek5.contains(uastring, 'applewebkit');
        return monstrosity;
      }
    },
    {
      name: 'Chrome',
      versionRegexes: [
        /.*?chrome\/([0-9]+)\.([0-9]+).*/,
        normalVersionRegex
      ],
      search: function (uastring) {
        return $_2e2eauwvjdud7ek5.contains(uastring, 'chrome') && !$_2e2eauwvjdud7ek5.contains(uastring, 'chromeframe');
      }
    },
    {
      name: 'IE',
      versionRegexes: [
        /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
        /.*?rv:([0-9]+)\.([0-9]+).*/
      ],
      search: function (uastring) {
        return $_2e2eauwvjdud7ek5.contains(uastring, 'msie') || $_2e2eauwvjdud7ek5.contains(uastring, 'trident');
      }
    },
    {
      name: 'Opera',
      versionRegexes: [
        normalVersionRegex,
        /.*?opera\/([0-9]+)\.([0-9]+).*/
      ],
      search: checkContains('opera')
    },
    {
      name: 'Firefox',
      versionRegexes: [/.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/],
      search: checkContains('firefox')
    },
    {
      name: 'Safari',
      versionRegexes: [
        normalVersionRegex,
        /.*?cpu os ([0-9]+)_([0-9]+).*/
      ],
      search: function (uastring) {
        return ($_2e2eauwvjdud7ek5.contains(uastring, 'safari') || $_2e2eauwvjdud7ek5.contains(uastring, 'mobile/')) && $_2e2eauwvjdud7ek5.contains(uastring, 'applewebkit');
      }
    }
  ];
  var oses = [
    {
      name: 'Windows',
      search: checkContains('win'),
      versionRegexes: [/.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/]
    },
    {
      name: 'iOS',
      search: function (uastring) {
        return $_2e2eauwvjdud7ek5.contains(uastring, 'iphone') || $_2e2eauwvjdud7ek5.contains(uastring, 'ipad');
      },
      versionRegexes: [
        /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
        /.*cpu os ([0-9]+)_([0-9]+).*/,
        /.*cpu iphone os ([0-9]+)_([0-9]+).*/
      ]
    },
    {
      name: 'Android',
      search: checkContains('android'),
      versionRegexes: [/.*?android\ ?([0-9]+)\.([0-9]+).*/]
    },
    {
      name: 'OSX',
      search: checkContains('os x'),
      versionRegexes: [/.*?os\ x\ ?([0-9]+)_([0-9]+).*/]
    },
    {
      name: 'Linux',
      search: checkContains('linux'),
      versionRegexes: []
    },
    {
      name: 'Solaris',
      search: checkContains('sunos'),
      versionRegexes: []
    },
    {
      name: 'FreeBSD',
      search: checkContains('freebsd'),
      versionRegexes: []
    }
  ];
  var $_96jjecwujdud7ek0 = {
    browsers: $_9njj9iwjjdud7eix.constant(browsers),
    oses: $_9njj9iwjjdud7eix.constant(oses)
  };

  var detect$2 = function (userAgent) {
    var browsers = $_96jjecwujdud7ek0.browsers();
    var oses = $_96jjecwujdud7ek0.oses();
    var browser = $_72dxucwrjdud7ejm.detectBrowser(browsers, userAgent).fold($_b24lawnjdud7ej4.unknown, $_b24lawnjdud7ej4.nu);
    var os = $_72dxucwrjdud7ejm.detectOs(oses, userAgent).fold($_7etfbawpjdud7ejh.unknown, $_7etfbawpjdud7ejh.nu);
    var deviceType = DeviceType(os, browser, userAgent);
    return {
      browser: browser,
      os: os,
      deviceType: deviceType
    };
  };
  var $_63bkauwmjdud7ej3 = { detect: detect$2 };

  var detect$3 = $_2nf0bewljdud7ej2.cached(function () {
    var userAgent = navigator.userAgent;
    return $_63bkauwmjdud7ej3.detect(userAgent);
  });
  var $_chh2cvwkjdud7ej0 = { detect: detect$3 };

  var alloy = { tap: $_9njj9iwjjdud7eix.constant('alloy.tap') };
  var $_801kkqwhjdud7eiq = {
    focus: $_9njj9iwjjdud7eix.constant('alloy.focus'),
    postBlur: $_9njj9iwjjdud7eix.constant('alloy.blur.post'),
    receive: $_9njj9iwjjdud7eix.constant('alloy.receive'),
    execute: $_9njj9iwjjdud7eix.constant('alloy.execute'),
    focusItem: $_9njj9iwjjdud7eix.constant('alloy.focus.item'),
    tap: alloy.tap,
    tapOrClick: $_chh2cvwkjdud7ej0.detect().deviceType.isTouch() ? alloy.tap : $_brmbwvwijdud7eiu.click,
    longpress: $_9njj9iwjjdud7eix.constant('alloy.longpress'),
    sandboxClose: $_9njj9iwjjdud7eix.constant('alloy.sandbox.close'),
    systemInit: $_9njj9iwjjdud7eix.constant('alloy.system.init'),
    windowScroll: $_9njj9iwjjdud7eix.constant('alloy.system.scroll'),
    attachedToDom: $_9njj9iwjjdud7eix.constant('alloy.system.attached'),
    detachedFromDom: $_9njj9iwjjdud7eix.constant('alloy.system.detached'),
    changeTab: $_9njj9iwjjdud7eix.constant('alloy.change.tab'),
    dismissTab: $_9njj9iwjjdud7eix.constant('alloy.dismiss.tab')
  };

  var typeOf = function (x) {
    if (x === null)
      return 'null';
    var t = typeof x;
    if (t === 'object' && Array.prototype.isPrototypeOf(x))
      return 'array';
    if (t === 'object' && String.prototype.isPrototypeOf(x))
      return 'string';
    return t;
  };
  var isType = function (type) {
    return function (value) {
      return typeOf(value) === type;
    };
  };
  var $_9rljuwzjdud7ekb = {
    isString: isType('string'),
    isObject: isType('object'),
    isArray: isType('array'),
    isNull: isType('null'),
    isBoolean: isType('boolean'),
    isUndefined: isType('undefined'),
    isFunction: isType('function'),
    isNumber: isType('number')
  };

  var shallow = function (old, nu) {
    return nu;
  };
  var deep = function (old, nu) {
    var bothObjects = $_9rljuwzjdud7ekb.isObject(old) && $_9rljuwzjdud7ekb.isObject(nu);
    return bothObjects ? deepMerge(old, nu) : nu;
  };
  var baseMerge = function (merger) {
    return function () {
      var objects = new Array(arguments.length);
      for (var i = 0; i < objects.length; i++)
        objects[i] = arguments[i];
      if (objects.length === 0)
        throw new Error('Can\'t merge zero objects');
      var ret = {};
      for (var j = 0; j < objects.length; j++) {
        var curObject = objects[j];
        for (var key in curObject)
          if (curObject.hasOwnProperty(key)) {
            ret[key] = merger(ret[key], curObject[key]);
          }
      }
      return ret;
    };
  };
  var deepMerge = baseMerge(deep);
  var merge = baseMerge(shallow);
  var $_73qnwowyjdud7ek9 = {
    deepMerge: deepMerge,
    merge: merge
  };

  var keys = function () {
    var fastKeys = Object.keys;
    var slowKeys = function (o) {
      var r = [];
      for (var i in o) {
        if (o.hasOwnProperty(i)) {
          r.push(i);
        }
      }
      return r;
    };
    return fastKeys === undefined ? slowKeys : fastKeys;
  }();
  var each$1 = function (obj, f) {
    var props = keys(obj);
    for (var k = 0, len = props.length; k < len; k++) {
      var i = props[k];
      var x = obj[i];
      f(x, i, obj);
    }
  };
  var objectMap = function (obj, f) {
    return tupleMap(obj, function (x, i, obj) {
      return {
        k: i,
        v: f(x, i, obj)
      };
    });
  };
  var tupleMap = function (obj, f) {
    var r = {};
    each$1(obj, function (x, i) {
      var tuple = f(x, i, obj);
      r[tuple.k] = tuple.v;
    });
    return r;
  };
  var bifilter = function (obj, pred) {
    var t = {};
    var f = {};
    each$1(obj, function (x, i) {
      var branch = pred(x, i) ? t : f;
      branch[i] = x;
    });
    return {
      t: t,
      f: f
    };
  };
  var mapToArray = function (obj, f) {
    var r = [];
    each$1(obj, function (value, name) {
      r.push(f(value, name));
    });
    return r;
  };
  var find$2 = function (obj, pred) {
    var props = keys(obj);
    for (var k = 0, len = props.length; k < len; k++) {
      var i = props[k];
      var x = obj[i];
      if (pred(x, i, obj)) {
        return Option.some(x);
      }
    }
    return Option.none();
  };
  var values = function (obj) {
    return mapToArray(obj, function (v) {
      return v;
    });
  };
  var size = function (obj) {
    return values(obj).length;
  };
  var $_2dykn0x0jdud7ekc = {
    bifilter: bifilter,
    each: each$1,
    map: objectMap,
    mapToArray: mapToArray,
    tupleMap: tupleMap,
    find: find$2,
    keys: keys,
    values: values,
    size: size
  };

  var emit = function (component, event) {
    dispatchWith(component, component.element(), event, {});
  };
  var emitWith = function (component, event, properties) {
    dispatchWith(component, component.element(), event, properties);
  };
  var emitExecute = function (component) {
    emit(component, $_801kkqwhjdud7eiq.execute());
  };
  var dispatch = function (component, target, event) {
    dispatchWith(component, target, event, {});
  };
  var dispatchWith = function (component, target, event, properties) {
    var data = $_73qnwowyjdud7ek9.deepMerge({ target: target }, properties);
    component.getSystem().triggerEvent(event, target, $_2dykn0x0jdud7ekc.map(data, $_9njj9iwjjdud7eix.constant));
  };
  var dispatchEvent = function (component, target, event, simulatedEvent) {
    component.getSystem().triggerEvent(event, target, simulatedEvent.event());
  };
  var dispatchFocus = function (component, target) {
    component.getSystem().triggerFocus(target, component.element());
  };
  var $_98da6jwgjdud7eil = {
    emit: emit,
    emitWith: emitWith,
    emitExecute: emitExecute,
    dispatch: dispatch,
    dispatchWith: dispatchWith,
    dispatchEvent: dispatchEvent,
    dispatchFocus: dispatchFocus
  };

  function Immutable () {
    var fields = arguments;
    return function () {
      var values = new Array(arguments.length);
      for (var i = 0; i < values.length; i++)
        values[i] = arguments[i];
      if (fields.length !== values.length)
        throw new Error('Wrong number of arguments to struct. Expected "[' + fields.length + ']", got ' + values.length + ' arguments');
      var struct = {};
      $_1g2cevwsjdud7ejp.each(fields, function (name, i) {
        struct[name] = $_9njj9iwjjdud7eix.constant(values[i]);
      });
      return struct;
    };
  }

  var sort$1 = function (arr) {
    return arr.slice(0).sort();
  };
  var reqMessage = function (required, keys) {
    throw new Error('All required keys (' + sort$1(required).join(', ') + ') were not specified. Specified keys were: ' + sort$1(keys).join(', ') + '.');
  };
  var unsuppMessage = function (unsupported) {
    throw new Error('Unsupported keys for object: ' + sort$1(unsupported).join(', '));
  };
  var validateStrArr = function (label, array) {
    if (!$_9rljuwzjdud7ekb.isArray(array))
      throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
    $_1g2cevwsjdud7ejp.each(array, function (a) {
      if (!$_9rljuwzjdud7ekb.isString(a))
        throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
    });
  };
  var invalidTypeMessage = function (incorrect, type) {
    throw new Error('All values need to be of type: ' + type + '. Keys (' + sort$1(incorrect).join(', ') + ') were not.');
  };
  var checkDupes = function (everything) {
    var sorted = sort$1(everything);
    var dupe = $_1g2cevwsjdud7ejp.find(sorted, function (s, i) {
      return i < sorted.length - 1 && s === sorted[i + 1];
    });
    dupe.each(function (d) {
      throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
    });
  };
  var $_1ie102x7jdud7el4 = {
    sort: sort$1,
    reqMessage: reqMessage,
    unsuppMessage: unsuppMessage,
    validateStrArr: validateStrArr,
    invalidTypeMessage: invalidTypeMessage,
    checkDupes: checkDupes
  };

  function MixedBag (required, optional) {
    var everything = required.concat(optional);
    if (everything.length === 0)
      throw new Error('You must specify at least one required or optional field.');
    $_1ie102x7jdud7el4.validateStrArr('required', required);
    $_1ie102x7jdud7el4.validateStrArr('optional', optional);
    $_1ie102x7jdud7el4.checkDupes(everything);
    return function (obj) {
      var keys = $_2dykn0x0jdud7ekc.keys(obj);
      var allReqd = $_1g2cevwsjdud7ejp.forall(required, function (req) {
        return $_1g2cevwsjdud7ejp.contains(keys, req);
      });
      if (!allReqd)
        $_1ie102x7jdud7el4.reqMessage(required, keys);
      var unsupported = $_1g2cevwsjdud7ejp.filter(keys, function (key) {
        return !$_1g2cevwsjdud7ejp.contains(everything, key);
      });
      if (unsupported.length > 0)
        $_1ie102x7jdud7el4.unsuppMessage(unsupported);
      var r = {};
      $_1g2cevwsjdud7ejp.each(required, function (req) {
        r[req] = $_9njj9iwjjdud7eix.constant(obj[req]);
      });
      $_1g2cevwsjdud7ejp.each(optional, function (opt) {
        r[opt] = $_9njj9iwjjdud7eix.constant(Object.prototype.hasOwnProperty.call(obj, opt) ? Option.some(obj[opt]) : Option.none());
      });
      return r;
    };
  }

  var $_8o1q69x4jdud7ekz = {
    immutable: Immutable,
    immutableBag: MixedBag
  };

  var toArray = function (target, f) {
    var r = [];
    var recurse = function (e) {
      r.push(e);
      return f(e);
    };
    var cur = f(target);
    do {
      cur = cur.bind(recurse);
    } while (cur.isSome());
    return r;
  };
  var $_ajxr2ix8jdud7el6 = { toArray: toArray };

  var global = typeof window !== 'undefined' ? window : Function('return this;')();

  var path = function (parts, scope) {
    var o = scope !== undefined && scope !== null ? scope : global;
    for (var i = 0; i < parts.length && o !== undefined && o !== null; ++i)
      o = o[parts[i]];
    return o;
  };
  var resolve = function (p, scope) {
    var parts = p.split('.');
    return path(parts, scope);
  };
  var step = function (o, part) {
    if (o[part] === undefined || o[part] === null)
      o[part] = {};
    return o[part];
  };
  var forge = function (parts, target) {
    var o = target !== undefined ? target : global;
    for (var i = 0; i < parts.length; ++i)
      o = step(o, parts[i]);
    return o;
  };
  var namespace = function (name, target) {
    var parts = name.split('.');
    return forge(parts, target);
  };
  var $_g961dixcjdud7elo = {
    path: path,
    resolve: resolve,
    forge: forge,
    namespace: namespace
  };

  var unsafe = function (name, scope) {
    return $_g961dixcjdud7elo.resolve(name, scope);
  };
  var getOrDie = function (name, scope) {
    var actual = unsafe(name, scope);
    if (actual === undefined || actual === null)
      throw name + ' not available on this browser';
    return actual;
  };
  var $_3ytg1qxbjdud7elm = { getOrDie: getOrDie };

  var node = function () {
    var f = $_3ytg1qxbjdud7elm.getOrDie('Node');
    return f;
  };
  var compareDocumentPosition = function (a, b, match) {
    return (a.compareDocumentPosition(b) & match) !== 0;
  };
  var documentPositionPreceding = function (a, b) {
    return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_PRECEDING);
  };
  var documentPositionContainedBy = function (a, b) {
    return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_CONTAINED_BY);
  };
  var $_f2fzzbxajdud7ell = {
    documentPositionPreceding: documentPositionPreceding,
    documentPositionContainedBy: documentPositionContainedBy
  };

  var fromHtml = function (html, scope) {
    var doc = scope || document;
    var div = doc.createElement('div');
    div.innerHTML = html;
    if (!div.hasChildNodes() || div.childNodes.length > 1) {
      console.error('HTML does not have a single root node', html);
      throw 'HTML must have a single root node';
    }
    return fromDom(div.childNodes[0]);
  };
  var fromTag = function (tag, scope) {
    var doc = scope || document;
    var node = doc.createElement(tag);
    return fromDom(node);
  };
  var fromText = function (text, scope) {
    var doc = scope || document;
    var node = doc.createTextNode(text);
    return fromDom(node);
  };
  var fromDom = function (node) {
    if (node === null || node === undefined)
      throw new Error('Node cannot be null or undefined');
    return { dom: $_9njj9iwjjdud7eix.constant(node) };
  };
  var fromPoint = function (doc, x, y) {
    return Option.from(doc.dom().elementFromPoint(x, y)).map(fromDom);
  };
  var $_eobgtqxfjdud7elu = {
    fromHtml: fromHtml,
    fromTag: fromTag,
    fromText: fromText,
    fromDom: fromDom,
    fromPoint: fromPoint
  };

  var $_5jaggbxgjdud7ely = {
    ATTRIBUTE: 2,
    CDATA_SECTION: 4,
    COMMENT: 8,
    DOCUMENT: 9,
    DOCUMENT_TYPE: 10,
    DOCUMENT_FRAGMENT: 11,
    ELEMENT: 1,
    TEXT: 3,
    PROCESSING_INSTRUCTION: 7,
    ENTITY_REFERENCE: 5,
    ENTITY: 6,
    NOTATION: 12
  };

  var ELEMENT = $_5jaggbxgjdud7ely.ELEMENT;
  var DOCUMENT = $_5jaggbxgjdud7ely.DOCUMENT;
  var is = function (element, selector) {
    var elem = element.dom();
    if (elem.nodeType !== ELEMENT)
      return false;
    else if (elem.matches !== undefined)
      return elem.matches(selector);
    else if (elem.msMatchesSelector !== undefined)
      return elem.msMatchesSelector(selector);
    else if (elem.webkitMatchesSelector !== undefined)
      return elem.webkitMatchesSelector(selector);
    else if (elem.mozMatchesSelector !== undefined)
      return elem.mozMatchesSelector(selector);
    else
      throw new Error('Browser lacks native selectors');
  };
  var bypassSelector = function (dom) {
    return dom.nodeType !== ELEMENT && dom.nodeType !== DOCUMENT || dom.childElementCount === 0;
  };
  var all = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? [] : $_1g2cevwsjdud7ejp.map(base.querySelectorAll(selector), $_eobgtqxfjdud7elu.fromDom);
  };
  var one = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? Option.none() : Option.from(base.querySelector(selector)).map($_eobgtqxfjdud7elu.fromDom);
  };
  var $_1t43jfxejdud7elq = {
    all: all,
    is: is,
    one: one
  };

  var eq = function (e1, e2) {
    return e1.dom() === e2.dom();
  };
  var isEqualNode = function (e1, e2) {
    return e1.dom().isEqualNode(e2.dom());
  };
  var member = function (element, elements) {
    return $_1g2cevwsjdud7ejp.exists(elements, $_9njj9iwjjdud7eix.curry(eq, element));
  };
  var regularContains = function (e1, e2) {
    var d1 = e1.dom(), d2 = e2.dom();
    return d1 === d2 ? false : d1.contains(d2);
  };
  var ieContains = function (e1, e2) {
    return $_f2fzzbxajdud7ell.documentPositionContainedBy(e1.dom(), e2.dom());
  };
  var browser = $_chh2cvwkjdud7ej0.detect().browser;
  var contains$2 = browser.isIE() ? ieContains : regularContains;
  var $_f1y1rtx9jdud7el7 = {
    eq: eq,
    isEqualNode: isEqualNode,
    member: member,
    contains: contains$2,
    is: $_1t43jfxejdud7elq.is
  };

  var owner = function (element) {
    return $_eobgtqxfjdud7elu.fromDom(element.dom().ownerDocument);
  };
  var documentElement = function (element) {
    var doc = owner(element);
    return $_eobgtqxfjdud7elu.fromDom(doc.dom().documentElement);
  };
  var defaultView = function (element) {
    var el = element.dom();
    var defaultView = el.ownerDocument.defaultView;
    return $_eobgtqxfjdud7elu.fromDom(defaultView);
  };
  var parent = function (element) {
    var dom = element.dom();
    return Option.from(dom.parentNode).map($_eobgtqxfjdud7elu.fromDom);
  };
  var findIndex$1 = function (element) {
    return parent(element).bind(function (p) {
      var kin = children(p);
      return $_1g2cevwsjdud7ejp.findIndex(kin, function (elem) {
        return $_f1y1rtx9jdud7el7.eq(element, elem);
      });
    });
  };
  var parents = function (element, isRoot) {
    var stop = $_9rljuwzjdud7ekb.isFunction(isRoot) ? isRoot : $_9njj9iwjjdud7eix.constant(false);
    var dom = element.dom();
    var ret = [];
    while (dom.parentNode !== null && dom.parentNode !== undefined) {
      var rawParent = dom.parentNode;
      var parent = $_eobgtqxfjdud7elu.fromDom(rawParent);
      ret.push(parent);
      if (stop(parent) === true)
        break;
      else
        dom = rawParent;
    }
    return ret;
  };
  var siblings = function (element) {
    var filterSelf = function (elements) {
      return $_1g2cevwsjdud7ejp.filter(elements, function (x) {
        return !$_f1y1rtx9jdud7el7.eq(element, x);
      });
    };
    return parent(element).map(children).map(filterSelf).getOr([]);
  };
  var offsetParent = function (element) {
    var dom = element.dom();
    return Option.from(dom.offsetParent).map($_eobgtqxfjdud7elu.fromDom);
  };
  var prevSibling = function (element) {
    var dom = element.dom();
    return Option.from(dom.previousSibling).map($_eobgtqxfjdud7elu.fromDom);
  };
  var nextSibling = function (element) {
    var dom = element.dom();
    return Option.from(dom.nextSibling).map($_eobgtqxfjdud7elu.fromDom);
  };
  var prevSiblings = function (element) {
    return $_1g2cevwsjdud7ejp.reverse($_ajxr2ix8jdud7el6.toArray(element, prevSibling));
  };
  var nextSiblings = function (element) {
    return $_ajxr2ix8jdud7el6.toArray(element, nextSibling);
  };
  var children = function (element) {
    var dom = element.dom();
    return $_1g2cevwsjdud7ejp.map(dom.childNodes, $_eobgtqxfjdud7elu.fromDom);
  };
  var child = function (element, index) {
    var children = element.dom().childNodes;
    return Option.from(children[index]).map($_eobgtqxfjdud7elu.fromDom);
  };
  var firstChild = function (element) {
    return child(element, 0);
  };
  var lastChild = function (element) {
    return child(element, element.dom().childNodes.length - 1);
  };
  var childNodesCount = function (element) {
    return element.dom().childNodes.length;
  };
  var hasChildNodes = function (element) {
    return element.dom().hasChildNodes();
  };
  var spot = $_8o1q69x4jdud7ekz.immutable('element', 'offset');
  var leaf = function (element, offset) {
    var cs = children(element);
    return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
  };
  var $_dekwe2x3jdud7ekr = {
    owner: owner,
    defaultView: defaultView,
    documentElement: documentElement,
    parent: parent,
    findIndex: findIndex$1,
    parents: parents,
    siblings: siblings,
    prevSibling: prevSibling,
    offsetParent: offsetParent,
    prevSiblings: prevSiblings,
    nextSibling: nextSibling,
    nextSiblings: nextSiblings,
    children: children,
    child: child,
    firstChild: firstChild,
    lastChild: lastChild,
    childNodesCount: childNodesCount,
    hasChildNodes: hasChildNodes,
    leaf: leaf
  };

  var before = function (marker, element) {
    var parent = $_dekwe2x3jdud7ekr.parent(marker);
    parent.each(function (v) {
      v.dom().insertBefore(element.dom(), marker.dom());
    });
  };
  var after = function (marker, element) {
    var sibling = $_dekwe2x3jdud7ekr.nextSibling(marker);
    sibling.fold(function () {
      var parent = $_dekwe2x3jdud7ekr.parent(marker);
      parent.each(function (v) {
        append(v, element);
      });
    }, function (v) {
      before(v, element);
    });
  };
  var prepend = function (parent, element) {
    var firstChild = $_dekwe2x3jdud7ekr.firstChild(parent);
    firstChild.fold(function () {
      append(parent, element);
    }, function (v) {
      parent.dom().insertBefore(element.dom(), v.dom());
    });
  };
  var append = function (parent, element) {
    parent.dom().appendChild(element.dom());
  };
  var appendAt = function (parent, element, index) {
    $_dekwe2x3jdud7ekr.child(parent, index).fold(function () {
      append(parent, element);
    }, function (v) {
      before(v, element);
    });
  };
  var wrap = function (element, wrapper) {
    before(element, wrapper);
    append(wrapper, element);
  };
  var $_ftkbb5x2jdud7ekp = {
    before: before,
    after: after,
    prepend: prepend,
    append: append,
    appendAt: appendAt,
    wrap: wrap
  };

  var before$1 = function (marker, elements) {
    $_1g2cevwsjdud7ejp.each(elements, function (x) {
      $_ftkbb5x2jdud7ekp.before(marker, x);
    });
  };
  var after$1 = function (marker, elements) {
    $_1g2cevwsjdud7ejp.each(elements, function (x, i) {
      var e = i === 0 ? marker : elements[i - 1];
      $_ftkbb5x2jdud7ekp.after(e, x);
    });
  };
  var prepend$1 = function (parent, elements) {
    $_1g2cevwsjdud7ejp.each(elements.slice().reverse(), function (x) {
      $_ftkbb5x2jdud7ekp.prepend(parent, x);
    });
  };
  var append$1 = function (parent, elements) {
    $_1g2cevwsjdud7ejp.each(elements, function (x) {
      $_ftkbb5x2jdud7ekp.append(parent, x);
    });
  };
  var $_alr2vxxijdud7em1 = {
    before: before$1,
    after: after$1,
    prepend: prepend$1,
    append: append$1
  };

  var empty = function (element) {
    element.dom().textContent = '';
    $_1g2cevwsjdud7ejp.each($_dekwe2x3jdud7ekr.children(element), function (rogue) {
      remove(rogue);
    });
  };
  var remove = function (element) {
    var dom = element.dom();
    if (dom.parentNode !== null)
      dom.parentNode.removeChild(dom);
  };
  var unwrap = function (wrapper) {
    var children = $_dekwe2x3jdud7ekr.children(wrapper);
    if (children.length > 0)
      $_alr2vxxijdud7em1.before(wrapper, children);
    remove(wrapper);
  };
  var $_8d9w48xhjdud7elz = {
    empty: empty,
    remove: remove,
    unwrap: unwrap
  };

  var name = function (element) {
    var r = element.dom().nodeName;
    return r.toLowerCase();
  };
  var type = function (element) {
    return element.dom().nodeType;
  };
  var value = function (element) {
    return element.dom().nodeValue;
  };
  var isType$1 = function (t) {
    return function (element) {
      return type(element) === t;
    };
  };
  var isComment = function (element) {
    return type(element) === $_5jaggbxgjdud7ely.COMMENT || name(element) === '#comment';
  };
  var isElement = isType$1($_5jaggbxgjdud7ely.ELEMENT);
  var isText = isType$1($_5jaggbxgjdud7ely.TEXT);
  var isDocument = isType$1($_5jaggbxgjdud7ely.DOCUMENT);
  var $_50qkdpxkjdud7em6 = {
    name: name,
    type: type,
    value: value,
    isElement: isElement,
    isText: isText,
    isDocument: isDocument,
    isComment: isComment
  };

  var inBody = function (element) {
    var dom = $_50qkdpxkjdud7em6.isText(element) ? element.dom().parentNode : element.dom();
    return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
  };
  var body = $_2nf0bewljdud7ej2.cached(function () {
    return getBody($_eobgtqxfjdud7elu.fromDom(document));
  });
  var getBody = function (doc) {
    var body = doc.dom().body;
    if (body === null || body === undefined)
      throw 'Body is not available yet';
    return $_eobgtqxfjdud7elu.fromDom(body);
  };
  var $_1tyeizxjjdud7em4 = {
    body: body,
    getBody: getBody,
    inBody: inBody
  };

  var fireDetaching = function (component) {
    $_98da6jwgjdud7eil.emit(component, $_801kkqwhjdud7eiq.detachedFromDom());
    var children = component.components();
    $_1g2cevwsjdud7ejp.each(children, fireDetaching);
  };
  var fireAttaching = function (component) {
    var children = component.components();
    $_1g2cevwsjdud7ejp.each(children, fireAttaching);
    $_98da6jwgjdud7eil.emit(component, $_801kkqwhjdud7eiq.attachedToDom());
  };
  var attach = function (parent, child) {
    attachWith(parent, child, $_ftkbb5x2jdud7ekp.append);
  };
  var attachWith = function (parent, child, insertion) {
    parent.getSystem().addToWorld(child);
    insertion(parent.element(), child.element());
    if ($_1tyeizxjjdud7em4.inBody(parent.element()))
      fireAttaching(child);
    parent.syncComponents();
  };
  var doDetach = function (component) {
    fireDetaching(component);
    $_8d9w48xhjdud7elz.remove(component.element());
    component.getSystem().removeFromWorld(component);
  };
  var detach = function (component) {
    var parent = $_dekwe2x3jdud7ekr.parent(component.element()).bind(function (p) {
      return component.getSystem().getByDom(p).fold(Option.none, Option.some);
    });
    doDetach(component);
    parent.each(function (p) {
      p.syncComponents();
    });
  };
  var detachChildren = function (component) {
    var subs = component.components();
    $_1g2cevwsjdud7ejp.each(subs, doDetach);
    $_8d9w48xhjdud7elz.empty(component.element());
    component.syncComponents();
  };
  var attachSystem = function (element, guiSystem) {
    $_ftkbb5x2jdud7ekp.append(element, guiSystem.element());
    var children = $_dekwe2x3jdud7ekr.children(guiSystem.element());
    $_1g2cevwsjdud7ejp.each(children, function (child) {
      guiSystem.getByDom(child).each(fireAttaching);
    });
  };
  var detachSystem = function (guiSystem) {
    var children = $_dekwe2x3jdud7ekr.children(guiSystem.element());
    $_1g2cevwsjdud7ejp.each(children, function (child) {
      guiSystem.getByDom(child).each(fireDetaching);
    });
    $_8d9w48xhjdud7elz.remove(guiSystem.element());
  };
  var $_fesilqx1jdud7ekf = {
    attach: attach,
    attachWith: attachWith,
    detach: detach,
    detachChildren: detachChildren,
    attachSystem: attachSystem,
    detachSystem: detachSystem
  };

  var fromHtml$1 = function (html, scope) {
    var doc = scope || document;
    var div = doc.createElement('div');
    div.innerHTML = html;
    return $_dekwe2x3jdud7ekr.children($_eobgtqxfjdud7elu.fromDom(div));
  };
  var fromTags = function (tags, scope) {
    return $_1g2cevwsjdud7ejp.map(tags, function (x) {
      return $_eobgtqxfjdud7elu.fromTag(x, scope);
    });
  };
  var fromText$1 = function (texts, scope) {
    return $_1g2cevwsjdud7ejp.map(texts, function (x) {
      return $_eobgtqxfjdud7elu.fromText(x, scope);
    });
  };
  var fromDom$1 = function (nodes) {
    return $_1g2cevwsjdud7ejp.map(nodes, $_eobgtqxfjdud7elu.fromDom);
  };
  var $_c9k4uxxpjdud7emn = {
    fromHtml: fromHtml$1,
    fromTags: fromTags,
    fromText: fromText$1,
    fromDom: fromDom$1
  };

  var get = function (element) {
    return element.dom().innerHTML;
  };
  var set = function (element, content) {
    var owner = $_dekwe2x3jdud7ekr.owner(element);
    var docDom = owner.dom();
    var fragment = $_eobgtqxfjdud7elu.fromDom(docDom.createDocumentFragment());
    var contentElements = $_c9k4uxxpjdud7emn.fromHtml(content, docDom);
    $_alr2vxxijdud7em1.append(fragment, contentElements);
    $_8d9w48xhjdud7elz.empty(element);
    $_ftkbb5x2jdud7ekp.append(element, fragment);
  };
  var getOuter = function (element) {
    var container = $_eobgtqxfjdud7elu.fromTag('div');
    var clone = $_eobgtqxfjdud7elu.fromDom(element.dom().cloneNode(true));
    $_ftkbb5x2jdud7ekp.append(container, clone);
    return get(container);
  };
  var $_1kv7pfxojdud7emm = {
    get: get,
    set: set,
    getOuter: getOuter
  };

  var rawSet = function (dom, key, value) {
    if ($_9rljuwzjdud7ekb.isString(value) || $_9rljuwzjdud7ekb.isBoolean(value) || $_9rljuwzjdud7ekb.isNumber(value)) {
      dom.setAttribute(key, value + '');
    } else {
      console.error('Invalid call to Attr.set. Key ', key, ':: Value ', value, ':: Element ', dom);
      throw new Error('Attribute value was not simple');
    }
  };
  var set$1 = function (element, key, value) {
    rawSet(element.dom(), key, value);
  };
  var setAll = function (element, attrs) {
    var dom = element.dom();
    $_2dykn0x0jdud7ekc.each(attrs, function (v, k) {
      rawSet(dom, k, v);
    });
  };
  var get$1 = function (element, key) {
    var v = element.dom().getAttribute(key);
    return v === null ? undefined : v;
  };
  var has = function (element, key) {
    var dom = element.dom();
    return dom && dom.hasAttribute ? dom.hasAttribute(key) : false;
  };
  var remove$1 = function (element, key) {
    element.dom().removeAttribute(key);
  };
  var hasNone = function (element) {
    var attrs = element.dom().attributes;
    return attrs === undefined || attrs === null || attrs.length === 0;
  };
  var clone = function (element) {
    return $_1g2cevwsjdud7ejp.foldl(element.dom().attributes, function (acc, attr) {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  };
  var transferOne = function (source, destination, attr) {
    if (has(source, attr) && !has(destination, attr))
      set$1(destination, attr, get$1(source, attr));
  };
  var transfer = function (source, destination, attrs) {
    if (!$_50qkdpxkjdud7em6.isElement(source) || !$_50qkdpxkjdud7em6.isElement(destination))
      return;
    $_1g2cevwsjdud7ejp.each(attrs, function (attr) {
      transferOne(source, destination, attr);
    });
  };
  var $_2vghk1xrjdud7ems = {
    clone: clone,
    set: set$1,
    setAll: setAll,
    get: get$1,
    has: has,
    remove: remove$1,
    hasNone: hasNone,
    transfer: transfer
  };

  var clone$1 = function (original, deep) {
    return $_eobgtqxfjdud7elu.fromDom(original.dom().cloneNode(deep));
  };
  var shallow$1 = function (original) {
    return clone$1(original, false);
  };
  var deep$1 = function (original) {
    return clone$1(original, true);
  };
  var shallowAs = function (original, tag) {
    var nu = $_eobgtqxfjdud7elu.fromTag(tag);
    var attributes = $_2vghk1xrjdud7ems.clone(original);
    $_2vghk1xrjdud7ems.setAll(nu, attributes);
    return nu;
  };
  var copy = function (original, tag) {
    var nu = shallowAs(original, tag);
    var cloneChildren = $_dekwe2x3jdud7ekr.children(deep$1(original));
    $_alr2vxxijdud7em1.append(nu, cloneChildren);
    return nu;
  };
  var mutate = function (original, tag) {
    var nu = shallowAs(original, tag);
    $_ftkbb5x2jdud7ekp.before(original, nu);
    var children = $_dekwe2x3jdud7ekr.children(original);
    $_alr2vxxijdud7em1.append(nu, children);
    $_8d9w48xhjdud7elz.remove(original);
    return nu;
  };
  var $_1efzt4xqjdud7emq = {
    shallow: shallow$1,
    shallowAs: shallowAs,
    deep: deep$1,
    copy: copy,
    mutate: mutate
  };

  var getHtml = function (element) {
    var clone = $_1efzt4xqjdud7emq.shallow(element);
    return $_1kv7pfxojdud7emm.getOuter(clone);
  };
  var $_1sgwp2xnjdud7emj = { getHtml: getHtml };

  var element = function (elem) {
    return $_1sgwp2xnjdud7emj.getHtml(elem);
  };
  var $_d3f8kuxmjdud7emi = { element: element };

  var value$1 = function (o) {
    var is = function (v) {
      return o === v;
    };
    var or = function (opt) {
      return value$1(o);
    };
    var orThunk = function (f) {
      return value$1(o);
    };
    var map = function (f) {
      return value$1(f(o));
    };
    var each = function (f) {
      f(o);
    };
    var bind = function (f) {
      return f(o);
    };
    var fold = function (_, onValue) {
      return onValue(o);
    };
    var exists = function (f) {
      return f(o);
    };
    var forall = function (f) {
      return f(o);
    };
    var toOption = function () {
      return Option.some(o);
    };
    return {
      is: is,
      isValue: $_9njj9iwjjdud7eix.always,
      isError: $_9njj9iwjjdud7eix.never,
      getOr: $_9njj9iwjjdud7eix.constant(o),
      getOrThunk: $_9njj9iwjjdud7eix.constant(o),
      getOrDie: $_9njj9iwjjdud7eix.constant(o),
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: each,
      bind: bind,
      exists: exists,
      forall: forall,
      toOption: toOption
    };
  };
  var error = function (message) {
    var getOrThunk = function (f) {
      return f();
    };
    var getOrDie = function () {
      return $_9njj9iwjjdud7eix.die(message)();
    };
    var or = function (opt) {
      return opt;
    };
    var orThunk = function (f) {
      return f();
    };
    var map = function (f) {
      return error(message);
    };
    var bind = function (f) {
      return error(message);
    };
    var fold = function (onError, _) {
      return onError(message);
    };
    return {
      is: $_9njj9iwjjdud7eix.never,
      isValue: $_9njj9iwjjdud7eix.never,
      isError: $_9njj9iwjjdud7eix.always,
      getOr: $_9njj9iwjjdud7eix.identity,
      getOrThunk: getOrThunk,
      getOrDie: getOrDie,
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: $_9njj9iwjjdud7eix.noop,
      bind: bind,
      exists: $_9njj9iwjjdud7eix.never,
      forall: $_9njj9iwjjdud7eix.always,
      toOption: Option.none
    };
  };
  var Result = {
    value: value$1,
    error: error
  };

  var generate = function (cases) {
    if (!$_9rljuwzjdud7ekb.isArray(cases)) {
      throw new Error('cases must be an array');
    }
    if (cases.length === 0) {
      throw new Error('there must be at least one case');
    }
    var constructors = [];
    var adt = {};
    $_1g2cevwsjdud7ejp.each(cases, function (acase, count) {
      var keys = $_2dykn0x0jdud7ekc.keys(acase);
      if (keys.length !== 1) {
        throw new Error('one and only one name per case');
      }
      var key = keys[0];
      var value = acase[key];
      if (adt[key] !== undefined) {
        throw new Error('duplicate key detected:' + key);
      } else if (key === 'cata') {
        throw new Error('cannot have a case named cata (sorry)');
      } else if (!$_9rljuwzjdud7ekb.isArray(value)) {
        throw new Error('case arguments must be an array');
      }
      constructors.push(key);
      adt[key] = function () {
        var argLength = arguments.length;
        if (argLength !== value.length) {
          throw new Error('Wrong number of arguments to case ' + key + '. Expected ' + value.length + ' (' + value + '), got ' + argLength);
        }
        var args = new Array(argLength);
        for (var i = 0; i < args.length; i++)
          args[i] = arguments[i];
        var match = function (branches) {
          var branchKeys = $_2dykn0x0jdud7ekc.keys(branches);
          if (constructors.length !== branchKeys.length) {
            throw new Error('Wrong number of arguments to match. Expected: ' + constructors.join(',') + '\nActual: ' + branchKeys.join(','));
          }
          var allReqd = $_1g2cevwsjdud7ejp.forall(constructors, function (reqKey) {
            return $_1g2cevwsjdud7ejp.contains(branchKeys, reqKey);
          });
          if (!allReqd)
            throw new Error('Not all branches were specified when using match. Specified: ' + branchKeys.join(', ') + '\nRequired: ' + constructors.join(', '));
          return branches[key].apply(null, args);
        };
        return {
          fold: function () {
            if (arguments.length !== cases.length) {
              throw new Error('Wrong number of arguments to fold. Expected ' + cases.length + ', got ' + arguments.length);
            }
            var target = arguments[count];
            return target.apply(null, args);
          },
          match: match,
          log: function (label) {
            console.log(label, {
              constructors: constructors,
              constructor: key,
              params: args
            });
          }
        };
      };
    });
    return adt;
  };
  var $_2ytffsxwjdud7ets = { generate: generate };

  var comparison = $_2ytffsxwjdud7ets.generate([
    {
      bothErrors: [
        'error1',
        'error2'
      ]
    },
    {
      firstError: [
        'error1',
        'value2'
      ]
    },
    {
      secondError: [
        'value1',
        'error2'
      ]
    },
    {
      bothValues: [
        'value1',
        'value2'
      ]
    }
  ]);
  var partition$1 = function (results) {
    var errors = [];
    var values = [];
    $_1g2cevwsjdud7ejp.each(results, function (result) {
      result.fold(function (err) {
        errors.push(err);
      }, function (value) {
        values.push(value);
      });
    });
    return {
      errors: errors,
      values: values
    };
  };
  var compare = function (result1, result2) {
    return result1.fold(function (err1) {
      return result2.fold(function (err2) {
        return comparison.bothErrors(err1, err2);
      }, function (val2) {
        return comparison.firstError(err1, val2);
      });
    }, function (val1) {
      return result2.fold(function (err2) {
        return comparison.secondError(val1, err2);
      }, function (val2) {
        return comparison.bothValues(val1, val2);
      });
    });
  };
  var $_807z09xvjdud7etp = {
    partition: partition$1,
    compare: compare
  };

  var mergeValues = function (values, base) {
    return Result.value($_73qnwowyjdud7ek9.deepMerge.apply(undefined, [base].concat(values)));
  };
  var mergeErrors = function (errors) {
    return $_9njj9iwjjdud7eix.compose(Result.error, $_1g2cevwsjdud7ejp.flatten)(errors);
  };
  var consolidateObj = function (objects, base) {
    var partitions = $_807z09xvjdud7etp.partition(objects);
    return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : mergeValues(partitions.values, base);
  };
  var consolidateArr = function (objects) {
    var partitions = $_807z09xvjdud7etp.partition(objects);
    return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : Result.value(partitions.values);
  };
  var $_fsr4v9xtjdud7en1 = {
    consolidateObj: consolidateObj,
    consolidateArr: consolidateArr
  };

  var narrow = function (obj, fields) {
    var r = {};
    $_1g2cevwsjdud7ejp.each(fields, function (field) {
      if (obj[field] !== undefined && obj.hasOwnProperty(field))
        r[field] = obj[field];
    });
    return r;
  };
  var indexOnKey = function (array, key) {
    var obj = {};
    $_1g2cevwsjdud7ejp.each(array, function (a) {
      var keyValue = a[key];
      obj[keyValue] = a;
    });
    return obj;
  };
  var exclude = function (obj, fields) {
    var r = {};
    $_2dykn0x0jdud7ekc.each(obj, function (v, k) {
      if (!$_1g2cevwsjdud7ejp.contains(fields, k)) {
        r[k] = v;
      }
    });
    return r;
  };
  var $_b3xxobxxjdud7etv = {
    narrow: narrow,
    exclude: exclude,
    indexOnKey: indexOnKey
  };

  var readOpt = function (key) {
    return function (obj) {
      return obj.hasOwnProperty(key) ? Option.from(obj[key]) : Option.none();
    };
  };
  var readOr = function (key, fallback) {
    return function (obj) {
      return readOpt(key)(obj).getOr(fallback);
    };
  };
  var readOptFrom = function (obj, key) {
    return readOpt(key)(obj);
  };
  var hasKey = function (obj, key) {
    return obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null;
  };
  var $_37yfftxyjdud7etz = {
    readOpt: readOpt,
    readOr: readOr,
    readOptFrom: readOptFrom,
    hasKey: hasKey
  };

  var wrap$1 = function (key, value) {
    var r = {};
    r[key] = value;
    return r;
  };
  var wrapAll = function (keyvalues) {
    var r = {};
    $_1g2cevwsjdud7ejp.each(keyvalues, function (kv) {
      r[kv.key] = kv.value;
    });
    return r;
  };
  var $_7vvdhixzjdud7eu2 = {
    wrap: wrap$1,
    wrapAll: wrapAll
  };

  var narrow$1 = function (obj, fields) {
    return $_b3xxobxxjdud7etv.narrow(obj, fields);
  };
  var exclude$1 = function (obj, fields) {
    return $_b3xxobxxjdud7etv.exclude(obj, fields);
  };
  var readOpt$1 = function (key) {
    return $_37yfftxyjdud7etz.readOpt(key);
  };
  var readOr$1 = function (key, fallback) {
    return $_37yfftxyjdud7etz.readOr(key, fallback);
  };
  var readOptFrom$1 = function (obj, key) {
    return $_37yfftxyjdud7etz.readOptFrom(obj, key);
  };
  var wrap$2 = function (key, value) {
    return $_7vvdhixzjdud7eu2.wrap(key, value);
  };
  var wrapAll$1 = function (keyvalues) {
    return $_7vvdhixzjdud7eu2.wrapAll(keyvalues);
  };
  var indexOnKey$1 = function (array, key) {
    return $_b3xxobxxjdud7etv.indexOnKey(array, key);
  };
  var consolidate = function (objs, base) {
    return $_fsr4v9xtjdud7en1.consolidateObj(objs, base);
  };
  var hasKey$1 = function (obj, key) {
    return $_37yfftxyjdud7etz.hasKey(obj, key);
  };
  var $_ettibkxsjdud7emz = {
    narrow: narrow$1,
    exclude: exclude$1,
    readOpt: readOpt$1,
    readOr: readOr$1,
    readOptFrom: readOptFrom$1,
    wrap: wrap$2,
    wrapAll: wrapAll$1,
    indexOnKey: indexOnKey$1,
    hasKey: hasKey$1,
    consolidate: consolidate
  };

  var cat = function (arr) {
    var r = [];
    var push = function (x) {
      r.push(x);
    };
    for (var i = 0; i < arr.length; i++) {
      arr[i].each(push);
    }
    return r;
  };
  var findMap = function (arr, f) {
    for (var i = 0; i < arr.length; i++) {
      var r = f(arr[i], i);
      if (r.isSome()) {
        return r;
      }
    }
    return Option.none();
  };
  var liftN = function (arr, f) {
    var r = [];
    for (var i = 0; i < arr.length; i++) {
      var x = arr[i];
      if (x.isSome()) {
        r.push(x.getOrDie());
      } else {
        return Option.none();
      }
    }
    return Option.some(f.apply(null, r));
  };
  var $_ak7xq9y0jdud7eu4 = {
    cat: cat,
    findMap: findMap,
    liftN: liftN
  };

  var unknown$3 = 'unknown';
  var debugging = true;
  var CHROME_INSPECTOR_GLOBAL = '__CHROME_INSPECTOR_CONNECTION_TO_ALLOY__';
  var eventsMonitored = [];
  var path$1 = [
    'alloy/data/Fields',
    'alloy/debugging/Debugging'
  ];
  var getTrace = function () {
    if (debugging === false)
      return unknown$3;
    var err = new Error();
    if (err.stack !== undefined) {
      var lines = err.stack.split('\n');
      return $_1g2cevwsjdud7ejp.find(lines, function (line) {
        return line.indexOf('alloy') > 0 && !$_1g2cevwsjdud7ejp.exists(path$1, function (p) {
          return line.indexOf(p) > -1;
        });
      }).getOr(unknown$3);
    } else {
      return unknown$3;
    }
  };
  var logHandler = function (label, handlerName, trace) {
  };
  var ignoreEvent = {
    logEventCut: $_9njj9iwjjdud7eix.noop,
    logEventStopped: $_9njj9iwjjdud7eix.noop,
    logNoParent: $_9njj9iwjjdud7eix.noop,
    logEventNoHandlers: $_9njj9iwjjdud7eix.noop,
    logEventResponse: $_9njj9iwjjdud7eix.noop,
    write: $_9njj9iwjjdud7eix.noop
  };
  var monitorEvent = function (eventName, initialTarget, f) {
    var logger = debugging && (eventsMonitored === '*' || $_1g2cevwsjdud7ejp.contains(eventsMonitored, eventName)) ? function () {
      var sequence = [];
      return {
        logEventCut: function (name, target, purpose) {
          sequence.push({
            outcome: 'cut',
            target: target,
            purpose: purpose
          });
        },
        logEventStopped: function (name, target, purpose) {
          sequence.push({
            outcome: 'stopped',
            target: target,
            purpose: purpose
          });
        },
        logNoParent: function (name, target, purpose) {
          sequence.push({
            outcome: 'no-parent',
            target: target,
            purpose: purpose
          });
        },
        logEventNoHandlers: function (name, target) {
          sequence.push({
            outcome: 'no-handlers-left',
            target: target
          });
        },
        logEventResponse: function (name, target, purpose) {
          sequence.push({
            outcome: 'response',
            purpose: purpose,
            target: target
          });
        },
        write: function () {
          if ($_1g2cevwsjdud7ejp.contains([
              'mousemove',
              'mouseover',
              'mouseout',
              $_801kkqwhjdud7eiq.systemInit()
            ], eventName))
            return;
          console.log(eventName, {
            event: eventName,
            target: initialTarget.dom(),
            sequence: $_1g2cevwsjdud7ejp.map(sequence, function (s) {
              if (!$_1g2cevwsjdud7ejp.contains([
                  'cut',
                  'stopped',
                  'response'
                ], s.outcome))
                return s.outcome;
              else
                return '{' + s.purpose + '} ' + s.outcome + ' at (' + $_d3f8kuxmjdud7emi.element(s.target) + ')';
            })
          });
        }
      };
    }() : ignoreEvent;
    var output = f(logger);
    logger.write();
    return output;
  };
  var inspectorInfo = function (comp) {
    var go = function (c) {
      var cSpec = c.spec();
      return {
        '(original.spec)': cSpec,
        '(dom.ref)': c.element().dom(),
        '(element)': $_d3f8kuxmjdud7emi.element(c.element()),
        '(initComponents)': $_1g2cevwsjdud7ejp.map(cSpec.components !== undefined ? cSpec.components : [], go),
        '(components)': $_1g2cevwsjdud7ejp.map(c.components(), go),
        '(bound.events)': $_2dykn0x0jdud7ekc.mapToArray(c.events(), function (v, k) {
          return [k];
        }).join(', '),
        '(behaviours)': cSpec.behaviours !== undefined ? $_2dykn0x0jdud7ekc.map(cSpec.behaviours, function (v, k) {
          return v === undefined ? '--revoked--' : {
            config: v.configAsRaw(),
            'original-config': v.initialConfig,
            state: c.readState(k)
          };
        }) : 'none'
      };
    };
    return go(comp);
  };
  var getOrInitConnection = function () {
    if (window[CHROME_INSPECTOR_GLOBAL] !== undefined)
      return window[CHROME_INSPECTOR_GLOBAL];
    else {
      window[CHROME_INSPECTOR_GLOBAL] = {
        systems: {},
        lookup: function (uid) {
          var systems = window[CHROME_INSPECTOR_GLOBAL].systems;
          var connections = $_2dykn0x0jdud7ekc.keys(systems);
          return $_ak7xq9y0jdud7eu4.findMap(connections, function (conn) {
            var connGui = systems[conn];
            return connGui.getByUid(uid).toOption().map(function (comp) {
              return $_ettibkxsjdud7emz.wrap($_d3f8kuxmjdud7emi.element(comp.element()), inspectorInfo(comp));
            });
          });
        }
      };
      return window[CHROME_INSPECTOR_GLOBAL];
    }
  };
  var registerInspector = function (name, gui) {
    var connection = getOrInitConnection();
    connection.systems[name] = gui;
  };
  var $_efa715xljdud7em8 = {
    logHandler: logHandler,
    noLogger: $_9njj9iwjjdud7eix.constant(ignoreEvent),
    getTrace: getTrace,
    monitorEvent: monitorEvent,
    isDebugging: $_9njj9iwjjdud7eix.constant(debugging),
    registerInspector: registerInspector
  };

  var isSource = function (component, simulatedEvent) {
    return $_f1y1rtx9jdud7el7.eq(component.element(), simulatedEvent.event().target());
  };
  var $_3y5zxmy5jdud7euv = { isSource: isSource };

  var adt = $_2ytffsxwjdud7ets.generate([
    { strict: [] },
    { defaultedThunk: ['fallbackThunk'] },
    { asOption: [] },
    { asDefaultedOptionThunk: ['fallbackThunk'] },
    { mergeWithThunk: ['baseThunk'] }
  ]);
  var defaulted = function (fallback) {
    return adt.defaultedThunk($_9njj9iwjjdud7eix.constant(fallback));
  };
  var asDefaultedOption = function (fallback) {
    return adt.asDefaultedOptionThunk($_9njj9iwjjdud7eix.constant(fallback));
  };
  var mergeWith = function (base) {
    return adt.mergeWithThunk($_9njj9iwjjdud7eix.constant(base));
  };
  var $_6rbn18y8jdud7evc = {
    strict: adt.strict,
    asOption: adt.asOption,
    defaulted: defaulted,
    defaultedThunk: adt.defaultedThunk,
    asDefaultedOption: asDefaultedOption,
    asDefaultedOptionThunk: adt.asDefaultedOptionThunk,
    mergeWith: mergeWith,
    mergeWithThunk: adt.mergeWithThunk
  };

  var typeAdt = $_2ytffsxwjdud7ets.generate([
    {
      setOf: [
        'validator',
        'valueType'
      ]
    },
    { arrOf: ['valueType'] },
    { objOf: ['fields'] },
    { itemOf: ['validator'] },
    {
      choiceOf: [
        'key',
        'branches'
      ]
    },
    { thunk: ['description'] },
    {
      func: [
        'args',
        'outputSchema'
      ]
    }
  ]);
  var fieldAdt = $_2ytffsxwjdud7ets.generate([
    {
      field: [
        'name',
        'presence',
        'type'
      ]
    },
    { state: ['name'] }
  ]);
  var $_e4kogayajdud7ew8 = {
    typeAdt: typeAdt,
    fieldAdt: fieldAdt
  };

  var json = function () {
    return $_3ytg1qxbjdud7elm.getOrDie('JSON');
  };
  var parse = function (obj) {
    return json().parse(obj);
  };
  var stringify = function (obj, replacer, space) {
    return json().stringify(obj, replacer, space);
  };
  var $_crnojnydjdud7ewk = {
    parse: parse,
    stringify: stringify
  };

  var formatObj = function (input) {
    return $_9rljuwzjdud7ekb.isObject(input) && $_2dykn0x0jdud7ekc.keys(input).length > 100 ? ' removed due to size' : $_crnojnydjdud7ewk.stringify(input, null, 2);
  };
  var formatErrors = function (errors) {
    var es = errors.length > 10 ? errors.slice(0, 10).concat([{
        path: [],
        getErrorInfo: function () {
          return '... (only showing first ten failures)';
        }
      }]) : errors;
    return $_1g2cevwsjdud7ejp.map(es, function (e) {
      return 'Failed path: (' + e.path.join(' > ') + ')\n' + e.getErrorInfo();
    });
  };
  var $_5dzg9kycjdud7ewe = {
    formatObj: formatObj,
    formatErrors: formatErrors
  };

  var nu$3 = function (path, getErrorInfo) {
    return Result.error([{
        path: path,
        getErrorInfo: getErrorInfo
      }]);
  };
  var missingStrict = function (path, key, obj) {
    return nu$3(path, function () {
      return 'Could not find valid *strict* value for "' + key + '" in ' + $_5dzg9kycjdud7ewe.formatObj(obj);
    });
  };
  var missingKey = function (path, key) {
    return nu$3(path, function () {
      return 'Choice schema did not contain choice key: "' + key + '"';
    });
  };
  var missingBranch = function (path, branches, branch) {
    return nu$3(path, function () {
      return 'The chosen schema: "' + branch + '" did not exist in branches: ' + $_5dzg9kycjdud7ewe.formatObj(branches);
    });
  };
  var unsupportedFields = function (path, unsupported) {
    return nu$3(path, function () {
      return 'There are unsupported fields: [' + unsupported.join(', ') + '] specified';
    });
  };
  var custom = function (path, err) {
    return nu$3(path, function () {
      return err;
    });
  };
  var toString = function (error) {
    return 'Failed path: (' + error.path.join(' > ') + ')\n' + error.getErrorInfo();
  };
  var $_a7kucqybjdud7ewb = {
    missingStrict: missingStrict,
    missingKey: missingKey,
    missingBranch: missingBranch,
    unsupportedFields: unsupportedFields,
    custom: custom,
    toString: toString
  };

  var adt$1 = $_2ytffsxwjdud7ets.generate([
    {
      field: [
        'key',
        'okey',
        'presence',
        'prop'
      ]
    },
    {
      state: [
        'okey',
        'instantiator'
      ]
    }
  ]);
  var output = function (okey, value) {
    return adt$1.state(okey, $_9njj9iwjjdud7eix.constant(value));
  };
  var snapshot = function (okey) {
    return adt$1.state(okey, $_9njj9iwjjdud7eix.identity);
  };
  var strictAccess = function (path, obj, key) {
    return $_37yfftxyjdud7etz.readOptFrom(obj, key).fold(function () {
      return $_a7kucqybjdud7ewb.missingStrict(path, key, obj);
    }, Result.value);
  };
  var fallbackAccess = function (obj, key, fallbackThunk) {
    var v = $_37yfftxyjdud7etz.readOptFrom(obj, key).fold(function () {
      return fallbackThunk(obj);
    }, $_9njj9iwjjdud7eix.identity);
    return Result.value(v);
  };
  var optionAccess = function (obj, key) {
    return Result.value($_37yfftxyjdud7etz.readOptFrom(obj, key));
  };
  var optionDefaultedAccess = function (obj, key, fallback) {
    var opt = $_37yfftxyjdud7etz.readOptFrom(obj, key).map(function (val) {
      return val === true ? fallback(obj) : val;
    });
    return Result.value(opt);
  };
  var cExtractOne = function (path, obj, field, strength) {
    return field.fold(function (key, okey, presence, prop) {
      var bundle = function (av) {
        return prop.extract(path.concat([key]), strength, av).map(function (res) {
          return $_7vvdhixzjdud7eu2.wrap(okey, strength(res));
        });
      };
      var bundleAsOption = function (optValue) {
        return optValue.fold(function () {
          var outcome = $_7vvdhixzjdud7eu2.wrap(okey, strength(Option.none()));
          return Result.value(outcome);
        }, function (ov) {
          return prop.extract(path.concat([key]), strength, ov).map(function (res) {
            return $_7vvdhixzjdud7eu2.wrap(okey, strength(Option.some(res)));
          });
        });
      };
      return function () {
        return presence.fold(function () {
          return strictAccess(path, obj, key).bind(bundle);
        }, function (fallbackThunk) {
          return fallbackAccess(obj, key, fallbackThunk).bind(bundle);
        }, function () {
          return optionAccess(obj, key).bind(bundleAsOption);
        }, function (fallbackThunk) {
          return optionDefaultedAccess(obj, key, fallbackThunk).bind(bundleAsOption);
        }, function (baseThunk) {
          var base = baseThunk(obj);
          return fallbackAccess(obj, key, $_9njj9iwjjdud7eix.constant({})).map(function (v) {
            return $_73qnwowyjdud7ek9.deepMerge(base, v);
          }).bind(bundle);
        });
      }();
    }, function (okey, instantiator) {
      var state = instantiator(obj);
      return Result.value($_7vvdhixzjdud7eu2.wrap(okey, strength(state)));
    });
  };
  var cExtract = function (path, obj, fields, strength) {
    var results = $_1g2cevwsjdud7ejp.map(fields, function (field) {
      return cExtractOne(path, obj, field, strength);
    });
    return $_fsr4v9xtjdud7en1.consolidateObj(results, {});
  };
  var value$2 = function (validator) {
    var extract = function (path, strength, val) {
      return validator(val, strength).fold(function (err) {
        return $_a7kucqybjdud7ewb.custom(path, err);
      }, Result.value);
    };
    var toString = function () {
      return 'val';
    };
    var toDsl = function () {
      return $_e4kogayajdud7ew8.typeAdt.itemOf(validator);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var getSetKeys = function (obj) {
    var keys = $_2dykn0x0jdud7ekc.keys(obj);
    return $_1g2cevwsjdud7ejp.filter(keys, function (k) {
      return $_ettibkxsjdud7emz.hasKey(obj, k);
    });
  };
  var objOnly = function (fields) {
    var delegate = obj(fields);
    var fieldNames = $_1g2cevwsjdud7ejp.foldr(fields, function (acc, f) {
      return f.fold(function (key) {
        return $_73qnwowyjdud7ek9.deepMerge(acc, $_ettibkxsjdud7emz.wrap(key, true));
      }, $_9njj9iwjjdud7eix.constant(acc));
    }, {});
    var extract = function (path, strength, o) {
      var keys = $_9rljuwzjdud7ekb.isBoolean(o) ? [] : getSetKeys(o);
      var extra = $_1g2cevwsjdud7ejp.filter(keys, function (k) {
        return !$_ettibkxsjdud7emz.hasKey(fieldNames, k);
      });
      return extra.length === 0 ? delegate.extract(path, strength, o) : $_a7kucqybjdud7ewb.unsupportedFields(path, extra);
    };
    return {
      extract: extract,
      toString: delegate.toString,
      toDsl: delegate.toDsl
    };
  };
  var obj = function (fields) {
    var extract = function (path, strength, o) {
      return cExtract(path, o, fields, strength);
    };
    var toString = function () {
      var fieldStrings = $_1g2cevwsjdud7ejp.map(fields, function (field) {
        return field.fold(function (key, okey, presence, prop) {
          return key + ' -> ' + prop.toString();
        }, function (okey, instantiator) {
          return 'state(' + okey + ')';
        });
      });
      return 'obj{\n' + fieldStrings.join('\n') + '}';
    };
    var toDsl = function () {
      return $_e4kogayajdud7ew8.typeAdt.objOf($_1g2cevwsjdud7ejp.map(fields, function (f) {
        return f.fold(function (key, okey, presence, prop) {
          return $_e4kogayajdud7ew8.fieldAdt.field(key, presence, prop);
        }, function (okey, instantiator) {
          return $_e4kogayajdud7ew8.fieldAdt.state(okey);
        });
      }));
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var arr = function (prop) {
    var extract = function (path, strength, array) {
      var results = $_1g2cevwsjdud7ejp.map(array, function (a, i) {
        return prop.extract(path.concat(['[' + i + ']']), strength, a);
      });
      return $_fsr4v9xtjdud7en1.consolidateArr(results);
    };
    var toString = function () {
      return 'array(' + prop.toString() + ')';
    };
    var toDsl = function () {
      return $_e4kogayajdud7ew8.typeAdt.arrOf(prop);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var setOf = function (validator, prop) {
    var validateKeys = function (path, keys) {
      return arr(value$2(validator)).extract(path, $_9njj9iwjjdud7eix.identity, keys);
    };
    var extract = function (path, strength, o) {
      var keys = $_2dykn0x0jdud7ekc.keys(o);
      return validateKeys(path, keys).bind(function (validKeys) {
        var schema = $_1g2cevwsjdud7ejp.map(validKeys, function (vk) {
          return adt$1.field(vk, vk, $_6rbn18y8jdud7evc.strict(), prop);
        });
        return obj(schema).extract(path, strength, o);
      });
    };
    var toString = function () {
      return 'setOf(' + prop.toString() + ')';
    };
    var toDsl = function () {
      return $_e4kogayajdud7ew8.typeAdt.setOf(validator, prop);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var func = function (args, schema, retriever) {
    var delegate = value$2(function (f, strength) {
      return $_9rljuwzjdud7ekb.isFunction(f) ? Result.value(function () {
        var gArgs = Array.prototype.slice.call(arguments, 0);
        var allowedArgs = gArgs.slice(0, args.length);
        var o = f.apply(null, allowedArgs);
        return retriever(o, strength);
      }) : Result.error('Not a function');
    });
    return {
      extract: delegate.extract,
      toString: function () {
        return 'function';
      },
      toDsl: function () {
        return $_e4kogayajdud7ew8.typeAdt.func(args, schema);
      }
    };
  };
  var thunk = function (desc, processor) {
    var getP = $_2nf0bewljdud7ej2.cached(function () {
      return processor();
    });
    var extract = function (path, strength, val) {
      return getP().extract(path, strength, val);
    };
    var toString = function () {
      return getP().toString();
    };
    var toDsl = function () {
      return $_e4kogayajdud7ew8.typeAdt.thunk(desc);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var anyValue = value$2(Result.value);
  var arrOfObj = $_9njj9iwjjdud7eix.compose(arr, obj);
  var $_16ghfpy9jdud7evh = {
    anyValue: $_9njj9iwjjdud7eix.constant(anyValue),
    value: value$2,
    obj: obj,
    objOnly: objOnly,
    arr: arr,
    setOf: setOf,
    arrOfObj: arrOfObj,
    state: adt$1.state,
    field: adt$1.field,
    output: output,
    snapshot: snapshot,
    thunk: thunk,
    func: func
  };

  var strict = function (key) {
    return $_16ghfpy9jdud7evh.field(key, key, $_6rbn18y8jdud7evc.strict(), $_16ghfpy9jdud7evh.anyValue());
  };
  var strictOf = function (key, schema) {
    return $_16ghfpy9jdud7evh.field(key, key, $_6rbn18y8jdud7evc.strict(), schema);
  };
  var strictFunction = function (key) {
    return $_16ghfpy9jdud7evh.field(key, key, $_6rbn18y8jdud7evc.strict(), $_16ghfpy9jdud7evh.value(function (f) {
      return $_9rljuwzjdud7ekb.isFunction(f) ? Result.value(f) : Result.error('Not a function');
    }));
  };
  var forbid = function (key, message) {
    return $_16ghfpy9jdud7evh.field(key, key, $_6rbn18y8jdud7evc.asOption(), $_16ghfpy9jdud7evh.value(function (v) {
      return Result.error('The field: ' + key + ' is forbidden. ' + message);
    }));
  };
  var strictArrayOf = function (key, prop) {
    return strictOf(key, prop);
  };
  var strictObjOf = function (key, objSchema) {
    return $_16ghfpy9jdud7evh.field(key, key, $_6rbn18y8jdud7evc.strict(), $_16ghfpy9jdud7evh.obj(objSchema));
  };
  var strictArrayOfObj = function (key, objFields) {
    return $_16ghfpy9jdud7evh.field(key, key, $_6rbn18y8jdud7evc.strict(), $_16ghfpy9jdud7evh.arrOfObj(objFields));
  };
  var option = function (key) {
    return $_16ghfpy9jdud7evh.field(key, key, $_6rbn18y8jdud7evc.asOption(), $_16ghfpy9jdud7evh.anyValue());
  };
  var optionOf = function (key, schema) {
    return $_16ghfpy9jdud7evh.field(key, key, $_6rbn18y8jdud7evc.asOption(), schema);
  };
  var optionObjOf = function (key, objSchema) {
    return $_16ghfpy9jdud7evh.field(key, key, $_6rbn18y8jdud7evc.asOption(), $_16ghfpy9jdud7evh.obj(objSchema));
  };
  var optionObjOfOnly = function (key, objSchema) {
    return $_16ghfpy9jdud7evh.field(key, key, $_6rbn18y8jdud7evc.asOption(), $_16ghfpy9jdud7evh.objOnly(objSchema));
  };
  var defaulted$1 = function (key, fallback) {
    return $_16ghfpy9jdud7evh.field(key, key, $_6rbn18y8jdud7evc.defaulted(fallback), $_16ghfpy9jdud7evh.anyValue());
  };
  var defaultedOf = function (key, fallback, schema) {
    return $_16ghfpy9jdud7evh.field(key, key, $_6rbn18y8jdud7evc.defaulted(fallback), schema);
  };
  var defaultedObjOf = function (key, fallback, objSchema) {
    return $_16ghfpy9jdud7evh.field(key, key, $_6rbn18y8jdud7evc.defaulted(fallback), $_16ghfpy9jdud7evh.obj(objSchema));
  };
  var field = function (key, okey, presence, prop) {
    return $_16ghfpy9jdud7evh.field(key, okey, presence, prop);
  };
  var state = function (okey, instantiator) {
    return $_16ghfpy9jdud7evh.state(okey, instantiator);
  };
  var $_euqmtby7jdud7ev7 = {
    strict: strict,
    strictOf: strictOf,
    strictObjOf: strictObjOf,
    strictArrayOf: strictArrayOf,
    strictArrayOfObj: strictArrayOfObj,
    strictFunction: strictFunction,
    forbid: forbid,
    option: option,
    optionOf: optionOf,
    optionObjOf: optionObjOf,
    optionObjOfOnly: optionObjOfOnly,
    defaulted: defaulted$1,
    defaultedOf: defaultedOf,
    defaultedObjOf: defaultedObjOf,
    field: field,
    state: state
  };

  var chooseFrom = function (path, strength, input, branches, ch) {
    var fields = $_ettibkxsjdud7emz.readOptFrom(branches, ch);
    return fields.fold(function () {
      return $_a7kucqybjdud7ewb.missingBranch(path, branches, ch);
    }, function (fs) {
      return $_16ghfpy9jdud7evh.obj(fs).extract(path.concat(['branch: ' + ch]), strength, input);
    });
  };
  var choose = function (key, branches) {
    var extract = function (path, strength, input) {
      var choice = $_ettibkxsjdud7emz.readOptFrom(input, key);
      return choice.fold(function () {
        return $_a7kucqybjdud7ewb.missingKey(path, key);
      }, function (chosen) {
        return chooseFrom(path, strength, input, branches, chosen);
      });
    };
    var toString = function () {
      return 'chooseOn(' + key + '). Possible values: ' + $_2dykn0x0jdud7ekc.keys(branches);
    };
    var toDsl = function () {
      return $_e4kogayajdud7ew8.typeAdt.choiceOf(key, branches);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var $_dhmy12yfjdud7ewr = { choose: choose };

  var anyValue$1 = $_16ghfpy9jdud7evh.value(Result.value);
  var arrOfObj$1 = function (objFields) {
    return $_16ghfpy9jdud7evh.arrOfObj(objFields);
  };
  var arrOfVal = function () {
    return $_16ghfpy9jdud7evh.arr(anyValue$1);
  };
  var arrOf = $_16ghfpy9jdud7evh.arr;
  var objOf = $_16ghfpy9jdud7evh.obj;
  var objOfOnly = $_16ghfpy9jdud7evh.objOnly;
  var setOf$1 = $_16ghfpy9jdud7evh.setOf;
  var valueOf = function (validator) {
    return $_16ghfpy9jdud7evh.value(function (v) {
      return validator(v);
    });
  };
  var extract = function (label, prop, strength, obj) {
    return prop.extract([label], strength, obj).fold(function (errs) {
      return Result.error({
        input: obj,
        errors: errs
      });
    }, Result.value);
  };
  var asStruct = function (label, prop, obj) {
    return extract(label, prop, $_9njj9iwjjdud7eix.constant, obj);
  };
  var asRaw = function (label, prop, obj) {
    return extract(label, prop, $_9njj9iwjjdud7eix.identity, obj);
  };
  var getOrDie$1 = function (extraction) {
    return extraction.fold(function (errInfo) {
      throw new Error(formatError(errInfo));
    }, $_9njj9iwjjdud7eix.identity);
  };
  var asRawOrDie = function (label, prop, obj) {
    return getOrDie$1(asRaw(label, prop, obj));
  };
  var asStructOrDie = function (label, prop, obj) {
    return getOrDie$1(asStruct(label, prop, obj));
  };
  var formatError = function (errInfo) {
    return 'Errors: \n' + $_5dzg9kycjdud7ewe.formatErrors(errInfo.errors) + '\n\nInput object: ' + $_5dzg9kycjdud7ewe.formatObj(errInfo.input);
  };
  var choose$1 = function (key, branches) {
    return $_dhmy12yfjdud7ewr.choose(key, branches);
  };
  var thunkOf = function (desc, schema) {
    return $_16ghfpy9jdud7evh.thunk(desc, schema);
  };
  var funcOrDie = function (args, schema) {
    var retriever = function (output, strength) {
      return getOrDie$1(extract('()', schema, strength, output));
    };
    return $_16ghfpy9jdud7evh.func(args, schema, retriever);
  };
  var $_13hkebyejdud7ewm = {
    anyValue: $_9njj9iwjjdud7eix.constant(anyValue$1),
    arrOfObj: arrOfObj$1,
    arrOf: arrOf,
    arrOfVal: arrOfVal,
    valueOf: valueOf,
    setOf: setOf$1,
    objOf: objOf,
    objOfOnly: objOfOnly,
    asStruct: asStruct,
    asRaw: asRaw,
    asStructOrDie: asStructOrDie,
    asRawOrDie: asRawOrDie,
    getOrDie: getOrDie$1,
    formatError: formatError,
    choose: choose$1,
    thunkOf: thunkOf,
    funcOrDie: funcOrDie
  };

  var nu$4 = function (parts) {
    if (!$_ettibkxsjdud7emz.hasKey(parts, 'can') && !$_ettibkxsjdud7emz.hasKey(parts, 'abort') && !$_ettibkxsjdud7emz.hasKey(parts, 'run'))
      throw new Error('EventHandler defined by: ' + $_crnojnydjdud7ewk.stringify(parts, null, 2) + ' does not have can, abort, or run!');
    return $_13hkebyejdud7ewm.asRawOrDie('Extracting event.handler', $_13hkebyejdud7ewm.objOfOnly([
      $_euqmtby7jdud7ev7.defaulted('can', $_9njj9iwjjdud7eix.constant(true)),
      $_euqmtby7jdud7ev7.defaulted('abort', $_9njj9iwjjdud7eix.constant(false)),
      $_euqmtby7jdud7ev7.defaulted('run', $_9njj9iwjjdud7eix.noop)
    ]), parts);
  };
  var all$1 = function (handlers, f) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      return $_1g2cevwsjdud7ejp.foldl(handlers, function (acc, handler) {
        return acc && f(handler).apply(undefined, args);
      }, true);
    };
  };
  var any = function (handlers, f) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      return $_1g2cevwsjdud7ejp.foldl(handlers, function (acc, handler) {
        return acc || f(handler).apply(undefined, args);
      }, false);
    };
  };
  var read = function (handler) {
    return $_9rljuwzjdud7ekb.isFunction(handler) ? {
      can: $_9njj9iwjjdud7eix.constant(true),
      abort: $_9njj9iwjjdud7eix.constant(false),
      run: handler
    } : handler;
  };
  var fuse = function (handlers) {
    var can = all$1(handlers, function (handler) {
      return handler.can;
    });
    var abort = any(handlers, function (handler) {
      return handler.abort;
    });
    var run = function () {
      var args = Array.prototype.slice.call(arguments, 0);
      $_1g2cevwsjdud7ejp.each(handlers, function (handler) {
        handler.run.apply(undefined, args);
      });
    };
    return nu$4({
      can: can,
      abort: abort,
      run: run
    });
  };
  var $_6jq2azy6jdud7eux = {
    read: read,
    fuse: fuse,
    nu: nu$4
  };

  var derive = $_ettibkxsjdud7emz.wrapAll;
  var abort = function (name, predicate) {
    return {
      key: name,
      value: $_6jq2azy6jdud7eux.nu({ abort: predicate })
    };
  };
  var can = function (name, predicate) {
    return {
      key: name,
      value: $_6jq2azy6jdud7eux.nu({ can: predicate })
    };
  };
  var preventDefault = function (name) {
    return {
      key: name,
      value: $_6jq2azy6jdud7eux.nu({
        run: function (component, simulatedEvent) {
          simulatedEvent.event().prevent();
        }
      })
    };
  };
  var run = function (name, handler) {
    return {
      key: name,
      value: $_6jq2azy6jdud7eux.nu({ run: handler })
    };
  };
  var runActionExtra = function (name, action, extra) {
    return {
      key: name,
      value: $_6jq2azy6jdud7eux.nu({
        run: function (component) {
          action.apply(undefined, [component].concat(extra));
        }
      })
    };
  };
  var runOnName = function (name) {
    return function (handler) {
      return run(name, handler);
    };
  };
  var runOnSourceName = function (name) {
    return function (handler) {
      return {
        key: name,
        value: $_6jq2azy6jdud7eux.nu({
          run: function (component, simulatedEvent) {
            if ($_3y5zxmy5jdud7euv.isSource(component, simulatedEvent))
              handler(component, simulatedEvent);
          }
        })
      };
    };
  };
  var redirectToUid = function (name, uid) {
    return run(name, function (component, simulatedEvent) {
      component.getSystem().getByUid(uid).each(function (redirectee) {
        $_98da6jwgjdud7eil.dispatchEvent(redirectee, redirectee.element(), name, simulatedEvent);
      });
    });
  };
  var redirectToPart = function (name, detail, partName) {
    var uid = detail.partUids()[partName];
    return redirectToUid(name, uid);
  };
  var runWithTarget = function (name, f) {
    return run(name, function (component, simulatedEvent) {
      component.getSystem().getByDom(simulatedEvent.event().target()).each(function (target) {
        f(component, target, simulatedEvent);
      });
    });
  };
  var cutter = function (name) {
    return run(name, function (component, simulatedEvent) {
      simulatedEvent.cut();
    });
  };
  var stopper = function (name) {
    return run(name, function (component, simulatedEvent) {
      simulatedEvent.stop();
    });
  };
  var $_5xcuyiy4jdud7eur = {
    derive: derive,
    run: run,
    preventDefault: preventDefault,
    runActionExtra: runActionExtra,
    runOnAttached: runOnSourceName($_801kkqwhjdud7eiq.attachedToDom()),
    runOnDetached: runOnSourceName($_801kkqwhjdud7eiq.detachedFromDom()),
    runOnInit: runOnSourceName($_801kkqwhjdud7eiq.systemInit()),
    runOnExecute: runOnName($_801kkqwhjdud7eiq.execute()),
    redirectToUid: redirectToUid,
    redirectToPart: redirectToPart,
    runWithTarget: runWithTarget,
    abort: abort,
    can: can,
    cutter: cutter,
    stopper: stopper
  };

  var markAsBehaviourApi = function (f, apiName, apiFunction) {
    return f;
  };
  var markAsExtraApi = function (f, extraName) {
    return f;
  };
  var markAsSketchApi = function (f, apiFunction) {
    return f;
  };
  var getAnnotation = Option.none;
  var $_4nn5bbygjdud7eww = {
    markAsBehaviourApi: markAsBehaviourApi,
    markAsExtraApi: markAsExtraApi,
    markAsSketchApi: markAsSketchApi,
    getAnnotation: getAnnotation
  };

  var nu$5 = $_8o1q69x4jdud7ekz.immutableBag(['tag'], [
    'classes',
    'attributes',
    'styles',
    'value',
    'innerHtml',
    'domChildren',
    'defChildren'
  ]);
  var defToStr = function (defn) {
    var raw = defToRaw(defn);
    return $_crnojnydjdud7ewk.stringify(raw, null, 2);
  };
  var defToRaw = function (defn) {
    return {
      tag: defn.tag(),
      classes: defn.classes().getOr([]),
      attributes: defn.attributes().getOr({}),
      styles: defn.styles().getOr({}),
      value: defn.value().getOr('<none>'),
      innerHtml: defn.innerHtml().getOr('<none>'),
      defChildren: defn.defChildren().getOr('<none>'),
      domChildren: defn.domChildren().fold(function () {
        return '<none>';
      }, function (children) {
        return children.length === 0 ? '0 children, but still specified' : String(children.length);
      })
    };
  };
  var $_cfxlyyyijdud7ex9 = {
    nu: nu$5,
    defToStr: defToStr,
    defToRaw: defToRaw
  };

  var fields = [
    'classes',
    'attributes',
    'styles',
    'value',
    'innerHtml',
    'defChildren',
    'domChildren'
  ];
  var nu$6 = $_8o1q69x4jdud7ekz.immutableBag([], fields);
  var derive$1 = function (settings) {
    var r = {};
    var keys = $_2dykn0x0jdud7ekc.keys(settings);
    $_1g2cevwsjdud7ejp.each(keys, function (key) {
      settings[key].each(function (v) {
        r[key] = v;
      });
    });
    return nu$6(r);
  };
  var modToStr = function (mod) {
    var raw = modToRaw(mod);
    return $_crnojnydjdud7ewk.stringify(raw, null, 2);
  };
  var modToRaw = function (mod) {
    return {
      classes: mod.classes().getOr('<none>'),
      attributes: mod.attributes().getOr('<none>'),
      styles: mod.styles().getOr('<none>'),
      value: mod.value().getOr('<none>'),
      innerHtml: mod.innerHtml().getOr('<none>'),
      defChildren: mod.defChildren().getOr('<none>'),
      domChildren: mod.domChildren().fold(function () {
        return '<none>';
      }, function (children) {
        return children.length === 0 ? '0 children, but still specified' : String(children.length);
      })
    };
  };
  var clashingOptArrays = function (key, oArr1, oArr2) {
    return oArr1.fold(function () {
      return oArr2.fold(function () {
        return {};
      }, function (arr2) {
        return $_ettibkxsjdud7emz.wrap(key, arr2);
      });
    }, function (arr1) {
      return oArr2.fold(function () {
        return $_ettibkxsjdud7emz.wrap(key, arr1);
      }, function (arr2) {
        return $_ettibkxsjdud7emz.wrap(key, arr2);
      });
    });
  };
  var merge$1 = function (defnA, mod) {
    var raw = $_73qnwowyjdud7ek9.deepMerge({
      tag: defnA.tag(),
      classes: mod.classes().getOr([]).concat(defnA.classes().getOr([])),
      attributes: $_73qnwowyjdud7ek9.merge(defnA.attributes().getOr({}), mod.attributes().getOr({})),
      styles: $_73qnwowyjdud7ek9.merge(defnA.styles().getOr({}), mod.styles().getOr({}))
    }, mod.innerHtml().or(defnA.innerHtml()).map(function (innerHtml) {
      return $_ettibkxsjdud7emz.wrap('innerHtml', innerHtml);
    }).getOr({}), clashingOptArrays('domChildren', mod.domChildren(), defnA.domChildren()), clashingOptArrays('defChildren', mod.defChildren(), defnA.defChildren()), mod.value().or(defnA.value()).map(function (value) {
      return $_ettibkxsjdud7emz.wrap('value', value);
    }).getOr({}));
    return $_cfxlyyyijdud7ex9.nu(raw);
  };
  var $_biiw3tyhjdud7ewz = {
    nu: nu$6,
    derive: derive$1,
    merge: merge$1,
    modToStr: modToStr,
    modToRaw: modToRaw
  };

  var executeEvent = function (bConfig, bState, executor) {
    return $_5xcuyiy4jdud7eur.runOnExecute(function (component) {
      executor(component, bConfig, bState);
    });
  };
  var loadEvent = function (bConfig, bState, f) {
    return $_5xcuyiy4jdud7eur.runOnInit(function (component, simulatedEvent) {
      f(component, bConfig, bState);
    });
  };
  var create = function (schema, name, active, apis, extra, state) {
    var configSchema = $_13hkebyejdud7ewm.objOfOnly(schema);
    var schemaSchema = $_euqmtby7jdud7ev7.optionObjOf(name, [$_euqmtby7jdud7ev7.optionObjOfOnly('config', schema)]);
    return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
  };
  var createModes = function (modes, name, active, apis, extra, state) {
    var configSchema = modes;
    var schemaSchema = $_euqmtby7jdud7ev7.optionObjOf(name, [$_euqmtby7jdud7ev7.optionOf('config', modes)]);
    return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
  };
  var wrapApi = function (bName, apiFunction, apiName) {
    var f = function (component) {
      var args = arguments;
      return component.config({ name: $_9njj9iwjjdud7eix.constant(bName) }).fold(function () {
        throw new Error('We could not find any behaviour configuration for: ' + bName + '. Using API: ' + apiName);
      }, function (info) {
        var rest = Array.prototype.slice.call(args, 1);
        return apiFunction.apply(undefined, [
          component,
          info.config,
          info.state
        ].concat(rest));
      });
    };
    return $_4nn5bbygjdud7eww.markAsBehaviourApi(f, apiName, apiFunction);
  };
  var revokeBehaviour = function (name) {
    return {
      key: name,
      value: undefined
    };
  };
  var doCreate = function (configSchema, schemaSchema, name, active, apis, extra, state) {
    var getConfig = function (info) {
      return $_ettibkxsjdud7emz.hasKey(info, name) ? info[name]() : Option.none();
    };
    var wrappedApis = $_2dykn0x0jdud7ekc.map(apis, function (apiF, apiName) {
      return wrapApi(name, apiF, apiName);
    });
    var wrappedExtra = $_2dykn0x0jdud7ekc.map(extra, function (extraF, extraName) {
      return $_4nn5bbygjdud7eww.markAsExtraApi(extraF, extraName);
    });
    var me = $_73qnwowyjdud7ek9.deepMerge(wrappedExtra, wrappedApis, {
      revoke: $_9njj9iwjjdud7eix.curry(revokeBehaviour, name),
      config: function (spec) {
        var prepared = $_13hkebyejdud7ewm.asStructOrDie(name + '-config', configSchema, spec);
        return {
          key: name,
          value: {
            config: prepared,
            me: me,
            configAsRaw: $_2nf0bewljdud7ej2.cached(function () {
              return $_13hkebyejdud7ewm.asRawOrDie(name + '-config', configSchema, spec);
            }),
            initialConfig: spec,
            state: state
          }
        };
      },
      schema: function () {
        return schemaSchema;
      },
      exhibit: function (info, base) {
        return getConfig(info).bind(function (behaviourInfo) {
          return $_ettibkxsjdud7emz.readOptFrom(active, 'exhibit').map(function (exhibitor) {
            return exhibitor(base, behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr($_biiw3tyhjdud7ewz.nu({}));
      },
      name: function () {
        return name;
      },
      handlers: function (info) {
        return getConfig(info).bind(function (behaviourInfo) {
          return $_ettibkxsjdud7emz.readOptFrom(active, 'events').map(function (events) {
            return events(behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr({});
      }
    });
    return me;
  };
  var $_1t33c1y3jdud7euf = {
    executeEvent: executeEvent,
    loadEvent: loadEvent,
    create: create,
    createModes: createModes
  };

  var base = function (handleUnsupported, required) {
    return baseWith(handleUnsupported, required, {
      validate: $_9rljuwzjdud7ekb.isFunction,
      label: 'function'
    });
  };
  var baseWith = function (handleUnsupported, required, pred) {
    if (required.length === 0)
      throw new Error('You must specify at least one required field.');
    $_1ie102x7jdud7el4.validateStrArr('required', required);
    $_1ie102x7jdud7el4.checkDupes(required);
    return function (obj) {
      var keys = $_2dykn0x0jdud7ekc.keys(obj);
      var allReqd = $_1g2cevwsjdud7ejp.forall(required, function (req) {
        return $_1g2cevwsjdud7ejp.contains(keys, req);
      });
      if (!allReqd)
        $_1ie102x7jdud7el4.reqMessage(required, keys);
      handleUnsupported(required, keys);
      var invalidKeys = $_1g2cevwsjdud7ejp.filter(required, function (key) {
        return !pred.validate(obj[key], key);
      });
      if (invalidKeys.length > 0)
        $_1ie102x7jdud7el4.invalidTypeMessage(invalidKeys, pred.label);
      return obj;
    };
  };
  var handleExact = function (required, keys) {
    var unsupported = $_1g2cevwsjdud7ejp.filter(keys, function (key) {
      return !$_1g2cevwsjdud7ejp.contains(required, key);
    });
    if (unsupported.length > 0)
      $_1ie102x7jdud7el4.unsuppMessage(unsupported);
  };
  var allowExtra = $_9njj9iwjjdud7eix.noop;
  var $_cmsqfeyljdud7exh = {
    exactly: $_9njj9iwjjdud7eix.curry(base, handleExact),
    ensure: $_9njj9iwjjdud7eix.curry(base, allowExtra),
    ensureWith: $_9njj9iwjjdud7eix.curry(baseWith, allowExtra)
  };

  var BehaviourState = $_cmsqfeyljdud7exh.ensure(['readState']);

  var init = function () {
    return BehaviourState({
      readState: function () {
        return 'No State required';
      }
    });
  };
  var $_71cmtkyjjdud7exe = { init: init };

  var derive$2 = function (capabilities) {
    return $_ettibkxsjdud7emz.wrapAll(capabilities);
  };
  var simpleSchema = $_13hkebyejdud7ewm.objOfOnly([
    $_euqmtby7jdud7ev7.strict('fields'),
    $_euqmtby7jdud7ev7.strict('name'),
    $_euqmtby7jdud7ev7.defaulted('active', {}),
    $_euqmtby7jdud7ev7.defaulted('apis', {}),
    $_euqmtby7jdud7ev7.defaulted('extra', {}),
    $_euqmtby7jdud7ev7.defaulted('state', $_71cmtkyjjdud7exe)
  ]);
  var create$1 = function (data) {
    var value = $_13hkebyejdud7ewm.asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
    return $_1t33c1y3jdud7euf.create(value.fields, value.name, value.active, value.apis, value.extra, value.state);
  };
  var modeSchema = $_13hkebyejdud7ewm.objOfOnly([
    $_euqmtby7jdud7ev7.strict('branchKey'),
    $_euqmtby7jdud7ev7.strict('branches'),
    $_euqmtby7jdud7ev7.strict('name'),
    $_euqmtby7jdud7ev7.defaulted('active', {}),
    $_euqmtby7jdud7ev7.defaulted('apis', {}),
    $_euqmtby7jdud7ev7.defaulted('extra', {}),
    $_euqmtby7jdud7ev7.defaulted('state', $_71cmtkyjjdud7exe)
  ]);
  var createModes$1 = function (data) {
    var value = $_13hkebyejdud7ewm.asRawOrDie('Creating behaviour: ' + data.name, modeSchema, data);
    return $_1t33c1y3jdud7euf.createModes($_13hkebyejdud7ewm.choose(value.branchKey, value.branches), value.name, value.active, value.apis, value.extra, value.state);
  };
  var $_ax1gfoy2jdud7eu7 = {
    derive: derive$2,
    revoke: $_9njj9iwjjdud7eix.constant(undefined),
    noActive: $_9njj9iwjjdud7eix.constant({}),
    noApis: $_9njj9iwjjdud7eix.constant({}),
    noExtra: $_9njj9iwjjdud7eix.constant({}),
    noState: $_9njj9iwjjdud7eix.constant($_71cmtkyjjdud7exe),
    create: create$1,
    createModes: createModes$1
  };

  function Toggler (turnOff, turnOn, initial) {
    var active = initial || false;
    var on = function () {
      turnOn();
      active = true;
    };
    var off = function () {
      turnOff();
      active = false;
    };
    var toggle = function () {
      var f = active ? off : on;
      f();
    };
    var isOn = function () {
      return active;
    };
    return {
      on: on,
      off: off,
      toggle: toggle,
      isOn: isOn
    };
  }

  var read$1 = function (element, attr) {
    var value = $_2vghk1xrjdud7ems.get(element, attr);
    return value === undefined || value === '' ? [] : value.split(' ');
  };
  var add = function (element, attr, id) {
    var old = read$1(element, attr);
    var nu = old.concat([id]);
    $_2vghk1xrjdud7ems.set(element, attr, nu.join(' '));
  };
  var remove$2 = function (element, attr, id) {
    var nu = $_1g2cevwsjdud7ejp.filter(read$1(element, attr), function (v) {
      return v !== id;
    });
    if (nu.length > 0)
      $_2vghk1xrjdud7ems.set(element, attr, nu.join(' '));
    else
      $_2vghk1xrjdud7ems.remove(element, attr);
  };
  var $_5hcec2yqjdud7ey0 = {
    read: read$1,
    add: add,
    remove: remove$2
  };

  var supports = function (element) {
    return element.dom().classList !== undefined;
  };
  var get$2 = function (element) {
    return $_5hcec2yqjdud7ey0.read(element, 'class');
  };
  var add$1 = function (element, clazz) {
    return $_5hcec2yqjdud7ey0.add(element, 'class', clazz);
  };
  var remove$3 = function (element, clazz) {
    return $_5hcec2yqjdud7ey0.remove(element, 'class', clazz);
  };
  var toggle = function (element, clazz) {
    if ($_1g2cevwsjdud7ejp.contains(get$2(element), clazz)) {
      remove$3(element, clazz);
    } else {
      add$1(element, clazz);
    }
  };
  var $_fxl75vypjdud7exy = {
    get: get$2,
    add: add$1,
    remove: remove$3,
    toggle: toggle,
    supports: supports
  };

  var add$2 = function (element, clazz) {
    if ($_fxl75vypjdud7exy.supports(element))
      element.dom().classList.add(clazz);
    else
      $_fxl75vypjdud7exy.add(element, clazz);
  };
  var cleanClass = function (element) {
    var classList = $_fxl75vypjdud7exy.supports(element) ? element.dom().classList : $_fxl75vypjdud7exy.get(element);
    if (classList.length === 0) {
      $_2vghk1xrjdud7ems.remove(element, 'class');
    }
  };
  var remove$4 = function (element, clazz) {
    if ($_fxl75vypjdud7exy.supports(element)) {
      var classList = element.dom().classList;
      classList.remove(clazz);
    } else
      $_fxl75vypjdud7exy.remove(element, clazz);
    cleanClass(element);
  };
  var toggle$1 = function (element, clazz) {
    return $_fxl75vypjdud7exy.supports(element) ? element.dom().classList.toggle(clazz) : $_fxl75vypjdud7exy.toggle(element, clazz);
  };
  var toggler = function (element, clazz) {
    var hasClasslist = $_fxl75vypjdud7exy.supports(element);
    var classList = element.dom().classList;
    var off = function () {
      if (hasClasslist)
        classList.remove(clazz);
      else
        $_fxl75vypjdud7exy.remove(element, clazz);
    };
    var on = function () {
      if (hasClasslist)
        classList.add(clazz);
      else
        $_fxl75vypjdud7exy.add(element, clazz);
    };
    return Toggler(off, on, has$1(element, clazz));
  };
  var has$1 = function (element, clazz) {
    return $_fxl75vypjdud7exy.supports(element) && element.dom().classList.contains(clazz);
  };
  var $_1x3ogvynjdud7exn = {
    add: add$2,
    remove: remove$4,
    toggle: toggle$1,
    toggler: toggler,
    has: has$1
  };

  var swap = function (element, addCls, removeCls) {
    $_1x3ogvynjdud7exn.remove(element, removeCls);
    $_1x3ogvynjdud7exn.add(element, addCls);
  };
  var toAlpha = function (component, swapConfig, swapState) {
    swap(component.element(), swapConfig.alpha(), swapConfig.omega());
  };
  var toOmega = function (component, swapConfig, swapState) {
    swap(component.element(), swapConfig.omega(), swapConfig.alpha());
  };
  var clear = function (component, swapConfig, swapState) {
    $_1x3ogvynjdud7exn.remove(component.element(), swapConfig.alpha());
    $_1x3ogvynjdud7exn.remove(component.element(), swapConfig.omega());
  };
  var isAlpha = function (component, swapConfig, swapState) {
    return $_1x3ogvynjdud7exn.has(component.element(), swapConfig.alpha());
  };
  var isOmega = function (component, swapConfig, swapState) {
    return $_1x3ogvynjdud7exn.has(component.element(), swapConfig.omega());
  };
  var $_8vr1mzymjdud7exk = {
    toAlpha: toAlpha,
    toOmega: toOmega,
    isAlpha: isAlpha,
    isOmega: isOmega,
    clear: clear
  };

  var SwapSchema = [
    $_euqmtby7jdud7ev7.strict('alpha'),
    $_euqmtby7jdud7ev7.strict('omega')
  ];

  var Swapping = $_ax1gfoy2jdud7eu7.create({
    fields: SwapSchema,
    name: 'swapping',
    apis: $_8vr1mzymjdud7exk
  });

  var Cell = function (initial) {
    var value = initial;
    var get = function () {
      return value;
    };
    var set = function (v) {
      value = v;
    };
    var clone = function () {
      return Cell(get());
    };
    return {
      get: get,
      set: set,
      clone: clone
    };
  };

  function ClosestOrAncestor (is, ancestor, scope, a, isRoot) {
    return is(scope, a) ? Option.some(scope) : $_9rljuwzjdud7ekb.isFunction(isRoot) && isRoot(scope) ? Option.none() : ancestor(scope, a, isRoot);
  }

  var first$1 = function (predicate) {
    return descendant($_1tyeizxjjdud7em4.body(), predicate);
  };
  var ancestor = function (scope, predicate, isRoot) {
    var element = scope.dom();
    var stop = $_9rljuwzjdud7ekb.isFunction(isRoot) ? isRoot : $_9njj9iwjjdud7eix.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_eobgtqxfjdud7elu.fromDom(element);
      if (predicate(el))
        return Option.some(el);
      else if (stop(el))
        break;
    }
    return Option.none();
  };
  var closest = function (scope, predicate, isRoot) {
    var is = function (scope) {
      return predicate(scope);
    };
    return ClosestOrAncestor(is, ancestor, scope, predicate, isRoot);
  };
  var sibling = function (scope, predicate) {
    var element = scope.dom();
    if (!element.parentNode)
      return Option.none();
    return child$1($_eobgtqxfjdud7elu.fromDom(element.parentNode), function (x) {
      return !$_f1y1rtx9jdud7el7.eq(scope, x) && predicate(x);
    });
  };
  var child$1 = function (scope, predicate) {
    var result = $_1g2cevwsjdud7ejp.find(scope.dom().childNodes, $_9njj9iwjjdud7eix.compose(predicate, $_eobgtqxfjdud7elu.fromDom));
    return result.map($_eobgtqxfjdud7elu.fromDom);
  };
  var descendant = function (scope, predicate) {
    var descend = function (element) {
      for (var i = 0; i < element.childNodes.length; i++) {
        if (predicate($_eobgtqxfjdud7elu.fromDom(element.childNodes[i])))
          return Option.some($_eobgtqxfjdud7elu.fromDom(element.childNodes[i]));
        var res = descend(element.childNodes[i]);
        if (res.isSome())
          return res;
      }
      return Option.none();
    };
    return descend(scope.dom());
  };
  var $_4j5kdsyvjdud7eyd = {
    first: first$1,
    ancestor: ancestor,
    closest: closest,
    sibling: sibling,
    child: child$1,
    descendant: descendant
  };

  var any$1 = function (predicate) {
    return $_4j5kdsyvjdud7eyd.first(predicate).isSome();
  };
  var ancestor$1 = function (scope, predicate, isRoot) {
    return $_4j5kdsyvjdud7eyd.ancestor(scope, predicate, isRoot).isSome();
  };
  var closest$1 = function (scope, predicate, isRoot) {
    return $_4j5kdsyvjdud7eyd.closest(scope, predicate, isRoot).isSome();
  };
  var sibling$1 = function (scope, predicate) {
    return $_4j5kdsyvjdud7eyd.sibling(scope, predicate).isSome();
  };
  var child$2 = function (scope, predicate) {
    return $_4j5kdsyvjdud7eyd.child(scope, predicate).isSome();
  };
  var descendant$1 = function (scope, predicate) {
    return $_4j5kdsyvjdud7eyd.descendant(scope, predicate).isSome();
  };
  var $_89ls8oyujdud7eyb = {
    any: any$1,
    ancestor: ancestor$1,
    closest: closest$1,
    sibling: sibling$1,
    child: child$2,
    descendant: descendant$1
  };

  var focus = function (element) {
    element.dom().focus();
  };
  var blur = function (element) {
    element.dom().blur();
  };
  var hasFocus = function (element) {
    var doc = $_dekwe2x3jdud7ekr.owner(element).dom();
    return element.dom() === doc.activeElement;
  };
  var active = function (_doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    return Option.from(doc.activeElement).map($_eobgtqxfjdud7elu.fromDom);
  };
  var focusInside = function (element) {
    var doc = $_dekwe2x3jdud7ekr.owner(element);
    var inside = active(doc).filter(function (a) {
      return $_89ls8oyujdud7eyb.closest(a, $_9njj9iwjjdud7eix.curry($_f1y1rtx9jdud7el7.eq, element));
    });
    inside.fold(function () {
      focus(element);
    }, $_9njj9iwjjdud7eix.noop);
  };
  var search = function (element) {
    return active($_dekwe2x3jdud7ekr.owner(element)).filter(function (e) {
      return element.dom().contains(e.dom());
    });
  };
  var $_25580rytjdud7ey7 = {
    hasFocus: hasFocus,
    focus: focus,
    blur: blur,
    active: active,
    search: search,
    focusInside: focusInside
  };

  var DOMUtils = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

  var ThemeManager = tinymce.util.Tools.resolve('tinymce.ThemeManager');

  var openLink = function (target) {
    var link = document.createElement('a');
    link.target = '_blank';
    link.href = target.href;
    link.rel = 'noreferrer noopener';
    var nuEvt = document.createEvent('MouseEvents');
    nuEvt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    document.body.appendChild(link);
    link.dispatchEvent(nuEvt);
    document.body.removeChild(link);
  };
  var $_6cir74yzjdud7eyp = { openLink: openLink };

  var isSkinDisabled = function (editor) {
    return editor.settings.skin === false;
  };
  var $_1ue238z0jdud7eyq = { isSkinDisabled: isSkinDisabled };

  var formatChanged = 'formatChanged';
  var orientationChanged = 'orientationChanged';
  var dropupDismissed = 'dropupDismissed';
  var $_dlmrcrz1jdud7eyr = {
    formatChanged: $_9njj9iwjjdud7eix.constant(formatChanged),
    orientationChanged: $_9njj9iwjjdud7eix.constant(orientationChanged),
    dropupDismissed: $_9njj9iwjjdud7eix.constant(dropupDismissed)
  };

  var chooseChannels = function (channels, message) {
    return message.universal() ? channels : $_1g2cevwsjdud7ejp.filter(channels, function (ch) {
      return $_1g2cevwsjdud7ejp.contains(message.channels(), ch);
    });
  };
  var events = function (receiveConfig) {
    return $_5xcuyiy4jdud7eur.derive([$_5xcuyiy4jdud7eur.run($_801kkqwhjdud7eiq.receive(), function (component, message) {
        var channelMap = receiveConfig.channels();
        var channels = $_2dykn0x0jdud7ekc.keys(channelMap);
        var targetChannels = chooseChannels(channels, message);
        $_1g2cevwsjdud7ejp.each(targetChannels, function (ch) {
          var channelInfo = channelMap[ch]();
          var channelSchema = channelInfo.schema();
          var data = $_13hkebyejdud7ewm.asStructOrDie('channel[' + ch + '] data\nReceiver: ' + $_d3f8kuxmjdud7emi.element(component.element()), channelSchema, message.data());
          channelInfo.onReceive()(component, data);
        });
      })]);
  };
  var $_cvbaslz4jdud7ez5 = { events: events };

  var menuFields = [
    $_euqmtby7jdud7ev7.strict('menu'),
    $_euqmtby7jdud7ev7.strict('selectedMenu')
  ];
  var itemFields = [
    $_euqmtby7jdud7ev7.strict('item'),
    $_euqmtby7jdud7ev7.strict('selectedItem')
  ];
  var schema = $_13hkebyejdud7ewm.objOfOnly(itemFields.concat(menuFields));
  var itemSchema = $_13hkebyejdud7ewm.objOfOnly(itemFields);
  var $_7x0bkgz7jdud7ezs = {
    menuFields: $_9njj9iwjjdud7eix.constant(menuFields),
    itemFields: $_9njj9iwjjdud7eix.constant(itemFields),
    schema: $_9njj9iwjjdud7eix.constant(schema),
    itemSchema: $_9njj9iwjjdud7eix.constant(itemSchema)
  };

  var initSize = $_euqmtby7jdud7ev7.strictObjOf('initSize', [
    $_euqmtby7jdud7ev7.strict('numColumns'),
    $_euqmtby7jdud7ev7.strict('numRows')
  ]);
  var itemMarkers = function () {
    return $_euqmtby7jdud7ev7.strictOf('markers', $_7x0bkgz7jdud7ezs.itemSchema());
  };
  var menuMarkers = function () {
    return $_euqmtby7jdud7ev7.strictOf('markers', $_7x0bkgz7jdud7ezs.schema());
  };
  var tieredMenuMarkers = function () {
    return $_euqmtby7jdud7ev7.strictObjOf('markers', [$_euqmtby7jdud7ev7.strict('backgroundMenu')].concat($_7x0bkgz7jdud7ezs.menuFields()).concat($_7x0bkgz7jdud7ezs.itemFields()));
  };
  var markers = function (required) {
    return $_euqmtby7jdud7ev7.strictObjOf('markers', $_1g2cevwsjdud7ejp.map(required, $_euqmtby7jdud7ev7.strict));
  };
  var onPresenceHandler = function (label, fieldName, presence) {
    var trace = $_efa715xljdud7em8.getTrace();
    return $_euqmtby7jdud7ev7.field(fieldName, fieldName, presence, $_13hkebyejdud7ewm.valueOf(function (f) {
      return Result.value(function () {
        $_efa715xljdud7em8.logHandler(label, fieldName, trace);
        return f.apply(undefined, arguments);
      });
    }));
  };
  var onHandler = function (fieldName) {
    return onPresenceHandler('onHandler', fieldName, $_6rbn18y8jdud7evc.defaulted($_9njj9iwjjdud7eix.noop));
  };
  var onKeyboardHandler = function (fieldName) {
    return onPresenceHandler('onKeyboardHandler', fieldName, $_6rbn18y8jdud7evc.defaulted(Option.none));
  };
  var onStrictHandler = function (fieldName) {
    return onPresenceHandler('onHandler', fieldName, $_6rbn18y8jdud7evc.strict());
  };
  var onStrictKeyboardHandler = function (fieldName) {
    return onPresenceHandler('onKeyboardHandler', fieldName, $_6rbn18y8jdud7evc.strict());
  };
  var output$1 = function (name, value) {
    return $_euqmtby7jdud7ev7.state(name, $_9njj9iwjjdud7eix.constant(value));
  };
  var snapshot$1 = function (name) {
    return $_euqmtby7jdud7ev7.state(name, $_9njj9iwjjdud7eix.identity);
  };
  var $_etkinez6jdud7ezi = {
    initSize: $_9njj9iwjjdud7eix.constant(initSize),
    itemMarkers: itemMarkers,
    menuMarkers: menuMarkers,
    tieredMenuMarkers: tieredMenuMarkers,
    markers: markers,
    onHandler: onHandler,
    onKeyboardHandler: onKeyboardHandler,
    onStrictHandler: onStrictHandler,
    onStrictKeyboardHandler: onStrictKeyboardHandler,
    output: output$1,
    snapshot: snapshot$1
  };

  var ReceivingSchema = [$_euqmtby7jdud7ev7.strictOf('channels', $_13hkebyejdud7ewm.setOf(Result.value, $_13hkebyejdud7ewm.objOfOnly([
      $_etkinez6jdud7ezi.onStrictHandler('onReceive'),
      $_euqmtby7jdud7ev7.defaulted('schema', $_13hkebyejdud7ewm.anyValue())
    ])))];

  var Receiving = $_ax1gfoy2jdud7eu7.create({
    fields: ReceivingSchema,
    name: 'receiving',
    active: $_cvbaslz4jdud7ez5
  });

  var updateAriaState = function (component, toggleConfig) {
    var pressed = isOn(component, toggleConfig);
    var ariaInfo = toggleConfig.aria();
    ariaInfo.update()(component, ariaInfo, pressed);
  };
  var toggle$2 = function (component, toggleConfig, toggleState) {
    $_1x3ogvynjdud7exn.toggle(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var on = function (component, toggleConfig, toggleState) {
    $_1x3ogvynjdud7exn.add(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var off = function (component, toggleConfig, toggleState) {
    $_1x3ogvynjdud7exn.remove(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var isOn = function (component, toggleConfig) {
    return $_1x3ogvynjdud7exn.has(component.element(), toggleConfig.toggleClass());
  };
  var onLoad = function (component, toggleConfig, toggleState) {
    var api = toggleConfig.selected() ? on : off;
    api(component, toggleConfig, toggleState);
  };
  var $_2x2xhizajdud7f0b = {
    onLoad: onLoad,
    toggle: toggle$2,
    isOn: isOn,
    on: on,
    off: off
  };

  var exhibit = function (base, toggleConfig, toggleState) {
    return $_biiw3tyhjdud7ewz.nu({});
  };
  var events$1 = function (toggleConfig, toggleState) {
    var execute = $_1t33c1y3jdud7euf.executeEvent(toggleConfig, toggleState, $_2x2xhizajdud7f0b.toggle);
    var load = $_1t33c1y3jdud7euf.loadEvent(toggleConfig, toggleState, $_2x2xhizajdud7f0b.onLoad);
    return $_5xcuyiy4jdud7eur.derive($_1g2cevwsjdud7ejp.flatten([
      toggleConfig.toggleOnExecute() ? [execute] : [],
      [load]
    ]));
  };
  var $_bu8r8rz9jdud7f08 = {
    exhibit: exhibit,
    events: events$1
  };

  var updatePressed = function (component, ariaInfo, status) {
    $_2vghk1xrjdud7ems.set(component.element(), 'aria-pressed', status);
    if (ariaInfo.syncWithExpanded())
      updateExpanded(component, ariaInfo, status);
  };
  var updateSelected = function (component, ariaInfo, status) {
    $_2vghk1xrjdud7ems.set(component.element(), 'aria-selected', status);
  };
  var updateChecked = function (component, ariaInfo, status) {
    $_2vghk1xrjdud7ems.set(component.element(), 'aria-checked', status);
  };
  var updateExpanded = function (component, ariaInfo, status) {
    $_2vghk1xrjdud7ems.set(component.element(), 'aria-expanded', status);
  };
  var tagAttributes = {
    button: ['aria-pressed'],
    'input:checkbox': ['aria-checked']
  };
  var roleAttributes = {
    'button': ['aria-pressed'],
    'listbox': [
      'aria-pressed',
      'aria-expanded'
    ],
    'menuitemcheckbox': ['aria-checked']
  };
  var detectFromTag = function (component) {
    var elem = component.element();
    var rawTag = $_50qkdpxkjdud7em6.name(elem);
    var suffix = rawTag === 'input' && $_2vghk1xrjdud7ems.has(elem, 'type') ? ':' + $_2vghk1xrjdud7ems.get(elem, 'type') : '';
    return $_ettibkxsjdud7emz.readOptFrom(tagAttributes, rawTag + suffix);
  };
  var detectFromRole = function (component) {
    var elem = component.element();
    if (!$_2vghk1xrjdud7ems.has(elem, 'role'))
      return Option.none();
    else {
      var role = $_2vghk1xrjdud7ems.get(elem, 'role');
      return $_ettibkxsjdud7emz.readOptFrom(roleAttributes, role);
    }
  };
  var updateAuto = function (component, ariaInfo, status) {
    var attributes = detectFromRole(component).orThunk(function () {
      return detectFromTag(component);
    }).getOr([]);
    $_1g2cevwsjdud7ejp.each(attributes, function (attr) {
      $_2vghk1xrjdud7ems.set(component.element(), attr, status);
    });
  };
  var $_6a43yqzcjdud7f0l = {
    updatePressed: updatePressed,
    updateSelected: updateSelected,
    updateChecked: updateChecked,
    updateExpanded: updateExpanded,
    updateAuto: updateAuto
  };

  var ToggleSchema = [
    $_euqmtby7jdud7ev7.defaulted('selected', false),
    $_euqmtby7jdud7ev7.strict('toggleClass'),
    $_euqmtby7jdud7ev7.defaulted('toggleOnExecute', true),
    $_euqmtby7jdud7ev7.defaultedOf('aria', { mode: 'none' }, $_13hkebyejdud7ewm.choose('mode', {
      'pressed': [
        $_euqmtby7jdud7ev7.defaulted('syncWithExpanded', false),
        $_etkinez6jdud7ezi.output('update', $_6a43yqzcjdud7f0l.updatePressed)
      ],
      'checked': [$_etkinez6jdud7ezi.output('update', $_6a43yqzcjdud7f0l.updateChecked)],
      'expanded': [$_etkinez6jdud7ezi.output('update', $_6a43yqzcjdud7f0l.updateExpanded)],
      'selected': [$_etkinez6jdud7ezi.output('update', $_6a43yqzcjdud7f0l.updateSelected)],
      'none': [$_etkinez6jdud7ezi.output('update', $_9njj9iwjjdud7eix.noop)]
    }))
  ];

  var Toggling = $_ax1gfoy2jdud7eu7.create({
    fields: ToggleSchema,
    name: 'toggling',
    active: $_bu8r8rz9jdud7f08,
    apis: $_2x2xhizajdud7f0b
  });

  var format = function (command, update) {
    return Receiving.config({
      channels: $_ettibkxsjdud7emz.wrap($_dlmrcrz1jdud7eyr.formatChanged(), {
        onReceive: function (button, data) {
          if (data.command === command) {
            update(button, data.state);
          }
        }
      })
    });
  };
  var orientation = function (onReceive) {
    return Receiving.config({ channels: $_ettibkxsjdud7emz.wrap($_dlmrcrz1jdud7eyr.orientationChanged(), { onReceive: onReceive }) });
  };
  var receive = function (channel, onReceive) {
    return {
      key: channel,
      value: { onReceive: onReceive }
    };
  };
  var $_nw25bzdjdud7f0v = {
    format: format,
    orientation: orientation,
    receive: receive
  };

  var prefix = 'tinymce-mobile';
  var resolve$1 = function (p) {
    return prefix + '-' + p;
  };
  var $_5qzh4bzejdud7f0y = {
    resolve: resolve$1,
    prefix: $_9njj9iwjjdud7eix.constant(prefix)
  };

  var focus$1 = function (component, focusConfig) {
    if (!focusConfig.ignore()) {
      $_25580rytjdud7ey7.focus(component.element());
      focusConfig.onFocus()(component);
    }
  };
  var blur$1 = function (component, focusConfig) {
    if (!focusConfig.ignore()) {
      $_25580rytjdud7ey7.blur(component.element());
    }
  };
  var isFocused = function (component) {
    return $_25580rytjdud7ey7.hasFocus(component.element());
  };
  var $_arynz0zjjdud7f1h = {
    focus: focus$1,
    blur: blur$1,
    isFocused: isFocused
  };

  var exhibit$1 = function (base, focusConfig) {
    if (focusConfig.ignore())
      return $_biiw3tyhjdud7ewz.nu({});
    else
      return $_biiw3tyhjdud7ewz.nu({ attributes: { 'tabindex': '-1' } });
  };
  var events$2 = function (focusConfig) {
    return $_5xcuyiy4jdud7eur.derive([$_5xcuyiy4jdud7eur.run($_801kkqwhjdud7eiq.focus(), function (component, simulatedEvent) {
        $_arynz0zjjdud7f1h.focus(component, focusConfig);
        simulatedEvent.stop();
      })]);
  };
  var $_5fj8t7zijdud7f1g = {
    exhibit: exhibit$1,
    events: events$2
  };

  var FocusSchema = [
    $_etkinez6jdud7ezi.onHandler('onFocus'),
    $_euqmtby7jdud7ev7.defaulted('ignore', false)
  ];

  var Focusing = $_ax1gfoy2jdud7eu7.create({
    fields: FocusSchema,
    name: 'focusing',
    active: $_5fj8t7zijdud7f1g,
    apis: $_arynz0zjjdud7f1h
  });

  var $_8y8vdkzpjdud7f2d = {
    BACKSPACE: $_9njj9iwjjdud7eix.constant([8]),
    TAB: $_9njj9iwjjdud7eix.constant([9]),
    ENTER: $_9njj9iwjjdud7eix.constant([13]),
    SHIFT: $_9njj9iwjjdud7eix.constant([16]),
    CTRL: $_9njj9iwjjdud7eix.constant([17]),
    ALT: $_9njj9iwjjdud7eix.constant([18]),
    CAPSLOCK: $_9njj9iwjjdud7eix.constant([20]),
    ESCAPE: $_9njj9iwjjdud7eix.constant([27]),
    SPACE: $_9njj9iwjjdud7eix.constant([32]),
    PAGEUP: $_9njj9iwjjdud7eix.constant([33]),
    PAGEDOWN: $_9njj9iwjjdud7eix.constant([34]),
    END: $_9njj9iwjjdud7eix.constant([35]),
    HOME: $_9njj9iwjjdud7eix.constant([36]),
    LEFT: $_9njj9iwjjdud7eix.constant([37]),
    UP: $_9njj9iwjjdud7eix.constant([38]),
    RIGHT: $_9njj9iwjjdud7eix.constant([39]),
    DOWN: $_9njj9iwjjdud7eix.constant([40]),
    INSERT: $_9njj9iwjjdud7eix.constant([45]),
    DEL: $_9njj9iwjjdud7eix.constant([46]),
    META: $_9njj9iwjjdud7eix.constant([
      91,
      93,
      224
    ]),
    F10: $_9njj9iwjjdud7eix.constant([121])
  };

  var cycleBy = function (value, delta, min, max) {
    var r = value + delta;
    if (r > max)
      return min;
    else
      return r < min ? max : r;
  };
  var cap = function (value, min, max) {
    if (value <= min)
      return min;
    else
      return value >= max ? max : value;
  };
  var $_b3gjjrzujdud7f38 = {
    cycleBy: cycleBy,
    cap: cap
  };

  var all$2 = function (predicate) {
    return descendants($_1tyeizxjjdud7em4.body(), predicate);
  };
  var ancestors = function (scope, predicate, isRoot) {
    return $_1g2cevwsjdud7ejp.filter($_dekwe2x3jdud7ekr.parents(scope, isRoot), predicate);
  };
  var siblings$1 = function (scope, predicate) {
    return $_1g2cevwsjdud7ejp.filter($_dekwe2x3jdud7ekr.siblings(scope), predicate);
  };
  var children$1 = function (scope, predicate) {
    return $_1g2cevwsjdud7ejp.filter($_dekwe2x3jdud7ekr.children(scope), predicate);
  };
  var descendants = function (scope, predicate) {
    var result = [];
    $_1g2cevwsjdud7ejp.each($_dekwe2x3jdud7ekr.children(scope), function (x) {
      if (predicate(x)) {
        result = result.concat([x]);
      }
      result = result.concat(descendants(x, predicate));
    });
    return result;
  };
  var $_4ec18vzwjdud7f3b = {
    all: all$2,
    ancestors: ancestors,
    siblings: siblings$1,
    children: children$1,
    descendants: descendants
  };

  var all$3 = function (selector) {
    return $_1t43jfxejdud7elq.all(selector);
  };
  var ancestors$1 = function (scope, selector, isRoot) {
    return $_4ec18vzwjdud7f3b.ancestors(scope, function (e) {
      return $_1t43jfxejdud7elq.is(e, selector);
    }, isRoot);
  };
  var siblings$2 = function (scope, selector) {
    return $_4ec18vzwjdud7f3b.siblings(scope, function (e) {
      return $_1t43jfxejdud7elq.is(e, selector);
    });
  };
  var children$2 = function (scope, selector) {
    return $_4ec18vzwjdud7f3b.children(scope, function (e) {
      return $_1t43jfxejdud7elq.is(e, selector);
    });
  };
  var descendants$1 = function (scope, selector) {
    return $_1t43jfxejdud7elq.all(selector, scope);
  };
  var $_df6s98zvjdud7f39 = {
    all: all$3,
    ancestors: ancestors$1,
    siblings: siblings$2,
    children: children$2,
    descendants: descendants$1
  };

  var first$2 = function (selector) {
    return $_1t43jfxejdud7elq.one(selector);
  };
  var ancestor$2 = function (scope, selector, isRoot) {
    return $_4j5kdsyvjdud7eyd.ancestor(scope, function (e) {
      return $_1t43jfxejdud7elq.is(e, selector);
    }, isRoot);
  };
  var sibling$2 = function (scope, selector) {
    return $_4j5kdsyvjdud7eyd.sibling(scope, function (e) {
      return $_1t43jfxejdud7elq.is(e, selector);
    });
  };
  var child$3 = function (scope, selector) {
    return $_4j5kdsyvjdud7eyd.child(scope, function (e) {
      return $_1t43jfxejdud7elq.is(e, selector);
    });
  };
  var descendant$2 = function (scope, selector) {
    return $_1t43jfxejdud7elq.one(selector, scope);
  };
  var closest$2 = function (scope, selector, isRoot) {
    return ClosestOrAncestor($_1t43jfxejdud7elq.is, ancestor$2, scope, selector, isRoot);
  };
  var $_a3quyizxjdud7f3e = {
    first: first$2,
    ancestor: ancestor$2,
    sibling: sibling$2,
    child: child$3,
    descendant: descendant$2,
    closest: closest$2
  };

  var dehighlightAll = function (component, hConfig, hState) {
    var highlighted = $_df6s98zvjdud7f39.descendants(component.element(), '.' + hConfig.highlightClass());
    $_1g2cevwsjdud7ejp.each(highlighted, function (h) {
      $_1x3ogvynjdud7exn.remove(h, hConfig.highlightClass());
      component.getSystem().getByDom(h).each(function (target) {
        hConfig.onDehighlight()(component, target);
      });
    });
  };
  var dehighlight = function (component, hConfig, hState, target) {
    var wasHighlighted = isHighlighted(component, hConfig, hState, target);
    $_1x3ogvynjdud7exn.remove(target.element(), hConfig.highlightClass());
    if (wasHighlighted)
      hConfig.onDehighlight()(component, target);
  };
  var highlight = function (component, hConfig, hState, target) {
    var wasHighlighted = isHighlighted(component, hConfig, hState, target);
    dehighlightAll(component, hConfig, hState);
    $_1x3ogvynjdud7exn.add(target.element(), hConfig.highlightClass());
    if (!wasHighlighted)
      hConfig.onHighlight()(component, target);
  };
  var highlightFirst = function (component, hConfig, hState) {
    getFirst(component, hConfig, hState).each(function (firstComp) {
      highlight(component, hConfig, hState, firstComp);
    });
  };
  var highlightLast = function (component, hConfig, hState) {
    getLast(component, hConfig, hState).each(function (lastComp) {
      highlight(component, hConfig, hState, lastComp);
    });
  };
  var highlightAt = function (component, hConfig, hState, index) {
    getByIndex(component, hConfig, hState, index).fold(function (err) {
      throw new Error(err);
    }, function (firstComp) {
      highlight(component, hConfig, hState, firstComp);
    });
  };
  var highlightBy = function (component, hConfig, hState, predicate) {
    var items = $_df6s98zvjdud7f39.descendants(component.element(), '.' + hConfig.itemClass());
    var itemComps = $_ak7xq9y0jdud7eu4.cat($_1g2cevwsjdud7ejp.map(items, function (i) {
      return component.getSystem().getByDom(i).toOption();
    }));
    var targetComp = $_1g2cevwsjdud7ejp.find(itemComps, predicate);
    targetComp.each(function (c) {
      highlight(component, hConfig, hState, c);
    });
  };
  var isHighlighted = function (component, hConfig, hState, queryTarget) {
    return $_1x3ogvynjdud7exn.has(queryTarget.element(), hConfig.highlightClass());
  };
  var getHighlighted = function (component, hConfig, hState) {
    return $_a3quyizxjdud7f3e.descendant(component.element(), '.' + hConfig.highlightClass()).bind(component.getSystem().getByDom);
  };
  var getByIndex = function (component, hConfig, hState, index) {
    var items = $_df6s98zvjdud7f39.descendants(component.element(), '.' + hConfig.itemClass());
    return Option.from(items[index]).fold(function () {
      return Result.error('No element found with index ' + index);
    }, component.getSystem().getByDom);
  };
  var getFirst = function (component, hConfig, hState) {
    return $_a3quyizxjdud7f3e.descendant(component.element(), '.' + hConfig.itemClass()).bind(component.getSystem().getByDom);
  };
  var getLast = function (component, hConfig, hState) {
    var items = $_df6s98zvjdud7f39.descendants(component.element(), '.' + hConfig.itemClass());
    var last = items.length > 0 ? Option.some(items[items.length - 1]) : Option.none();
    return last.bind(component.getSystem().getByDom);
  };
  var getDelta = function (component, hConfig, hState, delta) {
    var items = $_df6s98zvjdud7f39.descendants(component.element(), '.' + hConfig.itemClass());
    var current = $_1g2cevwsjdud7ejp.findIndex(items, function (item) {
      return $_1x3ogvynjdud7exn.has(item, hConfig.highlightClass());
    });
    return current.bind(function (selected) {
      var dest = $_b3gjjrzujdud7f38.cycleBy(selected, delta, 0, items.length - 1);
      return component.getSystem().getByDom(items[dest]);
    });
  };
  var getPrevious = function (component, hConfig, hState) {
    return getDelta(component, hConfig, hState, -1);
  };
  var getNext = function (component, hConfig, hState) {
    return getDelta(component, hConfig, hState, +1);
  };
  var $_6qqyvsztjdud7f2r = {
    dehighlightAll: dehighlightAll,
    dehighlight: dehighlight,
    highlight: highlight,
    highlightFirst: highlightFirst,
    highlightLast: highlightLast,
    highlightAt: highlightAt,
    highlightBy: highlightBy,
    isHighlighted: isHighlighted,
    getHighlighted: getHighlighted,
    getFirst: getFirst,
    getLast: getLast,
    getPrevious: getPrevious,
    getNext: getNext
  };

  var HighlightSchema = [
    $_euqmtby7jdud7ev7.strict('highlightClass'),
    $_euqmtby7jdud7ev7.strict('itemClass'),
    $_etkinez6jdud7ezi.onHandler('onHighlight'),
    $_etkinez6jdud7ezi.onHandler('onDehighlight')
  ];

  var Highlighting = $_ax1gfoy2jdud7eu7.create({
    fields: HighlightSchema,
    name: 'highlighting',
    apis: $_6qqyvsztjdud7f2r
  });

  var dom = function () {
    var get = function (component) {
      return $_25580rytjdud7ey7.search(component.element());
    };
    var set = function (component, focusee) {
      component.getSystem().triggerFocus(focusee, component.element());
    };
    return {
      get: get,
      set: set
    };
  };
  var highlights = function () {
    var get = function (component) {
      return Highlighting.getHighlighted(component).map(function (item) {
        return item.element();
      });
    };
    var set = function (component, element) {
      component.getSystem().getByDom(element).fold($_9njj9iwjjdud7eix.noop, function (item) {
        Highlighting.highlight(component, item);
      });
    };
    return {
      get: get,
      set: set
    };
  };
  var $_cic9p1zrjdud7f2l = {
    dom: dom,
    highlights: highlights
  };

  var inSet = function (keys) {
    return function (event) {
      return $_1g2cevwsjdud7ejp.contains(keys, event.raw().which);
    };
  };
  var and = function (preds) {
    return function (event) {
      return $_1g2cevwsjdud7ejp.forall(preds, function (pred) {
        return pred(event);
      });
    };
  };
  var is$1 = function (key) {
    return function (event) {
      return event.raw().which === key;
    };
  };
  var isShift = function (event) {
    return event.raw().shiftKey === true;
  };
  var isControl = function (event) {
    return event.raw().ctrlKey === true;
  };
  var $_7ccsxg100jdud7f3k = {
    inSet: inSet,
    and: and,
    is: is$1,
    isShift: isShift,
    isNotShift: $_9njj9iwjjdud7eix.not(isShift),
    isControl: isControl,
    isNotControl: $_9njj9iwjjdud7eix.not(isControl)
  };

  var basic = function (key, action) {
    return {
      matches: $_7ccsxg100jdud7f3k.is(key),
      classification: action
    };
  };
  var rule = function (matches, action) {
    return {
      matches: matches,
      classification: action
    };
  };
  var choose$2 = function (transitions, event) {
    var transition = $_1g2cevwsjdud7ejp.find(transitions, function (t) {
      return t.matches(event);
    });
    return transition.map(function (t) {
      return t.classification;
    });
  };
  var $_33m1mtzzjdud7f3i = {
    basic: basic,
    rule: rule,
    choose: choose$2
  };

  var typical = function (infoSchema, stateInit, getRules, getEvents, getApis, optFocusIn) {
    var schema = function () {
      return infoSchema.concat([
        $_euqmtby7jdud7ev7.defaulted('focusManager', $_cic9p1zrjdud7f2l.dom()),
        $_etkinez6jdud7ezi.output('handler', me),
        $_etkinez6jdud7ezi.output('state', stateInit)
      ]);
    };
    var processKey = function (component, simulatedEvent, keyingConfig, keyingState) {
      var rules = getRules(component, simulatedEvent, keyingConfig, keyingState);
      return $_33m1mtzzjdud7f3i.choose(rules, simulatedEvent.event()).bind(function (rule) {
        return rule(component, simulatedEvent, keyingConfig, keyingState);
      });
    };
    var toEvents = function (keyingConfig, keyingState) {
      var otherEvents = getEvents(keyingConfig, keyingState);
      var keyEvents = $_5xcuyiy4jdud7eur.derive(optFocusIn.map(function (focusIn) {
        return $_5xcuyiy4jdud7eur.run($_801kkqwhjdud7eiq.focus(), function (component, simulatedEvent) {
          focusIn(component, keyingConfig, keyingState, simulatedEvent);
          simulatedEvent.stop();
        });
      }).toArray().concat([$_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.keydown(), function (component, simulatedEvent) {
          processKey(component, simulatedEvent, keyingConfig, keyingState).each(function (_) {
            simulatedEvent.stop();
          });
        })]));
      return $_73qnwowyjdud7ek9.deepMerge(otherEvents, keyEvents);
    };
    var me = {
      schema: schema,
      processKey: processKey,
      toEvents: toEvents,
      toApis: getApis
    };
    return me;
  };
  var $_3ktlz9zqjdud7f2g = { typical: typical };

  var cyclePrev = function (values, index, predicate) {
    var before = $_1g2cevwsjdud7ejp.reverse(values.slice(0, index));
    var after = $_1g2cevwsjdud7ejp.reverse(values.slice(index + 1));
    return $_1g2cevwsjdud7ejp.find(before.concat(after), predicate);
  };
  var tryPrev = function (values, index, predicate) {
    var before = $_1g2cevwsjdud7ejp.reverse(values.slice(0, index));
    return $_1g2cevwsjdud7ejp.find(before, predicate);
  };
  var cycleNext = function (values, index, predicate) {
    var before = values.slice(0, index);
    var after = values.slice(index + 1);
    return $_1g2cevwsjdud7ejp.find(after.concat(before), predicate);
  };
  var tryNext = function (values, index, predicate) {
    var after = values.slice(index + 1);
    return $_1g2cevwsjdud7ejp.find(after, predicate);
  };
  var $_ccuwl6101jdud7f3o = {
    cyclePrev: cyclePrev,
    cycleNext: cycleNext,
    tryPrev: tryPrev,
    tryNext: tryNext
  };

  var isSupported = function (dom) {
    return dom.style !== undefined;
  };
  var $_e1lc9g104jdud7f43 = { isSupported: isSupported };

  var internalSet = function (dom, property, value) {
    if (!$_9rljuwzjdud7ekb.isString(value)) {
      console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
      throw new Error('CSS value must be a string: ' + value);
    }
    if ($_e1lc9g104jdud7f43.isSupported(dom))
      dom.style.setProperty(property, value);
  };
  var internalRemove = function (dom, property) {
    if ($_e1lc9g104jdud7f43.isSupported(dom))
      dom.style.removeProperty(property);
  };
  var set$2 = function (element, property, value) {
    var dom = element.dom();
    internalSet(dom, property, value);
  };
  var setAll$1 = function (element, css) {
    var dom = element.dom();
    $_2dykn0x0jdud7ekc.each(css, function (v, k) {
      internalSet(dom, k, v);
    });
  };
  var setOptions = function (element, css) {
    var dom = element.dom();
    $_2dykn0x0jdud7ekc.each(css, function (v, k) {
      v.fold(function () {
        internalRemove(dom, k);
      }, function (value) {
        internalSet(dom, k, value);
      });
    });
  };
  var get$3 = function (element, property) {
    var dom = element.dom();
    var styles = window.getComputedStyle(dom);
    var r = styles.getPropertyValue(property);
    var v = r === '' && !$_1tyeizxjjdud7em4.inBody(element) ? getUnsafeProperty(dom, property) : r;
    return v === null ? undefined : v;
  };
  var getUnsafeProperty = function (dom, property) {
    return $_e1lc9g104jdud7f43.isSupported(dom) ? dom.style.getPropertyValue(property) : '';
  };
  var getRaw = function (element, property) {
    var dom = element.dom();
    var raw = getUnsafeProperty(dom, property);
    return Option.from(raw).filter(function (r) {
      return r.length > 0;
    });
  };
  var getAllRaw = function (element) {
    var css = {};
    var dom = element.dom();
    if ($_e1lc9g104jdud7f43.isSupported(dom)) {
      for (var i = 0; i < dom.style.length; i++) {
        var ruleName = dom.style.item(i);
        css[ruleName] = dom.style[ruleName];
      }
    }
    return css;
  };
  var isValidValue = function (tag, property, value) {
    var element = $_eobgtqxfjdud7elu.fromTag(tag);
    set$2(element, property, value);
    var style = getRaw(element, property);
    return style.isSome();
  };
  var remove$5 = function (element, property) {
    var dom = element.dom();
    internalRemove(dom, property);
    if ($_2vghk1xrjdud7ems.has(element, 'style') && $_2e2eauwvjdud7ek5.trim($_2vghk1xrjdud7ems.get(element, 'style')) === '') {
      $_2vghk1xrjdud7ems.remove(element, 'style');
    }
  };
  var preserve = function (element, f) {
    var oldStyles = $_2vghk1xrjdud7ems.get(element, 'style');
    var result = f(element);
    var restore = oldStyles === undefined ? $_2vghk1xrjdud7ems.remove : $_2vghk1xrjdud7ems.set;
    restore(element, 'style', oldStyles);
    return result;
  };
  var copy$1 = function (source, target) {
    var sourceDom = source.dom();
    var targetDom = target.dom();
    if ($_e1lc9g104jdud7f43.isSupported(sourceDom) && $_e1lc9g104jdud7f43.isSupported(targetDom)) {
      targetDom.style.cssText = sourceDom.style.cssText;
    }
  };
  var reflow = function (e) {
    return e.dom().offsetWidth;
  };
  var transferOne$1 = function (source, destination, style) {
    getRaw(source, style).each(function (value) {
      if (getRaw(destination, style).isNone())
        set$2(destination, style, value);
    });
  };
  var transfer$1 = function (source, destination, styles) {
    if (!$_50qkdpxkjdud7em6.isElement(source) || !$_50qkdpxkjdud7em6.isElement(destination))
      return;
    $_1g2cevwsjdud7ejp.each(styles, function (style) {
      transferOne$1(source, destination, style);
    });
  };
  var $_btgbcy103jdud7f3t = {
    copy: copy$1,
    set: set$2,
    preserve: preserve,
    setAll: setAll$1,
    setOptions: setOptions,
    remove: remove$5,
    get: get$3,
    getRaw: getRaw,
    getAllRaw: getAllRaw,
    isValidValue: isValidValue,
    reflow: reflow,
    transfer: transfer$1
  };

  function Dimension (name, getOffset) {
    var set = function (element, h) {
      if (!$_9rljuwzjdud7ekb.isNumber(h) && !h.match(/^[0-9]+$/))
        throw name + '.set accepts only positive integer values. Value was ' + h;
      var dom = element.dom();
      if ($_e1lc9g104jdud7f43.isSupported(dom))
        dom.style[name] = h + 'px';
    };
    var get = function (element) {
      var r = getOffset(element);
      if (r <= 0 || r === null) {
        var css = $_btgbcy103jdud7f3t.get(element, name);
        return parseFloat(css) || 0;
      }
      return r;
    };
    var getOuter = get;
    var aggregate = function (element, properties) {
      return $_1g2cevwsjdud7ejp.foldl(properties, function (acc, property) {
        var val = $_btgbcy103jdud7f3t.get(element, property);
        var value = val === undefined ? 0 : parseInt(val, 10);
        return isNaN(value) ? acc : acc + value;
      }, 0);
    };
    var max = function (element, value, properties) {
      var cumulativeInclusions = aggregate(element, properties);
      var absoluteMax = value > cumulativeInclusions ? value - cumulativeInclusions : 0;
      return absoluteMax;
    };
    return {
      set: set,
      get: get,
      getOuter: getOuter,
      aggregate: aggregate,
      max: max
    };
  }

  var api = Dimension('height', function (element) {
    return $_1tyeizxjjdud7em4.inBody(element) ? element.dom().getBoundingClientRect().height : element.dom().offsetHeight;
  });
  var set$3 = function (element, h) {
    api.set(element, h);
  };
  var get$4 = function (element) {
    return api.get(element);
  };
  var getOuter$1 = function (element) {
    return api.getOuter(element);
  };
  var setMax = function (element, value) {
    var inclusions = [
      'margin-top',
      'border-top-width',
      'padding-top',
      'padding-bottom',
      'border-bottom-width',
      'margin-bottom'
    ];
    var absMax = api.max(element, value, inclusions);
    $_btgbcy103jdud7f3t.set(element, 'max-height', absMax + 'px');
  };
  var $_q9861102jdud7f3r = {
    set: set$3,
    get: get$4,
    getOuter: getOuter$1,
    setMax: setMax
  };

  var create$2 = function (cyclicField) {
    var schema = [
      $_euqmtby7jdud7ev7.option('onEscape'),
      $_euqmtby7jdud7ev7.option('onEnter'),
      $_euqmtby7jdud7ev7.defaulted('selector', '[data-alloy-tabstop="true"]'),
      $_euqmtby7jdud7ev7.defaulted('firstTabstop', 0),
      $_euqmtby7jdud7ev7.defaulted('useTabstopAt', $_9njj9iwjjdud7eix.constant(true)),
      $_euqmtby7jdud7ev7.option('visibilitySelector')
    ].concat([cyclicField]);
    var isVisible = function (tabbingConfig, element) {
      var target = tabbingConfig.visibilitySelector().bind(function (sel) {
        return $_a3quyizxjdud7f3e.closest(element, sel);
      }).getOr(element);
      return $_q9861102jdud7f3r.get(target) > 0;
    };
    var findInitial = function (component, tabbingConfig) {
      var tabstops = $_df6s98zvjdud7f39.descendants(component.element(), tabbingConfig.selector());
      var visibles = $_1g2cevwsjdud7ejp.filter(tabstops, function (elem) {
        return isVisible(tabbingConfig, elem);
      });
      return Option.from(visibles[tabbingConfig.firstTabstop()]);
    };
    var findCurrent = function (component, tabbingConfig) {
      return tabbingConfig.focusManager().get(component).bind(function (elem) {
        return $_a3quyizxjdud7f3e.closest(elem, tabbingConfig.selector());
      });
    };
    var isTabstop = function (tabbingConfig, element) {
      return isVisible(tabbingConfig, element) && tabbingConfig.useTabstopAt()(element);
    };
    var focusIn = function (component, tabbingConfig, tabbingState) {
      findInitial(component, tabbingConfig).each(function (target) {
        tabbingConfig.focusManager().set(component, target);
      });
    };
    var goFromTabstop = function (component, tabstops, stopIndex, tabbingConfig, cycle) {
      return cycle(tabstops, stopIndex, function (elem) {
        return isTabstop(tabbingConfig, elem);
      }).fold(function () {
        return tabbingConfig.cyclic() ? Option.some(true) : Option.none();
      }, function (target) {
        tabbingConfig.focusManager().set(component, target);
        return Option.some(true);
      });
    };
    var go = function (component, simulatedEvent, tabbingConfig, cycle) {
      var tabstops = $_df6s98zvjdud7f39.descendants(component.element(), tabbingConfig.selector());
      return findCurrent(component, tabbingConfig).bind(function (tabstop) {
        var optStopIndex = $_1g2cevwsjdud7ejp.findIndex(tabstops, $_9njj9iwjjdud7eix.curry($_f1y1rtx9jdud7el7.eq, tabstop));
        return optStopIndex.bind(function (stopIndex) {
          return goFromTabstop(component, tabstops, stopIndex, tabbingConfig, cycle);
        });
      });
    };
    var goBackwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      var navigate = tabbingConfig.cyclic() ? $_ccuwl6101jdud7f3o.cyclePrev : $_ccuwl6101jdud7f3o.tryPrev;
      return go(component, simulatedEvent, tabbingConfig, navigate);
    };
    var goForwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      var navigate = tabbingConfig.cyclic() ? $_ccuwl6101jdud7f3o.cycleNext : $_ccuwl6101jdud7f3o.tryNext;
      return go(component, simulatedEvent, tabbingConfig, navigate);
    };
    var execute = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      return tabbingConfig.onEnter().bind(function (f) {
        return f(component, simulatedEvent);
      });
    };
    var exit = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      return tabbingConfig.onEscape().bind(function (f) {
        return f(component, simulatedEvent);
      });
    };
    var getRules = $_9njj9iwjjdud7eix.constant([
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.and([
        $_7ccsxg100jdud7f3k.isShift,
        $_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.TAB())
      ]), goBackwards),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.TAB()), goForwards),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.ESCAPE()), exit),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.and([
        $_7ccsxg100jdud7f3k.isNotShift,
        $_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.ENTER())
      ]), execute)
    ]);
    var getEvents = $_9njj9iwjjdud7eix.constant({});
    var getApis = $_9njj9iwjjdud7eix.constant({});
    return $_3ktlz9zqjdud7f2g.typical(schema, $_71cmtkyjjdud7exe.init, getRules, getEvents, getApis, Option.some(focusIn));
  };
  var $_5orss7zojdud7f1v = { create: create$2 };

  var AcyclicType = $_5orss7zojdud7f1v.create($_euqmtby7jdud7ev7.state('cyclic', $_9njj9iwjjdud7eix.constant(false)));

  var CyclicType = $_5orss7zojdud7f1v.create($_euqmtby7jdud7ev7.state('cyclic', $_9njj9iwjjdud7eix.constant(true)));

  var inside = function (target) {
    return $_50qkdpxkjdud7em6.name(target) === 'input' && $_2vghk1xrjdud7ems.get(target, 'type') !== 'radio' || $_50qkdpxkjdud7em6.name(target) === 'textarea';
  };
  var $_ddk3fu108jdud7f4o = { inside: inside };

  var doDefaultExecute = function (component, simulatedEvent, focused) {
    $_98da6jwgjdud7eil.dispatch(component, focused, $_801kkqwhjdud7eiq.execute());
    return Option.some(true);
  };
  var defaultExecute = function (component, simulatedEvent, focused) {
    return $_ddk3fu108jdud7f4o.inside(focused) && $_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.SPACE())(simulatedEvent.event()) ? Option.none() : doDefaultExecute(component, simulatedEvent, focused);
  };
  var $_afxwya109jdud7f4r = { defaultExecute: defaultExecute };

  var schema$1 = [
    $_euqmtby7jdud7ev7.defaulted('execute', $_afxwya109jdud7f4r.defaultExecute),
    $_euqmtby7jdud7ev7.defaulted('useSpace', false),
    $_euqmtby7jdud7ev7.defaulted('useEnter', true),
    $_euqmtby7jdud7ev7.defaulted('useControlEnter', false),
    $_euqmtby7jdud7ev7.defaulted('useDown', false)
  ];
  var execute = function (component, simulatedEvent, executeConfig, executeState) {
    return executeConfig.execute()(component, simulatedEvent, component.element());
  };
  var getRules = function (component, simulatedEvent, executeConfig, executeState) {
    var spaceExec = executeConfig.useSpace() && !$_ddk3fu108jdud7f4o.inside(component.element()) ? $_8y8vdkzpjdud7f2d.SPACE() : [];
    var enterExec = executeConfig.useEnter() ? $_8y8vdkzpjdud7f2d.ENTER() : [];
    var downExec = executeConfig.useDown() ? $_8y8vdkzpjdud7f2d.DOWN() : [];
    var execKeys = spaceExec.concat(enterExec).concat(downExec);
    return [$_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet(execKeys), execute)].concat(executeConfig.useControlEnter() ? [$_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.and([
        $_7ccsxg100jdud7f3k.isControl,
        $_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.ENTER())
      ]), execute)] : []);
  };
  var getEvents = $_9njj9iwjjdud7eix.constant({});
  var getApis = $_9njj9iwjjdud7eix.constant({});
  var ExecutionType = $_3ktlz9zqjdud7f2g.typical(schema$1, $_71cmtkyjjdud7exe.init, getRules, getEvents, getApis, Option.none());

  var flatgrid = function (spec) {
    var dimensions = Cell(Option.none());
    var setGridSize = function (numRows, numColumns) {
      dimensions.set(Option.some({
        numRows: $_9njj9iwjjdud7eix.constant(numRows),
        numColumns: $_9njj9iwjjdud7eix.constant(numColumns)
      }));
    };
    var getNumRows = function () {
      return dimensions.get().map(function (d) {
        return d.numRows();
      });
    };
    var getNumColumns = function () {
      return dimensions.get().map(function (d) {
        return d.numColumns();
      });
    };
    return BehaviourState({
      readState: $_9njj9iwjjdud7eix.constant({}),
      setGridSize: setGridSize,
      getNumRows: getNumRows,
      getNumColumns: getNumColumns
    });
  };
  var init$1 = function (spec) {
    return spec.state()(spec);
  };
  var $_a1e0cn10bjdud7f52 = {
    flatgrid: flatgrid,
    init: init$1
  };

  var onDirection = function (isLtr, isRtl) {
    return function (element) {
      return getDirection(element) === 'rtl' ? isRtl : isLtr;
    };
  };
  var getDirection = function (element) {
    return $_btgbcy103jdud7f3t.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
  };
  var $_6dinub10djdud7f5a = {
    onDirection: onDirection,
    getDirection: getDirection
  };

  var useH = function (movement) {
    return function (component, simulatedEvent, config, state) {
      var move = movement(component.element());
      return use(move, component, simulatedEvent, config, state);
    };
  };
  var west = function (moveLeft, moveRight) {
    var movement = $_6dinub10djdud7f5a.onDirection(moveLeft, moveRight);
    return useH(movement);
  };
  var east = function (moveLeft, moveRight) {
    var movement = $_6dinub10djdud7f5a.onDirection(moveRight, moveLeft);
    return useH(movement);
  };
  var useV = function (move) {
    return function (component, simulatedEvent, config, state) {
      return use(move, component, simulatedEvent, config, state);
    };
  };
  var use = function (move, component, simulatedEvent, config, state) {
    var outcome = config.focusManager().get(component).bind(function (focused) {
      return move(component.element(), focused, config, state);
    });
    return outcome.map(function (newFocus) {
      config.focusManager().set(component, newFocus);
      return true;
    });
  };
  var $_ev1k2410cjdud7f58 = {
    east: east,
    west: west,
    north: useV,
    south: useV,
    move: useV
  };

  var indexInfo = $_8o1q69x4jdud7ekz.immutableBag([
    'index',
    'candidates'
  ], []);
  var locate = function (candidates, predicate) {
    return $_1g2cevwsjdud7ejp.findIndex(candidates, predicate).map(function (index) {
      return indexInfo({
        index: index,
        candidates: candidates
      });
    });
  };
  var $_7l3fto10fjdud7f5i = { locate: locate };

  var visibilityToggler = function (element, property, hiddenValue, visibleValue) {
    var initial = $_btgbcy103jdud7f3t.get(element, property);
    if (initial === undefined)
      initial = '';
    var value = initial === hiddenValue ? visibleValue : hiddenValue;
    var off = $_9njj9iwjjdud7eix.curry($_btgbcy103jdud7f3t.set, element, property, initial);
    var on = $_9njj9iwjjdud7eix.curry($_btgbcy103jdud7f3t.set, element, property, value);
    return Toggler(off, on, false);
  };
  var toggler$1 = function (element) {
    return visibilityToggler(element, 'visibility', 'hidden', 'visible');
  };
  var displayToggler = function (element, value) {
    return visibilityToggler(element, 'display', 'none', value);
  };
  var isHidden = function (dom) {
    return dom.offsetWidth <= 0 && dom.offsetHeight <= 0;
  };
  var isVisible = function (element) {
    var dom = element.dom();
    return !isHidden(dom);
  };
  var $_dbpb0m10gjdud7f5m = {
    toggler: toggler$1,
    displayToggler: displayToggler,
    isVisible: isVisible
  };

  var locateVisible = function (container, current, selector) {
    var filter = $_dbpb0m10gjdud7f5m.isVisible;
    return locateIn(container, current, selector, filter);
  };
  var locateIn = function (container, current, selector, filter) {
    var predicate = $_9njj9iwjjdud7eix.curry($_f1y1rtx9jdud7el7.eq, current);
    var candidates = $_df6s98zvjdud7f39.descendants(container, selector);
    var visible = $_1g2cevwsjdud7ejp.filter(candidates, $_dbpb0m10gjdud7f5m.isVisible);
    return $_7l3fto10fjdud7f5i.locate(visible, predicate);
  };
  var findIndex$2 = function (elements, target) {
    return $_1g2cevwsjdud7ejp.findIndex(elements, function (elem) {
      return $_f1y1rtx9jdud7el7.eq(target, elem);
    });
  };
  var $_80m1p210ejdud7f5c = {
    locateVisible: locateVisible,
    locateIn: locateIn,
    findIndex: findIndex$2
  };

  var withGrid = function (values, index, numCols, f) {
    var oldRow = Math.floor(index / numCols);
    var oldColumn = index % numCols;
    return f(oldRow, oldColumn).bind(function (address) {
      var newIndex = address.row() * numCols + address.column();
      return newIndex >= 0 && newIndex < values.length ? Option.some(values[newIndex]) : Option.none();
    });
  };
  var cycleHorizontal = function (values, index, numRows, numCols, delta) {
    return withGrid(values, index, numCols, function (oldRow, oldColumn) {
      var onLastRow = oldRow === numRows - 1;
      var colsInRow = onLastRow ? values.length - oldRow * numCols : numCols;
      var newColumn = $_b3gjjrzujdud7f38.cycleBy(oldColumn, delta, 0, colsInRow - 1);
      return Option.some({
        row: $_9njj9iwjjdud7eix.constant(oldRow),
        column: $_9njj9iwjjdud7eix.constant(newColumn)
      });
    });
  };
  var cycleVertical = function (values, index, numRows, numCols, delta) {
    return withGrid(values, index, numCols, function (oldRow, oldColumn) {
      var newRow = $_b3gjjrzujdud7f38.cycleBy(oldRow, delta, 0, numRows - 1);
      var onLastRow = newRow === numRows - 1;
      var colsInRow = onLastRow ? values.length - newRow * numCols : numCols;
      var newCol = $_b3gjjrzujdud7f38.cap(oldColumn, 0, colsInRow - 1);
      return Option.some({
        row: $_9njj9iwjjdud7eix.constant(newRow),
        column: $_9njj9iwjjdud7eix.constant(newCol)
      });
    });
  };
  var cycleRight = function (values, index, numRows, numCols) {
    return cycleHorizontal(values, index, numRows, numCols, +1);
  };
  var cycleLeft = function (values, index, numRows, numCols) {
    return cycleHorizontal(values, index, numRows, numCols, -1);
  };
  var cycleUp = function (values, index, numRows, numCols) {
    return cycleVertical(values, index, numRows, numCols, -1);
  };
  var cycleDown = function (values, index, numRows, numCols) {
    return cycleVertical(values, index, numRows, numCols, +1);
  };
  var $_7hyrk410hjdud7f5p = {
    cycleDown: cycleDown,
    cycleUp: cycleUp,
    cycleLeft: cycleLeft,
    cycleRight: cycleRight
  };

  var schema$2 = [
    $_euqmtby7jdud7ev7.strict('selector'),
    $_euqmtby7jdud7ev7.defaulted('execute', $_afxwya109jdud7f4r.defaultExecute),
    $_etkinez6jdud7ezi.onKeyboardHandler('onEscape'),
    $_euqmtby7jdud7ev7.defaulted('captureTab', false),
    $_etkinez6jdud7ezi.initSize()
  ];
  var focusIn = function (component, gridConfig, gridState) {
    $_a3quyizxjdud7f3e.descendant(component.element(), gridConfig.selector()).each(function (first) {
      gridConfig.focusManager().set(component, first);
    });
  };
  var findCurrent = function (component, gridConfig) {
    return gridConfig.focusManager().get(component).bind(function (elem) {
      return $_a3quyizxjdud7f3e.closest(elem, gridConfig.selector());
    });
  };
  var execute$1 = function (component, simulatedEvent, gridConfig, gridState) {
    return findCurrent(component, gridConfig).bind(function (focused) {
      return gridConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var doMove = function (cycle) {
    return function (element, focused, gridConfig, gridState) {
      return $_80m1p210ejdud7f5c.locateVisible(element, focused, gridConfig.selector()).bind(function (identified) {
        return cycle(identified.candidates(), identified.index(), gridState.getNumRows().getOr(gridConfig.initSize().numRows()), gridState.getNumColumns().getOr(gridConfig.initSize().numColumns()));
      });
    };
  };
  var handleTab = function (component, simulatedEvent, gridConfig, gridState) {
    return gridConfig.captureTab() ? Option.some(true) : Option.none();
  };
  var doEscape = function (component, simulatedEvent, gridConfig, gridState) {
    return gridConfig.onEscape()(component, simulatedEvent);
  };
  var moveLeft = doMove($_7hyrk410hjdud7f5p.cycleLeft);
  var moveRight = doMove($_7hyrk410hjdud7f5p.cycleRight);
  var moveNorth = doMove($_7hyrk410hjdud7f5p.cycleUp);
  var moveSouth = doMove($_7hyrk410hjdud7f5p.cycleDown);
  var getRules$1 = $_9njj9iwjjdud7eix.constant([
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.LEFT()), $_ev1k2410cjdud7f58.west(moveLeft, moveRight)),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.RIGHT()), $_ev1k2410cjdud7f58.east(moveLeft, moveRight)),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.UP()), $_ev1k2410cjdud7f58.north(moveNorth)),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.DOWN()), $_ev1k2410cjdud7f58.south(moveSouth)),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.and([
      $_7ccsxg100jdud7f3k.isShift,
      $_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.TAB())
    ]), handleTab),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.and([
      $_7ccsxg100jdud7f3k.isNotShift,
      $_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.TAB())
    ]), handleTab),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.ESCAPE()), doEscape),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.SPACE().concat($_8y8vdkzpjdud7f2d.ENTER())), execute$1)
  ]);
  var getEvents$1 = $_9njj9iwjjdud7eix.constant({});
  var getApis$1 = {};
  var FlatgridType = $_3ktlz9zqjdud7f2g.typical(schema$2, $_a1e0cn10bjdud7f52.flatgrid, getRules$1, getEvents$1, getApis$1, Option.some(focusIn));

  var horizontal = function (container, selector, current, delta) {
    return $_80m1p210ejdud7f5c.locateVisible(container, current, selector, $_9njj9iwjjdud7eix.constant(true)).bind(function (identified) {
      var index = identified.index();
      var candidates = identified.candidates();
      var newIndex = $_b3gjjrzujdud7f38.cycleBy(index, delta, 0, candidates.length - 1);
      return Option.from(candidates[newIndex]);
    });
  };
  var $_9mpzr710jjdud7f61 = { horizontal: horizontal };

  var schema$3 = [
    $_euqmtby7jdud7ev7.strict('selector'),
    $_euqmtby7jdud7ev7.defaulted('getInitial', Option.none),
    $_euqmtby7jdud7ev7.defaulted('execute', $_afxwya109jdud7f4r.defaultExecute),
    $_euqmtby7jdud7ev7.defaulted('executeOnMove', false)
  ];
  var findCurrent$1 = function (component, flowConfig) {
    return flowConfig.focusManager().get(component).bind(function (elem) {
      return $_a3quyizxjdud7f3e.closest(elem, flowConfig.selector());
    });
  };
  var execute$2 = function (component, simulatedEvent, flowConfig) {
    return findCurrent$1(component, flowConfig).bind(function (focused) {
      return flowConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var focusIn$1 = function (component, flowConfig) {
    flowConfig.getInitial()(component).or($_a3quyizxjdud7f3e.descendant(component.element(), flowConfig.selector())).each(function (first) {
      flowConfig.focusManager().set(component, first);
    });
  };
  var moveLeft$1 = function (element, focused, info) {
    return $_9mpzr710jjdud7f61.horizontal(element, info.selector(), focused, -1);
  };
  var moveRight$1 = function (element, focused, info) {
    return $_9mpzr710jjdud7f61.horizontal(element, info.selector(), focused, +1);
  };
  var doMove$1 = function (movement) {
    return function (component, simulatedEvent, flowConfig) {
      return movement(component, simulatedEvent, flowConfig).bind(function () {
        return flowConfig.executeOnMove() ? execute$2(component, simulatedEvent, flowConfig) : Option.some(true);
      });
    };
  };
  var getRules$2 = function (_) {
    return [
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.LEFT().concat($_8y8vdkzpjdud7f2d.UP())), doMove$1($_ev1k2410cjdud7f58.west(moveLeft$1, moveRight$1))),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.RIGHT().concat($_8y8vdkzpjdud7f2d.DOWN())), doMove$1($_ev1k2410cjdud7f58.east(moveLeft$1, moveRight$1))),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.ENTER()), execute$2),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.SPACE()), execute$2)
    ];
  };
  var getEvents$2 = $_9njj9iwjjdud7eix.constant({});
  var getApis$2 = $_9njj9iwjjdud7eix.constant({});
  var FlowType = $_3ktlz9zqjdud7f2g.typical(schema$3, $_71cmtkyjjdud7exe.init, getRules$2, getEvents$2, getApis$2, Option.some(focusIn$1));

  var outcome = $_8o1q69x4jdud7ekz.immutableBag([
    'rowIndex',
    'columnIndex',
    'cell'
  ], []);
  var toCell = function (matrix, rowIndex, columnIndex) {
    return Option.from(matrix[rowIndex]).bind(function (row) {
      return Option.from(row[columnIndex]).map(function (cell) {
        return outcome({
          rowIndex: rowIndex,
          columnIndex: columnIndex,
          cell: cell
        });
      });
    });
  };
  var cycleHorizontal$1 = function (matrix, rowIndex, startCol, deltaCol) {
    var row = matrix[rowIndex];
    var colsInRow = row.length;
    var newColIndex = $_b3gjjrzujdud7f38.cycleBy(startCol, deltaCol, 0, colsInRow - 1);
    return toCell(matrix, rowIndex, newColIndex);
  };
  var cycleVertical$1 = function (matrix, colIndex, startRow, deltaRow) {
    var nextRowIndex = $_b3gjjrzujdud7f38.cycleBy(startRow, deltaRow, 0, matrix.length - 1);
    var colsInNextRow = matrix[nextRowIndex].length;
    var nextColIndex = $_b3gjjrzujdud7f38.cap(colIndex, 0, colsInNextRow - 1);
    return toCell(matrix, nextRowIndex, nextColIndex);
  };
  var moveHorizontal = function (matrix, rowIndex, startCol, deltaCol) {
    var row = matrix[rowIndex];
    var colsInRow = row.length;
    var newColIndex = $_b3gjjrzujdud7f38.cap(startCol + deltaCol, 0, colsInRow - 1);
    return toCell(matrix, rowIndex, newColIndex);
  };
  var moveVertical = function (matrix, colIndex, startRow, deltaRow) {
    var nextRowIndex = $_b3gjjrzujdud7f38.cap(startRow + deltaRow, 0, matrix.length - 1);
    var colsInNextRow = matrix[nextRowIndex].length;
    var nextColIndex = $_b3gjjrzujdud7f38.cap(colIndex, 0, colsInNextRow - 1);
    return toCell(matrix, nextRowIndex, nextColIndex);
  };
  var cycleRight$1 = function (matrix, startRow, startCol) {
    return cycleHorizontal$1(matrix, startRow, startCol, +1);
  };
  var cycleLeft$1 = function (matrix, startRow, startCol) {
    return cycleHorizontal$1(matrix, startRow, startCol, -1);
  };
  var cycleUp$1 = function (matrix, startRow, startCol) {
    return cycleVertical$1(matrix, startCol, startRow, -1);
  };
  var cycleDown$1 = function (matrix, startRow, startCol) {
    return cycleVertical$1(matrix, startCol, startRow, +1);
  };
  var moveLeft$2 = function (matrix, startRow, startCol) {
    return moveHorizontal(matrix, startRow, startCol, -1);
  };
  var moveRight$2 = function (matrix, startRow, startCol) {
    return moveHorizontal(matrix, startRow, startCol, +1);
  };
  var moveUp = function (matrix, startRow, startCol) {
    return moveVertical(matrix, startCol, startRow, -1);
  };
  var moveDown = function (matrix, startRow, startCol) {
    return moveVertical(matrix, startCol, startRow, +1);
  };
  var $_arz1zn10ljdud7f6n = {
    cycleRight: cycleRight$1,
    cycleLeft: cycleLeft$1,
    cycleUp: cycleUp$1,
    cycleDown: cycleDown$1,
    moveLeft: moveLeft$2,
    moveRight: moveRight$2,
    moveUp: moveUp,
    moveDown: moveDown
  };

  var schema$4 = [
    $_euqmtby7jdud7ev7.strictObjOf('selectors', [
      $_euqmtby7jdud7ev7.strict('row'),
      $_euqmtby7jdud7ev7.strict('cell')
    ]),
    $_euqmtby7jdud7ev7.defaulted('cycles', true),
    $_euqmtby7jdud7ev7.defaulted('previousSelector', Option.none),
    $_euqmtby7jdud7ev7.defaulted('execute', $_afxwya109jdud7f4r.defaultExecute)
  ];
  var focusIn$2 = function (component, matrixConfig) {
    var focused = matrixConfig.previousSelector()(component).orThunk(function () {
      var selectors = matrixConfig.selectors();
      return $_a3quyizxjdud7f3e.descendant(component.element(), selectors.cell());
    });
    focused.each(function (cell) {
      matrixConfig.focusManager().set(component, cell);
    });
  };
  var execute$3 = function (component, simulatedEvent, matrixConfig) {
    return $_25580rytjdud7ey7.search(component.element()).bind(function (focused) {
      return matrixConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var toMatrix = function (rows, matrixConfig) {
    return $_1g2cevwsjdud7ejp.map(rows, function (row) {
      return $_df6s98zvjdud7f39.descendants(row, matrixConfig.selectors().cell());
    });
  };
  var doMove$2 = function (ifCycle, ifMove) {
    return function (element, focused, matrixConfig) {
      var move = matrixConfig.cycles() ? ifCycle : ifMove;
      return $_a3quyizxjdud7f3e.closest(focused, matrixConfig.selectors().row()).bind(function (inRow) {
        var cellsInRow = $_df6s98zvjdud7f39.descendants(inRow, matrixConfig.selectors().cell());
        return $_80m1p210ejdud7f5c.findIndex(cellsInRow, focused).bind(function (colIndex) {
          var allRows = $_df6s98zvjdud7f39.descendants(element, matrixConfig.selectors().row());
          return $_80m1p210ejdud7f5c.findIndex(allRows, inRow).bind(function (rowIndex) {
            var matrix = toMatrix(allRows, matrixConfig);
            return move(matrix, rowIndex, colIndex).map(function (next) {
              return next.cell();
            });
          });
        });
      });
    };
  };
  var moveLeft$3 = doMove$2($_arz1zn10ljdud7f6n.cycleLeft, $_arz1zn10ljdud7f6n.moveLeft);
  var moveRight$3 = doMove$2($_arz1zn10ljdud7f6n.cycleRight, $_arz1zn10ljdud7f6n.moveRight);
  var moveNorth$1 = doMove$2($_arz1zn10ljdud7f6n.cycleUp, $_arz1zn10ljdud7f6n.moveUp);
  var moveSouth$1 = doMove$2($_arz1zn10ljdud7f6n.cycleDown, $_arz1zn10ljdud7f6n.moveDown);
  var getRules$3 = $_9njj9iwjjdud7eix.constant([
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.LEFT()), $_ev1k2410cjdud7f58.west(moveLeft$3, moveRight$3)),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.RIGHT()), $_ev1k2410cjdud7f58.east(moveLeft$3, moveRight$3)),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.UP()), $_ev1k2410cjdud7f58.north(moveNorth$1)),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.DOWN()), $_ev1k2410cjdud7f58.south(moveSouth$1)),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.SPACE().concat($_8y8vdkzpjdud7f2d.ENTER())), execute$3)
  ]);
  var getEvents$3 = $_9njj9iwjjdud7eix.constant({});
  var getApis$3 = $_9njj9iwjjdud7eix.constant({});
  var MatrixType = $_3ktlz9zqjdud7f2g.typical(schema$4, $_71cmtkyjjdud7exe.init, getRules$3, getEvents$3, getApis$3, Option.some(focusIn$2));

  var schema$5 = [
    $_euqmtby7jdud7ev7.strict('selector'),
    $_euqmtby7jdud7ev7.defaulted('execute', $_afxwya109jdud7f4r.defaultExecute),
    $_euqmtby7jdud7ev7.defaulted('moveOnTab', false)
  ];
  var execute$4 = function (component, simulatedEvent, menuConfig) {
    return menuConfig.focusManager().get(component).bind(function (focused) {
      return menuConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var focusIn$3 = function (component, menuConfig, simulatedEvent) {
    $_a3quyizxjdud7f3e.descendant(component.element(), menuConfig.selector()).each(function (first) {
      menuConfig.focusManager().set(component, first);
    });
  };
  var moveUp$1 = function (element, focused, info) {
    return $_9mpzr710jjdud7f61.horizontal(element, info.selector(), focused, -1);
  };
  var moveDown$1 = function (element, focused, info) {
    return $_9mpzr710jjdud7f61.horizontal(element, info.selector(), focused, +1);
  };
  var fireShiftTab = function (component, simulatedEvent, menuConfig) {
    return menuConfig.moveOnTab() ? $_ev1k2410cjdud7f58.move(moveUp$1)(component, simulatedEvent, menuConfig) : Option.none();
  };
  var fireTab = function (component, simulatedEvent, menuConfig) {
    return menuConfig.moveOnTab() ? $_ev1k2410cjdud7f58.move(moveDown$1)(component, simulatedEvent, menuConfig) : Option.none();
  };
  var getRules$4 = $_9njj9iwjjdud7eix.constant([
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.UP()), $_ev1k2410cjdud7f58.move(moveUp$1)),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.DOWN()), $_ev1k2410cjdud7f58.move(moveDown$1)),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.and([
      $_7ccsxg100jdud7f3k.isShift,
      $_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.TAB())
    ]), fireShiftTab),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.and([
      $_7ccsxg100jdud7f3k.isNotShift,
      $_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.TAB())
    ]), fireTab),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.ENTER()), execute$4),
    $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.SPACE()), execute$4)
  ]);
  var getEvents$4 = $_9njj9iwjjdud7eix.constant({});
  var getApis$4 = $_9njj9iwjjdud7eix.constant({});
  var MenuType = $_3ktlz9zqjdud7f2g.typical(schema$5, $_71cmtkyjjdud7exe.init, getRules$4, getEvents$4, getApis$4, Option.some(focusIn$3));

  var schema$6 = [
    $_etkinez6jdud7ezi.onKeyboardHandler('onSpace'),
    $_etkinez6jdud7ezi.onKeyboardHandler('onEnter'),
    $_etkinez6jdud7ezi.onKeyboardHandler('onShiftEnter'),
    $_etkinez6jdud7ezi.onKeyboardHandler('onLeft'),
    $_etkinez6jdud7ezi.onKeyboardHandler('onRight'),
    $_etkinez6jdud7ezi.onKeyboardHandler('onTab'),
    $_etkinez6jdud7ezi.onKeyboardHandler('onShiftTab'),
    $_etkinez6jdud7ezi.onKeyboardHandler('onUp'),
    $_etkinez6jdud7ezi.onKeyboardHandler('onDown'),
    $_etkinez6jdud7ezi.onKeyboardHandler('onEscape'),
    $_euqmtby7jdud7ev7.option('focusIn')
  ];
  var getRules$5 = function (component, simulatedEvent, executeInfo) {
    return [
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.SPACE()), executeInfo.onSpace()),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.and([
        $_7ccsxg100jdud7f3k.isNotShift,
        $_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.ENTER())
      ]), executeInfo.onEnter()),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.and([
        $_7ccsxg100jdud7f3k.isShift,
        $_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.ENTER())
      ]), executeInfo.onShiftEnter()),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.and([
        $_7ccsxg100jdud7f3k.isShift,
        $_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.TAB())
      ]), executeInfo.onShiftTab()),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.and([
        $_7ccsxg100jdud7f3k.isNotShift,
        $_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.TAB())
      ]), executeInfo.onTab()),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.UP()), executeInfo.onUp()),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.DOWN()), executeInfo.onDown()),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.LEFT()), executeInfo.onLeft()),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.RIGHT()), executeInfo.onRight()),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.SPACE()), executeInfo.onSpace()),
      $_33m1mtzzjdud7f3i.rule($_7ccsxg100jdud7f3k.inSet($_8y8vdkzpjdud7f2d.ESCAPE()), executeInfo.onEscape())
    ];
  };
  var focusIn$4 = function (component, executeInfo) {
    return executeInfo.focusIn().bind(function (f) {
      return f(component, executeInfo);
    });
  };
  var getEvents$5 = $_9njj9iwjjdud7eix.constant({});
  var getApis$5 = $_9njj9iwjjdud7eix.constant({});
  var SpecialType = $_3ktlz9zqjdud7f2g.typical(schema$6, $_71cmtkyjjdud7exe.init, getRules$5, getEvents$5, getApis$5, Option.some(focusIn$4));

  var $_bkuaf5zmjdud7f1q = {
    acyclic: AcyclicType.schema(),
    cyclic: CyclicType.schema(),
    flow: FlowType.schema(),
    flatgrid: FlatgridType.schema(),
    matrix: MatrixType.schema(),
    execution: ExecutionType.schema(),
    menu: MenuType.schema(),
    special: SpecialType.schema()
  };

  var Keying = $_ax1gfoy2jdud7eu7.createModes({
    branchKey: 'mode',
    branches: $_bkuaf5zmjdud7f1q,
    name: 'keying',
    active: {
      events: function (keyingConfig, keyingState) {
        var handler = keyingConfig.handler();
        return handler.toEvents(keyingConfig, keyingState);
      }
    },
    apis: {
      focusIn: function (component) {
        component.getSystem().triggerFocus(component.element(), component.element());
      },
      setGridSize: function (component, keyConfig, keyState, numRows, numColumns) {
        if (!$_ettibkxsjdud7emz.hasKey(keyState, 'setGridSize')) {
          console.error('Layout does not support setGridSize');
        } else {
          keyState.setGridSize(numRows, numColumns);
        }
      }
    },
    state: $_a1e0cn10bjdud7f52
  });

  var field$1 = function (name, forbidden) {
    return $_euqmtby7jdud7ev7.defaultedObjOf(name, {}, $_1g2cevwsjdud7ejp.map(forbidden, function (f) {
      return $_euqmtby7jdud7ev7.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name);
    }).concat([$_euqmtby7jdud7ev7.state('dump', $_9njj9iwjjdud7eix.identity)]));
  };
  var get$5 = function (data) {
    return data.dump();
  };
  var $_c7jpu210ojdud7f7a = {
    field: field$1,
    get: get$5
  };

  var unique = 0;
  var generate$1 = function (prefix) {
    var date = new Date();
    var time = date.getTime();
    var random = Math.floor(Math.random() * 1000000000);
    unique++;
    return prefix + '_' + random + unique + String(time);
  };
  var $_3k9wwu10rjdud7f7t = { generate: generate$1 };

  var premadeTag = $_3k9wwu10rjdud7f7t.generate('alloy-premade');
  var apiConfig = $_3k9wwu10rjdud7f7t.generate('api');
  var premade = function (comp) {
    return $_ettibkxsjdud7emz.wrap(premadeTag, comp);
  };
  var getPremade = function (spec) {
    return $_ettibkxsjdud7emz.readOptFrom(spec, premadeTag);
  };
  var makeApi = function (f) {
    return $_4nn5bbygjdud7eww.markAsSketchApi(function (component) {
      var args = Array.prototype.slice.call(arguments, 0);
      var spi = component.config(apiConfig);
      return f.apply(undefined, [spi].concat(args));
    }, f);
  };
  var $_37ypl510qjdud7f7n = {
    apiConfig: $_9njj9iwjjdud7eix.constant(apiConfig),
    makeApi: makeApi,
    premade: premade,
    getPremade: getPremade
  };

  var adt$2 = $_2ytffsxwjdud7ets.generate([
    { required: ['data'] },
    { external: ['data'] },
    { optional: ['data'] },
    { group: ['data'] }
  ]);
  var fFactory = $_euqmtby7jdud7ev7.defaulted('factory', { sketch: $_9njj9iwjjdud7eix.identity });
  var fSchema = $_euqmtby7jdud7ev7.defaulted('schema', []);
  var fName = $_euqmtby7jdud7ev7.strict('name');
  var fPname = $_euqmtby7jdud7ev7.field('pname', 'pname', $_6rbn18y8jdud7evc.defaultedThunk(function (typeSpec) {
    return '<alloy.' + $_3k9wwu10rjdud7f7t.generate(typeSpec.name) + '>';
  }), $_13hkebyejdud7ewm.anyValue());
  var fDefaults = $_euqmtby7jdud7ev7.defaulted('defaults', $_9njj9iwjjdud7eix.constant({}));
  var fOverrides = $_euqmtby7jdud7ev7.defaulted('overrides', $_9njj9iwjjdud7eix.constant({}));
  var requiredSpec = $_13hkebyejdud7ewm.objOf([
    fFactory,
    fSchema,
    fName,
    fPname,
    fDefaults,
    fOverrides
  ]);
  var externalSpec = $_13hkebyejdud7ewm.objOf([
    fFactory,
    fSchema,
    fName,
    fDefaults,
    fOverrides
  ]);
  var optionalSpec = $_13hkebyejdud7ewm.objOf([
    fFactory,
    fSchema,
    fName,
    fPname,
    fDefaults,
    fOverrides
  ]);
  var groupSpec = $_13hkebyejdud7ewm.objOf([
    fFactory,
    fSchema,
    fName,
    $_euqmtby7jdud7ev7.strict('unit'),
    fPname,
    fDefaults,
    fOverrides
  ]);
  var asNamedPart = function (part) {
    return part.fold(Option.some, Option.none, Option.some, Option.some);
  };
  var name$1 = function (part) {
    var get = function (data) {
      return data.name();
    };
    return part.fold(get, get, get, get);
  };
  var asCommon = function (part) {
    return part.fold($_9njj9iwjjdud7eix.identity, $_9njj9iwjjdud7eix.identity, $_9njj9iwjjdud7eix.identity, $_9njj9iwjjdud7eix.identity);
  };
  var convert = function (adtConstructor, partSpec) {
    return function (spec) {
      var data = $_13hkebyejdud7ewm.asStructOrDie('Converting part type', partSpec, spec);
      return adtConstructor(data);
    };
  };
  var $_7938qf10vjdud7f8n = {
    required: convert(adt$2.required, requiredSpec),
    external: convert(adt$2.external, externalSpec),
    optional: convert(adt$2.optional, optionalSpec),
    group: convert(adt$2.group, groupSpec),
    asNamedPart: asNamedPart,
    name: name$1,
    asCommon: asCommon,
    original: $_9njj9iwjjdud7eix.constant('entirety')
  };

  var placeholder = 'placeholder';
  var adt$3 = $_2ytffsxwjdud7ets.generate([
    {
      single: [
        'required',
        'valueThunk'
      ]
    },
    {
      multiple: [
        'required',
        'valueThunks'
      ]
    }
  ]);
  var isSubstitute = function (uiType) {
    return $_1g2cevwsjdud7ejp.contains([placeholder], uiType);
  };
  var subPlaceholder = function (owner, detail, compSpec, placeholders) {
    if (owner.exists(function (o) {
        return o !== compSpec.owner;
      }))
      return adt$3.single(true, $_9njj9iwjjdud7eix.constant(compSpec));
    return $_ettibkxsjdud7emz.readOptFrom(placeholders, compSpec.name).fold(function () {
      throw new Error('Unknown placeholder component: ' + compSpec.name + '\nKnown: [' + $_2dykn0x0jdud7ekc.keys(placeholders) + ']\nNamespace: ' + owner.getOr('none') + '\nSpec: ' + $_crnojnydjdud7ewk.stringify(compSpec, null, 2));
    }, function (newSpec) {
      return newSpec.replace();
    });
  };
  var scan = function (owner, detail, compSpec, placeholders) {
    if (compSpec.uiType === placeholder)
      return subPlaceholder(owner, detail, compSpec, placeholders);
    else
      return adt$3.single(false, $_9njj9iwjjdud7eix.constant(compSpec));
  };
  var substitute = function (owner, detail, compSpec, placeholders) {
    var base = scan(owner, detail, compSpec, placeholders);
    return base.fold(function (req, valueThunk) {
      var value = valueThunk(detail, compSpec.config, compSpec.validated);
      var childSpecs = $_ettibkxsjdud7emz.readOptFrom(value, 'components').getOr([]);
      var substituted = $_1g2cevwsjdud7ejp.bind(childSpecs, function (c) {
        return substitute(owner, detail, c, placeholders);
      });
      return [$_73qnwowyjdud7ek9.deepMerge(value, { components: substituted })];
    }, function (req, valuesThunk) {
      var values = valuesThunk(detail, compSpec.config, compSpec.validated);
      return values;
    });
  };
  var substituteAll = function (owner, detail, components, placeholders) {
    return $_1g2cevwsjdud7ejp.bind(components, function (c) {
      return substitute(owner, detail, c, placeholders);
    });
  };
  var oneReplace = function (label, replacements) {
    var called = false;
    var used = function () {
      return called;
    };
    var replace = function () {
      if (called === true)
        throw new Error('Trying to use the same placeholder more than once: ' + label);
      called = true;
      return replacements;
    };
    var required = function () {
      return replacements.fold(function (req, _) {
        return req;
      }, function (req, _) {
        return req;
      });
    };
    return {
      name: $_9njj9iwjjdud7eix.constant(label),
      required: required,
      used: used,
      replace: replace
    };
  };
  var substitutePlaces = function (owner, detail, components, placeholders) {
    var ps = $_2dykn0x0jdud7ekc.map(placeholders, function (ph, name) {
      return oneReplace(name, ph);
    });
    var outcome = substituteAll(owner, detail, components, ps);
    $_2dykn0x0jdud7ekc.each(ps, function (p) {
      if (p.used() === false && p.required()) {
        throw new Error('Placeholder: ' + p.name() + ' was not found in components list\nNamespace: ' + owner.getOr('none') + '\nComponents: ' + $_crnojnydjdud7ewk.stringify(detail.components(), null, 2));
      }
    });
    return outcome;
  };
  var singleReplace = function (detail, p) {
    var replacement = p;
    return replacement.fold(function (req, valueThunk) {
      return [valueThunk(detail)];
    }, function (req, valuesThunk) {
      return valuesThunk(detail);
    });
  };
  var $_1ipz1n10wjdud7f8y = {
    single: adt$3.single,
    multiple: adt$3.multiple,
    isSubstitute: isSubstitute,
    placeholder: $_9njj9iwjjdud7eix.constant(placeholder),
    substituteAll: substituteAll,
    substitutePlaces: substitutePlaces,
    singleReplace: singleReplace
  };

  var combine = function (detail, data, partSpec, partValidated) {
    var spec = partSpec;
    return $_73qnwowyjdud7ek9.deepMerge(data.defaults()(detail, partSpec, partValidated), partSpec, { uid: detail.partUids()[data.name()] }, data.overrides()(detail, partSpec, partValidated), { 'debug.sketcher': $_ettibkxsjdud7emz.wrap('part-' + data.name(), spec) });
  };
  var subs = function (owner, detail, parts) {
    var internals = {};
    var externals = {};
    $_1g2cevwsjdud7ejp.each(parts, function (part) {
      part.fold(function (data) {
        internals[data.pname()] = $_1ipz1n10wjdud7f8y.single(true, function (detail, partSpec, partValidated) {
          return data.factory().sketch(combine(detail, data, partSpec, partValidated));
        });
      }, function (data) {
        var partSpec = detail.parts()[data.name()]();
        externals[data.name()] = $_9njj9iwjjdud7eix.constant(combine(detail, data, partSpec[$_7938qf10vjdud7f8n.original()]()));
      }, function (data) {
        internals[data.pname()] = $_1ipz1n10wjdud7f8y.single(false, function (detail, partSpec, partValidated) {
          return data.factory().sketch(combine(detail, data, partSpec, partValidated));
        });
      }, function (data) {
        internals[data.pname()] = $_1ipz1n10wjdud7f8y.multiple(true, function (detail, _partSpec, _partValidated) {
          var units = detail[data.name()]();
          return $_1g2cevwsjdud7ejp.map(units, function (u) {
            return data.factory().sketch($_73qnwowyjdud7ek9.deepMerge(data.defaults()(detail, u), u, data.overrides()(detail, u)));
          });
        });
      });
    });
    return {
      internals: $_9njj9iwjjdud7eix.constant(internals),
      externals: $_9njj9iwjjdud7eix.constant(externals)
    };
  };
  var $_pp6pv10ujdud7f8h = { subs: subs };

  var generate$2 = function (owner, parts) {
    var r = {};
    $_1g2cevwsjdud7ejp.each(parts, function (part) {
      $_7938qf10vjdud7f8n.asNamedPart(part).each(function (np) {
        var g = doGenerateOne(owner, np.pname());
        r[np.name()] = function (config) {
          var validated = $_13hkebyejdud7ewm.asRawOrDie('Part: ' + np.name() + ' in ' + owner, $_13hkebyejdud7ewm.objOf(np.schema()), config);
          return $_73qnwowyjdud7ek9.deepMerge(g, {
            config: config,
            validated: validated
          });
        };
      });
    });
    return r;
  };
  var doGenerateOne = function (owner, pname) {
    return {
      uiType: $_1ipz1n10wjdud7f8y.placeholder(),
      owner: owner,
      name: pname
    };
  };
  var generateOne = function (owner, pname, config) {
    return {
      uiType: $_1ipz1n10wjdud7f8y.placeholder(),
      owner: owner,
      name: pname,
      config: config,
      validated: {}
    };
  };
  var schemas = function (parts) {
    return $_1g2cevwsjdud7ejp.bind(parts, function (part) {
      return part.fold(Option.none, Option.some, Option.none, Option.none).map(function (data) {
        return $_euqmtby7jdud7ev7.strictObjOf(data.name(), data.schema().concat([$_etkinez6jdud7ezi.snapshot($_7938qf10vjdud7f8n.original())]));
      }).toArray();
    });
  };
  var names = function (parts) {
    return $_1g2cevwsjdud7ejp.map(parts, $_7938qf10vjdud7f8n.name);
  };
  var substitutes = function (owner, detail, parts) {
    return $_pp6pv10ujdud7f8h.subs(owner, detail, parts);
  };
  var components = function (owner, detail, internals) {
    return $_1ipz1n10wjdud7f8y.substitutePlaces(Option.some(owner), detail, detail.components(), internals);
  };
  var getPart = function (component, detail, partKey) {
    var uid = detail.partUids()[partKey];
    return component.getSystem().getByUid(uid).toOption();
  };
  var getPartOrDie = function (component, detail, partKey) {
    return getPart(component, detail, partKey).getOrDie('Could not find part: ' + partKey);
  };
  var getParts = function (component, detail, partKeys) {
    var r = {};
    var uids = detail.partUids();
    var system = component.getSystem();
    $_1g2cevwsjdud7ejp.each(partKeys, function (pk) {
      r[pk] = system.getByUid(uids[pk]);
    });
    return $_2dykn0x0jdud7ekc.map(r, $_9njj9iwjjdud7eix.constant);
  };
  var getAllParts = function (component, detail) {
    var system = component.getSystem();
    return $_2dykn0x0jdud7ekc.map(detail.partUids(), function (pUid, k) {
      return $_9njj9iwjjdud7eix.constant(system.getByUid(pUid));
    });
  };
  var getPartsOrDie = function (component, detail, partKeys) {
    var r = {};
    var uids = detail.partUids();
    var system = component.getSystem();
    $_1g2cevwsjdud7ejp.each(partKeys, function (pk) {
      r[pk] = system.getByUid(uids[pk]).getOrDie();
    });
    return $_2dykn0x0jdud7ekc.map(r, $_9njj9iwjjdud7eix.constant);
  };
  var defaultUids = function (baseUid, partTypes) {
    var partNames = names(partTypes);
    return $_ettibkxsjdud7emz.wrapAll($_1g2cevwsjdud7ejp.map(partNames, function (pn) {
      return {
        key: pn,
        value: baseUid + '-' + pn
      };
    }));
  };
  var defaultUidsSchema = function (partTypes) {
    return $_euqmtby7jdud7ev7.field('partUids', 'partUids', $_6rbn18y8jdud7evc.mergeWithThunk(function (spec) {
      return defaultUids(spec.uid, partTypes);
    }), $_13hkebyejdud7ewm.anyValue());
  };
  var $_436kgb10tjdud7f7y = {
    generate: generate$2,
    generateOne: generateOne,
    schemas: schemas,
    names: names,
    substitutes: substitutes,
    components: components,
    defaultUids: defaultUids,
    defaultUidsSchema: defaultUidsSchema,
    getAllParts: getAllParts,
    getPart: getPart,
    getPartOrDie: getPartOrDie,
    getParts: getParts,
    getPartsOrDie: getPartsOrDie
  };

  var prefix$1 = 'alloy-id-';
  var idAttr = 'data-alloy-id';
  var $_d587rf10yjdud7f9j = {
    prefix: $_9njj9iwjjdud7eix.constant(prefix$1),
    idAttr: $_9njj9iwjjdud7eix.constant(idAttr)
  };

  var prefix$2 = $_d587rf10yjdud7f9j.prefix();
  var idAttr$1 = $_d587rf10yjdud7f9j.idAttr();
  var write = function (label, elem) {
    var id = $_3k9wwu10rjdud7f7t.generate(prefix$2 + label);
    $_2vghk1xrjdud7ems.set(elem, idAttr$1, id);
    return id;
  };
  var writeOnly = function (elem, uid) {
    $_2vghk1xrjdud7ems.set(elem, idAttr$1, uid);
  };
  var read$2 = function (elem) {
    var id = $_50qkdpxkjdud7em6.isElement(elem) ? $_2vghk1xrjdud7ems.get(elem, idAttr$1) : null;
    return Option.from(id);
  };
  var find$3 = function (container, id) {
    return $_a3quyizxjdud7f3e.descendant(container, id);
  };
  var generate$3 = function (prefix) {
    return $_3k9wwu10rjdud7f7t.generate(prefix);
  };
  var revoke = function (elem) {
    $_2vghk1xrjdud7ems.remove(elem, idAttr$1);
  };
  var $_4mrseh10xjdud7f9b = {
    revoke: revoke,
    write: write,
    writeOnly: writeOnly,
    read: read$2,
    find: find$3,
    generate: generate$3,
    attribute: $_9njj9iwjjdud7eix.constant(idAttr$1)
  };

  var getPartsSchema = function (partNames, _optPartNames, _owner) {
    var owner = _owner !== undefined ? _owner : 'Unknown owner';
    var fallbackThunk = function () {
      return [$_etkinez6jdud7ezi.output('partUids', {})];
    };
    var optPartNames = _optPartNames !== undefined ? _optPartNames : fallbackThunk();
    if (partNames.length === 0 && optPartNames.length === 0)
      return fallbackThunk();
    var partsSchema = $_euqmtby7jdud7ev7.strictObjOf('parts', $_1g2cevwsjdud7ejp.flatten([
      $_1g2cevwsjdud7ejp.map(partNames, $_euqmtby7jdud7ev7.strict),
      $_1g2cevwsjdud7ejp.map(optPartNames, function (optPart) {
        return $_euqmtby7jdud7ev7.defaulted(optPart, $_1ipz1n10wjdud7f8y.single(false, function () {
          throw new Error('The optional part: ' + optPart + ' was not specified in the config, but it was used in components');
        }));
      })
    ]));
    var partUidsSchema = $_euqmtby7jdud7ev7.state('partUids', function (spec) {
      if (!$_ettibkxsjdud7emz.hasKey(spec, 'parts')) {
        throw new Error('Part uid definition for owner: ' + owner + ' requires "parts"\nExpected parts: ' + partNames.join(', ') + '\nSpec: ' + $_crnojnydjdud7ewk.stringify(spec, null, 2));
      }
      var uids = $_2dykn0x0jdud7ekc.map(spec.parts, function (v, k) {
        return $_ettibkxsjdud7emz.readOptFrom(v, 'uid').getOrThunk(function () {
          return spec.uid + '-' + k;
        });
      });
      return uids;
    });
    return [
      partsSchema,
      partUidsSchema
    ];
  };
  var base$1 = function (label, partSchemas, partUidsSchemas, spec) {
    var ps = partSchemas.length > 0 ? [$_euqmtby7jdud7ev7.strictObjOf('parts', partSchemas)] : [];
    return ps.concat([
      $_euqmtby7jdud7ev7.strict('uid'),
      $_euqmtby7jdud7ev7.defaulted('dom', {}),
      $_euqmtby7jdud7ev7.defaulted('components', []),
      $_etkinez6jdud7ezi.snapshot('originalSpec'),
      $_euqmtby7jdud7ev7.defaulted('debug.sketcher', {})
    ]).concat(partUidsSchemas);
  };
  var asRawOrDie$1 = function (label, schema, spec, partSchemas, partUidsSchemas) {
    var baseS = base$1(label, partSchemas, spec, partUidsSchemas);
    return $_13hkebyejdud7ewm.asRawOrDie(label + ' [SpecSchema]', $_13hkebyejdud7ewm.objOfOnly(baseS.concat(schema)), spec);
  };
  var asStructOrDie$1 = function (label, schema, spec, partSchemas, partUidsSchemas) {
    var baseS = base$1(label, partSchemas, partUidsSchemas, spec);
    return $_13hkebyejdud7ewm.asStructOrDie(label + ' [SpecSchema]', $_13hkebyejdud7ewm.objOfOnly(baseS.concat(schema)), spec);
  };
  var extend = function (builder, original, nu) {
    var newSpec = $_73qnwowyjdud7ek9.deepMerge(original, nu);
    return builder(newSpec);
  };
  var addBehaviours = function (original, behaviours) {
    return $_73qnwowyjdud7ek9.deepMerge(original, behaviours);
  };
  var $_5cn1o510zjdud7f9m = {
    asRawOrDie: asRawOrDie$1,
    asStructOrDie: asStructOrDie$1,
    addBehaviours: addBehaviours,
    getPartsSchema: getPartsSchema,
    extend: extend
  };

  var single = function (owner, schema, factory, spec) {
    var specWithUid = supplyUid(spec);
    var detail = $_5cn1o510zjdud7f9m.asStructOrDie(owner, schema, specWithUid, [], []);
    return $_73qnwowyjdud7ek9.deepMerge(factory(detail, specWithUid), { 'debug.sketcher': $_ettibkxsjdud7emz.wrap(owner, spec) });
  };
  var composite = function (owner, schema, partTypes, factory, spec) {
    var specWithUid = supplyUid(spec);
    var partSchemas = $_436kgb10tjdud7f7y.schemas(partTypes);
    var partUidsSchema = $_436kgb10tjdud7f7y.defaultUidsSchema(partTypes);
    var detail = $_5cn1o510zjdud7f9m.asStructOrDie(owner, schema, specWithUid, partSchemas, [partUidsSchema]);
    var subs = $_436kgb10tjdud7f7y.substitutes(owner, detail, partTypes);
    var components = $_436kgb10tjdud7f7y.components(owner, detail, subs.internals());
    return $_73qnwowyjdud7ek9.deepMerge(factory(detail, components, specWithUid, subs.externals()), { 'debug.sketcher': $_ettibkxsjdud7emz.wrap(owner, spec) });
  };
  var supplyUid = function (spec) {
    return $_73qnwowyjdud7ek9.deepMerge({ uid: $_4mrseh10xjdud7f9b.generate('uid') }, spec);
  };
  var $_dsxxyk10sjdud7f7u = {
    supplyUid: supplyUid,
    single: single,
    composite: composite
  };

  var singleSchema = $_13hkebyejdud7ewm.objOfOnly([
    $_euqmtby7jdud7ev7.strict('name'),
    $_euqmtby7jdud7ev7.strict('factory'),
    $_euqmtby7jdud7ev7.strict('configFields'),
    $_euqmtby7jdud7ev7.defaulted('apis', {}),
    $_euqmtby7jdud7ev7.defaulted('extraApis', {})
  ]);
  var compositeSchema = $_13hkebyejdud7ewm.objOfOnly([
    $_euqmtby7jdud7ev7.strict('name'),
    $_euqmtby7jdud7ev7.strict('factory'),
    $_euqmtby7jdud7ev7.strict('configFields'),
    $_euqmtby7jdud7ev7.strict('partFields'),
    $_euqmtby7jdud7ev7.defaulted('apis', {}),
    $_euqmtby7jdud7ev7.defaulted('extraApis', {})
  ]);
  var single$1 = function (rawConfig) {
    var config = $_13hkebyejdud7ewm.asRawOrDie('Sketcher for ' + rawConfig.name, singleSchema, rawConfig);
    var sketch = function (spec) {
      return $_dsxxyk10sjdud7f7u.single(config.name, config.configFields, config.factory, spec);
    };
    var apis = $_2dykn0x0jdud7ekc.map(config.apis, $_37ypl510qjdud7f7n.makeApi);
    var extraApis = $_2dykn0x0jdud7ekc.map(config.extraApis, function (f, k) {
      return $_4nn5bbygjdud7eww.markAsExtraApi(f, k);
    });
    return $_73qnwowyjdud7ek9.deepMerge({
      name: $_9njj9iwjjdud7eix.constant(config.name),
      partFields: $_9njj9iwjjdud7eix.constant([]),
      configFields: $_9njj9iwjjdud7eix.constant(config.configFields),
      sketch: sketch
    }, apis, extraApis);
  };
  var composite$1 = function (rawConfig) {
    var config = $_13hkebyejdud7ewm.asRawOrDie('Sketcher for ' + rawConfig.name, compositeSchema, rawConfig);
    var sketch = function (spec) {
      return $_dsxxyk10sjdud7f7u.composite(config.name, config.configFields, config.partFields, config.factory, spec);
    };
    var parts = $_436kgb10tjdud7f7y.generate(config.name, config.partFields);
    var apis = $_2dykn0x0jdud7ekc.map(config.apis, $_37ypl510qjdud7f7n.makeApi);
    var extraApis = $_2dykn0x0jdud7ekc.map(config.extraApis, function (f, k) {
      return $_4nn5bbygjdud7eww.markAsExtraApi(f, k);
    });
    return $_73qnwowyjdud7ek9.deepMerge({
      name: $_9njj9iwjjdud7eix.constant(config.name),
      partFields: $_9njj9iwjjdud7eix.constant(config.partFields),
      configFields: $_9njj9iwjjdud7eix.constant(config.configFields),
      sketch: sketch,
      parts: $_9njj9iwjjdud7eix.constant(parts)
    }, apis, extraApis);
  };
  var $_3inyq310pjdud7f7f = {
    single: single$1,
    composite: composite$1
  };

  var events$3 = function (optAction) {
    var executeHandler = function (action) {
      return $_5xcuyiy4jdud7eur.run($_801kkqwhjdud7eiq.execute(), function (component, simulatedEvent) {
        action(component);
        simulatedEvent.stop();
      });
    };
    var onClick = function (component, simulatedEvent) {
      simulatedEvent.stop();
      $_98da6jwgjdud7eil.emitExecute(component);
    };
    var onMousedown = function (component, simulatedEvent) {
      simulatedEvent.cut();
    };
    var pointerEvents = $_chh2cvwkjdud7ej0.detect().deviceType.isTouch() ? [$_5xcuyiy4jdud7eur.run($_801kkqwhjdud7eiq.tap(), onClick)] : [
      $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.click(), onClick),
      $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.mousedown(), onMousedown)
    ];
    return $_5xcuyiy4jdud7eur.derive($_1g2cevwsjdud7ejp.flatten([
      optAction.map(executeHandler).toArray(),
      pointerEvents
    ]));
  };
  var $_aznso2110jdud7f9y = { events: events$3 };

  var factory = function (detail, spec) {
    var events = $_aznso2110jdud7f9y.events(detail.action());
    var optType = $_ettibkxsjdud7emz.readOptFrom(detail.dom(), 'attributes').bind($_ettibkxsjdud7emz.readOpt('type'));
    var optTag = $_ettibkxsjdud7emz.readOptFrom(detail.dom(), 'tag');
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: detail.components(),
      events: events,
      behaviours: $_73qnwowyjdud7ek9.deepMerge($_ax1gfoy2jdud7eu7.derive([
        Focusing.config({}),
        Keying.config({
          mode: 'execution',
          useSpace: true,
          useEnter: true
        })
      ]), $_c7jpu210ojdud7f7a.get(detail.buttonBehaviours())),
      domModification: {
        attributes: $_73qnwowyjdud7ek9.deepMerge(optType.fold(function () {
          return optTag.is('button') ? { type: 'button' } : {};
        }, function (t) {
          return {};
        }), { role: detail.role().getOr('button') })
      },
      eventOrder: detail.eventOrder()
    };
  };
  var Button = $_3inyq310pjdud7f7f.single({
    name: 'Button',
    factory: factory,
    configFields: [
      $_euqmtby7jdud7ev7.defaulted('uid', undefined),
      $_euqmtby7jdud7ev7.strict('dom'),
      $_euqmtby7jdud7ev7.defaulted('components', []),
      $_c7jpu210ojdud7f7a.field('buttonBehaviours', [
        Focusing,
        Keying
      ]),
      $_euqmtby7jdud7ev7.option('action'),
      $_euqmtby7jdud7ev7.option('role'),
      $_euqmtby7jdud7ev7.defaulted('eventOrder', {})
    ]
  });

  var exhibit$2 = function (base, unselectConfig) {
    return $_biiw3tyhjdud7ewz.nu({
      styles: {
        '-webkit-user-select': 'none',
        'user-select': 'none',
        '-ms-user-select': 'none',
        '-moz-user-select': '-moz-none'
      },
      attributes: { 'unselectable': 'on' }
    });
  };
  var events$4 = function (unselectConfig) {
    return $_5xcuyiy4jdud7eur.derive([$_5xcuyiy4jdud7eur.abort($_brmbwvwijdud7eiu.selectstart(), $_9njj9iwjjdud7eix.constant(true))]);
  };
  var $_f4i72r112jdud7fa8 = {
    events: events$4,
    exhibit: exhibit$2
  };

  var Unselecting = $_ax1gfoy2jdud7eu7.create({
    fields: [],
    name: 'unselecting',
    active: $_f4i72r112jdud7fa8
  });

  var getAttrs = function (elem) {
    var attributes = elem.dom().attributes !== undefined ? elem.dom().attributes : [];
    return $_1g2cevwsjdud7ejp.foldl(attributes, function (b, attr) {
      if (attr.name === 'class')
        return b;
      else
        return $_73qnwowyjdud7ek9.deepMerge(b, $_ettibkxsjdud7emz.wrap(attr.name, attr.value));
    }, {});
  };
  var getClasses = function (elem) {
    return Array.prototype.slice.call(elem.dom().classList, 0);
  };
  var fromHtml$2 = function (html) {
    var elem = $_eobgtqxfjdud7elu.fromHtml(html);
    var children = $_dekwe2x3jdud7ekr.children(elem);
    var attrs = getAttrs(elem);
    var classes = getClasses(elem);
    var contents = children.length === 0 ? {} : { innerHtml: $_1kv7pfxojdud7emm.get(elem) };
    return $_73qnwowyjdud7ek9.deepMerge({
      tag: $_50qkdpxkjdud7em6.name(elem),
      classes: classes,
      attributes: attrs
    }, contents);
  };
  var sketch = function (sketcher, html, config) {
    return sketcher.sketch($_73qnwowyjdud7ek9.deepMerge({ dom: fromHtml$2(html) }, config));
  };
  var $_75qh6t114jdud7fae = {
    fromHtml: fromHtml$2,
    sketch: sketch
  };

  var dom$1 = function (rawHtml) {
    var html = $_2e2eauwvjdud7ek5.supplant(rawHtml, { prefix: $_5qzh4bzejdud7f0y.prefix() });
    return $_75qh6t114jdud7fae.fromHtml(html);
  };
  var spec = function (rawHtml) {
    var sDom = dom$1(rawHtml);
    return { dom: sDom };
  };
  var $_5oi2c7113jdud7fab = {
    dom: dom$1,
    spec: spec
  };

  var forToolbarCommand = function (editor, command) {
    return forToolbar(command, function () {
      editor.execCommand(command);
    }, {});
  };
  var getToggleBehaviours = function (command) {
    return $_ax1gfoy2jdud7eu7.derive([
      Toggling.config({
        toggleClass: $_5qzh4bzejdud7f0y.resolve('toolbar-button-selected'),
        toggleOnExecute: false,
        aria: { mode: 'pressed' }
      }),
      $_nw25bzdjdud7f0v.format(command, function (button, status) {
        var toggle = status ? Toggling.on : Toggling.off;
        toggle(button);
      })
    ]);
  };
  var forToolbarStateCommand = function (editor, command) {
    var extraBehaviours = getToggleBehaviours(command);
    return forToolbar(command, function () {
      editor.execCommand(command);
    }, extraBehaviours);
  };
  var forToolbarStateAction = function (editor, clazz, command, action) {
    var extraBehaviours = getToggleBehaviours(command);
    return forToolbar(clazz, action, extraBehaviours);
  };
  var forToolbar = function (clazz, action, extraBehaviours) {
    return Button.sketch({
      dom: $_5oi2c7113jdud7fab.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-' + clazz + ' ${prefix}-icon"></span>'),
      action: action,
      buttonBehaviours: $_73qnwowyjdud7ek9.deepMerge($_ax1gfoy2jdud7eu7.derive([Unselecting.config({})]), extraBehaviours)
    });
  };
  var $_d0l7buzfjdud7f11 = {
    forToolbar: forToolbar,
    forToolbarCommand: forToolbarCommand,
    forToolbarStateAction: forToolbarStateAction,
    forToolbarStateCommand: forToolbarStateCommand
  };

  var reduceBy = function (value, min, max, step) {
    if (value < min)
      return value;
    else if (value > max)
      return max;
    else if (value === min)
      return min - 1;
    else
      return Math.max(min, value - step);
  };
  var increaseBy = function (value, min, max, step) {
    if (value > max)
      return value;
    else if (value < min)
      return min;
    else if (value === max)
      return max + 1;
    else
      return Math.min(max, value + step);
  };
  var capValue = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  };
  var snapValueOfX = function (bounds, value, min, max, step, snapStart) {
    return snapStart.fold(function () {
      var initValue = value - min;
      var extraValue = Math.round(initValue / step) * step;
      return capValue(min + extraValue, min - 1, max + 1);
    }, function (start) {
      var remainder = (value - start) % step;
      var adjustment = Math.round(remainder / step);
      var rawSteps = Math.floor((value - start) / step);
      var maxSteps = Math.floor((max - start) / step);
      var numSteps = Math.min(maxSteps, rawSteps + adjustment);
      var r = start + numSteps * step;
      return Math.max(start, r);
    });
  };
  var findValueOfX = function (bounds, min, max, xValue, step, snapToGrid, snapStart) {
    var range = max - min;
    if (xValue < bounds.left)
      return min - 1;
    else if (xValue > bounds.right)
      return max + 1;
    else {
      var xOffset = Math.min(bounds.right, Math.max(xValue, bounds.left)) - bounds.left;
      var newValue = capValue(xOffset / bounds.width * range + min, min - 1, max + 1);
      var roundedValue = Math.round(newValue);
      return snapToGrid && newValue >= min && newValue <= max ? snapValueOfX(bounds, newValue, min, max, step, snapStart) : roundedValue;
    }
  };
  var $_3n27hj119jdud7fbg = {
    reduceBy: reduceBy,
    increaseBy: increaseBy,
    findValueOfX: findValueOfX
  };

  var changeEvent = 'slider.change.value';
  var isTouch = $_chh2cvwkjdud7ej0.detect().deviceType.isTouch();
  var getEventSource = function (simulatedEvent) {
    var evt = simulatedEvent.event().raw();
    if (isTouch && evt.touches !== undefined && evt.touches.length === 1)
      return Option.some(evt.touches[0]);
    else if (isTouch && evt.touches !== undefined)
      return Option.none();
    else if (!isTouch && evt.clientX !== undefined)
      return Option.some(evt);
    else
      return Option.none();
  };
  var getEventX = function (simulatedEvent) {
    var spot = getEventSource(simulatedEvent);
    return spot.map(function (s) {
      return s.clientX;
    });
  };
  var fireChange = function (component, value) {
    $_98da6jwgjdud7eil.emitWith(component, changeEvent, { value: value });
  };
  var moveRightFromLedge = function (ledge, detail) {
    fireChange(ledge, detail.min());
  };
  var moveLeftFromRedge = function (redge, detail) {
    fireChange(redge, detail.max());
  };
  var setToRedge = function (redge, detail) {
    fireChange(redge, detail.max() + 1);
  };
  var setToLedge = function (ledge, detail) {
    fireChange(ledge, detail.min() - 1);
  };
  var setToX = function (spectrum, spectrumBounds, detail, xValue) {
    var value = $_3n27hj119jdud7fbg.findValueOfX(spectrumBounds, detail.min(), detail.max(), xValue, detail.stepSize(), detail.snapToGrid(), detail.snapStart());
    fireChange(spectrum, value);
  };
  var setXFromEvent = function (spectrum, detail, spectrumBounds, simulatedEvent) {
    return getEventX(simulatedEvent).map(function (xValue) {
      setToX(spectrum, spectrumBounds, detail, xValue);
      return xValue;
    });
  };
  var moveLeft$4 = function (spectrum, detail) {
    var newValue = $_3n27hj119jdud7fbg.reduceBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
    fireChange(spectrum, newValue);
  };
  var moveRight$4 = function (spectrum, detail) {
    var newValue = $_3n27hj119jdud7fbg.increaseBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
    fireChange(spectrum, newValue);
  };
  var $_edvvhp118jdud7fba = {
    setXFromEvent: setXFromEvent,
    setToLedge: setToLedge,
    setToRedge: setToRedge,
    moveLeftFromRedge: moveLeftFromRedge,
    moveRightFromLedge: moveRightFromLedge,
    moveLeft: moveLeft$4,
    moveRight: moveRight$4,
    changeEvent: $_9njj9iwjjdud7eix.constant(changeEvent)
  };

  var platform = $_chh2cvwkjdud7ej0.detect();
  var isTouch$1 = platform.deviceType.isTouch();
  var edgePart = function (name, action) {
    return $_7938qf10vjdud7f8n.optional({
      name: '' + name + '-edge',
      overrides: function (detail) {
        var touchEvents = $_5xcuyiy4jdud7eur.derive([$_5xcuyiy4jdud7eur.runActionExtra($_brmbwvwijdud7eiu.touchstart(), action, [detail])]);
        var mouseEvents = $_5xcuyiy4jdud7eur.derive([
          $_5xcuyiy4jdud7eur.runActionExtra($_brmbwvwijdud7eiu.mousedown(), action, [detail]),
          $_5xcuyiy4jdud7eur.runActionExtra($_brmbwvwijdud7eiu.mousemove(), function (l, det) {
            if (det.mouseIsDown().get())
              action(l, det);
          }, [detail])
        ]);
        return { events: isTouch$1 ? touchEvents : mouseEvents };
      }
    });
  };
  var ledgePart = edgePart('left', $_edvvhp118jdud7fba.setToLedge);
  var redgePart = edgePart('right', $_edvvhp118jdud7fba.setToRedge);
  var thumbPart = $_7938qf10vjdud7f8n.required({
    name: 'thumb',
    defaults: $_9njj9iwjjdud7eix.constant({ dom: { styles: { position: 'absolute' } } }),
    overrides: function (detail) {
      return {
        events: $_5xcuyiy4jdud7eur.derive([
          $_5xcuyiy4jdud7eur.redirectToPart($_brmbwvwijdud7eiu.touchstart(), detail, 'spectrum'),
          $_5xcuyiy4jdud7eur.redirectToPart($_brmbwvwijdud7eiu.touchmove(), detail, 'spectrum'),
          $_5xcuyiy4jdud7eur.redirectToPart($_brmbwvwijdud7eiu.touchend(), detail, 'spectrum')
        ])
      };
    }
  });
  var spectrumPart = $_7938qf10vjdud7f8n.required({
    schema: [$_euqmtby7jdud7ev7.state('mouseIsDown', function () {
        return Cell(false);
      })],
    name: 'spectrum',
    overrides: function (detail) {
      var moveToX = function (spectrum, simulatedEvent) {
        var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
        $_edvvhp118jdud7fba.setXFromEvent(spectrum, detail, spectrumBounds, simulatedEvent);
      };
      var touchEvents = $_5xcuyiy4jdud7eur.derive([
        $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.touchstart(), moveToX),
        $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.touchmove(), moveToX)
      ]);
      var mouseEvents = $_5xcuyiy4jdud7eur.derive([
        $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.mousedown(), moveToX),
        $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.mousemove(), function (spectrum, se) {
          if (detail.mouseIsDown().get())
            moveToX(spectrum, se);
        })
      ]);
      return {
        behaviours: $_ax1gfoy2jdud7eu7.derive(isTouch$1 ? [] : [
          Keying.config({
            mode: 'special',
            onLeft: function (spectrum) {
              $_edvvhp118jdud7fba.moveLeft(spectrum, detail);
              return Option.some(true);
            },
            onRight: function (spectrum) {
              $_edvvhp118jdud7fba.moveRight(spectrum, detail);
              return Option.some(true);
            }
          }),
          Focusing.config({})
        ]),
        events: isTouch$1 ? touchEvents : mouseEvents
      };
    }
  });
  var SliderParts = [
    ledgePart,
    redgePart,
    thumbPart,
    spectrumPart
  ];

  var onLoad$1 = function (component, repConfig, repState) {
    repConfig.store().manager().onLoad(component, repConfig, repState);
  };
  var onUnload = function (component, repConfig, repState) {
    repConfig.store().manager().onUnload(component, repConfig, repState);
  };
  var setValue = function (component, repConfig, repState, data) {
    repConfig.store().manager().setValue(component, repConfig, repState, data);
  };
  var getValue = function (component, repConfig, repState) {
    return repConfig.store().manager().getValue(component, repConfig, repState);
  };
  var $_v97r211djdud7fbs = {
    onLoad: onLoad$1,
    onUnload: onUnload,
    setValue: setValue,
    getValue: getValue
  };

  var events$5 = function (repConfig, repState) {
    var es = repConfig.resetOnDom() ? [
      $_5xcuyiy4jdud7eur.runOnAttached(function (comp, se) {
        $_v97r211djdud7fbs.onLoad(comp, repConfig, repState);
      }),
      $_5xcuyiy4jdud7eur.runOnDetached(function (comp, se) {
        $_v97r211djdud7fbs.onUnload(comp, repConfig, repState);
      })
    ] : [$_1t33c1y3jdud7euf.loadEvent(repConfig, repState, $_v97r211djdud7fbs.onLoad)];
    return $_5xcuyiy4jdud7eur.derive(es);
  };
  var $_9y5frt11cjdud7fbq = { events: events$5 };

  var memory = function () {
    var data = Cell(null);
    var readState = function () {
      return {
        mode: 'memory',
        value: data.get()
      };
    };
    var isNotSet = function () {
      return data.get() === null;
    };
    var clear = function () {
      data.set(null);
    };
    return BehaviourState({
      set: data.set,
      get: data.get,
      isNotSet: isNotSet,
      clear: clear,
      readState: readState
    });
  };
  var manual = function () {
    var readState = function () {
    };
    return BehaviourState({ readState: readState });
  };
  var dataset = function () {
    var data = Cell({});
    var readState = function () {
      return {
        mode: 'dataset',
        dataset: data.get()
      };
    };
    return BehaviourState({
      readState: readState,
      set: data.set,
      get: data.get
    });
  };
  var init$2 = function (spec) {
    return spec.store().manager().state(spec);
  };
  var $_1f27yj11gjdud7fc1 = {
    memory: memory,
    dataset: dataset,
    manual: manual,
    init: init$2
  };

  var setValue$1 = function (component, repConfig, repState, data) {
    var dataKey = repConfig.store().getDataKey();
    repState.set({});
    repConfig.store().setData()(component, data);
    repConfig.onSetValue()(component, data);
  };
  var getValue$1 = function (component, repConfig, repState) {
    var key = repConfig.store().getDataKey()(component);
    var dataset = repState.get();
    return $_ettibkxsjdud7emz.readOptFrom(dataset, key).fold(function () {
      return repConfig.store().getFallbackEntry()(key);
    }, function (data) {
      return data;
    });
  };
  var onLoad$2 = function (component, repConfig, repState) {
    repConfig.store().initialValue().each(function (data) {
      setValue$1(component, repConfig, repState, data);
    });
  };
  var onUnload$1 = function (component, repConfig, repState) {
    repState.set({});
  };
  var DatasetStore = [
    $_euqmtby7jdud7ev7.option('initialValue'),
    $_euqmtby7jdud7ev7.strict('getFallbackEntry'),
    $_euqmtby7jdud7ev7.strict('getDataKey'),
    $_euqmtby7jdud7ev7.strict('setData'),
    $_etkinez6jdud7ezi.output('manager', {
      setValue: setValue$1,
      getValue: getValue$1,
      onLoad: onLoad$2,
      onUnload: onUnload$1,
      state: $_1f27yj11gjdud7fc1.dataset
    })
  ];

  var getValue$2 = function (component, repConfig, repState) {
    return repConfig.store().getValue()(component);
  };
  var setValue$2 = function (component, repConfig, repState, data) {
    repConfig.store().setValue()(component, data);
    repConfig.onSetValue()(component, data);
  };
  var onLoad$3 = function (component, repConfig, repState) {
    repConfig.store().initialValue().each(function (data) {
      repConfig.store().setValue()(component, data);
    });
  };
  var ManualStore = [
    $_euqmtby7jdud7ev7.strict('getValue'),
    $_euqmtby7jdud7ev7.defaulted('setValue', $_9njj9iwjjdud7eix.noop),
    $_euqmtby7jdud7ev7.option('initialValue'),
    $_etkinez6jdud7ezi.output('manager', {
      setValue: setValue$2,
      getValue: getValue$2,
      onLoad: onLoad$3,
      onUnload: $_9njj9iwjjdud7eix.noop,
      state: $_71cmtkyjjdud7exe.init
    })
  ];

  var setValue$3 = function (component, repConfig, repState, data) {
    repState.set(data);
    repConfig.onSetValue()(component, data);
  };
  var getValue$3 = function (component, repConfig, repState) {
    return repState.get();
  };
  var onLoad$4 = function (component, repConfig, repState) {
    repConfig.store().initialValue().each(function (initVal) {
      if (repState.isNotSet())
        repState.set(initVal);
    });
  };
  var onUnload$2 = function (component, repConfig, repState) {
    repState.clear();
  };
  var MemoryStore = [
    $_euqmtby7jdud7ev7.option('initialValue'),
    $_etkinez6jdud7ezi.output('manager', {
      setValue: setValue$3,
      getValue: getValue$3,
      onLoad: onLoad$4,
      onUnload: onUnload$2,
      state: $_1f27yj11gjdud7fc1.memory
    })
  ];

  var RepresentSchema = [
    $_euqmtby7jdud7ev7.defaultedOf('store', { mode: 'memory' }, $_13hkebyejdud7ewm.choose('mode', {
      memory: MemoryStore,
      manual: ManualStore,
      dataset: DatasetStore
    })),
    $_etkinez6jdud7ezi.onHandler('onSetValue'),
    $_euqmtby7jdud7ev7.defaulted('resetOnDom', false)
  ];

  var me = $_ax1gfoy2jdud7eu7.create({
    fields: RepresentSchema,
    name: 'representing',
    active: $_9y5frt11cjdud7fbq,
    apis: $_v97r211djdud7fbs,
    extra: {
      setValueFrom: function (component, source) {
        var value = me.getValue(source);
        me.setValue(component, value);
      }
    },
    state: $_1f27yj11gjdud7fc1
  });

  var isTouch$2 = $_chh2cvwkjdud7ej0.detect().deviceType.isTouch();
  var SliderSchema = [
    $_euqmtby7jdud7ev7.strict('min'),
    $_euqmtby7jdud7ev7.strict('max'),
    $_euqmtby7jdud7ev7.defaulted('stepSize', 1),
    $_euqmtby7jdud7ev7.defaulted('onChange', $_9njj9iwjjdud7eix.noop),
    $_euqmtby7jdud7ev7.defaulted('onInit', $_9njj9iwjjdud7eix.noop),
    $_euqmtby7jdud7ev7.defaulted('onDragStart', $_9njj9iwjjdud7eix.noop),
    $_euqmtby7jdud7ev7.defaulted('onDragEnd', $_9njj9iwjjdud7eix.noop),
    $_euqmtby7jdud7ev7.defaulted('snapToGrid', false),
    $_euqmtby7jdud7ev7.option('snapStart'),
    $_euqmtby7jdud7ev7.strict('getInitialValue'),
    $_c7jpu210ojdud7f7a.field('sliderBehaviours', [
      Keying,
      me
    ]),
    $_euqmtby7jdud7ev7.state('value', function (spec) {
      return Cell(spec.min);
    })
  ].concat(!isTouch$2 ? [$_euqmtby7jdud7ev7.state('mouseIsDown', function () {
      return Cell(false);
    })] : []);

  var api$1 = Dimension('width', function (element) {
    return element.dom().offsetWidth;
  });
  var set$4 = function (element, h) {
    api$1.set(element, h);
  };
  var get$6 = function (element) {
    return api$1.get(element);
  };
  var getOuter$2 = function (element) {
    return api$1.getOuter(element);
  };
  var setMax$1 = function (element, value) {
    var inclusions = [
      'margin-left',
      'border-left-width',
      'padding-left',
      'padding-right',
      'border-right-width',
      'margin-right'
    ];
    var absMax = api$1.max(element, value, inclusions);
    $_btgbcy103jdud7f3t.set(element, 'max-width', absMax + 'px');
  };
  var $_6chz3611kjdud7fcw = {
    set: set$4,
    get: get$6,
    getOuter: getOuter$2,
    setMax: setMax$1
  };

  var isTouch$3 = $_chh2cvwkjdud7ej0.detect().deviceType.isTouch();
  var sketch$1 = function (detail, components, spec, externals) {
    var range = detail.max() - detail.min();
    var getXCentre = function (component) {
      var rect = component.element().dom().getBoundingClientRect();
      return (rect.left + rect.right) / 2;
    };
    var getThumb = function (component) {
      return $_436kgb10tjdud7f7y.getPartOrDie(component, detail, 'thumb');
    };
    var getXOffset = function (slider, spectrumBounds, detail) {
      var v = detail.value().get();
      if (v < detail.min()) {
        return $_436kgb10tjdud7f7y.getPart(slider, detail, 'left-edge').fold(function () {
          return 0;
        }, function (ledge) {
          return getXCentre(ledge) - spectrumBounds.left;
        });
      } else if (v > detail.max()) {
        return $_436kgb10tjdud7f7y.getPart(slider, detail, 'right-edge').fold(function () {
          return spectrumBounds.width;
        }, function (redge) {
          return getXCentre(redge) - spectrumBounds.left;
        });
      } else {
        return (detail.value().get() - detail.min()) / range * spectrumBounds.width;
      }
    };
    var getXPos = function (slider) {
      var spectrum = $_436kgb10tjdud7f7y.getPartOrDie(slider, detail, 'spectrum');
      var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
      var sliderBounds = slider.element().dom().getBoundingClientRect();
      var xOffset = getXOffset(slider, spectrumBounds, detail);
      return spectrumBounds.left - sliderBounds.left + xOffset;
    };
    var refresh = function (component) {
      var pos = getXPos(component);
      var thumb = getThumb(component);
      var thumbRadius = $_6chz3611kjdud7fcw.get(thumb.element()) / 2;
      $_btgbcy103jdud7f3t.set(thumb.element(), 'left', pos - thumbRadius + 'px');
    };
    var changeValue = function (component, newValue) {
      var oldValue = detail.value().get();
      var thumb = getThumb(component);
      if (oldValue !== newValue || $_btgbcy103jdud7f3t.getRaw(thumb.element(), 'left').isNone()) {
        detail.value().set(newValue);
        refresh(component);
        detail.onChange()(component, thumb, newValue);
        return Option.some(true);
      } else {
        return Option.none();
      }
    };
    var resetToMin = function (slider) {
      changeValue(slider, detail.min());
    };
    var resetToMax = function (slider) {
      changeValue(slider, detail.max());
    };
    var uiEventsArr = isTouch$3 ? [
      $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.touchstart(), function (slider, simulatedEvent) {
        detail.onDragStart()(slider, getThumb(slider));
      }),
      $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.touchend(), function (slider, simulatedEvent) {
        detail.onDragEnd()(slider, getThumb(slider));
      })
    ] : [
      $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.mousedown(), function (slider, simulatedEvent) {
        simulatedEvent.stop();
        detail.onDragStart()(slider, getThumb(slider));
        detail.mouseIsDown().set(true);
      }),
      $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.mouseup(), function (slider, simulatedEvent) {
        detail.onDragEnd()(slider, getThumb(slider));
        detail.mouseIsDown().set(false);
      })
    ];
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_73qnwowyjdud7ek9.deepMerge($_ax1gfoy2jdud7eu7.derive($_1g2cevwsjdud7ejp.flatten([
        !isTouch$3 ? [Keying.config({
            mode: 'special',
            focusIn: function (slider) {
              return $_436kgb10tjdud7f7y.getPart(slider, detail, 'spectrum').map(Keying.focusIn).map($_9njj9iwjjdud7eix.constant(true));
            }
          })] : [],
        [me.config({
            store: {
              mode: 'manual',
              getValue: function (_) {
                return detail.value().get();
              }
            }
          })]
      ])), $_c7jpu210ojdud7f7a.get(detail.sliderBehaviours())),
      events: $_5xcuyiy4jdud7eur.derive([
        $_5xcuyiy4jdud7eur.run($_edvvhp118jdud7fba.changeEvent(), function (slider, simulatedEvent) {
          changeValue(slider, simulatedEvent.event().value());
        }),
        $_5xcuyiy4jdud7eur.runOnAttached(function (slider, simulatedEvent) {
          detail.value().set(detail.getInitialValue()());
          var thumb = getThumb(slider);
          refresh(slider);
          detail.onInit()(slider, thumb, detail.value().get());
        })
      ].concat(uiEventsArr)),
      apis: {
        resetToMin: resetToMin,
        resetToMax: resetToMax,
        refresh: refresh
      },
      domModification: { styles: { position: 'relative' } }
    };
  };
  var $_5vf75e11jjdud7fci = { sketch: sketch$1 };

  var Slider = $_3inyq310pjdud7f7f.composite({
    name: 'Slider',
    configFields: SliderSchema,
    partFields: SliderParts,
    factory: $_5vf75e11jjdud7fci.sketch,
    apis: {
      resetToMin: function (apis, slider) {
        apis.resetToMin(slider);
      },
      resetToMax: function (apis, slider) {
        apis.resetToMax(slider);
      },
      refresh: function (apis, slider) {
        apis.refresh(slider);
      }
    }
  });

  var button = function (realm, clazz, makeItems) {
    return $_d0l7buzfjdud7f11.forToolbar(clazz, function () {
      var items = makeItems();
      realm.setContextToolbar([{
          label: clazz + ' group',
          items: items
        }]);
    }, {});
  };
  var $_247awl11ljdud7fcy = { button: button };

  var BLACK = -1;
  var makeSlider = function (spec) {
    var getColor = function (hue) {
      if (hue < 0) {
        return 'black';
      } else if (hue > 360) {
        return 'white';
      } else {
        return 'hsl(' + hue + ', 100%, 50%)';
      }
    };
    var onInit = function (slider, thumb, value) {
      var color = getColor(value);
      $_btgbcy103jdud7f3t.set(thumb.element(), 'background-color', color);
    };
    var onChange = function (slider, thumb, value) {
      var color = getColor(value);
      $_btgbcy103jdud7f3t.set(thumb.element(), 'background-color', color);
      spec.onChange(slider, thumb, color);
    };
    return Slider.sketch({
      dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-slider ${prefix}-hue-slider-container"></div>'),
      components: [
        Slider.parts()['left-edge']($_5oi2c7113jdud7fab.spec('<div class="${prefix}-hue-slider-black"></div>')),
        Slider.parts().spectrum({
          dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-slider-gradient-container"></div>'),
          components: [$_5oi2c7113jdud7fab.spec('<div class="${prefix}-slider-gradient"></div>')],
          behaviours: $_ax1gfoy2jdud7eu7.derive([Toggling.config({ toggleClass: $_5qzh4bzejdud7f0y.resolve('thumb-active') })])
        }),
        Slider.parts()['right-edge']($_5oi2c7113jdud7fab.spec('<div class="${prefix}-hue-slider-white"></div>')),
        Slider.parts().thumb({
          dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-slider-thumb"></div>'),
          behaviours: $_ax1gfoy2jdud7eu7.derive([Toggling.config({ toggleClass: $_5qzh4bzejdud7f0y.resolve('thumb-active') })])
        })
      ],
      onChange: onChange,
      onDragStart: function (slider, thumb) {
        Toggling.on(thumb);
      },
      onDragEnd: function (slider, thumb) {
        Toggling.off(thumb);
      },
      onInit: onInit,
      stepSize: 10,
      min: 0,
      max: 360,
      getInitialValue: spec.getInitialValue,
      sliderBehaviours: $_ax1gfoy2jdud7eu7.derive([$_nw25bzdjdud7f0v.orientation(Slider.refresh)])
    });
  };
  var makeItems = function (spec) {
    return [makeSlider(spec)];
  };
  var sketch$2 = function (realm, editor) {
    var spec = {
      onChange: function (slider, thumb, color) {
        editor.undoManager.transact(function () {
          editor.formatter.apply('forecolor', { value: color });
          editor.nodeChanged();
        });
      },
      getInitialValue: function () {
        return BLACK;
      }
    };
    return $_247awl11ljdud7fcy.button(realm, 'color', function () {
      return makeItems(spec);
    });
  };
  var $_2q53pp115jdud7fap = {
    makeItems: makeItems,
    sketch: sketch$2
  };

  var schema$7 = $_13hkebyejdud7ewm.objOfOnly([
    $_euqmtby7jdud7ev7.strict('getInitialValue'),
    $_euqmtby7jdud7ev7.strict('onChange'),
    $_euqmtby7jdud7ev7.strict('category'),
    $_euqmtby7jdud7ev7.strict('sizes')
  ]);
  var sketch$3 = function (rawSpec) {
    var spec = $_13hkebyejdud7ewm.asRawOrDie('SizeSlider', schema$7, rawSpec);
    var isValidValue = function (valueIndex) {
      return valueIndex >= 0 && valueIndex < spec.sizes.length;
    };
    var onChange = function (slider, thumb, valueIndex) {
      if (isValidValue(valueIndex)) {
        spec.onChange(valueIndex);
      }
    };
    return Slider.sketch({
      dom: {
        tag: 'div',
        classes: [
          $_5qzh4bzejdud7f0y.resolve('slider-' + spec.category + '-size-container'),
          $_5qzh4bzejdud7f0y.resolve('slider'),
          $_5qzh4bzejdud7f0y.resolve('slider-size-container')
        ]
      },
      onChange: onChange,
      onDragStart: function (slider, thumb) {
        Toggling.on(thumb);
      },
      onDragEnd: function (slider, thumb) {
        Toggling.off(thumb);
      },
      min: 0,
      max: spec.sizes.length - 1,
      stepSize: 1,
      getInitialValue: spec.getInitialValue,
      snapToGrid: true,
      sliderBehaviours: $_ax1gfoy2jdud7eu7.derive([$_nw25bzdjdud7f0v.orientation(Slider.refresh)]),
      components: [
        Slider.parts().spectrum({
          dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-slider-size-container"></div>'),
          components: [$_5oi2c7113jdud7fab.spec('<div class="${prefix}-slider-size-line"></div>')]
        }),
        Slider.parts().thumb({
          dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-slider-thumb"></div>'),
          behaviours: $_ax1gfoy2jdud7eu7.derive([Toggling.config({ toggleClass: $_5qzh4bzejdud7f0y.resolve('thumb-active') })])
        })
      ]
    });
  };
  var $_a4vyig11njdud7fd0 = { sketch: sketch$3 };

  var ancestor$3 = function (scope, transform, isRoot) {
    var element = scope.dom();
    var stop = $_9rljuwzjdud7ekb.isFunction(isRoot) ? isRoot : $_9njj9iwjjdud7eix.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_eobgtqxfjdud7elu.fromDom(element);
      var transformed = transform(el);
      if (transformed.isSome())
        return transformed;
      else if (stop(el))
        break;
    }
    return Option.none();
  };
  var closest$3 = function (scope, transform, isRoot) {
    var current = transform(scope);
    return current.orThunk(function () {
      return isRoot(scope) ? Option.none() : ancestor$3(scope, transform, isRoot);
    });
  };
  var $_9mj1j411pjdud7fdi = {
    ancestor: ancestor$3,
    closest: closest$3
  };

  var candidates = [
    '9px',
    '10px',
    '11px',
    '12px',
    '14px',
    '16px',
    '18px',
    '20px',
    '24px',
    '32px',
    '36px'
  ];
  var defaultSize = 'medium';
  var defaultIndex = 2;
  var indexToSize = function (index) {
    return Option.from(candidates[index]);
  };
  var sizeToIndex = function (size) {
    return $_1g2cevwsjdud7ejp.findIndex(candidates, function (v) {
      return v === size;
    });
  };
  var getRawOrComputed = function (isRoot, rawStart) {
    var optStart = $_50qkdpxkjdud7em6.isElement(rawStart) ? Option.some(rawStart) : $_dekwe2x3jdud7ekr.parent(rawStart);
    return optStart.map(function (start) {
      var inline = $_9mj1j411pjdud7fdi.closest(start, function (elem) {
        return $_btgbcy103jdud7f3t.getRaw(elem, 'font-size');
      }, isRoot);
      return inline.getOrThunk(function () {
        return $_btgbcy103jdud7f3t.get(start, 'font-size');
      });
    }).getOr('');
  };
  var getSize = function (editor) {
    var node = editor.selection.getStart();
    var elem = $_eobgtqxfjdud7elu.fromDom(node);
    var root = $_eobgtqxfjdud7elu.fromDom(editor.getBody());
    var isRoot = function (e) {
      return $_f1y1rtx9jdud7el7.eq(root, e);
    };
    var elemSize = getRawOrComputed(isRoot, elem);
    return $_1g2cevwsjdud7ejp.find(candidates, function (size) {
      return elemSize === size;
    }).getOr(defaultSize);
  };
  var applySize = function (editor, value) {
    var currentValue = getSize(editor);
    if (currentValue !== value) {
      editor.execCommand('fontSize', false, value);
    }
  };
  var get$7 = function (editor) {
    var size = getSize(editor);
    return sizeToIndex(size).getOr(defaultIndex);
  };
  var apply$1 = function (editor, index) {
    indexToSize(index).each(function (size) {
      applySize(editor, size);
    });
  };
  var $_f22pa511ojdud7fd8 = {
    candidates: $_9njj9iwjjdud7eix.constant(candidates),
    get: get$7,
    apply: apply$1
  };

  var sizes = $_f22pa511ojdud7fd8.candidates();
  var makeSlider$1 = function (spec) {
    return $_a4vyig11njdud7fd0.sketch({
      onChange: spec.onChange,
      sizes: sizes,
      category: 'font',
      getInitialValue: spec.getInitialValue
    });
  };
  var makeItems$1 = function (spec) {
    return [
      $_5oi2c7113jdud7fab.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-small-font ${prefix}-icon"></span>'),
      makeSlider$1(spec),
      $_5oi2c7113jdud7fab.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-large-font ${prefix}-icon"></span>')
    ];
  };
  var sketch$4 = function (realm, editor) {
    var spec = {
      onChange: function (value) {
        $_f22pa511ojdud7fd8.apply(editor, value);
      },
      getInitialValue: function () {
        return $_f22pa511ojdud7fd8.get(editor);
      }
    };
    return $_247awl11ljdud7fcy.button(realm, 'font-size', function () {
      return makeItems$1(spec);
    });
  };
  var $_8r2dx911mjdud7fcz = {
    makeItems: makeItems$1,
    sketch: sketch$4
  };

  var record = function (spec) {
    var uid = $_ettibkxsjdud7emz.hasKey(spec, 'uid') ? spec.uid : $_4mrseh10xjdud7f9b.generate('memento');
    var get = function (any) {
      return any.getSystem().getByUid(uid).getOrDie();
    };
    var getOpt = function (any) {
      return any.getSystem().getByUid(uid).fold(Option.none, Option.some);
    };
    var asSpec = function () {
      return $_73qnwowyjdud7ek9.deepMerge(spec, { uid: uid });
    };
    return {
      get: get,
      getOpt: getOpt,
      asSpec: asSpec
    };
  };
  var $_81ial811rjdud7fdw = { record: record };

  function create$3(width, height) {
    return resize(document.createElement('canvas'), width, height);
  }
  function clone$2(canvas) {
    var tCanvas, ctx;
    tCanvas = create$3(canvas.width, canvas.height);
    ctx = get2dContext(tCanvas);
    ctx.drawImage(canvas, 0, 0);
    return tCanvas;
  }
  function get2dContext(canvas) {
    return canvas.getContext('2d');
  }
  function get3dContext(canvas) {
    var gl = null;
    try {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (e) {
    }
    if (!gl) {
      gl = null;
    }
    return gl;
  }
  function resize(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  var $_92yes011ujdud7fek = {
    create: create$3,
    clone: clone$2,
    resize: resize,
    get2dContext: get2dContext,
    get3dContext: get3dContext
  };

  function getWidth(image) {
    return image.naturalWidth || image.width;
  }
  function getHeight(image) {
    return image.naturalHeight || image.height;
  }
  var $_a084qb11vjdud7fel = {
    getWidth: getWidth,
    getHeight: getHeight
  };

  var promise = function () {
    var Promise = function (fn) {
      if (typeof this !== 'object')
        throw new TypeError('Promises must be constructed via new');
      if (typeof fn !== 'function')
        throw new TypeError('not a function');
      this._state = null;
      this._value = null;
      this._deferreds = [];
      doResolve(fn, bind(resolve, this), bind(reject, this));
    };
    var asap = Promise.immediateFn || typeof setImmediate === 'function' && setImmediate || function (fn) {
      setTimeout(fn, 1);
    };
    function bind(fn, thisArg) {
      return function () {
        fn.apply(thisArg, arguments);
      };
    }
    var isArray = Array.isArray || function (value) {
      return Object.prototype.toString.call(value) === '[object Array]';
    };
    function handle(deferred) {
      var me = this;
      if (this._state === null) {
        this._deferreds.push(deferred);
        return;
      }
      asap(function () {
        var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
        if (cb === null) {
          (me._state ? deferred.resolve : deferred.reject)(me._value);
          return;
        }
        var ret;
        try {
          ret = cb(me._value);
        } catch (e) {
          deferred.reject(e);
          return;
        }
        deferred.resolve(ret);
      });
    }
    function resolve(newValue) {
      try {
        if (newValue === this)
          throw new TypeError('A promise cannot be resolved with itself.');
        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
          var then = newValue.then;
          if (typeof then === 'function') {
            doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
            return;
          }
        }
        this._state = true;
        this._value = newValue;
        finale.call(this);
      } catch (e) {
        reject.call(this, e);
      }
    }
    function reject(newValue) {
      this._state = false;
      this._value = newValue;
      finale.call(this);
    }
    function finale() {
      for (var i = 0, len = this._deferreds.length; i < len; i++) {
        handle.call(this, this._deferreds[i]);
      }
      this._deferreds = null;
    }
    function Handler(onFulfilled, onRejected, resolve, reject) {
      this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
      this.onRejected = typeof onRejected === 'function' ? onRejected : null;
      this.resolve = resolve;
      this.reject = reject;
    }
    function doResolve(fn, onFulfilled, onRejected) {
      var done = false;
      try {
        fn(function (value) {
          if (done)
            return;
          done = true;
          onFulfilled(value);
        }, function (reason) {
          if (done)
            return;
          done = true;
          onRejected(reason);
        });
      } catch (ex) {
        if (done)
          return;
        done = true;
        onRejected(ex);
      }
    }
    Promise.prototype['catch'] = function (onRejected) {
      return this.then(null, onRejected);
    };
    Promise.prototype.then = function (onFulfilled, onRejected) {
      var me = this;
      return new Promise(function (resolve, reject) {
        handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
      });
    };
    Promise.all = function () {
      var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);
      return new Promise(function (resolve, reject) {
        if (args.length === 0)
          return resolve([]);
        var remaining = args.length;
        function res(i, val) {
          try {
            if (val && (typeof val === 'object' || typeof val === 'function')) {
              var then = val.then;
              if (typeof then === 'function') {
                then.call(val, function (val) {
                  res(i, val);
                }, reject);
                return;
              }
            }
            args[i] = val;
            if (--remaining === 0) {
              resolve(args);
            }
          } catch (ex) {
            reject(ex);
          }
        }
        for (var i = 0; i < args.length; i++) {
          res(i, args[i]);
        }
      });
    };
    Promise.resolve = function (value) {
      if (value && typeof value === 'object' && value.constructor === Promise) {
        return value;
      }
      return new Promise(function (resolve) {
        resolve(value);
      });
    };
    Promise.reject = function (value) {
      return new Promise(function (resolve, reject) {
        reject(value);
      });
    };
    Promise.race = function (values) {
      return new Promise(function (resolve, reject) {
        for (var i = 0, len = values.length; i < len; i++) {
          values[i].then(resolve, reject);
        }
      });
    };
    return Promise;
  };
  var Promise = window.Promise ? window.Promise : promise();

  function Blob (parts, properties) {
    var f = $_3ytg1qxbjdud7elm.getOrDie('Blob');
    return new f(parts, properties);
  }

  function FileReader () {
    var f = $_3ytg1qxbjdud7elm.getOrDie('FileReader');
    return new f();
  }

  function Uint8Array (arr) {
    var f = $_3ytg1qxbjdud7elm.getOrDie('Uint8Array');
    return new f(arr);
  }

  var requestAnimationFrame = function (callback) {
    var f = $_3ytg1qxbjdud7elm.getOrDie('requestAnimationFrame');
    f(callback);
  };
  var atob = function (base64) {
    var f = $_3ytg1qxbjdud7elm.getOrDie('atob');
    return f(base64);
  };
  var $_b8ho8s120jdud7ff0 = {
    atob: atob,
    requestAnimationFrame: requestAnimationFrame
  };

  function loadImage(image) {
    return new Promise(function (resolve) {
      function loaded() {
        image.removeEventListener('load', loaded);
        resolve(image);
      }
      if (image.complete) {
        resolve(image);
      } else {
        image.addEventListener('load', loaded);
      }
    });
  }
  function imageToBlob(image) {
    return loadImage(image).then(function (image) {
      var src = image.src;
      if (src.indexOf('blob:') === 0) {
        return anyUriToBlob(src);
      }
      if (src.indexOf('data:') === 0) {
        return dataUriToBlob(src);
      }
      return anyUriToBlob(src);
    });
  }
  function blobToImage(blob) {
    return new Promise(function (resolve, reject) {
      var blobUrl = URL.createObjectURL(blob);
      var image = new Image();
      var removeListeners = function () {
        image.removeEventListener('load', loaded);
        image.removeEventListener('error', error);
      };
      function loaded() {
        removeListeners();
        resolve(image);
      }
      function error() {
        removeListeners();
        reject('Unable to load data of type ' + blob.type + ': ' + blobUrl);
      }
      image.addEventListener('load', loaded);
      image.addEventListener('error', error);
      image.src = blobUrl;
      if (image.complete) {
        loaded();
      }
    });
  }
  function anyUriToBlob(url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        if (this.status == 200) {
          resolve(this.response);
        }
      };
      xhr.onerror = function () {
        var _this = this;
        var corsError = function () {
          var obj = new Error('No access to download image');
          obj.code = 18;
          obj.name = 'SecurityError';
          return obj;
        };
        var genericError = function () {
          return new Error('Error ' + _this.status + ' downloading image');
        };
        reject(this.status === 0 ? corsError() : genericError());
      };
      xhr.send();
    });
  }
  function dataUriToBlobSync(uri) {
    var data = uri.split(',');
    var matches = /data:([^;]+)/.exec(data[0]);
    if (!matches)
      return Option.none();
    var mimetype = matches[1];
    var base64 = data[1];
    var sliceSize = 1024;
    var byteCharacters = $_b8ho8s120jdud7ff0.atob(base64);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);
    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      var begin = sliceIndex * sliceSize;
      var end = Math.min(begin + sliceSize, bytesLength);
      var bytes = new Array(end - begin);
      for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = Uint8Array(bytes);
    }
    return Option.some(Blob(byteArrays, { type: mimetype }));
  }
  function dataUriToBlob(uri) {
    return new Promise(function (resolve, reject) {
      dataUriToBlobSync(uri).fold(function () {
        reject('uri is not base64: ' + uri);
      }, resolve);
    });
  }
  function uriToBlob(url) {
    if (url.indexOf('blob:') === 0) {
      return anyUriToBlob(url);
    }
    if (url.indexOf('data:') === 0) {
      return dataUriToBlob(url);
    }
    return null;
  }
  function canvasToBlob(canvas, type, quality) {
    type = type || 'image/png';
    if (HTMLCanvasElement.prototype.toBlob) {
      return new Promise(function (resolve) {
        canvas.toBlob(function (blob) {
          resolve(blob);
        }, type, quality);
      });
    } else {
      return dataUriToBlob(canvas.toDataURL(type, quality));
    }
  }
  function canvasToDataURL(getCanvas, type, quality) {
    type = type || 'image/png';
    return getCanvas.then(function (canvas) {
      return canvas.toDataURL(type, quality);
    });
  }
  function blobToCanvas(blob) {
    return blobToImage(blob).then(function (image) {
      revokeImageUrl(image);
      var context, canvas;
      canvas = $_92yes011ujdud7fek.create($_a084qb11vjdud7fel.getWidth(image), $_a084qb11vjdud7fel.getHeight(image));
      context = $_92yes011ujdud7fek.get2dContext(canvas);
      context.drawImage(image, 0, 0);
      return canvas;
    });
  }
  function blobToDataUri(blob) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }
  function blobToBase64(blob) {
    return blobToDataUri(blob).then(function (dataUri) {
      return dataUri.split(',')[1];
    });
  }
  function revokeImageUrl(image) {
    URL.revokeObjectURL(image.src);
  }
  var $_fcfj4d11tjdud7fea = {
    blobToImage: blobToImage,
    imageToBlob: imageToBlob,
    blobToDataUri: blobToDataUri,
    blobToBase64: blobToBase64,
    dataUriToBlobSync: dataUriToBlobSync,
    canvasToBlob: canvasToBlob,
    canvasToDataURL: canvasToDataURL,
    blobToCanvas: blobToCanvas,
    uriToBlob: uriToBlob
  };

  var blobToImage$1 = function (image) {
    return $_fcfj4d11tjdud7fea.blobToImage(image);
  };
  var imageToBlob$1 = function (blob) {
    return $_fcfj4d11tjdud7fea.imageToBlob(blob);
  };
  var blobToDataUri$1 = function (blob) {
    return $_fcfj4d11tjdud7fea.blobToDataUri(blob);
  };
  var blobToBase64$1 = function (blob) {
    return $_fcfj4d11tjdud7fea.blobToBase64(blob);
  };
  var dataUriToBlobSync$1 = function (uri) {
    return $_fcfj4d11tjdud7fea.dataUriToBlobSync(uri);
  };
  var uriToBlob$1 = function (uri) {
    return Option.from($_fcfj4d11tjdud7fea.uriToBlob(uri));
  };
  var $_28p52q11sjdud7fe7 = {
    blobToImage: blobToImage$1,
    imageToBlob: imageToBlob$1,
    blobToDataUri: blobToDataUri$1,
    blobToBase64: blobToBase64$1,
    dataUriToBlobSync: dataUriToBlobSync$1,
    uriToBlob: uriToBlob$1
  };

  var addImage = function (editor, blob) {
    $_28p52q11sjdud7fe7.blobToBase64(blob).then(function (base64) {
      editor.undoManager.transact(function () {
        var cache = editor.editorUpload.blobCache;
        var info = cache.create($_3k9wwu10rjdud7f7t.generate('mceu'), blob, base64);
        cache.add(info);
        var img = editor.dom.createHTML('img', { src: info.blobUri() });
        editor.insertContent(img);
      });
    });
  };
  var extractBlob = function (simulatedEvent) {
    var event = simulatedEvent.event();
    var files = event.raw().target.files || event.raw().dataTransfer.files;
    return Option.from(files[0]);
  };
  var sketch$5 = function (editor) {
    var pickerDom = {
      tag: 'input',
      attributes: {
        accept: 'image/*',
        type: 'file',
        title: ''
      },
      styles: {
        visibility: 'hidden',
        position: 'absolute'
      }
    };
    var memPicker = $_81ial811rjdud7fdw.record({
      dom: pickerDom,
      events: $_5xcuyiy4jdud7eur.derive([
        $_5xcuyiy4jdud7eur.cutter($_brmbwvwijdud7eiu.click()),
        $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.change(), function (picker, simulatedEvent) {
          extractBlob(simulatedEvent).each(function (blob) {
            addImage(editor, blob);
          });
        })
      ])
    });
    return Button.sketch({
      dom: $_5oi2c7113jdud7fab.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-image ${prefix}-icon"></span>'),
      components: [memPicker.asSpec()],
      action: function (button) {
        var picker = memPicker.get(button);
        picker.element().dom().click();
      }
    });
  };
  var $_sv17x11qjdud7fdo = { sketch: sketch$5 };

  var get$8 = function (element) {
    return element.dom().textContent;
  };
  var set$5 = function (element, value) {
    element.dom().textContent = value;
  };
  var $_4cmh4e123jdud7fff = {
    get: get$8,
    set: set$5
  };

  var isNotEmpty = function (val) {
    return val.length > 0;
  };
  var defaultToEmpty = function (str) {
    return str === undefined || str === null ? '' : str;
  };
  var noLink = function (editor) {
    var text = editor.selection.getContent({ format: 'text' });
    return {
      url: '',
      text: text,
      title: '',
      target: '',
      link: Option.none()
    };
  };
  var fromLink = function (link) {
    var text = $_4cmh4e123jdud7fff.get(link);
    var url = $_2vghk1xrjdud7ems.get(link, 'href');
    var title = $_2vghk1xrjdud7ems.get(link, 'title');
    var target = $_2vghk1xrjdud7ems.get(link, 'target');
    return {
      url: defaultToEmpty(url),
      text: text !== url ? defaultToEmpty(text) : '',
      title: defaultToEmpty(title),
      target: defaultToEmpty(target),
      link: Option.some(link)
    };
  };
  var getInfo = function (editor) {
    return query(editor).fold(function () {
      return noLink(editor);
    }, function (link) {
      return fromLink(link);
    });
  };
  var wasSimple = function (link) {
    var prevHref = $_2vghk1xrjdud7ems.get(link, 'href');
    var prevText = $_4cmh4e123jdud7fff.get(link);
    return prevHref === prevText;
  };
  var getTextToApply = function (link, url, info) {
    return info.text.filter(isNotEmpty).fold(function () {
      return wasSimple(link) ? Option.some(url) : Option.none();
    }, Option.some);
  };
  var unlinkIfRequired = function (editor, info) {
    var activeLink = info.link.bind($_9njj9iwjjdud7eix.identity);
    activeLink.each(function (link) {
      editor.execCommand('unlink');
    });
  };
  var getAttrs$1 = function (url, info) {
    var attrs = {};
    attrs.href = url;
    info.title.filter(isNotEmpty).each(function (title) {
      attrs.title = title;
    });
    info.target.filter(isNotEmpty).each(function (target) {
      attrs.target = target;
    });
    return attrs;
  };
  var applyInfo = function (editor, info) {
    info.url.filter(isNotEmpty).fold(function () {
      unlinkIfRequired(editor, info);
    }, function (url) {
      var attrs = getAttrs$1(url, info);
      var activeLink = info.link.bind($_9njj9iwjjdud7eix.identity);
      activeLink.fold(function () {
        var text = info.text.filter(isNotEmpty).getOr(url);
        editor.insertContent(editor.dom.createHTML('a', attrs, editor.dom.encode(text)));
      }, function (link) {
        var text = getTextToApply(link, url, info);
        $_2vghk1xrjdud7ems.setAll(link, attrs);
        text.each(function (newText) {
          $_4cmh4e123jdud7fff.set(link, newText);
        });
      });
    });
  };
  var query = function (editor) {
    var start = $_eobgtqxfjdud7elu.fromDom(editor.selection.getStart());
    return $_a3quyizxjdud7f3e.closest(start, 'a');
  };
  var $_ee8359122jdud7ff7 = {
    getInfo: getInfo,
    applyInfo: applyInfo,
    query: query
  };

  var platform$1 = $_chh2cvwkjdud7ej0.detect();
  var preserve$1 = function (f, editor) {
    var rng = editor.selection.getRng();
    f();
    editor.selection.setRng(rng);
  };
  var forAndroid = function (editor, f) {
    var wrapper = platform$1.os.isAndroid() ? preserve$1 : $_9njj9iwjjdud7eix.apply;
    wrapper(f, editor);
  };
  var $_bmumk0124jdud7ffg = { forAndroid: forAndroid };

  var events$6 = function (name, eventHandlers) {
    var events = $_5xcuyiy4jdud7eur.derive(eventHandlers);
    return $_ax1gfoy2jdud7eu7.create({
      fields: [$_euqmtby7jdud7ev7.strict('enabled')],
      name: name,
      active: { events: $_9njj9iwjjdud7eix.constant(events) }
    });
  };
  var config = function (name, eventHandlers) {
    var me = events$6(name, eventHandlers);
    return {
      key: name,
      value: {
        config: {},
        me: me,
        configAsRaw: $_9njj9iwjjdud7eix.constant({}),
        initialConfig: {},
        state: $_ax1gfoy2jdud7eu7.noState()
      }
    };
  };
  var $_6jfkt3126jdud7ffy = {
    events: events$6,
    config: config
  };

  var getCurrent = function (component, composeConfig, composeState) {
    return composeConfig.find()(component);
  };
  var $_bwstl9128jdud7fg3 = { getCurrent: getCurrent };

  var ComposeSchema = [$_euqmtby7jdud7ev7.strict('find')];

  var Composing = $_ax1gfoy2jdud7eu7.create({
    fields: ComposeSchema,
    name: 'composing',
    apis: $_bwstl9128jdud7fg3
  });

  var factory$1 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: $_73qnwowyjdud7ek9.deepMerge({
        tag: 'div',
        attributes: { role: 'presentation' }
      }, detail.dom()),
      components: detail.components(),
      behaviours: $_c7jpu210ojdud7f7a.get(detail.containerBehaviours()),
      events: detail.events(),
      domModification: detail.domModification(),
      eventOrder: detail.eventOrder()
    };
  };
  var Container = $_3inyq310pjdud7f7f.single({
    name: 'Container',
    factory: factory$1,
    configFields: [
      $_euqmtby7jdud7ev7.defaulted('components', []),
      $_c7jpu210ojdud7f7a.field('containerBehaviours', []),
      $_euqmtby7jdud7ev7.defaulted('events', {}),
      $_euqmtby7jdud7ev7.defaulted('domModification', {}),
      $_euqmtby7jdud7ev7.defaulted('eventOrder', {})
    ]
  });

  var factory$2 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      behaviours: $_73qnwowyjdud7ek9.deepMerge($_ax1gfoy2jdud7eu7.derive([
        me.config({
          store: {
            mode: 'memory',
            initialValue: detail.getInitialValue()()
          }
        }),
        Composing.config({ find: Option.some })
      ]), $_c7jpu210ojdud7f7a.get(detail.dataBehaviours())),
      events: $_5xcuyiy4jdud7eur.derive([$_5xcuyiy4jdud7eur.runOnAttached(function (component, simulatedEvent) {
          me.setValue(component, detail.getInitialValue()());
        })])
    };
  };
  var DataField = $_3inyq310pjdud7f7f.single({
    name: 'DataField',
    factory: factory$2,
    configFields: [
      $_euqmtby7jdud7ev7.strict('uid'),
      $_euqmtby7jdud7ev7.strict('dom'),
      $_euqmtby7jdud7ev7.strict('getInitialValue'),
      $_c7jpu210ojdud7f7a.field('dataBehaviours', [
        me,
        Composing
      ])
    ]
  });

  var get$9 = function (element) {
    return element.dom().value;
  };
  var set$6 = function (element, value) {
    if (value === undefined)
      throw new Error('Value.set was undefined');
    element.dom().value = value;
  };
  var $_2itxad12ejdud7fgx = {
    set: set$6,
    get: get$9
  };

  var schema$8 = [
    $_euqmtby7jdud7ev7.option('data'),
    $_euqmtby7jdud7ev7.defaulted('inputAttributes', {}),
    $_euqmtby7jdud7ev7.defaulted('inputStyles', {}),
    $_euqmtby7jdud7ev7.defaulted('type', 'input'),
    $_euqmtby7jdud7ev7.defaulted('tag', 'input'),
    $_euqmtby7jdud7ev7.defaulted('inputClasses', []),
    $_etkinez6jdud7ezi.onHandler('onSetValue'),
    $_euqmtby7jdud7ev7.defaulted('styles', {}),
    $_euqmtby7jdud7ev7.option('placeholder'),
    $_euqmtby7jdud7ev7.defaulted('eventOrder', {}),
    $_c7jpu210ojdud7f7a.field('inputBehaviours', [
      me,
      Focusing
    ]),
    $_euqmtby7jdud7ev7.defaulted('selectOnFocus', true)
  ];
  var behaviours = function (detail) {
    return $_73qnwowyjdud7ek9.deepMerge($_ax1gfoy2jdud7eu7.derive([
      me.config({
        store: {
          mode: 'manual',
          initialValue: detail.data().getOr(undefined),
          getValue: function (input) {
            return $_2itxad12ejdud7fgx.get(input.element());
          },
          setValue: function (input, data) {
            var current = $_2itxad12ejdud7fgx.get(input.element());
            if (current !== data) {
              $_2itxad12ejdud7fgx.set(input.element(), data);
            }
          }
        },
        onSetValue: detail.onSetValue()
      }),
      Focusing.config({
        onFocus: detail.selectOnFocus() === false ? $_9njj9iwjjdud7eix.noop : function (component) {
          var input = component.element();
          var value = $_2itxad12ejdud7fgx.get(input);
          input.dom().setSelectionRange(0, value.length);
        }
      })
    ]), $_c7jpu210ojdud7f7a.get(detail.inputBehaviours()));
  };
  var dom$2 = function (detail) {
    return {
      tag: detail.tag(),
      attributes: $_73qnwowyjdud7ek9.deepMerge($_ettibkxsjdud7emz.wrapAll([{
          key: 'type',
          value: detail.type()
        }].concat(detail.placeholder().map(function (pc) {
        return {
          key: 'placeholder',
          value: pc
        };
      }).toArray())), detail.inputAttributes()),
      styles: detail.inputStyles(),
      classes: detail.inputClasses()
    };
  };
  var $_93oz4o12djdud7fgo = {
    schema: $_9njj9iwjjdud7eix.constant(schema$8),
    behaviours: behaviours,
    dom: dom$2
  };

  var factory$3 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: $_93oz4o12djdud7fgo.dom(detail),
      components: [],
      behaviours: $_93oz4o12djdud7fgo.behaviours(detail),
      eventOrder: detail.eventOrder()
    };
  };
  var Input = $_3inyq310pjdud7f7f.single({
    name: 'Input',
    configFields: $_93oz4o12djdud7fgo.schema(),
    factory: factory$3
  });

  var exhibit$3 = function (base, tabConfig) {
    return $_biiw3tyhjdud7ewz.nu({
      attributes: $_ettibkxsjdud7emz.wrapAll([{
          key: tabConfig.tabAttr(),
          value: 'true'
        }])
    });
  };
  var $_7pfhbw12gjdud7fh0 = { exhibit: exhibit$3 };

  var TabstopSchema = [$_euqmtby7jdud7ev7.defaulted('tabAttr', 'data-alloy-tabstop')];

  var Tabstopping = $_ax1gfoy2jdud7eu7.create({
    fields: TabstopSchema,
    name: 'tabstopping',
    active: $_7pfhbw12gjdud7fh0
  });

  var clearInputBehaviour = 'input-clearing';
  var field$2 = function (name, placeholder) {
    var inputSpec = $_81ial811rjdud7fdw.record(Input.sketch({
      placeholder: placeholder,
      onSetValue: function (input, data) {
        $_98da6jwgjdud7eil.emit(input, $_brmbwvwijdud7eiu.input());
      },
      inputBehaviours: $_ax1gfoy2jdud7eu7.derive([
        Composing.config({ find: Option.some }),
        Tabstopping.config({}),
        Keying.config({ mode: 'execution' })
      ]),
      selectOnFocus: false
    }));
    var buttonSpec = $_81ial811rjdud7fdw.record(Button.sketch({
      dom: $_5oi2c7113jdud7fab.dom('<button class="${prefix}-input-container-x ${prefix}-icon-cancel-circle ${prefix}-icon"></button>'),
      action: function (button) {
        var input = inputSpec.get(button);
        me.setValue(input, '');
      }
    }));
    return {
      name: name,
      spec: Container.sketch({
        dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-input-container"></div>'),
        components: [
          inputSpec.asSpec(),
          buttonSpec.asSpec()
        ],
        containerBehaviours: $_ax1gfoy2jdud7eu7.derive([
          Toggling.config({ toggleClass: $_5qzh4bzejdud7f0y.resolve('input-container-empty') }),
          Composing.config({
            find: function (comp) {
              return Option.some(inputSpec.get(comp));
            }
          }),
          $_6jfkt3126jdud7ffy.config(clearInputBehaviour, [$_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.input(), function (iContainer) {
              var input = inputSpec.get(iContainer);
              var val = me.getValue(input);
              var f = val.length > 0 ? Toggling.off : Toggling.on;
              f(iContainer);
            })])
        ])
      })
    };
  };
  var hidden = function (name) {
    return {
      name: name,
      spec: DataField.sketch({
        dom: {
          tag: 'span',
          styles: { display: 'none' }
        },
        getInitialValue: function () {
          return Option.none();
        }
      })
    };
  };
  var $_dqko3j125jdud7ffj = {
    field: field$2,
    hidden: hidden
  };

  var nativeDisabled = [
    'input',
    'button',
    'textarea'
  ];
  var onLoad$5 = function (component, disableConfig, disableState) {
    if (disableConfig.disabled())
      disable(component, disableConfig, disableState);
  };
  var hasNative = function (component) {
    return $_1g2cevwsjdud7ejp.contains(nativeDisabled, $_50qkdpxkjdud7em6.name(component.element()));
  };
  var nativeIsDisabled = function (component) {
    return $_2vghk1xrjdud7ems.has(component.element(), 'disabled');
  };
  var nativeDisable = function (component) {
    $_2vghk1xrjdud7ems.set(component.element(), 'disabled', 'disabled');
  };
  var nativeEnable = function (component) {
    $_2vghk1xrjdud7ems.remove(component.element(), 'disabled');
  };
  var ariaIsDisabled = function (component) {
    return $_2vghk1xrjdud7ems.get(component.element(), 'aria-disabled') === 'true';
  };
  var ariaDisable = function (component) {
    $_2vghk1xrjdud7ems.set(component.element(), 'aria-disabled', 'true');
  };
  var ariaEnable = function (component) {
    $_2vghk1xrjdud7ems.set(component.element(), 'aria-disabled', 'false');
  };
  var disable = function (component, disableConfig, disableState) {
    disableConfig.disableClass().each(function (disableClass) {
      $_1x3ogvynjdud7exn.add(component.element(), disableClass);
    });
    var f = hasNative(component) ? nativeDisable : ariaDisable;
    f(component);
  };
  var enable = function (component, disableConfig, disableState) {
    disableConfig.disableClass().each(function (disableClass) {
      $_1x3ogvynjdud7exn.remove(component.element(), disableClass);
    });
    var f = hasNative(component) ? nativeEnable : ariaEnable;
    f(component);
  };
  var isDisabled = function (component) {
    return hasNative(component) ? nativeIsDisabled(component) : ariaIsDisabled(component);
  };
  var $_qq2li12ljdud7fhv = {
    enable: enable,
    disable: disable,
    isDisabled: isDisabled,
    onLoad: onLoad$5
  };

  var exhibit$4 = function (base, disableConfig, disableState) {
    return $_biiw3tyhjdud7ewz.nu({ classes: disableConfig.disabled() ? disableConfig.disableClass().map($_1g2cevwsjdud7ejp.pure).getOr([]) : [] });
  };
  var events$7 = function (disableConfig, disableState) {
    return $_5xcuyiy4jdud7eur.derive([
      $_5xcuyiy4jdud7eur.abort($_801kkqwhjdud7eiq.execute(), function (component, simulatedEvent) {
        return $_qq2li12ljdud7fhv.isDisabled(component, disableConfig, disableState);
      }),
      $_1t33c1y3jdud7euf.loadEvent(disableConfig, disableState, $_qq2li12ljdud7fhv.onLoad)
    ]);
  };
  var $_3yxxg12kjdud7fhs = {
    exhibit: exhibit$4,
    events: events$7
  };

  var DisableSchema = [
    $_euqmtby7jdud7ev7.defaulted('disabled', false),
    $_euqmtby7jdud7ev7.option('disableClass')
  ];

  var Disabling = $_ax1gfoy2jdud7eu7.create({
    fields: DisableSchema,
    name: 'disabling',
    active: $_3yxxg12kjdud7fhs,
    apis: $_qq2li12ljdud7fhv
  });

  var owner$1 = 'form';
  var schema$9 = [$_c7jpu210ojdud7f7a.field('formBehaviours', [me])];
  var getPartName = function (name) {
    return '<alloy.field.' + name + '>';
  };
  var sketch$6 = function (fSpec) {
    var parts = function () {
      var record = [];
      var field = function (name, config) {
        record.push(name);
        return $_436kgb10tjdud7f7y.generateOne(owner$1, getPartName(name), config);
      };
      return {
        field: field,
        record: function () {
          return record;
        }
      };
    }();
    var spec = fSpec(parts);
    var partNames = parts.record();
    var fieldParts = $_1g2cevwsjdud7ejp.map(partNames, function (n) {
      return $_7938qf10vjdud7f8n.required({
        name: n,
        pname: getPartName(n)
      });
    });
    return $_dsxxyk10sjdud7f7u.composite(owner$1, schema$9, fieldParts, make, spec);
  };
  var make = function (detail, components, spec) {
    return $_73qnwowyjdud7ek9.deepMerge({
      'debug.sketcher': { 'Form': spec },
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_73qnwowyjdud7ek9.deepMerge($_ax1gfoy2jdud7eu7.derive([me.config({
          store: {
            mode: 'manual',
            getValue: function (form) {
              var optPs = $_436kgb10tjdud7f7y.getAllParts(form, detail);
              return $_2dykn0x0jdud7ekc.map(optPs, function (optPThunk, pName) {
                return optPThunk().bind(Composing.getCurrent).map(me.getValue);
              });
            },
            setValue: function (form, values) {
              $_2dykn0x0jdud7ekc.each(values, function (newValue, key) {
                $_436kgb10tjdud7f7y.getPart(form, detail, key).each(function (wrapper) {
                  Composing.getCurrent(wrapper).each(function (field) {
                    me.setValue(field, newValue);
                  });
                });
              });
            }
          }
        })]), $_c7jpu210ojdud7f7a.get(detail.formBehaviours())),
      apis: {
        getField: function (form, key) {
          return $_436kgb10tjdud7f7y.getPart(form, detail, key).bind(Composing.getCurrent);
        }
      }
    });
  };
  var $_1cu1pe12njdud7fib = {
    getField: $_37ypl510qjdud7f7n.makeApi(function (apis, component, key) {
      return apis.getField(component, key);
    }),
    sketch: sketch$6
  };

  var revocable = function (doRevoke) {
    var subject = Cell(Option.none());
    var revoke = function () {
      subject.get().each(doRevoke);
    };
    var clear = function () {
      revoke();
      subject.set(Option.none());
    };
    var set = function (s) {
      revoke();
      subject.set(Option.some(s));
    };
    var isSet = function () {
      return subject.get().isSome();
    };
    return {
      clear: clear,
      isSet: isSet,
      set: set
    };
  };
  var destroyable = function () {
    return revocable(function (s) {
      s.destroy();
    });
  };
  var unbindable = function () {
    return revocable(function (s) {
      s.unbind();
    });
  };
  var api$2 = function () {
    var subject = Cell(Option.none());
    var revoke = function () {
      subject.get().each(function (s) {
        s.destroy();
      });
    };
    var clear = function () {
      revoke();
      subject.set(Option.none());
    };
    var set = function (s) {
      revoke();
      subject.set(Option.some(s));
    };
    var run = function (f) {
      subject.get().each(f);
    };
    var isSet = function () {
      return subject.get().isSome();
    };
    return {
      clear: clear,
      isSet: isSet,
      set: set,
      run: run
    };
  };
  var value$3 = function () {
    var subject = Cell(Option.none());
    var clear = function () {
      subject.set(Option.none());
    };
    var set = function (s) {
      subject.set(Option.some(s));
    };
    var on = function (f) {
      subject.get().each(f);
    };
    var isSet = function () {
      return subject.get().isSome();
    };
    return {
      clear: clear,
      set: set,
      isSet: isSet,
      on: on
    };
  };
  var $_9fhyae12ojdud7fij = {
    destroyable: destroyable,
    unbindable: unbindable,
    api: api$2,
    value: value$3
  };

  var SWIPING_LEFT = 1;
  var SWIPING_RIGHT = -1;
  var SWIPING_NONE = 0;
  var init$3 = function (xValue) {
    return {
      xValue: xValue,
      points: []
    };
  };
  var move = function (model, xValue) {
    if (xValue === model.xValue) {
      return model;
    }
    var currentDirection = xValue - model.xValue > 0 ? SWIPING_LEFT : SWIPING_RIGHT;
    var newPoint = {
      direction: currentDirection,
      xValue: xValue
    };
    var priorPoints = function () {
      if (model.points.length === 0) {
        return [];
      } else {
        var prev = model.points[model.points.length - 1];
        return prev.direction === currentDirection ? model.points.slice(0, model.points.length - 1) : model.points;
      }
    }();
    return {
      xValue: xValue,
      points: priorPoints.concat([newPoint])
    };
  };
  var complete = function (model) {
    if (model.points.length === 0) {
      return SWIPING_NONE;
    } else {
      var firstDirection = model.points[0].direction;
      var lastDirection = model.points[model.points.length - 1].direction;
      return firstDirection === SWIPING_RIGHT && lastDirection === SWIPING_RIGHT ? SWIPING_RIGHT : firstDirection === SWIPING_LEFT && lastDirection === SWIPING_LEFT ? SWIPING_LEFT : SWIPING_NONE;
    }
  };
  var $_1u15ok12pjdud7fim = {
    init: init$3,
    move: move,
    complete: complete
  };

  var sketch$7 = function (rawSpec) {
    var navigateEvent = 'navigateEvent';
    var wrapperAdhocEvents = 'serializer-wrapper-events';
    var formAdhocEvents = 'form-events';
    var schema = $_13hkebyejdud7ewm.objOf([
      $_euqmtby7jdud7ev7.strict('fields'),
      $_euqmtby7jdud7ev7.defaulted('maxFieldIndex', rawSpec.fields.length - 1),
      $_euqmtby7jdud7ev7.strict('onExecute'),
      $_euqmtby7jdud7ev7.strict('getInitialValue'),
      $_euqmtby7jdud7ev7.state('state', function () {
        return {
          dialogSwipeState: $_9fhyae12ojdud7fij.value(),
          currentScreen: Cell(0)
        };
      })
    ]);
    var spec = $_13hkebyejdud7ewm.asRawOrDie('SerialisedDialog', schema, rawSpec);
    var navigationButton = function (direction, directionName, enabled) {
      return Button.sketch({
        dom: $_5oi2c7113jdud7fab.dom('<span class="${prefix}-icon-' + directionName + ' ${prefix}-icon"></span>'),
        action: function (button) {
          $_98da6jwgjdud7eil.emitWith(button, navigateEvent, { direction: direction });
        },
        buttonBehaviours: $_ax1gfoy2jdud7eu7.derive([Disabling.config({
            disableClass: $_5qzh4bzejdud7f0y.resolve('toolbar-navigation-disabled'),
            disabled: !enabled
          })])
      });
    };
    var reposition = function (dialog, message) {
      $_a3quyizxjdud7f3e.descendant(dialog.element(), '.' + $_5qzh4bzejdud7f0y.resolve('serialised-dialog-chain')).each(function (parent) {
        $_btgbcy103jdud7f3t.set(parent, 'left', -spec.state.currentScreen.get() * message.width + 'px');
      });
    };
    var navigate = function (dialog, direction) {
      var screens = $_df6s98zvjdud7f39.descendants(dialog.element(), '.' + $_5qzh4bzejdud7f0y.resolve('serialised-dialog-screen'));
      $_a3quyizxjdud7f3e.descendant(dialog.element(), '.' + $_5qzh4bzejdud7f0y.resolve('serialised-dialog-chain')).each(function (parent) {
        if (spec.state.currentScreen.get() + direction >= 0 && spec.state.currentScreen.get() + direction < screens.length) {
          $_btgbcy103jdud7f3t.getRaw(parent, 'left').each(function (left) {
            var currentLeft = parseInt(left, 10);
            var w = $_6chz3611kjdud7fcw.get(screens[0]);
            $_btgbcy103jdud7f3t.set(parent, 'left', currentLeft - direction * w + 'px');
          });
          spec.state.currentScreen.set(spec.state.currentScreen.get() + direction);
        }
      });
    };
    var focusInput = function (dialog) {
      var inputs = $_df6s98zvjdud7f39.descendants(dialog.element(), 'input');
      var optInput = Option.from(inputs[spec.state.currentScreen.get()]);
      optInput.each(function (input) {
        dialog.getSystem().getByDom(input).each(function (inputComp) {
          $_98da6jwgjdud7eil.dispatchFocus(dialog, inputComp.element());
        });
      });
      var dotitems = memDots.get(dialog);
      Highlighting.highlightAt(dotitems, spec.state.currentScreen.get());
    };
    var resetState = function () {
      spec.state.currentScreen.set(0);
      spec.state.dialogSwipeState.clear();
    };
    var memForm = $_81ial811rjdud7fdw.record($_1cu1pe12njdud7fib.sketch(function (parts) {
      return {
        dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-serialised-dialog"></div>'),
        components: [Container.sketch({
            dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-serialised-dialog-chain" style="left: 0px; position: absolute;"></div>'),
            components: $_1g2cevwsjdud7ejp.map(spec.fields, function (field, i) {
              return i <= spec.maxFieldIndex ? Container.sketch({
                dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-serialised-dialog-screen"></div>'),
                components: $_1g2cevwsjdud7ejp.flatten([
                  [navigationButton(-1, 'previous', i > 0)],
                  [parts.field(field.name, field.spec)],
                  [navigationButton(+1, 'next', i < spec.maxFieldIndex)]
                ])
              }) : parts.field(field.name, field.spec);
            })
          })],
        formBehaviours: $_ax1gfoy2jdud7eu7.derive([
          $_nw25bzdjdud7f0v.orientation(function (dialog, message) {
            reposition(dialog, message);
          }),
          Keying.config({
            mode: 'special',
            focusIn: function (dialog) {
              focusInput(dialog);
            },
            onTab: function (dialog) {
              navigate(dialog, +1);
              return Option.some(true);
            },
            onShiftTab: function (dialog) {
              navigate(dialog, -1);
              return Option.some(true);
            }
          }),
          $_6jfkt3126jdud7ffy.config(formAdhocEvents, [
            $_5xcuyiy4jdud7eur.runOnAttached(function (dialog, simulatedEvent) {
              resetState();
              var dotitems = memDots.get(dialog);
              Highlighting.highlightFirst(dotitems);
              spec.getInitialValue(dialog).each(function (v) {
                me.setValue(dialog, v);
              });
            }),
            $_5xcuyiy4jdud7eur.runOnExecute(spec.onExecute),
            $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.transitionend(), function (dialog, simulatedEvent) {
              if (simulatedEvent.event().raw().propertyName === 'left') {
                focusInput(dialog);
              }
            }),
            $_5xcuyiy4jdud7eur.run(navigateEvent, function (dialog, simulatedEvent) {
              var direction = simulatedEvent.event().direction();
              navigate(dialog, direction);
            })
          ])
        ])
      };
    }));
    var memDots = $_81ial811rjdud7fdw.record({
      dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-dot-container"></div>'),
      behaviours: $_ax1gfoy2jdud7eu7.derive([Highlighting.config({
          highlightClass: $_5qzh4bzejdud7f0y.resolve('dot-active'),
          itemClass: $_5qzh4bzejdud7f0y.resolve('dot-item')
        })]),
      components: $_1g2cevwsjdud7ejp.bind(spec.fields, function (_f, i) {
        return i <= spec.maxFieldIndex ? [$_5oi2c7113jdud7fab.spec('<div class="${prefix}-dot-item ${prefix}-icon-full-dot ${prefix}-icon"></div>')] : [];
      })
    });
    return {
      dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-serializer-wrapper"></div>'),
      components: [
        memForm.asSpec(),
        memDots.asSpec()
      ],
      behaviours: $_ax1gfoy2jdud7eu7.derive([
        Keying.config({
          mode: 'special',
          focusIn: function (wrapper) {
            var form = memForm.get(wrapper);
            Keying.focusIn(form);
          }
        }),
        $_6jfkt3126jdud7ffy.config(wrapperAdhocEvents, [
          $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.touchstart(), function (wrapper, simulatedEvent) {
            spec.state.dialogSwipeState.set($_1u15ok12pjdud7fim.init(simulatedEvent.event().raw().touches[0].clientX));
          }),
          $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.touchmove(), function (wrapper, simulatedEvent) {
            spec.state.dialogSwipeState.on(function (state) {
              simulatedEvent.event().prevent();
              spec.state.dialogSwipeState.set($_1u15ok12pjdud7fim.move(state, simulatedEvent.event().raw().touches[0].clientX));
            });
          }),
          $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.touchend(), function (wrapper) {
            spec.state.dialogSwipeState.on(function (state) {
              var dialog = memForm.get(wrapper);
              var direction = -1 * $_1u15ok12pjdud7fim.complete(state);
              navigate(dialog, direction);
            });
          })
        ])
      ])
    };
  };
  var $_6vo93712ijdud7fh6 = { sketch: sketch$7 };

  var getGroups = $_2nf0bewljdud7ej2.cached(function (realm, editor) {
    return [{
        label: 'the link group',
        items: [$_6vo93712ijdud7fh6.sketch({
            fields: [
              $_dqko3j125jdud7ffj.field('url', 'Type or paste URL'),
              $_dqko3j125jdud7ffj.field('text', 'Link text'),
              $_dqko3j125jdud7ffj.field('title', 'Link title'),
              $_dqko3j125jdud7ffj.field('target', 'Link target'),
              $_dqko3j125jdud7ffj.hidden('link')
            ],
            maxFieldIndex: [
              'url',
              'text',
              'title',
              'target'
            ].length - 1,
            getInitialValue: function () {
              return Option.some($_ee8359122jdud7ff7.getInfo(editor));
            },
            onExecute: function (dialog) {
              var info = me.getValue(dialog);
              $_ee8359122jdud7ff7.applyInfo(editor, info);
              realm.restoreToolbar();
              editor.focus();
            }
          })]
      }];
  });
  var sketch$8 = function (realm, editor) {
    return $_d0l7buzfjdud7f11.forToolbarStateAction(editor, 'link', 'link', function () {
      var groups = getGroups(realm, editor);
      realm.setContextToolbar(groups);
      $_bmumk0124jdud7ffg.forAndroid(editor, function () {
        realm.focusToolbar();
      });
      $_ee8359122jdud7ff7.query(editor).each(function (link) {
        editor.selection.select(link.dom());
      });
    });
  };
  var $_20tbzu121jdud7ff2 = { sketch: sketch$8 };

  var DefaultStyleFormats = [
    {
      title: 'Headings',
      items: [
        {
          title: 'Heading 1',
          format: 'h1'
        },
        {
          title: 'Heading 2',
          format: 'h2'
        },
        {
          title: 'Heading 3',
          format: 'h3'
        },
        {
          title: 'Heading 4',
          format: 'h4'
        },
        {
          title: 'Heading 5',
          format: 'h5'
        },
        {
          title: 'Heading 6',
          format: 'h6'
        }
      ]
    },
    {
      title: 'Inline',
      items: [
        {
          title: 'Bold',
          icon: 'bold',
          format: 'bold'
        },
        {
          title: 'Italic',
          icon: 'italic',
          format: 'italic'
        },
        {
          title: 'Underline',
          icon: 'underline',
          format: 'underline'
        },
        {
          title: 'Strikethrough',
          icon: 'strikethrough',
          format: 'strikethrough'
        },
        {
          title: 'Superscript',
          icon: 'superscript',
          format: 'superscript'
        },
        {
          title: 'Subscript',
          icon: 'subscript',
          format: 'subscript'
        },
        {
          title: 'Code',
          icon: 'code',
          format: 'code'
        }
      ]
    },
    {
      title: 'Blocks',
      items: [
        {
          title: 'Paragraph',
          format: 'p'
        },
        {
          title: 'Blockquote',
          format: 'blockquote'
        },
        {
          title: 'Div',
          format: 'div'
        },
        {
          title: 'Pre',
          format: 'pre'
        }
      ]
    },
    {
      title: 'Alignment',
      items: [
        {
          title: 'Left',
          icon: 'alignleft',
          format: 'alignleft'
        },
        {
          title: 'Center',
          icon: 'aligncenter',
          format: 'aligncenter'
        },
        {
          title: 'Right',
          icon: 'alignright',
          format: 'alignright'
        },
        {
          title: 'Justify',
          icon: 'alignjustify',
          format: 'alignjustify'
        }
      ]
    }
  ];

  var generateFrom = function (spec, all) {
    var schema = $_1g2cevwsjdud7ejp.map(all, function (a) {
      return $_euqmtby7jdud7ev7.field(a.name(), a.name(), $_6rbn18y8jdud7evc.asOption(), $_13hkebyejdud7ewm.objOf([
        $_euqmtby7jdud7ev7.strict('config'),
        $_euqmtby7jdud7ev7.defaulted('state', $_71cmtkyjjdud7exe)
      ]));
    });
    var validated = $_13hkebyejdud7ewm.asStruct('component.behaviours', $_13hkebyejdud7ewm.objOf(schema), spec.behaviours).fold(function (errInfo) {
      throw new Error($_13hkebyejdud7ewm.formatError(errInfo) + '\nComplete spec:\n' + $_crnojnydjdud7ewk.stringify(spec, null, 2));
    }, $_9njj9iwjjdud7eix.identity);
    return {
      list: all,
      data: $_2dykn0x0jdud7ekc.map(validated, function (blobOptionThunk) {
        var blobOption = blobOptionThunk();
        return $_9njj9iwjjdud7eix.constant(blobOption.map(function (blob) {
          return {
            config: blob.config(),
            state: blob.state().init(blob.config())
          };
        }));
      })
    };
  };
  var getBehaviours = function (bData) {
    return bData.list;
  };
  var getData = function (bData) {
    return bData.data;
  };
  var $_9q6ztw12wjdud7fkm = {
    generateFrom: generateFrom,
    getBehaviours: getBehaviours,
    getData: getData
  };

  var getBehaviours$1 = function (spec) {
    var behaviours = $_ettibkxsjdud7emz.readOptFrom(spec, 'behaviours').getOr({});
    var keys = $_1g2cevwsjdud7ejp.filter($_2dykn0x0jdud7ekc.keys(behaviours), function (k) {
      return behaviours[k] !== undefined;
    });
    return $_1g2cevwsjdud7ejp.map(keys, function (k) {
      return spec.behaviours[k].me;
    });
  };
  var generateFrom$1 = function (spec, all) {
    return $_9q6ztw12wjdud7fkm.generateFrom(spec, all);
  };
  var generate$4 = function (spec) {
    var all = getBehaviours$1(spec);
    return generateFrom$1(spec, all);
  };
  var $_9vg7um12vjdud7fkh = {
    generate: generate$4,
    generateFrom: generateFrom$1
  };

  var ComponentApi = $_cmsqfeyljdud7exh.exactly([
    'getSystem',
    'config',
    'hasConfigured',
    'spec',
    'connect',
    'disconnect',
    'element',
    'syncComponents',
    'readState',
    'components',
    'events'
  ]);

  var SystemApi = $_cmsqfeyljdud7exh.exactly([
    'debugInfo',
    'triggerFocus',
    'triggerEvent',
    'triggerEscape',
    'addToWorld',
    'removeFromWorld',
    'addToGui',
    'removeFromGui',
    'build',
    'getByUid',
    'getByDom',
    'broadcast',
    'broadcastOn'
  ]);

  function NoContextApi (getComp) {
    var fail = function (event) {
      return function () {
        throw new Error('The component must be in a context to send: ' + event + '\n' + $_d3f8kuxmjdud7emi.element(getComp().element()) + ' is not in context.');
      };
    };
    return SystemApi({
      debugInfo: $_9njj9iwjjdud7eix.constant('fake'),
      triggerEvent: fail('triggerEvent'),
      triggerFocus: fail('triggerFocus'),
      triggerEscape: fail('triggerEscape'),
      build: fail('build'),
      addToWorld: fail('addToWorld'),
      removeFromWorld: fail('removeFromWorld'),
      addToGui: fail('addToGui'),
      removeFromGui: fail('removeFromGui'),
      getByUid: fail('getByUid'),
      getByDom: fail('getByDom'),
      broadcast: fail('broadcast'),
      broadcastOn: fail('broadcastOn')
    });
  }

  var byInnerKey = function (data, tuple) {
    var r = {};
    $_2dykn0x0jdud7ekc.each(data, function (detail, key) {
      $_2dykn0x0jdud7ekc.each(detail, function (value, indexKey) {
        var chain = $_ettibkxsjdud7emz.readOr(indexKey, [])(r);
        r[indexKey] = chain.concat([tuple(key, value)]);
      });
    });
    return r;
  };
  var $_5gdyb2131jdud7fle = { byInnerKey: byInnerKey };

  var behaviourDom = function (name, modification) {
    return {
      name: $_9njj9iwjjdud7eix.constant(name),
      modification: modification
    };
  };
  var concat = function (chain, aspect) {
    var values = $_1g2cevwsjdud7ejp.bind(chain, function (c) {
      return c.modification().getOr([]);
    });
    return Result.value($_ettibkxsjdud7emz.wrap(aspect, values));
  };
  var onlyOne = function (chain, aspect, order) {
    if (chain.length > 1)
      return Result.error('Multiple behaviours have tried to change DOM "' + aspect + '". The guilty behaviours are: ' + $_crnojnydjdud7ewk.stringify($_1g2cevwsjdud7ejp.map(chain, function (b) {
        return b.name();
      })) + '. At this stage, this ' + 'is not supported. Future releases might provide strategies for resolving this.');
    else if (chain.length === 0)
      return Result.value({});
    else
      return Result.value(chain[0].modification().fold(function () {
        return {};
      }, function (m) {
        return $_ettibkxsjdud7emz.wrap(aspect, m);
      }));
  };
  var duplicate = function (aspect, k, obj, behaviours) {
    return Result.error('Mulitple behaviours have tried to change the _' + k + '_ "' + aspect + '"' + '. The guilty behaviours are: ' + $_crnojnydjdud7ewk.stringify($_1g2cevwsjdud7ejp.bind(behaviours, function (b) {
      return b.modification().getOr({})[k] !== undefined ? [b.name()] : [];
    }), null, 2) + '. This is not currently supported.');
  };
  var safeMerge = function (chain, aspect) {
    var y = $_1g2cevwsjdud7ejp.foldl(chain, function (acc, c) {
      var obj = c.modification().getOr({});
      return acc.bind(function (accRest) {
        var parts = $_2dykn0x0jdud7ekc.mapToArray(obj, function (v, k) {
          return accRest[k] !== undefined ? duplicate(aspect, k, obj, chain) : Result.value($_ettibkxsjdud7emz.wrap(k, v));
        });
        return $_ettibkxsjdud7emz.consolidate(parts, accRest);
      });
    }, Result.value({}));
    return y.map(function (yValue) {
      return $_ettibkxsjdud7emz.wrap(aspect, yValue);
    });
  };
  var mergeTypes = {
    classes: concat,
    attributes: safeMerge,
    styles: safeMerge,
    domChildren: onlyOne,
    defChildren: onlyOne,
    innerHtml: onlyOne,
    value: onlyOne
  };
  var combine$1 = function (info, baseMod, behaviours, base) {
    var behaviourDoms = $_73qnwowyjdud7ek9.deepMerge({}, baseMod);
    $_1g2cevwsjdud7ejp.each(behaviours, function (behaviour) {
      behaviourDoms[behaviour.name()] = behaviour.exhibit(info, base);
    });
    var byAspect = $_5gdyb2131jdud7fle.byInnerKey(behaviourDoms, behaviourDom);
    var usedAspect = $_2dykn0x0jdud7ekc.map(byAspect, function (values, aspect) {
      return $_1g2cevwsjdud7ejp.bind(values, function (value) {
        return value.modification().fold(function () {
          return [];
        }, function (v) {
          return [value];
        });
      });
    });
    var modifications = $_2dykn0x0jdud7ekc.mapToArray(usedAspect, function (values, aspect) {
      return $_ettibkxsjdud7emz.readOptFrom(mergeTypes, aspect).fold(function () {
        return Result.error('Unknown field type: ' + aspect);
      }, function (merger) {
        return merger(values, aspect);
      });
    });
    var consolidated = $_ettibkxsjdud7emz.consolidate(modifications, {});
    return consolidated.map($_biiw3tyhjdud7ewz.nu);
  };
  var $_57i0zb130jdud7fl4 = { combine: combine$1 };

  var sortKeys = function (label, keyName, array, order) {
    var sliced = array.slice(0);
    try {
      var sorted = sliced.sort(function (a, b) {
        var aKey = a[keyName]();
        var bKey = b[keyName]();
        var aIndex = order.indexOf(aKey);
        var bIndex = order.indexOf(bKey);
        if (aIndex === -1)
          throw new Error('The ordering for ' + label + ' does not have an entry for ' + aKey + '.\nOrder specified: ' + $_crnojnydjdud7ewk.stringify(order, null, 2));
        if (bIndex === -1)
          throw new Error('The ordering for ' + label + ' does not have an entry for ' + bKey + '.\nOrder specified: ' + $_crnojnydjdud7ewk.stringify(order, null, 2));
        if (aIndex < bIndex)
          return -1;
        else if (bIndex < aIndex)
          return 1;
        else
          return 0;
      });
      return Result.value(sorted);
    } catch (err) {
      return Result.error([err]);
    }
  };
  var $_1ppdst133jdud7flt = { sortKeys: sortKeys };

  var nu$7 = function (handler, purpose) {
    return {
      handler: handler,
      purpose: $_9njj9iwjjdud7eix.constant(purpose)
    };
  };
  var curryArgs = function (descHandler, extraArgs) {
    return {
      handler: $_9njj9iwjjdud7eix.curry.apply(undefined, [descHandler.handler].concat(extraArgs)),
      purpose: descHandler.purpose
    };
  };
  var getHandler = function (descHandler) {
    return descHandler.handler;
  };
  var $_6lldf5134jdud7flx = {
    nu: nu$7,
    curryArgs: curryArgs,
    getHandler: getHandler
  };

  var behaviourTuple = function (name, handler) {
    return {
      name: $_9njj9iwjjdud7eix.constant(name),
      handler: $_9njj9iwjjdud7eix.constant(handler)
    };
  };
  var nameToHandlers = function (behaviours, info) {
    var r = {};
    $_1g2cevwsjdud7ejp.each(behaviours, function (behaviour) {
      r[behaviour.name()] = behaviour.handlers(info);
    });
    return r;
  };
  var groupByEvents = function (info, behaviours, base) {
    var behaviourEvents = $_73qnwowyjdud7ek9.deepMerge(base, nameToHandlers(behaviours, info));
    return $_5gdyb2131jdud7fle.byInnerKey(behaviourEvents, behaviourTuple);
  };
  var combine$2 = function (info, eventOrder, behaviours, base) {
    var byEventName = groupByEvents(info, behaviours, base);
    return combineGroups(byEventName, eventOrder);
  };
  var assemble = function (rawHandler) {
    var handler = $_6jq2azy6jdud7eux.read(rawHandler);
    return function (component, simulatedEvent) {
      var args = Array.prototype.slice.call(arguments, 0);
      if (handler.abort.apply(undefined, args)) {
        simulatedEvent.stop();
      } else if (handler.can.apply(undefined, args)) {
        handler.run.apply(undefined, args);
      }
    };
  };
  var missingOrderError = function (eventName, tuples) {
    return Result.error(['The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' + 'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 'can trigger it are: ' + $_crnojnydjdud7ewk.stringify($_1g2cevwsjdud7ejp.map(tuples, function (c) {
        return c.name();
      }), null, 2)]);
  };
  var fuse$1 = function (tuples, eventOrder, eventName) {
    var order = eventOrder[eventName];
    if (!order)
      return missingOrderError(eventName, tuples);
    else
      return $_1ppdst133jdud7flt.sortKeys('Event: ' + eventName, 'name', tuples, order).map(function (sortedTuples) {
        var handlers = $_1g2cevwsjdud7ejp.map(sortedTuples, function (tuple) {
          return tuple.handler();
        });
        return $_6jq2azy6jdud7eux.fuse(handlers);
      });
  };
  var combineGroups = function (byEventName, eventOrder) {
    var r = $_2dykn0x0jdud7ekc.mapToArray(byEventName, function (tuples, eventName) {
      var combined = tuples.length === 1 ? Result.value(tuples[0].handler()) : fuse$1(tuples, eventOrder, eventName);
      return combined.map(function (handler) {
        var assembled = assemble(handler);
        var purpose = tuples.length > 1 ? $_1g2cevwsjdud7ejp.filter(eventOrder, function (o) {
          return $_1g2cevwsjdud7ejp.contains(tuples, function (t) {
            return t.name() === o;
          });
        }).join(' > ') : tuples[0].name();
        return $_ettibkxsjdud7emz.wrap(eventName, $_6lldf5134jdud7flx.nu(assembled, purpose));
      });
    });
    return $_ettibkxsjdud7emz.consolidate(r, {});
  };
  var $_e28r99132jdud7flj = { combine: combine$2 };

  var toInfo = function (spec) {
    return $_13hkebyejdud7ewm.asStruct('custom.definition', $_13hkebyejdud7ewm.objOfOnly([
      $_euqmtby7jdud7ev7.field('dom', 'dom', $_6rbn18y8jdud7evc.strict(), $_13hkebyejdud7ewm.objOfOnly([
        $_euqmtby7jdud7ev7.strict('tag'),
        $_euqmtby7jdud7ev7.defaulted('styles', {}),
        $_euqmtby7jdud7ev7.defaulted('classes', []),
        $_euqmtby7jdud7ev7.defaulted('attributes', {}),
        $_euqmtby7jdud7ev7.option('value'),
        $_euqmtby7jdud7ev7.option('innerHtml')
      ])),
      $_euqmtby7jdud7ev7.strict('components'),
      $_euqmtby7jdud7ev7.strict('uid'),
      $_euqmtby7jdud7ev7.defaulted('events', {}),
      $_euqmtby7jdud7ev7.defaulted('apis', $_9njj9iwjjdud7eix.constant({})),
      $_euqmtby7jdud7ev7.field('eventOrder', 'eventOrder', $_6rbn18y8jdud7evc.mergeWith({
        'alloy.execute': [
          'disabling',
          'alloy.base.behaviour',
          'toggling'
        ],
        'alloy.focus': [
          'alloy.base.behaviour',
          'focusing',
          'keying'
        ],
        'alloy.system.init': [
          'alloy.base.behaviour',
          'disabling',
          'toggling',
          'representing'
        ],
        'input': [
          'alloy.base.behaviour',
          'representing',
          'streaming',
          'invalidating'
        ],
        'alloy.system.detached': [
          'alloy.base.behaviour',
          'representing'
        ]
      }), $_13hkebyejdud7ewm.anyValue()),
      $_euqmtby7jdud7ev7.option('domModification'),
      $_etkinez6jdud7ezi.snapshot('originalSpec'),
      $_euqmtby7jdud7ev7.defaulted('debug.sketcher', 'unknown')
    ]), spec);
  };
  var getUid = function (info) {
    return $_ettibkxsjdud7emz.wrap($_d587rf10yjdud7f9j.idAttr(), info.uid());
  };
  var toDefinition = function (info) {
    var base = {
      tag: info.dom().tag(),
      classes: info.dom().classes(),
      attributes: $_73qnwowyjdud7ek9.deepMerge(getUid(info), info.dom().attributes()),
      styles: info.dom().styles(),
      domChildren: $_1g2cevwsjdud7ejp.map(info.components(), function (comp) {
        return comp.element();
      })
    };
    return $_cfxlyyyijdud7ex9.nu($_73qnwowyjdud7ek9.deepMerge(base, info.dom().innerHtml().map(function (h) {
      return $_ettibkxsjdud7emz.wrap('innerHtml', h);
    }).getOr({}), info.dom().value().map(function (h) {
      return $_ettibkxsjdud7emz.wrap('value', h);
    }).getOr({})));
  };
  var toModification = function (info) {
    return info.domModification().fold(function () {
      return $_biiw3tyhjdud7ewz.nu({});
    }, $_biiw3tyhjdud7ewz.nu);
  };
  var toApis = function (info) {
    return info.apis();
  };
  var toEvents = function (info) {
    return info.events();
  };
  var $_derq1l135jdud7fm6 = {
    toInfo: toInfo,
    toDefinition: toDefinition,
    toModification: toModification,
    toApis: toApis,
    toEvents: toEvents
  };

  var add$3 = function (element, classes) {
    $_1g2cevwsjdud7ejp.each(classes, function (x) {
      $_1x3ogvynjdud7exn.add(element, x);
    });
  };
  var remove$6 = function (element, classes) {
    $_1g2cevwsjdud7ejp.each(classes, function (x) {
      $_1x3ogvynjdud7exn.remove(element, x);
    });
  };
  var toggle$3 = function (element, classes) {
    $_1g2cevwsjdud7ejp.each(classes, function (x) {
      $_1x3ogvynjdud7exn.toggle(element, x);
    });
  };
  var hasAll = function (element, classes) {
    return $_1g2cevwsjdud7ejp.forall(classes, function (clazz) {
      return $_1x3ogvynjdud7exn.has(element, clazz);
    });
  };
  var hasAny = function (element, classes) {
    return $_1g2cevwsjdud7ejp.exists(classes, function (clazz) {
      return $_1x3ogvynjdud7exn.has(element, clazz);
    });
  };
  var getNative = function (element) {
    var classList = element.dom().classList;
    var r = new Array(classList.length);
    for (var i = 0; i < classList.length; i++) {
      r[i] = classList.item(i);
    }
    return r;
  };
  var get$10 = function (element) {
    return $_fxl75vypjdud7exy.supports(element) ? getNative(element) : $_fxl75vypjdud7exy.get(element);
  };
  var $_af5dkc137jdud7fms = {
    add: add$3,
    remove: remove$6,
    toggle: toggle$3,
    hasAll: hasAll,
    hasAny: hasAny,
    get: get$10
  };

  var getChildren = function (definition) {
    if (definition.domChildren().isSome() && definition.defChildren().isSome()) {
      throw new Error('Cannot specify children and child specs! Must be one or the other.\nDef: ' + $_cfxlyyyijdud7ex9.defToStr(definition));
    } else {
      return definition.domChildren().fold(function () {
        var defChildren = definition.defChildren().getOr([]);
        return $_1g2cevwsjdud7ejp.map(defChildren, renderDef);
      }, function (domChildren) {
        return domChildren;
      });
    }
  };
  var renderToDom = function (definition) {
    var subject = $_eobgtqxfjdud7elu.fromTag(definition.tag());
    $_2vghk1xrjdud7ems.setAll(subject, definition.attributes().getOr({}));
    $_af5dkc137jdud7fms.add(subject, definition.classes().getOr([]));
    $_btgbcy103jdud7f3t.setAll(subject, definition.styles().getOr({}));
    $_1kv7pfxojdud7emm.set(subject, definition.innerHtml().getOr(''));
    var children = getChildren(definition);
    $_alr2vxxijdud7em1.append(subject, children);
    definition.value().each(function (value) {
      $_2itxad12ejdud7fgx.set(subject, value);
    });
    return subject;
  };
  var renderDef = function (spec) {
    var definition = $_cfxlyyyijdud7ex9.nu(spec);
    return renderToDom(definition);
  };
  var $_46rnsn136jdud7fmh = { renderToDom: renderToDom };

  var build = function (spec) {
    var getMe = function () {
      return me;
    };
    var systemApi = Cell(NoContextApi(getMe));
    var info = $_13hkebyejdud7ewm.getOrDie($_derq1l135jdud7fm6.toInfo($_73qnwowyjdud7ek9.deepMerge(spec, { behaviours: undefined })));
    var bBlob = $_9vg7um12vjdud7fkh.generate(spec);
    var bList = $_9q6ztw12wjdud7fkm.getBehaviours(bBlob);
    var bData = $_9q6ztw12wjdud7fkm.getData(bBlob);
    var definition = $_derq1l135jdud7fm6.toDefinition(info);
    var baseModification = { 'alloy.base.modification': $_derq1l135jdud7fm6.toModification(info) };
    var modification = $_57i0zb130jdud7fl4.combine(bData, baseModification, bList, definition).getOrDie();
    var modDefinition = $_biiw3tyhjdud7ewz.merge(definition, modification);
    var item = $_46rnsn136jdud7fmh.renderToDom(modDefinition);
    var baseEvents = { 'alloy.base.behaviour': $_derq1l135jdud7fm6.toEvents(info) };
    var events = $_e28r99132jdud7flj.combine(bData, info.eventOrder(), bList, baseEvents).getOrDie();
    var subcomponents = Cell(info.components());
    var connect = function (newApi) {
      systemApi.set(newApi);
    };
    var disconnect = function () {
      systemApi.set(NoContextApi(getMe));
    };
    var syncComponents = function () {
      var children = $_dekwe2x3jdud7ekr.children(item);
      var subs = $_1g2cevwsjdud7ejp.bind(children, function (child) {
        return systemApi.get().getByDom(child).fold(function () {
          return [];
        }, function (c) {
          return [c];
        });
      });
      subcomponents.set(subs);
    };
    var config = function (behaviour) {
      if (behaviour === $_37ypl510qjdud7f7n.apiConfig())
        return info.apis();
      var b = bData;
      var f = $_9rljuwzjdud7ekb.isFunction(b[behaviour.name()]) ? b[behaviour.name()] : function () {
        throw new Error('Could not find ' + behaviour.name() + ' in ' + $_crnojnydjdud7ewk.stringify(spec, null, 2));
      };
      return f();
    };
    var hasConfigured = function (behaviour) {
      return $_9rljuwzjdud7ekb.isFunction(bData[behaviour.name()]);
    };
    var readState = function (behaviourName) {
      return bData[behaviourName]().map(function (b) {
        return b.state.readState();
      }).getOr('not enabled');
    };
    var me = ComponentApi({
      getSystem: systemApi.get,
      config: config,
      hasConfigured: hasConfigured,
      spec: $_9njj9iwjjdud7eix.constant(spec),
      readState: readState,
      connect: connect,
      disconnect: disconnect,
      element: $_9njj9iwjjdud7eix.constant(item),
      syncComponents: syncComponents,
      components: subcomponents.get,
      events: $_9njj9iwjjdud7eix.constant(events)
    });
    return me;
  };
  var $_4n786712ujdud7fjz = { build: build };

  var isRecursive = function (component, originator, target) {
    return $_f1y1rtx9jdud7el7.eq(originator, component.element()) && !$_f1y1rtx9jdud7el7.eq(originator, target);
  };
  var $_5qg91m138jdud7fmw = {
    events: $_5xcuyiy4jdud7eur.derive([$_5xcuyiy4jdud7eur.can($_801kkqwhjdud7eiq.focus(), function (component, simulatedEvent) {
        var originator = simulatedEvent.event().originator();
        var target = simulatedEvent.event().target();
        if (isRecursive(component, originator, target)) {
          console.warn($_801kkqwhjdud7eiq.focus() + ' did not get interpreted by the desired target. ' + '\nOriginator: ' + $_d3f8kuxmjdud7emi.element(originator) + '\nTarget: ' + $_d3f8kuxmjdud7emi.element(target) + '\nCheck the ' + $_801kkqwhjdud7eiq.focus() + ' event handlers');
          return false;
        } else {
          return true;
        }
      })])
  };

  var make$1 = function (spec) {
    return spec;
  };
  var $_5ltf8m139jdud7fmz = { make: make$1 };

  var buildSubcomponents = function (spec) {
    var components = $_ettibkxsjdud7emz.readOr('components', [])(spec);
    return $_1g2cevwsjdud7ejp.map(components, build$1);
  };
  var buildFromSpec = function (userSpec) {
    var spec = $_5ltf8m139jdud7fmz.make(userSpec);
    var components = buildSubcomponents(spec);
    var completeSpec = $_73qnwowyjdud7ek9.deepMerge($_5qg91m138jdud7fmw, spec, $_ettibkxsjdud7emz.wrap('components', components));
    return Result.value($_4n786712ujdud7fjz.build(completeSpec));
  };
  var text = function (textContent) {
    var element = $_eobgtqxfjdud7elu.fromText(textContent);
    return external({ element: element });
  };
  var external = function (spec) {
    var extSpec = $_13hkebyejdud7ewm.asStructOrDie('external.component', $_13hkebyejdud7ewm.objOfOnly([
      $_euqmtby7jdud7ev7.strict('element'),
      $_euqmtby7jdud7ev7.option('uid')
    ]), spec);
    var systemApi = Cell(NoContextApi());
    var connect = function (newApi) {
      systemApi.set(newApi);
    };
    var disconnect = function () {
      systemApi.set(NoContextApi(function () {
        return me;
      }));
    };
    extSpec.uid().each(function (uid) {
      $_4mrseh10xjdud7f9b.writeOnly(extSpec.element(), uid);
    });
    var me = ComponentApi({
      getSystem: systemApi.get,
      config: Option.none,
      hasConfigured: $_9njj9iwjjdud7eix.constant(false),
      connect: connect,
      disconnect: disconnect,
      element: $_9njj9iwjjdud7eix.constant(extSpec.element()),
      spec: $_9njj9iwjjdud7eix.constant(spec),
      readState: $_9njj9iwjjdud7eix.constant('No state'),
      syncComponents: $_9njj9iwjjdud7eix.noop,
      components: $_9njj9iwjjdud7eix.constant([]),
      events: $_9njj9iwjjdud7eix.constant({})
    });
    return $_37ypl510qjdud7f7n.premade(me);
  };
  var build$1 = function (rawUserSpec) {
    return $_37ypl510qjdud7f7n.getPremade(rawUserSpec).fold(function () {
      var userSpecWithUid = $_73qnwowyjdud7ek9.deepMerge({ uid: $_4mrseh10xjdud7f9b.generate('') }, rawUserSpec);
      return buildFromSpec(userSpecWithUid).getOrDie();
    }, function (prebuilt) {
      return prebuilt;
    });
  };
  var $_ap2ej712tjdud7fjl = {
    build: build$1,
    premade: $_37ypl510qjdud7f7n.premade,
    external: external,
    text: text
  };

  var hoverEvent = 'alloy.item-hover';
  var focusEvent = 'alloy.item-focus';
  var onHover = function (item) {
    if ($_25580rytjdud7ey7.search(item.element()).isNone() || Focusing.isFocused(item)) {
      if (!Focusing.isFocused(item))
        Focusing.focus(item);
      $_98da6jwgjdud7eil.emitWith(item, hoverEvent, { item: item });
    }
  };
  var onFocus = function (item) {
    $_98da6jwgjdud7eil.emitWith(item, focusEvent, { item: item });
  };
  var $_8ru1bo13djdud7fnf = {
    hover: $_9njj9iwjjdud7eix.constant(hoverEvent),
    focus: $_9njj9iwjjdud7eix.constant(focusEvent),
    onHover: onHover,
    onFocus: onFocus
  };

  var builder = function (info) {
    return {
      dom: $_73qnwowyjdud7ek9.deepMerge(info.dom(), { attributes: { role: info.toggling().isSome() ? 'menuitemcheckbox' : 'menuitem' } }),
      behaviours: $_73qnwowyjdud7ek9.deepMerge($_ax1gfoy2jdud7eu7.derive([
        info.toggling().fold(Toggling.revoke, function (tConfig) {
          return Toggling.config($_73qnwowyjdud7ek9.deepMerge({ aria: { mode: 'checked' } }, tConfig));
        }),
        Focusing.config({
          ignore: info.ignoreFocus(),
          onFocus: function (component) {
            $_8ru1bo13djdud7fnf.onFocus(component);
          }
        }),
        Keying.config({ mode: 'execution' }),
        me.config({
          store: {
            mode: 'memory',
            initialValue: info.data()
          }
        })
      ]), info.itemBehaviours()),
      events: $_5xcuyiy4jdud7eur.derive([
        $_5xcuyiy4jdud7eur.runWithTarget($_801kkqwhjdud7eiq.tapOrClick(), $_98da6jwgjdud7eil.emitExecute),
        $_5xcuyiy4jdud7eur.cutter($_brmbwvwijdud7eiu.mousedown()),
        $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.mouseover(), $_8ru1bo13djdud7fnf.onHover),
        $_5xcuyiy4jdud7eur.run($_801kkqwhjdud7eiq.focusItem(), Focusing.focus)
      ]),
      components: info.components(),
      domModification: info.domModification()
    };
  };
  var schema$10 = [
    $_euqmtby7jdud7ev7.strict('data'),
    $_euqmtby7jdud7ev7.strict('components'),
    $_euqmtby7jdud7ev7.strict('dom'),
    $_euqmtby7jdud7ev7.option('toggling'),
    $_euqmtby7jdud7ev7.defaulted('itemBehaviours', {}),
    $_euqmtby7jdud7ev7.defaulted('ignoreFocus', false),
    $_euqmtby7jdud7ev7.defaulted('domModification', {}),
    $_etkinez6jdud7ezi.output('builder', builder)
  ];

  var builder$1 = function (detail) {
    return {
      dom: detail.dom(),
      components: detail.components(),
      events: $_5xcuyiy4jdud7eur.derive([$_5xcuyiy4jdud7eur.stopper($_801kkqwhjdud7eiq.focusItem())])
    };
  };
  var schema$11 = [
    $_euqmtby7jdud7ev7.strict('dom'),
    $_euqmtby7jdud7ev7.strict('components'),
    $_etkinez6jdud7ezi.output('builder', builder$1)
  ];

  var owner$2 = 'item-widget';
  var partTypes = [$_7938qf10vjdud7f8n.required({
      name: 'widget',
      overrides: function (detail) {
        return {
          behaviours: $_ax1gfoy2jdud7eu7.derive([me.config({
              store: {
                mode: 'manual',
                getValue: function (component) {
                  return detail.data();
                },
                setValue: function () {
                }
              }
            })])
        };
      }
    })];
  var $_bqteuv13gjdud7fny = {
    owner: $_9njj9iwjjdud7eix.constant(owner$2),
    parts: $_9njj9iwjjdud7eix.constant(partTypes)
  };

  var builder$2 = function (info) {
    var subs = $_436kgb10tjdud7f7y.substitutes($_bqteuv13gjdud7fny.owner(), info, $_bqteuv13gjdud7fny.parts());
    var components = $_436kgb10tjdud7f7y.components($_bqteuv13gjdud7fny.owner(), info, subs.internals());
    var focusWidget = function (component) {
      return $_436kgb10tjdud7f7y.getPart(component, info, 'widget').map(function (widget) {
        Keying.focusIn(widget);
        return widget;
      });
    };
    var onHorizontalArrow = function (component, simulatedEvent) {
      return $_ddk3fu108jdud7f4o.inside(simulatedEvent.event().target()) ? Option.none() : function () {
        if (info.autofocus()) {
          simulatedEvent.setSource(component.element());
          return Option.none();
        } else {
          return Option.none();
        }
      }();
    };
    return $_73qnwowyjdud7ek9.deepMerge({
      dom: info.dom(),
      components: components,
      domModification: info.domModification(),
      events: $_5xcuyiy4jdud7eur.derive([
        $_5xcuyiy4jdud7eur.runOnExecute(function (component, simulatedEvent) {
          focusWidget(component).each(function (widget) {
            simulatedEvent.stop();
          });
        }),
        $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.mouseover(), $_8ru1bo13djdud7fnf.onHover),
        $_5xcuyiy4jdud7eur.run($_801kkqwhjdud7eiq.focusItem(), function (component, simulatedEvent) {
          if (info.autofocus())
            focusWidget(component);
          else
            Focusing.focus(component);
        })
      ]),
      behaviours: $_ax1gfoy2jdud7eu7.derive([
        me.config({
          store: {
            mode: 'memory',
            initialValue: info.data()
          }
        }),
        Focusing.config({
          onFocus: function (component) {
            $_8ru1bo13djdud7fnf.onFocus(component);
          }
        }),
        Keying.config({
          mode: 'special',
          onLeft: onHorizontalArrow,
          onRight: onHorizontalArrow,
          onEscape: function (component, simulatedEvent) {
            if (!Focusing.isFocused(component) && !info.autofocus()) {
              Focusing.focus(component);
              return Option.some(true);
            } else if (info.autofocus()) {
              simulatedEvent.setSource(component.element());
              return Option.none();
            } else {
              return Option.none();
            }
          }
        })
      ])
    });
  };
  var schema$12 = [
    $_euqmtby7jdud7ev7.strict('uid'),
    $_euqmtby7jdud7ev7.strict('data'),
    $_euqmtby7jdud7ev7.strict('components'),
    $_euqmtby7jdud7ev7.strict('dom'),
    $_euqmtby7jdud7ev7.defaulted('autofocus', false),
    $_euqmtby7jdud7ev7.defaulted('domModification', {}),
    $_436kgb10tjdud7f7y.defaultUidsSchema($_bqteuv13gjdud7fny.parts()),
    $_etkinez6jdud7ezi.output('builder', builder$2)
  ];

  var itemSchema$1 = $_13hkebyejdud7ewm.choose('type', {
    widget: schema$12,
    item: schema$10,
    separator: schema$11
  });
  var configureGrid = function (detail, movementInfo) {
    return {
      mode: 'flatgrid',
      selector: '.' + detail.markers().item(),
      initSize: {
        numColumns: movementInfo.initSize().numColumns(),
        numRows: movementInfo.initSize().numRows()
      },
      focusManager: detail.focusManager()
    };
  };
  var configureMenu = function (detail, movementInfo) {
    return {
      mode: 'menu',
      selector: '.' + detail.markers().item(),
      moveOnTab: movementInfo.moveOnTab(),
      focusManager: detail.focusManager()
    };
  };
  var parts = [$_7938qf10vjdud7f8n.group({
      factory: {
        sketch: function (spec) {
          var itemInfo = $_13hkebyejdud7ewm.asStructOrDie('menu.spec item', itemSchema$1, spec);
          return itemInfo.builder()(itemInfo);
        }
      },
      name: 'items',
      unit: 'item',
      defaults: function (detail, u) {
        var fallbackUid = $_4mrseh10xjdud7f9b.generate('');
        return $_73qnwowyjdud7ek9.deepMerge({ uid: fallbackUid }, u);
      },
      overrides: function (detail, u) {
        return {
          type: u.type,
          ignoreFocus: detail.fakeFocus(),
          domModification: { classes: [detail.markers().item()] }
        };
      }
    })];
  var schema$13 = [
    $_euqmtby7jdud7ev7.strict('value'),
    $_euqmtby7jdud7ev7.strict('items'),
    $_euqmtby7jdud7ev7.strict('dom'),
    $_euqmtby7jdud7ev7.strict('components'),
    $_euqmtby7jdud7ev7.defaulted('eventOrder', {}),
    $_c7jpu210ojdud7f7a.field('menuBehaviours', [
      Highlighting,
      me,
      Composing,
      Keying
    ]),
    $_euqmtby7jdud7ev7.defaultedOf('movement', {
      mode: 'menu',
      moveOnTab: true
    }, $_13hkebyejdud7ewm.choose('mode', {
      grid: [
        $_etkinez6jdud7ezi.initSize(),
        $_etkinez6jdud7ezi.output('config', configureGrid)
      ],
      menu: [
        $_euqmtby7jdud7ev7.defaulted('moveOnTab', true),
        $_etkinez6jdud7ezi.output('config', configureMenu)
      ]
    })),
    $_etkinez6jdud7ezi.itemMarkers(),
    $_euqmtby7jdud7ev7.defaulted('fakeFocus', false),
    $_euqmtby7jdud7ev7.defaulted('focusManager', $_cic9p1zrjdud7f2l.dom()),
    $_etkinez6jdud7ezi.onHandler('onHighlight')
  ];
  var $_8okyr013bjdud7fn2 = {
    name: $_9njj9iwjjdud7eix.constant('Menu'),
    schema: $_9njj9iwjjdud7eix.constant(schema$13),
    parts: $_9njj9iwjjdud7eix.constant(parts)
  };

  var focusEvent$1 = 'alloy.menu-focus';
  var $_4itv8s13ijdud7fo7 = { focus: $_9njj9iwjjdud7eix.constant(focusEvent$1) };

  var make$2 = function (detail, components, spec, externals) {
    return $_73qnwowyjdud7ek9.deepMerge({
      dom: $_73qnwowyjdud7ek9.deepMerge(detail.dom(), { attributes: { role: 'menu' } }),
      uid: detail.uid(),
      behaviours: $_73qnwowyjdud7ek9.deepMerge($_ax1gfoy2jdud7eu7.derive([
        Highlighting.config({
          highlightClass: detail.markers().selectedItem(),
          itemClass: detail.markers().item(),
          onHighlight: detail.onHighlight()
        }),
        me.config({
          store: {
            mode: 'memory',
            initialValue: detail.value()
          }
        }),
        Composing.config({ find: $_9njj9iwjjdud7eix.identity }),
        Keying.config(detail.movement().config()(detail, detail.movement()))
      ]), $_c7jpu210ojdud7f7a.get(detail.menuBehaviours())),
      events: $_5xcuyiy4jdud7eur.derive([
        $_5xcuyiy4jdud7eur.run($_8ru1bo13djdud7fnf.focus(), function (menu, simulatedEvent) {
          var event = simulatedEvent.event();
          menu.getSystem().getByDom(event.target()).each(function (item) {
            Highlighting.highlight(menu, item);
            simulatedEvent.stop();
            $_98da6jwgjdud7eil.emitWith(menu, $_4itv8s13ijdud7fo7.focus(), {
              menu: menu,
              item: item
            });
          });
        }),
        $_5xcuyiy4jdud7eur.run($_8ru1bo13djdud7fnf.hover(), function (menu, simulatedEvent) {
          var item = simulatedEvent.event().item();
          Highlighting.highlight(menu, item);
        })
      ]),
      components: components,
      eventOrder: detail.eventOrder()
    });
  };
  var $_99di413hjdud7fo2 = { make: make$2 };

  var Menu = $_3inyq310pjdud7f7f.composite({
    name: 'Menu',
    configFields: $_8okyr013bjdud7fn2.schema(),
    partFields: $_8okyr013bjdud7fn2.parts(),
    factory: $_99di413hjdud7fo2.make
  });

  var preserve$2 = function (f, container) {
    var ownerDoc = $_dekwe2x3jdud7ekr.owner(container);
    var refocus = $_25580rytjdud7ey7.active(ownerDoc).bind(function (focused) {
      var hasFocus = function (elem) {
        return $_f1y1rtx9jdud7el7.eq(focused, elem);
      };
      return hasFocus(container) ? Option.some(container) : $_4j5kdsyvjdud7eyd.descendant(container, hasFocus);
    });
    var result = f(container);
    refocus.each(function (oldFocus) {
      $_25580rytjdud7ey7.active(ownerDoc).filter(function (newFocus) {
        return $_f1y1rtx9jdud7el7.eq(newFocus, oldFocus);
      }).orThunk(function () {
        $_25580rytjdud7ey7.focus(oldFocus);
      });
    });
    return result;
  };
  var $_7yrff213mjdud7fol = { preserve: preserve$2 };

  var set$7 = function (component, replaceConfig, replaceState, data) {
    $_fesilqx1jdud7ekf.detachChildren(component);
    $_7yrff213mjdud7fol.preserve(function () {
      var children = $_1g2cevwsjdud7ejp.map(data, component.getSystem().build);
      $_1g2cevwsjdud7ejp.each(children, function (l) {
        $_fesilqx1jdud7ekf.attach(component, l);
      });
    }, component.element());
  };
  var insert = function (component, replaceConfig, insertion, childSpec) {
    var child = component.getSystem().build(childSpec);
    $_fesilqx1jdud7ekf.attachWith(component, child, insertion);
  };
  var append$2 = function (component, replaceConfig, replaceState, appendee) {
    insert(component, replaceConfig, $_ftkbb5x2jdud7ekp.append, appendee);
  };
  var prepend$2 = function (component, replaceConfig, replaceState, prependee) {
    insert(component, replaceConfig, $_ftkbb5x2jdud7ekp.prepend, prependee);
  };
  var remove$7 = function (component, replaceConfig, replaceState, removee) {
    var children = contents(component, replaceConfig);
    var foundChild = $_1g2cevwsjdud7ejp.find(children, function (child) {
      return $_f1y1rtx9jdud7el7.eq(removee.element(), child.element());
    });
    foundChild.each($_fesilqx1jdud7ekf.detach);
  };
  var contents = function (component, replaceConfig) {
    return component.components();
  };
  var $_1r1wx913ljdud7fog = {
    append: append$2,
    prepend: prepend$2,
    remove: remove$7,
    set: set$7,
    contents: contents
  };

  var Replacing = $_ax1gfoy2jdud7eu7.create({
    fields: [],
    name: 'replacing',
    apis: $_1r1wx913ljdud7fog
  });

  var transpose = function (obj) {
    return $_2dykn0x0jdud7ekc.tupleMap(obj, function (v, k) {
      return {
        k: v,
        v: k
      };
    });
  };
  var trace = function (items, byItem, byMenu, finish) {
    return $_ettibkxsjdud7emz.readOptFrom(byMenu, finish).bind(function (triggerItem) {
      return $_ettibkxsjdud7emz.readOptFrom(items, triggerItem).bind(function (triggerMenu) {
        var rest = trace(items, byItem, byMenu, triggerMenu);
        return Option.some([triggerMenu].concat(rest));
      });
    }).getOr([]);
  };
  var generate$5 = function (menus, expansions) {
    var items = {};
    $_2dykn0x0jdud7ekc.each(menus, function (menuItems, menu) {
      $_1g2cevwsjdud7ejp.each(menuItems, function (item) {
        items[item] = menu;
      });
    });
    var byItem = expansions;
    var byMenu = transpose(expansions);
    var menuPaths = $_2dykn0x0jdud7ekc.map(byMenu, function (triggerItem, submenu) {
      return [submenu].concat(trace(items, byItem, byMenu, submenu));
    });
    return $_2dykn0x0jdud7ekc.map(items, function (path) {
      return $_ettibkxsjdud7emz.readOptFrom(menuPaths, path).getOr([path]);
    });
  };
  var $_41e4h513pjdud7fpr = { generate: generate$5 };

  function LayeredState () {
    var expansions = Cell({});
    var menus = Cell({});
    var paths = Cell({});
    var primary = Cell(Option.none());
    var toItemValues = Cell($_9njj9iwjjdud7eix.constant([]));
    var clear = function () {
      expansions.set({});
      menus.set({});
      paths.set({});
      primary.set(Option.none());
    };
    var isClear = function () {
      return primary.get().isNone();
    };
    var setContents = function (sPrimary, sMenus, sExpansions, sToItemValues) {
      primary.set(Option.some(sPrimary));
      expansions.set(sExpansions);
      menus.set(sMenus);
      toItemValues.set(sToItemValues);
      var menuValues = sToItemValues(sMenus);
      var sPaths = $_41e4h513pjdud7fpr.generate(menuValues, sExpansions);
      paths.set(sPaths);
    };
    var expand = function (itemValue) {
      return $_ettibkxsjdud7emz.readOptFrom(expansions.get(), itemValue).map(function (menu) {
        var current = $_ettibkxsjdud7emz.readOptFrom(paths.get(), itemValue).getOr([]);
        return [menu].concat(current);
      });
    };
    var collapse = function (itemValue) {
      return $_ettibkxsjdud7emz.readOptFrom(paths.get(), itemValue).bind(function (path) {
        return path.length > 1 ? Option.some(path.slice(1)) : Option.none();
      });
    };
    var refresh = function (itemValue) {
      return $_ettibkxsjdud7emz.readOptFrom(paths.get(), itemValue);
    };
    var lookupMenu = function (menuValue) {
      return $_ettibkxsjdud7emz.readOptFrom(menus.get(), menuValue);
    };
    var otherMenus = function (path) {
      var menuValues = toItemValues.get()(menus.get());
      return $_1g2cevwsjdud7ejp.difference($_2dykn0x0jdud7ekc.keys(menuValues), path);
    };
    var getPrimary = function () {
      return primary.get().bind(lookupMenu);
    };
    var getMenus = function () {
      return menus.get();
    };
    return {
      setContents: setContents,
      expand: expand,
      refresh: refresh,
      collapse: collapse,
      lookupMenu: lookupMenu,
      otherMenus: otherMenus,
      getPrimary: getPrimary,
      getMenus: getMenus,
      clear: clear,
      isClear: isClear
    };
  }

  var make$3 = function (detail, rawUiSpec) {
    var buildMenus = function (container, menus) {
      return $_2dykn0x0jdud7ekc.map(menus, function (spec, name) {
        var data = Menu.sketch($_73qnwowyjdud7ek9.deepMerge(spec, {
          value: name,
          items: spec.items,
          markers: $_ettibkxsjdud7emz.narrow(rawUiSpec.markers, [
            'item',
            'selectedItem'
          ]),
          fakeFocus: detail.fakeFocus(),
          onHighlight: detail.onHighlight(),
          focusManager: detail.fakeFocus() ? $_cic9p1zrjdud7f2l.highlights() : $_cic9p1zrjdud7f2l.dom()
        }));
        return container.getSystem().build(data);
      });
    };
    var state = LayeredState();
    var setup = function (container) {
      var componentMap = buildMenus(container, detail.data().menus());
      state.setContents(detail.data().primary(), componentMap, detail.data().expansions(), function (sMenus) {
        return toMenuValues(container, sMenus);
      });
      return state.getPrimary();
    };
    var getItemValue = function (item) {
      return me.getValue(item).value;
    };
    var toMenuValues = function (container, sMenus) {
      return $_2dykn0x0jdud7ekc.map(detail.data().menus(), function (data, menuName) {
        return $_1g2cevwsjdud7ejp.bind(data.items, function (item) {
          return item.type === 'separator' ? [] : [item.data.value];
        });
      });
    };
    var setActiveMenu = function (container, menu) {
      Highlighting.highlight(container, menu);
      Highlighting.getHighlighted(menu).orThunk(function () {
        return Highlighting.getFirst(menu);
      }).each(function (item) {
        $_98da6jwgjdud7eil.dispatch(container, item.element(), $_801kkqwhjdud7eiq.focusItem());
      });
    };
    var getMenus = function (state, menuValues) {
      return $_ak7xq9y0jdud7eu4.cat($_1g2cevwsjdud7ejp.map(menuValues, state.lookupMenu));
    };
    var updateMenuPath = function (container, state, path) {
      return Option.from(path[0]).bind(state.lookupMenu).map(function (activeMenu) {
        var rest = getMenus(state, path.slice(1));
        $_1g2cevwsjdud7ejp.each(rest, function (r) {
          $_1x3ogvynjdud7exn.add(r.element(), detail.markers().backgroundMenu());
        });
        if (!$_1tyeizxjjdud7em4.inBody(activeMenu.element())) {
          Replacing.append(container, $_ap2ej712tjdud7fjl.premade(activeMenu));
        }
        $_af5dkc137jdud7fms.remove(activeMenu.element(), [detail.markers().backgroundMenu()]);
        setActiveMenu(container, activeMenu);
        var others = getMenus(state, state.otherMenus(path));
        $_1g2cevwsjdud7ejp.each(others, function (o) {
          $_af5dkc137jdud7fms.remove(o.element(), [detail.markers().backgroundMenu()]);
          if (!detail.stayInDom())
            Replacing.remove(container, o);
        });
        return activeMenu;
      });
    };
    var expandRight = function (container, item) {
      var value = getItemValue(item);
      return state.expand(value).bind(function (path) {
        Option.from(path[0]).bind(state.lookupMenu).each(function (activeMenu) {
          if (!$_1tyeizxjjdud7em4.inBody(activeMenu.element())) {
            Replacing.append(container, $_ap2ej712tjdud7fjl.premade(activeMenu));
          }
          detail.onOpenSubmenu()(container, item, activeMenu);
          Highlighting.highlightFirst(activeMenu);
        });
        return updateMenuPath(container, state, path);
      });
    };
    var collapseLeft = function (container, item) {
      var value = getItemValue(item);
      return state.collapse(value).bind(function (path) {
        return updateMenuPath(container, state, path).map(function (activeMenu) {
          detail.onCollapseMenu()(container, item, activeMenu);
          return activeMenu;
        });
      });
    };
    var updateView = function (container, item) {
      var value = getItemValue(item);
      return state.refresh(value).bind(function (path) {
        return updateMenuPath(container, state, path);
      });
    };
    var onRight = function (container, item) {
      return $_ddk3fu108jdud7f4o.inside(item.element()) ? Option.none() : expandRight(container, item);
    };
    var onLeft = function (container, item) {
      return $_ddk3fu108jdud7f4o.inside(item.element()) ? Option.none() : collapseLeft(container, item);
    };
    var onEscape = function (container, item) {
      return collapseLeft(container, item).orThunk(function () {
        return detail.onEscape()(container, item);
      });
    };
    var keyOnItem = function (f) {
      return function (container, simulatedEvent) {
        return $_a3quyizxjdud7f3e.closest(simulatedEvent.getSource(), '.' + detail.markers().item()).bind(function (target) {
          return container.getSystem().getByDom(target).bind(function (item) {
            return f(container, item);
          });
        });
      };
    };
    var events = $_5xcuyiy4jdud7eur.derive([
      $_5xcuyiy4jdud7eur.run($_4itv8s13ijdud7fo7.focus(), function (sandbox, simulatedEvent) {
        var menu = simulatedEvent.event().menu();
        Highlighting.highlight(sandbox, menu);
      }),
      $_5xcuyiy4jdud7eur.runOnExecute(function (sandbox, simulatedEvent) {
        var target = simulatedEvent.event().target();
        return sandbox.getSystem().getByDom(target).bind(function (item) {
          var itemValue = getItemValue(item);
          if (itemValue.indexOf('collapse-item') === 0) {
            return collapseLeft(sandbox, item);
          }
          return expandRight(sandbox, item).orThunk(function () {
            return detail.onExecute()(sandbox, item);
          });
        });
      }),
      $_5xcuyiy4jdud7eur.runOnAttached(function (container, simulatedEvent) {
        setup(container).each(function (primary) {
          Replacing.append(container, $_ap2ej712tjdud7fjl.premade(primary));
          if (detail.openImmediately()) {
            setActiveMenu(container, primary);
            detail.onOpenMenu()(container, primary);
          }
        });
      })
    ].concat(detail.navigateOnHover() ? [$_5xcuyiy4jdud7eur.run($_8ru1bo13djdud7fnf.hover(), function (sandbox, simulatedEvent) {
        var item = simulatedEvent.event().item();
        updateView(sandbox, item);
        expandRight(sandbox, item);
        detail.onHover()(sandbox, item);
      })] : []));
    var collapseMenuApi = function (container) {
      Highlighting.getHighlighted(container).each(function (currentMenu) {
        Highlighting.getHighlighted(currentMenu).each(function (currentItem) {
          collapseLeft(container, currentItem);
        });
      });
    };
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      behaviours: $_73qnwowyjdud7ek9.deepMerge($_ax1gfoy2jdud7eu7.derive([
        Keying.config({
          mode: 'special',
          onRight: keyOnItem(onRight),
          onLeft: keyOnItem(onLeft),
          onEscape: keyOnItem(onEscape),
          focusIn: function (container, keyInfo) {
            state.getPrimary().each(function (primary) {
              $_98da6jwgjdud7eil.dispatch(container, primary.element(), $_801kkqwhjdud7eiq.focusItem());
            });
          }
        }),
        Highlighting.config({
          highlightClass: detail.markers().selectedMenu(),
          itemClass: detail.markers().menu()
        }),
        Composing.config({
          find: function (container) {
            return Highlighting.getHighlighted(container);
          }
        }),
        Replacing.config({})
      ]), $_c7jpu210ojdud7f7a.get(detail.tmenuBehaviours())),
      eventOrder: detail.eventOrder(),
      apis: { collapseMenu: collapseMenuApi },
      events: events
    };
  };
  var $_5tcqz613njdud7fou = {
    make: make$3,
    collapseItem: $_9njj9iwjjdud7eix.constant('collapse-item')
  };

  var tieredData = function (primary, menus, expansions) {
    return {
      primary: primary,
      menus: menus,
      expansions: expansions
    };
  };
  var singleData = function (name, menu) {
    return {
      primary: name,
      menus: $_ettibkxsjdud7emz.wrap(name, menu),
      expansions: {}
    };
  };
  var collapseItem = function (text) {
    return {
      value: $_3k9wwu10rjdud7f7t.generate($_5tcqz613njdud7fou.collapseItem()),
      text: text
    };
  };
  var TieredMenu = $_3inyq310pjdud7f7f.single({
    name: 'TieredMenu',
    configFields: [
      $_etkinez6jdud7ezi.onStrictKeyboardHandler('onExecute'),
      $_etkinez6jdud7ezi.onStrictKeyboardHandler('onEscape'),
      $_etkinez6jdud7ezi.onStrictHandler('onOpenMenu'),
      $_etkinez6jdud7ezi.onStrictHandler('onOpenSubmenu'),
      $_etkinez6jdud7ezi.onHandler('onCollapseMenu'),
      $_euqmtby7jdud7ev7.defaulted('openImmediately', true),
      $_euqmtby7jdud7ev7.strictObjOf('data', [
        $_euqmtby7jdud7ev7.strict('primary'),
        $_euqmtby7jdud7ev7.strict('menus'),
        $_euqmtby7jdud7ev7.strict('expansions')
      ]),
      $_euqmtby7jdud7ev7.defaulted('fakeFocus', false),
      $_etkinez6jdud7ezi.onHandler('onHighlight'),
      $_etkinez6jdud7ezi.onHandler('onHover'),
      $_etkinez6jdud7ezi.tieredMenuMarkers(),
      $_euqmtby7jdud7ev7.strict('dom'),
      $_euqmtby7jdud7ev7.defaulted('navigateOnHover', true),
      $_euqmtby7jdud7ev7.defaulted('stayInDom', false),
      $_c7jpu210ojdud7f7a.field('tmenuBehaviours', [
        Keying,
        Highlighting,
        Composing,
        Replacing
      ]),
      $_euqmtby7jdud7ev7.defaulted('eventOrder', {})
    ],
    apis: {
      collapseMenu: function (apis, tmenu) {
        apis.collapseMenu(tmenu);
      }
    },
    factory: $_5tcqz613njdud7fou.make,
    extraApis: {
      tieredData: tieredData,
      singleData: singleData,
      collapseItem: collapseItem
    }
  });

  var findRoute = function (component, transConfig, transState, route) {
    return $_ettibkxsjdud7emz.readOptFrom(transConfig.routes(), route.start()).map($_9njj9iwjjdud7eix.apply).bind(function (sConfig) {
      return $_ettibkxsjdud7emz.readOptFrom(sConfig, route.destination()).map($_9njj9iwjjdud7eix.apply);
    });
  };
  var getTransition = function (comp, transConfig, transState) {
    var route = getCurrentRoute(comp, transConfig, transState);
    return route.bind(function (r) {
      return getTransitionOf(comp, transConfig, transState, r);
    });
  };
  var getTransitionOf = function (comp, transConfig, transState, route) {
    return findRoute(comp, transConfig, transState, route).bind(function (r) {
      return r.transition().map(function (t) {
        return {
          transition: $_9njj9iwjjdud7eix.constant(t),
          route: $_9njj9iwjjdud7eix.constant(r)
        };
      });
    });
  };
  var disableTransition = function (comp, transConfig, transState) {
    getTransition(comp, transConfig, transState).each(function (routeTransition) {
      var t = routeTransition.transition();
      $_1x3ogvynjdud7exn.remove(comp.element(), t.transitionClass());
      $_2vghk1xrjdud7ems.remove(comp.element(), transConfig.destinationAttr());
    });
  };
  var getNewRoute = function (comp, transConfig, transState, destination) {
    return {
      start: $_9njj9iwjjdud7eix.constant($_2vghk1xrjdud7ems.get(comp.element(), transConfig.stateAttr())),
      destination: $_9njj9iwjjdud7eix.constant(destination)
    };
  };
  var getCurrentRoute = function (comp, transConfig, transState) {
    var el = comp.element();
    return $_2vghk1xrjdud7ems.has(el, transConfig.destinationAttr()) ? Option.some({
      start: $_9njj9iwjjdud7eix.constant($_2vghk1xrjdud7ems.get(comp.element(), transConfig.stateAttr())),
      destination: $_9njj9iwjjdud7eix.constant($_2vghk1xrjdud7ems.get(comp.element(), transConfig.destinationAttr()))
    }) : Option.none();
  };
  var jumpTo = function (comp, transConfig, transState, destination) {
    disableTransition(comp, transConfig, transState);
    if ($_2vghk1xrjdud7ems.has(comp.element(), transConfig.stateAttr()) && $_2vghk1xrjdud7ems.get(comp.element(), transConfig.stateAttr()) !== destination)
      transConfig.onFinish()(comp, destination);
    $_2vghk1xrjdud7ems.set(comp.element(), transConfig.stateAttr(), destination);
  };
  var fasttrack = function (comp, transConfig, transState, destination) {
    if ($_2vghk1xrjdud7ems.has(comp.element(), transConfig.destinationAttr())) {
      $_2vghk1xrjdud7ems.set(comp.element(), transConfig.stateAttr(), $_2vghk1xrjdud7ems.get(comp.element(), transConfig.destinationAttr()));
      $_2vghk1xrjdud7ems.remove(comp.element(), transConfig.destinationAttr());
    }
  };
  var progressTo = function (comp, transConfig, transState, destination) {
    fasttrack(comp, transConfig, transState, destination);
    var route = getNewRoute(comp, transConfig, transState, destination);
    getTransitionOf(comp, transConfig, transState, route).fold(function () {
      jumpTo(comp, transConfig, transState, destination);
    }, function (routeTransition) {
      disableTransition(comp, transConfig, transState);
      var t = routeTransition.transition();
      $_1x3ogvynjdud7exn.add(comp.element(), t.transitionClass());
      $_2vghk1xrjdud7ems.set(comp.element(), transConfig.destinationAttr(), destination);
    });
  };
  var getState = function (comp, transConfig, transState) {
    var e = comp.element();
    return $_2vghk1xrjdud7ems.has(e, transConfig.stateAttr()) ? Option.some($_2vghk1xrjdud7ems.get(e, transConfig.stateAttr())) : Option.none();
  };
  var $_7wpzrk13sjdud7fq5 = {
    findRoute: findRoute,
    disableTransition: disableTransition,
    getCurrentRoute: getCurrentRoute,
    jumpTo: jumpTo,
    progressTo: progressTo,
    getState: getState
  };

  var events$8 = function (transConfig, transState) {
    return $_5xcuyiy4jdud7eur.derive([
      $_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.transitionend(), function (component, simulatedEvent) {
        var raw = simulatedEvent.event().raw();
        $_7wpzrk13sjdud7fq5.getCurrentRoute(component, transConfig, transState).each(function (route) {
          $_7wpzrk13sjdud7fq5.findRoute(component, transConfig, transState, route).each(function (rInfo) {
            rInfo.transition().each(function (rTransition) {
              if (raw.propertyName === rTransition.property()) {
                $_7wpzrk13sjdud7fq5.jumpTo(component, transConfig, transState, route.destination());
                transConfig.onTransition()(component, route);
              }
            });
          });
        });
      }),
      $_5xcuyiy4jdud7eur.runOnAttached(function (comp, se) {
        $_7wpzrk13sjdud7fq5.jumpTo(comp, transConfig, transState, transConfig.initialState());
      })
    ]);
  };
  var $_4zcx6q13rjdud7fq3 = { events: events$8 };

  var TransitionSchema = [
    $_euqmtby7jdud7ev7.defaulted('destinationAttr', 'data-transitioning-destination'),
    $_euqmtby7jdud7ev7.defaulted('stateAttr', 'data-transitioning-state'),
    $_euqmtby7jdud7ev7.strict('initialState'),
    $_etkinez6jdud7ezi.onHandler('onTransition'),
    $_etkinez6jdud7ezi.onHandler('onFinish'),
    $_euqmtby7jdud7ev7.strictOf('routes', $_13hkebyejdud7ewm.setOf(Result.value, $_13hkebyejdud7ewm.setOf(Result.value, $_13hkebyejdud7ewm.objOfOnly([$_euqmtby7jdud7ev7.optionObjOfOnly('transition', [
        $_euqmtby7jdud7ev7.strict('property'),
        $_euqmtby7jdud7ev7.strict('transitionClass')
      ])]))))
  ];

  var createRoutes = function (routes) {
    var r = {};
    $_2dykn0x0jdud7ekc.each(routes, function (v, k) {
      var waypoints = k.split('<->');
      r[waypoints[0]] = $_ettibkxsjdud7emz.wrap(waypoints[1], v);
      r[waypoints[1]] = $_ettibkxsjdud7emz.wrap(waypoints[0], v);
    });
    return r;
  };
  var createBistate = function (first, second, transitions) {
    return $_ettibkxsjdud7emz.wrapAll([
      {
        key: first,
        value: $_ettibkxsjdud7emz.wrap(second, transitions)
      },
      {
        key: second,
        value: $_ettibkxsjdud7emz.wrap(first, transitions)
      }
    ]);
  };
  var createTristate = function (first, second, third, transitions) {
    return $_ettibkxsjdud7emz.wrapAll([
      {
        key: first,
        value: $_ettibkxsjdud7emz.wrapAll([
          {
            key: second,
            value: transitions
          },
          {
            key: third,
            value: transitions
          }
        ])
      },
      {
        key: second,
        value: $_ettibkxsjdud7emz.wrapAll([
          {
            key: first,
            value: transitions
          },
          {
            key: third,
            value: transitions
          }
        ])
      },
      {
        key: third,
        value: $_ettibkxsjdud7emz.wrapAll([
          {
            key: first,
            value: transitions
          },
          {
            key: second,
            value: transitions
          }
        ])
      }
    ]);
  };
  var Transitioning = $_ax1gfoy2jdud7eu7.create({
    fields: TransitionSchema,
    name: 'transitioning',
    active: $_4zcx6q13rjdud7fq3,
    apis: $_7wpzrk13sjdud7fq5,
    extra: {
      createRoutes: createRoutes,
      createBistate: createBistate,
      createTristate: createTristate
    }
  });

  var scrollable = $_5qzh4bzejdud7f0y.resolve('scrollable');
  var register = function (element) {
    $_1x3ogvynjdud7exn.add(element, scrollable);
  };
  var deregister = function (element) {
    $_1x3ogvynjdud7exn.remove(element, scrollable);
  };
  var $_bhtyzh13ujdud7fqk = {
    register: register,
    deregister: deregister,
    scrollable: $_9njj9iwjjdud7eix.constant(scrollable)
  };

  var getValue$4 = function (item) {
    return $_ettibkxsjdud7emz.readOptFrom(item, 'format').getOr(item.title);
  };
  var convert$1 = function (formats, memMenuThunk) {
    var mainMenu = makeMenu('Styles', [].concat($_1g2cevwsjdud7ejp.map(formats.items, function (k) {
      return makeItem(getValue$4(k), k.title, k.isSelected(), k.getPreview(), $_ettibkxsjdud7emz.hasKey(formats.expansions, getValue$4(k)));
    })), memMenuThunk, false);
    var submenus = $_2dykn0x0jdud7ekc.map(formats.menus, function (menuItems, menuName) {
      var items = $_1g2cevwsjdud7ejp.map(menuItems, function (item) {
        return makeItem(getValue$4(item), item.title, item.isSelected !== undefined ? item.isSelected() : false, item.getPreview !== undefined ? item.getPreview() : '', $_ettibkxsjdud7emz.hasKey(formats.expansions, getValue$4(item)));
      });
      return makeMenu(menuName, items, memMenuThunk, true);
    });
    var menus = $_73qnwowyjdud7ek9.deepMerge(submenus, $_ettibkxsjdud7emz.wrap('styles', mainMenu));
    var tmenu = TieredMenu.tieredData('styles', menus, formats.expansions);
    return { tmenu: tmenu };
  };
  var makeItem = function (value, text, selected, preview, isMenu) {
    return {
      data: {
        value: value,
        text: text
      },
      type: 'item',
      dom: {
        tag: 'div',
        classes: isMenu ? [$_5qzh4bzejdud7f0y.resolve('styles-item-is-menu')] : []
      },
      toggling: {
        toggleOnExecute: false,
        toggleClass: $_5qzh4bzejdud7f0y.resolve('format-matches'),
        selected: selected
      },
      itemBehaviours: $_ax1gfoy2jdud7eu7.derive(isMenu ? [] : [$_nw25bzdjdud7f0v.format(value, function (comp, status) {
          var toggle = status ? Toggling.on : Toggling.off;
          toggle(comp);
        })]),
      components: [{
          dom: {
            tag: 'div',
            attributes: { style: preview },
            innerHtml: text
          }
        }]
    };
  };
  var makeMenu = function (value, items, memMenuThunk, collapsable) {
    return {
      value: value,
      dom: { tag: 'div' },
      components: [
        Button.sketch({
          dom: {
            tag: 'div',
            classes: [$_5qzh4bzejdud7f0y.resolve('styles-collapser')]
          },
          components: collapsable ? [
            {
              dom: {
                tag: 'span',
                classes: [$_5qzh4bzejdud7f0y.resolve('styles-collapse-icon')]
              }
            },
            $_ap2ej712tjdud7fjl.text(value)
          ] : [$_ap2ej712tjdud7fjl.text(value)],
          action: function (item) {
            if (collapsable) {
              var comp = memMenuThunk().get(item);
              TieredMenu.collapseMenu(comp);
            }
          }
        }),
        {
          dom: {
            tag: 'div',
            classes: [$_5qzh4bzejdud7f0y.resolve('styles-menu-items-container')]
          },
          components: [Menu.parts().items({})],
          behaviours: $_ax1gfoy2jdud7eu7.derive([$_6jfkt3126jdud7ffy.config('adhoc-scrollable-menu', [
              $_5xcuyiy4jdud7eur.runOnAttached(function (component, simulatedEvent) {
                $_btgbcy103jdud7f3t.set(component.element(), 'overflow-y', 'auto');
                $_btgbcy103jdud7f3t.set(component.element(), '-webkit-overflow-scrolling', 'touch');
                $_bhtyzh13ujdud7fqk.register(component.element());
              }),
              $_5xcuyiy4jdud7eur.runOnDetached(function (component) {
                $_btgbcy103jdud7f3t.remove(component.element(), 'overflow-y');
                $_btgbcy103jdud7f3t.remove(component.element(), '-webkit-overflow-scrolling');
                $_bhtyzh13ujdud7fqk.deregister(component.element());
              })
            ])])
        }
      ],
      items: items,
      menuBehaviours: $_ax1gfoy2jdud7eu7.derive([Transitioning.config({
          initialState: 'after',
          routes: Transitioning.createTristate('before', 'current', 'after', {
            transition: {
              property: 'transform',
              transitionClass: 'transitioning'
            }
          })
        })])
    };
  };
  var sketch$9 = function (settings) {
    var dataset = convert$1(settings.formats, function () {
      return memMenu;
    });
    var memMenu = $_81ial811rjdud7fdw.record(TieredMenu.sketch({
      dom: {
        tag: 'div',
        classes: [$_5qzh4bzejdud7f0y.resolve('styles-menu')]
      },
      components: [],
      fakeFocus: true,
      stayInDom: true,
      onExecute: function (tmenu, item) {
        var v = me.getValue(item);
        settings.handle(item, v.value);
      },
      onEscape: function () {
      },
      onOpenMenu: function (container, menu) {
        var w = $_6chz3611kjdud7fcw.get(container.element());
        $_6chz3611kjdud7fcw.set(menu.element(), w);
        Transitioning.jumpTo(menu, 'current');
      },
      onOpenSubmenu: function (container, item, submenu) {
        var w = $_6chz3611kjdud7fcw.get(container.element());
        var menu = $_a3quyizxjdud7f3e.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
        var menuComp = container.getSystem().getByDom(menu).getOrDie();
        $_6chz3611kjdud7fcw.set(submenu.element(), w);
        Transitioning.progressTo(menuComp, 'before');
        Transitioning.jumpTo(submenu, 'after');
        Transitioning.progressTo(submenu, 'current');
      },
      onCollapseMenu: function (container, item, menu) {
        var submenu = $_a3quyizxjdud7f3e.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
        var submenuComp = container.getSystem().getByDom(submenu).getOrDie();
        Transitioning.progressTo(submenuComp, 'after');
        Transitioning.progressTo(menu, 'current');
      },
      navigateOnHover: false,
      openImmediately: true,
      data: dataset.tmenu,
      markers: {
        backgroundMenu: $_5qzh4bzejdud7f0y.resolve('styles-background-menu'),
        menu: $_5qzh4bzejdud7f0y.resolve('styles-menu'),
        selectedMenu: $_5qzh4bzejdud7f0y.resolve('styles-selected-menu'),
        item: $_5qzh4bzejdud7f0y.resolve('styles-item'),
        selectedItem: $_5qzh4bzejdud7f0y.resolve('styles-selected-item')
      }
    }));
    return memMenu.asSpec();
  };
  var $_8232q612sjdud7fix = { sketch: sketch$9 };

  var getFromExpandingItem = function (item) {
    var newItem = $_73qnwowyjdud7ek9.deepMerge($_ettibkxsjdud7emz.exclude(item, ['items']), { menu: true });
    var rest = expand(item.items);
    var newMenus = $_73qnwowyjdud7ek9.deepMerge(rest.menus, $_ettibkxsjdud7emz.wrap(item.title, rest.items));
    var newExpansions = $_73qnwowyjdud7ek9.deepMerge(rest.expansions, $_ettibkxsjdud7emz.wrap(item.title, item.title));
    return {
      item: newItem,
      menus: newMenus,
      expansions: newExpansions
    };
  };
  var getFromItem = function (item) {
    return $_ettibkxsjdud7emz.hasKey(item, 'items') ? getFromExpandingItem(item) : {
      item: item,
      menus: {},
      expansions: {}
    };
  };
  var expand = function (items) {
    return $_1g2cevwsjdud7ejp.foldr(items, function (acc, item) {
      var newData = getFromItem(item);
      return {
        menus: $_73qnwowyjdud7ek9.deepMerge(acc.menus, newData.menus),
        items: [newData.item].concat(acc.items),
        expansions: $_73qnwowyjdud7ek9.deepMerge(acc.expansions, newData.expansions)
      };
    }, {
      menus: {},
      expansions: {},
      items: []
    });
  };
  var $_2318xp13vjdud7fqo = { expand: expand };

  var register$1 = function (editor, settings) {
    var isSelectedFor = function (format) {
      return function () {
        return editor.formatter.match(format);
      };
    };
    var getPreview = function (format) {
      return function () {
        var styles = editor.formatter.getCssText(format);
        return styles;
      };
    };
    var enrichSupported = function (item) {
      return $_73qnwowyjdud7ek9.deepMerge(item, {
        isSelected: isSelectedFor(item.format),
        getPreview: getPreview(item.format)
      });
    };
    var enrichMenu = function (item) {
      return $_73qnwowyjdud7ek9.deepMerge(item, {
        isSelected: $_9njj9iwjjdud7eix.constant(false),
        getPreview: $_9njj9iwjjdud7eix.constant('')
      });
    };
    var enrichCustom = function (item) {
      var formatName = $_3k9wwu10rjdud7f7t.generate(item.title);
      var newItem = $_73qnwowyjdud7ek9.deepMerge(item, {
        format: formatName,
        isSelected: isSelectedFor(formatName),
        getPreview: getPreview(formatName)
      });
      editor.formatter.register(formatName, newItem);
      return newItem;
    };
    var formats = $_ettibkxsjdud7emz.readOptFrom(settings, 'style_formats').getOr(DefaultStyleFormats);
    var doEnrich = function (items) {
      return $_1g2cevwsjdud7ejp.map(items, function (item) {
        if ($_ettibkxsjdud7emz.hasKey(item, 'items')) {
          var newItems = doEnrich(item.items);
          return $_73qnwowyjdud7ek9.deepMerge(enrichMenu(item), { items: newItems });
        } else if ($_ettibkxsjdud7emz.hasKey(item, 'format')) {
          return enrichSupported(item);
        } else {
          return enrichCustom(item);
        }
      });
    };
    return doEnrich(formats);
  };
  var prune = function (editor, formats) {
    var doPrune = function (items) {
      return $_1g2cevwsjdud7ejp.bind(items, function (item) {
        if (item.items !== undefined) {
          var newItems = doPrune(item.items);
          return newItems.length > 0 ? [item] : [];
        } else {
          var keep = $_ettibkxsjdud7emz.hasKey(item, 'format') ? editor.formatter.canApply(item.format) : true;
          return keep ? [item] : [];
        }
      });
    };
    var prunedItems = doPrune(formats);
    return $_2318xp13vjdud7fqo.expand(prunedItems);
  };
  var ui = function (editor, formats, onDone) {
    var pruned = prune(editor, formats);
    return $_8232q612sjdud7fix.sketch({
      formats: pruned,
      handle: function (item, value) {
        editor.undoManager.transact(function () {
          if (Toggling.isOn(item)) {
            editor.formatter.remove(value);
          } else {
            editor.formatter.apply(value);
          }
        });
        onDone();
      }
    });
  };
  var $_2m4bmu12qjdud7fio = {
    register: register$1,
    ui: ui
  };

  var defaults = [
    'undo',
    'bold',
    'italic',
    'link',
    'image',
    'bullist',
    'styleselect'
  ];
  var extract$1 = function (rawToolbar) {
    var toolbar = rawToolbar.replace(/\|/g, ' ').trim();
    return toolbar.length > 0 ? toolbar.split(/\s+/) : [];
  };
  var identifyFromArray = function (toolbar) {
    return $_1g2cevwsjdud7ejp.bind(toolbar, function (item) {
      return $_9rljuwzjdud7ekb.isArray(item) ? identifyFromArray(item) : extract$1(item);
    });
  };
  var identify = function (settings) {
    var toolbar = settings.toolbar !== undefined ? settings.toolbar : defaults;
    return $_9rljuwzjdud7ekb.isArray(toolbar) ? identifyFromArray(toolbar) : extract$1(toolbar);
  };
  var setup = function (realm, editor) {
    var commandSketch = function (name) {
      return function () {
        return $_d0l7buzfjdud7f11.forToolbarCommand(editor, name);
      };
    };
    var stateCommandSketch = function (name) {
      return function () {
        return $_d0l7buzfjdud7f11.forToolbarStateCommand(editor, name);
      };
    };
    var actionSketch = function (name, query, action) {
      return function () {
        return $_d0l7buzfjdud7f11.forToolbarStateAction(editor, name, query, action);
      };
    };
    var undo = commandSketch('undo');
    var redo = commandSketch('redo');
    var bold = stateCommandSketch('bold');
    var italic = stateCommandSketch('italic');
    var underline = stateCommandSketch('underline');
    var removeformat = commandSketch('removeformat');
    var link = function () {
      return $_20tbzu121jdud7ff2.sketch(realm, editor);
    };
    var unlink = actionSketch('unlink', 'link', function () {
      editor.execCommand('unlink', null, false);
    });
    var image = function () {
      return $_sv17x11qjdud7fdo.sketch(editor);
    };
    var bullist = actionSketch('unordered-list', 'ul', function () {
      editor.execCommand('InsertUnorderedList', null, false);
    });
    var numlist = actionSketch('ordered-list', 'ol', function () {
      editor.execCommand('InsertOrderedList', null, false);
    });
    var fontsizeselect = function () {
      return $_8r2dx911mjdud7fcz.sketch(realm, editor);
    };
    var forecolor = function () {
      return $_2q53pp115jdud7fap.sketch(realm, editor);
    };
    var styleFormats = $_2m4bmu12qjdud7fio.register(editor, editor.settings);
    var styleFormatsMenu = function () {
      return $_2m4bmu12qjdud7fio.ui(editor, styleFormats, function () {
        editor.fire('scrollIntoView');
      });
    };
    var styleselect = function () {
      return $_d0l7buzfjdud7f11.forToolbar('style-formats', function (button) {
        editor.fire('toReading');
        realm.dropup().appear(styleFormatsMenu, Toggling.on, button);
      }, $_ax1gfoy2jdud7eu7.derive([
        Toggling.config({
          toggleClass: $_5qzh4bzejdud7f0y.resolve('toolbar-button-selected'),
          toggleOnExecute: false,
          aria: { mode: 'pressed' }
        }),
        Receiving.config({
          channels: $_ettibkxsjdud7emz.wrapAll([
            $_nw25bzdjdud7f0v.receive($_dlmrcrz1jdud7eyr.orientationChanged(), Toggling.off),
            $_nw25bzdjdud7f0v.receive($_dlmrcrz1jdud7eyr.dropupDismissed(), Toggling.off)
          ])
        })
      ]));
    };
    var feature = function (prereq, sketch) {
      return {
        isSupported: function () {
          return prereq.forall(function (p) {
            return $_ettibkxsjdud7emz.hasKey(editor.buttons, p);
          });
        },
        sketch: sketch
      };
    };
    return {
      undo: feature(Option.none(), undo),
      redo: feature(Option.none(), redo),
      bold: feature(Option.none(), bold),
      italic: feature(Option.none(), italic),
      underline: feature(Option.none(), underline),
      removeformat: feature(Option.none(), removeformat),
      link: feature(Option.none(), link),
      unlink: feature(Option.none(), unlink),
      image: feature(Option.none(), image),
      bullist: feature(Option.some('bullist'), bullist),
      numlist: feature(Option.some('numlist'), numlist),
      fontsizeselect: feature(Option.none(), fontsizeselect),
      forecolor: feature(Option.none(), forecolor),
      styleselect: feature(Option.none(), styleselect)
    };
  };
  var detect$4 = function (settings, features) {
    var itemNames = identify(settings);
    var present = {};
    return $_1g2cevwsjdud7ejp.bind(itemNames, function (iName) {
      var r = !$_ettibkxsjdud7emz.hasKey(present, iName) && $_ettibkxsjdud7emz.hasKey(features, iName) && features[iName].isSupported() ? [features[iName].sketch()] : [];
      present[iName] = true;
      return r;
    });
  };
  var $_44tgozz2jdud7eyu = {
    identify: identify,
    setup: setup,
    detect: detect$4
  };

  var mkEvent = function (target, x, y, stop, prevent, kill, raw) {
    return {
      'target': $_9njj9iwjjdud7eix.constant(target),
      'x': $_9njj9iwjjdud7eix.constant(x),
      'y': $_9njj9iwjjdud7eix.constant(y),
      'stop': stop,
      'prevent': prevent,
      'kill': kill,
      'raw': $_9njj9iwjjdud7eix.constant(raw)
    };
  };
  var handle = function (filter, handler) {
    return function (rawEvent) {
      if (!filter(rawEvent))
        return;
      var target = $_eobgtqxfjdud7elu.fromDom(rawEvent.target);
      var stop = function () {
        rawEvent.stopPropagation();
      };
      var prevent = function () {
        rawEvent.preventDefault();
      };
      var kill = $_9njj9iwjjdud7eix.compose(prevent, stop);
      var evt = mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
      handler(evt);
    };
  };
  var binder = function (element, event, filter, handler, useCapture) {
    var wrapped = handle(filter, handler);
    element.dom().addEventListener(event, wrapped, useCapture);
    return { unbind: $_9njj9iwjjdud7eix.curry(unbind, element, event, wrapped, useCapture) };
  };
  var bind$1 = function (element, event, filter, handler) {
    return binder(element, event, filter, handler, false);
  };
  var capture = function (element, event, filter, handler) {
    return binder(element, event, filter, handler, true);
  };
  var unbind = function (element, event, handler, useCapture) {
    element.dom().removeEventListener(event, handler, useCapture);
  };
  var $_4i64fg13yjdud7fr2 = {
    bind: bind$1,
    capture: capture
  };

  var filter$1 = $_9njj9iwjjdud7eix.constant(true);
  var bind$2 = function (element, event, handler) {
    return $_4i64fg13yjdud7fr2.bind(element, event, filter$1, handler);
  };
  var capture$1 = function (element, event, handler) {
    return $_4i64fg13yjdud7fr2.capture(element, event, filter$1, handler);
  };
  var $_5x7hr513xjdud7fqz = {
    bind: bind$2,
    capture: capture$1
  };

  var INTERVAL = 50;
  var INSURANCE = 1000 / INTERVAL;
  var get$11 = function (outerWindow) {
    var isPortrait = outerWindow.matchMedia('(orientation: portrait)').matches;
    return { isPortrait: $_9njj9iwjjdud7eix.constant(isPortrait) };
  };
  var getActualWidth = function (outerWindow) {
    var isIos = $_chh2cvwkjdud7ej0.detect().os.isiOS();
    var isPortrait = get$11(outerWindow).isPortrait();
    return isIos && !isPortrait ? outerWindow.screen.height : outerWindow.screen.width;
  };
  var onChange = function (outerWindow, listeners) {
    var win = $_eobgtqxfjdud7elu.fromDom(outerWindow);
    var poller = null;
    var change = function () {
      clearInterval(poller);
      var orientation = get$11(outerWindow);
      listeners.onChange(orientation);
      onAdjustment(function () {
        listeners.onReady(orientation);
      });
    };
    var orientationHandle = $_5x7hr513xjdud7fqz.bind(win, 'orientationchange', change);
    var onAdjustment = function (f) {
      clearInterval(poller);
      var flag = outerWindow.innerHeight;
      var insurance = 0;
      poller = setInterval(function () {
        if (flag !== outerWindow.innerHeight) {
          clearInterval(poller);
          f(Option.some(outerWindow.innerHeight));
        } else if (insurance > INSURANCE) {
          clearInterval(poller);
          f(Option.none());
        }
        insurance++;
      }, INTERVAL);
    };
    var destroy = function () {
      orientationHandle.unbind();
    };
    return {
      onAdjustment: onAdjustment,
      destroy: destroy
    };
  };
  var $_9zlehr13wjdud7fqs = {
    get: get$11,
    onChange: onChange,
    getActualWidth: getActualWidth
  };

  function DelayedFunction (fun, delay) {
    var ref = null;
    var schedule = function () {
      var args = arguments;
      ref = setTimeout(function () {
        fun.apply(null, args);
        ref = null;
      }, delay);
    };
    var cancel = function () {
      if (ref !== null) {
        clearTimeout(ref);
        ref = null;
      }
    };
    return {
      cancel: cancel,
      schedule: schedule
    };
  }

  var SIGNIFICANT_MOVE = 5;
  var LONGPRESS_DELAY = 400;
  var getTouch = function (event) {
    if (event.raw().touches === undefined || event.raw().touches.length !== 1)
      return Option.none();
    return Option.some(event.raw().touches[0]);
  };
  var isFarEnough = function (touch, data) {
    var distX = Math.abs(touch.clientX - data.x());
    var distY = Math.abs(touch.clientY - data.y());
    return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
  };
  var monitor = function (settings) {
    var startData = Cell(Option.none());
    var longpress = DelayedFunction(function (event) {
      startData.set(Option.none());
      settings.triggerEvent($_801kkqwhjdud7eiq.longpress(), event);
    }, LONGPRESS_DELAY);
    var handleTouchstart = function (event) {
      getTouch(event).each(function (touch) {
        longpress.cancel();
        var data = {
          x: $_9njj9iwjjdud7eix.constant(touch.clientX),
          y: $_9njj9iwjjdud7eix.constant(touch.clientY),
          target: event.target
        };
        longpress.schedule(data);
        startData.set(Option.some(data));
      });
      return Option.none();
    };
    var handleTouchmove = function (event) {
      longpress.cancel();
      getTouch(event).each(function (touch) {
        startData.get().each(function (data) {
          if (isFarEnough(touch, data))
            startData.set(Option.none());
        });
      });
      return Option.none();
    };
    var handleTouchend = function (event) {
      longpress.cancel();
      var isSame = function (data) {
        return $_f1y1rtx9jdud7el7.eq(data.target(), event.target());
      };
      return startData.get().filter(isSame).map(function (data) {
        return settings.triggerEvent($_801kkqwhjdud7eiq.tap(), event);
      });
    };
    var handlers = $_ettibkxsjdud7emz.wrapAll([
      {
        key: $_brmbwvwijdud7eiu.touchstart(),
        value: handleTouchstart
      },
      {
        key: $_brmbwvwijdud7eiu.touchmove(),
        value: handleTouchmove
      },
      {
        key: $_brmbwvwijdud7eiu.touchend(),
        value: handleTouchend
      }
    ]);
    var fireIfReady = function (event, type) {
      return $_ettibkxsjdud7emz.readOptFrom(handlers, type).bind(function (handler) {
        return handler(event);
      });
    };
    return { fireIfReady: fireIfReady };
  };
  var $_civf8z144jdud7fs6 = { monitor: monitor };

  var monitor$1 = function (editorApi) {
    var tapEvent = $_civf8z144jdud7fs6.monitor({
      triggerEvent: function (type, evt) {
        editorApi.onTapContent(evt);
      }
    });
    var onTouchend = function () {
      return $_5x7hr513xjdud7fqz.bind(editorApi.body(), 'touchend', function (evt) {
        tapEvent.fireIfReady(evt, 'touchend');
      });
    };
    var onTouchmove = function () {
      return $_5x7hr513xjdud7fqz.bind(editorApi.body(), 'touchmove', function (evt) {
        tapEvent.fireIfReady(evt, 'touchmove');
      });
    };
    var fireTouchstart = function (evt) {
      tapEvent.fireIfReady(evt, 'touchstart');
    };
    return {
      fireTouchstart: fireTouchstart,
      onTouchend: onTouchend,
      onTouchmove: onTouchmove
    };
  };
  var $_cza229143jdud7fs3 = { monitor: monitor$1 };

  var isAndroid6 = $_chh2cvwkjdud7ej0.detect().os.version.major >= 6;
  var initEvents = function (editorApi, toolstrip, alloy) {
    var tapping = $_cza229143jdud7fs3.monitor(editorApi);
    var outerDoc = $_dekwe2x3jdud7ekr.owner(toolstrip);
    var isRanged = function (sel) {
      return !$_f1y1rtx9jdud7el7.eq(sel.start(), sel.finish()) || sel.soffset() !== sel.foffset();
    };
    var hasRangeInUi = function () {
      return $_25580rytjdud7ey7.active(outerDoc).filter(function (input) {
        return $_50qkdpxkjdud7em6.name(input) === 'input';
      }).exists(function (input) {
        return input.dom().selectionStart !== input.dom().selectionEnd;
      });
    };
    var updateMargin = function () {
      var rangeInContent = editorApi.doc().dom().hasFocus() && editorApi.getSelection().exists(isRanged);
      alloy.getByDom(toolstrip).each((rangeInContent || hasRangeInUi()) === true ? Toggling.on : Toggling.off);
    };
    var listeners = [
      $_5x7hr513xjdud7fqz.bind(editorApi.body(), 'touchstart', function (evt) {
        editorApi.onTouchContent();
        tapping.fireTouchstart(evt);
      }),
      tapping.onTouchmove(),
      tapping.onTouchend(),
      $_5x7hr513xjdud7fqz.bind(toolstrip, 'touchstart', function (evt) {
        editorApi.onTouchToolstrip();
      }),
      editorApi.onToReading(function () {
        $_25580rytjdud7ey7.blur(editorApi.body());
      }),
      editorApi.onToEditing($_9njj9iwjjdud7eix.noop),
      editorApi.onScrollToCursor(function (tinyEvent) {
        tinyEvent.preventDefault();
        editorApi.getCursorBox().each(function (bounds) {
          var cWin = editorApi.win();
          var isOutside = bounds.top() > cWin.innerHeight || bounds.bottom() > cWin.innerHeight;
          var cScrollBy = isOutside ? bounds.bottom() - cWin.innerHeight + 50 : 0;
          if (cScrollBy !== 0) {
            cWin.scrollTo(cWin.pageXOffset, cWin.pageYOffset + cScrollBy);
          }
        });
      })
    ].concat(isAndroid6 === true ? [] : [
      $_5x7hr513xjdud7fqz.bind($_eobgtqxfjdud7elu.fromDom(editorApi.win()), 'blur', function () {
        alloy.getByDom(toolstrip).each(Toggling.off);
      }),
      $_5x7hr513xjdud7fqz.bind(outerDoc, 'select', updateMargin),
      $_5x7hr513xjdud7fqz.bind(editorApi.doc(), 'selectionchange', updateMargin)
    ]);
    var destroy = function () {
      $_1g2cevwsjdud7ejp.each(listeners, function (l) {
        l.unbind();
      });
    };
    return { destroy: destroy };
  };
  var $_bywc5s142jdud7frq = { initEvents: initEvents };

  var safeParse = function (element, attribute) {
    var parsed = parseInt($_2vghk1xrjdud7ems.get(element, attribute), 10);
    return isNaN(parsed) ? 0 : parsed;
  };
  var $_1bs4n9147jdud7fsm = { safeParse: safeParse };

  function NodeValue (is, name) {
    var get = function (element) {
      if (!is(element))
        throw new Error('Can only get ' + name + ' value of a ' + name + ' node');
      return getOption(element).getOr('');
    };
    var getOptionIE10 = function (element) {
      try {
        return getOptionSafe(element);
      } catch (e) {
        return Option.none();
      }
    };
    var getOptionSafe = function (element) {
      return is(element) ? Option.from(element.dom().nodeValue) : Option.none();
    };
    var browser = $_chh2cvwkjdud7ej0.detect().browser;
    var getOption = browser.isIE() && browser.version.major === 10 ? getOptionIE10 : getOptionSafe;
    var set = function (element, value) {
      if (!is(element))
        throw new Error('Can only set raw ' + name + ' value of a ' + name + ' node');
      element.dom().nodeValue = value;
    };
    return {
      get: get,
      getOption: getOption,
      set: set
    };
  }

  var api$3 = NodeValue($_50qkdpxkjdud7em6.isText, 'text');
  var get$12 = function (element) {
    return api$3.get(element);
  };
  var getOption = function (element) {
    return api$3.getOption(element);
  };
  var set$8 = function (element, value) {
    api$3.set(element, value);
  };
  var $_3k83ka14ajdud7fsz = {
    get: get$12,
    getOption: getOption,
    set: set$8
  };

  var getEnd = function (element) {
    return $_50qkdpxkjdud7em6.name(element) === 'img' ? 1 : $_3k83ka14ajdud7fsz.getOption(element).fold(function () {
      return $_dekwe2x3jdud7ekr.children(element).length;
    }, function (v) {
      return v.length;
    });
  };
  var isEnd = function (element, offset) {
    return getEnd(element) === offset;
  };
  var isStart = function (element, offset) {
    return offset === 0;
  };
  var NBSP = '\xA0';
  var isTextNodeWithCursorPosition = function (el) {
    return $_3k83ka14ajdud7fsz.getOption(el).filter(function (text) {
      return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
    }).isSome();
  };
  var elementsWithCursorPosition = [
    'img',
    'br'
  ];
  var isCursorPosition = function (elem) {
    var hasCursorPosition = isTextNodeWithCursorPosition(elem);
    return hasCursorPosition || $_1g2cevwsjdud7ejp.contains(elementsWithCursorPosition, $_50qkdpxkjdud7em6.name(elem));
  };
  var $_68us7a149jdud7fsw = {
    getEnd: getEnd,
    isEnd: isEnd,
    isStart: isStart,
    isCursorPosition: isCursorPosition
  };

  var adt$4 = $_2ytffsxwjdud7ets.generate([
    { 'before': ['element'] },
    {
      'on': [
        'element',
        'offset'
      ]
    },
    { after: ['element'] }
  ]);
  var cata = function (subject, onBefore, onOn, onAfter) {
    return subject.fold(onBefore, onOn, onAfter);
  };
  var getStart = function (situ) {
    return situ.fold($_9njj9iwjjdud7eix.identity, $_9njj9iwjjdud7eix.identity, $_9njj9iwjjdud7eix.identity);
  };
  var $_45626b14djdud7ft8 = {
    before: adt$4.before,
    on: adt$4.on,
    after: adt$4.after,
    cata: cata,
    getStart: getStart
  };

  var type$1 = $_2ytffsxwjdud7ets.generate([
    { domRange: ['rng'] },
    {
      relative: [
        'startSitu',
        'finishSitu'
      ]
    },
    {
      exact: [
        'start',
        'soffset',
        'finish',
        'foffset'
      ]
    }
  ]);
  var range$1 = $_8o1q69x4jdud7ekz.immutable('start', 'soffset', 'finish', 'foffset');
  var exactFromRange = function (simRange) {
    return type$1.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
  };
  var getStart$1 = function (selection) {
    return selection.match({
      domRange: function (rng) {
        return $_eobgtqxfjdud7elu.fromDom(rng.startContainer);
      },
      relative: function (startSitu, finishSitu) {
        return $_45626b14djdud7ft8.getStart(startSitu);
      },
      exact: function (start, soffset, finish, foffset) {
        return start;
      }
    });
  };
  var getWin = function (selection) {
    var start = getStart$1(selection);
    return $_dekwe2x3jdud7ekr.defaultView(start);
  };
  var $_fmfln914cjdud7ft5 = {
    domRange: type$1.domRange,
    relative: type$1.relative,
    exact: type$1.exact,
    exactFromRange: exactFromRange,
    range: range$1,
    getWin: getWin
  };

  var makeRange = function (start, soffset, finish, foffset) {
    var doc = $_dekwe2x3jdud7ekr.owner(start);
    var rng = doc.dom().createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var commonAncestorContainer = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    return $_eobgtqxfjdud7elu.fromDom(r.commonAncestorContainer);
  };
  var after$2 = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    var same = $_f1y1rtx9jdud7el7.eq(start, finish) && soffset === foffset;
    return r.collapsed && !same;
  };
  var $_ye0rw14fjdud7ftn = {
    after: after$2,
    commonAncestorContainer: commonAncestorContainer
  };

  var fromElements = function (elements, scope) {
    var doc = scope || document;
    var fragment = doc.createDocumentFragment();
    $_1g2cevwsjdud7ejp.each(elements, function (element) {
      fragment.appendChild(element.dom());
    });
    return $_eobgtqxfjdud7elu.fromDom(fragment);
  };
  var $_cknvaa14gjdud7ftp = { fromElements: fromElements };

  var selectNodeContents = function (win, element) {
    var rng = win.document.createRange();
    selectNodeContentsUsing(rng, element);
    return rng;
  };
  var selectNodeContentsUsing = function (rng, element) {
    rng.selectNodeContents(element.dom());
  };
  var isWithin = function (outerRange, innerRange) {
    return innerRange.compareBoundaryPoints(outerRange.END_TO_START, outerRange) < 1 && innerRange.compareBoundaryPoints(outerRange.START_TO_END, outerRange) > -1;
  };
  var create$4 = function (win) {
    return win.document.createRange();
  };
  var setStart = function (rng, situ) {
    situ.fold(function (e) {
      rng.setStartBefore(e.dom());
    }, function (e, o) {
      rng.setStart(e.dom(), o);
    }, function (e) {
      rng.setStartAfter(e.dom());
    });
  };
  var setFinish = function (rng, situ) {
    situ.fold(function (e) {
      rng.setEndBefore(e.dom());
    }, function (e, o) {
      rng.setEnd(e.dom(), o);
    }, function (e) {
      rng.setEndAfter(e.dom());
    });
  };
  var replaceWith = function (rng, fragment) {
    deleteContents(rng);
    rng.insertNode(fragment.dom());
  };
  var relativeToNative = function (win, startSitu, finishSitu) {
    var range = win.document.createRange();
    setStart(range, startSitu);
    setFinish(range, finishSitu);
    return range;
  };
  var exactToNative = function (win, start, soffset, finish, foffset) {
    var rng = win.document.createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var deleteContents = function (rng) {
    rng.deleteContents();
  };
  var cloneFragment = function (rng) {
    var fragment = rng.cloneContents();
    return $_eobgtqxfjdud7elu.fromDom(fragment);
  };
  var toRect = function (rect) {
    return {
      left: $_9njj9iwjjdud7eix.constant(rect.left),
      top: $_9njj9iwjjdud7eix.constant(rect.top),
      right: $_9njj9iwjjdud7eix.constant(rect.right),
      bottom: $_9njj9iwjjdud7eix.constant(rect.bottom),
      width: $_9njj9iwjjdud7eix.constant(rect.width),
      height: $_9njj9iwjjdud7eix.constant(rect.height)
    };
  };
  var getFirstRect = function (rng) {
    var rects = rng.getClientRects();
    var rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect) : Option.none();
  };
  var getBounds = function (rng) {
    var rect = rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect) : Option.none();
  };
  var toString$1 = function (rng) {
    return rng.toString();
  };
  var $_5e0i8014hjdud7fts = {
    create: create$4,
    replaceWith: replaceWith,
    selectNodeContents: selectNodeContents,
    selectNodeContentsUsing: selectNodeContentsUsing,
    relativeToNative: relativeToNative,
    exactToNative: exactToNative,
    deleteContents: deleteContents,
    cloneFragment: cloneFragment,
    getFirstRect: getFirstRect,
    getBounds: getBounds,
    isWithin: isWithin,
    toString: toString$1
  };

  var adt$5 = $_2ytffsxwjdud7ets.generate([
    {
      ltr: [
        'start',
        'soffset',
        'finish',
        'foffset'
      ]
    },
    {
      rtl: [
        'start',
        'soffset',
        'finish',
        'foffset'
      ]
    }
  ]);
  var fromRange = function (win, type, range) {
    return type($_eobgtqxfjdud7elu.fromDom(range.startContainer), range.startOffset, $_eobgtqxfjdud7elu.fromDom(range.endContainer), range.endOffset);
  };
  var getRanges = function (win, selection) {
    return selection.match({
      domRange: function (rng) {
        return {
          ltr: $_9njj9iwjjdud7eix.constant(rng),
          rtl: Option.none
        };
      },
      relative: function (startSitu, finishSitu) {
        return {
          ltr: $_2nf0bewljdud7ej2.cached(function () {
            return $_5e0i8014hjdud7fts.relativeToNative(win, startSitu, finishSitu);
          }),
          rtl: $_2nf0bewljdud7ej2.cached(function () {
            return Option.some($_5e0i8014hjdud7fts.relativeToNative(win, finishSitu, startSitu));
          })
        };
      },
      exact: function (start, soffset, finish, foffset) {
        return {
          ltr: $_2nf0bewljdud7ej2.cached(function () {
            return $_5e0i8014hjdud7fts.exactToNative(win, start, soffset, finish, foffset);
          }),
          rtl: $_2nf0bewljdud7ej2.cached(function () {
            return Option.some($_5e0i8014hjdud7fts.exactToNative(win, finish, foffset, start, soffset));
          })
        };
      }
    });
  };
  var doDiagnose = function (win, ranges) {
    var rng = ranges.ltr();
    if (rng.collapsed) {
      var reversed = ranges.rtl().filter(function (rev) {
        return rev.collapsed === false;
      });
      return reversed.map(function (rev) {
        return adt$5.rtl($_eobgtqxfjdud7elu.fromDom(rev.endContainer), rev.endOffset, $_eobgtqxfjdud7elu.fromDom(rev.startContainer), rev.startOffset);
      }).getOrThunk(function () {
        return fromRange(win, adt$5.ltr, rng);
      });
    } else {
      return fromRange(win, adt$5.ltr, rng);
    }
  };
  var diagnose = function (win, selection) {
    var ranges = getRanges(win, selection);
    return doDiagnose(win, ranges);
  };
  var asLtrRange = function (win, selection) {
    var diagnosis = diagnose(win, selection);
    return diagnosis.match({
      ltr: function (start, soffset, finish, foffset) {
        var rng = win.document.createRange();
        rng.setStart(start.dom(), soffset);
        rng.setEnd(finish.dom(), foffset);
        return rng;
      },
      rtl: function (start, soffset, finish, foffset) {
        var rng = win.document.createRange();
        rng.setStart(finish.dom(), foffset);
        rng.setEnd(start.dom(), soffset);
        return rng;
      }
    });
  };
  var $_76ojt714ijdud7ftx = {
    ltr: adt$5.ltr,
    rtl: adt$5.rtl,
    diagnose: diagnose,
    asLtrRange: asLtrRange
  };

  var searchForPoint = function (rectForOffset, x, y, maxX, length) {
    if (length === 0)
      return 0;
    else if (x === maxX)
      return length - 1;
    var xDelta = maxX;
    for (var i = 1; i < length; i++) {
      var rect = rectForOffset(i);
      var curDeltaX = Math.abs(x - rect.left);
      if (y > rect.bottom) {
      } else if (y < rect.top || curDeltaX > xDelta) {
        return i - 1;
      } else {
        xDelta = curDeltaX;
      }
    }
    return 0;
  };
  var inRect = function (rect, x, y) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };
  var $_bqzywk14ljdud7fuc = {
    inRect: inRect,
    searchForPoint: searchForPoint
  };

  var locateOffset = function (doc, textnode, x, y, rect) {
    var rangeForOffset = function (offset) {
      var r = doc.dom().createRange();
      r.setStart(textnode.dom(), offset);
      r.collapse(true);
      return r;
    };
    var rectForOffset = function (offset) {
      var r = rangeForOffset(offset);
      return r.getBoundingClientRect();
    };
    var length = $_3k83ka14ajdud7fsz.get(textnode).length;
    var offset = $_bqzywk14ljdud7fuc.searchForPoint(rectForOffset, x, y, rect.right, length);
    return rangeForOffset(offset);
  };
  var locate$1 = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rects = r.getClientRects();
    var foundRect = $_ak7xq9y0jdud7eu4.findMap(rects, function (rect) {
      return $_bqzywk14ljdud7fuc.inRect(rect, x, y) ? Option.some(rect) : Option.none();
    });
    return foundRect.map(function (rect) {
      return locateOffset(doc, node, x, y, rect);
    });
  };
  var $_c6oh7z14mjdud7fue = { locate: locate$1 };

  var searchInChildren = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    var nodes = $_dekwe2x3jdud7ekr.children(node);
    return $_ak7xq9y0jdud7eu4.findMap(nodes, function (n) {
      r.selectNode(n.dom());
      return $_bqzywk14ljdud7fuc.inRect(r.getBoundingClientRect(), x, y) ? locateNode(doc, n, x, y) : Option.none();
    });
  };
  var locateNode = function (doc, node, x, y) {
    var locator = $_50qkdpxkjdud7em6.isText(node) ? $_c6oh7z14mjdud7fue.locate : searchInChildren;
    return locator(doc, node, x, y);
  };
  var locate$2 = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rect = r.getBoundingClientRect();
    var boundedX = Math.max(rect.left, Math.min(rect.right, x));
    var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
    return locateNode(doc, node, boundedX, boundedY);
  };
  var $_fsgwi914kjdud7fu8 = { locate: locate$2 };

  var first$3 = function (element) {
    return $_4j5kdsyvjdud7eyd.descendant(element, $_68us7a149jdud7fsw.isCursorPosition);
  };
  var last$2 = function (element) {
    return descendantRtl(element, $_68us7a149jdud7fsw.isCursorPosition);
  };
  var descendantRtl = function (scope, predicate) {
    var descend = function (element) {
      var children = $_dekwe2x3jdud7ekr.children(element);
      for (var i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        if (predicate(child))
          return Option.some(child);
        var res = descend(child);
        if (res.isSome())
          return res;
      }
      return Option.none();
    };
    return descend(scope);
  };
  var $_he1hx14ojdud7ful = {
    first: first$3,
    last: last$2
  };

  var COLLAPSE_TO_LEFT = true;
  var COLLAPSE_TO_RIGHT = false;
  var getCollapseDirection = function (rect, x) {
    return x - rect.left < rect.right - x ? COLLAPSE_TO_LEFT : COLLAPSE_TO_RIGHT;
  };
  var createCollapsedNode = function (doc, target, collapseDirection) {
    var r = doc.dom().createRange();
    r.selectNode(target.dom());
    r.collapse(collapseDirection);
    return r;
  };
  var locateInElement = function (doc, node, x) {
    var cursorRange = doc.dom().createRange();
    cursorRange.selectNode(node.dom());
    var rect = cursorRange.getBoundingClientRect();
    var collapseDirection = getCollapseDirection(rect, x);
    var f = collapseDirection === COLLAPSE_TO_LEFT ? $_he1hx14ojdud7ful.first : $_he1hx14ojdud7ful.last;
    return f(node).map(function (target) {
      return createCollapsedNode(doc, target, collapseDirection);
    });
  };
  var locateInEmpty = function (doc, node, x) {
    var rect = node.dom().getBoundingClientRect();
    var collapseDirection = getCollapseDirection(rect, x);
    return Option.some(createCollapsedNode(doc, node, collapseDirection));
  };
  var search$1 = function (doc, node, x) {
    var f = $_dekwe2x3jdud7ekr.children(node).length === 0 ? locateInEmpty : locateInElement;
    return f(doc, node, x);
  };
  var $_gcpi5c14njdud7fui = { search: search$1 };

  var caretPositionFromPoint = function (doc, x, y) {
    return Option.from(doc.dom().caretPositionFromPoint(x, y)).bind(function (pos) {
      if (pos.offsetNode === null)
        return Option.none();
      var r = doc.dom().createRange();
      r.setStart(pos.offsetNode, pos.offset);
      r.collapse();
      return Option.some(r);
    });
  };
  var caretRangeFromPoint = function (doc, x, y) {
    return Option.from(doc.dom().caretRangeFromPoint(x, y));
  };
  var searchTextNodes = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rect = r.getBoundingClientRect();
    var boundedX = Math.max(rect.left, Math.min(rect.right, x));
    var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
    return $_fsgwi914kjdud7fu8.locate(doc, node, boundedX, boundedY);
  };
  var searchFromPoint = function (doc, x, y) {
    return $_eobgtqxfjdud7elu.fromPoint(doc, x, y).bind(function (elem) {
      var fallback = function () {
        return $_gcpi5c14njdud7fui.search(doc, elem, x);
      };
      return $_dekwe2x3jdud7ekr.children(elem).length === 0 ? fallback() : searchTextNodes(doc, elem, x, y).orThunk(fallback);
    });
  };
  var availableSearch = document.caretPositionFromPoint ? caretPositionFromPoint : document.caretRangeFromPoint ? caretRangeFromPoint : searchFromPoint;
  var fromPoint$1 = function (win, x, y) {
    var doc = $_eobgtqxfjdud7elu.fromDom(win.document);
    return availableSearch(doc, x, y).map(function (rng) {
      return $_fmfln914cjdud7ft5.range($_eobgtqxfjdud7elu.fromDom(rng.startContainer), rng.startOffset, $_eobgtqxfjdud7elu.fromDom(rng.endContainer), rng.endOffset);
    });
  };
  var $_6sjtn814jjdud7fu4 = { fromPoint: fromPoint$1 };

  var withinContainer = function (win, ancestor, outerRange, selector) {
    var innerRange = $_5e0i8014hjdud7fts.create(win);
    var self = $_1t43jfxejdud7elq.is(ancestor, selector) ? [ancestor] : [];
    var elements = self.concat($_df6s98zvjdud7f39.descendants(ancestor, selector));
    return $_1g2cevwsjdud7ejp.filter(elements, function (elem) {
      $_5e0i8014hjdud7fts.selectNodeContentsUsing(innerRange, elem);
      return $_5e0i8014hjdud7fts.isWithin(outerRange, innerRange);
    });
  };
  var find$4 = function (win, selection, selector) {
    var outerRange = $_76ojt714ijdud7ftx.asLtrRange(win, selection);
    var ancestor = $_eobgtqxfjdud7elu.fromDom(outerRange.commonAncestorContainer);
    return $_50qkdpxkjdud7em6.isElement(ancestor) ? withinContainer(win, ancestor, outerRange, selector) : [];
  };
  var $_cjqhl14pjdud7fun = { find: find$4 };

  var beforeSpecial = function (element, offset) {
    var name = $_50qkdpxkjdud7em6.name(element);
    if ('input' === name)
      return $_45626b14djdud7ft8.after(element);
    else if (!$_1g2cevwsjdud7ejp.contains([
        'br',
        'img'
      ], name))
      return $_45626b14djdud7ft8.on(element, offset);
    else
      return offset === 0 ? $_45626b14djdud7ft8.before(element) : $_45626b14djdud7ft8.after(element);
  };
  var preprocessRelative = function (startSitu, finishSitu) {
    var start = startSitu.fold($_45626b14djdud7ft8.before, beforeSpecial, $_45626b14djdud7ft8.after);
    var finish = finishSitu.fold($_45626b14djdud7ft8.before, beforeSpecial, $_45626b14djdud7ft8.after);
    return $_fmfln914cjdud7ft5.relative(start, finish);
  };
  var preprocessExact = function (start, soffset, finish, foffset) {
    var startSitu = beforeSpecial(start, soffset);
    var finishSitu = beforeSpecial(finish, foffset);
    return $_fmfln914cjdud7ft5.relative(startSitu, finishSitu);
  };
  var preprocess = function (selection) {
    return selection.match({
      domRange: function (rng) {
        var start = $_eobgtqxfjdud7elu.fromDom(rng.startContainer);
        var finish = $_eobgtqxfjdud7elu.fromDom(rng.endContainer);
        return preprocessExact(start, rng.startOffset, finish, rng.endOffset);
      },
      relative: preprocessRelative,
      exact: preprocessExact
    });
  };
  var $_dz1q1l14qjdud7fur = {
    beforeSpecial: beforeSpecial,
    preprocess: preprocess,
    preprocessRelative: preprocessRelative,
    preprocessExact: preprocessExact
  };

  var doSetNativeRange = function (win, rng) {
    Option.from(win.getSelection()).each(function (selection) {
      selection.removeAllRanges();
      selection.addRange(rng);
    });
  };
  var doSetRange = function (win, start, soffset, finish, foffset) {
    var rng = $_5e0i8014hjdud7fts.exactToNative(win, start, soffset, finish, foffset);
    doSetNativeRange(win, rng);
  };
  var findWithin = function (win, selection, selector) {
    return $_cjqhl14pjdud7fun.find(win, selection, selector);
  };
  var setRangeFromRelative = function (win, relative) {
    return $_76ojt714ijdud7ftx.diagnose(win, relative).match({
      ltr: function (start, soffset, finish, foffset) {
        doSetRange(win, start, soffset, finish, foffset);
      },
      rtl: function (start, soffset, finish, foffset) {
        var selection = win.getSelection();
        if (selection.extend) {
          selection.collapse(start.dom(), soffset);
          selection.extend(finish.dom(), foffset);
        } else {
          doSetRange(win, finish, foffset, start, soffset);
        }
      }
    });
  };
  var setExact = function (win, start, soffset, finish, foffset) {
    var relative = $_dz1q1l14qjdud7fur.preprocessExact(start, soffset, finish, foffset);
    setRangeFromRelative(win, relative);
  };
  var setRelative = function (win, startSitu, finishSitu) {
    var relative = $_dz1q1l14qjdud7fur.preprocessRelative(startSitu, finishSitu);
    setRangeFromRelative(win, relative);
  };
  var toNative = function (selection) {
    var win = $_fmfln914cjdud7ft5.getWin(selection).dom();
    var getDomRange = function (start, soffset, finish, foffset) {
      return $_5e0i8014hjdud7fts.exactToNative(win, start, soffset, finish, foffset);
    };
    var filtered = $_dz1q1l14qjdud7fur.preprocess(selection);
    return $_76ojt714ijdud7ftx.diagnose(win, filtered).match({
      ltr: getDomRange,
      rtl: getDomRange
    });
  };
  var readRange = function (selection) {
    if (selection.rangeCount > 0) {
      var firstRng = selection.getRangeAt(0);
      var lastRng = selection.getRangeAt(selection.rangeCount - 1);
      return Option.some($_fmfln914cjdud7ft5.range($_eobgtqxfjdud7elu.fromDom(firstRng.startContainer), firstRng.startOffset, $_eobgtqxfjdud7elu.fromDom(lastRng.endContainer), lastRng.endOffset));
    } else {
      return Option.none();
    }
  };
  var doGetExact = function (selection) {
    var anchorNode = $_eobgtqxfjdud7elu.fromDom(selection.anchorNode);
    var focusNode = $_eobgtqxfjdud7elu.fromDom(selection.focusNode);
    return $_ye0rw14fjdud7ftn.after(anchorNode, selection.anchorOffset, focusNode, selection.focusOffset) ? Option.some($_fmfln914cjdud7ft5.range($_eobgtqxfjdud7elu.fromDom(selection.anchorNode), selection.anchorOffset, $_eobgtqxfjdud7elu.fromDom(selection.focusNode), selection.focusOffset)) : readRange(selection);
  };
  var setToElement = function (win, element) {
    var rng = $_5e0i8014hjdud7fts.selectNodeContents(win, element);
    doSetNativeRange(win, rng);
  };
  var forElement = function (win, element) {
    var rng = $_5e0i8014hjdud7fts.selectNodeContents(win, element);
    return $_fmfln914cjdud7ft5.range($_eobgtqxfjdud7elu.fromDom(rng.startContainer), rng.startOffset, $_eobgtqxfjdud7elu.fromDom(rng.endContainer), rng.endOffset);
  };
  var getExact = function (win) {
    var selection = win.getSelection();
    return selection.rangeCount > 0 ? doGetExact(selection) : Option.none();
  };
  var get$13 = function (win) {
    return getExact(win).map(function (range) {
      return $_fmfln914cjdud7ft5.exact(range.start(), range.soffset(), range.finish(), range.foffset());
    });
  };
  var getFirstRect$1 = function (win, selection) {
    var rng = $_76ojt714ijdud7ftx.asLtrRange(win, selection);
    return $_5e0i8014hjdud7fts.getFirstRect(rng);
  };
  var getBounds$1 = function (win, selection) {
    var rng = $_76ojt714ijdud7ftx.asLtrRange(win, selection);
    return $_5e0i8014hjdud7fts.getBounds(rng);
  };
  var getAtPoint = function (win, x, y) {
    return $_6sjtn814jjdud7fu4.fromPoint(win, x, y);
  };
  var getAsString = function (win, selection) {
    var rng = $_76ojt714ijdud7ftx.asLtrRange(win, selection);
    return $_5e0i8014hjdud7fts.toString(rng);
  };
  var clear$1 = function (win) {
    var selection = win.getSelection();
    selection.removeAllRanges();
  };
  var clone$3 = function (win, selection) {
    var rng = $_76ojt714ijdud7ftx.asLtrRange(win, selection);
    return $_5e0i8014hjdud7fts.cloneFragment(rng);
  };
  var replace = function (win, selection, elements) {
    var rng = $_76ojt714ijdud7ftx.asLtrRange(win, selection);
    var fragment = $_cknvaa14gjdud7ftp.fromElements(elements, win.document);
    $_5e0i8014hjdud7fts.replaceWith(rng, fragment);
  };
  var deleteAt = function (win, selection) {
    var rng = $_76ojt714ijdud7ftx.asLtrRange(win, selection);
    $_5e0i8014hjdud7fts.deleteContents(rng);
  };
  var isCollapsed = function (start, soffset, finish, foffset) {
    return $_f1y1rtx9jdud7el7.eq(start, finish) && soffset === foffset;
  };
  var $_af4mx314ejdud7ftd = {
    setExact: setExact,
    getExact: getExact,
    get: get$13,
    setRelative: setRelative,
    toNative: toNative,
    setToElement: setToElement,
    clear: clear$1,
    clone: clone$3,
    replace: replace,
    deleteAt: deleteAt,
    forElement: forElement,
    getFirstRect: getFirstRect$1,
    getBounds: getBounds$1,
    getAtPoint: getAtPoint,
    findWithin: findWithin,
    getAsString: getAsString,
    isCollapsed: isCollapsed
  };

  var COLLAPSED_WIDTH = 2;
  var collapsedRect = function (rect) {
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: $_9njj9iwjjdud7eix.constant(COLLAPSED_WIDTH),
      height: rect.height
    };
  };
  var toRect$1 = function (rawRect) {
    return {
      left: $_9njj9iwjjdud7eix.constant(rawRect.left),
      top: $_9njj9iwjjdud7eix.constant(rawRect.top),
      right: $_9njj9iwjjdud7eix.constant(rawRect.right),
      bottom: $_9njj9iwjjdud7eix.constant(rawRect.bottom),
      width: $_9njj9iwjjdud7eix.constant(rawRect.width),
      height: $_9njj9iwjjdud7eix.constant(rawRect.height)
    };
  };
  var getRectsFromRange = function (range) {
    if (!range.collapsed) {
      return $_1g2cevwsjdud7ejp.map(range.getClientRects(), toRect$1);
    } else {
      var start_1 = $_eobgtqxfjdud7elu.fromDom(range.startContainer);
      return $_dekwe2x3jdud7ekr.parent(start_1).bind(function (parent) {
        var selection = $_fmfln914cjdud7ft5.exact(start_1, range.startOffset, parent, $_68us7a149jdud7fsw.getEnd(parent));
        var optRect = $_af4mx314ejdud7ftd.getFirstRect(range.startContainer.ownerDocument.defaultView, selection);
        return optRect.map(collapsedRect).map($_1g2cevwsjdud7ejp.pure);
      }).getOr([]);
    }
  };
  var getRectangles = function (cWin) {
    var sel = cWin.getSelection();
    return sel !== undefined && sel.rangeCount > 0 ? getRectsFromRange(sel.getRangeAt(0)) : [];
  };
  var $_5lp8kt148jdud7fso = { getRectangles: getRectangles };

  var autocompleteHack = function () {
    return function (f) {
      setTimeout(function () {
        f();
      }, 0);
    };
  };
  var resume = function (cWin) {
    cWin.focus();
    var iBody = $_eobgtqxfjdud7elu.fromDom(cWin.document.body);
    var inInput = $_25580rytjdud7ey7.active().exists(function (elem) {
      return $_1g2cevwsjdud7ejp.contains([
        'input',
        'textarea'
      ], $_50qkdpxkjdud7em6.name(elem));
    });
    var transaction = inInput ? autocompleteHack() : $_9njj9iwjjdud7eix.apply;
    transaction(function () {
      $_25580rytjdud7ey7.active().each($_25580rytjdud7ey7.blur);
      $_25580rytjdud7ey7.focus(iBody);
    });
  };
  var $_5gl66x14rjdud7fuu = { resume: resume };

  var EXTRA_SPACING = 50;
  var data = 'data-' + $_5qzh4bzejdud7f0y.resolve('last-outer-height');
  var setLastHeight = function (cBody, value) {
    $_2vghk1xrjdud7ems.set(cBody, data, value);
  };
  var getLastHeight = function (cBody) {
    return $_1bs4n9147jdud7fsm.safeParse(cBody, data);
  };
  var getBoundsFrom = function (rect) {
    return {
      top: $_9njj9iwjjdud7eix.constant(rect.top()),
      bottom: $_9njj9iwjjdud7eix.constant(rect.top() + rect.height())
    };
  };
  var getBounds$2 = function (cWin) {
    var rects = $_5lp8kt148jdud7fso.getRectangles(cWin);
    return rects.length > 0 ? Option.some(rects[0]).map(getBoundsFrom) : Option.none();
  };
  var findDelta = function (outerWindow, cBody) {
    var last = getLastHeight(cBody);
    var current = outerWindow.innerHeight;
    return last > current ? Option.some(last - current) : Option.none();
  };
  var calculate = function (cWin, bounds, delta) {
    var isOutside = bounds.top() > cWin.innerHeight || bounds.bottom() > cWin.innerHeight;
    return isOutside ? Math.min(delta, bounds.bottom() - cWin.innerHeight + EXTRA_SPACING) : 0;
  };
  var setup$1 = function (outerWindow, cWin) {
    var cBody = $_eobgtqxfjdud7elu.fromDom(cWin.document.body);
    var toEditing = function () {
      $_5gl66x14rjdud7fuu.resume(cWin);
    };
    var onResize = $_5x7hr513xjdud7fqz.bind($_eobgtqxfjdud7elu.fromDom(outerWindow), 'resize', function () {
      findDelta(outerWindow, cBody).each(function (delta) {
        getBounds$2(cWin).each(function (bounds) {
          var cScrollBy = calculate(cWin, bounds, delta);
          if (cScrollBy !== 0) {
            cWin.scrollTo(cWin.pageXOffset, cWin.pageYOffset + cScrollBy);
          }
        });
      });
      setLastHeight(cBody, outerWindow.innerHeight);
    });
    setLastHeight(cBody, outerWindow.innerHeight);
    var destroy = function () {
      onResize.unbind();
    };
    return {
      toEditing: toEditing,
      destroy: destroy
    };
  };
  var $_d23om146jdud7fsf = { setup: setup$1 };

  var getBodyFromFrame = function (frame) {
    return Option.some($_eobgtqxfjdud7elu.fromDom(frame.dom().contentWindow.document.body));
  };
  var getDocFromFrame = function (frame) {
    return Option.some($_eobgtqxfjdud7elu.fromDom(frame.dom().contentWindow.document));
  };
  var getWinFromFrame = function (frame) {
    return Option.from(frame.dom().contentWindow);
  };
  var getSelectionFromFrame = function (frame) {
    var optWin = getWinFromFrame(frame);
    return optWin.bind($_af4mx314ejdud7ftd.getExact);
  };
  var getFrame = function (editor) {
    return editor.getFrame();
  };
  var getOrDerive = function (name, f) {
    return function (editor) {
      var g = editor[name].getOrThunk(function () {
        var frame = getFrame(editor);
        return function () {
          return f(frame);
        };
      });
      return g();
    };
  };
  var getOrListen = function (editor, doc, name, type) {
    return editor[name].getOrThunk(function () {
      return function (handler) {
        return $_5x7hr513xjdud7fqz.bind(doc, type, handler);
      };
    });
  };
  var toRect$2 = function (rect) {
    return {
      left: $_9njj9iwjjdud7eix.constant(rect.left),
      top: $_9njj9iwjjdud7eix.constant(rect.top),
      right: $_9njj9iwjjdud7eix.constant(rect.right),
      bottom: $_9njj9iwjjdud7eix.constant(rect.bottom),
      width: $_9njj9iwjjdud7eix.constant(rect.width),
      height: $_9njj9iwjjdud7eix.constant(rect.height)
    };
  };
  var getActiveApi = function (editor) {
    var frame = getFrame(editor);
    var tryFallbackBox = function (win) {
      var isCollapsed = function (sel) {
        return $_f1y1rtx9jdud7el7.eq(sel.start(), sel.finish()) && sel.soffset() === sel.foffset();
      };
      var toStartRect = function (sel) {
        var rect = sel.start().dom().getBoundingClientRect();
        return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect$2) : Option.none();
      };
      return $_af4mx314ejdud7ftd.getExact(win).filter(isCollapsed).bind(toStartRect);
    };
    return getBodyFromFrame(frame).bind(function (body) {
      return getDocFromFrame(frame).bind(function (doc) {
        return getWinFromFrame(frame).map(function (win) {
          var html = $_eobgtqxfjdud7elu.fromDom(doc.dom().documentElement);
          var getCursorBox = editor.getCursorBox.getOrThunk(function () {
            return function () {
              return $_af4mx314ejdud7ftd.get(win).bind(function (sel) {
                return $_af4mx314ejdud7ftd.getFirstRect(win, sel).orThunk(function () {
                  return tryFallbackBox(win);
                });
              });
            };
          });
          var setSelection = editor.setSelection.getOrThunk(function () {
            return function (start, soffset, finish, foffset) {
              $_af4mx314ejdud7ftd.setExact(win, start, soffset, finish, foffset);
            };
          });
          var clearSelection = editor.clearSelection.getOrThunk(function () {
            return function () {
              $_af4mx314ejdud7ftd.clear(win);
            };
          });
          return {
            body: $_9njj9iwjjdud7eix.constant(body),
            doc: $_9njj9iwjjdud7eix.constant(doc),
            win: $_9njj9iwjjdud7eix.constant(win),
            html: $_9njj9iwjjdud7eix.constant(html),
            getSelection: $_9njj9iwjjdud7eix.curry(getSelectionFromFrame, frame),
            setSelection: setSelection,
            clearSelection: clearSelection,
            frame: $_9njj9iwjjdud7eix.constant(frame),
            onKeyup: getOrListen(editor, doc, 'onKeyup', 'keyup'),
            onNodeChanged: getOrListen(editor, doc, 'onNodeChanged', 'selectionchange'),
            onDomChanged: editor.onDomChanged,
            onScrollToCursor: editor.onScrollToCursor,
            onScrollToElement: editor.onScrollToElement,
            onToReading: editor.onToReading,
            onToEditing: editor.onToEditing,
            onToolbarScrollStart: editor.onToolbarScrollStart,
            onTouchContent: editor.onTouchContent,
            onTapContent: editor.onTapContent,
            onTouchToolstrip: editor.onTouchToolstrip,
            getCursorBox: getCursorBox
          };
        });
      });
    });
  };
  var $_8faw2r14sjdud7fv0 = {
    getBody: getOrDerive('getBody', getBodyFromFrame),
    getDoc: getOrDerive('getDoc', getDocFromFrame),
    getWin: getOrDerive('getWin', getWinFromFrame),
    getSelection: getOrDerive('getSelection', getSelectionFromFrame),
    getFrame: getFrame,
    getActiveApi: getActiveApi
  };

  var attr = 'data-ephox-mobile-fullscreen-style';
  var siblingStyles = 'display:none!important;';
  var ancestorPosition = 'position:absolute!important;';
  var ancestorStyles = 'top:0!important;left:0!important;margin:0' + '!important;padding:0!important;width:100%!important;';
  var bgFallback = 'background-color:rgb(255,255,255)!important;';
  var isAndroid = $_chh2cvwkjdud7ej0.detect().os.isAndroid();
  var matchColor = function (editorBody) {
    var color = $_btgbcy103jdud7f3t.get(editorBody, 'background-color');
    return color !== undefined && color !== '' ? 'background-color:' + color + '!important' : bgFallback;
  };
  var clobberStyles = function (container, editorBody) {
    var gatherSibilings = function (element) {
      var siblings = $_df6s98zvjdud7f39.siblings(element, '*');
      return siblings;
    };
    var clobber = function (clobberStyle) {
      return function (element) {
        var styles = $_2vghk1xrjdud7ems.get(element, 'style');
        var backup = styles === undefined ? 'no-styles' : styles.trim();
        if (backup === clobberStyle) {
          return;
        } else {
          $_2vghk1xrjdud7ems.set(element, attr, backup);
          $_2vghk1xrjdud7ems.set(element, 'style', clobberStyle);
        }
      };
    };
    var ancestors = $_df6s98zvjdud7f39.ancestors(container, '*');
    var siblings = $_1g2cevwsjdud7ejp.bind(ancestors, gatherSibilings);
    var bgColor = matchColor(editorBody);
    $_1g2cevwsjdud7ejp.each(siblings, clobber(siblingStyles));
    $_1g2cevwsjdud7ejp.each(ancestors, clobber(ancestorPosition + ancestorStyles + bgColor));
    var containerStyles = isAndroid === true ? '' : ancestorPosition;
    clobber(containerStyles + ancestorStyles + bgColor)(container);
  };
  var restoreStyles = function () {
    var clobberedEls = $_df6s98zvjdud7f39.all('[' + attr + ']');
    $_1g2cevwsjdud7ejp.each(clobberedEls, function (element) {
      var restore = $_2vghk1xrjdud7ems.get(element, attr);
      if (restore !== 'no-styles') {
        $_2vghk1xrjdud7ems.set(element, 'style', restore);
      } else {
        $_2vghk1xrjdud7ems.remove(element, 'style');
      }
      $_2vghk1xrjdud7ems.remove(element, attr);
    });
  };
  var $_fjm65f14tjdud7fv9 = {
    clobberStyles: clobberStyles,
    restoreStyles: restoreStyles
  };

  var tag = function () {
    var head = $_a3quyizxjdud7f3e.first('head').getOrDie();
    var nu = function () {
      var meta = $_eobgtqxfjdud7elu.fromTag('meta');
      $_2vghk1xrjdud7ems.set(meta, 'name', 'viewport');
      $_ftkbb5x2jdud7ekp.append(head, meta);
      return meta;
    };
    var element = $_a3quyizxjdud7f3e.first('meta[name="viewport"]').getOrThunk(nu);
    var backup = $_2vghk1xrjdud7ems.get(element, 'content');
    var maximize = function () {
      $_2vghk1xrjdud7ems.set(element, 'content', 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0');
    };
    var restore = function () {
      if (backup !== undefined && backup !== null && backup.length > 0) {
        $_2vghk1xrjdud7ems.set(element, 'content', backup);
      } else {
        $_2vghk1xrjdud7ems.set(element, 'content', 'user-scalable=yes');
      }
    };
    return {
      maximize: maximize,
      restore: restore
    };
  };
  var $_9dstax14ujdud7fvm = { tag: tag };

  var create$5 = function (platform, mask) {
    var meta = $_9dstax14ujdud7fvm.tag();
    var androidApi = $_9fhyae12ojdud7fij.api();
    var androidEvents = $_9fhyae12ojdud7fij.api();
    var enter = function () {
      mask.hide();
      $_1x3ogvynjdud7exn.add(platform.container, $_5qzh4bzejdud7f0y.resolve('fullscreen-maximized'));
      $_1x3ogvynjdud7exn.add(platform.container, $_5qzh4bzejdud7f0y.resolve('android-maximized'));
      meta.maximize();
      $_1x3ogvynjdud7exn.add(platform.body, $_5qzh4bzejdud7f0y.resolve('android-scroll-reload'));
      androidApi.set($_d23om146jdud7fsf.setup(platform.win, $_8faw2r14sjdud7fv0.getWin(platform.editor).getOrDie('no')));
      $_8faw2r14sjdud7fv0.getActiveApi(platform.editor).each(function (editorApi) {
        $_fjm65f14tjdud7fv9.clobberStyles(platform.container, editorApi.body());
        androidEvents.set($_bywc5s142jdud7frq.initEvents(editorApi, platform.toolstrip, platform.alloy));
      });
    };
    var exit = function () {
      meta.restore();
      mask.show();
      $_1x3ogvynjdud7exn.remove(platform.container, $_5qzh4bzejdud7f0y.resolve('fullscreen-maximized'));
      $_1x3ogvynjdud7exn.remove(platform.container, $_5qzh4bzejdud7f0y.resolve('android-maximized'));
      $_fjm65f14tjdud7fv9.restoreStyles();
      $_1x3ogvynjdud7exn.remove(platform.body, $_5qzh4bzejdud7f0y.resolve('android-scroll-reload'));
      androidEvents.clear();
      androidApi.clear();
    };
    return {
      enter: enter,
      exit: exit
    };
  };
  var $_zs0oa141jdud7frl = { create: create$5 };

  var adaptable = function (fn, rate) {
    var timer = null;
    var args = null;
    var cancel = function () {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
        args = null;
      }
    };
    var throttle = function () {
      args = arguments;
      if (timer === null) {
        timer = setTimeout(function () {
          fn.apply(null, args);
          timer = null;
          args = null;
        }, rate);
      }
    };
    return {
      cancel: cancel,
      throttle: throttle
    };
  };
  var first$4 = function (fn, rate) {
    var timer = null;
    var cancel = function () {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };
    var throttle = function () {
      var args = arguments;
      if (timer === null) {
        timer = setTimeout(function () {
          fn.apply(null, args);
          timer = null;
          args = null;
        }, rate);
      }
    };
    return {
      cancel: cancel,
      throttle: throttle
    };
  };
  var last$3 = function (fn, rate) {
    var timer = null;
    var cancel = function () {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };
    var throttle = function () {
      var args = arguments;
      if (timer !== null)
        clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(null, args);
        timer = null;
        args = null;
      }, rate);
    };
    return {
      cancel: cancel,
      throttle: throttle
    };
  };
  var $_dfio3v14wjdud7fvy = {
    adaptable: adaptable,
    first: first$4,
    last: last$3
  };

  var sketch$10 = function (onView, translate) {
    var memIcon = $_81ial811rjdud7fdw.record(Container.sketch({
      dom: $_5oi2c7113jdud7fab.dom('<div aria-hidden="true" class="${prefix}-mask-tap-icon"></div>'),
      containerBehaviours: $_ax1gfoy2jdud7eu7.derive([Toggling.config({
          toggleClass: $_5qzh4bzejdud7f0y.resolve('mask-tap-icon-selected'),
          toggleOnExecute: false
        })])
    }));
    var onViewThrottle = $_dfio3v14wjdud7fvy.first(onView, 200);
    return Container.sketch({
      dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-disabled-mask"></div>'),
      components: [Container.sketch({
          dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-content-container"></div>'),
          components: [Button.sketch({
              dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-content-tap-section"></div>'),
              components: [memIcon.asSpec()],
              action: function (button) {
                onViewThrottle.throttle();
              },
              buttonBehaviours: $_ax1gfoy2jdud7eu7.derive([Toggling.config({ toggleClass: $_5qzh4bzejdud7f0y.resolve('mask-tap-icon-selected') })])
            })]
        })]
    });
  };
  var $_ddqihl14vjdud7fvr = { sketch: sketch$10 };

  var MobileSchema = $_13hkebyejdud7ewm.objOf([
    $_euqmtby7jdud7ev7.strictObjOf('editor', [
      $_euqmtby7jdud7ev7.strict('getFrame'),
      $_euqmtby7jdud7ev7.option('getBody'),
      $_euqmtby7jdud7ev7.option('getDoc'),
      $_euqmtby7jdud7ev7.option('getWin'),
      $_euqmtby7jdud7ev7.option('getSelection'),
      $_euqmtby7jdud7ev7.option('setSelection'),
      $_euqmtby7jdud7ev7.option('clearSelection'),
      $_euqmtby7jdud7ev7.option('cursorSaver'),
      $_euqmtby7jdud7ev7.option('onKeyup'),
      $_euqmtby7jdud7ev7.option('onNodeChanged'),
      $_euqmtby7jdud7ev7.option('getCursorBox'),
      $_euqmtby7jdud7ev7.strict('onDomChanged'),
      $_euqmtby7jdud7ev7.defaulted('onTouchContent', $_9njj9iwjjdud7eix.noop),
      $_euqmtby7jdud7ev7.defaulted('onTapContent', $_9njj9iwjjdud7eix.noop),
      $_euqmtby7jdud7ev7.defaulted('onTouchToolstrip', $_9njj9iwjjdud7eix.noop),
      $_euqmtby7jdud7ev7.defaulted('onScrollToCursor', $_9njj9iwjjdud7eix.constant({ unbind: $_9njj9iwjjdud7eix.noop })),
      $_euqmtby7jdud7ev7.defaulted('onScrollToElement', $_9njj9iwjjdud7eix.constant({ unbind: $_9njj9iwjjdud7eix.noop })),
      $_euqmtby7jdud7ev7.defaulted('onToEditing', $_9njj9iwjjdud7eix.constant({ unbind: $_9njj9iwjjdud7eix.noop })),
      $_euqmtby7jdud7ev7.defaulted('onToReading', $_9njj9iwjjdud7eix.constant({ unbind: $_9njj9iwjjdud7eix.noop })),
      $_euqmtby7jdud7ev7.defaulted('onToolbarScrollStart', $_9njj9iwjjdud7eix.identity)
    ]),
    $_euqmtby7jdud7ev7.strict('socket'),
    $_euqmtby7jdud7ev7.strict('toolstrip'),
    $_euqmtby7jdud7ev7.strict('dropup'),
    $_euqmtby7jdud7ev7.strict('toolbar'),
    $_euqmtby7jdud7ev7.strict('container'),
    $_euqmtby7jdud7ev7.strict('alloy'),
    $_euqmtby7jdud7ev7.state('win', function (spec) {
      return $_dekwe2x3jdud7ekr.owner(spec.socket).dom().defaultView;
    }),
    $_euqmtby7jdud7ev7.state('body', function (spec) {
      return $_eobgtqxfjdud7elu.fromDom(spec.socket.dom().ownerDocument.body);
    }),
    $_euqmtby7jdud7ev7.defaulted('translate', $_9njj9iwjjdud7eix.identity),
    $_euqmtby7jdud7ev7.defaulted('setReadOnly', $_9njj9iwjjdud7eix.noop)
  ]);

  var produce = function (raw) {
    var mobile = $_13hkebyejdud7ewm.asRawOrDie('Getting AndroidWebapp schema', MobileSchema, raw);
    $_btgbcy103jdud7f3t.set(mobile.toolstrip, 'width', '100%');
    var onTap = function () {
      mobile.setReadOnly(true);
      mode.enter();
    };
    var mask = $_ap2ej712tjdud7fjl.build($_ddqihl14vjdud7fvr.sketch(onTap, mobile.translate));
    mobile.alloy.add(mask);
    var maskApi = {
      show: function () {
        mobile.alloy.add(mask);
      },
      hide: function () {
        mobile.alloy.remove(mask);
      }
    };
    $_ftkbb5x2jdud7ekp.append(mobile.container, mask.element());
    var mode = $_zs0oa141jdud7frl.create(mobile, maskApi);
    return {
      setReadOnly: mobile.setReadOnly,
      refreshStructure: $_9njj9iwjjdud7eix.noop,
      enter: mode.enter,
      exit: mode.exit,
      destroy: $_9njj9iwjjdud7eix.noop
    };
  };
  var $_bip6sv140jdud7fra = { produce: produce };

  var schema$14 = [
    $_euqmtby7jdud7ev7.defaulted('shell', true),
    $_c7jpu210ojdud7f7a.field('toolbarBehaviours', [Replacing])
  ];
  var enhanceGroups = function (detail) {
    return { behaviours: $_ax1gfoy2jdud7eu7.derive([Replacing.config({})]) };
  };
  var partTypes$1 = [$_7938qf10vjdud7f8n.optional({
      name: 'groups',
      overrides: enhanceGroups
    })];
  var $_u7c81150jdud7fwn = {
    name: $_9njj9iwjjdud7eix.constant('Toolbar'),
    schema: $_9njj9iwjjdud7eix.constant(schema$14),
    parts: $_9njj9iwjjdud7eix.constant(partTypes$1)
  };

  var factory$4 = function (detail, components, spec, _externals) {
    var setGroups = function (toolbar, groups) {
      getGroupContainer(toolbar).fold(function () {
        console.error('Toolbar was defined to not be a shell, but no groups container was specified in components');
        throw new Error('Toolbar was defined to not be a shell, but no groups container was specified in components');
      }, function (container) {
        Replacing.set(container, groups);
      });
    };
    var getGroupContainer = function (component) {
      return detail.shell() ? Option.some(component) : $_436kgb10tjdud7f7y.getPart(component, detail, 'groups');
    };
    var extra = detail.shell() ? {
      behaviours: [Replacing.config({})],
      components: []
    } : {
      behaviours: [],
      components: components
    };
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: extra.components,
      behaviours: $_73qnwowyjdud7ek9.deepMerge($_ax1gfoy2jdud7eu7.derive(extra.behaviours), $_c7jpu210ojdud7f7a.get(detail.toolbarBehaviours())),
      apis: { setGroups: setGroups },
      domModification: { attributes: { role: 'group' } }
    };
  };
  var Toolbar = $_3inyq310pjdud7f7f.composite({
    name: 'Toolbar',
    configFields: $_u7c81150jdud7fwn.schema(),
    partFields: $_u7c81150jdud7fwn.parts(),
    factory: factory$4,
    apis: {
      setGroups: function (apis, toolbar, groups) {
        apis.setGroups(toolbar, groups);
      }
    }
  });

  var schema$15 = [
    $_euqmtby7jdud7ev7.strict('items'),
    $_etkinez6jdud7ezi.markers(['itemClass']),
    $_c7jpu210ojdud7f7a.field('tgroupBehaviours', [Keying])
  ];
  var partTypes$2 = [$_7938qf10vjdud7f8n.group({
      name: 'items',
      unit: 'item',
      overrides: function (detail) {
        return { domModification: { classes: [detail.markers().itemClass()] } };
      }
    })];
  var $_3to63152jdud7fwu = {
    name: $_9njj9iwjjdud7eix.constant('ToolbarGroup'),
    schema: $_9njj9iwjjdud7eix.constant(schema$15),
    parts: $_9njj9iwjjdud7eix.constant(partTypes$2)
  };

  var factory$5 = function (detail, components, spec, _externals) {
    return $_73qnwowyjdud7ek9.deepMerge({ dom: { attributes: { role: 'toolbar' } } }, {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_73qnwowyjdud7ek9.deepMerge($_ax1gfoy2jdud7eu7.derive([Keying.config({
          mode: 'flow',
          selector: '.' + detail.markers().itemClass()
        })]), $_c7jpu210ojdud7f7a.get(detail.tgroupBehaviours())),
      'debug.sketcher': spec['debug.sketcher']
    });
  };
  var ToolbarGroup = $_3inyq310pjdud7f7f.composite({
    name: 'ToolbarGroup',
    configFields: $_3to63152jdud7fwu.schema(),
    partFields: $_3to63152jdud7fwu.parts(),
    factory: factory$5
  });

  var dataHorizontal = 'data-' + $_5qzh4bzejdud7f0y.resolve('horizontal-scroll');
  var canScrollVertically = function (container) {
    container.dom().scrollTop = 1;
    var result = container.dom().scrollTop !== 0;
    container.dom().scrollTop = 0;
    return result;
  };
  var canScrollHorizontally = function (container) {
    container.dom().scrollLeft = 1;
    var result = container.dom().scrollLeft !== 0;
    container.dom().scrollLeft = 0;
    return result;
  };
  var hasVerticalScroll = function (container) {
    return container.dom().scrollTop > 0 || canScrollVertically(container);
  };
  var hasHorizontalScroll = function (container) {
    return container.dom().scrollLeft > 0 || canScrollHorizontally(container);
  };
  var markAsHorizontal = function (container) {
    $_2vghk1xrjdud7ems.set(container, dataHorizontal, 'true');
  };
  var hasScroll = function (container) {
    return $_2vghk1xrjdud7ems.get(container, dataHorizontal) === 'true' ? hasHorizontalScroll : hasVerticalScroll;
  };
  var exclusive = function (scope, selector) {
    return $_5x7hr513xjdud7fqz.bind(scope, 'touchmove', function (event) {
      $_a3quyizxjdud7f3e.closest(event.target(), selector).filter(hasScroll).fold(function () {
        event.raw().preventDefault();
      }, $_9njj9iwjjdud7eix.noop);
    });
  };
  var $_dvdycr153jdud7fwy = {
    exclusive: exclusive,
    markAsHorizontal: markAsHorizontal
  };

  function ScrollingToolbar () {
    var makeGroup = function (gSpec) {
      var scrollClass = gSpec.scrollable === true ? '${prefix}-toolbar-scrollable-group' : '';
      return {
        dom: $_5oi2c7113jdud7fab.dom('<div aria-label="' + gSpec.label + '" class="${prefix}-toolbar-group ' + scrollClass + '"></div>'),
        tgroupBehaviours: $_ax1gfoy2jdud7eu7.derive([$_6jfkt3126jdud7ffy.config('adhoc-scrollable-toolbar', gSpec.scrollable === true ? [$_5xcuyiy4jdud7eur.runOnInit(function (component, simulatedEvent) {
              $_btgbcy103jdud7f3t.set(component.element(), 'overflow-x', 'auto');
              $_dvdycr153jdud7fwy.markAsHorizontal(component.element());
              $_bhtyzh13ujdud7fqk.register(component.element());
            })] : [])]),
        components: [Container.sketch({ components: [ToolbarGroup.parts().items({})] })],
        markers: { itemClass: $_5qzh4bzejdud7f0y.resolve('toolbar-group-item') },
        items: gSpec.items
      };
    };
    var toolbar = $_ap2ej712tjdud7fjl.build(Toolbar.sketch({
      dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-toolbar"></div>'),
      components: [Toolbar.parts().groups({})],
      toolbarBehaviours: $_ax1gfoy2jdud7eu7.derive([
        Toggling.config({
          toggleClass: $_5qzh4bzejdud7f0y.resolve('context-toolbar'),
          toggleOnExecute: false,
          aria: { mode: 'none' }
        }),
        Keying.config({ mode: 'cyclic' })
      ]),
      shell: true
    }));
    var wrapper = $_ap2ej712tjdud7fjl.build(Container.sketch({
      dom: { classes: [$_5qzh4bzejdud7f0y.resolve('toolstrip')] },
      components: [$_ap2ej712tjdud7fjl.premade(toolbar)],
      containerBehaviours: $_ax1gfoy2jdud7eu7.derive([Toggling.config({
          toggleClass: $_5qzh4bzejdud7f0y.resolve('android-selection-context-toolbar'),
          toggleOnExecute: false
        })])
    }));
    var resetGroups = function () {
      Toolbar.setGroups(toolbar, initGroups.get());
      Toggling.off(toolbar);
    };
    var initGroups = Cell([]);
    var setGroups = function (gs) {
      initGroups.set(gs);
      resetGroups();
    };
    var createGroups = function (gs) {
      return $_1g2cevwsjdud7ejp.map(gs, $_9njj9iwjjdud7eix.compose(ToolbarGroup.sketch, makeGroup));
    };
    var refresh = function () {
      Toolbar.refresh(toolbar);
    };
    var setContextToolbar = function (gs) {
      Toggling.on(toolbar);
      Toolbar.setGroups(toolbar, gs);
    };
    var restoreToolbar = function () {
      if (Toggling.isOn(toolbar)) {
        resetGroups();
      }
    };
    var focus = function () {
      Keying.focusIn(toolbar);
    };
    return {
      wrapper: $_9njj9iwjjdud7eix.constant(wrapper),
      toolbar: $_9njj9iwjjdud7eix.constant(toolbar),
      createGroups: createGroups,
      setGroups: setGroups,
      setContextToolbar: setContextToolbar,
      restoreToolbar: restoreToolbar,
      refresh: refresh,
      focus: focus
    };
  }

  var makeEditSwitch = function (webapp) {
    return $_ap2ej712tjdud7fjl.build(Button.sketch({
      dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-mask-edit-icon ${prefix}-icon"></div>'),
      action: function () {
        webapp.run(function (w) {
          w.setReadOnly(false);
        });
      }
    }));
  };
  var makeSocket = function () {
    return $_ap2ej712tjdud7fjl.build(Container.sketch({
      dom: $_5oi2c7113jdud7fab.dom('<div class="${prefix}-editor-socket"></div>'),
      components: [],
      containerBehaviours: $_ax1gfoy2jdud7eu7.derive([Replacing.config({})])
    }));
  };
  var showEdit = function (socket, switchToEdit) {
    Replacing.append(socket, $_ap2ej712tjdud7fjl.premade(switchToEdit));
  };
  var hideEdit = function (socket, switchToEdit) {
    Replacing.remove(socket, switchToEdit);
  };
  var updateMode = function (socket, switchToEdit, readOnly, root) {
    var swap = readOnly === true ? Swapping.toAlpha : Swapping.toOmega;
    swap(root);
    var f = readOnly ? showEdit : hideEdit;
    f(socket, switchToEdit);
  };
  var $_enp5ds154jdud7fxb = {
    makeEditSwitch: makeEditSwitch,
    makeSocket: makeSocket,
    updateMode: updateMode
  };

  var getAnimationRoot = function (component, slideConfig) {
    return slideConfig.getAnimationRoot().fold(function () {
      return component.element();
    }, function (get) {
      return get(component);
    });
  };
  var getDimensionProperty = function (slideConfig) {
    return slideConfig.dimension().property();
  };
  var getDimension = function (slideConfig, elem) {
    return slideConfig.dimension().getDimension()(elem);
  };
  var disableTransitions = function (component, slideConfig) {
    var root = getAnimationRoot(component, slideConfig);
    $_af5dkc137jdud7fms.remove(root, [
      slideConfig.shrinkingClass(),
      slideConfig.growingClass()
    ]);
  };
  var setShrunk = function (component, slideConfig) {
    $_1x3ogvynjdud7exn.remove(component.element(), slideConfig.openClass());
    $_1x3ogvynjdud7exn.add(component.element(), slideConfig.closedClass());
    $_btgbcy103jdud7f3t.set(component.element(), getDimensionProperty(slideConfig), '0px');
    $_btgbcy103jdud7f3t.reflow(component.element());
  };
  var measureTargetSize = function (component, slideConfig) {
    setGrown(component, slideConfig);
    var expanded = getDimension(slideConfig, component.element());
    setShrunk(component, slideConfig);
    return expanded;
  };
  var setGrown = function (component, slideConfig) {
    $_1x3ogvynjdud7exn.remove(component.element(), slideConfig.closedClass());
    $_1x3ogvynjdud7exn.add(component.element(), slideConfig.openClass());
    $_btgbcy103jdud7f3t.remove(component.element(), getDimensionProperty(slideConfig));
  };
  var doImmediateShrink = function (component, slideConfig, slideState) {
    slideState.setCollapsed();
    $_btgbcy103jdud7f3t.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
    $_btgbcy103jdud7f3t.reflow(component.element());
    disableTransitions(component, slideConfig);
    setShrunk(component, slideConfig);
    slideConfig.onStartShrink()(component);
    slideConfig.onShrunk()(component);
  };
  var doStartShrink = function (component, slideConfig, slideState) {
    slideState.setCollapsed();
    $_btgbcy103jdud7f3t.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
    $_btgbcy103jdud7f3t.reflow(component.element());
    var root = getAnimationRoot(component, slideConfig);
    $_1x3ogvynjdud7exn.add(root, slideConfig.shrinkingClass());
    setShrunk(component, slideConfig);
    slideConfig.onStartShrink()(component);
  };
  var doStartGrow = function (component, slideConfig, slideState) {
    var fullSize = measureTargetSize(component, slideConfig);
    var root = getAnimationRoot(component, slideConfig);
    $_1x3ogvynjdud7exn.add(root, slideConfig.growingClass());
    setGrown(component, slideConfig);
    $_btgbcy103jdud7f3t.set(component.element(), getDimensionProperty(slideConfig), fullSize);
    slideState.setExpanded();
    slideConfig.onStartGrow()(component);
  };
  var grow = function (component, slideConfig, slideState) {
    if (!slideState.isExpanded())
      doStartGrow(component, slideConfig, slideState);
  };
  var shrink = function (component, slideConfig, slideState) {
    if (slideState.isExpanded())
      doStartShrink(component, slideConfig, slideState);
  };
  var immediateShrink = function (component, slideConfig, slideState) {
    if (slideState.isExpanded())
      doImmediateShrink(component, slideConfig, slideState);
  };
  var hasGrown = function (component, slideConfig, slideState) {
    return slideState.isExpanded();
  };
  var hasShrunk = function (component, slideConfig, slideState) {
    return slideState.isCollapsed();
  };
  var isGrowing = function (component, slideConfig, slideState) {
    var root = getAnimationRoot(component, slideConfig);
    return $_1x3ogvynjdud7exn.has(root, slideConfig.growingClass()) === true;
  };
  var isShrinking = function (component, slideConfig, slideState) {
    var root = getAnimationRoot(component, slideConfig);
    return $_1x3ogvynjdud7exn.has(root, slideConfig.shrinkingClass()) === true;
  };
  var isTransitioning = function (component, slideConfig, slideState) {
    return isGrowing(component, slideConfig, slideState) === true || isShrinking(component, slideConfig, slideState) === true;
  };
  var toggleGrow = function (component, slideConfig, slideState) {
    var f = slideState.isExpanded() ? doStartShrink : doStartGrow;
    f(component, slideConfig, slideState);
  };
  var $_47f52a158jdud7fxy = {
    grow: grow,
    shrink: shrink,
    immediateShrink: immediateShrink,
    hasGrown: hasGrown,
    hasShrunk: hasShrunk,
    isGrowing: isGrowing,
    isShrinking: isShrinking,
    isTransitioning: isTransitioning,
    toggleGrow: toggleGrow,
    disableTransitions: disableTransitions
  };

  var exhibit$5 = function (base, slideConfig) {
    var expanded = slideConfig.expanded();
    return expanded ? $_biiw3tyhjdud7ewz.nu({
      classes: [slideConfig.openClass()],
      styles: {}
    }) : $_biiw3tyhjdud7ewz.nu({
      classes: [slideConfig.closedClass()],
      styles: $_ettibkxsjdud7emz.wrap(slideConfig.dimension().property(), '0px')
    });
  };
  var events$9 = function (slideConfig, slideState) {
    return $_5xcuyiy4jdud7eur.derive([$_5xcuyiy4jdud7eur.run($_brmbwvwijdud7eiu.transitionend(), function (component, simulatedEvent) {
        var raw = simulatedEvent.event().raw();
        if (raw.propertyName === slideConfig.dimension().property()) {
          $_47f52a158jdud7fxy.disableTransitions(component, slideConfig, slideState);
          if (slideState.isExpanded())
            $_btgbcy103jdud7f3t.remove(component.element(), slideConfig.dimension().property());
          var notify = slideState.isExpanded() ? slideConfig.onGrown() : slideConfig.onShrunk();
          notify(component, simulatedEvent);
        }
      })]);
  };
  var $_ao9shj157jdud7fxr = {
    exhibit: exhibit$5,
    events: events$9
  };

  var SlidingSchema = [
    $_euqmtby7jdud7ev7.strict('closedClass'),
    $_euqmtby7jdud7ev7.strict('openClass'),
    $_euqmtby7jdud7ev7.strict('shrinkingClass'),
    $_euqmtby7jdud7ev7.strict('growingClass'),
    $_euqmtby7jdud7ev7.option('getAnimationRoot'),
    $_etkinez6jdud7ezi.onHandler('onShrunk'),
    $_etkinez6jdud7ezi.onHandler('onStartShrink'),
    $_etkinez6jdud7ezi.onHandler('onGrown'),
    $_etkinez6jdud7ezi.onHandler('onStartGrow'),
    $_euqmtby7jdud7ev7.defaulted('expanded', false),
    $_euqmtby7jdud7ev7.strictOf('dimension', $_13hkebyejdud7ewm.choose('property', {
      width: [
        $_etkinez6jdud7ezi.output('property', 'width'),
        $_etkinez6jdud7ezi.output('getDimension', function (elem) {
          return $_6chz3611kjdud7fcw.get(elem) + 'px';
        })
      ],
      height: [
        $_etkinez6jdud7ezi.output('property', 'height'),
        $_etkinez6jdud7ezi.output('getDimension', function (elem) {
          return $_q9861102jdud7f3r.get(elem) + 'px';
        })
      ]
    }))
  ];

  var init$4 = function (spec) {
    var state = Cell(spec.expanded());
    var readState = function () {
      return 'expanded: ' + state.get();
    };
    return BehaviourState({
      isExpanded: function () {
        return state.get() === true;
      },
      isCollapsed: function () {
        return state.get() === false;
      },
      setCollapsed: $_9njj9iwjjdud7eix.curry(state.set, false),
      setExpanded: $_9njj9iwjjdud7eix.curry(state.set, true),
      readState: readState
    });
  };
  var $_f26cpi15ajdud7fyb = { init: init$4 };

  var Sliding = $_ax1gfoy2jdud7eu7.create({
    fields: SlidingSchema,
    name: 'sliding',
    active: $_ao9shj157jdud7fxr,
    apis: $_47f52a158jdud7fxy,
    state: $_f26cpi15ajdud7fyb
  });

  var build$2 = function (refresh, scrollIntoView) {
    var dropup = $_ap2ej712tjdud7fjl.build(Container.sketch({
      dom: {
        tag: 'div',
        classes: $_5qzh4bzejdud7f0y.resolve('dropup')
      },
      components: [],
      containerBehaviours: $_ax1gfoy2jdud7eu7.derive([
        Replacing.config({}),
        Sliding.config({
          closedClass: $_5qzh4bzejdud7f0y.resolve('dropup-closed'),
          openClass: $_5qzh4bzejdud7f0y.resolve('dropup-open'),
          shrinkingClass: $_5qzh4bzejdud7f0y.resolve('dropup-shrinking'),
          growingClass: $_5qzh4bzejdud7f0y.resolve('dropup-growing'),
          dimension: { property: 'height' },
          onShrunk: function (component) {
            refresh();
            scrollIntoView();
            Replacing.set(component, []);
          },
          onGrown: function (component) {
            refresh();
            scrollIntoView();
          }
        }),
        $_nw25bzdjdud7f0v.orientation(function (component, data) {
          disappear($_9njj9iwjjdud7eix.noop);
        })
      ])
    }));
    var appear = function (menu, update, component) {
      if (Sliding.hasShrunk(dropup) === true && Sliding.isTransitioning(dropup) === false) {
        window.requestAnimationFrame(function () {
          update(component);
          Replacing.set(dropup, [menu()]);
          Sliding.grow(dropup);
        });
      }
    };
    var disappear = function (onReadyToShrink) {
      window.requestAnimationFrame(function () {
        onReadyToShrink();
        Sliding.shrink(dropup);
      });
    };
    return {
      appear: appear,
      disappear: disappear,
      component: $_9njj9iwjjdud7eix.constant(dropup),
      element: dropup.element
    };
  };
  var $_9ihizd155jdud7fxi = { build: build$2 };

  var isDangerous = function (event) {
    return event.raw().which === $_8y8vdkzpjdud7f2d.BACKSPACE()[0] && !$_1g2cevwsjdud7ejp.contains([
      'input',
      'textarea'
    ], $_50qkdpxkjdud7em6.name(event.target()));
  };
  var isFirefox = $_chh2cvwkjdud7ej0.detect().browser.isFirefox();
  var settingsSchema = $_13hkebyejdud7ewm.objOfOnly([
    $_euqmtby7jdud7ev7.strictFunction('triggerEvent'),
    $_euqmtby7jdud7ev7.strictFunction('broadcastEvent'),
    $_euqmtby7jdud7ev7.defaulted('stopBackspace', true)
  ]);
  var bindFocus = function (container, handler) {
    if (isFirefox) {
      return $_5x7hr513xjdud7fqz.capture(container, 'focus', handler);
    } else {
      return $_5x7hr513xjdud7fqz.bind(container, 'focusin', handler);
    }
  };
  var bindBlur = function (container, handler) {
    if (isFirefox) {
      return $_5x7hr513xjdud7fqz.capture(container, 'blur', handler);
    } else {
      return $_5x7hr513xjdud7fqz.bind(container, 'focusout', handler);
    }
  };
  var setup$2 = function (container, rawSettings) {
    var settings = $_13hkebyejdud7ewm.asRawOrDie('Getting GUI events settings', settingsSchema, rawSettings);
    var pointerEvents = $_chh2cvwkjdud7ej0.detect().deviceType.isTouch() ? [
      'touchstart',
      'touchmove',
      'touchend',
      'gesturestart'
    ] : [
      'mousedown',
      'mouseup',
      'mouseover',
      'mousemove',
      'mouseout',
      'click'
    ];
    var tapEvent = $_civf8z144jdud7fs6.monitor(settings);
    var simpleEvents = $_1g2cevwsjdud7ejp.map(pointerEvents.concat([
      'selectstart',
      'input',
      'contextmenu',
      'change',
      'transitionend',
      'dragstart',
      'dragover',
      'drop'
    ]), function (type) {
      return $_5x7hr513xjdud7fqz.bind(container, type, function (event) {
        tapEvent.fireIfReady(event, type).each(function (tapStopped) {
          if (tapStopped)
            event.kill();
        });
        var stopped = settings.triggerEvent(type, event);
        if (stopped)
          event.kill();
      });
    });
    var onKeydown = $_5x7hr513xjdud7fqz.bind(container, 'keydown', function (event) {
      var stopped = settings.triggerEvent('keydown', event);
      if (stopped)
        event.kill();
      else if (settings.stopBackspace === true && isDangerous(event)) {
        event.prevent();
      }
    });
    var onFocusIn = bindFocus(container, function (event) {
      var stopped = settings.triggerEvent('focusin', event);
      if (stopped)
        event.kill();
    });
    var onFocusOut = bindBlur(container, function (event) {
      var stopped = settings.triggerEvent('focusout', event);
      if (stopped)
        event.kill();
      setTimeout(function () {
        settings.triggerEvent($_801kkqwhjdud7eiq.postBlur(), event);
      }, 0);
    });
    var defaultView = $_dekwe2x3jdud7ekr.defaultView(container);
    var onWindowScroll = $_5x7hr513xjdud7fqz.bind(defaultView, 'scroll', function (event) {
      var stopped = settings.broadcastEvent($_801kkqwhjdud7eiq.windowScroll(), event);
      if (stopped)
        event.kill();
    });
    var unbind = function () {
      $_1g2cevwsjdud7ejp.each(simpleEvents, function (e) {
        e.unbind();
      });
      onKeydown.unbind();
      onFocusIn.unbind();
      onFocusOut.unbind();
      onWindowScroll.unbind();
    };
    return { unbind: unbind };
  };
  var $_kt4rz15djdud7fz0 = { setup: setup$2 };

  var derive$3 = function (rawEvent, rawTarget) {
    var source = $_ettibkxsjdud7emz.readOptFrom(rawEvent, 'target').map(function (getTarget) {
      return getTarget();
    }).getOr(rawTarget);
    return Cell(source);
  };
  var $_ervjm915fjdud7fzm = { derive: derive$3 };

  var fromSource = function (event, source) {
    var stopper = Cell(false);
    var cutter = Cell(false);
    var stop = function () {
      stopper.set(true);
    };
    var cut = function () {
      cutter.set(true);
    };
    return {
      stop: stop,
      cut: cut,
      isStopped: stopper.get,
      isCut: cutter.get,
      event: $_9njj9iwjjdud7eix.constant(event),
      setSource: source.set,
      getSource: source.get
    };
  };
  var fromExternal = function (event) {
    var stopper = Cell(false);
    var stop = function () {
      stopper.set(true);
    };
    return {
      stop: stop,
      cut: $_9njj9iwjjdud7eix.noop,
      isStopped: stopper.get,
      isCut: $_9njj9iwjjdud7eix.constant(false),
      event: $_9njj9iwjjdud7eix.constant(event),
      setTarget: $_9njj9iwjjdud7eix.die(new Error('Cannot set target of a broadcasted event')),
      getTarget: $_9njj9iwjjdud7eix.die(new Error('Cannot get target of a broadcasted event'))
    };
  };
  var fromTarget = function (event, target) {
    var source = Cell(target);
    return fromSource(event, source);
  };
  var $_a4g5815gjdud7fzp = {
    fromSource: fromSource,
    fromExternal: fromExternal,
    fromTarget: fromTarget
  };

  var adt$6 = $_2ytffsxwjdud7ets.generate([
    { stopped: [] },
    { resume: ['element'] },
    { complete: [] }
  ]);
  var doTriggerHandler = function (lookup, eventType, rawEvent, target, source, logger) {
    var handler = lookup(eventType, target);
    var simulatedEvent = $_a4g5815gjdud7fzp.fromSource(rawEvent, source);
    return handler.fold(function () {
      logger.logEventNoHandlers(eventType, target);
      return adt$6.complete();
    }, function (handlerInfo) {
      var descHandler = handlerInfo.descHandler();
      var eventHandler = $_6lldf5134jdud7flx.getHandler(descHandler);
      eventHandler(simulatedEvent);
      if (simulatedEvent.isStopped()) {
        logger.logEventStopped(eventType, handlerInfo.element(), descHandler.purpose());
        return adt$6.stopped();
      } else if (simulatedEvent.isCut()) {
        logger.logEventCut(eventType, handlerInfo.element(), descHandler.purpose());
        return adt$6.complete();
      } else
        return $_dekwe2x3jdud7ekr.parent(handlerInfo.element()).fold(function () {
          logger.logNoParent(eventType, handlerInfo.element(), descHandler.purpose());
          return adt$6.complete();
        }, function (parent) {
          logger.logEventResponse(eventType, handlerInfo.element(), descHandler.purpose());
          return adt$6.resume(parent);
        });
    });
  };
  var doTriggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, source, logger) {
    return doTriggerHandler(lookup, eventType, rawEvent, rawTarget, source, logger).fold(function () {
      return true;
    }, function (parent) {
      return doTriggerOnUntilStopped(lookup, eventType, rawEvent, parent, source, logger);
    }, function () {
      return false;
    });
  };
  var triggerHandler = function (lookup, eventType, rawEvent, target, logger) {
    var source = $_ervjm915fjdud7fzm.derive(rawEvent, target);
    return doTriggerHandler(lookup, eventType, rawEvent, target, source, logger);
  };
  var broadcast = function (listeners, rawEvent, logger) {
    var simulatedEvent = $_a4g5815gjdud7fzp.fromExternal(rawEvent);
    $_1g2cevwsjdud7ejp.each(listeners, function (listener) {
      var descHandler = listener.descHandler();
      var handler = $_6lldf5134jdud7flx.getHandler(descHandler);
      handler(simulatedEvent);
    });
    return simulatedEvent.isStopped();
  };
  var triggerUntilStopped = function (lookup, eventType, rawEvent, logger) {
    var rawTarget = rawEvent.target();
    return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, logger);
  };
  var triggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, logger) {
    var source = $_ervjm915fjdud7fzm.derive(rawEvent, rawTarget);
    return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
  };
  var $_fisgeg15ejdud7fzg = {
    triggerHandler: triggerHandler,
    triggerUntilStopped: triggerUntilStopped,
    triggerOnUntilStopped: triggerOnUntilStopped,
    broadcast: broadcast
  };

  var closest$4 = function (target, transform, isRoot) {
    var delegate = $_4j5kdsyvjdud7eyd.closest(target, function (elem) {
      return transform(elem).isSome();
    }, isRoot);
    return delegate.bind(transform);
  };
  var $_6iub0g15jjdud7g05 = { closest: closest$4 };

  var eventHandler = $_8o1q69x4jdud7ekz.immutable('element', 'descHandler');
  var messageHandler = function (id, handler) {
    return {
      id: $_9njj9iwjjdud7eix.constant(id),
      descHandler: $_9njj9iwjjdud7eix.constant(handler)
    };
  };
  function EventRegistry () {
    var registry = {};
    var registerId = function (extraArgs, id, events) {
      $_2dykn0x0jdud7ekc.each(events, function (v, k) {
        var handlers = registry[k] !== undefined ? registry[k] : {};
        handlers[id] = $_6lldf5134jdud7flx.curryArgs(v, extraArgs);
        registry[k] = handlers;
      });
    };
    var findHandler = function (handlers, elem) {
      return $_4mrseh10xjdud7f9b.read(elem).fold(function (err) {
        return Option.none();
      }, function (id) {
        var reader = $_ettibkxsjdud7emz.readOpt(id);
        return handlers.bind(reader).map(function (descHandler) {
          return eventHandler(elem, descHandler);
        });
      });
    };
    var filterByType = function (type) {
      return $_ettibkxsjdud7emz.readOptFrom(registry, type).map(function (handlers) {
        return $_2dykn0x0jdud7ekc.mapToArray(handlers, function (f, id) {
          return messageHandler(id, f);
        });
      }).getOr([]);
    };
    var find = function (isAboveRoot, type, target) {
      var readType = $_ettibkxsjdud7emz.readOpt(type);
      var handlers = readType(registry);
      return $_6iub0g15jjdud7g05.closest(target, function (elem) {
        return findHandler(handlers, elem);
      }, isAboveRoot);
    };
    var unregisterId = function (id) {
      $_2dykn0x0jdud7ekc.each(registry, function (handlersById, eventName) {
        if (handlersById.hasOwnProperty(id))
          delete handlersById[id];
      });
    };
    return {
      registerId: registerId,
      unregisterId: unregisterId,
      filterByType: filterByType,
      find: find
    };
  }

  function Registry () {
    var events = EventRegistry();
    var components = {};
    var readOrTag = function (component) {
      var elem = component.element();
      return $_4mrseh10xjdud7f9b.read(elem).fold(function () {
        return $_4mrseh10xjdud7f9b.write('uid-', component.element());
      }, function (uid) {
        return uid;
      });
    };
    var failOnDuplicate = function (component, tagId) {
      var conflict = components[tagId];
      if (conflict === component)
        unregister(component);
      else
        throw new Error('The tagId "' + tagId + '" is already used by: ' + $_d3f8kuxmjdud7emi.element(conflict.element()) + '\nCannot use it for: ' + $_d3f8kuxmjdud7emi.element(component.element()) + '\n' + 'The conflicting element is' + ($_1tyeizxjjdud7em4.inBody(conflict.element()) ? ' ' : ' not ') + 'already in the DOM');
    };
    var register = function (component) {
      var tagId = readOrTag(component);
      if ($_ettibkxsjdud7emz.hasKey(components, tagId))
        failOnDuplicate(component, tagId);
      var extraArgs = [component];
      events.registerId(extraArgs, tagId, component.events());
      components[tagId] = component;
    };
    var unregister = function (component) {
      $_4mrseh10xjdud7f9b.read(component.element()).each(function (tagId) {
        components[tagId] = undefined;
        events.unregisterId(tagId);
      });
    };
    var filter = function (type) {
      return events.filterByType(type);
    };
    var find = function (isAboveRoot, type, target) {
      return events.find(isAboveRoot, type, target);
    };
    var getById = function (id) {
      return $_ettibkxsjdud7emz.readOpt(id)(components);
    };
    return {
      find: find,
      filter: filter,
      register: register,
      unregister: unregister,
      getById: getById
    };
  }

  var create$6 = function () {
    var root = $_ap2ej712tjdud7fjl.build(Container.sketch({ dom: { tag: 'div' } }));
    return takeover(root);
  };
  var takeover = function (root) {
    var isAboveRoot = function (el) {
      return $_dekwe2x3jdud7ekr.parent(root.element()).fold(function () {
        return true;
      }, function (parent) {
        return $_f1y1rtx9jdud7el7.eq(el, parent);
      });
    };
    var registry = Registry();
    var lookup = function (eventName, target) {
      return registry.find(isAboveRoot, eventName, target);
    };
    var domEvents = $_kt4rz15djdud7fz0.setup(root.element(), {
      triggerEvent: function (eventName, event) {
        return $_efa715xljdud7em8.monitorEvent(eventName, event.target(), function (logger) {
          return $_fisgeg15ejdud7fzg.triggerUntilStopped(lookup, eventName, event, logger);
        });
      },
      broadcastEvent: function (eventName, event) {
        var listeners = registry.filter(eventName);
        return $_fisgeg15ejdud7fzg.broadcast(listeners, event);
      }
    });
    var systemApi = SystemApi({
      debugInfo: $_9njj9iwjjdud7eix.constant('real'),
      triggerEvent: function (customType, target, data) {
        $_efa715xljdud7em8.monitorEvent(customType, target, function (logger) {
          $_fisgeg15ejdud7fzg.triggerOnUntilStopped(lookup, customType, data, target, logger);
        });
      },
      triggerFocus: function (target, originator) {
        $_4mrseh10xjdud7f9b.read(target).fold(function () {
          $_25580rytjdud7ey7.focus(target);
        }, function (_alloyId) {
          $_efa715xljdud7em8.monitorEvent($_801kkqwhjdud7eiq.focus(), target, function (logger) {
            $_fisgeg15ejdud7fzg.triggerHandler(lookup, $_801kkqwhjdud7eiq.focus(), {
              originator: $_9njj9iwjjdud7eix.constant(originator),
              target: $_9njj9iwjjdud7eix.constant(target)
            }, target, logger);
          });
        });
      },
      triggerEscape: function (comp, simulatedEvent) {
        systemApi.triggerEvent('keydown', comp.element(), simulatedEvent.event());
      },
      getByUid: function (uid) {
        return getByUid(uid);
      },
      getByDom: function (elem) {
        return getByDom(elem);
      },
      build: $_ap2ej712tjdud7fjl.build,
      addToGui: function (c) {
        add(c);
      },
      removeFromGui: function (c) {
        remove(c);
      },
      addToWorld: function (c) {
        addToWorld(c);
      },
      removeFromWorld: function (c) {
        removeFromWorld(c);
      },
      broadcast: function (message) {
        broadcast(message);
      },
      broadcastOn: function (channels, message) {
        broadcastOn(channels, message);
      }
    });
    var addToWorld = function (component) {
      component.connect(systemApi);
      if (!$_50qkdpxkjdud7em6.isText(component.element())) {
        registry.register(component);
        $_1g2cevwsjdud7ejp.each(component.components(), addToWorld);
        systemApi.triggerEvent($_801kkqwhjdud7eiq.systemInit(), component.element(), { target: $_9njj9iwjjdud7eix.constant(component.element()) });
      }
    };
    var removeFromWorld = function (component) {
      if (!$_50qkdpxkjdud7em6.isText(component.element())) {
        $_1g2cevwsjdud7ejp.each(component.components(), removeFromWorld);
        registry.unregister(component);
      }
      component.disconnect();
    };
    var add = function (component) {
      $_fesilqx1jdud7ekf.attach(root, component);
    };
    var remove = function (component) {
      $_fesilqx1jdud7ekf.detach(component);
    };
    var destroy = function () {
      domEvents.unbind();
      $_8d9w48xhjdud7elz.remove(root.element());
    };
    var broadcastData = function (data) {
      var receivers = registry.filter($_801kkqwhjdud7eiq.receive());
      $_1g2cevwsjdud7ejp.each(receivers, function (receiver) {
        var descHandler = receiver.descHandler();
        var handler = $_6lldf5134jdud7flx.getHandler(descHandler);
        handler(data);
      });
    };
    var broadcast = function (message) {
      broadcastData({
        universal: $_9njj9iwjjdud7eix.constant(true),
        data: $_9njj9iwjjdud7eix.constant(message)
      });
    };
    var broadcastOn = function (channels, message) {
      broadcastData({
        universal: $_9njj9iwjjdud7eix.constant(false),
        channels: $_9njj9iwjjdud7eix.constant(channels),
        data: $_9njj9iwjjdud7eix.constant(message)
      });
    };
    var getByUid = function (uid) {
      return registry.getById(uid).fold(function () {
        return Result.error(new Error('Could not find component with uid: "' + uid + '" in system.'));
      }, Result.value);
    };
    var getByDom = function (elem) {
      return $_4mrseh10xjdud7f9b.read(elem).bind(getByUid);
    };
    addToWorld(root);
    return {
      root: $_9njj9iwjjdud7eix.constant(root),
      element: root.element,
      destroy: destroy,
      add: add,
      remove: remove,
      getByUid: getByUid,
      getByDom: getByDom,
      addToWorld: addToWorld,
      removeFromWorld: removeFromWorld,
      broadcast: broadcast,
      broadcastOn: broadcastOn
    };
  };
  var $_22oc0y15cjdud7fym = {
    create: create$6,
    takeover: takeover
  };

  var READ_ONLY_MODE_CLASS = $_9njj9iwjjdud7eix.constant($_5qzh4bzejdud7f0y.resolve('readonly-mode'));
  var EDIT_MODE_CLASS = $_9njj9iwjjdud7eix.constant($_5qzh4bzejdud7f0y.resolve('edit-mode'));
  function OuterContainer (spec) {
    var root = $_ap2ej712tjdud7fjl.build(Container.sketch({
      dom: { classes: [$_5qzh4bzejdud7f0y.resolve('outer-container')].concat(spec.classes) },
      containerBehaviours: $_ax1gfoy2jdud7eu7.derive([Swapping.config({
          alpha: READ_ONLY_MODE_CLASS(),
          omega: EDIT_MODE_CLASS()
        })])
    }));
    return $_22oc0y15cjdud7fym.takeover(root);
  }

  function AndroidRealm (scrollIntoView) {
    var alloy = OuterContainer({ classes: [$_5qzh4bzejdud7f0y.resolve('android-container')] });
    var toolbar = ScrollingToolbar();
    var webapp = $_9fhyae12ojdud7fij.api();
    var switchToEdit = $_enp5ds154jdud7fxb.makeEditSwitch(webapp);
    var socket = $_enp5ds154jdud7fxb.makeSocket();
    var dropup = $_9ihizd155jdud7fxi.build($_9njj9iwjjdud7eix.noop, scrollIntoView);
    alloy.add(toolbar.wrapper());
    alloy.add(socket);
    alloy.add(dropup.component());
    var setToolbarGroups = function (rawGroups) {
      var groups = toolbar.createGroups(rawGroups);
      toolbar.setGroups(groups);
    };
    var setContextToolbar = function (rawGroups) {
      var groups = toolbar.createGroups(rawGroups);
      toolbar.setContextToolbar(groups);
    };
    var focusToolbar = function () {
      toolbar.focus();
    };
    var restoreToolbar = function () {
      toolbar.restoreToolbar();
    };
    var init = function (spec) {
      webapp.set($_bip6sv140jdud7fra.produce(spec));
    };
    var exit = function () {
      webapp.run(function (w) {
        w.exit();
        Replacing.remove(socket, switchToEdit);
      });
    };
    var updateMode = function (readOnly) {
      $_enp5ds154jdud7fxb.updateMode(socket, switchToEdit, readOnly, alloy.root());
    };
    return {
      system: $_9njj9iwjjdud7eix.constant(alloy),
      element: alloy.element,
      init: init,
      exit: exit,
      setToolbarGroups: setToolbarGroups,
      setContextToolbar: setContextToolbar,
      focusToolbar: focusToolbar,
      restoreToolbar: restoreToolbar,
      updateMode: updateMode,
      socket: $_9njj9iwjjdud7eix.constant(socket),
      dropup: $_9njj9iwjjdud7eix.constant(dropup)
    };
  }

  var input = function (parent, operation) {
    var input = $_eobgtqxfjdud7elu.fromTag('input');
    $_btgbcy103jdud7f3t.setAll(input, {
      opacity: '0',
      position: 'absolute',
      top: '-1000px',
      left: '-1000px'
    });
    $_ftkbb5x2jdud7ekp.append(parent, input);
    $_25580rytjdud7ey7.focus(input);
    operation(input);
    $_8d9w48xhjdud7elz.remove(input);
  };
  var $_6rnw9j15ojdud7g16 = { input: input };

  var refreshInput = function (input) {
    var start = input.dom().selectionStart;
    var end = input.dom().selectionEnd;
    var dir = input.dom().selectionDirection;
    setTimeout(function () {
      input.dom().setSelectionRange(start, end, dir);
      $_25580rytjdud7ey7.focus(input);
    }, 50);
  };
  var refresh = function (winScope) {
    var sel = winScope.getSelection();
    if (sel.rangeCount > 0) {
      var br = sel.getRangeAt(0);
      var r = winScope.document.createRange();
      r.setStart(br.startContainer, br.startOffset);
      r.setEnd(br.endContainer, br.endOffset);
      sel.removeAllRanges();
      sel.addRange(r);
    }
  };
  var $_2v0qs115qjdud7g1f = {
    refreshInput: refreshInput,
    refresh: refresh
  };

  var resume$1 = function (cWin, frame) {
    $_25580rytjdud7ey7.active().each(function (active) {
      if (!$_f1y1rtx9jdud7el7.eq(active, frame)) {
        $_25580rytjdud7ey7.blur(active);
      }
    });
    cWin.focus();
    $_25580rytjdud7ey7.focus($_eobgtqxfjdud7elu.fromDom(cWin.document.body));
    $_2v0qs115qjdud7g1f.refresh(cWin);
  };
  var $_7n4y0915pjdud7g1b = { resume: resume$1 };

  var stubborn = function (outerBody, cWin, page, frame) {
    var toEditing = function () {
      $_7n4y0915pjdud7g1b.resume(cWin, frame);
    };
    var toReading = function () {
      $_6rnw9j15ojdud7g16.input(outerBody, $_25580rytjdud7ey7.blur);
    };
    var captureInput = $_5x7hr513xjdud7fqz.bind(page, 'keydown', function (evt) {
      if (!$_1g2cevwsjdud7ejp.contains([
          'input',
          'textarea'
        ], $_50qkdpxkjdud7em6.name(evt.target()))) {
        toEditing();
      }
    });
    var onToolbarTouch = function () {
    };
    var destroy = function () {
      captureInput.unbind();
    };
    return {
      toReading: toReading,
      toEditing: toEditing,
      onToolbarTouch: onToolbarTouch,
      destroy: destroy
    };
  };
  var timid = function (outerBody, cWin, page, frame) {
    var dismissKeyboard = function () {
      $_25580rytjdud7ey7.blur(frame);
    };
    var onToolbarTouch = function () {
      dismissKeyboard();
    };
    var toReading = function () {
      dismissKeyboard();
    };
    var toEditing = function () {
      $_7n4y0915pjdud7g1b.resume(cWin, frame);
    };
    return {
      toReading: toReading,
      toEditing: toEditing,
      onToolbarTouch: onToolbarTouch,
      destroy: $_9njj9iwjjdud7eix.noop
    };
  };
  var $_fx7jg115njdud7g0u = {
    stubborn: stubborn,
    timid: timid
  };

  var initEvents$1 = function (editorApi, iosApi, toolstrip, socket, dropup) {
    var saveSelectionFirst = function () {
      iosApi.run(function (api) {
        api.highlightSelection();
      });
    };
    var refreshIosSelection = function () {
      iosApi.run(function (api) {
        api.refreshSelection();
      });
    };
    var scrollToY = function (yTop, height) {
      var y = yTop - socket.dom().scrollTop;
      iosApi.run(function (api) {
        api.scrollIntoView(y, y + height);
      });
    };
    var scrollToElement = function (target) {
      scrollToY(iosApi, socket);
    };
    var scrollToCursor = function () {
      editorApi.getCursorBox().each(function (box) {
        scrollToY(box.top(), box.height());
      });
    };
    var clearSelection = function () {
      iosApi.run(function (api) {
        api.clearSelection();
      });
    };
    var clearAndRefresh = function () {
      clearSelection();
      refreshThrottle.throttle();
    };
    var refreshView = function () {
      scrollToCursor();
      iosApi.run(function (api) {
        api.syncHeight();
      });
    };
    var reposition = function () {
      var toolbarHeight = $_q9861102jdud7f3r.get(toolstrip);
      iosApi.run(function (api) {
        api.setViewportOffset(toolbarHeight);
      });
      refreshIosSelection();
      refreshView();
    };
    var toEditing = function () {
      iosApi.run(function (api) {
        api.toEditing();
      });
    };
    var toReading = function () {
      iosApi.run(function (api) {
        api.toReading();
      });
    };
    var onToolbarTouch = function (event) {
      iosApi.run(function (api) {
        api.onToolbarTouch(event);
      });
    };
    var tapping = $_cza229143jdud7fs3.monitor(editorApi);
    var refreshThrottle = $_dfio3v14wjdud7fvy.last(refreshView, 300);
    var listeners = [
      editorApi.onKeyup(clearAndRefresh),
      editorApi.onNodeChanged(refreshIosSelection),
      editorApi.onDomChanged(refreshThrottle.throttle),
      editorApi.onDomChanged(refreshIosSelection),
      editorApi.onScrollToCursor(function (tinyEvent) {
        tinyEvent.preventDefault();
        refreshThrottle.throttle();
      }),
      editorApi.onScrollToElement(function (event) {
        scrollToElement(event.element());
      }),
      editorApi.onToEditing(toEditing),
      editorApi.onToReading(toReading),
      $_5x7hr513xjdud7fqz.bind(editorApi.doc(), 'touchend', function (touchEvent) {
        if ($_f1y1rtx9jdud7el7.eq(editorApi.html(), touchEvent.target()) || $_f1y1rtx9jdud7el7.eq(editorApi.body(), touchEvent.target())) {
        }
      }),
      $_5x7hr513xjdud7fqz.bind(toolstrip, 'transitionend', function (transitionEvent) {
        if (transitionEvent.raw().propertyName === 'height') {
          reposition();
        }
      }),
      $_5x7hr513xjdud7fqz.capture(toolstrip, 'touchstart', function (touchEvent) {
        saveSelectionFirst();
        onToolbarTouch(touchEvent);
        editorApi.onTouchToolstrip();
      }),
      $_5x7hr513xjdud7fqz.bind(editorApi.body(), 'touchstart', function (evt) {
        clearSelection();
        editorApi.onTouchContent();
        tapping.fireTouchstart(evt);
      }),
      tapping.onTouchmove(),
      tapping.onTouchend(),
      $_5x7hr513xjdud7fqz.bind(editorApi.body(), 'click', function (event) {
        event.kill();
      }),
      $_5x7hr513xjdud7fqz.bind(toolstrip, 'touchmove', function () {
        editorApi.onToolbarScrollStart();
      })
    ];
    var destroy = function () {
      $_1g2cevwsjdud7ejp.each(listeners, function (l) {
        l.unbind();
      });
    };
    return { destroy: destroy };
  };
  var $_1nj2i15rjdud7g1i = { initEvents: initEvents$1 };

  function FakeSelection (win, frame) {
    var doc = win.document;
    var container = $_eobgtqxfjdud7elu.fromTag('div');
    $_1x3ogvynjdud7exn.add(container, $_5qzh4bzejdud7f0y.resolve('unfocused-selections'));
    $_ftkbb5x2jdud7ekp.append($_eobgtqxfjdud7elu.fromDom(doc.documentElement), container);
    var onTouch = $_5x7hr513xjdud7fqz.bind(container, 'touchstart', function (event) {
      event.prevent();
      $_7n4y0915pjdud7g1b.resume(win, frame);
      clear();
    });
    var make = function (rectangle) {
      var span = $_eobgtqxfjdud7elu.fromTag('span');
      $_af5dkc137jdud7fms.add(span, [
        $_5qzh4bzejdud7f0y.resolve('layer-editor'),
        $_5qzh4bzejdud7f0y.resolve('unfocused-selection')
      ]);
      $_btgbcy103jdud7f3t.setAll(span, {
        left: rectangle.left() + 'px',
        top: rectangle.top() + 'px',
        width: rectangle.width() + 'px',
        height: rectangle.height() + 'px'
      });
      return span;
    };
    var update = function () {
      clear();
      var rectangles = $_5lp8kt148jdud7fso.getRectangles(win);
      var spans = $_1g2cevwsjdud7ejp.map(rectangles, make);
      $_alr2vxxijdud7em1.append(container, spans);
    };
    var clear = function () {
      $_8d9w48xhjdud7elz.empty(container);
    };
    var destroy = function () {
      onTouch.unbind();
      $_8d9w48xhjdud7elz.remove(container);
    };
    var isActive = function () {
      return $_dekwe2x3jdud7ekr.children(container).length > 0;
    };
    return {
      update: update,
      isActive: isActive,
      destroy: destroy,
      clear: clear
    };
  }

  var nu$8 = function (baseFn) {
    var data = Option.none();
    var callbacks = [];
    var map = function (f) {
      return nu$8(function (nCallback) {
        get(function (data) {
          nCallback(f(data));
        });
      });
    };
    var get = function (nCallback) {
      if (isReady())
        call(nCallback);
      else
        callbacks.push(nCallback);
    };
    var set = function (x) {
      data = Option.some(x);
      run(callbacks);
      callbacks = [];
    };
    var isReady = function () {
      return data.isSome();
    };
    var run = function (cbs) {
      $_1g2cevwsjdud7ejp.each(cbs, call);
    };
    var call = function (cb) {
      data.each(function (x) {
        setTimeout(function () {
          cb(x);
        }, 0);
      });
    };
    baseFn(set);
    return {
      get: get,
      map: map,
      isReady: isReady
    };
  };
  var pure$1 = function (a) {
    return nu$8(function (callback) {
      callback(a);
    });
  };
  var LazyValue = {
    nu: nu$8,
    pure: pure$1
  };

  var bounce = function (f) {
    return function () {
      var args = Array.prototype.slice.call(arguments);
      var me = this;
      setTimeout(function () {
        f.apply(me, args);
      }, 0);
    };
  };
  var $_9k4fhx15xjdud7g2p = { bounce: bounce };

  var nu$9 = function (baseFn) {
    var get = function (callback) {
      baseFn($_9k4fhx15xjdud7g2p.bounce(callback));
    };
    var map = function (fab) {
      return nu$9(function (callback) {
        get(function (a) {
          var value = fab(a);
          callback(value);
        });
      });
    };
    var bind = function (aFutureB) {
      return nu$9(function (callback) {
        get(function (a) {
          aFutureB(a).get(callback);
        });
      });
    };
    var anonBind = function (futureB) {
      return nu$9(function (callback) {
        get(function (a) {
          futureB.get(callback);
        });
      });
    };
    var toLazy = function () {
      return LazyValue.nu(get);
    };
    return {
      map: map,
      bind: bind,
      anonBind: anonBind,
      toLazy: toLazy,
      get: get
    };
  };
  var pure$2 = function (a) {
    return nu$9(function (callback) {
      callback(a);
    });
  };
  var Future = {
    nu: nu$9,
    pure: pure$2
  };

  var adjust = function (value, destination, amount) {
    if (Math.abs(value - destination) <= amount) {
      return Option.none();
    } else if (value < destination) {
      return Option.some(value + amount);
    } else {
      return Option.some(value - amount);
    }
  };
  var create$7 = function () {
    var interval = null;
    var animate = function (getCurrent, destination, amount, increment, doFinish, rate) {
      var finished = false;
      var finish = function (v) {
        finished = true;
        doFinish(v);
      };
      clearInterval(interval);
      var abort = function (v) {
        clearInterval(interval);
        finish(v);
      };
      interval = setInterval(function () {
        var value = getCurrent();
        adjust(value, destination, amount).fold(function () {
          clearInterval(interval);
          finish(destination);
        }, function (s) {
          increment(s, abort);
          if (!finished) {
            var newValue = getCurrent();
            if (newValue !== s || Math.abs(newValue - destination) > Math.abs(value - destination)) {
              clearInterval(interval);
              finish(destination);
            }
          }
        });
      }, rate);
    };
    return { animate: animate };
  };
  var $_d1o46j15yjdud7g2r = {
    create: create$7,
    adjust: adjust
  };

  var findDevice = function (deviceWidth, deviceHeight) {
    var devices = [
      {
        width: 320,
        height: 480,
        keyboard: {
          portrait: 300,
          landscape: 240
        }
      },
      {
        width: 320,
        height: 568,
        keyboard: {
          portrait: 300,
          landscape: 240
        }
      },
      {
        width: 375,
        height: 667,
        keyboard: {
          portrait: 305,
          landscape: 240
        }
      },
      {
        width: 414,
        height: 736,
        keyboard: {
          portrait: 320,
          landscape: 240
        }
      },
      {
        width: 768,
        height: 1024,
        keyboard: {
          portrait: 320,
          landscape: 400
        }
      },
      {
        width: 1024,
        height: 1366,
        keyboard: {
          portrait: 380,
          landscape: 460
        }
      }
    ];
    return $_ak7xq9y0jdud7eu4.findMap(devices, function (device) {
      return deviceWidth <= device.width && deviceHeight <= device.height ? Option.some(device.keyboard) : Option.none();
    }).getOr({
      portrait: deviceHeight / 5,
      landscape: deviceWidth / 4
    });
  };
  var $_ejdhod161jdud7g3j = { findDevice: findDevice };

  var softKeyboardLimits = function (outerWindow) {
    return $_ejdhod161jdud7g3j.findDevice(outerWindow.screen.width, outerWindow.screen.height);
  };
  var accountableKeyboardHeight = function (outerWindow) {
    var portrait = $_9zlehr13wjdud7fqs.get(outerWindow).isPortrait();
    var limits = softKeyboardLimits(outerWindow);
    var keyboard = portrait ? limits.portrait : limits.landscape;
    var visualScreenHeight = portrait ? outerWindow.screen.height : outerWindow.screen.width;
    return visualScreenHeight - outerWindow.innerHeight > keyboard ? 0 : keyboard;
  };
  var getGreenzone = function (socket, dropup) {
    var outerWindow = $_dekwe2x3jdud7ekr.owner(socket).dom().defaultView;
    var viewportHeight = $_q9861102jdud7f3r.get(socket) + $_q9861102jdud7f3r.get(dropup);
    var acc = accountableKeyboardHeight(outerWindow);
    return viewportHeight - acc;
  };
  var updatePadding = function (contentBody, socket, dropup) {
    var greenzoneHeight = getGreenzone(socket, dropup);
    var deltaHeight = $_q9861102jdud7f3r.get(socket) + $_q9861102jdud7f3r.get(dropup) - greenzoneHeight;
    $_btgbcy103jdud7f3t.set(contentBody, 'padding-bottom', deltaHeight + 'px');
  };
  var $_alvh5y160jdud7g3e = {
    getGreenzone: getGreenzone,
    updatePadding: updatePadding
  };

  var fixture = $_2ytffsxwjdud7ets.generate([
    {
      fixed: [
        'element',
        'property',
        'offsetY'
      ]
    },
    {
      scroller: [
        'element',
        'offsetY'
      ]
    }
  ]);
  var yFixedData = 'data-' + $_5qzh4bzejdud7f0y.resolve('position-y-fixed');
  var yFixedProperty = 'data-' + $_5qzh4bzejdud7f0y.resolve('y-property');
  var yScrollingData = 'data-' + $_5qzh4bzejdud7f0y.resolve('scrolling');
  var windowSizeData = 'data-' + $_5qzh4bzejdud7f0y.resolve('last-window-height');
  var getYFixedData = function (element) {
    return $_1bs4n9147jdud7fsm.safeParse(element, yFixedData);
  };
  var getYFixedProperty = function (element) {
    return $_2vghk1xrjdud7ems.get(element, yFixedProperty);
  };
  var getLastWindowSize = function (element) {
    return $_1bs4n9147jdud7fsm.safeParse(element, windowSizeData);
  };
  var classifyFixed = function (element, offsetY) {
    var prop = getYFixedProperty(element);
    return fixture.fixed(element, prop, offsetY);
  };
  var classifyScrolling = function (element, offsetY) {
    return fixture.scroller(element, offsetY);
  };
  var classify = function (element) {
    var offsetY = getYFixedData(element);
    var classifier = $_2vghk1xrjdud7ems.get(element, yScrollingData) === 'true' ? classifyScrolling : classifyFixed;
    return classifier(element, offsetY);
  };
  var findFixtures = function (container) {
    var candidates = $_df6s98zvjdud7f39.descendants(container, '[' + yFixedData + ']');
    return $_1g2cevwsjdud7ejp.map(candidates, classify);
  };
  var takeoverToolbar = function (toolbar) {
    var oldToolbarStyle = $_2vghk1xrjdud7ems.get(toolbar, 'style');
    $_btgbcy103jdud7f3t.setAll(toolbar, {
      position: 'absolute',
      top: '0px'
    });
    $_2vghk1xrjdud7ems.set(toolbar, yFixedData, '0px');
    $_2vghk1xrjdud7ems.set(toolbar, yFixedProperty, 'top');
    var restore = function () {
      $_2vghk1xrjdud7ems.set(toolbar, 'style', oldToolbarStyle || '');
      $_2vghk1xrjdud7ems.remove(toolbar, yFixedData);
      $_2vghk1xrjdud7ems.remove(toolbar, yFixedProperty);
    };
    return { restore: restore };
  };
  var takeoverViewport = function (toolbarHeight, height, viewport) {
    var oldViewportStyle = $_2vghk1xrjdud7ems.get(viewport, 'style');
    $_bhtyzh13ujdud7fqk.register(viewport);
    $_btgbcy103jdud7f3t.setAll(viewport, {
      position: 'absolute',
      height: height + 'px',
      width: '100%',
      top: toolbarHeight + 'px'
    });
    $_2vghk1xrjdud7ems.set(viewport, yFixedData, toolbarHeight + 'px');
    $_2vghk1xrjdud7ems.set(viewport, yScrollingData, 'true');
    $_2vghk1xrjdud7ems.set(viewport, yFixedProperty, 'top');
    var restore = function () {
      $_bhtyzh13ujdud7fqk.deregister(viewport);
      $_2vghk1xrjdud7ems.set(viewport, 'style', oldViewportStyle || '');
      $_2vghk1xrjdud7ems.remove(viewport, yFixedData);
      $_2vghk1xrjdud7ems.remove(viewport, yScrollingData);
      $_2vghk1xrjdud7ems.remove(viewport, yFixedProperty);
    };
    return { restore: restore };
  };
  var takeoverDropup = function (dropup, toolbarHeight, viewportHeight) {
    var oldDropupStyle = $_2vghk1xrjdud7ems.get(dropup, 'style');
    $_btgbcy103jdud7f3t.setAll(dropup, {
      position: 'absolute',
      bottom: '0px'
    });
    $_2vghk1xrjdud7ems.set(dropup, yFixedData, '0px');
    $_2vghk1xrjdud7ems.set(dropup, yFixedProperty, 'bottom');
    var restore = function () {
      $_2vghk1xrjdud7ems.set(dropup, 'style', oldDropupStyle || '');
      $_2vghk1xrjdud7ems.remove(dropup, yFixedData);
      $_2vghk1xrjdud7ems.remove(dropup, yFixedProperty);
    };
    return { restore: restore };
  };
  var deriveViewportHeight = function (viewport, toolbarHeight, dropupHeight) {
    var outerWindow = $_dekwe2x3jdud7ekr.owner(viewport).dom().defaultView;
    var winH = outerWindow.innerHeight;
    $_2vghk1xrjdud7ems.set(viewport, windowSizeData, winH + 'px');
    return winH - toolbarHeight - dropupHeight;
  };
  var takeover$1 = function (viewport, contentBody, toolbar, dropup) {
    var outerWindow = $_dekwe2x3jdud7ekr.owner(viewport).dom().defaultView;
    var toolbarSetup = takeoverToolbar(toolbar);
    var toolbarHeight = $_q9861102jdud7f3r.get(toolbar);
    var dropupHeight = $_q9861102jdud7f3r.get(dropup);
    var viewportHeight = deriveViewportHeight(viewport, toolbarHeight, dropupHeight);
    var viewportSetup = takeoverViewport(toolbarHeight, viewportHeight, viewport);
    var dropupSetup = takeoverDropup(dropup, toolbarHeight, viewportHeight);
    var isActive = true;
    var restore = function () {
      isActive = false;
      toolbarSetup.restore();
      viewportSetup.restore();
      dropupSetup.restore();
    };
    var isExpanding = function () {
      var currentWinHeight = outerWindow.innerHeight;
      var lastWinHeight = getLastWindowSize(viewport);
      return currentWinHeight > lastWinHeight;
    };
    var refresh = function () {
      if (isActive) {
        var newToolbarHeight = $_q9861102jdud7f3r.get(toolbar);
        var dropupHeight_1 = $_q9861102jdud7f3r.get(dropup);
        var newHeight = deriveViewportHeight(viewport, newToolbarHeight, dropupHeight_1);
        $_2vghk1xrjdud7ems.set(viewport, yFixedData, newToolbarHeight + 'px');
        $_btgbcy103jdud7f3t.set(viewport, 'height', newHeight + 'px');
        $_btgbcy103jdud7f3t.set(dropup, 'bottom', -(newToolbarHeight + newHeight + dropupHeight_1) + 'px');
        $_alvh5y160jdud7g3e.updatePadding(contentBody, viewport, dropup);
      }
    };
    var setViewportOffset = function (newYOffset) {
      var offsetPx = newYOffset + 'px';
      $_2vghk1xrjdud7ems.set(viewport, yFixedData, offsetPx);
      refresh();
    };
    $_alvh5y160jdud7g3e.updatePadding(contentBody, viewport, dropup);
    return {
      setViewportOffset: setViewportOffset,
      isExpanding: isExpanding,
      isShrinking: $_9njj9iwjjdud7eix.not(isExpanding),
      refresh: refresh,
      restore: restore
    };
  };
  var $_efto7m15zjdud7g31 = {
    findFixtures: findFixtures,
    takeover: takeover$1,
    getYFixedData: getYFixedData
  };

  var animator = $_d1o46j15yjdud7g2r.create();
  var ANIMATION_STEP = 15;
  var NUM_TOP_ANIMATION_FRAMES = 10;
  var ANIMATION_RATE = 10;
  var lastScroll = 'data-' + $_5qzh4bzejdud7f0y.resolve('last-scroll-top');
  var getTop = function (element) {
    var raw = $_btgbcy103jdud7f3t.getRaw(element, 'top').getOr(0);
    return parseInt(raw, 10);
  };
  var getScrollTop = function (element) {
    return parseInt(element.dom().scrollTop, 10);
  };
  var moveScrollAndTop = function (element, destination, finalTop) {
    return Future.nu(function (callback) {
      var getCurrent = $_9njj9iwjjdud7eix.curry(getScrollTop, element);
      var update = function (newScroll) {
        element.dom().scrollTop = newScroll;
        $_btgbcy103jdud7f3t.set(element, 'top', getTop(element) + ANIMATION_STEP + 'px');
      };
      var finish = function () {
        element.dom().scrollTop = destination;
        $_btgbcy103jdud7f3t.set(element, 'top', finalTop + 'px');
        callback(destination);
      };
      animator.animate(getCurrent, destination, ANIMATION_STEP, update, finish, ANIMATION_RATE);
    });
  };
  var moveOnlyScroll = function (element, destination) {
    return Future.nu(function (callback) {
      var getCurrent = $_9njj9iwjjdud7eix.curry(getScrollTop, element);
      $_2vghk1xrjdud7ems.set(element, lastScroll, getCurrent());
      var update = function (newScroll, abort) {
        var previous = $_1bs4n9147jdud7fsm.safeParse(element, lastScroll);
        if (previous !== element.dom().scrollTop) {
          abort(element.dom().scrollTop);
        } else {
          element.dom().scrollTop = newScroll;
          $_2vghk1xrjdud7ems.set(element, lastScroll, newScroll);
        }
      };
      var finish = function () {
        element.dom().scrollTop = destination;
        $_2vghk1xrjdud7ems.set(element, lastScroll, destination);
        callback(destination);
      };
      var distance = Math.abs(destination - getCurrent());
      var step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
      animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
    });
  };
  var moveOnlyTop = function (element, destination) {
    return Future.nu(function (callback) {
      var getCurrent = $_9njj9iwjjdud7eix.curry(getTop, element);
      var update = function (newTop) {
        $_btgbcy103jdud7f3t.set(element, 'top', newTop + 'px');
      };
      var finish = function () {
        update(destination);
        callback(destination);
      };
      var distance = Math.abs(destination - getCurrent());
      var step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
      animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
    });
  };
  var updateTop = function (element, amount) {
    var newTop = amount + $_efto7m15zjdud7g31.getYFixedData(element) + 'px';
    $_btgbcy103jdud7f3t.set(element, 'top', newTop);
  };
  var moveWindowScroll = function (toolbar, viewport, destY) {
    var outerWindow = $_dekwe2x3jdud7ekr.owner(toolbar).dom().defaultView;
    return Future.nu(function (callback) {
      updateTop(toolbar, destY);
      updateTop(viewport, destY);
      outerWindow.scrollTo(0, destY);
      callback(destY);
    });
  };
  var $_daro4h15ujdud7g2d = {
    moveScrollAndTop: moveScrollAndTop,
    moveOnlyScroll: moveOnlyScroll,
    moveOnlyTop: moveOnlyTop,
    moveWindowScroll: moveWindowScroll
  };

  function BackgroundActivity (doAction) {
    var action = Cell(LazyValue.pure({}));
    var start = function (value) {
      var future = LazyValue.nu(function (callback) {
        return doAction(value).get(callback);
      });
      action.set(future);
    };
    var idle = function (g) {
      action.get().get(function () {
        g();
      });
    };
    return {
      start: start,
      idle: idle
    };
  }

  var scrollIntoView = function (cWin, socket, dropup, top, bottom) {
    var greenzone = $_alvh5y160jdud7g3e.getGreenzone(socket, dropup);
    var refreshCursor = $_9njj9iwjjdud7eix.curry($_2v0qs115qjdud7g1f.refresh, cWin);
    if (top > greenzone || bottom > greenzone) {
      $_daro4h15ujdud7g2d.moveOnlyScroll(socket, socket.dom().scrollTop - greenzone + bottom).get(refreshCursor);
    } else if (top < 0) {
      $_daro4h15ujdud7g2d.moveOnlyScroll(socket, socket.dom().scrollTop + top).get(refreshCursor);
    } else {
    }
  };
  var $_4fyqnl163jdud7g3q = { scrollIntoView: scrollIntoView };

  var par = function (asyncValues, nu) {
    return nu(function (callback) {
      var r = [];
      var count = 0;
      var cb = function (i) {
        return function (value) {
          r[i] = value;
          count++;
          if (count >= asyncValues.length) {
            callback(r);
          }
        };
      };
      if (asyncValues.length === 0) {
        callback([]);
      } else {
        $_1g2cevwsjdud7ejp.each(asyncValues, function (asyncValue, i) {
          asyncValue.get(cb(i));
        });
      }
    });
  };
  var $_8gmqij166jdud7g40 = { par: par };

  var par$1 = function (futures) {
    return $_8gmqij166jdud7g40.par(futures, Future.nu);
  };
  var mapM = function (array, fn) {
    var futures = $_1g2cevwsjdud7ejp.map(array, fn);
    return par$1(futures);
  };
  var compose$1 = function (f, g) {
    return function (a) {
      return g(a).bind(f);
    };
  };
  var $_9xg2nn165jdud7g3z = {
    par: par$1,
    mapM: mapM,
    compose: compose$1
  };

  var updateFixed = function (element, property, winY, offsetY) {
    var destination = winY + offsetY;
    $_btgbcy103jdud7f3t.set(element, property, destination + 'px');
    return Future.pure(offsetY);
  };
  var updateScrollingFixed = function (element, winY, offsetY) {
    var destTop = winY + offsetY;
    var oldProp = $_btgbcy103jdud7f3t.getRaw(element, 'top').getOr(offsetY);
    var delta = destTop - parseInt(oldProp, 10);
    var destScroll = element.dom().scrollTop + delta;
    return $_daro4h15ujdud7g2d.moveScrollAndTop(element, destScroll, destTop);
  };
  var updateFixture = function (fixture, winY) {
    return fixture.fold(function (element, property, offsetY) {
      return updateFixed(element, property, winY, offsetY);
    }, function (element, offsetY) {
      return updateScrollingFixed(element, winY, offsetY);
    });
  };
  var updatePositions = function (container, winY) {
    var fixtures = $_efto7m15zjdud7g31.findFixtures(container);
    var updates = $_1g2cevwsjdud7ejp.map(fixtures, function (fixture) {
      return updateFixture(fixture, winY);
    });
    return $_9xg2nn165jdud7g3z.par(updates);
  };
  var $_3kanae164jdud7g3u = { updatePositions: updatePositions };

  var VIEW_MARGIN = 5;
  var register$2 = function (toolstrip, socket, container, outerWindow, structure, cWin) {
    var scroller = BackgroundActivity(function (y) {
      return $_daro4h15ujdud7g2d.moveWindowScroll(toolstrip, socket, y);
    });
    var scrollBounds = function () {
      var rects = $_5lp8kt148jdud7fso.getRectangles(cWin);
      return Option.from(rects[0]).bind(function (rect) {
        var viewTop = rect.top() - socket.dom().scrollTop;
        var outside = viewTop > outerWindow.innerHeight + VIEW_MARGIN || viewTop < -VIEW_MARGIN;
        return outside ? Option.some({
          top: $_9njj9iwjjdud7eix.constant(viewTop),
          bottom: $_9njj9iwjjdud7eix.constant(viewTop + rect.height())
        }) : Option.none();
      });
    };
    var scrollThrottle = $_dfio3v14wjdud7fvy.last(function () {
      scroller.idle(function () {
        $_3kanae164jdud7g3u.updatePositions(container, outerWindow.pageYOffset).get(function () {
          var extraScroll = scrollBounds();
          extraScroll.each(function (extra) {
            socket.dom().scrollTop = socket.dom().scrollTop + extra.top();
          });
          scroller.start(0);
          structure.refresh();
        });
      });
    }, 1000);
    var onScroll = $_5x7hr513xjdud7fqz.bind($_eobgtqxfjdud7elu.fromDom(outerWindow), 'scroll', function () {
      if (outerWindow.pageYOffset < 0) {
        return;
      }
      scrollThrottle.throttle();
    });
    $_3kanae164jdud7g3u.updatePositions(container, outerWindow.pageYOffset).get($_9njj9iwjjdud7eix.identity);
    return { unbind: onScroll.unbind };
  };
  var setup$3 = function (bag) {
    var cWin = bag.cWin();
    var ceBody = bag.ceBody();
    var socket = bag.socket();
    var toolstrip = bag.toolstrip();
    var toolbar = bag.toolbar();
    var contentElement = bag.contentElement();
    var keyboardType = bag.keyboardType();
    var outerWindow = bag.outerWindow();
    var dropup = bag.dropup();
    var structure = $_efto7m15zjdud7g31.takeover(socket, ceBody, toolstrip, dropup);
    var keyboardModel = keyboardType(bag.outerBody(), cWin, $_1tyeizxjjdud7em4.body(), contentElement, toolstrip, toolbar);
    var toEditing = function () {
      keyboardModel.toEditing();
      clearSelection();
    };
    var toReading = function () {
      keyboardModel.toReading();
    };
    var onToolbarTouch = function (event) {
      keyboardModel.onToolbarTouch(event);
    };
    var onOrientation = $_9zlehr13wjdud7fqs.onChange(outerWindow, {
      onChange: $_9njj9iwjjdud7eix.noop,
      onReady: structure.refresh
    });
    onOrientation.onAdjustment(function () {
      structure.refresh();
    });
    var onResize = $_5x7hr513xjdud7fqz.bind($_eobgtqxfjdud7elu.fromDom(outerWindow), 'resize', function () {
      if (structure.isExpanding()) {
        structure.refresh();
      }
    });
    var onScroll = register$2(toolstrip, socket, bag.outerBody(), outerWindow, structure, cWin);
    var unfocusedSelection = FakeSelection(cWin, contentElement);
    var refreshSelection = function () {
      if (unfocusedSelection.isActive()) {
        unfocusedSelection.update();
      }
    };
    var highlightSelection = function () {
      unfocusedSelection.update();
    };
    var clearSelection = function () {
      unfocusedSelection.clear();
    };
    var scrollIntoView = function (top, bottom) {
      $_4fyqnl163jdud7g3q.scrollIntoView(cWin, socket, dropup, top, bottom);
    };
    var syncHeight = function () {
      $_btgbcy103jdud7f3t.set(contentElement, 'height', contentElement.dom().contentWindow.document.body.scrollHeight + 'px');
    };
    var setViewportOffset = function (newYOffset) {
      structure.setViewportOffset(newYOffset);
      $_daro4h15ujdud7g2d.moveOnlyTop(socket, newYOffset).get($_9njj9iwjjdud7eix.identity);
    };
    var destroy = function () {
      structure.restore();
      onOrientation.destroy();
      onScroll.unbind();
      onResize.unbind();
      keyboardModel.destroy();
      unfocusedSelection.destroy();
      $_6rnw9j15ojdud7g16.input($_1tyeizxjjdud7em4.body(), $_25580rytjdud7ey7.blur);
    };
    return {
      toEditing: toEditing,
      toReading: toReading,
      onToolbarTouch: onToolbarTouch,
      refreshSelection: refreshSelection,
      clearSelection: clearSelection,
      highlightSelection: highlightSelection,
      scrollIntoView: scrollIntoView,
      updateToolbarPadding: $_9njj9iwjjdud7eix.noop,
      setViewportOffset: setViewportOffset,
      syncHeight: syncHeight,
      refreshStructure: structure.refresh,
      destroy: destroy
    };
  };
  var $_1f632615sjdud7g1q = { setup: setup$3 };

  var create$8 = function (platform, mask) {
    var meta = $_9dstax14ujdud7fvm.tag();
    var priorState = $_9fhyae12ojdud7fij.value();
    var scrollEvents = $_9fhyae12ojdud7fij.value();
    var iosApi = $_9fhyae12ojdud7fij.api();
    var iosEvents = $_9fhyae12ojdud7fij.api();
    var enter = function () {
      mask.hide();
      var doc = $_eobgtqxfjdud7elu.fromDom(document);
      $_8faw2r14sjdud7fv0.getActiveApi(platform.editor).each(function (editorApi) {
        priorState.set({
          socketHeight: $_btgbcy103jdud7f3t.getRaw(platform.socket, 'height'),
          iframeHeight: $_btgbcy103jdud7f3t.getRaw(editorApi.frame(), 'height'),
          outerScroll: document.body.scrollTop
        });
        scrollEvents.set({ exclusives: $_dvdycr153jdud7fwy.exclusive(doc, '.' + $_bhtyzh13ujdud7fqk.scrollable()) });
        $_1x3ogvynjdud7exn.add(platform.container, $_5qzh4bzejdud7f0y.resolve('fullscreen-maximized'));
        $_fjm65f14tjdud7fv9.clobberStyles(platform.container, editorApi.body());
        meta.maximize();
        $_btgbcy103jdud7f3t.set(platform.socket, 'overflow', 'scroll');
        $_btgbcy103jdud7f3t.set(platform.socket, '-webkit-overflow-scrolling', 'touch');
        $_25580rytjdud7ey7.focus(editorApi.body());
        var setupBag = $_8o1q69x4jdud7ekz.immutableBag([
          'cWin',
          'ceBody',
          'socket',
          'toolstrip',
          'toolbar',
          'dropup',
          'contentElement',
          'cursor',
          'keyboardType',
          'isScrolling',
          'outerWindow',
          'outerBody'
        ], []);
        iosApi.set($_1f632615sjdud7g1q.setup(setupBag({
          cWin: editorApi.win(),
          ceBody: editorApi.body(),
          socket: platform.socket,
          toolstrip: platform.toolstrip,
          toolbar: platform.toolbar,
          dropup: platform.dropup.element(),
          contentElement: editorApi.frame(),
          cursor: $_9njj9iwjjdud7eix.noop,
          outerBody: platform.body,
          outerWindow: platform.win,
          keyboardType: $_fx7jg115njdud7g0u.stubborn,
          isScrolling: function () {
            return scrollEvents.get().exists(function (s) {
              return s.socket.isScrolling();
            });
          }
        })));
        iosApi.run(function (api) {
          api.syncHeight();
        });
        iosEvents.set($_1nj2i15rjdud7g1i.initEvents(editorApi, iosApi, platform.toolstrip, platform.socket, platform.dropup));
      });
    };
    var exit = function () {
      meta.restore();
      iosEvents.clear();
      iosApi.clear();
      mask.show();
      priorState.on(function (s) {
        s.socketHeight.each(function (h) {
          $_btgbcy103jdud7f3t.set(platform.socket, 'height', h);
        });
        s.iframeHeight.each(function (h) {
          $_btgbcy103jdud7f3t.set(platform.editor.getFrame(), 'height', h);
        });
        document.body.scrollTop = s.scrollTop;
      });
      priorState.clear();
      scrollEvents.on(function (s) {
        s.exclusives.unbind();
      });
      scrollEvents.clear();
      $_1x3ogvynjdud7exn.remove(platform.container, $_5qzh4bzejdud7f0y.resolve('fullscreen-maximized'));
      $_fjm65f14tjdud7fv9.restoreStyles();
      $_bhtyzh13ujdud7fqk.deregister(platform.toolbar);
      $_btgbcy103jdud7f3t.remove(platform.socket, 'overflow');
      $_btgbcy103jdud7f3t.remove(platform.socket, '-webkit-overflow-scrolling');
      $_25580rytjdud7ey7.blur(platform.editor.getFrame());
      $_8faw2r14sjdud7fv0.getActiveApi(platform.editor).each(function (editorApi) {
        editorApi.clearSelection();
      });
    };
    var refreshStructure = function () {
      iosApi.run(function (api) {
        api.refreshStructure();
      });
    };
    return {
      enter: enter,
      refreshStructure: refreshStructure,
      exit: exit
    };
  };
  var $_39i30915mjdud7g0i = { create: create$8 };

  var produce$1 = function (raw) {
    var mobile = $_13hkebyejdud7ewm.asRawOrDie('Getting IosWebapp schema', MobileSchema, raw);
    $_btgbcy103jdud7f3t.set(mobile.toolstrip, 'width', '100%');
    $_btgbcy103jdud7f3t.set(mobile.container, 'position', 'relative');
    var onView = function () {
      mobile.setReadOnly(true);
      mode.enter();
    };
    var mask = $_ap2ej712tjdud7fjl.build($_ddqihl14vjdud7fvr.sketch(onView, mobile.translate));
    mobile.alloy.add(mask);
    var maskApi = {
      show: function () {
        mobile.alloy.add(mask);
      },
      hide: function () {
        mobile.alloy.remove(mask);
      }
    };
    var mode = $_39i30915mjdud7g0i.create(mobile, maskApi);
    return {
      setReadOnly: mobile.setReadOnly,
      refreshStructure: mode.refreshStructure,
      enter: mode.enter,
      exit: mode.exit,
      destroy: $_9njj9iwjjdud7eix.noop
    };
  };
  var $_bg5sjd15ljdud7g0d = { produce: produce$1 };

  function IosRealm (scrollIntoView) {
    var alloy = OuterContainer({ classes: [$_5qzh4bzejdud7f0y.resolve('ios-container')] });
    var toolbar = ScrollingToolbar();
    var webapp = $_9fhyae12ojdud7fij.api();
    var switchToEdit = $_enp5ds154jdud7fxb.makeEditSwitch(webapp);
    var socket = $_enp5ds154jdud7fxb.makeSocket();
    var dropup = $_9ihizd155jdud7fxi.build(function () {
      webapp.run(function (w) {
        w.refreshStructure();
      });
    }, scrollIntoView);
    alloy.add(toolbar.wrapper());
    alloy.add(socket);
    alloy.add(dropup.component());
    var setToolbarGroups = function (rawGroups) {
      var groups = toolbar.createGroups(rawGroups);
      toolbar.setGroups(groups);
    };
    var setContextToolbar = function (rawGroups) {
      var groups = toolbar.createGroups(rawGroups);
      toolbar.setContextToolbar(groups);
    };
    var focusToolbar = function () {
      toolbar.focus();
    };
    var restoreToolbar = function () {
      toolbar.restoreToolbar();
    };
    var init = function (spec) {
      webapp.set($_bg5sjd15ljdud7g0d.produce(spec));
    };
    var exit = function () {
      webapp.run(function (w) {
        Replacing.remove(socket, switchToEdit);
        w.exit();
      });
    };
    var updateMode = function (readOnly) {
      $_enp5ds154jdud7fxb.updateMode(socket, switchToEdit, readOnly, alloy.root());
    };
    return {
      system: $_9njj9iwjjdud7eix.constant(alloy),
      element: alloy.element,
      init: init,
      exit: exit,
      setToolbarGroups: setToolbarGroups,
      setContextToolbar: setContextToolbar,
      focusToolbar: focusToolbar,
      restoreToolbar: restoreToolbar,
      updateMode: updateMode,
      socket: $_9njj9iwjjdud7eix.constant(socket),
      dropup: $_9njj9iwjjdud7eix.constant(dropup)
    };
  }

  var EditorManager = tinymce.util.Tools.resolve('tinymce.EditorManager');

  var derive$4 = function (editor) {
    var base = $_ettibkxsjdud7emz.readOptFrom(editor.settings, 'skin_url').fold(function () {
      return EditorManager.baseURL + '/skins/' + 'lightgray';
    }, function (url) {
      return url;
    });
    return {
      content: base + '/content.mobile.min.css',
      ui: base + '/skin.mobile.min.css'
    };
  };
  var $_59h54f167jdud7g42 = { derive: derive$4 };

  var fontSizes = [
    'x-small',
    'small',
    'medium',
    'large',
    'x-large'
  ];
  var fireChange$1 = function (realm, command, state) {
    realm.system().broadcastOn([$_dlmrcrz1jdud7eyr.formatChanged()], {
      command: command,
      state: state
    });
  };
  var init$5 = function (realm, editor) {
    var allFormats = $_2dykn0x0jdud7ekc.keys(editor.formatter.get());
    $_1g2cevwsjdud7ejp.each(allFormats, function (command) {
      editor.formatter.formatChanged(command, function (state) {
        fireChange$1(realm, command, state);
      });
    });
    $_1g2cevwsjdud7ejp.each([
      'ul',
      'ol'
    ], function (command) {
      editor.selection.selectorChanged(command, function (state, data) {
        fireChange$1(realm, command, state);
      });
    });
  };
  var $_3v45zx169jdud7g45 = {
    init: init$5,
    fontSizes: $_9njj9iwjjdud7eix.constant(fontSizes)
  };

  var fireSkinLoaded = function (editor) {
    var done = function () {
      editor._skinLoaded = true;
      editor.fire('SkinLoaded');
    };
    return function () {
      if (editor.initialized) {
        done();
      } else {
        editor.on('init', done);
      }
    };
  };
  var $_51lca516ajdud7g48 = { fireSkinLoaded: fireSkinLoaded };

  var READING = $_9njj9iwjjdud7eix.constant('toReading');
  var EDITING = $_9njj9iwjjdud7eix.constant('toEditing');
  ThemeManager.add('mobile', function (editor) {
    var renderUI = function (args) {
      var cssUrls = $_59h54f167jdud7g42.derive(editor);
      if ($_1ue238z0jdud7eyq.isSkinDisabled(editor) === false) {
        editor.contentCSS.push(cssUrls.content);
        DOMUtils.DOM.styleSheetLoader.load(cssUrls.ui, $_51lca516ajdud7g48.fireSkinLoaded(editor));
      } else {
        $_51lca516ajdud7g48.fireSkinLoaded(editor)();
      }
      var doScrollIntoView = function () {
        editor.fire('scrollIntoView');
      };
      var wrapper = $_eobgtqxfjdud7elu.fromTag('div');
      var realm = $_chh2cvwkjdud7ej0.detect().os.isAndroid() ? AndroidRealm(doScrollIntoView) : IosRealm(doScrollIntoView);
      var original = $_eobgtqxfjdud7elu.fromDom(args.targetNode);
      $_ftkbb5x2jdud7ekp.after(original, wrapper);
      $_fesilqx1jdud7ekf.attachSystem(wrapper, realm.system());
      var findFocusIn = function (elem) {
        return $_25580rytjdud7ey7.search(elem).bind(function (focused) {
          return realm.system().getByDom(focused).toOption();
        });
      };
      var outerWindow = args.targetNode.ownerDocument.defaultView;
      var orientation = $_9zlehr13wjdud7fqs.onChange(outerWindow, {
        onChange: function () {
          var alloy = realm.system();
          alloy.broadcastOn([$_dlmrcrz1jdud7eyr.orientationChanged()], { width: $_9zlehr13wjdud7fqs.getActualWidth(outerWindow) });
        },
        onReady: $_9njj9iwjjdud7eix.noop
      });
      var setReadOnly = function (readOnlyGroups, mainGroups, ro) {
        if (ro === false) {
          editor.selection.collapse();
        }
        realm.setToolbarGroups(ro ? readOnlyGroups.get() : mainGroups.get());
        editor.setMode(ro === true ? 'readonly' : 'design');
        editor.fire(ro === true ? READING() : EDITING());
        realm.updateMode(ro);
      };
      var bindHandler = function (label, handler) {
        editor.on(label, handler);
        return {
          unbind: function () {
            editor.off(label);
          }
        };
      };
      editor.on('init', function () {
        realm.init({
          editor: {
            getFrame: function () {
              return $_eobgtqxfjdud7elu.fromDom(editor.contentAreaContainer.querySelector('iframe'));
            },
            onDomChanged: function () {
              return { unbind: $_9njj9iwjjdud7eix.noop };
            },
            onToReading: function (handler) {
              return bindHandler(READING(), handler);
            },
            onToEditing: function (handler) {
              return bindHandler(EDITING(), handler);
            },
            onScrollToCursor: function (handler) {
              editor.on('scrollIntoView', function (tinyEvent) {
                handler(tinyEvent);
              });
              var unbind = function () {
                editor.off('scrollIntoView');
                orientation.destroy();
              };
              return { unbind: unbind };
            },
            onTouchToolstrip: function () {
              hideDropup();
            },
            onTouchContent: function () {
              var toolbar = $_eobgtqxfjdud7elu.fromDom(editor.editorContainer.querySelector('.' + $_5qzh4bzejdud7f0y.resolve('toolbar')));
              findFocusIn(toolbar).each($_98da6jwgjdud7eil.emitExecute);
              realm.restoreToolbar();
              hideDropup();
            },
            onTapContent: function (evt) {
              var target = evt.target();
              if ($_50qkdpxkjdud7em6.name(target) === 'img') {
                editor.selection.select(target.dom());
                evt.kill();
              } else if ($_50qkdpxkjdud7em6.name(target) === 'a') {
                var component = realm.system().getByDom($_eobgtqxfjdud7elu.fromDom(editor.editorContainer));
                component.each(function (container) {
                  if (Swapping.isAlpha(container)) {
                    $_6cir74yzjdud7eyp.openLink(target.dom());
                  }
                });
              }
            }
          },
          container: $_eobgtqxfjdud7elu.fromDom(editor.editorContainer),
          socket: $_eobgtqxfjdud7elu.fromDom(editor.contentAreaContainer),
          toolstrip: $_eobgtqxfjdud7elu.fromDom(editor.editorContainer.querySelector('.' + $_5qzh4bzejdud7f0y.resolve('toolstrip'))),
          toolbar: $_eobgtqxfjdud7elu.fromDom(editor.editorContainer.querySelector('.' + $_5qzh4bzejdud7f0y.resolve('toolbar'))),
          dropup: realm.dropup(),
          alloy: realm.system(),
          translate: $_9njj9iwjjdud7eix.noop,
          setReadOnly: function (ro) {
            setReadOnly(readOnlyGroups, mainGroups, ro);
          }
        });
        var hideDropup = function () {
          realm.dropup().disappear(function () {
            realm.system().broadcastOn([$_dlmrcrz1jdud7eyr.dropupDismissed()], {});
          });
        };
        $_efa715xljdud7em8.registerInspector('remove this', realm.system());
        var backToMaskGroup = {
          label: 'The first group',
          scrollable: false,
          items: [$_d0l7buzfjdud7f11.forToolbar('back', function () {
              editor.selection.collapse();
              realm.exit();
            }, {})]
        };
        var backToReadOnlyGroup = {
          label: 'Back to read only',
          scrollable: false,
          items: [$_d0l7buzfjdud7f11.forToolbar('readonly-back', function () {
              setReadOnly(readOnlyGroups, mainGroups, true);
            }, {})]
        };
        var readOnlyGroup = {
          label: 'The read only mode group',
          scrollable: true,
          items: []
        };
        var features = $_44tgozz2jdud7eyu.setup(realm, editor);
        var items = $_44tgozz2jdud7eyu.detect(editor.settings, features);
        var actionGroup = {
          label: 'the action group',
          scrollable: true,
          items: items
        };
        var extraGroup = {
          label: 'The extra group',
          scrollable: false,
          items: []
        };
        var mainGroups = Cell([
          backToReadOnlyGroup,
          actionGroup,
          extraGroup
        ]);
        var readOnlyGroups = Cell([
          backToMaskGroup,
          readOnlyGroup,
          extraGroup
        ]);
        $_3v45zx169jdud7g45.init(realm, editor);
      });
      return {
        iframeContainer: realm.socket().element().dom(),
        editorContainer: realm.element().dom()
      };
    };
    return {
      getNotificationManagerImpl: function () {
        return {
          open: $_9njj9iwjjdud7eix.identity,
          close: $_9njj9iwjjdud7eix.noop,
          reposition: $_9njj9iwjjdud7eix.noop,
          getArgs: $_9njj9iwjjdud7eix.identity
        };
      },
      renderUI: renderUI
    };
  });
  function Theme () {
  }

  return Theme;

}());
})();
