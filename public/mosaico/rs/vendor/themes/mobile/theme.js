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
  var $_49qg0cwjje5o2xv6 = {
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

  var $_2opl28wije5o2xv3 = {
    contextmenu: $_49qg0cwjje5o2xv6.constant('contextmenu'),
    touchstart: $_49qg0cwjje5o2xv6.constant('touchstart'),
    touchmove: $_49qg0cwjje5o2xv6.constant('touchmove'),
    touchend: $_49qg0cwjje5o2xv6.constant('touchend'),
    gesturestart: $_49qg0cwjje5o2xv6.constant('gesturestart'),
    mousedown: $_49qg0cwjje5o2xv6.constant('mousedown'),
    mousemove: $_49qg0cwjje5o2xv6.constant('mousemove'),
    mouseout: $_49qg0cwjje5o2xv6.constant('mouseout'),
    mouseup: $_49qg0cwjje5o2xv6.constant('mouseup'),
    mouseover: $_49qg0cwjje5o2xv6.constant('mouseover'),
    focusin: $_49qg0cwjje5o2xv6.constant('focusin'),
    keydown: $_49qg0cwjje5o2xv6.constant('keydown'),
    input: $_49qg0cwjje5o2xv6.constant('input'),
    change: $_49qg0cwjje5o2xv6.constant('change'),
    focus: $_49qg0cwjje5o2xv6.constant('focus'),
    click: $_49qg0cwjje5o2xv6.constant('click'),
    transitionend: $_49qg0cwjje5o2xv6.constant('transitionend'),
    selectstart: $_49qg0cwjje5o2xv6.constant('selectstart')
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
  var $_4sqgp8wlje5o2xva = { cached: cached };

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
  var $_b6eemswoje5o2xvf = {
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
      version: $_b6eemswoje5o2xvf.unknown()
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
  var $_7drsrjwnje5o2xvc = {
    unknown: unknown$1,
    nu: nu$1,
    edge: $_49qg0cwjje5o2xv6.constant(edge),
    chrome: $_49qg0cwjje5o2xv6.constant(chrome),
    ie: $_49qg0cwjje5o2xv6.constant(ie),
    opera: $_49qg0cwjje5o2xv6.constant(opera),
    firefox: $_49qg0cwjje5o2xv6.constant(firefox),
    safari: $_49qg0cwjje5o2xv6.constant(safari)
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
      version: $_b6eemswoje5o2xvf.unknown()
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
  var $_240f7gwpje5o2xvg = {
    unknown: unknown$2,
    nu: nu$2,
    windows: $_49qg0cwjje5o2xv6.constant(windows),
    ios: $_49qg0cwjje5o2xv6.constant(ios),
    android: $_49qg0cwjje5o2xv6.constant(android),
    linux: $_49qg0cwjje5o2xv6.constant(linux),
    osx: $_49qg0cwjje5o2xv6.constant(osx),
    solaris: $_49qg0cwjje5o2xv6.constant(solaris),
    freebsd: $_49qg0cwjje5o2xv6.constant(freebsd)
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
      isiPad: $_49qg0cwjje5o2xv6.constant(isiPad),
      isiPhone: $_49qg0cwjje5o2xv6.constant(isiPhone),
      isTablet: $_49qg0cwjje5o2xv6.constant(isTablet),
      isPhone: $_49qg0cwjje5o2xv6.constant(isPhone),
      isTouch: $_49qg0cwjje5o2xv6.constant(isTouch),
      isAndroid: os.isAndroid,
      isiOS: os.isiOS,
      isWebView: $_49qg0cwjje5o2xv6.constant(iOSwebview)
    };
  }

  var never$1 = $_49qg0cwjje5o2xv6.never;
  var always$1 = $_49qg0cwjje5o2xv6.always;
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
      toString: $_49qg0cwjje5o2xv6.constant('none()')
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
  var $_8kvqz0wsje5o2xvo = {
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
    return $_8kvqz0wsje5o2xvo.find(candidates, function (candidate) {
      return candidate.search(agent);
    });
  };
  var detectBrowser = function (browsers, userAgent) {
    return detect$1(browsers, userAgent).map(function (browser) {
      var version = $_b6eemswoje5o2xvf.detect(browser.versionRegexes, userAgent);
      return {
        current: browser.name,
        version: version
      };
    });
  };
  var detectOs = function (oses, userAgent) {
    return detect$1(oses, userAgent).map(function (os) {
      var version = $_b6eemswoje5o2xvf.detect(os.versionRegexes, userAgent);
      return {
        current: os.name,
        version: version
      };
    });
  };
  var $_6m9aynwrje5o2xvl = {
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
  var $_3hmmu6wwje5o2xwi = {
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
  var $_25gwf0wxje5o2xwj = {
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
    return startsWith(str, prefix) ? $_3hmmu6wwje5o2xwi.removeFromStart(str, prefix.length) : str;
  };
  var removeTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? $_3hmmu6wwje5o2xwi.removeFromEnd(str, prefix.length) : str;
  };
  var ensureLeading = function (str, prefix) {
    return startsWith(str, prefix) ? str : $_3hmmu6wwje5o2xwi.addToStart(str, prefix);
  };
  var ensureTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? str : $_3hmmu6wwje5o2xwi.addToEnd(str, prefix);
  };
  var contains$1 = function (str, substr) {
    return str.indexOf(substr) !== -1;
  };
  var capitalize = function (str) {
    return $_25gwf0wxje5o2xwj.head(str).bind(function (head) {
      return $_25gwf0wxje5o2xwj.tail(str).map(function (tail) {
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
  var $_gfctqkwvje5o2xwg = {
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
      return $_gfctqkwvje5o2xwg.contains(uastring, target);
    };
  };
  var browsers = [
    {
      name: 'Edge',
      versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
      search: function (uastring) {
        var monstrosity = $_gfctqkwvje5o2xwg.contains(uastring, 'edge/') && $_gfctqkwvje5o2xwg.contains(uastring, 'chrome') && $_gfctqkwvje5o2xwg.contains(uastring, 'safari') && $_gfctqkwvje5o2xwg.contains(uastring, 'applewebkit');
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
        return $_gfctqkwvje5o2xwg.contains(uastring, 'chrome') && !$_gfctqkwvje5o2xwg.contains(uastring, 'chromeframe');
      }
    },
    {
      name: 'IE',
      versionRegexes: [
        /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
        /.*?rv:([0-9]+)\.([0-9]+).*/
      ],
      search: function (uastring) {
        return $_gfctqkwvje5o2xwg.contains(uastring, 'msie') || $_gfctqkwvje5o2xwg.contains(uastring, 'trident');
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
        return ($_gfctqkwvje5o2xwg.contains(uastring, 'safari') || $_gfctqkwvje5o2xwg.contains(uastring, 'mobile/')) && $_gfctqkwvje5o2xwg.contains(uastring, 'applewebkit');
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
        return $_gfctqkwvje5o2xwg.contains(uastring, 'iphone') || $_gfctqkwvje5o2xwg.contains(uastring, 'ipad');
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
  var $_i6i5lwuje5o2xwc = {
    browsers: $_49qg0cwjje5o2xv6.constant(browsers),
    oses: $_49qg0cwjje5o2xv6.constant(oses)
  };

  var detect$2 = function (userAgent) {
    var browsers = $_i6i5lwuje5o2xwc.browsers();
    var oses = $_i6i5lwuje5o2xwc.oses();
    var browser = $_6m9aynwrje5o2xvl.detectBrowser(browsers, userAgent).fold($_7drsrjwnje5o2xvc.unknown, $_7drsrjwnje5o2xvc.nu);
    var os = $_6m9aynwrje5o2xvl.detectOs(oses, userAgent).fold($_240f7gwpje5o2xvg.unknown, $_240f7gwpje5o2xvg.nu);
    var deviceType = DeviceType(os, browser, userAgent);
    return {
      browser: browser,
      os: os,
      deviceType: deviceType
    };
  };
  var $_3m331jwmje5o2xvb = { detect: detect$2 };

  var detect$3 = $_4sqgp8wlje5o2xva.cached(function () {
    var userAgent = navigator.userAgent;
    return $_3m331jwmje5o2xvb.detect(userAgent);
  });
  var $_6ys1d4wkje5o2xv8 = { detect: detect$3 };

  var alloy = { tap: $_49qg0cwjje5o2xv6.constant('alloy.tap') };
  var $_9k0aw9whje5o2xv0 = {
    focus: $_49qg0cwjje5o2xv6.constant('alloy.focus'),
    postBlur: $_49qg0cwjje5o2xv6.constant('alloy.blur.post'),
    receive: $_49qg0cwjje5o2xv6.constant('alloy.receive'),
    execute: $_49qg0cwjje5o2xv6.constant('alloy.execute'),
    focusItem: $_49qg0cwjje5o2xv6.constant('alloy.focus.item'),
    tap: alloy.tap,
    tapOrClick: $_6ys1d4wkje5o2xv8.detect().deviceType.isTouch() ? alloy.tap : $_2opl28wije5o2xv3.click,
    longpress: $_49qg0cwjje5o2xv6.constant('alloy.longpress'),
    sandboxClose: $_49qg0cwjje5o2xv6.constant('alloy.sandbox.close'),
    systemInit: $_49qg0cwjje5o2xv6.constant('alloy.system.init'),
    windowScroll: $_49qg0cwjje5o2xv6.constant('alloy.system.scroll'),
    attachedToDom: $_49qg0cwjje5o2xv6.constant('alloy.system.attached'),
    detachedFromDom: $_49qg0cwjje5o2xv6.constant('alloy.system.detached'),
    changeTab: $_49qg0cwjje5o2xv6.constant('alloy.change.tab'),
    dismissTab: $_49qg0cwjje5o2xv6.constant('alloy.dismiss.tab')
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
  var $_568ih9wzje5o2xwm = {
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
    var bothObjects = $_568ih9wzje5o2xwm.isObject(old) && $_568ih9wzje5o2xwm.isObject(nu);
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
  var $_gc11amwyje5o2xwl = {
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
  var $_67wkp4x0je5o2xwn = {
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
    emit(component, $_9k0aw9whje5o2xv0.execute());
  };
  var dispatch = function (component, target, event) {
    dispatchWith(component, target, event, {});
  };
  var dispatchWith = function (component, target, event, properties) {
    var data = $_gc11amwyje5o2xwl.deepMerge({ target: target }, properties);
    component.getSystem().triggerEvent(event, target, $_67wkp4x0je5o2xwn.map(data, $_49qg0cwjje5o2xv6.constant));
  };
  var dispatchEvent = function (component, target, event, simulatedEvent) {
    component.getSystem().triggerEvent(event, target, simulatedEvent.event());
  };
  var dispatchFocus = function (component, target) {
    component.getSystem().triggerFocus(target, component.element());
  };
  var $_d7275bwgje5o2xut = {
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
      $_8kvqz0wsje5o2xvo.each(fields, function (name, i) {
        struct[name] = $_49qg0cwjje5o2xv6.constant(values[i]);
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
    if (!$_568ih9wzje5o2xwm.isArray(array))
      throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
    $_8kvqz0wsje5o2xvo.each(array, function (a) {
      if (!$_568ih9wzje5o2xwm.isString(a))
        throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
    });
  };
  var invalidTypeMessage = function (incorrect, type) {
    throw new Error('All values need to be of type: ' + type + '. Keys (' + sort$1(incorrect).join(', ') + ') were not.');
  };
  var checkDupes = function (everything) {
    var sorted = sort$1(everything);
    var dupe = $_8kvqz0wsje5o2xvo.find(sorted, function (s, i) {
      return i < sorted.length - 1 && s === sorted[i + 1];
    });
    dupe.each(function (d) {
      throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
    });
  };
  var $_6dak24x7je5o2xxf = {
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
    $_6dak24x7je5o2xxf.validateStrArr('required', required);
    $_6dak24x7je5o2xxf.validateStrArr('optional', optional);
    $_6dak24x7je5o2xxf.checkDupes(everything);
    return function (obj) {
      var keys = $_67wkp4x0je5o2xwn.keys(obj);
      var allReqd = $_8kvqz0wsje5o2xvo.forall(required, function (req) {
        return $_8kvqz0wsje5o2xvo.contains(keys, req);
      });
      if (!allReqd)
        $_6dak24x7je5o2xxf.reqMessage(required, keys);
      var unsupported = $_8kvqz0wsje5o2xvo.filter(keys, function (key) {
        return !$_8kvqz0wsje5o2xvo.contains(everything, key);
      });
      if (unsupported.length > 0)
        $_6dak24x7je5o2xxf.unsuppMessage(unsupported);
      var r = {};
      $_8kvqz0wsje5o2xvo.each(required, function (req) {
        r[req] = $_49qg0cwjje5o2xv6.constant(obj[req]);
      });
      $_8kvqz0wsje5o2xvo.each(optional, function (opt) {
        r[opt] = $_49qg0cwjje5o2xv6.constant(Object.prototype.hasOwnProperty.call(obj, opt) ? Option.some(obj[opt]) : Option.none());
      });
      return r;
    };
  }

  var $_2y7sshx4je5o2xxa = {
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
  var $_ew0p8tx8je5o2xxh = { toArray: toArray };

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
  var $_ad80b8xcje5o2xxr = {
    path: path,
    resolve: resolve,
    forge: forge,
    namespace: namespace
  };

  var unsafe = function (name, scope) {
    return $_ad80b8xcje5o2xxr.resolve(name, scope);
  };
  var getOrDie = function (name, scope) {
    var actual = unsafe(name, scope);
    if (actual === undefined || actual === null)
      throw name + ' not available on this browser';
    return actual;
  };
  var $_9ndwkgxbje5o2xxp = { getOrDie: getOrDie };

  var node = function () {
    var f = $_9ndwkgxbje5o2xxp.getOrDie('Node');
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
  var $_6a0v43xaje5o2xxn = {
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
    return { dom: $_49qg0cwjje5o2xv6.constant(node) };
  };
  var fromPoint = function (doc, x, y) {
    return Option.from(doc.dom().elementFromPoint(x, y)).map(fromDom);
  };
  var $_f7rai4xfje5o2xy5 = {
    fromHtml: fromHtml,
    fromTag: fromTag,
    fromText: fromText,
    fromDom: fromDom,
    fromPoint: fromPoint
  };

  var $_1yz3sjxgje5o2xy9 = {
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

  var ELEMENT = $_1yz3sjxgje5o2xy9.ELEMENT;
  var DOCUMENT = $_1yz3sjxgje5o2xy9.DOCUMENT;
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
    return bypassSelector(base) ? [] : $_8kvqz0wsje5o2xvo.map(base.querySelectorAll(selector), $_f7rai4xfje5o2xy5.fromDom);
  };
  var one = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? Option.none() : Option.from(base.querySelector(selector)).map($_f7rai4xfje5o2xy5.fromDom);
  };
  var $_463sqkxeje5o2xxt = {
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
    return $_8kvqz0wsje5o2xvo.exists(elements, $_49qg0cwjje5o2xv6.curry(eq, element));
  };
  var regularContains = function (e1, e2) {
    var d1 = e1.dom(), d2 = e2.dom();
    return d1 === d2 ? false : d1.contains(d2);
  };
  var ieContains = function (e1, e2) {
    return $_6a0v43xaje5o2xxn.documentPositionContainedBy(e1.dom(), e2.dom());
  };
  var browser = $_6ys1d4wkje5o2xv8.detect().browser;
  var contains$2 = browser.isIE() ? ieContains : regularContains;
  var $_8iyn3dx9je5o2xxi = {
    eq: eq,
    isEqualNode: isEqualNode,
    member: member,
    contains: contains$2,
    is: $_463sqkxeje5o2xxt.is
  };

  var owner = function (element) {
    return $_f7rai4xfje5o2xy5.fromDom(element.dom().ownerDocument);
  };
  var documentElement = function (element) {
    var doc = owner(element);
    return $_f7rai4xfje5o2xy5.fromDom(doc.dom().documentElement);
  };
  var defaultView = function (element) {
    var el = element.dom();
    var defaultView = el.ownerDocument.defaultView;
    return $_f7rai4xfje5o2xy5.fromDom(defaultView);
  };
  var parent = function (element) {
    var dom = element.dom();
    return Option.from(dom.parentNode).map($_f7rai4xfje5o2xy5.fromDom);
  };
  var findIndex$1 = function (element) {
    return parent(element).bind(function (p) {
      var kin = children(p);
      return $_8kvqz0wsje5o2xvo.findIndex(kin, function (elem) {
        return $_8iyn3dx9je5o2xxi.eq(element, elem);
      });
    });
  };
  var parents = function (element, isRoot) {
    var stop = $_568ih9wzje5o2xwm.isFunction(isRoot) ? isRoot : $_49qg0cwjje5o2xv6.constant(false);
    var dom = element.dom();
    var ret = [];
    while (dom.parentNode !== null && dom.parentNode !== undefined) {
      var rawParent = dom.parentNode;
      var parent = $_f7rai4xfje5o2xy5.fromDom(rawParent);
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
      return $_8kvqz0wsje5o2xvo.filter(elements, function (x) {
        return !$_8iyn3dx9je5o2xxi.eq(element, x);
      });
    };
    return parent(element).map(children).map(filterSelf).getOr([]);
  };
  var offsetParent = function (element) {
    var dom = element.dom();
    return Option.from(dom.offsetParent).map($_f7rai4xfje5o2xy5.fromDom);
  };
  var prevSibling = function (element) {
    var dom = element.dom();
    return Option.from(dom.previousSibling).map($_f7rai4xfje5o2xy5.fromDom);
  };
  var nextSibling = function (element) {
    var dom = element.dom();
    return Option.from(dom.nextSibling).map($_f7rai4xfje5o2xy5.fromDom);
  };
  var prevSiblings = function (element) {
    return $_8kvqz0wsje5o2xvo.reverse($_ew0p8tx8je5o2xxh.toArray(element, prevSibling));
  };
  var nextSiblings = function (element) {
    return $_ew0p8tx8je5o2xxh.toArray(element, nextSibling);
  };
  var children = function (element) {
    var dom = element.dom();
    return $_8kvqz0wsje5o2xvo.map(dom.childNodes, $_f7rai4xfje5o2xy5.fromDom);
  };
  var child = function (element, index) {
    var children = element.dom().childNodes;
    return Option.from(children[index]).map($_f7rai4xfje5o2xy5.fromDom);
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
  var spot = $_2y7sshx4je5o2xxa.immutable('element', 'offset');
  var leaf = function (element, offset) {
    var cs = children(element);
    return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
  };
  var $_5i5voox3je5o2xx2 = {
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
    var parent = $_5i5voox3je5o2xx2.parent(marker);
    parent.each(function (v) {
      v.dom().insertBefore(element.dom(), marker.dom());
    });
  };
  var after = function (marker, element) {
    var sibling = $_5i5voox3je5o2xx2.nextSibling(marker);
    sibling.fold(function () {
      var parent = $_5i5voox3je5o2xx2.parent(marker);
      parent.each(function (v) {
        append(v, element);
      });
    }, function (v) {
      before(v, element);
    });
  };
  var prepend = function (parent, element) {
    var firstChild = $_5i5voox3je5o2xx2.firstChild(parent);
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
    $_5i5voox3je5o2xx2.child(parent, index).fold(function () {
      append(parent, element);
    }, function (v) {
      before(v, element);
    });
  };
  var wrap = function (element, wrapper) {
    before(element, wrapper);
    append(wrapper, element);
  };
  var $_9je15xx2je5o2xx0 = {
    before: before,
    after: after,
    prepend: prepend,
    append: append,
    appendAt: appendAt,
    wrap: wrap
  };

  var before$1 = function (marker, elements) {
    $_8kvqz0wsje5o2xvo.each(elements, function (x) {
      $_9je15xx2je5o2xx0.before(marker, x);
    });
  };
  var after$1 = function (marker, elements) {
    $_8kvqz0wsje5o2xvo.each(elements, function (x, i) {
      var e = i === 0 ? marker : elements[i - 1];
      $_9je15xx2je5o2xx0.after(e, x);
    });
  };
  var prepend$1 = function (parent, elements) {
    $_8kvqz0wsje5o2xvo.each(elements.slice().reverse(), function (x) {
      $_9je15xx2je5o2xx0.prepend(parent, x);
    });
  };
  var append$1 = function (parent, elements) {
    $_8kvqz0wsje5o2xvo.each(elements, function (x) {
      $_9je15xx2je5o2xx0.append(parent, x);
    });
  };
  var $_90nfp9xije5o2xyc = {
    before: before$1,
    after: after$1,
    prepend: prepend$1,
    append: append$1
  };

  var empty = function (element) {
    element.dom().textContent = '';
    $_8kvqz0wsje5o2xvo.each($_5i5voox3je5o2xx2.children(element), function (rogue) {
      remove(rogue);
    });
  };
  var remove = function (element) {
    var dom = element.dom();
    if (dom.parentNode !== null)
      dom.parentNode.removeChild(dom);
  };
  var unwrap = function (wrapper) {
    var children = $_5i5voox3je5o2xx2.children(wrapper);
    if (children.length > 0)
      $_90nfp9xije5o2xyc.before(wrapper, children);
    remove(wrapper);
  };
  var $_fjv49rxhje5o2xya = {
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
    return type(element) === $_1yz3sjxgje5o2xy9.COMMENT || name(element) === '#comment';
  };
  var isElement = isType$1($_1yz3sjxgje5o2xy9.ELEMENT);
  var isText = isType$1($_1yz3sjxgje5o2xy9.TEXT);
  var isDocument = isType$1($_1yz3sjxgje5o2xy9.DOCUMENT);
  var $_5souzyxkje5o2xyh = {
    name: name,
    type: type,
    value: value,
    isElement: isElement,
    isText: isText,
    isDocument: isDocument,
    isComment: isComment
  };

  var inBody = function (element) {
    var dom = $_5souzyxkje5o2xyh.isText(element) ? element.dom().parentNode : element.dom();
    return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
  };
  var body = $_4sqgp8wlje5o2xva.cached(function () {
    return getBody($_f7rai4xfje5o2xy5.fromDom(document));
  });
  var getBody = function (doc) {
    var body = doc.dom().body;
    if (body === null || body === undefined)
      throw 'Body is not available yet';
    return $_f7rai4xfje5o2xy5.fromDom(body);
  };
  var $_4ff55vxjje5o2xyf = {
    body: body,
    getBody: getBody,
    inBody: inBody
  };

  var fireDetaching = function (component) {
    $_d7275bwgje5o2xut.emit(component, $_9k0aw9whje5o2xv0.detachedFromDom());
    var children = component.components();
    $_8kvqz0wsje5o2xvo.each(children, fireDetaching);
  };
  var fireAttaching = function (component) {
    var children = component.components();
    $_8kvqz0wsje5o2xvo.each(children, fireAttaching);
    $_d7275bwgje5o2xut.emit(component, $_9k0aw9whje5o2xv0.attachedToDom());
  };
  var attach = function (parent, child) {
    attachWith(parent, child, $_9je15xx2je5o2xx0.append);
  };
  var attachWith = function (parent, child, insertion) {
    parent.getSystem().addToWorld(child);
    insertion(parent.element(), child.element());
    if ($_4ff55vxjje5o2xyf.inBody(parent.element()))
      fireAttaching(child);
    parent.syncComponents();
  };
  var doDetach = function (component) {
    fireDetaching(component);
    $_fjv49rxhje5o2xya.remove(component.element());
    component.getSystem().removeFromWorld(component);
  };
  var detach = function (component) {
    var parent = $_5i5voox3je5o2xx2.parent(component.element()).bind(function (p) {
      return component.getSystem().getByDom(p).fold(Option.none, Option.some);
    });
    doDetach(component);
    parent.each(function (p) {
      p.syncComponents();
    });
  };
  var detachChildren = function (component) {
    var subs = component.components();
    $_8kvqz0wsje5o2xvo.each(subs, doDetach);
    $_fjv49rxhje5o2xya.empty(component.element());
    component.syncComponents();
  };
  var attachSystem = function (element, guiSystem) {
    $_9je15xx2je5o2xx0.append(element, guiSystem.element());
    var children = $_5i5voox3je5o2xx2.children(guiSystem.element());
    $_8kvqz0wsje5o2xvo.each(children, function (child) {
      guiSystem.getByDom(child).each(fireAttaching);
    });
  };
  var detachSystem = function (guiSystem) {
    var children = $_5i5voox3je5o2xx2.children(guiSystem.element());
    $_8kvqz0wsje5o2xvo.each(children, function (child) {
      guiSystem.getByDom(child).each(fireDetaching);
    });
    $_fjv49rxhje5o2xya.remove(guiSystem.element());
  };
  var $_s45jfx1je5o2xwq = {
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
    return $_5i5voox3je5o2xx2.children($_f7rai4xfje5o2xy5.fromDom(div));
  };
  var fromTags = function (tags, scope) {
    return $_8kvqz0wsje5o2xvo.map(tags, function (x) {
      return $_f7rai4xfje5o2xy5.fromTag(x, scope);
    });
  };
  var fromText$1 = function (texts, scope) {
    return $_8kvqz0wsje5o2xvo.map(texts, function (x) {
      return $_f7rai4xfje5o2xy5.fromText(x, scope);
    });
  };
  var fromDom$1 = function (nodes) {
    return $_8kvqz0wsje5o2xvo.map(nodes, $_f7rai4xfje5o2xy5.fromDom);
  };
  var $_e8wkyrxpje5o2xyy = {
    fromHtml: fromHtml$1,
    fromTags: fromTags,
    fromText: fromText$1,
    fromDom: fromDom$1
  };

  var get = function (element) {
    return element.dom().innerHTML;
  };
  var set = function (element, content) {
    var owner = $_5i5voox3je5o2xx2.owner(element);
    var docDom = owner.dom();
    var fragment = $_f7rai4xfje5o2xy5.fromDom(docDom.createDocumentFragment());
    var contentElements = $_e8wkyrxpje5o2xyy.fromHtml(content, docDom);
    $_90nfp9xije5o2xyc.append(fragment, contentElements);
    $_fjv49rxhje5o2xya.empty(element);
    $_9je15xx2je5o2xx0.append(element, fragment);
  };
  var getOuter = function (element) {
    var container = $_f7rai4xfje5o2xy5.fromTag('div');
    var clone = $_f7rai4xfje5o2xy5.fromDom(element.dom().cloneNode(true));
    $_9je15xx2je5o2xx0.append(container, clone);
    return get(container);
  };
  var $_1fpq52xoje5o2xyx = {
    get: get,
    set: set,
    getOuter: getOuter
  };

  var rawSet = function (dom, key, value) {
    if ($_568ih9wzje5o2xwm.isString(value) || $_568ih9wzje5o2xwm.isBoolean(value) || $_568ih9wzje5o2xwm.isNumber(value)) {
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
    $_67wkp4x0je5o2xwn.each(attrs, function (v, k) {
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
    return $_8kvqz0wsje5o2xvo.foldl(element.dom().attributes, function (acc, attr) {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  };
  var transferOne = function (source, destination, attr) {
    if (has(source, attr) && !has(destination, attr))
      set$1(destination, attr, get$1(source, attr));
  };
  var transfer = function (source, destination, attrs) {
    if (!$_5souzyxkje5o2xyh.isElement(source) || !$_5souzyxkje5o2xyh.isElement(destination))
      return;
    $_8kvqz0wsje5o2xvo.each(attrs, function (attr) {
      transferOne(source, destination, attr);
    });
  };
  var $_c4ed9fxrje5o2xz8 = {
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
    return $_f7rai4xfje5o2xy5.fromDom(original.dom().cloneNode(deep));
  };
  var shallow$1 = function (original) {
    return clone$1(original, false);
  };
  var deep$1 = function (original) {
    return clone$1(original, true);
  };
  var shallowAs = function (original, tag) {
    var nu = $_f7rai4xfje5o2xy5.fromTag(tag);
    var attributes = $_c4ed9fxrje5o2xz8.clone(original);
    $_c4ed9fxrje5o2xz8.setAll(nu, attributes);
    return nu;
  };
  var copy = function (original, tag) {
    var nu = shallowAs(original, tag);
    var cloneChildren = $_5i5voox3je5o2xx2.children(deep$1(original));
    $_90nfp9xije5o2xyc.append(nu, cloneChildren);
    return nu;
  };
  var mutate = function (original, tag) {
    var nu = shallowAs(original, tag);
    $_9je15xx2je5o2xx0.before(original, nu);
    var children = $_5i5voox3je5o2xx2.children(original);
    $_90nfp9xije5o2xyc.append(nu, children);
    $_fjv49rxhje5o2xya.remove(original);
    return nu;
  };
  var $_5sjm2fxqje5o2xz5 = {
    shallow: shallow$1,
    shallowAs: shallowAs,
    deep: deep$1,
    copy: copy,
    mutate: mutate
  };

  var getHtml = function (element) {
    var clone = $_5sjm2fxqje5o2xz5.shallow(element);
    return $_1fpq52xoje5o2xyx.getOuter(clone);
  };
  var $_5afon6xnje5o2xyt = { getHtml: getHtml };

  var element = function (elem) {
    return $_5afon6xnje5o2xyt.getHtml(elem);
  };
  var $_ctmjchxmje5o2xys = { element: element };

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
      isValue: $_49qg0cwjje5o2xv6.always,
      isError: $_49qg0cwjje5o2xv6.never,
      getOr: $_49qg0cwjje5o2xv6.constant(o),
      getOrThunk: $_49qg0cwjje5o2xv6.constant(o),
      getOrDie: $_49qg0cwjje5o2xv6.constant(o),
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
      return $_49qg0cwjje5o2xv6.die(message)();
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
      is: $_49qg0cwjje5o2xv6.never,
      isValue: $_49qg0cwjje5o2xv6.never,
      isError: $_49qg0cwjje5o2xv6.always,
      getOr: $_49qg0cwjje5o2xv6.identity,
      getOrThunk: getOrThunk,
      getOrDie: getOrDie,
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: $_49qg0cwjje5o2xv6.noop,
      bind: bind,
      exists: $_49qg0cwjje5o2xv6.never,
      forall: $_49qg0cwjje5o2xv6.always,
      toOption: Option.none
    };
  };
  var Result = {
    value: value$1,
    error: error
  };

  var generate = function (cases) {
    if (!$_568ih9wzje5o2xwm.isArray(cases)) {
      throw new Error('cases must be an array');
    }
    if (cases.length === 0) {
      throw new Error('there must be at least one case');
    }
    var constructors = [];
    var adt = {};
    $_8kvqz0wsje5o2xvo.each(cases, function (acase, count) {
      var keys = $_67wkp4x0je5o2xwn.keys(acase);
      if (keys.length !== 1) {
        throw new Error('one and only one name per case');
      }
      var key = keys[0];
      var value = acase[key];
      if (adt[key] !== undefined) {
        throw new Error('duplicate key detected:' + key);
      } else if (key === 'cata') {
        throw new Error('cannot have a case named cata (sorry)');
      } else if (!$_568ih9wzje5o2xwm.isArray(value)) {
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
          var branchKeys = $_67wkp4x0je5o2xwn.keys(branches);
          if (constructors.length !== branchKeys.length) {
            throw new Error('Wrong number of arguments to match. Expected: ' + constructors.join(',') + '\nActual: ' + branchKeys.join(','));
          }
          var allReqd = $_8kvqz0wsje5o2xvo.forall(constructors, function (reqKey) {
            return $_8kvqz0wsje5o2xvo.contains(branchKeys, reqKey);
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
  var $_9u0u7zxwje5o2xzz = { generate: generate };

  var comparison = $_9u0u7zxwje5o2xzz.generate([
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
    $_8kvqz0wsje5o2xvo.each(results, function (result) {
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
  var $_for4grxvje5o2xzx = {
    partition: partition$1,
    compare: compare
  };

  var mergeValues = function (values, base) {
    return Result.value($_gc11amwyje5o2xwl.deepMerge.apply(undefined, [base].concat(values)));
  };
  var mergeErrors = function (errors) {
    return $_49qg0cwjje5o2xv6.compose(Result.error, $_8kvqz0wsje5o2xvo.flatten)(errors);
  };
  var consolidateObj = function (objects, base) {
    var partitions = $_for4grxvje5o2xzx.partition(objects);
    return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : mergeValues(partitions.values, base);
  };
  var consolidateArr = function (objects) {
    var partitions = $_for4grxvje5o2xzx.partition(objects);
    return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : Result.value(partitions.values);
  };
  var $_2g23lsxtje5o2xzm = {
    consolidateObj: consolidateObj,
    consolidateArr: consolidateArr
  };

  var narrow = function (obj, fields) {
    var r = {};
    $_8kvqz0wsje5o2xvo.each(fields, function (field) {
      if (obj[field] !== undefined && obj.hasOwnProperty(field))
        r[field] = obj[field];
    });
    return r;
  };
  var indexOnKey = function (array, key) {
    var obj = {};
    $_8kvqz0wsje5o2xvo.each(array, function (a) {
      var keyValue = a[key];
      obj[keyValue] = a;
    });
    return obj;
  };
  var exclude = function (obj, fields) {
    var r = {};
    $_67wkp4x0je5o2xwn.each(obj, function (v, k) {
      if (!$_8kvqz0wsje5o2xvo.contains(fields, k)) {
        r[k] = v;
      }
    });
    return r;
  };
  var $_ek0qrcxxje5o2y02 = {
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
  var $_e9epq1xyje5o2y0d = {
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
    $_8kvqz0wsje5o2xvo.each(keyvalues, function (kv) {
      r[kv.key] = kv.value;
    });
    return r;
  };
  var $_8ozrqjxzje5o2y0g = {
    wrap: wrap$1,
    wrapAll: wrapAll
  };

  var narrow$1 = function (obj, fields) {
    return $_ek0qrcxxje5o2y02.narrow(obj, fields);
  };
  var exclude$1 = function (obj, fields) {
    return $_ek0qrcxxje5o2y02.exclude(obj, fields);
  };
  var readOpt$1 = function (key) {
    return $_e9epq1xyje5o2y0d.readOpt(key);
  };
  var readOr$1 = function (key, fallback) {
    return $_e9epq1xyje5o2y0d.readOr(key, fallback);
  };
  var readOptFrom$1 = function (obj, key) {
    return $_e9epq1xyje5o2y0d.readOptFrom(obj, key);
  };
  var wrap$2 = function (key, value) {
    return $_8ozrqjxzje5o2y0g.wrap(key, value);
  };
  var wrapAll$1 = function (keyvalues) {
    return $_8ozrqjxzje5o2y0g.wrapAll(keyvalues);
  };
  var indexOnKey$1 = function (array, key) {
    return $_ek0qrcxxje5o2y02.indexOnKey(array, key);
  };
  var consolidate = function (objs, base) {
    return $_2g23lsxtje5o2xzm.consolidateObj(objs, base);
  };
  var hasKey$1 = function (obj, key) {
    return $_e9epq1xyje5o2y0d.hasKey(obj, key);
  };
  var $_fnkom1xsje5o2xzl = {
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
  var $_dyh85yy0je5o2y0i = {
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
      return $_8kvqz0wsje5o2xvo.find(lines, function (line) {
        return line.indexOf('alloy') > 0 && !$_8kvqz0wsje5o2xvo.exists(path$1, function (p) {
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
    logEventCut: $_49qg0cwjje5o2xv6.noop,
    logEventStopped: $_49qg0cwjje5o2xv6.noop,
    logNoParent: $_49qg0cwjje5o2xv6.noop,
    logEventNoHandlers: $_49qg0cwjje5o2xv6.noop,
    logEventResponse: $_49qg0cwjje5o2xv6.noop,
    write: $_49qg0cwjje5o2xv6.noop
  };
  var monitorEvent = function (eventName, initialTarget, f) {
    var logger = debugging && (eventsMonitored === '*' || $_8kvqz0wsje5o2xvo.contains(eventsMonitored, eventName)) ? function () {
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
          if ($_8kvqz0wsje5o2xvo.contains([
              'mousemove',
              'mouseover',
              'mouseout',
              $_9k0aw9whje5o2xv0.systemInit()
            ], eventName))
            return;
          console.log(eventName, {
            event: eventName,
            target: initialTarget.dom(),
            sequence: $_8kvqz0wsje5o2xvo.map(sequence, function (s) {
              if (!$_8kvqz0wsje5o2xvo.contains([
                  'cut',
                  'stopped',
                  'response'
                ], s.outcome))
                return s.outcome;
              else
                return '{' + s.purpose + '} ' + s.outcome + ' at (' + $_ctmjchxmje5o2xys.element(s.target) + ')';
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
        '(element)': $_ctmjchxmje5o2xys.element(c.element()),
        '(initComponents)': $_8kvqz0wsje5o2xvo.map(cSpec.components !== undefined ? cSpec.components : [], go),
        '(components)': $_8kvqz0wsje5o2xvo.map(c.components(), go),
        '(bound.events)': $_67wkp4x0je5o2xwn.mapToArray(c.events(), function (v, k) {
          return [k];
        }).join(', '),
        '(behaviours)': cSpec.behaviours !== undefined ? $_67wkp4x0je5o2xwn.map(cSpec.behaviours, function (v, k) {
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
          var connections = $_67wkp4x0je5o2xwn.keys(systems);
          return $_dyh85yy0je5o2y0i.findMap(connections, function (conn) {
            var connGui = systems[conn];
            return connGui.getByUid(uid).toOption().map(function (comp) {
              return $_fnkom1xsje5o2xzl.wrap($_ctmjchxmje5o2xys.element(comp.element()), inspectorInfo(comp));
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
  var $_eivumrxlje5o2xyj = {
    logHandler: logHandler,
    noLogger: $_49qg0cwjje5o2xv6.constant(ignoreEvent),
    getTrace: getTrace,
    monitorEvent: monitorEvent,
    isDebugging: $_49qg0cwjje5o2xv6.constant(debugging),
    registerInspector: registerInspector
  };

  var isSource = function (component, simulatedEvent) {
    return $_8iyn3dx9je5o2xxi.eq(component.element(), simulatedEvent.event().target());
  };
  var $_cu9vzy5je5o2y18 = { isSource: isSource };

  var adt = $_9u0u7zxwje5o2xzz.generate([
    { strict: [] },
    { defaultedThunk: ['fallbackThunk'] },
    { asOption: [] },
    { asDefaultedOptionThunk: ['fallbackThunk'] },
    { mergeWithThunk: ['baseThunk'] }
  ]);
  var defaulted = function (fallback) {
    return adt.defaultedThunk($_49qg0cwjje5o2xv6.constant(fallback));
  };
  var asDefaultedOption = function (fallback) {
    return adt.asDefaultedOptionThunk($_49qg0cwjje5o2xv6.constant(fallback));
  };
  var mergeWith = function (base) {
    return adt.mergeWithThunk($_49qg0cwjje5o2xv6.constant(base));
  };
  var $_2qdncyy8je5o2y1o = {
    strict: adt.strict,
    asOption: adt.asOption,
    defaulted: defaulted,
    defaultedThunk: adt.defaultedThunk,
    asDefaultedOption: asDefaultedOption,
    asDefaultedOptionThunk: adt.asDefaultedOptionThunk,
    mergeWith: mergeWith,
    mergeWithThunk: adt.mergeWithThunk
  };

  var typeAdt = $_9u0u7zxwje5o2xzz.generate([
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
  var fieldAdt = $_9u0u7zxwje5o2xzz.generate([
    {
      field: [
        'name',
        'presence',
        'type'
      ]
    },
    { state: ['name'] }
  ]);
  var $_1repfzyaje5o2y2h = {
    typeAdt: typeAdt,
    fieldAdt: fieldAdt
  };

  var json = function () {
    return $_9ndwkgxbje5o2xxp.getOrDie('JSON');
  };
  var parse = function (obj) {
    return json().parse(obj);
  };
  var stringify = function (obj, replacer, space) {
    return json().stringify(obj, replacer, space);
  };
  var $_anh5fuydje5o2y2s = {
    parse: parse,
    stringify: stringify
  };

  var formatObj = function (input) {
    return $_568ih9wzje5o2xwm.isObject(input) && $_67wkp4x0je5o2xwn.keys(input).length > 100 ? ' removed due to size' : $_anh5fuydje5o2y2s.stringify(input, null, 2);
  };
  var formatErrors = function (errors) {
    var es = errors.length > 10 ? errors.slice(0, 10).concat([{
        path: [],
        getErrorInfo: function () {
          return '... (only showing first ten failures)';
        }
      }]) : errors;
    return $_8kvqz0wsje5o2xvo.map(es, function (e) {
      return 'Failed path: (' + e.path.join(' > ') + ')\n' + e.getErrorInfo();
    });
  };
  var $_2e9d5hycje5o2y2m = {
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
      return 'Could not find valid *strict* value for "' + key + '" in ' + $_2e9d5hycje5o2y2m.formatObj(obj);
    });
  };
  var missingKey = function (path, key) {
    return nu$3(path, function () {
      return 'Choice schema did not contain choice key: "' + key + '"';
    });
  };
  var missingBranch = function (path, branches, branch) {
    return nu$3(path, function () {
      return 'The chosen schema: "' + branch + '" did not exist in branches: ' + $_2e9d5hycje5o2y2m.formatObj(branches);
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
  var $_3bi799ybje5o2y2j = {
    missingStrict: missingStrict,
    missingKey: missingKey,
    missingBranch: missingBranch,
    unsupportedFields: unsupportedFields,
    custom: custom,
    toString: toString
  };

  var adt$1 = $_9u0u7zxwje5o2xzz.generate([
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
    return adt$1.state(okey, $_49qg0cwjje5o2xv6.constant(value));
  };
  var snapshot = function (okey) {
    return adt$1.state(okey, $_49qg0cwjje5o2xv6.identity);
  };
  var strictAccess = function (path, obj, key) {
    return $_e9epq1xyje5o2y0d.readOptFrom(obj, key).fold(function () {
      return $_3bi799ybje5o2y2j.missingStrict(path, key, obj);
    }, Result.value);
  };
  var fallbackAccess = function (obj, key, fallbackThunk) {
    var v = $_e9epq1xyje5o2y0d.readOptFrom(obj, key).fold(function () {
      return fallbackThunk(obj);
    }, $_49qg0cwjje5o2xv6.identity);
    return Result.value(v);
  };
  var optionAccess = function (obj, key) {
    return Result.value($_e9epq1xyje5o2y0d.readOptFrom(obj, key));
  };
  var optionDefaultedAccess = function (obj, key, fallback) {
    var opt = $_e9epq1xyje5o2y0d.readOptFrom(obj, key).map(function (val) {
      return val === true ? fallback(obj) : val;
    });
    return Result.value(opt);
  };
  var cExtractOne = function (path, obj, field, strength) {
    return field.fold(function (key, okey, presence, prop) {
      var bundle = function (av) {
        return prop.extract(path.concat([key]), strength, av).map(function (res) {
          return $_8ozrqjxzje5o2y0g.wrap(okey, strength(res));
        });
      };
      var bundleAsOption = function (optValue) {
        return optValue.fold(function () {
          var outcome = $_8ozrqjxzje5o2y0g.wrap(okey, strength(Option.none()));
          return Result.value(outcome);
        }, function (ov) {
          return prop.extract(path.concat([key]), strength, ov).map(function (res) {
            return $_8ozrqjxzje5o2y0g.wrap(okey, strength(Option.some(res)));
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
          return fallbackAccess(obj, key, $_49qg0cwjje5o2xv6.constant({})).map(function (v) {
            return $_gc11amwyje5o2xwl.deepMerge(base, v);
          }).bind(bundle);
        });
      }();
    }, function (okey, instantiator) {
      var state = instantiator(obj);
      return Result.value($_8ozrqjxzje5o2y0g.wrap(okey, strength(state)));
    });
  };
  var cExtract = function (path, obj, fields, strength) {
    var results = $_8kvqz0wsje5o2xvo.map(fields, function (field) {
      return cExtractOne(path, obj, field, strength);
    });
    return $_2g23lsxtje5o2xzm.consolidateObj(results, {});
  };
  var value$2 = function (validator) {
    var extract = function (path, strength, val) {
      return validator(val, strength).fold(function (err) {
        return $_3bi799ybje5o2y2j.custom(path, err);
      }, Result.value);
    };
    var toString = function () {
      return 'val';
    };
    var toDsl = function () {
      return $_1repfzyaje5o2y2h.typeAdt.itemOf(validator);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var getSetKeys = function (obj) {
    var keys = $_67wkp4x0je5o2xwn.keys(obj);
    return $_8kvqz0wsje5o2xvo.filter(keys, function (k) {
      return $_fnkom1xsje5o2xzl.hasKey(obj, k);
    });
  };
  var objOnly = function (fields) {
    var delegate = obj(fields);
    var fieldNames = $_8kvqz0wsje5o2xvo.foldr(fields, function (acc, f) {
      return f.fold(function (key) {
        return $_gc11amwyje5o2xwl.deepMerge(acc, $_fnkom1xsje5o2xzl.wrap(key, true));
      }, $_49qg0cwjje5o2xv6.constant(acc));
    }, {});
    var extract = function (path, strength, o) {
      var keys = $_568ih9wzje5o2xwm.isBoolean(o) ? [] : getSetKeys(o);
      var extra = $_8kvqz0wsje5o2xvo.filter(keys, function (k) {
        return !$_fnkom1xsje5o2xzl.hasKey(fieldNames, k);
      });
      return extra.length === 0 ? delegate.extract(path, strength, o) : $_3bi799ybje5o2y2j.unsupportedFields(path, extra);
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
      var fieldStrings = $_8kvqz0wsje5o2xvo.map(fields, function (field) {
        return field.fold(function (key, okey, presence, prop) {
          return key + ' -> ' + prop.toString();
        }, function (okey, instantiator) {
          return 'state(' + okey + ')';
        });
      });
      return 'obj{\n' + fieldStrings.join('\n') + '}';
    };
    var toDsl = function () {
      return $_1repfzyaje5o2y2h.typeAdt.objOf($_8kvqz0wsje5o2xvo.map(fields, function (f) {
        return f.fold(function (key, okey, presence, prop) {
          return $_1repfzyaje5o2y2h.fieldAdt.field(key, presence, prop);
        }, function (okey, instantiator) {
          return $_1repfzyaje5o2y2h.fieldAdt.state(okey);
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
      var results = $_8kvqz0wsje5o2xvo.map(array, function (a, i) {
        return prop.extract(path.concat(['[' + i + ']']), strength, a);
      });
      return $_2g23lsxtje5o2xzm.consolidateArr(results);
    };
    var toString = function () {
      return 'array(' + prop.toString() + ')';
    };
    var toDsl = function () {
      return $_1repfzyaje5o2y2h.typeAdt.arrOf(prop);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var setOf = function (validator, prop) {
    var validateKeys = function (path, keys) {
      return arr(value$2(validator)).extract(path, $_49qg0cwjje5o2xv6.identity, keys);
    };
    var extract = function (path, strength, o) {
      var keys = $_67wkp4x0je5o2xwn.keys(o);
      return validateKeys(path, keys).bind(function (validKeys) {
        var schema = $_8kvqz0wsje5o2xvo.map(validKeys, function (vk) {
          return adt$1.field(vk, vk, $_2qdncyy8je5o2y1o.strict(), prop);
        });
        return obj(schema).extract(path, strength, o);
      });
    };
    var toString = function () {
      return 'setOf(' + prop.toString() + ')';
    };
    var toDsl = function () {
      return $_1repfzyaje5o2y2h.typeAdt.setOf(validator, prop);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var func = function (args, schema, retriever) {
    var delegate = value$2(function (f, strength) {
      return $_568ih9wzje5o2xwm.isFunction(f) ? Result.value(function () {
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
        return $_1repfzyaje5o2y2h.typeAdt.func(args, schema);
      }
    };
  };
  var thunk = function (desc, processor) {
    var getP = $_4sqgp8wlje5o2xva.cached(function () {
      return processor();
    });
    var extract = function (path, strength, val) {
      return getP().extract(path, strength, val);
    };
    var toString = function () {
      return getP().toString();
    };
    var toDsl = function () {
      return $_1repfzyaje5o2y2h.typeAdt.thunk(desc);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var anyValue = value$2(Result.value);
  var arrOfObj = $_49qg0cwjje5o2xv6.compose(arr, obj);
  var $_8tpbzvy9je5o2y1u = {
    anyValue: $_49qg0cwjje5o2xv6.constant(anyValue),
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
    return $_8tpbzvy9je5o2y1u.field(key, key, $_2qdncyy8je5o2y1o.strict(), $_8tpbzvy9je5o2y1u.anyValue());
  };
  var strictOf = function (key, schema) {
    return $_8tpbzvy9je5o2y1u.field(key, key, $_2qdncyy8je5o2y1o.strict(), schema);
  };
  var strictFunction = function (key) {
    return $_8tpbzvy9je5o2y1u.field(key, key, $_2qdncyy8je5o2y1o.strict(), $_8tpbzvy9je5o2y1u.value(function (f) {
      return $_568ih9wzje5o2xwm.isFunction(f) ? Result.value(f) : Result.error('Not a function');
    }));
  };
  var forbid = function (key, message) {
    return $_8tpbzvy9je5o2y1u.field(key, key, $_2qdncyy8je5o2y1o.asOption(), $_8tpbzvy9je5o2y1u.value(function (v) {
      return Result.error('The field: ' + key + ' is forbidden. ' + message);
    }));
  };
  var strictArrayOf = function (key, prop) {
    return strictOf(key, prop);
  };
  var strictObjOf = function (key, objSchema) {
    return $_8tpbzvy9je5o2y1u.field(key, key, $_2qdncyy8je5o2y1o.strict(), $_8tpbzvy9je5o2y1u.obj(objSchema));
  };
  var strictArrayOfObj = function (key, objFields) {
    return $_8tpbzvy9je5o2y1u.field(key, key, $_2qdncyy8je5o2y1o.strict(), $_8tpbzvy9je5o2y1u.arrOfObj(objFields));
  };
  var option = function (key) {
    return $_8tpbzvy9je5o2y1u.field(key, key, $_2qdncyy8je5o2y1o.asOption(), $_8tpbzvy9je5o2y1u.anyValue());
  };
  var optionOf = function (key, schema) {
    return $_8tpbzvy9je5o2y1u.field(key, key, $_2qdncyy8je5o2y1o.asOption(), schema);
  };
  var optionObjOf = function (key, objSchema) {
    return $_8tpbzvy9je5o2y1u.field(key, key, $_2qdncyy8je5o2y1o.asOption(), $_8tpbzvy9je5o2y1u.obj(objSchema));
  };
  var optionObjOfOnly = function (key, objSchema) {
    return $_8tpbzvy9je5o2y1u.field(key, key, $_2qdncyy8je5o2y1o.asOption(), $_8tpbzvy9je5o2y1u.objOnly(objSchema));
  };
  var defaulted$1 = function (key, fallback) {
    return $_8tpbzvy9je5o2y1u.field(key, key, $_2qdncyy8je5o2y1o.defaulted(fallback), $_8tpbzvy9je5o2y1u.anyValue());
  };
  var defaultedOf = function (key, fallback, schema) {
    return $_8tpbzvy9je5o2y1u.field(key, key, $_2qdncyy8je5o2y1o.defaulted(fallback), schema);
  };
  var defaultedObjOf = function (key, fallback, objSchema) {
    return $_8tpbzvy9je5o2y1u.field(key, key, $_2qdncyy8je5o2y1o.defaulted(fallback), $_8tpbzvy9je5o2y1u.obj(objSchema));
  };
  var field = function (key, okey, presence, prop) {
    return $_8tpbzvy9je5o2y1u.field(key, okey, presence, prop);
  };
  var state = function (okey, instantiator) {
    return $_8tpbzvy9je5o2y1u.state(okey, instantiator);
  };
  var $_65y30vy7je5o2y1k = {
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
    var fields = $_fnkom1xsje5o2xzl.readOptFrom(branches, ch);
    return fields.fold(function () {
      return $_3bi799ybje5o2y2j.missingBranch(path, branches, ch);
    }, function (fs) {
      return $_8tpbzvy9je5o2y1u.obj(fs).extract(path.concat(['branch: ' + ch]), strength, input);
    });
  };
  var choose = function (key, branches) {
    var extract = function (path, strength, input) {
      var choice = $_fnkom1xsje5o2xzl.readOptFrom(input, key);
      return choice.fold(function () {
        return $_3bi799ybje5o2y2j.missingKey(path, key);
      }, function (chosen) {
        return chooseFrom(path, strength, input, branches, chosen);
      });
    };
    var toString = function () {
      return 'chooseOn(' + key + '). Possible values: ' + $_67wkp4x0je5o2xwn.keys(branches);
    };
    var toDsl = function () {
      return $_1repfzyaje5o2y2h.typeAdt.choiceOf(key, branches);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var $_1l75wsyfje5o2y2z = { choose: choose };

  var anyValue$1 = $_8tpbzvy9je5o2y1u.value(Result.value);
  var arrOfObj$1 = function (objFields) {
    return $_8tpbzvy9je5o2y1u.arrOfObj(objFields);
  };
  var arrOfVal = function () {
    return $_8tpbzvy9je5o2y1u.arr(anyValue$1);
  };
  var arrOf = $_8tpbzvy9je5o2y1u.arr;
  var objOf = $_8tpbzvy9je5o2y1u.obj;
  var objOfOnly = $_8tpbzvy9je5o2y1u.objOnly;
  var setOf$1 = $_8tpbzvy9je5o2y1u.setOf;
  var valueOf = function (validator) {
    return $_8tpbzvy9je5o2y1u.value(function (v) {
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
    return extract(label, prop, $_49qg0cwjje5o2xv6.constant, obj);
  };
  var asRaw = function (label, prop, obj) {
    return extract(label, prop, $_49qg0cwjje5o2xv6.identity, obj);
  };
  var getOrDie$1 = function (extraction) {
    return extraction.fold(function (errInfo) {
      throw new Error(formatError(errInfo));
    }, $_49qg0cwjje5o2xv6.identity);
  };
  var asRawOrDie = function (label, prop, obj) {
    return getOrDie$1(asRaw(label, prop, obj));
  };
  var asStructOrDie = function (label, prop, obj) {
    return getOrDie$1(asStruct(label, prop, obj));
  };
  var formatError = function (errInfo) {
    return 'Errors: \n' + $_2e9d5hycje5o2y2m.formatErrors(errInfo.errors) + '\n\nInput object: ' + $_2e9d5hycje5o2y2m.formatObj(errInfo.input);
  };
  var choose$1 = function (key, branches) {
    return $_1l75wsyfje5o2y2z.choose(key, branches);
  };
  var thunkOf = function (desc, schema) {
    return $_8tpbzvy9je5o2y1u.thunk(desc, schema);
  };
  var funcOrDie = function (args, schema) {
    var retriever = function (output, strength) {
      return getOrDie$1(extract('()', schema, strength, output));
    };
    return $_8tpbzvy9je5o2y1u.func(args, schema, retriever);
  };
  var $_1ui3lpyeje5o2y2u = {
    anyValue: $_49qg0cwjje5o2xv6.constant(anyValue$1),
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
    if (!$_fnkom1xsje5o2xzl.hasKey(parts, 'can') && !$_fnkom1xsje5o2xzl.hasKey(parts, 'abort') && !$_fnkom1xsje5o2xzl.hasKey(parts, 'run'))
      throw new Error('EventHandler defined by: ' + $_anh5fuydje5o2y2s.stringify(parts, null, 2) + ' does not have can, abort, or run!');
    return $_1ui3lpyeje5o2y2u.asRawOrDie('Extracting event.handler', $_1ui3lpyeje5o2y2u.objOfOnly([
      $_65y30vy7je5o2y1k.defaulted('can', $_49qg0cwjje5o2xv6.constant(true)),
      $_65y30vy7je5o2y1k.defaulted('abort', $_49qg0cwjje5o2xv6.constant(false)),
      $_65y30vy7je5o2y1k.defaulted('run', $_49qg0cwjje5o2xv6.noop)
    ]), parts);
  };
  var all$1 = function (handlers, f) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      return $_8kvqz0wsje5o2xvo.foldl(handlers, function (acc, handler) {
        return acc && f(handler).apply(undefined, args);
      }, true);
    };
  };
  var any = function (handlers, f) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      return $_8kvqz0wsje5o2xvo.foldl(handlers, function (acc, handler) {
        return acc || f(handler).apply(undefined, args);
      }, false);
    };
  };
  var read = function (handler) {
    return $_568ih9wzje5o2xwm.isFunction(handler) ? {
      can: $_49qg0cwjje5o2xv6.constant(true),
      abort: $_49qg0cwjje5o2xv6.constant(false),
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
      $_8kvqz0wsje5o2xvo.each(handlers, function (handler) {
        handler.run.apply(undefined, args);
      });
    };
    return nu$4({
      can: can,
      abort: abort,
      run: run
    });
  };
  var $_9cnuavy6je5o2y1a = {
    read: read,
    fuse: fuse,
    nu: nu$4
  };

  var derive = $_fnkom1xsje5o2xzl.wrapAll;
  var abort = function (name, predicate) {
    return {
      key: name,
      value: $_9cnuavy6je5o2y1a.nu({ abort: predicate })
    };
  };
  var can = function (name, predicate) {
    return {
      key: name,
      value: $_9cnuavy6je5o2y1a.nu({ can: predicate })
    };
  };
  var preventDefault = function (name) {
    return {
      key: name,
      value: $_9cnuavy6je5o2y1a.nu({
        run: function (component, simulatedEvent) {
          simulatedEvent.event().prevent();
        }
      })
    };
  };
  var run = function (name, handler) {
    return {
      key: name,
      value: $_9cnuavy6je5o2y1a.nu({ run: handler })
    };
  };
  var runActionExtra = function (name, action, extra) {
    return {
      key: name,
      value: $_9cnuavy6je5o2y1a.nu({
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
        value: $_9cnuavy6je5o2y1a.nu({
          run: function (component, simulatedEvent) {
            if ($_cu9vzy5je5o2y18.isSource(component, simulatedEvent))
              handler(component, simulatedEvent);
          }
        })
      };
    };
  };
  var redirectToUid = function (name, uid) {
    return run(name, function (component, simulatedEvent) {
      component.getSystem().getByUid(uid).each(function (redirectee) {
        $_d7275bwgje5o2xut.dispatchEvent(redirectee, redirectee.element(), name, simulatedEvent);
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
  var $_9z4gpyy4je5o2y14 = {
    derive: derive,
    run: run,
    preventDefault: preventDefault,
    runActionExtra: runActionExtra,
    runOnAttached: runOnSourceName($_9k0aw9whje5o2xv0.attachedToDom()),
    runOnDetached: runOnSourceName($_9k0aw9whje5o2xv0.detachedFromDom()),
    runOnInit: runOnSourceName($_9k0aw9whje5o2xv0.systemInit()),
    runOnExecute: runOnName($_9k0aw9whje5o2xv0.execute()),
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
  var $_dqz1yaygje5o2y33 = {
    markAsBehaviourApi: markAsBehaviourApi,
    markAsExtraApi: markAsExtraApi,
    markAsSketchApi: markAsSketchApi,
    getAnnotation: getAnnotation
  };

  var nu$5 = $_2y7sshx4je5o2xxa.immutableBag(['tag'], [
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
    return $_anh5fuydje5o2y2s.stringify(raw, null, 2);
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
  var $_b3sd8yyije5o2y3f = {
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
  var nu$6 = $_2y7sshx4je5o2xxa.immutableBag([], fields);
  var derive$1 = function (settings) {
    var r = {};
    var keys = $_67wkp4x0je5o2xwn.keys(settings);
    $_8kvqz0wsje5o2xvo.each(keys, function (key) {
      settings[key].each(function (v) {
        r[key] = v;
      });
    });
    return nu$6(r);
  };
  var modToStr = function (mod) {
    var raw = modToRaw(mod);
    return $_anh5fuydje5o2y2s.stringify(raw, null, 2);
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
        return $_fnkom1xsje5o2xzl.wrap(key, arr2);
      });
    }, function (arr1) {
      return oArr2.fold(function () {
        return $_fnkom1xsje5o2xzl.wrap(key, arr1);
      }, function (arr2) {
        return $_fnkom1xsje5o2xzl.wrap(key, arr2);
      });
    });
  };
  var merge$1 = function (defnA, mod) {
    var raw = $_gc11amwyje5o2xwl.deepMerge({
      tag: defnA.tag(),
      classes: mod.classes().getOr([]).concat(defnA.classes().getOr([])),
      attributes: $_gc11amwyje5o2xwl.merge(defnA.attributes().getOr({}), mod.attributes().getOr({})),
      styles: $_gc11amwyje5o2xwl.merge(defnA.styles().getOr({}), mod.styles().getOr({}))
    }, mod.innerHtml().or(defnA.innerHtml()).map(function (innerHtml) {
      return $_fnkom1xsje5o2xzl.wrap('innerHtml', innerHtml);
    }).getOr({}), clashingOptArrays('domChildren', mod.domChildren(), defnA.domChildren()), clashingOptArrays('defChildren', mod.defChildren(), defnA.defChildren()), mod.value().or(defnA.value()).map(function (value) {
      return $_fnkom1xsje5o2xzl.wrap('value', value);
    }).getOr({}));
    return $_b3sd8yyije5o2y3f.nu(raw);
  };
  var $_9n8qyryhje5o2y35 = {
    nu: nu$6,
    derive: derive$1,
    merge: merge$1,
    modToStr: modToStr,
    modToRaw: modToRaw
  };

  var executeEvent = function (bConfig, bState, executor) {
    return $_9z4gpyy4je5o2y14.runOnExecute(function (component) {
      executor(component, bConfig, bState);
    });
  };
  var loadEvent = function (bConfig, bState, f) {
    return $_9z4gpyy4je5o2y14.runOnInit(function (component, simulatedEvent) {
      f(component, bConfig, bState);
    });
  };
  var create = function (schema, name, active, apis, extra, state) {
    var configSchema = $_1ui3lpyeje5o2y2u.objOfOnly(schema);
    var schemaSchema = $_65y30vy7je5o2y1k.optionObjOf(name, [$_65y30vy7je5o2y1k.optionObjOfOnly('config', schema)]);
    return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
  };
  var createModes = function (modes, name, active, apis, extra, state) {
    var configSchema = modes;
    var schemaSchema = $_65y30vy7je5o2y1k.optionObjOf(name, [$_65y30vy7je5o2y1k.optionOf('config', modes)]);
    return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
  };
  var wrapApi = function (bName, apiFunction, apiName) {
    var f = function (component) {
      var args = arguments;
      return component.config({ name: $_49qg0cwjje5o2xv6.constant(bName) }).fold(function () {
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
    return $_dqz1yaygje5o2y33.markAsBehaviourApi(f, apiName, apiFunction);
  };
  var revokeBehaviour = function (name) {
    return {
      key: name,
      value: undefined
    };
  };
  var doCreate = function (configSchema, schemaSchema, name, active, apis, extra, state) {
    var getConfig = function (info) {
      return $_fnkom1xsje5o2xzl.hasKey(info, name) ? info[name]() : Option.none();
    };
    var wrappedApis = $_67wkp4x0je5o2xwn.map(apis, function (apiF, apiName) {
      return wrapApi(name, apiF, apiName);
    });
    var wrappedExtra = $_67wkp4x0je5o2xwn.map(extra, function (extraF, extraName) {
      return $_dqz1yaygje5o2y33.markAsExtraApi(extraF, extraName);
    });
    var me = $_gc11amwyje5o2xwl.deepMerge(wrappedExtra, wrappedApis, {
      revoke: $_49qg0cwjje5o2xv6.curry(revokeBehaviour, name),
      config: function (spec) {
        var prepared = $_1ui3lpyeje5o2y2u.asStructOrDie(name + '-config', configSchema, spec);
        return {
          key: name,
          value: {
            config: prepared,
            me: me,
            configAsRaw: $_4sqgp8wlje5o2xva.cached(function () {
              return $_1ui3lpyeje5o2y2u.asRawOrDie(name + '-config', configSchema, spec);
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
          return $_fnkom1xsje5o2xzl.readOptFrom(active, 'exhibit').map(function (exhibitor) {
            return exhibitor(base, behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr($_9n8qyryhje5o2y35.nu({}));
      },
      name: function () {
        return name;
      },
      handlers: function (info) {
        return getConfig(info).bind(function (behaviourInfo) {
          return $_fnkom1xsje5o2xzl.readOptFrom(active, 'events').map(function (events) {
            return events(behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr({});
      }
    });
    return me;
  };
  var $_f9q9vsy3je5o2y0s = {
    executeEvent: executeEvent,
    loadEvent: loadEvent,
    create: create,
    createModes: createModes
  };

  var base = function (handleUnsupported, required) {
    return baseWith(handleUnsupported, required, {
      validate: $_568ih9wzje5o2xwm.isFunction,
      label: 'function'
    });
  };
  var baseWith = function (handleUnsupported, required, pred) {
    if (required.length === 0)
      throw new Error('You must specify at least one required field.');
    $_6dak24x7je5o2xxf.validateStrArr('required', required);
    $_6dak24x7je5o2xxf.checkDupes(required);
    return function (obj) {
      var keys = $_67wkp4x0je5o2xwn.keys(obj);
      var allReqd = $_8kvqz0wsje5o2xvo.forall(required, function (req) {
        return $_8kvqz0wsje5o2xvo.contains(keys, req);
      });
      if (!allReqd)
        $_6dak24x7je5o2xxf.reqMessage(required, keys);
      handleUnsupported(required, keys);
      var invalidKeys = $_8kvqz0wsje5o2xvo.filter(required, function (key) {
        return !pred.validate(obj[key], key);
      });
      if (invalidKeys.length > 0)
        $_6dak24x7je5o2xxf.invalidTypeMessage(invalidKeys, pred.label);
      return obj;
    };
  };
  var handleExact = function (required, keys) {
    var unsupported = $_8kvqz0wsje5o2xvo.filter(keys, function (key) {
      return !$_8kvqz0wsje5o2xvo.contains(required, key);
    });
    if (unsupported.length > 0)
      $_6dak24x7je5o2xxf.unsuppMessage(unsupported);
  };
  var allowExtra = $_49qg0cwjje5o2xv6.noop;
  var $_blrj1fylje5o2y3m = {
    exactly: $_49qg0cwjje5o2xv6.curry(base, handleExact),
    ensure: $_49qg0cwjje5o2xv6.curry(base, allowExtra),
    ensureWith: $_49qg0cwjje5o2xv6.curry(baseWith, allowExtra)
  };

  var BehaviourState = $_blrj1fylje5o2y3m.ensure(['readState']);

  var init = function () {
    return BehaviourState({
      readState: function () {
        return 'No State required';
      }
    });
  };
  var $_olpdsyjje5o2y3j = { init: init };

  var derive$2 = function (capabilities) {
    return $_fnkom1xsje5o2xzl.wrapAll(capabilities);
  };
  var simpleSchema = $_1ui3lpyeje5o2y2u.objOfOnly([
    $_65y30vy7je5o2y1k.strict('fields'),
    $_65y30vy7je5o2y1k.strict('name'),
    $_65y30vy7je5o2y1k.defaulted('active', {}),
    $_65y30vy7je5o2y1k.defaulted('apis', {}),
    $_65y30vy7je5o2y1k.defaulted('extra', {}),
    $_65y30vy7je5o2y1k.defaulted('state', $_olpdsyjje5o2y3j)
  ]);
  var create$1 = function (data) {
    var value = $_1ui3lpyeje5o2y2u.asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
    return $_f9q9vsy3je5o2y0s.create(value.fields, value.name, value.active, value.apis, value.extra, value.state);
  };
  var modeSchema = $_1ui3lpyeje5o2y2u.objOfOnly([
    $_65y30vy7je5o2y1k.strict('branchKey'),
    $_65y30vy7je5o2y1k.strict('branches'),
    $_65y30vy7je5o2y1k.strict('name'),
    $_65y30vy7je5o2y1k.defaulted('active', {}),
    $_65y30vy7je5o2y1k.defaulted('apis', {}),
    $_65y30vy7je5o2y1k.defaulted('extra', {}),
    $_65y30vy7je5o2y1k.defaulted('state', $_olpdsyjje5o2y3j)
  ]);
  var createModes$1 = function (data) {
    var value = $_1ui3lpyeje5o2y2u.asRawOrDie('Creating behaviour: ' + data.name, modeSchema, data);
    return $_f9q9vsy3je5o2y0s.createModes($_1ui3lpyeje5o2y2u.choose(value.branchKey, value.branches), value.name, value.active, value.apis, value.extra, value.state);
  };
  var $_e4rr4py2je5o2y0l = {
    derive: derive$2,
    revoke: $_49qg0cwjje5o2xv6.constant(undefined),
    noActive: $_49qg0cwjje5o2xv6.constant({}),
    noApis: $_49qg0cwjje5o2xv6.constant({}),
    noExtra: $_49qg0cwjje5o2xv6.constant({}),
    noState: $_49qg0cwjje5o2xv6.constant($_olpdsyjje5o2y3j),
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
    var value = $_c4ed9fxrje5o2xz8.get(element, attr);
    return value === undefined || value === '' ? [] : value.split(' ');
  };
  var add = function (element, attr, id) {
    var old = read$1(element, attr);
    var nu = old.concat([id]);
    $_c4ed9fxrje5o2xz8.set(element, attr, nu.join(' '));
  };
  var remove$2 = function (element, attr, id) {
    var nu = $_8kvqz0wsje5o2xvo.filter(read$1(element, attr), function (v) {
      return v !== id;
    });
    if (nu.length > 0)
      $_c4ed9fxrje5o2xz8.set(element, attr, nu.join(' '));
    else
      $_c4ed9fxrje5o2xz8.remove(element, attr);
  };
  var $_9m7alpyqje5o2y43 = {
    read: read$1,
    add: add,
    remove: remove$2
  };

  var supports = function (element) {
    return element.dom().classList !== undefined;
  };
  var get$2 = function (element) {
    return $_9m7alpyqje5o2y43.read(element, 'class');
  };
  var add$1 = function (element, clazz) {
    return $_9m7alpyqje5o2y43.add(element, 'class', clazz);
  };
  var remove$3 = function (element, clazz) {
    return $_9m7alpyqje5o2y43.remove(element, 'class', clazz);
  };
  var toggle = function (element, clazz) {
    if ($_8kvqz0wsje5o2xvo.contains(get$2(element), clazz)) {
      remove$3(element, clazz);
    } else {
      add$1(element, clazz);
    }
  };
  var $_c5aqv9ypje5o2y3v = {
    get: get$2,
    add: add$1,
    remove: remove$3,
    toggle: toggle,
    supports: supports
  };

  var add$2 = function (element, clazz) {
    if ($_c5aqv9ypje5o2y3v.supports(element))
      element.dom().classList.add(clazz);
    else
      $_c5aqv9ypje5o2y3v.add(element, clazz);
  };
  var cleanClass = function (element) {
    var classList = $_c5aqv9ypje5o2y3v.supports(element) ? element.dom().classList : $_c5aqv9ypje5o2y3v.get(element);
    if (classList.length === 0) {
      $_c4ed9fxrje5o2xz8.remove(element, 'class');
    }
  };
  var remove$4 = function (element, clazz) {
    if ($_c5aqv9ypje5o2y3v.supports(element)) {
      var classList = element.dom().classList;
      classList.remove(clazz);
    } else
      $_c5aqv9ypje5o2y3v.remove(element, clazz);
    cleanClass(element);
  };
  var toggle$1 = function (element, clazz) {
    return $_c5aqv9ypje5o2y3v.supports(element) ? element.dom().classList.toggle(clazz) : $_c5aqv9ypje5o2y3v.toggle(element, clazz);
  };
  var toggler = function (element, clazz) {
    var hasClasslist = $_c5aqv9ypje5o2y3v.supports(element);
    var classList = element.dom().classList;
    var off = function () {
      if (hasClasslist)
        classList.remove(clazz);
      else
        $_c5aqv9ypje5o2y3v.remove(element, clazz);
    };
    var on = function () {
      if (hasClasslist)
        classList.add(clazz);
      else
        $_c5aqv9ypje5o2y3v.add(element, clazz);
    };
    return Toggler(off, on, has$1(element, clazz));
  };
  var has$1 = function (element, clazz) {
    return $_c5aqv9ypje5o2y3v.supports(element) && element.dom().classList.contains(clazz);
  };
  var $_8ppxz2ynje5o2y3s = {
    add: add$2,
    remove: remove$4,
    toggle: toggle$1,
    toggler: toggler,
    has: has$1
  };

  var swap = function (element, addCls, removeCls) {
    $_8ppxz2ynje5o2y3s.remove(element, removeCls);
    $_8ppxz2ynje5o2y3s.add(element, addCls);
  };
  var toAlpha = function (component, swapConfig, swapState) {
    swap(component.element(), swapConfig.alpha(), swapConfig.omega());
  };
  var toOmega = function (component, swapConfig, swapState) {
    swap(component.element(), swapConfig.omega(), swapConfig.alpha());
  };
  var clear = function (component, swapConfig, swapState) {
    $_8ppxz2ynje5o2y3s.remove(component.element(), swapConfig.alpha());
    $_8ppxz2ynje5o2y3s.remove(component.element(), swapConfig.omega());
  };
  var isAlpha = function (component, swapConfig, swapState) {
    return $_8ppxz2ynje5o2y3s.has(component.element(), swapConfig.alpha());
  };
  var isOmega = function (component, swapConfig, swapState) {
    return $_8ppxz2ynje5o2y3s.has(component.element(), swapConfig.omega());
  };
  var $_4tuegkymje5o2y3p = {
    toAlpha: toAlpha,
    toOmega: toOmega,
    isAlpha: isAlpha,
    isOmega: isOmega,
    clear: clear
  };

  var SwapSchema = [
    $_65y30vy7je5o2y1k.strict('alpha'),
    $_65y30vy7je5o2y1k.strict('omega')
  ];

  var Swapping = $_e4rr4py2je5o2y0l.create({
    fields: SwapSchema,
    name: 'swapping',
    apis: $_4tuegkymje5o2y3p
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
    return is(scope, a) ? Option.some(scope) : $_568ih9wzje5o2xwm.isFunction(isRoot) && isRoot(scope) ? Option.none() : ancestor(scope, a, isRoot);
  }

  var first$1 = function (predicate) {
    return descendant($_4ff55vxjje5o2xyf.body(), predicate);
  };
  var ancestor = function (scope, predicate, isRoot) {
    var element = scope.dom();
    var stop = $_568ih9wzje5o2xwm.isFunction(isRoot) ? isRoot : $_49qg0cwjje5o2xv6.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_f7rai4xfje5o2xy5.fromDom(element);
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
    return child$1($_f7rai4xfje5o2xy5.fromDom(element.parentNode), function (x) {
      return !$_8iyn3dx9je5o2xxi.eq(scope, x) && predicate(x);
    });
  };
  var child$1 = function (scope, predicate) {
    var result = $_8kvqz0wsje5o2xvo.find(scope.dom().childNodes, $_49qg0cwjje5o2xv6.compose(predicate, $_f7rai4xfje5o2xy5.fromDom));
    return result.map($_f7rai4xfje5o2xy5.fromDom);
  };
  var descendant = function (scope, predicate) {
    var descend = function (element) {
      for (var i = 0; i < element.childNodes.length; i++) {
        if (predicate($_f7rai4xfje5o2xy5.fromDom(element.childNodes[i])))
          return Option.some($_f7rai4xfje5o2xy5.fromDom(element.childNodes[i]));
        var res = descend(element.childNodes[i]);
        if (res.isSome())
          return res;
      }
      return Option.none();
    };
    return descend(scope.dom());
  };
  var $_18ooz1yvje5o2y4e = {
    first: first$1,
    ancestor: ancestor,
    closest: closest,
    sibling: sibling,
    child: child$1,
    descendant: descendant
  };

  var any$1 = function (predicate) {
    return $_18ooz1yvje5o2y4e.first(predicate).isSome();
  };
  var ancestor$1 = function (scope, predicate, isRoot) {
    return $_18ooz1yvje5o2y4e.ancestor(scope, predicate, isRoot).isSome();
  };
  var closest$1 = function (scope, predicate, isRoot) {
    return $_18ooz1yvje5o2y4e.closest(scope, predicate, isRoot).isSome();
  };
  var sibling$1 = function (scope, predicate) {
    return $_18ooz1yvje5o2y4e.sibling(scope, predicate).isSome();
  };
  var child$2 = function (scope, predicate) {
    return $_18ooz1yvje5o2y4e.child(scope, predicate).isSome();
  };
  var descendant$1 = function (scope, predicate) {
    return $_18ooz1yvje5o2y4e.descendant(scope, predicate).isSome();
  };
  var $_1e1he0yuje5o2y4d = {
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
    var doc = $_5i5voox3je5o2xx2.owner(element).dom();
    return element.dom() === doc.activeElement;
  };
  var active = function (_doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    return Option.from(doc.activeElement).map($_f7rai4xfje5o2xy5.fromDom);
  };
  var focusInside = function (element) {
    var doc = $_5i5voox3je5o2xx2.owner(element);
    var inside = active(doc).filter(function (a) {
      return $_1e1he0yuje5o2y4d.closest(a, $_49qg0cwjje5o2xv6.curry($_8iyn3dx9je5o2xxi.eq, element));
    });
    inside.fold(function () {
      focus(element);
    }, $_49qg0cwjje5o2xv6.noop);
  };
  var search = function (element) {
    return active($_5i5voox3je5o2xx2.owner(element)).filter(function (e) {
      return element.dom().contains(e.dom());
    });
  };
  var $_70842eytje5o2y49 = {
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
  var $_5f166vyzje5o2y4p = { openLink: openLink };

  var isSkinDisabled = function (editor) {
    return editor.settings.skin === false;
  };
  var $_4eru57z0je5o2y4q = { isSkinDisabled: isSkinDisabled };

  var formatChanged = 'formatChanged';
  var orientationChanged = 'orientationChanged';
  var dropupDismissed = 'dropupDismissed';
  var $_m50iiz1je5o2y4r = {
    formatChanged: $_49qg0cwjje5o2xv6.constant(formatChanged),
    orientationChanged: $_49qg0cwjje5o2xv6.constant(orientationChanged),
    dropupDismissed: $_49qg0cwjje5o2xv6.constant(dropupDismissed)
  };

  var chooseChannels = function (channels, message) {
    return message.universal() ? channels : $_8kvqz0wsje5o2xvo.filter(channels, function (ch) {
      return $_8kvqz0wsje5o2xvo.contains(message.channels(), ch);
    });
  };
  var events = function (receiveConfig) {
    return $_9z4gpyy4je5o2y14.derive([$_9z4gpyy4je5o2y14.run($_9k0aw9whje5o2xv0.receive(), function (component, message) {
        var channelMap = receiveConfig.channels();
        var channels = $_67wkp4x0je5o2xwn.keys(channelMap);
        var targetChannels = chooseChannels(channels, message);
        $_8kvqz0wsje5o2xvo.each(targetChannels, function (ch) {
          var channelInfo = channelMap[ch]();
          var channelSchema = channelInfo.schema();
          var data = $_1ui3lpyeje5o2y2u.asStructOrDie('channel[' + ch + '] data\nReceiver: ' + $_ctmjchxmje5o2xys.element(component.element()), channelSchema, message.data());
          channelInfo.onReceive()(component, data);
        });
      })]);
  };
  var $_4iixzmz4je5o2y53 = { events: events };

  var menuFields = [
    $_65y30vy7je5o2y1k.strict('menu'),
    $_65y30vy7je5o2y1k.strict('selectedMenu')
  ];
  var itemFields = [
    $_65y30vy7je5o2y1k.strict('item'),
    $_65y30vy7je5o2y1k.strict('selectedItem')
  ];
  var schema = $_1ui3lpyeje5o2y2u.objOfOnly(itemFields.concat(menuFields));
  var itemSchema = $_1ui3lpyeje5o2y2u.objOfOnly(itemFields);
  var $_dcmr4qz7je5o2y5o = {
    menuFields: $_49qg0cwjje5o2xv6.constant(menuFields),
    itemFields: $_49qg0cwjje5o2xv6.constant(itemFields),
    schema: $_49qg0cwjje5o2xv6.constant(schema),
    itemSchema: $_49qg0cwjje5o2xv6.constant(itemSchema)
  };

  var initSize = $_65y30vy7je5o2y1k.strictObjOf('initSize', [
    $_65y30vy7je5o2y1k.strict('numColumns'),
    $_65y30vy7je5o2y1k.strict('numRows')
  ]);
  var itemMarkers = function () {
    return $_65y30vy7je5o2y1k.strictOf('markers', $_dcmr4qz7je5o2y5o.itemSchema());
  };
  var menuMarkers = function () {
    return $_65y30vy7je5o2y1k.strictOf('markers', $_dcmr4qz7je5o2y5o.schema());
  };
  var tieredMenuMarkers = function () {
    return $_65y30vy7je5o2y1k.strictObjOf('markers', [$_65y30vy7je5o2y1k.strict('backgroundMenu')].concat($_dcmr4qz7je5o2y5o.menuFields()).concat($_dcmr4qz7je5o2y5o.itemFields()));
  };
  var markers = function (required) {
    return $_65y30vy7je5o2y1k.strictObjOf('markers', $_8kvqz0wsje5o2xvo.map(required, $_65y30vy7je5o2y1k.strict));
  };
  var onPresenceHandler = function (label, fieldName, presence) {
    var trace = $_eivumrxlje5o2xyj.getTrace();
    return $_65y30vy7je5o2y1k.field(fieldName, fieldName, presence, $_1ui3lpyeje5o2y2u.valueOf(function (f) {
      return Result.value(function () {
        $_eivumrxlje5o2xyj.logHandler(label, fieldName, trace);
        return f.apply(undefined, arguments);
      });
    }));
  };
  var onHandler = function (fieldName) {
    return onPresenceHandler('onHandler', fieldName, $_2qdncyy8je5o2y1o.defaulted($_49qg0cwjje5o2xv6.noop));
  };
  var onKeyboardHandler = function (fieldName) {
    return onPresenceHandler('onKeyboardHandler', fieldName, $_2qdncyy8je5o2y1o.defaulted(Option.none));
  };
  var onStrictHandler = function (fieldName) {
    return onPresenceHandler('onHandler', fieldName, $_2qdncyy8je5o2y1o.strict());
  };
  var onStrictKeyboardHandler = function (fieldName) {
    return onPresenceHandler('onKeyboardHandler', fieldName, $_2qdncyy8je5o2y1o.strict());
  };
  var output$1 = function (name, value) {
    return $_65y30vy7je5o2y1k.state(name, $_49qg0cwjje5o2xv6.constant(value));
  };
  var snapshot$1 = function (name) {
    return $_65y30vy7je5o2y1k.state(name, $_49qg0cwjje5o2xv6.identity);
  };
  var $_2cu7nfz6je5o2y5e = {
    initSize: $_49qg0cwjje5o2xv6.constant(initSize),
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

  var ReceivingSchema = [$_65y30vy7je5o2y1k.strictOf('channels', $_1ui3lpyeje5o2y2u.setOf(Result.value, $_1ui3lpyeje5o2y2u.objOfOnly([
      $_2cu7nfz6je5o2y5e.onStrictHandler('onReceive'),
      $_65y30vy7je5o2y1k.defaulted('schema', $_1ui3lpyeje5o2y2u.anyValue())
    ])))];

  var Receiving = $_e4rr4py2je5o2y0l.create({
    fields: ReceivingSchema,
    name: 'receiving',
    active: $_4iixzmz4je5o2y53
  });

  var updateAriaState = function (component, toggleConfig) {
    var pressed = isOn(component, toggleConfig);
    var ariaInfo = toggleConfig.aria();
    ariaInfo.update()(component, ariaInfo, pressed);
  };
  var toggle$2 = function (component, toggleConfig, toggleState) {
    $_8ppxz2ynje5o2y3s.toggle(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var on = function (component, toggleConfig, toggleState) {
    $_8ppxz2ynje5o2y3s.add(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var off = function (component, toggleConfig, toggleState) {
    $_8ppxz2ynje5o2y3s.remove(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var isOn = function (component, toggleConfig) {
    return $_8ppxz2ynje5o2y3s.has(component.element(), toggleConfig.toggleClass());
  };
  var onLoad = function (component, toggleConfig, toggleState) {
    var api = toggleConfig.selected() ? on : off;
    api(component, toggleConfig, toggleState);
  };
  var $_38zxi9zaje5o2y64 = {
    onLoad: onLoad,
    toggle: toggle$2,
    isOn: isOn,
    on: on,
    off: off
  };

  var exhibit = function (base, toggleConfig, toggleState) {
    return $_9n8qyryhje5o2y35.nu({});
  };
  var events$1 = function (toggleConfig, toggleState) {
    var execute = $_f9q9vsy3je5o2y0s.executeEvent(toggleConfig, toggleState, $_38zxi9zaje5o2y64.toggle);
    var load = $_f9q9vsy3je5o2y0s.loadEvent(toggleConfig, toggleState, $_38zxi9zaje5o2y64.onLoad);
    return $_9z4gpyy4je5o2y14.derive($_8kvqz0wsje5o2xvo.flatten([
      toggleConfig.toggleOnExecute() ? [execute] : [],
      [load]
    ]));
  };
  var $_11g0ghz9je5o2y61 = {
    exhibit: exhibit,
    events: events$1
  };

  var updatePressed = function (component, ariaInfo, status) {
    $_c4ed9fxrje5o2xz8.set(component.element(), 'aria-pressed', status);
    if (ariaInfo.syncWithExpanded())
      updateExpanded(component, ariaInfo, status);
  };
  var updateSelected = function (component, ariaInfo, status) {
    $_c4ed9fxrje5o2xz8.set(component.element(), 'aria-selected', status);
  };
  var updateChecked = function (component, ariaInfo, status) {
    $_c4ed9fxrje5o2xz8.set(component.element(), 'aria-checked', status);
  };
  var updateExpanded = function (component, ariaInfo, status) {
    $_c4ed9fxrje5o2xz8.set(component.element(), 'aria-expanded', status);
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
    var rawTag = $_5souzyxkje5o2xyh.name(elem);
    var suffix = rawTag === 'input' && $_c4ed9fxrje5o2xz8.has(elem, 'type') ? ':' + $_c4ed9fxrje5o2xz8.get(elem, 'type') : '';
    return $_fnkom1xsje5o2xzl.readOptFrom(tagAttributes, rawTag + suffix);
  };
  var detectFromRole = function (component) {
    var elem = component.element();
    if (!$_c4ed9fxrje5o2xz8.has(elem, 'role'))
      return Option.none();
    else {
      var role = $_c4ed9fxrje5o2xz8.get(elem, 'role');
      return $_fnkom1xsje5o2xzl.readOptFrom(roleAttributes, role);
    }
  };
  var updateAuto = function (component, ariaInfo, status) {
    var attributes = detectFromRole(component).orThunk(function () {
      return detectFromTag(component);
    }).getOr([]);
    $_8kvqz0wsje5o2xvo.each(attributes, function (attr) {
      $_c4ed9fxrje5o2xz8.set(component.element(), attr, status);
    });
  };
  var $_4fmf93zcje5o2y6c = {
    updatePressed: updatePressed,
    updateSelected: updateSelected,
    updateChecked: updateChecked,
    updateExpanded: updateExpanded,
    updateAuto: updateAuto
  };

  var ToggleSchema = [
    $_65y30vy7je5o2y1k.defaulted('selected', false),
    $_65y30vy7je5o2y1k.strict('toggleClass'),
    $_65y30vy7je5o2y1k.defaulted('toggleOnExecute', true),
    $_65y30vy7je5o2y1k.defaultedOf('aria', { mode: 'none' }, $_1ui3lpyeje5o2y2u.choose('mode', {
      'pressed': [
        $_65y30vy7je5o2y1k.defaulted('syncWithExpanded', false),
        $_2cu7nfz6je5o2y5e.output('update', $_4fmf93zcje5o2y6c.updatePressed)
      ],
      'checked': [$_2cu7nfz6je5o2y5e.output('update', $_4fmf93zcje5o2y6c.updateChecked)],
      'expanded': [$_2cu7nfz6je5o2y5e.output('update', $_4fmf93zcje5o2y6c.updateExpanded)],
      'selected': [$_2cu7nfz6je5o2y5e.output('update', $_4fmf93zcje5o2y6c.updateSelected)],
      'none': [$_2cu7nfz6je5o2y5e.output('update', $_49qg0cwjje5o2xv6.noop)]
    }))
  ];

  var Toggling = $_e4rr4py2je5o2y0l.create({
    fields: ToggleSchema,
    name: 'toggling',
    active: $_11g0ghz9je5o2y61,
    apis: $_38zxi9zaje5o2y64
  });

  var format = function (command, update) {
    return Receiving.config({
      channels: $_fnkom1xsje5o2xzl.wrap($_m50iiz1je5o2y4r.formatChanged(), {
        onReceive: function (button, data) {
          if (data.command === command) {
            update(button, data.state);
          }
        }
      })
    });
  };
  var orientation = function (onReceive) {
    return Receiving.config({ channels: $_fnkom1xsje5o2xzl.wrap($_m50iiz1je5o2y4r.orientationChanged(), { onReceive: onReceive }) });
  };
  var receive = function (channel, onReceive) {
    return {
      key: channel,
      value: { onReceive: onReceive }
    };
  };
  var $_941wfnzdje5o2y6l = {
    format: format,
    orientation: orientation,
    receive: receive
  };

  var prefix = 'tinymce-mobile';
  var resolve$1 = function (p) {
    return prefix + '-' + p;
  };
  var $_dqvuwxzeje5o2y6o = {
    resolve: resolve$1,
    prefix: $_49qg0cwjje5o2xv6.constant(prefix)
  };

  var focus$1 = function (component, focusConfig) {
    if (!focusConfig.ignore()) {
      $_70842eytje5o2y49.focus(component.element());
      focusConfig.onFocus()(component);
    }
  };
  var blur$1 = function (component, focusConfig) {
    if (!focusConfig.ignore()) {
      $_70842eytje5o2y49.blur(component.element());
    }
  };
  var isFocused = function (component) {
    return $_70842eytje5o2y49.hasFocus(component.element());
  };
  var $_arjnlizjje5o2y73 = {
    focus: focus$1,
    blur: blur$1,
    isFocused: isFocused
  };

  var exhibit$1 = function (base, focusConfig) {
    if (focusConfig.ignore())
      return $_9n8qyryhje5o2y35.nu({});
    else
      return $_9n8qyryhje5o2y35.nu({ attributes: { 'tabindex': '-1' } });
  };
  var events$2 = function (focusConfig) {
    return $_9z4gpyy4je5o2y14.derive([$_9z4gpyy4je5o2y14.run($_9k0aw9whje5o2xv0.focus(), function (component, simulatedEvent) {
        $_arjnlizjje5o2y73.focus(component, focusConfig);
        simulatedEvent.stop();
      })]);
  };
  var $_163unwzije5o2y72 = {
    exhibit: exhibit$1,
    events: events$2
  };

  var FocusSchema = [
    $_2cu7nfz6je5o2y5e.onHandler('onFocus'),
    $_65y30vy7je5o2y1k.defaulted('ignore', false)
  ];

  var Focusing = $_e4rr4py2je5o2y0l.create({
    fields: FocusSchema,
    name: 'focusing',
    active: $_163unwzije5o2y72,
    apis: $_arjnlizjje5o2y73
  });

  var $_f2vh3bzpje5o2y7r = {
    BACKSPACE: $_49qg0cwjje5o2xv6.constant([8]),
    TAB: $_49qg0cwjje5o2xv6.constant([9]),
    ENTER: $_49qg0cwjje5o2xv6.constant([13]),
    SHIFT: $_49qg0cwjje5o2xv6.constant([16]),
    CTRL: $_49qg0cwjje5o2xv6.constant([17]),
    ALT: $_49qg0cwjje5o2xv6.constant([18]),
    CAPSLOCK: $_49qg0cwjje5o2xv6.constant([20]),
    ESCAPE: $_49qg0cwjje5o2xv6.constant([27]),
    SPACE: $_49qg0cwjje5o2xv6.constant([32]),
    PAGEUP: $_49qg0cwjje5o2xv6.constant([33]),
    PAGEDOWN: $_49qg0cwjje5o2xv6.constant([34]),
    END: $_49qg0cwjje5o2xv6.constant([35]),
    HOME: $_49qg0cwjje5o2xv6.constant([36]),
    LEFT: $_49qg0cwjje5o2xv6.constant([37]),
    UP: $_49qg0cwjje5o2xv6.constant([38]),
    RIGHT: $_49qg0cwjje5o2xv6.constant([39]),
    DOWN: $_49qg0cwjje5o2xv6.constant([40]),
    INSERT: $_49qg0cwjje5o2xv6.constant([45]),
    DEL: $_49qg0cwjje5o2xv6.constant([46]),
    META: $_49qg0cwjje5o2xv6.constant([
      91,
      93,
      224
    ]),
    F10: $_49qg0cwjje5o2xv6.constant([121])
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
  var $_6g5ohxzuje5o2y8k = {
    cycleBy: cycleBy,
    cap: cap
  };

  var all$2 = function (predicate) {
    return descendants($_4ff55vxjje5o2xyf.body(), predicate);
  };
  var ancestors = function (scope, predicate, isRoot) {
    return $_8kvqz0wsje5o2xvo.filter($_5i5voox3je5o2xx2.parents(scope, isRoot), predicate);
  };
  var siblings$1 = function (scope, predicate) {
    return $_8kvqz0wsje5o2xvo.filter($_5i5voox3je5o2xx2.siblings(scope), predicate);
  };
  var children$1 = function (scope, predicate) {
    return $_8kvqz0wsje5o2xvo.filter($_5i5voox3je5o2xx2.children(scope), predicate);
  };
  var descendants = function (scope, predicate) {
    var result = [];
    $_8kvqz0wsje5o2xvo.each($_5i5voox3je5o2xx2.children(scope), function (x) {
      if (predicate(x)) {
        result = result.concat([x]);
      }
      result = result.concat(descendants(x, predicate));
    });
    return result;
  };
  var $_16t3t3zwje5o2y8n = {
    all: all$2,
    ancestors: ancestors,
    siblings: siblings$1,
    children: children$1,
    descendants: descendants
  };

  var all$3 = function (selector) {
    return $_463sqkxeje5o2xxt.all(selector);
  };
  var ancestors$1 = function (scope, selector, isRoot) {
    return $_16t3t3zwje5o2y8n.ancestors(scope, function (e) {
      return $_463sqkxeje5o2xxt.is(e, selector);
    }, isRoot);
  };
  var siblings$2 = function (scope, selector) {
    return $_16t3t3zwje5o2y8n.siblings(scope, function (e) {
      return $_463sqkxeje5o2xxt.is(e, selector);
    });
  };
  var children$2 = function (scope, selector) {
    return $_16t3t3zwje5o2y8n.children(scope, function (e) {
      return $_463sqkxeje5o2xxt.is(e, selector);
    });
  };
  var descendants$1 = function (scope, selector) {
    return $_463sqkxeje5o2xxt.all(selector, scope);
  };
  var $_b0xmc2zvje5o2y8l = {
    all: all$3,
    ancestors: ancestors$1,
    siblings: siblings$2,
    children: children$2,
    descendants: descendants$1
  };

  var first$2 = function (selector) {
    return $_463sqkxeje5o2xxt.one(selector);
  };
  var ancestor$2 = function (scope, selector, isRoot) {
    return $_18ooz1yvje5o2y4e.ancestor(scope, function (e) {
      return $_463sqkxeje5o2xxt.is(e, selector);
    }, isRoot);
  };
  var sibling$2 = function (scope, selector) {
    return $_18ooz1yvje5o2y4e.sibling(scope, function (e) {
      return $_463sqkxeje5o2xxt.is(e, selector);
    });
  };
  var child$3 = function (scope, selector) {
    return $_18ooz1yvje5o2y4e.child(scope, function (e) {
      return $_463sqkxeje5o2xxt.is(e, selector);
    });
  };
  var descendant$2 = function (scope, selector) {
    return $_463sqkxeje5o2xxt.one(selector, scope);
  };
  var closest$2 = function (scope, selector, isRoot) {
    return ClosestOrAncestor($_463sqkxeje5o2xxt.is, ancestor$2, scope, selector, isRoot);
  };
  var $_gesp01zxje5o2y8p = {
    first: first$2,
    ancestor: ancestor$2,
    sibling: sibling$2,
    child: child$3,
    descendant: descendant$2,
    closest: closest$2
  };

  var dehighlightAll = function (component, hConfig, hState) {
    var highlighted = $_b0xmc2zvje5o2y8l.descendants(component.element(), '.' + hConfig.highlightClass());
    $_8kvqz0wsje5o2xvo.each(highlighted, function (h) {
      $_8ppxz2ynje5o2y3s.remove(h, hConfig.highlightClass());
      component.getSystem().getByDom(h).each(function (target) {
        hConfig.onDehighlight()(component, target);
      });
    });
  };
  var dehighlight = function (component, hConfig, hState, target) {
    var wasHighlighted = isHighlighted(component, hConfig, hState, target);
    $_8ppxz2ynje5o2y3s.remove(target.element(), hConfig.highlightClass());
    if (wasHighlighted)
      hConfig.onDehighlight()(component, target);
  };
  var highlight = function (component, hConfig, hState, target) {
    var wasHighlighted = isHighlighted(component, hConfig, hState, target);
    dehighlightAll(component, hConfig, hState);
    $_8ppxz2ynje5o2y3s.add(target.element(), hConfig.highlightClass());
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
    var items = $_b0xmc2zvje5o2y8l.descendants(component.element(), '.' + hConfig.itemClass());
    var itemComps = $_dyh85yy0je5o2y0i.cat($_8kvqz0wsje5o2xvo.map(items, function (i) {
      return component.getSystem().getByDom(i).toOption();
    }));
    var targetComp = $_8kvqz0wsje5o2xvo.find(itemComps, predicate);
    targetComp.each(function (c) {
      highlight(component, hConfig, hState, c);
    });
  };
  var isHighlighted = function (component, hConfig, hState, queryTarget) {
    return $_8ppxz2ynje5o2y3s.has(queryTarget.element(), hConfig.highlightClass());
  };
  var getHighlighted = function (component, hConfig, hState) {
    return $_gesp01zxje5o2y8p.descendant(component.element(), '.' + hConfig.highlightClass()).bind(component.getSystem().getByDom);
  };
  var getByIndex = function (component, hConfig, hState, index) {
    var items = $_b0xmc2zvje5o2y8l.descendants(component.element(), '.' + hConfig.itemClass());
    return Option.from(items[index]).fold(function () {
      return Result.error('No element found with index ' + index);
    }, component.getSystem().getByDom);
  };
  var getFirst = function (component, hConfig, hState) {
    return $_gesp01zxje5o2y8p.descendant(component.element(), '.' + hConfig.itemClass()).bind(component.getSystem().getByDom);
  };
  var getLast = function (component, hConfig, hState) {
    var items = $_b0xmc2zvje5o2y8l.descendants(component.element(), '.' + hConfig.itemClass());
    var last = items.length > 0 ? Option.some(items[items.length - 1]) : Option.none();
    return last.bind(component.getSystem().getByDom);
  };
  var getDelta = function (component, hConfig, hState, delta) {
    var items = $_b0xmc2zvje5o2y8l.descendants(component.element(), '.' + hConfig.itemClass());
    var current = $_8kvqz0wsje5o2xvo.findIndex(items, function (item) {
      return $_8ppxz2ynje5o2y3s.has(item, hConfig.highlightClass());
    });
    return current.bind(function (selected) {
      var dest = $_6g5ohxzuje5o2y8k.cycleBy(selected, delta, 0, items.length - 1);
      return component.getSystem().getByDom(items[dest]);
    });
  };
  var getPrevious = function (component, hConfig, hState) {
    return getDelta(component, hConfig, hState, -1);
  };
  var getNext = function (component, hConfig, hState) {
    return getDelta(component, hConfig, hState, +1);
  };
  var $_a7fvu1ztje5o2y89 = {
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
    $_65y30vy7je5o2y1k.strict('highlightClass'),
    $_65y30vy7je5o2y1k.strict('itemClass'),
    $_2cu7nfz6je5o2y5e.onHandler('onHighlight'),
    $_2cu7nfz6je5o2y5e.onHandler('onDehighlight')
  ];

  var Highlighting = $_e4rr4py2je5o2y0l.create({
    fields: HighlightSchema,
    name: 'highlighting',
    apis: $_a7fvu1ztje5o2y89
  });

  var dom = function () {
    var get = function (component) {
      return $_70842eytje5o2y49.search(component.element());
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
      component.getSystem().getByDom(element).fold($_49qg0cwjje5o2xv6.noop, function (item) {
        Highlighting.highlight(component, item);
      });
    };
    return {
      get: get,
      set: set
    };
  };
  var $_7n6h3zzrje5o2y83 = {
    dom: dom,
    highlights: highlights
  };

  var inSet = function (keys) {
    return function (event) {
      return $_8kvqz0wsje5o2xvo.contains(keys, event.raw().which);
    };
  };
  var and = function (preds) {
    return function (event) {
      return $_8kvqz0wsje5o2xvo.forall(preds, function (pred) {
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
  var $_bz64ay100je5o2y8w = {
    inSet: inSet,
    and: and,
    is: is$1,
    isShift: isShift,
    isNotShift: $_49qg0cwjje5o2xv6.not(isShift),
    isControl: isControl,
    isNotControl: $_49qg0cwjje5o2xv6.not(isControl)
  };

  var basic = function (key, action) {
    return {
      matches: $_bz64ay100je5o2y8w.is(key),
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
    var transition = $_8kvqz0wsje5o2xvo.find(transitions, function (t) {
      return t.matches(event);
    });
    return transition.map(function (t) {
      return t.classification;
    });
  };
  var $_f3j7fizzje5o2y8t = {
    basic: basic,
    rule: rule,
    choose: choose$2
  };

  var typical = function (infoSchema, stateInit, getRules, getEvents, getApis, optFocusIn) {
    var schema = function () {
      return infoSchema.concat([
        $_65y30vy7je5o2y1k.defaulted('focusManager', $_7n6h3zzrje5o2y83.dom()),
        $_2cu7nfz6je5o2y5e.output('handler', me),
        $_2cu7nfz6je5o2y5e.output('state', stateInit)
      ]);
    };
    var processKey = function (component, simulatedEvent, keyingConfig, keyingState) {
      var rules = getRules(component, simulatedEvent, keyingConfig, keyingState);
      return $_f3j7fizzje5o2y8t.choose(rules, simulatedEvent.event()).bind(function (rule) {
        return rule(component, simulatedEvent, keyingConfig, keyingState);
      });
    };
    var toEvents = function (keyingConfig, keyingState) {
      var otherEvents = getEvents(keyingConfig, keyingState);
      var keyEvents = $_9z4gpyy4je5o2y14.derive(optFocusIn.map(function (focusIn) {
        return $_9z4gpyy4je5o2y14.run($_9k0aw9whje5o2xv0.focus(), function (component, simulatedEvent) {
          focusIn(component, keyingConfig, keyingState, simulatedEvent);
          simulatedEvent.stop();
        });
      }).toArray().concat([$_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.keydown(), function (component, simulatedEvent) {
          processKey(component, simulatedEvent, keyingConfig, keyingState).each(function (_) {
            simulatedEvent.stop();
          });
        })]));
      return $_gc11amwyje5o2xwl.deepMerge(otherEvents, keyEvents);
    };
    var me = {
      schema: schema,
      processKey: processKey,
      toEvents: toEvents,
      toApis: getApis
    };
    return me;
  };
  var $_b4wbgwzqje5o2y7z = { typical: typical };

  var cyclePrev = function (values, index, predicate) {
    var before = $_8kvqz0wsje5o2xvo.reverse(values.slice(0, index));
    var after = $_8kvqz0wsje5o2xvo.reverse(values.slice(index + 1));
    return $_8kvqz0wsje5o2xvo.find(before.concat(after), predicate);
  };
  var tryPrev = function (values, index, predicate) {
    var before = $_8kvqz0wsje5o2xvo.reverse(values.slice(0, index));
    return $_8kvqz0wsje5o2xvo.find(before, predicate);
  };
  var cycleNext = function (values, index, predicate) {
    var before = values.slice(0, index);
    var after = values.slice(index + 1);
    return $_8kvqz0wsje5o2xvo.find(after.concat(before), predicate);
  };
  var tryNext = function (values, index, predicate) {
    var after = values.slice(index + 1);
    return $_8kvqz0wsje5o2xvo.find(after, predicate);
  };
  var $_btgxx101je5o2y90 = {
    cyclePrev: cyclePrev,
    cycleNext: cycleNext,
    tryPrev: tryPrev,
    tryNext: tryNext
  };

  var isSupported = function (dom) {
    return dom.style !== undefined;
  };
  var $_3ilz8c104je5o2y9e = { isSupported: isSupported };

  var internalSet = function (dom, property, value) {
    if (!$_568ih9wzje5o2xwm.isString(value)) {
      console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
      throw new Error('CSS value must be a string: ' + value);
    }
    if ($_3ilz8c104je5o2y9e.isSupported(dom))
      dom.style.setProperty(property, value);
  };
  var internalRemove = function (dom, property) {
    if ($_3ilz8c104je5o2y9e.isSupported(dom))
      dom.style.removeProperty(property);
  };
  var set$2 = function (element, property, value) {
    var dom = element.dom();
    internalSet(dom, property, value);
  };
  var setAll$1 = function (element, css) {
    var dom = element.dom();
    $_67wkp4x0je5o2xwn.each(css, function (v, k) {
      internalSet(dom, k, v);
    });
  };
  var setOptions = function (element, css) {
    var dom = element.dom();
    $_67wkp4x0je5o2xwn.each(css, function (v, k) {
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
    var v = r === '' && !$_4ff55vxjje5o2xyf.inBody(element) ? getUnsafeProperty(dom, property) : r;
    return v === null ? undefined : v;
  };
  var getUnsafeProperty = function (dom, property) {
    return $_3ilz8c104je5o2y9e.isSupported(dom) ? dom.style.getPropertyValue(property) : '';
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
    if ($_3ilz8c104je5o2y9e.isSupported(dom)) {
      for (var i = 0; i < dom.style.length; i++) {
        var ruleName = dom.style.item(i);
        css[ruleName] = dom.style[ruleName];
      }
    }
    return css;
  };
  var isValidValue = function (tag, property, value) {
    var element = $_f7rai4xfje5o2xy5.fromTag(tag);
    set$2(element, property, value);
    var style = getRaw(element, property);
    return style.isSome();
  };
  var remove$5 = function (element, property) {
    var dom = element.dom();
    internalRemove(dom, property);
    if ($_c4ed9fxrje5o2xz8.has(element, 'style') && $_gfctqkwvje5o2xwg.trim($_c4ed9fxrje5o2xz8.get(element, 'style')) === '') {
      $_c4ed9fxrje5o2xz8.remove(element, 'style');
    }
  };
  var preserve = function (element, f) {
    var oldStyles = $_c4ed9fxrje5o2xz8.get(element, 'style');
    var result = f(element);
    var restore = oldStyles === undefined ? $_c4ed9fxrje5o2xz8.remove : $_c4ed9fxrje5o2xz8.set;
    restore(element, 'style', oldStyles);
    return result;
  };
  var copy$1 = function (source, target) {
    var sourceDom = source.dom();
    var targetDom = target.dom();
    if ($_3ilz8c104je5o2y9e.isSupported(sourceDom) && $_3ilz8c104je5o2y9e.isSupported(targetDom)) {
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
    if (!$_5souzyxkje5o2xyh.isElement(source) || !$_5souzyxkje5o2xyh.isElement(destination))
      return;
    $_8kvqz0wsje5o2xvo.each(styles, function (style) {
      transferOne$1(source, destination, style);
    });
  };
  var $_2jybvt103je5o2y95 = {
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
      if (!$_568ih9wzje5o2xwm.isNumber(h) && !h.match(/^[0-9]+$/))
        throw name + '.set accepts only positive integer values. Value was ' + h;
      var dom = element.dom();
      if ($_3ilz8c104je5o2y9e.isSupported(dom))
        dom.style[name] = h + 'px';
    };
    var get = function (element) {
      var r = getOffset(element);
      if (r <= 0 || r === null) {
        var css = $_2jybvt103je5o2y95.get(element, name);
        return parseFloat(css) || 0;
      }
      return r;
    };
    var getOuter = get;
    var aggregate = function (element, properties) {
      return $_8kvqz0wsje5o2xvo.foldl(properties, function (acc, property) {
        var val = $_2jybvt103je5o2y95.get(element, property);
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
    return $_4ff55vxjje5o2xyf.inBody(element) ? element.dom().getBoundingClientRect().height : element.dom().offsetHeight;
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
    $_2jybvt103je5o2y95.set(element, 'max-height', absMax + 'px');
  };
  var $_a35qec102je5o2y93 = {
    set: set$3,
    get: get$4,
    getOuter: getOuter$1,
    setMax: setMax
  };

  var create$2 = function (cyclicField) {
    var schema = [
      $_65y30vy7je5o2y1k.option('onEscape'),
      $_65y30vy7je5o2y1k.option('onEnter'),
      $_65y30vy7je5o2y1k.defaulted('selector', '[data-alloy-tabstop="true"]'),
      $_65y30vy7je5o2y1k.defaulted('firstTabstop', 0),
      $_65y30vy7je5o2y1k.defaulted('useTabstopAt', $_49qg0cwjje5o2xv6.constant(true)),
      $_65y30vy7je5o2y1k.option('visibilitySelector')
    ].concat([cyclicField]);
    var isVisible = function (tabbingConfig, element) {
      var target = tabbingConfig.visibilitySelector().bind(function (sel) {
        return $_gesp01zxje5o2y8p.closest(element, sel);
      }).getOr(element);
      return $_a35qec102je5o2y93.get(target) > 0;
    };
    var findInitial = function (component, tabbingConfig) {
      var tabstops = $_b0xmc2zvje5o2y8l.descendants(component.element(), tabbingConfig.selector());
      var visibles = $_8kvqz0wsje5o2xvo.filter(tabstops, function (elem) {
        return isVisible(tabbingConfig, elem);
      });
      return Option.from(visibles[tabbingConfig.firstTabstop()]);
    };
    var findCurrent = function (component, tabbingConfig) {
      return tabbingConfig.focusManager().get(component).bind(function (elem) {
        return $_gesp01zxje5o2y8p.closest(elem, tabbingConfig.selector());
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
      var tabstops = $_b0xmc2zvje5o2y8l.descendants(component.element(), tabbingConfig.selector());
      return findCurrent(component, tabbingConfig).bind(function (tabstop) {
        var optStopIndex = $_8kvqz0wsje5o2xvo.findIndex(tabstops, $_49qg0cwjje5o2xv6.curry($_8iyn3dx9je5o2xxi.eq, tabstop));
        return optStopIndex.bind(function (stopIndex) {
          return goFromTabstop(component, tabstops, stopIndex, tabbingConfig, cycle);
        });
      });
    };
    var goBackwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      var navigate = tabbingConfig.cyclic() ? $_btgxx101je5o2y90.cyclePrev : $_btgxx101je5o2y90.tryPrev;
      return go(component, simulatedEvent, tabbingConfig, navigate);
    };
    var goForwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      var navigate = tabbingConfig.cyclic() ? $_btgxx101je5o2y90.cycleNext : $_btgxx101je5o2y90.tryNext;
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
    var getRules = $_49qg0cwjje5o2xv6.constant([
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.and([
        $_bz64ay100je5o2y8w.isShift,
        $_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.TAB())
      ]), goBackwards),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.TAB()), goForwards),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.ESCAPE()), exit),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.and([
        $_bz64ay100je5o2y8w.isNotShift,
        $_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.ENTER())
      ]), execute)
    ]);
    var getEvents = $_49qg0cwjje5o2xv6.constant({});
    var getApis = $_49qg0cwjje5o2xv6.constant({});
    return $_b4wbgwzqje5o2y7z.typical(schema, $_olpdsyjje5o2y3j.init, getRules, getEvents, getApis, Option.some(focusIn));
  };
  var $_2qmmwzzoje5o2y7f = { create: create$2 };

  var AcyclicType = $_2qmmwzzoje5o2y7f.create($_65y30vy7je5o2y1k.state('cyclic', $_49qg0cwjje5o2xv6.constant(false)));

  var CyclicType = $_2qmmwzzoje5o2y7f.create($_65y30vy7je5o2y1k.state('cyclic', $_49qg0cwjje5o2xv6.constant(true)));

  var inside = function (target) {
    return $_5souzyxkje5o2xyh.name(target) === 'input' && $_c4ed9fxrje5o2xz8.get(target, 'type') !== 'radio' || $_5souzyxkje5o2xyh.name(target) === 'textarea';
  };
  var $_2vbmoa108je5o2y9z = { inside: inside };

  var doDefaultExecute = function (component, simulatedEvent, focused) {
    $_d7275bwgje5o2xut.dispatch(component, focused, $_9k0aw9whje5o2xv0.execute());
    return Option.some(true);
  };
  var defaultExecute = function (component, simulatedEvent, focused) {
    return $_2vbmoa108je5o2y9z.inside(focused) && $_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.SPACE())(simulatedEvent.event()) ? Option.none() : doDefaultExecute(component, simulatedEvent, focused);
  };
  var $_cuz764109je5o2ya3 = { defaultExecute: defaultExecute };

  var schema$1 = [
    $_65y30vy7je5o2y1k.defaulted('execute', $_cuz764109je5o2ya3.defaultExecute),
    $_65y30vy7je5o2y1k.defaulted('useSpace', false),
    $_65y30vy7je5o2y1k.defaulted('useEnter', true),
    $_65y30vy7je5o2y1k.defaulted('useControlEnter', false),
    $_65y30vy7je5o2y1k.defaulted('useDown', false)
  ];
  var execute = function (component, simulatedEvent, executeConfig, executeState) {
    return executeConfig.execute()(component, simulatedEvent, component.element());
  };
  var getRules = function (component, simulatedEvent, executeConfig, executeState) {
    var spaceExec = executeConfig.useSpace() && !$_2vbmoa108je5o2y9z.inside(component.element()) ? $_f2vh3bzpje5o2y7r.SPACE() : [];
    var enterExec = executeConfig.useEnter() ? $_f2vh3bzpje5o2y7r.ENTER() : [];
    var downExec = executeConfig.useDown() ? $_f2vh3bzpje5o2y7r.DOWN() : [];
    var execKeys = spaceExec.concat(enterExec).concat(downExec);
    return [$_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet(execKeys), execute)].concat(executeConfig.useControlEnter() ? [$_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.and([
        $_bz64ay100je5o2y8w.isControl,
        $_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.ENTER())
      ]), execute)] : []);
  };
  var getEvents = $_49qg0cwjje5o2xv6.constant({});
  var getApis = $_49qg0cwjje5o2xv6.constant({});
  var ExecutionType = $_b4wbgwzqje5o2y7z.typical(schema$1, $_olpdsyjje5o2y3j.init, getRules, getEvents, getApis, Option.none());

  var flatgrid = function (spec) {
    var dimensions = Cell(Option.none());
    var setGridSize = function (numRows, numColumns) {
      dimensions.set(Option.some({
        numRows: $_49qg0cwjje5o2xv6.constant(numRows),
        numColumns: $_49qg0cwjje5o2xv6.constant(numColumns)
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
      readState: $_49qg0cwjje5o2xv6.constant({}),
      setGridSize: setGridSize,
      getNumRows: getNumRows,
      getNumColumns: getNumColumns
    });
  };
  var init$1 = function (spec) {
    return spec.state()(spec);
  };
  var $_caqx7510bje5o2yae = {
    flatgrid: flatgrid,
    init: init$1
  };

  var onDirection = function (isLtr, isRtl) {
    return function (element) {
      return getDirection(element) === 'rtl' ? isRtl : isLtr;
    };
  };
  var getDirection = function (element) {
    return $_2jybvt103je5o2y95.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
  };
  var $_ae8ir910dje5o2yam = {
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
    var movement = $_ae8ir910dje5o2yam.onDirection(moveLeft, moveRight);
    return useH(movement);
  };
  var east = function (moveLeft, moveRight) {
    var movement = $_ae8ir910dje5o2yam.onDirection(moveRight, moveLeft);
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
  var $_1zh3pb10cje5o2yaj = {
    east: east,
    west: west,
    north: useV,
    south: useV,
    move: useV
  };

  var indexInfo = $_2y7sshx4je5o2xxa.immutableBag([
    'index',
    'candidates'
  ], []);
  var locate = function (candidates, predicate) {
    return $_8kvqz0wsje5o2xvo.findIndex(candidates, predicate).map(function (index) {
      return indexInfo({
        index: index,
        candidates: candidates
      });
    });
  };
  var $_5lb1e010fje5o2yau = { locate: locate };

  var visibilityToggler = function (element, property, hiddenValue, visibleValue) {
    var initial = $_2jybvt103je5o2y95.get(element, property);
    if (initial === undefined)
      initial = '';
    var value = initial === hiddenValue ? visibleValue : hiddenValue;
    var off = $_49qg0cwjje5o2xv6.curry($_2jybvt103je5o2y95.set, element, property, initial);
    var on = $_49qg0cwjje5o2xv6.curry($_2jybvt103je5o2y95.set, element, property, value);
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
  var $_4dia9d10gje5o2yax = {
    toggler: toggler$1,
    displayToggler: displayToggler,
    isVisible: isVisible
  };

  var locateVisible = function (container, current, selector) {
    var filter = $_4dia9d10gje5o2yax.isVisible;
    return locateIn(container, current, selector, filter);
  };
  var locateIn = function (container, current, selector, filter) {
    var predicate = $_49qg0cwjje5o2xv6.curry($_8iyn3dx9je5o2xxi.eq, current);
    var candidates = $_b0xmc2zvje5o2y8l.descendants(container, selector);
    var visible = $_8kvqz0wsje5o2xvo.filter(candidates, $_4dia9d10gje5o2yax.isVisible);
    return $_5lb1e010fje5o2yau.locate(visible, predicate);
  };
  var findIndex$2 = function (elements, target) {
    return $_8kvqz0wsje5o2xvo.findIndex(elements, function (elem) {
      return $_8iyn3dx9je5o2xxi.eq(target, elem);
    });
  };
  var $_3vo1mc10eje5o2yan = {
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
      var newColumn = $_6g5ohxzuje5o2y8k.cycleBy(oldColumn, delta, 0, colsInRow - 1);
      return Option.some({
        row: $_49qg0cwjje5o2xv6.constant(oldRow),
        column: $_49qg0cwjje5o2xv6.constant(newColumn)
      });
    });
  };
  var cycleVertical = function (values, index, numRows, numCols, delta) {
    return withGrid(values, index, numCols, function (oldRow, oldColumn) {
      var newRow = $_6g5ohxzuje5o2y8k.cycleBy(oldRow, delta, 0, numRows - 1);
      var onLastRow = newRow === numRows - 1;
      var colsInRow = onLastRow ? values.length - newRow * numCols : numCols;
      var newCol = $_6g5ohxzuje5o2y8k.cap(oldColumn, 0, colsInRow - 1);
      return Option.some({
        row: $_49qg0cwjje5o2xv6.constant(newRow),
        column: $_49qg0cwjje5o2xv6.constant(newCol)
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
  var $_3l20ld10hje5o2yb1 = {
    cycleDown: cycleDown,
    cycleUp: cycleUp,
    cycleLeft: cycleLeft,
    cycleRight: cycleRight
  };

  var schema$2 = [
    $_65y30vy7je5o2y1k.strict('selector'),
    $_65y30vy7je5o2y1k.defaulted('execute', $_cuz764109je5o2ya3.defaultExecute),
    $_2cu7nfz6je5o2y5e.onKeyboardHandler('onEscape'),
    $_65y30vy7je5o2y1k.defaulted('captureTab', false),
    $_2cu7nfz6je5o2y5e.initSize()
  ];
  var focusIn = function (component, gridConfig, gridState) {
    $_gesp01zxje5o2y8p.descendant(component.element(), gridConfig.selector()).each(function (first) {
      gridConfig.focusManager().set(component, first);
    });
  };
  var findCurrent = function (component, gridConfig) {
    return gridConfig.focusManager().get(component).bind(function (elem) {
      return $_gesp01zxje5o2y8p.closest(elem, gridConfig.selector());
    });
  };
  var execute$1 = function (component, simulatedEvent, gridConfig, gridState) {
    return findCurrent(component, gridConfig).bind(function (focused) {
      return gridConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var doMove = function (cycle) {
    return function (element, focused, gridConfig, gridState) {
      return $_3vo1mc10eje5o2yan.locateVisible(element, focused, gridConfig.selector()).bind(function (identified) {
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
  var moveLeft = doMove($_3l20ld10hje5o2yb1.cycleLeft);
  var moveRight = doMove($_3l20ld10hje5o2yb1.cycleRight);
  var moveNorth = doMove($_3l20ld10hje5o2yb1.cycleUp);
  var moveSouth = doMove($_3l20ld10hje5o2yb1.cycleDown);
  var getRules$1 = $_49qg0cwjje5o2xv6.constant([
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.LEFT()), $_1zh3pb10cje5o2yaj.west(moveLeft, moveRight)),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.RIGHT()), $_1zh3pb10cje5o2yaj.east(moveLeft, moveRight)),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.UP()), $_1zh3pb10cje5o2yaj.north(moveNorth)),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.DOWN()), $_1zh3pb10cje5o2yaj.south(moveSouth)),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.and([
      $_bz64ay100je5o2y8w.isShift,
      $_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.TAB())
    ]), handleTab),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.and([
      $_bz64ay100je5o2y8w.isNotShift,
      $_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.TAB())
    ]), handleTab),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.ESCAPE()), doEscape),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.SPACE().concat($_f2vh3bzpje5o2y7r.ENTER())), execute$1)
  ]);
  var getEvents$1 = $_49qg0cwjje5o2xv6.constant({});
  var getApis$1 = {};
  var FlatgridType = $_b4wbgwzqje5o2y7z.typical(schema$2, $_caqx7510bje5o2yae.flatgrid, getRules$1, getEvents$1, getApis$1, Option.some(focusIn));

  var horizontal = function (container, selector, current, delta) {
    return $_3vo1mc10eje5o2yan.locateVisible(container, current, selector, $_49qg0cwjje5o2xv6.constant(true)).bind(function (identified) {
      var index = identified.index();
      var candidates = identified.candidates();
      var newIndex = $_6g5ohxzuje5o2y8k.cycleBy(index, delta, 0, candidates.length - 1);
      return Option.from(candidates[newIndex]);
    });
  };
  var $_8nv30510jje5o2ybd = { horizontal: horizontal };

  var schema$3 = [
    $_65y30vy7je5o2y1k.strict('selector'),
    $_65y30vy7je5o2y1k.defaulted('getInitial', Option.none),
    $_65y30vy7je5o2y1k.defaulted('execute', $_cuz764109je5o2ya3.defaultExecute),
    $_65y30vy7je5o2y1k.defaulted('executeOnMove', false)
  ];
  var findCurrent$1 = function (component, flowConfig) {
    return flowConfig.focusManager().get(component).bind(function (elem) {
      return $_gesp01zxje5o2y8p.closest(elem, flowConfig.selector());
    });
  };
  var execute$2 = function (component, simulatedEvent, flowConfig) {
    return findCurrent$1(component, flowConfig).bind(function (focused) {
      return flowConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var focusIn$1 = function (component, flowConfig) {
    flowConfig.getInitial()(component).or($_gesp01zxje5o2y8p.descendant(component.element(), flowConfig.selector())).each(function (first) {
      flowConfig.focusManager().set(component, first);
    });
  };
  var moveLeft$1 = function (element, focused, info) {
    return $_8nv30510jje5o2ybd.horizontal(element, info.selector(), focused, -1);
  };
  var moveRight$1 = function (element, focused, info) {
    return $_8nv30510jje5o2ybd.horizontal(element, info.selector(), focused, +1);
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
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.LEFT().concat($_f2vh3bzpje5o2y7r.UP())), doMove$1($_1zh3pb10cje5o2yaj.west(moveLeft$1, moveRight$1))),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.RIGHT().concat($_f2vh3bzpje5o2y7r.DOWN())), doMove$1($_1zh3pb10cje5o2yaj.east(moveLeft$1, moveRight$1))),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.ENTER()), execute$2),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.SPACE()), execute$2)
    ];
  };
  var getEvents$2 = $_49qg0cwjje5o2xv6.constant({});
  var getApis$2 = $_49qg0cwjje5o2xv6.constant({});
  var FlowType = $_b4wbgwzqje5o2y7z.typical(schema$3, $_olpdsyjje5o2y3j.init, getRules$2, getEvents$2, getApis$2, Option.some(focusIn$1));

  var outcome = $_2y7sshx4je5o2xxa.immutableBag([
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
    var newColIndex = $_6g5ohxzuje5o2y8k.cycleBy(startCol, deltaCol, 0, colsInRow - 1);
    return toCell(matrix, rowIndex, newColIndex);
  };
  var cycleVertical$1 = function (matrix, colIndex, startRow, deltaRow) {
    var nextRowIndex = $_6g5ohxzuje5o2y8k.cycleBy(startRow, deltaRow, 0, matrix.length - 1);
    var colsInNextRow = matrix[nextRowIndex].length;
    var nextColIndex = $_6g5ohxzuje5o2y8k.cap(colIndex, 0, colsInNextRow - 1);
    return toCell(matrix, nextRowIndex, nextColIndex);
  };
  var moveHorizontal = function (matrix, rowIndex, startCol, deltaCol) {
    var row = matrix[rowIndex];
    var colsInRow = row.length;
    var newColIndex = $_6g5ohxzuje5o2y8k.cap(startCol + deltaCol, 0, colsInRow - 1);
    return toCell(matrix, rowIndex, newColIndex);
  };
  var moveVertical = function (matrix, colIndex, startRow, deltaRow) {
    var nextRowIndex = $_6g5ohxzuje5o2y8k.cap(startRow + deltaRow, 0, matrix.length - 1);
    var colsInNextRow = matrix[nextRowIndex].length;
    var nextColIndex = $_6g5ohxzuje5o2y8k.cap(colIndex, 0, colsInNextRow - 1);
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
  var $_6yma0010lje5o2ybz = {
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
    $_65y30vy7je5o2y1k.strictObjOf('selectors', [
      $_65y30vy7je5o2y1k.strict('row'),
      $_65y30vy7je5o2y1k.strict('cell')
    ]),
    $_65y30vy7je5o2y1k.defaulted('cycles', true),
    $_65y30vy7je5o2y1k.defaulted('previousSelector', Option.none),
    $_65y30vy7je5o2y1k.defaulted('execute', $_cuz764109je5o2ya3.defaultExecute)
  ];
  var focusIn$2 = function (component, matrixConfig) {
    var focused = matrixConfig.previousSelector()(component).orThunk(function () {
      var selectors = matrixConfig.selectors();
      return $_gesp01zxje5o2y8p.descendant(component.element(), selectors.cell());
    });
    focused.each(function (cell) {
      matrixConfig.focusManager().set(component, cell);
    });
  };
  var execute$3 = function (component, simulatedEvent, matrixConfig) {
    return $_70842eytje5o2y49.search(component.element()).bind(function (focused) {
      return matrixConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var toMatrix = function (rows, matrixConfig) {
    return $_8kvqz0wsje5o2xvo.map(rows, function (row) {
      return $_b0xmc2zvje5o2y8l.descendants(row, matrixConfig.selectors().cell());
    });
  };
  var doMove$2 = function (ifCycle, ifMove) {
    return function (element, focused, matrixConfig) {
      var move = matrixConfig.cycles() ? ifCycle : ifMove;
      return $_gesp01zxje5o2y8p.closest(focused, matrixConfig.selectors().row()).bind(function (inRow) {
        var cellsInRow = $_b0xmc2zvje5o2y8l.descendants(inRow, matrixConfig.selectors().cell());
        return $_3vo1mc10eje5o2yan.findIndex(cellsInRow, focused).bind(function (colIndex) {
          var allRows = $_b0xmc2zvje5o2y8l.descendants(element, matrixConfig.selectors().row());
          return $_3vo1mc10eje5o2yan.findIndex(allRows, inRow).bind(function (rowIndex) {
            var matrix = toMatrix(allRows, matrixConfig);
            return move(matrix, rowIndex, colIndex).map(function (next) {
              return next.cell();
            });
          });
        });
      });
    };
  };
  var moveLeft$3 = doMove$2($_6yma0010lje5o2ybz.cycleLeft, $_6yma0010lje5o2ybz.moveLeft);
  var moveRight$3 = doMove$2($_6yma0010lje5o2ybz.cycleRight, $_6yma0010lje5o2ybz.moveRight);
  var moveNorth$1 = doMove$2($_6yma0010lje5o2ybz.cycleUp, $_6yma0010lje5o2ybz.moveUp);
  var moveSouth$1 = doMove$2($_6yma0010lje5o2ybz.cycleDown, $_6yma0010lje5o2ybz.moveDown);
  var getRules$3 = $_49qg0cwjje5o2xv6.constant([
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.LEFT()), $_1zh3pb10cje5o2yaj.west(moveLeft$3, moveRight$3)),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.RIGHT()), $_1zh3pb10cje5o2yaj.east(moveLeft$3, moveRight$3)),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.UP()), $_1zh3pb10cje5o2yaj.north(moveNorth$1)),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.DOWN()), $_1zh3pb10cje5o2yaj.south(moveSouth$1)),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.SPACE().concat($_f2vh3bzpje5o2y7r.ENTER())), execute$3)
  ]);
  var getEvents$3 = $_49qg0cwjje5o2xv6.constant({});
  var getApis$3 = $_49qg0cwjje5o2xv6.constant({});
  var MatrixType = $_b4wbgwzqje5o2y7z.typical(schema$4, $_olpdsyjje5o2y3j.init, getRules$3, getEvents$3, getApis$3, Option.some(focusIn$2));

  var schema$5 = [
    $_65y30vy7je5o2y1k.strict('selector'),
    $_65y30vy7je5o2y1k.defaulted('execute', $_cuz764109je5o2ya3.defaultExecute),
    $_65y30vy7je5o2y1k.defaulted('moveOnTab', false)
  ];
  var execute$4 = function (component, simulatedEvent, menuConfig) {
    return menuConfig.focusManager().get(component).bind(function (focused) {
      return menuConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var focusIn$3 = function (component, menuConfig, simulatedEvent) {
    $_gesp01zxje5o2y8p.descendant(component.element(), menuConfig.selector()).each(function (first) {
      menuConfig.focusManager().set(component, first);
    });
  };
  var moveUp$1 = function (element, focused, info) {
    return $_8nv30510jje5o2ybd.horizontal(element, info.selector(), focused, -1);
  };
  var moveDown$1 = function (element, focused, info) {
    return $_8nv30510jje5o2ybd.horizontal(element, info.selector(), focused, +1);
  };
  var fireShiftTab = function (component, simulatedEvent, menuConfig) {
    return menuConfig.moveOnTab() ? $_1zh3pb10cje5o2yaj.move(moveUp$1)(component, simulatedEvent, menuConfig) : Option.none();
  };
  var fireTab = function (component, simulatedEvent, menuConfig) {
    return menuConfig.moveOnTab() ? $_1zh3pb10cje5o2yaj.move(moveDown$1)(component, simulatedEvent, menuConfig) : Option.none();
  };
  var getRules$4 = $_49qg0cwjje5o2xv6.constant([
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.UP()), $_1zh3pb10cje5o2yaj.move(moveUp$1)),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.DOWN()), $_1zh3pb10cje5o2yaj.move(moveDown$1)),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.and([
      $_bz64ay100je5o2y8w.isShift,
      $_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.TAB())
    ]), fireShiftTab),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.and([
      $_bz64ay100je5o2y8w.isNotShift,
      $_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.TAB())
    ]), fireTab),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.ENTER()), execute$4),
    $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.SPACE()), execute$4)
  ]);
  var getEvents$4 = $_49qg0cwjje5o2xv6.constant({});
  var getApis$4 = $_49qg0cwjje5o2xv6.constant({});
  var MenuType = $_b4wbgwzqje5o2y7z.typical(schema$5, $_olpdsyjje5o2y3j.init, getRules$4, getEvents$4, getApis$4, Option.some(focusIn$3));

  var schema$6 = [
    $_2cu7nfz6je5o2y5e.onKeyboardHandler('onSpace'),
    $_2cu7nfz6je5o2y5e.onKeyboardHandler('onEnter'),
    $_2cu7nfz6je5o2y5e.onKeyboardHandler('onShiftEnter'),
    $_2cu7nfz6je5o2y5e.onKeyboardHandler('onLeft'),
    $_2cu7nfz6je5o2y5e.onKeyboardHandler('onRight'),
    $_2cu7nfz6je5o2y5e.onKeyboardHandler('onTab'),
    $_2cu7nfz6je5o2y5e.onKeyboardHandler('onShiftTab'),
    $_2cu7nfz6je5o2y5e.onKeyboardHandler('onUp'),
    $_2cu7nfz6je5o2y5e.onKeyboardHandler('onDown'),
    $_2cu7nfz6je5o2y5e.onKeyboardHandler('onEscape'),
    $_65y30vy7je5o2y1k.option('focusIn')
  ];
  var getRules$5 = function (component, simulatedEvent, executeInfo) {
    return [
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.SPACE()), executeInfo.onSpace()),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.and([
        $_bz64ay100je5o2y8w.isNotShift,
        $_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.ENTER())
      ]), executeInfo.onEnter()),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.and([
        $_bz64ay100je5o2y8w.isShift,
        $_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.ENTER())
      ]), executeInfo.onShiftEnter()),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.and([
        $_bz64ay100je5o2y8w.isShift,
        $_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.TAB())
      ]), executeInfo.onShiftTab()),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.and([
        $_bz64ay100je5o2y8w.isNotShift,
        $_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.TAB())
      ]), executeInfo.onTab()),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.UP()), executeInfo.onUp()),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.DOWN()), executeInfo.onDown()),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.LEFT()), executeInfo.onLeft()),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.RIGHT()), executeInfo.onRight()),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.SPACE()), executeInfo.onSpace()),
      $_f3j7fizzje5o2y8t.rule($_bz64ay100je5o2y8w.inSet($_f2vh3bzpje5o2y7r.ESCAPE()), executeInfo.onEscape())
    ];
  };
  var focusIn$4 = function (component, executeInfo) {
    return executeInfo.focusIn().bind(function (f) {
      return f(component, executeInfo);
    });
  };
  var getEvents$5 = $_49qg0cwjje5o2xv6.constant({});
  var getApis$5 = $_49qg0cwjje5o2xv6.constant({});
  var SpecialType = $_b4wbgwzqje5o2y7z.typical(schema$6, $_olpdsyjje5o2y3j.init, getRules$5, getEvents$5, getApis$5, Option.some(focusIn$4));

  var $_ysd0lzmje5o2y7b = {
    acyclic: AcyclicType.schema(),
    cyclic: CyclicType.schema(),
    flow: FlowType.schema(),
    flatgrid: FlatgridType.schema(),
    matrix: MatrixType.schema(),
    execution: ExecutionType.schema(),
    menu: MenuType.schema(),
    special: SpecialType.schema()
  };

  var Keying = $_e4rr4py2je5o2y0l.createModes({
    branchKey: 'mode',
    branches: $_ysd0lzmje5o2y7b,
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
        if (!$_fnkom1xsje5o2xzl.hasKey(keyState, 'setGridSize')) {
          console.error('Layout does not support setGridSize');
        } else {
          keyState.setGridSize(numRows, numColumns);
        }
      }
    },
    state: $_caqx7510bje5o2yae
  });

  var field$1 = function (name, forbidden) {
    return $_65y30vy7je5o2y1k.defaultedObjOf(name, {}, $_8kvqz0wsje5o2xvo.map(forbidden, function (f) {
      return $_65y30vy7je5o2y1k.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name);
    }).concat([$_65y30vy7je5o2y1k.state('dump', $_49qg0cwjje5o2xv6.identity)]));
  };
  var get$5 = function (data) {
    return data.dump();
  };
  var $_2c8uf410oje5o2yci = {
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
  var $_44na3j10rje5o2yd4 = { generate: generate$1 };

  var premadeTag = $_44na3j10rje5o2yd4.generate('alloy-premade');
  var apiConfig = $_44na3j10rje5o2yd4.generate('api');
  var premade = function (comp) {
    return $_fnkom1xsje5o2xzl.wrap(premadeTag, comp);
  };
  var getPremade = function (spec) {
    return $_fnkom1xsje5o2xzl.readOptFrom(spec, premadeTag);
  };
  var makeApi = function (f) {
    return $_dqz1yaygje5o2y33.markAsSketchApi(function (component) {
      var args = Array.prototype.slice.call(arguments, 0);
      var spi = component.config(apiConfig);
      return f.apply(undefined, [spi].concat(args));
    }, f);
  };
  var $_7vju5710qje5o2ycz = {
    apiConfig: $_49qg0cwjje5o2xv6.constant(apiConfig),
    makeApi: makeApi,
    premade: premade,
    getPremade: getPremade
  };

  var adt$2 = $_9u0u7zxwje5o2xzz.generate([
    { required: ['data'] },
    { external: ['data'] },
    { optional: ['data'] },
    { group: ['data'] }
  ]);
  var fFactory = $_65y30vy7je5o2y1k.defaulted('factory', { sketch: $_49qg0cwjje5o2xv6.identity });
  var fSchema = $_65y30vy7je5o2y1k.defaulted('schema', []);
  var fName = $_65y30vy7je5o2y1k.strict('name');
  var fPname = $_65y30vy7je5o2y1k.field('pname', 'pname', $_2qdncyy8je5o2y1o.defaultedThunk(function (typeSpec) {
    return '<alloy.' + $_44na3j10rje5o2yd4.generate(typeSpec.name) + '>';
  }), $_1ui3lpyeje5o2y2u.anyValue());
  var fDefaults = $_65y30vy7je5o2y1k.defaulted('defaults', $_49qg0cwjje5o2xv6.constant({}));
  var fOverrides = $_65y30vy7je5o2y1k.defaulted('overrides', $_49qg0cwjje5o2xv6.constant({}));
  var requiredSpec = $_1ui3lpyeje5o2y2u.objOf([
    fFactory,
    fSchema,
    fName,
    fPname,
    fDefaults,
    fOverrides
  ]);
  var externalSpec = $_1ui3lpyeje5o2y2u.objOf([
    fFactory,
    fSchema,
    fName,
    fDefaults,
    fOverrides
  ]);
  var optionalSpec = $_1ui3lpyeje5o2y2u.objOf([
    fFactory,
    fSchema,
    fName,
    fPname,
    fDefaults,
    fOverrides
  ]);
  var groupSpec = $_1ui3lpyeje5o2y2u.objOf([
    fFactory,
    fSchema,
    fName,
    $_65y30vy7je5o2y1k.strict('unit'),
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
    return part.fold($_49qg0cwjje5o2xv6.identity, $_49qg0cwjje5o2xv6.identity, $_49qg0cwjje5o2xv6.identity, $_49qg0cwjje5o2xv6.identity);
  };
  var convert = function (adtConstructor, partSpec) {
    return function (spec) {
      var data = $_1ui3lpyeje5o2y2u.asStructOrDie('Converting part type', partSpec, spec);
      return adtConstructor(data);
    };
  };
  var $_1837sx10vje5o2ye4 = {
    required: convert(adt$2.required, requiredSpec),
    external: convert(adt$2.external, externalSpec),
    optional: convert(adt$2.optional, optionalSpec),
    group: convert(adt$2.group, groupSpec),
    asNamedPart: asNamedPart,
    name: name$1,
    asCommon: asCommon,
    original: $_49qg0cwjje5o2xv6.constant('entirety')
  };

  var placeholder = 'placeholder';
  var adt$3 = $_9u0u7zxwje5o2xzz.generate([
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
    return $_8kvqz0wsje5o2xvo.contains([placeholder], uiType);
  };
  var subPlaceholder = function (owner, detail, compSpec, placeholders) {
    if (owner.exists(function (o) {
        return o !== compSpec.owner;
      }))
      return adt$3.single(true, $_49qg0cwjje5o2xv6.constant(compSpec));
    return $_fnkom1xsje5o2xzl.readOptFrom(placeholders, compSpec.name).fold(function () {
      throw new Error('Unknown placeholder component: ' + compSpec.name + '\nKnown: [' + $_67wkp4x0je5o2xwn.keys(placeholders) + ']\nNamespace: ' + owner.getOr('none') + '\nSpec: ' + $_anh5fuydje5o2y2s.stringify(compSpec, null, 2));
    }, function (newSpec) {
      return newSpec.replace();
    });
  };
  var scan = function (owner, detail, compSpec, placeholders) {
    if (compSpec.uiType === placeholder)
      return subPlaceholder(owner, detail, compSpec, placeholders);
    else
      return adt$3.single(false, $_49qg0cwjje5o2xv6.constant(compSpec));
  };
  var substitute = function (owner, detail, compSpec, placeholders) {
    var base = scan(owner, detail, compSpec, placeholders);
    return base.fold(function (req, valueThunk) {
      var value = valueThunk(detail, compSpec.config, compSpec.validated);
      var childSpecs = $_fnkom1xsje5o2xzl.readOptFrom(value, 'components').getOr([]);
      var substituted = $_8kvqz0wsje5o2xvo.bind(childSpecs, function (c) {
        return substitute(owner, detail, c, placeholders);
      });
      return [$_gc11amwyje5o2xwl.deepMerge(value, { components: substituted })];
    }, function (req, valuesThunk) {
      var values = valuesThunk(detail, compSpec.config, compSpec.validated);
      return values;
    });
  };
  var substituteAll = function (owner, detail, components, placeholders) {
    return $_8kvqz0wsje5o2xvo.bind(components, function (c) {
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
      name: $_49qg0cwjje5o2xv6.constant(label),
      required: required,
      used: used,
      replace: replace
    };
  };
  var substitutePlaces = function (owner, detail, components, placeholders) {
    var ps = $_67wkp4x0je5o2xwn.map(placeholders, function (ph, name) {
      return oneReplace(name, ph);
    });
    var outcome = substituteAll(owner, detail, components, ps);
    $_67wkp4x0je5o2xwn.each(ps, function (p) {
      if (p.used() === false && p.required()) {
        throw new Error('Placeholder: ' + p.name() + ' was not found in components list\nNamespace: ' + owner.getOr('none') + '\nComponents: ' + $_anh5fuydje5o2y2s.stringify(detail.components(), null, 2));
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
  var $_ckd8k310wje5o2yef = {
    single: adt$3.single,
    multiple: adt$3.multiple,
    isSubstitute: isSubstitute,
    placeholder: $_49qg0cwjje5o2xv6.constant(placeholder),
    substituteAll: substituteAll,
    substitutePlaces: substitutePlaces,
    singleReplace: singleReplace
  };

  var combine = function (detail, data, partSpec, partValidated) {
    var spec = partSpec;
    return $_gc11amwyje5o2xwl.deepMerge(data.defaults()(detail, partSpec, partValidated), partSpec, { uid: detail.partUids()[data.name()] }, data.overrides()(detail, partSpec, partValidated), { 'debug.sketcher': $_fnkom1xsje5o2xzl.wrap('part-' + data.name(), spec) });
  };
  var subs = function (owner, detail, parts) {
    var internals = {};
    var externals = {};
    $_8kvqz0wsje5o2xvo.each(parts, function (part) {
      part.fold(function (data) {
        internals[data.pname()] = $_ckd8k310wje5o2yef.single(true, function (detail, partSpec, partValidated) {
          return data.factory().sketch(combine(detail, data, partSpec, partValidated));
        });
      }, function (data) {
        var partSpec = detail.parts()[data.name()]();
        externals[data.name()] = $_49qg0cwjje5o2xv6.constant(combine(detail, data, partSpec[$_1837sx10vje5o2ye4.original()]()));
      }, function (data) {
        internals[data.pname()] = $_ckd8k310wje5o2yef.single(false, function (detail, partSpec, partValidated) {
          return data.factory().sketch(combine(detail, data, partSpec, partValidated));
        });
      }, function (data) {
        internals[data.pname()] = $_ckd8k310wje5o2yef.multiple(true, function (detail, _partSpec, _partValidated) {
          var units = detail[data.name()]();
          return $_8kvqz0wsje5o2xvo.map(units, function (u) {
            return data.factory().sketch($_gc11amwyje5o2xwl.deepMerge(data.defaults()(detail, u), u, data.overrides()(detail, u)));
          });
        });
      });
    });
    return {
      internals: $_49qg0cwjje5o2xv6.constant(internals),
      externals: $_49qg0cwjje5o2xv6.constant(externals)
    };
  };
  var $_9xd6lv10uje5o2ydy = { subs: subs };

  var generate$2 = function (owner, parts) {
    var r = {};
    $_8kvqz0wsje5o2xvo.each(parts, function (part) {
      $_1837sx10vje5o2ye4.asNamedPart(part).each(function (np) {
        var g = doGenerateOne(owner, np.pname());
        r[np.name()] = function (config) {
          var validated = $_1ui3lpyeje5o2y2u.asRawOrDie('Part: ' + np.name() + ' in ' + owner, $_1ui3lpyeje5o2y2u.objOf(np.schema()), config);
          return $_gc11amwyje5o2xwl.deepMerge(g, {
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
      uiType: $_ckd8k310wje5o2yef.placeholder(),
      owner: owner,
      name: pname
    };
  };
  var generateOne = function (owner, pname, config) {
    return {
      uiType: $_ckd8k310wje5o2yef.placeholder(),
      owner: owner,
      name: pname,
      config: config,
      validated: {}
    };
  };
  var schemas = function (parts) {
    return $_8kvqz0wsje5o2xvo.bind(parts, function (part) {
      return part.fold(Option.none, Option.some, Option.none, Option.none).map(function (data) {
        return $_65y30vy7je5o2y1k.strictObjOf(data.name(), data.schema().concat([$_2cu7nfz6je5o2y5e.snapshot($_1837sx10vje5o2ye4.original())]));
      }).toArray();
    });
  };
  var names = function (parts) {
    return $_8kvqz0wsje5o2xvo.map(parts, $_1837sx10vje5o2ye4.name);
  };
  var substitutes = function (owner, detail, parts) {
    return $_9xd6lv10uje5o2ydy.subs(owner, detail, parts);
  };
  var components = function (owner, detail, internals) {
    return $_ckd8k310wje5o2yef.substitutePlaces(Option.some(owner), detail, detail.components(), internals);
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
    $_8kvqz0wsje5o2xvo.each(partKeys, function (pk) {
      r[pk] = system.getByUid(uids[pk]);
    });
    return $_67wkp4x0je5o2xwn.map(r, $_49qg0cwjje5o2xv6.constant);
  };
  var getAllParts = function (component, detail) {
    var system = component.getSystem();
    return $_67wkp4x0je5o2xwn.map(detail.partUids(), function (pUid, k) {
      return $_49qg0cwjje5o2xv6.constant(system.getByUid(pUid));
    });
  };
  var getPartsOrDie = function (component, detail, partKeys) {
    var r = {};
    var uids = detail.partUids();
    var system = component.getSystem();
    $_8kvqz0wsje5o2xvo.each(partKeys, function (pk) {
      r[pk] = system.getByUid(uids[pk]).getOrDie();
    });
    return $_67wkp4x0je5o2xwn.map(r, $_49qg0cwjje5o2xv6.constant);
  };
  var defaultUids = function (baseUid, partTypes) {
    var partNames = names(partTypes);
    return $_fnkom1xsje5o2xzl.wrapAll($_8kvqz0wsje5o2xvo.map(partNames, function (pn) {
      return {
        key: pn,
        value: baseUid + '-' + pn
      };
    }));
  };
  var defaultUidsSchema = function (partTypes) {
    return $_65y30vy7je5o2y1k.field('partUids', 'partUids', $_2qdncyy8je5o2y1o.mergeWithThunk(function (spec) {
      return defaultUids(spec.uid, partTypes);
    }), $_1ui3lpyeje5o2y2u.anyValue());
  };
  var $_fkcvdu10tje5o2yda = {
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
  var $_28turc10yje5o2yf0 = {
    prefix: $_49qg0cwjje5o2xv6.constant(prefix$1),
    idAttr: $_49qg0cwjje5o2xv6.constant(idAttr)
  };

  var prefix$2 = $_28turc10yje5o2yf0.prefix();
  var idAttr$1 = $_28turc10yje5o2yf0.idAttr();
  var write = function (label, elem) {
    var id = $_44na3j10rje5o2yd4.generate(prefix$2 + label);
    $_c4ed9fxrje5o2xz8.set(elem, idAttr$1, id);
    return id;
  };
  var writeOnly = function (elem, uid) {
    $_c4ed9fxrje5o2xz8.set(elem, idAttr$1, uid);
  };
  var read$2 = function (elem) {
    var id = $_5souzyxkje5o2xyh.isElement(elem) ? $_c4ed9fxrje5o2xz8.get(elem, idAttr$1) : null;
    return Option.from(id);
  };
  var find$3 = function (container, id) {
    return $_gesp01zxje5o2y8p.descendant(container, id);
  };
  var generate$3 = function (prefix) {
    return $_44na3j10rje5o2yd4.generate(prefix);
  };
  var revoke = function (elem) {
    $_c4ed9fxrje5o2xz8.remove(elem, idAttr$1);
  };
  var $_xh06h10xje5o2yer = {
    revoke: revoke,
    write: write,
    writeOnly: writeOnly,
    read: read$2,
    find: find$3,
    generate: generate$3,
    attribute: $_49qg0cwjje5o2xv6.constant(idAttr$1)
  };

  var getPartsSchema = function (partNames, _optPartNames, _owner) {
    var owner = _owner !== undefined ? _owner : 'Unknown owner';
    var fallbackThunk = function () {
      return [$_2cu7nfz6je5o2y5e.output('partUids', {})];
    };
    var optPartNames = _optPartNames !== undefined ? _optPartNames : fallbackThunk();
    if (partNames.length === 0 && optPartNames.length === 0)
      return fallbackThunk();
    var partsSchema = $_65y30vy7je5o2y1k.strictObjOf('parts', $_8kvqz0wsje5o2xvo.flatten([
      $_8kvqz0wsje5o2xvo.map(partNames, $_65y30vy7je5o2y1k.strict),
      $_8kvqz0wsje5o2xvo.map(optPartNames, function (optPart) {
        return $_65y30vy7je5o2y1k.defaulted(optPart, $_ckd8k310wje5o2yef.single(false, function () {
          throw new Error('The optional part: ' + optPart + ' was not specified in the config, but it was used in components');
        }));
      })
    ]));
    var partUidsSchema = $_65y30vy7je5o2y1k.state('partUids', function (spec) {
      if (!$_fnkom1xsje5o2xzl.hasKey(spec, 'parts')) {
        throw new Error('Part uid definition for owner: ' + owner + ' requires "parts"\nExpected parts: ' + partNames.join(', ') + '\nSpec: ' + $_anh5fuydje5o2y2s.stringify(spec, null, 2));
      }
      var uids = $_67wkp4x0je5o2xwn.map(spec.parts, function (v, k) {
        return $_fnkom1xsje5o2xzl.readOptFrom(v, 'uid').getOrThunk(function () {
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
    var ps = partSchemas.length > 0 ? [$_65y30vy7je5o2y1k.strictObjOf('parts', partSchemas)] : [];
    return ps.concat([
      $_65y30vy7je5o2y1k.strict('uid'),
      $_65y30vy7je5o2y1k.defaulted('dom', {}),
      $_65y30vy7je5o2y1k.defaulted('components', []),
      $_2cu7nfz6je5o2y5e.snapshot('originalSpec'),
      $_65y30vy7je5o2y1k.defaulted('debug.sketcher', {})
    ]).concat(partUidsSchemas);
  };
  var asRawOrDie$1 = function (label, schema, spec, partSchemas, partUidsSchemas) {
    var baseS = base$1(label, partSchemas, spec, partUidsSchemas);
    return $_1ui3lpyeje5o2y2u.asRawOrDie(label + ' [SpecSchema]', $_1ui3lpyeje5o2y2u.objOfOnly(baseS.concat(schema)), spec);
  };
  var asStructOrDie$1 = function (label, schema, spec, partSchemas, partUidsSchemas) {
    var baseS = base$1(label, partSchemas, partUidsSchemas, spec);
    return $_1ui3lpyeje5o2y2u.asStructOrDie(label + ' [SpecSchema]', $_1ui3lpyeje5o2y2u.objOfOnly(baseS.concat(schema)), spec);
  };
  var extend = function (builder, original, nu) {
    var newSpec = $_gc11amwyje5o2xwl.deepMerge(original, nu);
    return builder(newSpec);
  };
  var addBehaviours = function (original, behaviours) {
    return $_gc11amwyje5o2xwl.deepMerge(original, behaviours);
  };
  var $_7w1xjh10zje5o2yf3 = {
    asRawOrDie: asRawOrDie$1,
    asStructOrDie: asStructOrDie$1,
    addBehaviours: addBehaviours,
    getPartsSchema: getPartsSchema,
    extend: extend
  };

  var single = function (owner, schema, factory, spec) {
    var specWithUid = supplyUid(spec);
    var detail = $_7w1xjh10zje5o2yf3.asStructOrDie(owner, schema, specWithUid, [], []);
    return $_gc11amwyje5o2xwl.deepMerge(factory(detail, specWithUid), { 'debug.sketcher': $_fnkom1xsje5o2xzl.wrap(owner, spec) });
  };
  var composite = function (owner, schema, partTypes, factory, spec) {
    var specWithUid = supplyUid(spec);
    var partSchemas = $_fkcvdu10tje5o2yda.schemas(partTypes);
    var partUidsSchema = $_fkcvdu10tje5o2yda.defaultUidsSchema(partTypes);
    var detail = $_7w1xjh10zje5o2yf3.asStructOrDie(owner, schema, specWithUid, partSchemas, [partUidsSchema]);
    var subs = $_fkcvdu10tje5o2yda.substitutes(owner, detail, partTypes);
    var components = $_fkcvdu10tje5o2yda.components(owner, detail, subs.internals());
    return $_gc11amwyje5o2xwl.deepMerge(factory(detail, components, specWithUid, subs.externals()), { 'debug.sketcher': $_fnkom1xsje5o2xzl.wrap(owner, spec) });
  };
  var supplyUid = function (spec) {
    return $_gc11amwyje5o2xwl.deepMerge({ uid: $_xh06h10xje5o2yer.generate('uid') }, spec);
  };
  var $_2xd6yw10sje5o2yd5 = {
    supplyUid: supplyUid,
    single: single,
    composite: composite
  };

  var singleSchema = $_1ui3lpyeje5o2y2u.objOfOnly([
    $_65y30vy7je5o2y1k.strict('name'),
    $_65y30vy7je5o2y1k.strict('factory'),
    $_65y30vy7je5o2y1k.strict('configFields'),
    $_65y30vy7je5o2y1k.defaulted('apis', {}),
    $_65y30vy7je5o2y1k.defaulted('extraApis', {})
  ]);
  var compositeSchema = $_1ui3lpyeje5o2y2u.objOfOnly([
    $_65y30vy7je5o2y1k.strict('name'),
    $_65y30vy7je5o2y1k.strict('factory'),
    $_65y30vy7je5o2y1k.strict('configFields'),
    $_65y30vy7je5o2y1k.strict('partFields'),
    $_65y30vy7je5o2y1k.defaulted('apis', {}),
    $_65y30vy7je5o2y1k.defaulted('extraApis', {})
  ]);
  var single$1 = function (rawConfig) {
    var config = $_1ui3lpyeje5o2y2u.asRawOrDie('Sketcher for ' + rawConfig.name, singleSchema, rawConfig);
    var sketch = function (spec) {
      return $_2xd6yw10sje5o2yd5.single(config.name, config.configFields, config.factory, spec);
    };
    var apis = $_67wkp4x0je5o2xwn.map(config.apis, $_7vju5710qje5o2ycz.makeApi);
    var extraApis = $_67wkp4x0je5o2xwn.map(config.extraApis, function (f, k) {
      return $_dqz1yaygje5o2y33.markAsExtraApi(f, k);
    });
    return $_gc11amwyje5o2xwl.deepMerge({
      name: $_49qg0cwjje5o2xv6.constant(config.name),
      partFields: $_49qg0cwjje5o2xv6.constant([]),
      configFields: $_49qg0cwjje5o2xv6.constant(config.configFields),
      sketch: sketch
    }, apis, extraApis);
  };
  var composite$1 = function (rawConfig) {
    var config = $_1ui3lpyeje5o2y2u.asRawOrDie('Sketcher for ' + rawConfig.name, compositeSchema, rawConfig);
    var sketch = function (spec) {
      return $_2xd6yw10sje5o2yd5.composite(config.name, config.configFields, config.partFields, config.factory, spec);
    };
    var parts = $_fkcvdu10tje5o2yda.generate(config.name, config.partFields);
    var apis = $_67wkp4x0je5o2xwn.map(config.apis, $_7vju5710qje5o2ycz.makeApi);
    var extraApis = $_67wkp4x0je5o2xwn.map(config.extraApis, function (f, k) {
      return $_dqz1yaygje5o2y33.markAsExtraApi(f, k);
    });
    return $_gc11amwyje5o2xwl.deepMerge({
      name: $_49qg0cwjje5o2xv6.constant(config.name),
      partFields: $_49qg0cwjje5o2xv6.constant(config.partFields),
      configFields: $_49qg0cwjje5o2xv6.constant(config.configFields),
      sketch: sketch,
      parts: $_49qg0cwjje5o2xv6.constant(parts)
    }, apis, extraApis);
  };
  var $_c7e59s10pje5o2yco = {
    single: single$1,
    composite: composite$1
  };

  var events$3 = function (optAction) {
    var executeHandler = function (action) {
      return $_9z4gpyy4je5o2y14.run($_9k0aw9whje5o2xv0.execute(), function (component, simulatedEvent) {
        action(component);
        simulatedEvent.stop();
      });
    };
    var onClick = function (component, simulatedEvent) {
      simulatedEvent.stop();
      $_d7275bwgje5o2xut.emitExecute(component);
    };
    var onMousedown = function (component, simulatedEvent) {
      simulatedEvent.cut();
    };
    var pointerEvents = $_6ys1d4wkje5o2xv8.detect().deviceType.isTouch() ? [$_9z4gpyy4je5o2y14.run($_9k0aw9whje5o2xv0.tap(), onClick)] : [
      $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.click(), onClick),
      $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.mousedown(), onMousedown)
    ];
    return $_9z4gpyy4je5o2y14.derive($_8kvqz0wsje5o2xvo.flatten([
      optAction.map(executeHandler).toArray(),
      pointerEvents
    ]));
  };
  var $_8pgk6d110je5o2yff = { events: events$3 };

  var factory = function (detail, spec) {
    var events = $_8pgk6d110je5o2yff.events(detail.action());
    var optType = $_fnkom1xsje5o2xzl.readOptFrom(detail.dom(), 'attributes').bind($_fnkom1xsje5o2xzl.readOpt('type'));
    var optTag = $_fnkom1xsje5o2xzl.readOptFrom(detail.dom(), 'tag');
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: detail.components(),
      events: events,
      behaviours: $_gc11amwyje5o2xwl.deepMerge($_e4rr4py2je5o2y0l.derive([
        Focusing.config({}),
        Keying.config({
          mode: 'execution',
          useSpace: true,
          useEnter: true
        })
      ]), $_2c8uf410oje5o2yci.get(detail.buttonBehaviours())),
      domModification: {
        attributes: $_gc11amwyje5o2xwl.deepMerge(optType.fold(function () {
          return optTag.is('button') ? { type: 'button' } : {};
        }, function (t) {
          return {};
        }), { role: detail.role().getOr('button') })
      },
      eventOrder: detail.eventOrder()
    };
  };
  var Button = $_c7e59s10pje5o2yco.single({
    name: 'Button',
    factory: factory,
    configFields: [
      $_65y30vy7je5o2y1k.defaulted('uid', undefined),
      $_65y30vy7je5o2y1k.strict('dom'),
      $_65y30vy7je5o2y1k.defaulted('components', []),
      $_2c8uf410oje5o2yci.field('buttonBehaviours', [
        Focusing,
        Keying
      ]),
      $_65y30vy7je5o2y1k.option('action'),
      $_65y30vy7je5o2y1k.option('role'),
      $_65y30vy7je5o2y1k.defaulted('eventOrder', {})
    ]
  });

  var exhibit$2 = function (base, unselectConfig) {
    return $_9n8qyryhje5o2y35.nu({
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
    return $_9z4gpyy4je5o2y14.derive([$_9z4gpyy4je5o2y14.abort($_2opl28wije5o2xv3.selectstart(), $_49qg0cwjje5o2xv6.constant(true))]);
  };
  var $_gcl3ee112je5o2yfl = {
    events: events$4,
    exhibit: exhibit$2
  };

  var Unselecting = $_e4rr4py2je5o2y0l.create({
    fields: [],
    name: 'unselecting',
    active: $_gcl3ee112je5o2yfl
  });

  var getAttrs = function (elem) {
    var attributes = elem.dom().attributes !== undefined ? elem.dom().attributes : [];
    return $_8kvqz0wsje5o2xvo.foldl(attributes, function (b, attr) {
      if (attr.name === 'class')
        return b;
      else
        return $_gc11amwyje5o2xwl.deepMerge(b, $_fnkom1xsje5o2xzl.wrap(attr.name, attr.value));
    }, {});
  };
  var getClasses = function (elem) {
    return Array.prototype.slice.call(elem.dom().classList, 0);
  };
  var fromHtml$2 = function (html) {
    var elem = $_f7rai4xfje5o2xy5.fromHtml(html);
    var children = $_5i5voox3je5o2xx2.children(elem);
    var attrs = getAttrs(elem);
    var classes = getClasses(elem);
    var contents = children.length === 0 ? {} : { innerHtml: $_1fpq52xoje5o2xyx.get(elem) };
    return $_gc11amwyje5o2xwl.deepMerge({
      tag: $_5souzyxkje5o2xyh.name(elem),
      classes: classes,
      attributes: attrs
    }, contents);
  };
  var sketch = function (sketcher, html, config) {
    return sketcher.sketch($_gc11amwyje5o2xwl.deepMerge({ dom: fromHtml$2(html) }, config));
  };
  var $_3h3jj4114je5o2yfv = {
    fromHtml: fromHtml$2,
    sketch: sketch
  };

  var dom$1 = function (rawHtml) {
    var html = $_gfctqkwvje5o2xwg.supplant(rawHtml, { prefix: $_dqvuwxzeje5o2y6o.prefix() });
    return $_3h3jj4114je5o2yfv.fromHtml(html);
  };
  var spec = function (rawHtml) {
    var sDom = dom$1(rawHtml);
    return { dom: sDom };
  };
  var $_a88x2p113je5o2yfs = {
    dom: dom$1,
    spec: spec
  };

  var forToolbarCommand = function (editor, command) {
    return forToolbar(command, function () {
      editor.execCommand(command);
    }, {});
  };
  var getToggleBehaviours = function (command) {
    return $_e4rr4py2je5o2y0l.derive([
      Toggling.config({
        toggleClass: $_dqvuwxzeje5o2y6o.resolve('toolbar-button-selected'),
        toggleOnExecute: false,
        aria: { mode: 'pressed' }
      }),
      $_941wfnzdje5o2y6l.format(command, function (button, status) {
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
      dom: $_a88x2p113je5o2yfs.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-' + clazz + ' ${prefix}-icon"></span>'),
      action: action,
      buttonBehaviours: $_gc11amwyje5o2xwl.deepMerge($_e4rr4py2je5o2y0l.derive([Unselecting.config({})]), extraBehaviours)
    });
  };
  var $_2abrklzfje5o2y6q = {
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
  var $_jiixm119je5o2ygs = {
    reduceBy: reduceBy,
    increaseBy: increaseBy,
    findValueOfX: findValueOfX
  };

  var changeEvent = 'slider.change.value';
  var isTouch = $_6ys1d4wkje5o2xv8.detect().deviceType.isTouch();
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
    $_d7275bwgje5o2xut.emitWith(component, changeEvent, { value: value });
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
    var value = $_jiixm119je5o2ygs.findValueOfX(spectrumBounds, detail.min(), detail.max(), xValue, detail.stepSize(), detail.snapToGrid(), detail.snapStart());
    fireChange(spectrum, value);
  };
  var setXFromEvent = function (spectrum, detail, spectrumBounds, simulatedEvent) {
    return getEventX(simulatedEvent).map(function (xValue) {
      setToX(spectrum, spectrumBounds, detail, xValue);
      return xValue;
    });
  };
  var moveLeft$4 = function (spectrum, detail) {
    var newValue = $_jiixm119je5o2ygs.reduceBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
    fireChange(spectrum, newValue);
  };
  var moveRight$4 = function (spectrum, detail) {
    var newValue = $_jiixm119je5o2ygs.increaseBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
    fireChange(spectrum, newValue);
  };
  var $_4cir1e118je5o2ygm = {
    setXFromEvent: setXFromEvent,
    setToLedge: setToLedge,
    setToRedge: setToRedge,
    moveLeftFromRedge: moveLeftFromRedge,
    moveRightFromLedge: moveRightFromLedge,
    moveLeft: moveLeft$4,
    moveRight: moveRight$4,
    changeEvent: $_49qg0cwjje5o2xv6.constant(changeEvent)
  };

  var platform = $_6ys1d4wkje5o2xv8.detect();
  var isTouch$1 = platform.deviceType.isTouch();
  var edgePart = function (name, action) {
    return $_1837sx10vje5o2ye4.optional({
      name: '' + name + '-edge',
      overrides: function (detail) {
        var touchEvents = $_9z4gpyy4je5o2y14.derive([$_9z4gpyy4je5o2y14.runActionExtra($_2opl28wije5o2xv3.touchstart(), action, [detail])]);
        var mouseEvents = $_9z4gpyy4je5o2y14.derive([
          $_9z4gpyy4je5o2y14.runActionExtra($_2opl28wije5o2xv3.mousedown(), action, [detail]),
          $_9z4gpyy4je5o2y14.runActionExtra($_2opl28wije5o2xv3.mousemove(), function (l, det) {
            if (det.mouseIsDown().get())
              action(l, det);
          }, [detail])
        ]);
        return { events: isTouch$1 ? touchEvents : mouseEvents };
      }
    });
  };
  var ledgePart = edgePart('left', $_4cir1e118je5o2ygm.setToLedge);
  var redgePart = edgePart('right', $_4cir1e118je5o2ygm.setToRedge);
  var thumbPart = $_1837sx10vje5o2ye4.required({
    name: 'thumb',
    defaults: $_49qg0cwjje5o2xv6.constant({ dom: { styles: { position: 'absolute' } } }),
    overrides: function (detail) {
      return {
        events: $_9z4gpyy4je5o2y14.derive([
          $_9z4gpyy4je5o2y14.redirectToPart($_2opl28wije5o2xv3.touchstart(), detail, 'spectrum'),
          $_9z4gpyy4je5o2y14.redirectToPart($_2opl28wije5o2xv3.touchmove(), detail, 'spectrum'),
          $_9z4gpyy4je5o2y14.redirectToPart($_2opl28wije5o2xv3.touchend(), detail, 'spectrum')
        ])
      };
    }
  });
  var spectrumPart = $_1837sx10vje5o2ye4.required({
    schema: [$_65y30vy7je5o2y1k.state('mouseIsDown', function () {
        return Cell(false);
      })],
    name: 'spectrum',
    overrides: function (detail) {
      var moveToX = function (spectrum, simulatedEvent) {
        var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
        $_4cir1e118je5o2ygm.setXFromEvent(spectrum, detail, spectrumBounds, simulatedEvent);
      };
      var touchEvents = $_9z4gpyy4je5o2y14.derive([
        $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.touchstart(), moveToX),
        $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.touchmove(), moveToX)
      ]);
      var mouseEvents = $_9z4gpyy4je5o2y14.derive([
        $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.mousedown(), moveToX),
        $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.mousemove(), function (spectrum, se) {
          if (detail.mouseIsDown().get())
            moveToX(spectrum, se);
        })
      ]);
      return {
        behaviours: $_e4rr4py2je5o2y0l.derive(isTouch$1 ? [] : [
          Keying.config({
            mode: 'special',
            onLeft: function (spectrum) {
              $_4cir1e118je5o2ygm.moveLeft(spectrum, detail);
              return Option.some(true);
            },
            onRight: function (spectrum) {
              $_4cir1e118je5o2ygm.moveRight(spectrum, detail);
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
  var $_2tf91511dje5o2yh6 = {
    onLoad: onLoad$1,
    onUnload: onUnload,
    setValue: setValue,
    getValue: getValue
  };

  var events$5 = function (repConfig, repState) {
    var es = repConfig.resetOnDom() ? [
      $_9z4gpyy4je5o2y14.runOnAttached(function (comp, se) {
        $_2tf91511dje5o2yh6.onLoad(comp, repConfig, repState);
      }),
      $_9z4gpyy4je5o2y14.runOnDetached(function (comp, se) {
        $_2tf91511dje5o2yh6.onUnload(comp, repConfig, repState);
      })
    ] : [$_f9q9vsy3je5o2y0s.loadEvent(repConfig, repState, $_2tf91511dje5o2yh6.onLoad)];
    return $_9z4gpyy4je5o2y14.derive(es);
  };
  var $_az7lkp11cje5o2yh4 = { events: events$5 };

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
  var $_fgguaw11gje5o2yhe = {
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
    return $_fnkom1xsje5o2xzl.readOptFrom(dataset, key).fold(function () {
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
    $_65y30vy7je5o2y1k.option('initialValue'),
    $_65y30vy7je5o2y1k.strict('getFallbackEntry'),
    $_65y30vy7je5o2y1k.strict('getDataKey'),
    $_65y30vy7je5o2y1k.strict('setData'),
    $_2cu7nfz6je5o2y5e.output('manager', {
      setValue: setValue$1,
      getValue: getValue$1,
      onLoad: onLoad$2,
      onUnload: onUnload$1,
      state: $_fgguaw11gje5o2yhe.dataset
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
    $_65y30vy7je5o2y1k.strict('getValue'),
    $_65y30vy7je5o2y1k.defaulted('setValue', $_49qg0cwjje5o2xv6.noop),
    $_65y30vy7je5o2y1k.option('initialValue'),
    $_2cu7nfz6je5o2y5e.output('manager', {
      setValue: setValue$2,
      getValue: getValue$2,
      onLoad: onLoad$3,
      onUnload: $_49qg0cwjje5o2xv6.noop,
      state: $_olpdsyjje5o2y3j.init
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
    $_65y30vy7je5o2y1k.option('initialValue'),
    $_2cu7nfz6je5o2y5e.output('manager', {
      setValue: setValue$3,
      getValue: getValue$3,
      onLoad: onLoad$4,
      onUnload: onUnload$2,
      state: $_fgguaw11gje5o2yhe.memory
    })
  ];

  var RepresentSchema = [
    $_65y30vy7je5o2y1k.defaultedOf('store', { mode: 'memory' }, $_1ui3lpyeje5o2y2u.choose('mode', {
      memory: MemoryStore,
      manual: ManualStore,
      dataset: DatasetStore
    })),
    $_2cu7nfz6je5o2y5e.onHandler('onSetValue'),
    $_65y30vy7je5o2y1k.defaulted('resetOnDom', false)
  ];

  var me = $_e4rr4py2je5o2y0l.create({
    fields: RepresentSchema,
    name: 'representing',
    active: $_az7lkp11cje5o2yh4,
    apis: $_2tf91511dje5o2yh6,
    extra: {
      setValueFrom: function (component, source) {
        var value = me.getValue(source);
        me.setValue(component, value);
      }
    },
    state: $_fgguaw11gje5o2yhe
  });

  var isTouch$2 = $_6ys1d4wkje5o2xv8.detect().deviceType.isTouch();
  var SliderSchema = [
    $_65y30vy7je5o2y1k.strict('min'),
    $_65y30vy7je5o2y1k.strict('max'),
    $_65y30vy7je5o2y1k.defaulted('stepSize', 1),
    $_65y30vy7je5o2y1k.defaulted('onChange', $_49qg0cwjje5o2xv6.noop),
    $_65y30vy7je5o2y1k.defaulted('onInit', $_49qg0cwjje5o2xv6.noop),
    $_65y30vy7je5o2y1k.defaulted('onDragStart', $_49qg0cwjje5o2xv6.noop),
    $_65y30vy7je5o2y1k.defaulted('onDragEnd', $_49qg0cwjje5o2xv6.noop),
    $_65y30vy7je5o2y1k.defaulted('snapToGrid', false),
    $_65y30vy7je5o2y1k.option('snapStart'),
    $_65y30vy7je5o2y1k.strict('getInitialValue'),
    $_2c8uf410oje5o2yci.field('sliderBehaviours', [
      Keying,
      me
    ]),
    $_65y30vy7je5o2y1k.state('value', function (spec) {
      return Cell(spec.min);
    })
  ].concat(!isTouch$2 ? [$_65y30vy7je5o2y1k.state('mouseIsDown', function () {
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
    $_2jybvt103je5o2y95.set(element, 'max-width', absMax + 'px');
  };
  var $_bqnful11kje5o2yi9 = {
    set: set$4,
    get: get$6,
    getOuter: getOuter$2,
    setMax: setMax$1
  };

  var isTouch$3 = $_6ys1d4wkje5o2xv8.detect().deviceType.isTouch();
  var sketch$1 = function (detail, components, spec, externals) {
    var range = detail.max() - detail.min();
    var getXCentre = function (component) {
      var rect = component.element().dom().getBoundingClientRect();
      return (rect.left + rect.right) / 2;
    };
    var getThumb = function (component) {
      return $_fkcvdu10tje5o2yda.getPartOrDie(component, detail, 'thumb');
    };
    var getXOffset = function (slider, spectrumBounds, detail) {
      var v = detail.value().get();
      if (v < detail.min()) {
        return $_fkcvdu10tje5o2yda.getPart(slider, detail, 'left-edge').fold(function () {
          return 0;
        }, function (ledge) {
          return getXCentre(ledge) - spectrumBounds.left;
        });
      } else if (v > detail.max()) {
        return $_fkcvdu10tje5o2yda.getPart(slider, detail, 'right-edge').fold(function () {
          return spectrumBounds.width;
        }, function (redge) {
          return getXCentre(redge) - spectrumBounds.left;
        });
      } else {
        return (detail.value().get() - detail.min()) / range * spectrumBounds.width;
      }
    };
    var getXPos = function (slider) {
      var spectrum = $_fkcvdu10tje5o2yda.getPartOrDie(slider, detail, 'spectrum');
      var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
      var sliderBounds = slider.element().dom().getBoundingClientRect();
      var xOffset = getXOffset(slider, spectrumBounds, detail);
      return spectrumBounds.left - sliderBounds.left + xOffset;
    };
    var refresh = function (component) {
      var pos = getXPos(component);
      var thumb = getThumb(component);
      var thumbRadius = $_bqnful11kje5o2yi9.get(thumb.element()) / 2;
      $_2jybvt103je5o2y95.set(thumb.element(), 'left', pos - thumbRadius + 'px');
    };
    var changeValue = function (component, newValue) {
      var oldValue = detail.value().get();
      var thumb = getThumb(component);
      if (oldValue !== newValue || $_2jybvt103je5o2y95.getRaw(thumb.element(), 'left').isNone()) {
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
      $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.touchstart(), function (slider, simulatedEvent) {
        detail.onDragStart()(slider, getThumb(slider));
      }),
      $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.touchend(), function (slider, simulatedEvent) {
        detail.onDragEnd()(slider, getThumb(slider));
      })
    ] : [
      $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.mousedown(), function (slider, simulatedEvent) {
        simulatedEvent.stop();
        detail.onDragStart()(slider, getThumb(slider));
        detail.mouseIsDown().set(true);
      }),
      $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.mouseup(), function (slider, simulatedEvent) {
        detail.onDragEnd()(slider, getThumb(slider));
        detail.mouseIsDown().set(false);
      })
    ];
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_gc11amwyje5o2xwl.deepMerge($_e4rr4py2je5o2y0l.derive($_8kvqz0wsje5o2xvo.flatten([
        !isTouch$3 ? [Keying.config({
            mode: 'special',
            focusIn: function (slider) {
              return $_fkcvdu10tje5o2yda.getPart(slider, detail, 'spectrum').map(Keying.focusIn).map($_49qg0cwjje5o2xv6.constant(true));
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
      ])), $_2c8uf410oje5o2yci.get(detail.sliderBehaviours())),
      events: $_9z4gpyy4je5o2y14.derive([
        $_9z4gpyy4je5o2y14.run($_4cir1e118je5o2ygm.changeEvent(), function (slider, simulatedEvent) {
          changeValue(slider, simulatedEvent.event().value());
        }),
        $_9z4gpyy4je5o2y14.runOnAttached(function (slider, simulatedEvent) {
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
  var $_8miu9e11jje5o2yhw = { sketch: sketch$1 };

  var Slider = $_c7e59s10pje5o2yco.composite({
    name: 'Slider',
    configFields: SliderSchema,
    partFields: SliderParts,
    factory: $_8miu9e11jje5o2yhw.sketch,
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
    return $_2abrklzfje5o2y6q.forToolbar(clazz, function () {
      var items = makeItems();
      realm.setContextToolbar([{
          label: clazz + ' group',
          items: items
        }]);
    }, {});
  };
  var $_ijrtm11lje5o2yib = { button: button };

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
      $_2jybvt103je5o2y95.set(thumb.element(), 'background-color', color);
    };
    var onChange = function (slider, thumb, value) {
      var color = getColor(value);
      $_2jybvt103je5o2y95.set(thumb.element(), 'background-color', color);
      spec.onChange(slider, thumb, color);
    };
    return Slider.sketch({
      dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-slider ${prefix}-hue-slider-container"></div>'),
      components: [
        Slider.parts()['left-edge']($_a88x2p113je5o2yfs.spec('<div class="${prefix}-hue-slider-black"></div>')),
        Slider.parts().spectrum({
          dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-slider-gradient-container"></div>'),
          components: [$_a88x2p113je5o2yfs.spec('<div class="${prefix}-slider-gradient"></div>')],
          behaviours: $_e4rr4py2je5o2y0l.derive([Toggling.config({ toggleClass: $_dqvuwxzeje5o2y6o.resolve('thumb-active') })])
        }),
        Slider.parts()['right-edge']($_a88x2p113je5o2yfs.spec('<div class="${prefix}-hue-slider-white"></div>')),
        Slider.parts().thumb({
          dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-slider-thumb"></div>'),
          behaviours: $_e4rr4py2je5o2y0l.derive([Toggling.config({ toggleClass: $_dqvuwxzeje5o2y6o.resolve('thumb-active') })])
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
      sliderBehaviours: $_e4rr4py2je5o2y0l.derive([$_941wfnzdje5o2y6l.orientation(Slider.refresh)])
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
    return $_ijrtm11lje5o2yib.button(realm, 'color', function () {
      return makeItems(spec);
    });
  };
  var $_eknkcp115je5o2yg5 = {
    makeItems: makeItems,
    sketch: sketch$2
  };

  var schema$7 = $_1ui3lpyeje5o2y2u.objOfOnly([
    $_65y30vy7je5o2y1k.strict('getInitialValue'),
    $_65y30vy7je5o2y1k.strict('onChange'),
    $_65y30vy7je5o2y1k.strict('category'),
    $_65y30vy7je5o2y1k.strict('sizes')
  ]);
  var sketch$3 = function (rawSpec) {
    var spec = $_1ui3lpyeje5o2y2u.asRawOrDie('SizeSlider', schema$7, rawSpec);
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
          $_dqvuwxzeje5o2y6o.resolve('slider-' + spec.category + '-size-container'),
          $_dqvuwxzeje5o2y6o.resolve('slider'),
          $_dqvuwxzeje5o2y6o.resolve('slider-size-container')
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
      sliderBehaviours: $_e4rr4py2je5o2y0l.derive([$_941wfnzdje5o2y6l.orientation(Slider.refresh)]),
      components: [
        Slider.parts().spectrum({
          dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-slider-size-container"></div>'),
          components: [$_a88x2p113je5o2yfs.spec('<div class="${prefix}-slider-size-line"></div>')]
        }),
        Slider.parts().thumb({
          dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-slider-thumb"></div>'),
          behaviours: $_e4rr4py2je5o2y0l.derive([Toggling.config({ toggleClass: $_dqvuwxzeje5o2y6o.resolve('thumb-active') })])
        })
      ]
    });
  };
  var $_9aijn11nje5o2yie = { sketch: sketch$3 };

  var ancestor$3 = function (scope, transform, isRoot) {
    var element = scope.dom();
    var stop = $_568ih9wzje5o2xwm.isFunction(isRoot) ? isRoot : $_49qg0cwjje5o2xv6.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_f7rai4xfje5o2xy5.fromDom(element);
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
  var $_4lfwh511pje5o2yit = {
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
    return $_8kvqz0wsje5o2xvo.findIndex(candidates, function (v) {
      return v === size;
    });
  };
  var getRawOrComputed = function (isRoot, rawStart) {
    var optStart = $_5souzyxkje5o2xyh.isElement(rawStart) ? Option.some(rawStart) : $_5i5voox3je5o2xx2.parent(rawStart);
    return optStart.map(function (start) {
      var inline = $_4lfwh511pje5o2yit.closest(start, function (elem) {
        return $_2jybvt103je5o2y95.getRaw(elem, 'font-size');
      }, isRoot);
      return inline.getOrThunk(function () {
        return $_2jybvt103je5o2y95.get(start, 'font-size');
      });
    }).getOr('');
  };
  var getSize = function (editor) {
    var node = editor.selection.getStart();
    var elem = $_f7rai4xfje5o2xy5.fromDom(node);
    var root = $_f7rai4xfje5o2xy5.fromDom(editor.getBody());
    var isRoot = function (e) {
      return $_8iyn3dx9je5o2xxi.eq(root, e);
    };
    var elemSize = getRawOrComputed(isRoot, elem);
    return $_8kvqz0wsje5o2xvo.find(candidates, function (size) {
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
  var $_7ljgig11oje5o2yik = {
    candidates: $_49qg0cwjje5o2xv6.constant(candidates),
    get: get$7,
    apply: apply$1
  };

  var sizes = $_7ljgig11oje5o2yik.candidates();
  var makeSlider$1 = function (spec) {
    return $_9aijn11nje5o2yie.sketch({
      onChange: spec.onChange,
      sizes: sizes,
      category: 'font',
      getInitialValue: spec.getInitialValue
    });
  };
  var makeItems$1 = function (spec) {
    return [
      $_a88x2p113je5o2yfs.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-small-font ${prefix}-icon"></span>'),
      makeSlider$1(spec),
      $_a88x2p113je5o2yfs.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-large-font ${prefix}-icon"></span>')
    ];
  };
  var sketch$4 = function (realm, editor) {
    var spec = {
      onChange: function (value) {
        $_7ljgig11oje5o2yik.apply(editor, value);
      },
      getInitialValue: function () {
        return $_7ljgig11oje5o2yik.get(editor);
      }
    };
    return $_ijrtm11lje5o2yib.button(realm, 'font-size', function () {
      return makeItems$1(spec);
    });
  };
  var $_2i3ho111mje5o2yic = {
    makeItems: makeItems$1,
    sketch: sketch$4
  };

  var record = function (spec) {
    var uid = $_fnkom1xsje5o2xzl.hasKey(spec, 'uid') ? spec.uid : $_xh06h10xje5o2yer.generate('memento');
    var get = function (any) {
      return any.getSystem().getByUid(uid).getOrDie();
    };
    var getOpt = function (any) {
      return any.getSystem().getByUid(uid).fold(Option.none, Option.some);
    };
    var asSpec = function () {
      return $_gc11amwyje5o2xwl.deepMerge(spec, { uid: uid });
    };
    return {
      get: get,
      getOpt: getOpt,
      asSpec: asSpec
    };
  };
  var $_32ltkv11rje5o2yj6 = { record: record };

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
  var $_9eqvch11uje5o2yju = {
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
  var $_45fkhk11vje5o2yjv = {
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
    var f = $_9ndwkgxbje5o2xxp.getOrDie('Blob');
    return new f(parts, properties);
  }

  function FileReader () {
    var f = $_9ndwkgxbje5o2xxp.getOrDie('FileReader');
    return new f();
  }

  function Uint8Array (arr) {
    var f = $_9ndwkgxbje5o2xxp.getOrDie('Uint8Array');
    return new f(arr);
  }

  var requestAnimationFrame = function (callback) {
    var f = $_9ndwkgxbje5o2xxp.getOrDie('requestAnimationFrame');
    f(callback);
  };
  var atob = function (base64) {
    var f = $_9ndwkgxbje5o2xxp.getOrDie('atob');
    return f(base64);
  };
  var $_9as8tw120je5o2yk3 = {
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
    var byteCharacters = $_9as8tw120je5o2yk3.atob(base64);
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
      canvas = $_9eqvch11uje5o2yju.create($_45fkhk11vje5o2yjv.getWidth(image), $_45fkhk11vje5o2yjv.getHeight(image));
      context = $_9eqvch11uje5o2yju.get2dContext(canvas);
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
  function blobToArrayBuffer(blob) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result);
      };
      reader.readAsArrayBuffer(blob);
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
  var $_8924dj11tje5o2yjk = {
    blobToImage: blobToImage,
    imageToBlob: imageToBlob,
    blobToArrayBuffer: blobToArrayBuffer,
    blobToDataUri: blobToDataUri,
    blobToBase64: blobToBase64,
    dataUriToBlobSync: dataUriToBlobSync,
    canvasToBlob: canvasToBlob,
    canvasToDataURL: canvasToDataURL,
    blobToCanvas: blobToCanvas,
    uriToBlob: uriToBlob
  };

  var blobToImage$1 = function (image) {
    return $_8924dj11tje5o2yjk.blobToImage(image);
  };
  var imageToBlob$1 = function (blob) {
    return $_8924dj11tje5o2yjk.imageToBlob(blob);
  };
  var blobToDataUri$1 = function (blob) {
    return $_8924dj11tje5o2yjk.blobToDataUri(blob);
  };
  var blobToBase64$1 = function (blob) {
    return $_8924dj11tje5o2yjk.blobToBase64(blob);
  };
  var dataUriToBlobSync$1 = function (uri) {
    return $_8924dj11tje5o2yjk.dataUriToBlobSync(uri);
  };
  var uriToBlob$1 = function (uri) {
    return Option.from($_8924dj11tje5o2yjk.uriToBlob(uri));
  };
  var $_d5u9fi11sje5o2yjb = {
    blobToImage: blobToImage$1,
    imageToBlob: imageToBlob$1,
    blobToDataUri: blobToDataUri$1,
    blobToBase64: blobToBase64$1,
    dataUriToBlobSync: dataUriToBlobSync$1,
    uriToBlob: uriToBlob$1
  };

  var addImage = function (editor, blob) {
    $_d5u9fi11sje5o2yjb.blobToBase64(blob).then(function (base64) {
      editor.undoManager.transact(function () {
        var cache = editor.editorUpload.blobCache;
        var info = cache.create($_44na3j10rje5o2yd4.generate('mceu'), blob, base64);
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
    var memPicker = $_32ltkv11rje5o2yj6.record({
      dom: pickerDom,
      events: $_9z4gpyy4je5o2y14.derive([
        $_9z4gpyy4je5o2y14.cutter($_2opl28wije5o2xv3.click()),
        $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.change(), function (picker, simulatedEvent) {
          extractBlob(simulatedEvent).each(function (blob) {
            addImage(editor, blob);
          });
        })
      ])
    });
    return Button.sketch({
      dom: $_a88x2p113je5o2yfs.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-image ${prefix}-icon"></span>'),
      components: [memPicker.asSpec()],
      action: function (button) {
        var picker = memPicker.get(button);
        picker.element().dom().click();
      }
    });
  };
  var $_efsab411qje5o2yiy = { sketch: sketch$5 };

  var get$8 = function (element) {
    return element.dom().textContent;
  };
  var set$5 = function (element, value) {
    element.dom().textContent = value;
  };
  var $_cpz349123je5o2ykg = {
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
    var text = $_cpz349123je5o2ykg.get(link);
    var url = $_c4ed9fxrje5o2xz8.get(link, 'href');
    var title = $_c4ed9fxrje5o2xz8.get(link, 'title');
    var target = $_c4ed9fxrje5o2xz8.get(link, 'target');
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
    var prevHref = $_c4ed9fxrje5o2xz8.get(link, 'href');
    var prevText = $_cpz349123je5o2ykg.get(link);
    return prevHref === prevText;
  };
  var getTextToApply = function (link, url, info) {
    return info.text.filter(isNotEmpty).fold(function () {
      return wasSimple(link) ? Option.some(url) : Option.none();
    }, Option.some);
  };
  var unlinkIfRequired = function (editor, info) {
    var activeLink = info.link.bind($_49qg0cwjje5o2xv6.identity);
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
      var activeLink = info.link.bind($_49qg0cwjje5o2xv6.identity);
      activeLink.fold(function () {
        var text = info.text.filter(isNotEmpty).getOr(url);
        editor.insertContent(editor.dom.createHTML('a', attrs, editor.dom.encode(text)));
      }, function (link) {
        var text = getTextToApply(link, url, info);
        $_c4ed9fxrje5o2xz8.setAll(link, attrs);
        text.each(function (newText) {
          $_cpz349123je5o2ykg.set(link, newText);
        });
      });
    });
  };
  var query = function (editor) {
    var start = $_f7rai4xfje5o2xy5.fromDom(editor.selection.getStart());
    return $_gesp01zxje5o2y8p.closest(start, 'a');
  };
  var $_93rv3g122je5o2yk9 = {
    getInfo: getInfo,
    applyInfo: applyInfo,
    query: query
  };

  var platform$1 = $_6ys1d4wkje5o2xv8.detect();
  var preserve$1 = function (f, editor) {
    var rng = editor.selection.getRng();
    f();
    editor.selection.setRng(rng);
  };
  var forAndroid = function (editor, f) {
    var wrapper = platform$1.os.isAndroid() ? preserve$1 : $_49qg0cwjje5o2xv6.apply;
    wrapper(f, editor);
  };
  var $_3z3xju124je5o2ykh = { forAndroid: forAndroid };

  var events$6 = function (name, eventHandlers) {
    var events = $_9z4gpyy4je5o2y14.derive(eventHandlers);
    return $_e4rr4py2je5o2y0l.create({
      fields: [$_65y30vy7je5o2y1k.strict('enabled')],
      name: name,
      active: { events: $_49qg0cwjje5o2xv6.constant(events) }
    });
  };
  var config = function (name, eventHandlers) {
    var me = events$6(name, eventHandlers);
    return {
      key: name,
      value: {
        config: {},
        me: me,
        configAsRaw: $_49qg0cwjje5o2xv6.constant({}),
        initialConfig: {},
        state: $_e4rr4py2je5o2y0l.noState()
      }
    };
  };
  var $_g0brcd126je5o2yky = {
    events: events$6,
    config: config
  };

  var getCurrent = function (component, composeConfig, composeState) {
    return composeConfig.find()(component);
  };
  var $_drvg8v128je5o2yl3 = { getCurrent: getCurrent };

  var ComposeSchema = [$_65y30vy7je5o2y1k.strict('find')];

  var Composing = $_e4rr4py2je5o2y0l.create({
    fields: ComposeSchema,
    name: 'composing',
    apis: $_drvg8v128je5o2yl3
  });

  var factory$1 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: $_gc11amwyje5o2xwl.deepMerge({
        tag: 'div',
        attributes: { role: 'presentation' }
      }, detail.dom()),
      components: detail.components(),
      behaviours: $_2c8uf410oje5o2yci.get(detail.containerBehaviours()),
      events: detail.events(),
      domModification: detail.domModification(),
      eventOrder: detail.eventOrder()
    };
  };
  var Container = $_c7e59s10pje5o2yco.single({
    name: 'Container',
    factory: factory$1,
    configFields: [
      $_65y30vy7je5o2y1k.defaulted('components', []),
      $_2c8uf410oje5o2yci.field('containerBehaviours', []),
      $_65y30vy7je5o2y1k.defaulted('events', {}),
      $_65y30vy7je5o2y1k.defaulted('domModification', {}),
      $_65y30vy7je5o2y1k.defaulted('eventOrder', {})
    ]
  });

  var factory$2 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      behaviours: $_gc11amwyje5o2xwl.deepMerge($_e4rr4py2je5o2y0l.derive([
        me.config({
          store: {
            mode: 'memory',
            initialValue: detail.getInitialValue()()
          }
        }),
        Composing.config({ find: Option.some })
      ]), $_2c8uf410oje5o2yci.get(detail.dataBehaviours())),
      events: $_9z4gpyy4je5o2y14.derive([$_9z4gpyy4je5o2y14.runOnAttached(function (component, simulatedEvent) {
          me.setValue(component, detail.getInitialValue()());
        })])
    };
  };
  var DataField = $_c7e59s10pje5o2yco.single({
    name: 'DataField',
    factory: factory$2,
    configFields: [
      $_65y30vy7je5o2y1k.strict('uid'),
      $_65y30vy7je5o2y1k.strict('dom'),
      $_65y30vy7je5o2y1k.strict('getInitialValue'),
      $_2c8uf410oje5o2yci.field('dataBehaviours', [
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
  var $_3wapuj12eje5o2ylv = {
    set: set$6,
    get: get$9
  };

  var schema$8 = [
    $_65y30vy7je5o2y1k.option('data'),
    $_65y30vy7je5o2y1k.defaulted('inputAttributes', {}),
    $_65y30vy7je5o2y1k.defaulted('inputStyles', {}),
    $_65y30vy7je5o2y1k.defaulted('type', 'input'),
    $_65y30vy7je5o2y1k.defaulted('tag', 'input'),
    $_65y30vy7je5o2y1k.defaulted('inputClasses', []),
    $_2cu7nfz6je5o2y5e.onHandler('onSetValue'),
    $_65y30vy7je5o2y1k.defaulted('styles', {}),
    $_65y30vy7je5o2y1k.option('placeholder'),
    $_65y30vy7je5o2y1k.defaulted('eventOrder', {}),
    $_2c8uf410oje5o2yci.field('inputBehaviours', [
      me,
      Focusing
    ]),
    $_65y30vy7je5o2y1k.defaulted('selectOnFocus', true)
  ];
  var behaviours = function (detail) {
    return $_gc11amwyje5o2xwl.deepMerge($_e4rr4py2je5o2y0l.derive([
      me.config({
        store: {
          mode: 'manual',
          initialValue: detail.data().getOr(undefined),
          getValue: function (input) {
            return $_3wapuj12eje5o2ylv.get(input.element());
          },
          setValue: function (input, data) {
            var current = $_3wapuj12eje5o2ylv.get(input.element());
            if (current !== data) {
              $_3wapuj12eje5o2ylv.set(input.element(), data);
            }
          }
        },
        onSetValue: detail.onSetValue()
      }),
      Focusing.config({
        onFocus: detail.selectOnFocus() === false ? $_49qg0cwjje5o2xv6.noop : function (component) {
          var input = component.element();
          var value = $_3wapuj12eje5o2ylv.get(input);
          input.dom().setSelectionRange(0, value.length);
        }
      })
    ]), $_2c8uf410oje5o2yci.get(detail.inputBehaviours()));
  };
  var dom$2 = function (detail) {
    return {
      tag: detail.tag(),
      attributes: $_gc11amwyje5o2xwl.deepMerge($_fnkom1xsje5o2xzl.wrapAll([{
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
  var $_8igyox12dje5o2ylm = {
    schema: $_49qg0cwjje5o2xv6.constant(schema$8),
    behaviours: behaviours,
    dom: dom$2
  };

  var factory$3 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: $_8igyox12dje5o2ylm.dom(detail),
      components: [],
      behaviours: $_8igyox12dje5o2ylm.behaviours(detail),
      eventOrder: detail.eventOrder()
    };
  };
  var Input = $_c7e59s10pje5o2yco.single({
    name: 'Input',
    configFields: $_8igyox12dje5o2ylm.schema(),
    factory: factory$3
  });

  var exhibit$3 = function (base, tabConfig) {
    return $_9n8qyryhje5o2y35.nu({
      attributes: $_fnkom1xsje5o2xzl.wrapAll([{
          key: tabConfig.tabAttr(),
          value: 'true'
        }])
    });
  };
  var $_23f7o112gje5o2yly = { exhibit: exhibit$3 };

  var TabstopSchema = [$_65y30vy7je5o2y1k.defaulted('tabAttr', 'data-alloy-tabstop')];

  var Tabstopping = $_e4rr4py2je5o2y0l.create({
    fields: TabstopSchema,
    name: 'tabstopping',
    active: $_23f7o112gje5o2yly
  });

  var clearInputBehaviour = 'input-clearing';
  var field$2 = function (name, placeholder) {
    var inputSpec = $_32ltkv11rje5o2yj6.record(Input.sketch({
      placeholder: placeholder,
      onSetValue: function (input, data) {
        $_d7275bwgje5o2xut.emit(input, $_2opl28wije5o2xv3.input());
      },
      inputBehaviours: $_e4rr4py2je5o2y0l.derive([
        Composing.config({ find: Option.some }),
        Tabstopping.config({}),
        Keying.config({ mode: 'execution' })
      ]),
      selectOnFocus: false
    }));
    var buttonSpec = $_32ltkv11rje5o2yj6.record(Button.sketch({
      dom: $_a88x2p113je5o2yfs.dom('<button class="${prefix}-input-container-x ${prefix}-icon-cancel-circle ${prefix}-icon"></button>'),
      action: function (button) {
        var input = inputSpec.get(button);
        me.setValue(input, '');
      }
    }));
    return {
      name: name,
      spec: Container.sketch({
        dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-input-container"></div>'),
        components: [
          inputSpec.asSpec(),
          buttonSpec.asSpec()
        ],
        containerBehaviours: $_e4rr4py2je5o2y0l.derive([
          Toggling.config({ toggleClass: $_dqvuwxzeje5o2y6o.resolve('input-container-empty') }),
          Composing.config({
            find: function (comp) {
              return Option.some(inputSpec.get(comp));
            }
          }),
          $_g0brcd126je5o2yky.config(clearInputBehaviour, [$_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.input(), function (iContainer) {
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
  var $_14uscz125je5o2ykk = {
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
    return $_8kvqz0wsje5o2xvo.contains(nativeDisabled, $_5souzyxkje5o2xyh.name(component.element()));
  };
  var nativeIsDisabled = function (component) {
    return $_c4ed9fxrje5o2xz8.has(component.element(), 'disabled');
  };
  var nativeDisable = function (component) {
    $_c4ed9fxrje5o2xz8.set(component.element(), 'disabled', 'disabled');
  };
  var nativeEnable = function (component) {
    $_c4ed9fxrje5o2xz8.remove(component.element(), 'disabled');
  };
  var ariaIsDisabled = function (component) {
    return $_c4ed9fxrje5o2xz8.get(component.element(), 'aria-disabled') === 'true';
  };
  var ariaDisable = function (component) {
    $_c4ed9fxrje5o2xz8.set(component.element(), 'aria-disabled', 'true');
  };
  var ariaEnable = function (component) {
    $_c4ed9fxrje5o2xz8.set(component.element(), 'aria-disabled', 'false');
  };
  var disable = function (component, disableConfig, disableState) {
    disableConfig.disableClass().each(function (disableClass) {
      $_8ppxz2ynje5o2y3s.add(component.element(), disableClass);
    });
    var f = hasNative(component) ? nativeDisable : ariaDisable;
    f(component);
  };
  var enable = function (component, disableConfig, disableState) {
    disableConfig.disableClass().each(function (disableClass) {
      $_8ppxz2ynje5o2y3s.remove(component.element(), disableClass);
    });
    var f = hasNative(component) ? nativeEnable : ariaEnable;
    f(component);
  };
  var isDisabled = function (component) {
    return hasNative(component) ? nativeIsDisabled(component) : ariaIsDisabled(component);
  };
  var $_bv0zn612lje5o2yms = {
    enable: enable,
    disable: disable,
    isDisabled: isDisabled,
    onLoad: onLoad$5
  };

  var exhibit$4 = function (base, disableConfig, disableState) {
    return $_9n8qyryhje5o2y35.nu({ classes: disableConfig.disabled() ? disableConfig.disableClass().map($_8kvqz0wsje5o2xvo.pure).getOr([]) : [] });
  };
  var events$7 = function (disableConfig, disableState) {
    return $_9z4gpyy4je5o2y14.derive([
      $_9z4gpyy4je5o2y14.abort($_9k0aw9whje5o2xv0.execute(), function (component, simulatedEvent) {
        return $_bv0zn612lje5o2yms.isDisabled(component, disableConfig, disableState);
      }),
      $_f9q9vsy3je5o2y0s.loadEvent(disableConfig, disableState, $_bv0zn612lje5o2yms.onLoad)
    ]);
  };
  var $_r7xpg12kje5o2ymp = {
    exhibit: exhibit$4,
    events: events$7
  };

  var DisableSchema = [
    $_65y30vy7je5o2y1k.defaulted('disabled', false),
    $_65y30vy7je5o2y1k.option('disableClass')
  ];

  var Disabling = $_e4rr4py2je5o2y0l.create({
    fields: DisableSchema,
    name: 'disabling',
    active: $_r7xpg12kje5o2ymp,
    apis: $_bv0zn612lje5o2yms
  });

  var owner$1 = 'form';
  var schema$9 = [$_2c8uf410oje5o2yci.field('formBehaviours', [me])];
  var getPartName = function (name) {
    return '<alloy.field.' + name + '>';
  };
  var sketch$6 = function (fSpec) {
    var parts = function () {
      var record = [];
      var field = function (name, config) {
        record.push(name);
        return $_fkcvdu10tje5o2yda.generateOne(owner$1, getPartName(name), config);
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
    var fieldParts = $_8kvqz0wsje5o2xvo.map(partNames, function (n) {
      return $_1837sx10vje5o2ye4.required({
        name: n,
        pname: getPartName(n)
      });
    });
    return $_2xd6yw10sje5o2yd5.composite(owner$1, schema$9, fieldParts, make, spec);
  };
  var make = function (detail, components, spec) {
    return $_gc11amwyje5o2xwl.deepMerge({
      'debug.sketcher': { 'Form': spec },
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_gc11amwyje5o2xwl.deepMerge($_e4rr4py2je5o2y0l.derive([me.config({
          store: {
            mode: 'manual',
            getValue: function (form) {
              var optPs = $_fkcvdu10tje5o2yda.getAllParts(form, detail);
              return $_67wkp4x0je5o2xwn.map(optPs, function (optPThunk, pName) {
                return optPThunk().bind(Composing.getCurrent).map(me.getValue);
              });
            },
            setValue: function (form, values) {
              $_67wkp4x0je5o2xwn.each(values, function (newValue, key) {
                $_fkcvdu10tje5o2yda.getPart(form, detail, key).each(function (wrapper) {
                  Composing.getCurrent(wrapper).each(function (field) {
                    me.setValue(field, newValue);
                  });
                });
              });
            }
          }
        })]), $_2c8uf410oje5o2yci.get(detail.formBehaviours())),
      apis: {
        getField: function (form, key) {
          return $_fkcvdu10tje5o2yda.getPart(form, detail, key).bind(Composing.getCurrent);
        }
      }
    });
  };
  var $_fkrl6m12nje5o2yn2 = {
    getField: $_7vju5710qje5o2ycz.makeApi(function (apis, component, key) {
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
  var $_6u06mm12oje5o2yne = {
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
  var $_3cczxe12pje5o2ynh = {
    init: init$3,
    move: move,
    complete: complete
  };

  var sketch$7 = function (rawSpec) {
    var navigateEvent = 'navigateEvent';
    var wrapperAdhocEvents = 'serializer-wrapper-events';
    var formAdhocEvents = 'form-events';
    var schema = $_1ui3lpyeje5o2y2u.objOf([
      $_65y30vy7je5o2y1k.strict('fields'),
      $_65y30vy7je5o2y1k.defaulted('maxFieldIndex', rawSpec.fields.length - 1),
      $_65y30vy7je5o2y1k.strict('onExecute'),
      $_65y30vy7je5o2y1k.strict('getInitialValue'),
      $_65y30vy7je5o2y1k.state('state', function () {
        return {
          dialogSwipeState: $_6u06mm12oje5o2yne.value(),
          currentScreen: Cell(0)
        };
      })
    ]);
    var spec = $_1ui3lpyeje5o2y2u.asRawOrDie('SerialisedDialog', schema, rawSpec);
    var navigationButton = function (direction, directionName, enabled) {
      return Button.sketch({
        dom: $_a88x2p113je5o2yfs.dom('<span class="${prefix}-icon-' + directionName + ' ${prefix}-icon"></span>'),
        action: function (button) {
          $_d7275bwgje5o2xut.emitWith(button, navigateEvent, { direction: direction });
        },
        buttonBehaviours: $_e4rr4py2je5o2y0l.derive([Disabling.config({
            disableClass: $_dqvuwxzeje5o2y6o.resolve('toolbar-navigation-disabled'),
            disabled: !enabled
          })])
      });
    };
    var reposition = function (dialog, message) {
      $_gesp01zxje5o2y8p.descendant(dialog.element(), '.' + $_dqvuwxzeje5o2y6o.resolve('serialised-dialog-chain')).each(function (parent) {
        $_2jybvt103je5o2y95.set(parent, 'left', -spec.state.currentScreen.get() * message.width + 'px');
      });
    };
    var navigate = function (dialog, direction) {
      var screens = $_b0xmc2zvje5o2y8l.descendants(dialog.element(), '.' + $_dqvuwxzeje5o2y6o.resolve('serialised-dialog-screen'));
      $_gesp01zxje5o2y8p.descendant(dialog.element(), '.' + $_dqvuwxzeje5o2y6o.resolve('serialised-dialog-chain')).each(function (parent) {
        if (spec.state.currentScreen.get() + direction >= 0 && spec.state.currentScreen.get() + direction < screens.length) {
          $_2jybvt103je5o2y95.getRaw(parent, 'left').each(function (left) {
            var currentLeft = parseInt(left, 10);
            var w = $_bqnful11kje5o2yi9.get(screens[0]);
            $_2jybvt103je5o2y95.set(parent, 'left', currentLeft - direction * w + 'px');
          });
          spec.state.currentScreen.set(spec.state.currentScreen.get() + direction);
        }
      });
    };
    var focusInput = function (dialog) {
      var inputs = $_b0xmc2zvje5o2y8l.descendants(dialog.element(), 'input');
      var optInput = Option.from(inputs[spec.state.currentScreen.get()]);
      optInput.each(function (input) {
        dialog.getSystem().getByDom(input).each(function (inputComp) {
          $_d7275bwgje5o2xut.dispatchFocus(dialog, inputComp.element());
        });
      });
      var dotitems = memDots.get(dialog);
      Highlighting.highlightAt(dotitems, spec.state.currentScreen.get());
    };
    var resetState = function () {
      spec.state.currentScreen.set(0);
      spec.state.dialogSwipeState.clear();
    };
    var memForm = $_32ltkv11rje5o2yj6.record($_fkrl6m12nje5o2yn2.sketch(function (parts) {
      return {
        dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-serialised-dialog"></div>'),
        components: [Container.sketch({
            dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-serialised-dialog-chain" style="left: 0px; position: absolute;"></div>'),
            components: $_8kvqz0wsje5o2xvo.map(spec.fields, function (field, i) {
              return i <= spec.maxFieldIndex ? Container.sketch({
                dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-serialised-dialog-screen"></div>'),
                components: $_8kvqz0wsje5o2xvo.flatten([
                  [navigationButton(-1, 'previous', i > 0)],
                  [parts.field(field.name, field.spec)],
                  [navigationButton(+1, 'next', i < spec.maxFieldIndex)]
                ])
              }) : parts.field(field.name, field.spec);
            })
          })],
        formBehaviours: $_e4rr4py2je5o2y0l.derive([
          $_941wfnzdje5o2y6l.orientation(function (dialog, message) {
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
          $_g0brcd126je5o2yky.config(formAdhocEvents, [
            $_9z4gpyy4je5o2y14.runOnAttached(function (dialog, simulatedEvent) {
              resetState();
              var dotitems = memDots.get(dialog);
              Highlighting.highlightFirst(dotitems);
              spec.getInitialValue(dialog).each(function (v) {
                me.setValue(dialog, v);
              });
            }),
            $_9z4gpyy4je5o2y14.runOnExecute(spec.onExecute),
            $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.transitionend(), function (dialog, simulatedEvent) {
              if (simulatedEvent.event().raw().propertyName === 'left') {
                focusInput(dialog);
              }
            }),
            $_9z4gpyy4je5o2y14.run(navigateEvent, function (dialog, simulatedEvent) {
              var direction = simulatedEvent.event().direction();
              navigate(dialog, direction);
            })
          ])
        ])
      };
    }));
    var memDots = $_32ltkv11rje5o2yj6.record({
      dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-dot-container"></div>'),
      behaviours: $_e4rr4py2je5o2y0l.derive([Highlighting.config({
          highlightClass: $_dqvuwxzeje5o2y6o.resolve('dot-active'),
          itemClass: $_dqvuwxzeje5o2y6o.resolve('dot-item')
        })]),
      components: $_8kvqz0wsje5o2xvo.bind(spec.fields, function (_f, i) {
        return i <= spec.maxFieldIndex ? [$_a88x2p113je5o2yfs.spec('<div class="${prefix}-dot-item ${prefix}-icon-full-dot ${prefix}-icon"></div>')] : [];
      })
    });
    return {
      dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-serializer-wrapper"></div>'),
      components: [
        memForm.asSpec(),
        memDots.asSpec()
      ],
      behaviours: $_e4rr4py2je5o2y0l.derive([
        Keying.config({
          mode: 'special',
          focusIn: function (wrapper) {
            var form = memForm.get(wrapper);
            Keying.focusIn(form);
          }
        }),
        $_g0brcd126je5o2yky.config(wrapperAdhocEvents, [
          $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.touchstart(), function (wrapper, simulatedEvent) {
            spec.state.dialogSwipeState.set($_3cczxe12pje5o2ynh.init(simulatedEvent.event().raw().touches[0].clientX));
          }),
          $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.touchmove(), function (wrapper, simulatedEvent) {
            spec.state.dialogSwipeState.on(function (state) {
              simulatedEvent.event().prevent();
              spec.state.dialogSwipeState.set($_3cczxe12pje5o2ynh.move(state, simulatedEvent.event().raw().touches[0].clientX));
            });
          }),
          $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.touchend(), function (wrapper) {
            spec.state.dialogSwipeState.on(function (state) {
              var dialog = memForm.get(wrapper);
              var direction = -1 * $_3cczxe12pje5o2ynh.complete(state);
              navigate(dialog, direction);
            });
          })
        ])
      ])
    };
  };
  var $_9vj3ve12ije5o2ym3 = { sketch: sketch$7 };

  var getGroups = $_4sqgp8wlje5o2xva.cached(function (realm, editor) {
    return [{
        label: 'the link group',
        items: [$_9vj3ve12ije5o2ym3.sketch({
            fields: [
              $_14uscz125je5o2ykk.field('url', 'Type or paste URL'),
              $_14uscz125je5o2ykk.field('text', 'Link text'),
              $_14uscz125je5o2ykk.field('title', 'Link title'),
              $_14uscz125je5o2ykk.field('target', 'Link target'),
              $_14uscz125je5o2ykk.hidden('link')
            ],
            maxFieldIndex: [
              'url',
              'text',
              'title',
              'target'
            ].length - 1,
            getInitialValue: function () {
              return Option.some($_93rv3g122je5o2yk9.getInfo(editor));
            },
            onExecute: function (dialog) {
              var info = me.getValue(dialog);
              $_93rv3g122je5o2yk9.applyInfo(editor, info);
              realm.restoreToolbar();
              editor.focus();
            }
          })]
      }];
  });
  var sketch$8 = function (realm, editor) {
    return $_2abrklzfje5o2y6q.forToolbarStateAction(editor, 'link', 'link', function () {
      var groups = getGroups(realm, editor);
      realm.setContextToolbar(groups);
      $_3z3xju124je5o2ykh.forAndroid(editor, function () {
        realm.focusToolbar();
      });
      $_93rv3g122je5o2yk9.query(editor).each(function (link) {
        editor.selection.select(link.dom());
      });
    });
  };
  var $_2d1ykm121je5o2yk5 = { sketch: sketch$8 };

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
    var schema = $_8kvqz0wsje5o2xvo.map(all, function (a) {
      return $_65y30vy7je5o2y1k.field(a.name(), a.name(), $_2qdncyy8je5o2y1o.asOption(), $_1ui3lpyeje5o2y2u.objOf([
        $_65y30vy7je5o2y1k.strict('config'),
        $_65y30vy7je5o2y1k.defaulted('state', $_olpdsyjje5o2y3j)
      ]));
    });
    var validated = $_1ui3lpyeje5o2y2u.asStruct('component.behaviours', $_1ui3lpyeje5o2y2u.objOf(schema), spec.behaviours).fold(function (errInfo) {
      throw new Error($_1ui3lpyeje5o2y2u.formatError(errInfo) + '\nComplete spec:\n' + $_anh5fuydje5o2y2s.stringify(spec, null, 2));
    }, $_49qg0cwjje5o2xv6.identity);
    return {
      list: all,
      data: $_67wkp4x0je5o2xwn.map(validated, function (blobOptionThunk) {
        var blobOption = blobOptionThunk();
        return $_49qg0cwjje5o2xv6.constant(blobOption.map(function (blob) {
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
  var $_d09kxw12wje5o2ypd = {
    generateFrom: generateFrom,
    getBehaviours: getBehaviours,
    getData: getData
  };

  var getBehaviours$1 = function (spec) {
    var behaviours = $_fnkom1xsje5o2xzl.readOptFrom(spec, 'behaviours').getOr({});
    var keys = $_8kvqz0wsje5o2xvo.filter($_67wkp4x0je5o2xwn.keys(behaviours), function (k) {
      return behaviours[k] !== undefined;
    });
    return $_8kvqz0wsje5o2xvo.map(keys, function (k) {
      return spec.behaviours[k].me;
    });
  };
  var generateFrom$1 = function (spec, all) {
    return $_d09kxw12wje5o2ypd.generateFrom(spec, all);
  };
  var generate$4 = function (spec) {
    var all = getBehaviours$1(spec);
    return generateFrom$1(spec, all);
  };
  var $_b0uxo312vje5o2yp8 = {
    generate: generate$4,
    generateFrom: generateFrom$1
  };

  var ComponentApi = $_blrj1fylje5o2y3m.exactly([
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

  var SystemApi = $_blrj1fylje5o2y3m.exactly([
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
        throw new Error('The component must be in a context to send: ' + event + '\n' + $_ctmjchxmje5o2xys.element(getComp().element()) + ' is not in context.');
      };
    };
    return SystemApi({
      debugInfo: $_49qg0cwjje5o2xv6.constant('fake'),
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
    $_67wkp4x0je5o2xwn.each(data, function (detail, key) {
      $_67wkp4x0je5o2xwn.each(detail, function (value, indexKey) {
        var chain = $_fnkom1xsje5o2xzl.readOr(indexKey, [])(r);
        r[indexKey] = chain.concat([tuple(key, value)]);
      });
    });
    return r;
  };
  var $_pglhz131je5o2yq4 = { byInnerKey: byInnerKey };

  var behaviourDom = function (name, modification) {
    return {
      name: $_49qg0cwjje5o2xv6.constant(name),
      modification: modification
    };
  };
  var concat = function (chain, aspect) {
    var values = $_8kvqz0wsje5o2xvo.bind(chain, function (c) {
      return c.modification().getOr([]);
    });
    return Result.value($_fnkom1xsje5o2xzl.wrap(aspect, values));
  };
  var onlyOne = function (chain, aspect, order) {
    if (chain.length > 1)
      return Result.error('Multiple behaviours have tried to change DOM "' + aspect + '". The guilty behaviours are: ' + $_anh5fuydje5o2y2s.stringify($_8kvqz0wsje5o2xvo.map(chain, function (b) {
        return b.name();
      })) + '. At this stage, this ' + 'is not supported. Future releases might provide strategies for resolving this.');
    else if (chain.length === 0)
      return Result.value({});
    else
      return Result.value(chain[0].modification().fold(function () {
        return {};
      }, function (m) {
        return $_fnkom1xsje5o2xzl.wrap(aspect, m);
      }));
  };
  var duplicate = function (aspect, k, obj, behaviours) {
    return Result.error('Mulitple behaviours have tried to change the _' + k + '_ "' + aspect + '"' + '. The guilty behaviours are: ' + $_anh5fuydje5o2y2s.stringify($_8kvqz0wsje5o2xvo.bind(behaviours, function (b) {
      return b.modification().getOr({})[k] !== undefined ? [b.name()] : [];
    }), null, 2) + '. This is not currently supported.');
  };
  var safeMerge = function (chain, aspect) {
    var y = $_8kvqz0wsje5o2xvo.foldl(chain, function (acc, c) {
      var obj = c.modification().getOr({});
      return acc.bind(function (accRest) {
        var parts = $_67wkp4x0je5o2xwn.mapToArray(obj, function (v, k) {
          return accRest[k] !== undefined ? duplicate(aspect, k, obj, chain) : Result.value($_fnkom1xsje5o2xzl.wrap(k, v));
        });
        return $_fnkom1xsje5o2xzl.consolidate(parts, accRest);
      });
    }, Result.value({}));
    return y.map(function (yValue) {
      return $_fnkom1xsje5o2xzl.wrap(aspect, yValue);
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
    var behaviourDoms = $_gc11amwyje5o2xwl.deepMerge({}, baseMod);
    $_8kvqz0wsje5o2xvo.each(behaviours, function (behaviour) {
      behaviourDoms[behaviour.name()] = behaviour.exhibit(info, base);
    });
    var byAspect = $_pglhz131je5o2yq4.byInnerKey(behaviourDoms, behaviourDom);
    var usedAspect = $_67wkp4x0je5o2xwn.map(byAspect, function (values, aspect) {
      return $_8kvqz0wsje5o2xvo.bind(values, function (value) {
        return value.modification().fold(function () {
          return [];
        }, function (v) {
          return [value];
        });
      });
    });
    var modifications = $_67wkp4x0je5o2xwn.mapToArray(usedAspect, function (values, aspect) {
      return $_fnkom1xsje5o2xzl.readOptFrom(mergeTypes, aspect).fold(function () {
        return Result.error('Unknown field type: ' + aspect);
      }, function (merger) {
        return merger(values, aspect);
      });
    });
    var consolidated = $_fnkom1xsje5o2xzl.consolidate(modifications, {});
    return consolidated.map($_9n8qyryhje5o2y35.nu);
  };
  var $_2korra130je5o2ypv = { combine: combine$1 };

  var sortKeys = function (label, keyName, array, order) {
    var sliced = array.slice(0);
    try {
      var sorted = sliced.sort(function (a, b) {
        var aKey = a[keyName]();
        var bKey = b[keyName]();
        var aIndex = order.indexOf(aKey);
        var bIndex = order.indexOf(bKey);
        if (aIndex === -1)
          throw new Error('The ordering for ' + label + ' does not have an entry for ' + aKey + '.\nOrder specified: ' + $_anh5fuydje5o2y2s.stringify(order, null, 2));
        if (bIndex === -1)
          throw new Error('The ordering for ' + label + ' does not have an entry for ' + bKey + '.\nOrder specified: ' + $_anh5fuydje5o2y2s.stringify(order, null, 2));
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
  var $_aou5gu133je5o2yqj = { sortKeys: sortKeys };

  var nu$7 = function (handler, purpose) {
    return {
      handler: handler,
      purpose: $_49qg0cwjje5o2xv6.constant(purpose)
    };
  };
  var curryArgs = function (descHandler, extraArgs) {
    return {
      handler: $_49qg0cwjje5o2xv6.curry.apply(undefined, [descHandler.handler].concat(extraArgs)),
      purpose: descHandler.purpose
    };
  };
  var getHandler = function (descHandler) {
    return descHandler.handler;
  };
  var $_6598jr134je5o2yqm = {
    nu: nu$7,
    curryArgs: curryArgs,
    getHandler: getHandler
  };

  var behaviourTuple = function (name, handler) {
    return {
      name: $_49qg0cwjje5o2xv6.constant(name),
      handler: $_49qg0cwjje5o2xv6.constant(handler)
    };
  };
  var nameToHandlers = function (behaviours, info) {
    var r = {};
    $_8kvqz0wsje5o2xvo.each(behaviours, function (behaviour) {
      r[behaviour.name()] = behaviour.handlers(info);
    });
    return r;
  };
  var groupByEvents = function (info, behaviours, base) {
    var behaviourEvents = $_gc11amwyje5o2xwl.deepMerge(base, nameToHandlers(behaviours, info));
    return $_pglhz131je5o2yq4.byInnerKey(behaviourEvents, behaviourTuple);
  };
  var combine$2 = function (info, eventOrder, behaviours, base) {
    var byEventName = groupByEvents(info, behaviours, base);
    return combineGroups(byEventName, eventOrder);
  };
  var assemble = function (rawHandler) {
    var handler = $_9cnuavy6je5o2y1a.read(rawHandler);
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
    return Result.error(['The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' + 'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 'can trigger it are: ' + $_anh5fuydje5o2y2s.stringify($_8kvqz0wsje5o2xvo.map(tuples, function (c) {
        return c.name();
      }), null, 2)]);
  };
  var fuse$1 = function (tuples, eventOrder, eventName) {
    var order = eventOrder[eventName];
    if (!order)
      return missingOrderError(eventName, tuples);
    else
      return $_aou5gu133je5o2yqj.sortKeys('Event: ' + eventName, 'name', tuples, order).map(function (sortedTuples) {
        var handlers = $_8kvqz0wsje5o2xvo.map(sortedTuples, function (tuple) {
          return tuple.handler();
        });
        return $_9cnuavy6je5o2y1a.fuse(handlers);
      });
  };
  var combineGroups = function (byEventName, eventOrder) {
    var r = $_67wkp4x0je5o2xwn.mapToArray(byEventName, function (tuples, eventName) {
      var combined = tuples.length === 1 ? Result.value(tuples[0].handler()) : fuse$1(tuples, eventOrder, eventName);
      return combined.map(function (handler) {
        var assembled = assemble(handler);
        var purpose = tuples.length > 1 ? $_8kvqz0wsje5o2xvo.filter(eventOrder, function (o) {
          return $_8kvqz0wsje5o2xvo.contains(tuples, function (t) {
            return t.name() === o;
          });
        }).join(' > ') : tuples[0].name();
        return $_fnkom1xsje5o2xzl.wrap(eventName, $_6598jr134je5o2yqm.nu(assembled, purpose));
      });
    });
    return $_fnkom1xsje5o2xzl.consolidate(r, {});
  };
  var $_2fuwgp132je5o2yq9 = { combine: combine$2 };

  var toInfo = function (spec) {
    return $_1ui3lpyeje5o2y2u.asStruct('custom.definition', $_1ui3lpyeje5o2y2u.objOfOnly([
      $_65y30vy7je5o2y1k.field('dom', 'dom', $_2qdncyy8je5o2y1o.strict(), $_1ui3lpyeje5o2y2u.objOfOnly([
        $_65y30vy7je5o2y1k.strict('tag'),
        $_65y30vy7je5o2y1k.defaulted('styles', {}),
        $_65y30vy7je5o2y1k.defaulted('classes', []),
        $_65y30vy7je5o2y1k.defaulted('attributes', {}),
        $_65y30vy7je5o2y1k.option('value'),
        $_65y30vy7je5o2y1k.option('innerHtml')
      ])),
      $_65y30vy7je5o2y1k.strict('components'),
      $_65y30vy7je5o2y1k.strict('uid'),
      $_65y30vy7je5o2y1k.defaulted('events', {}),
      $_65y30vy7je5o2y1k.defaulted('apis', $_49qg0cwjje5o2xv6.constant({})),
      $_65y30vy7je5o2y1k.field('eventOrder', 'eventOrder', $_2qdncyy8je5o2y1o.mergeWith({
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
      }), $_1ui3lpyeje5o2y2u.anyValue()),
      $_65y30vy7je5o2y1k.option('domModification'),
      $_2cu7nfz6je5o2y5e.snapshot('originalSpec'),
      $_65y30vy7je5o2y1k.defaulted('debug.sketcher', 'unknown')
    ]), spec);
  };
  var getUid = function (info) {
    return $_fnkom1xsje5o2xzl.wrap($_28turc10yje5o2yf0.idAttr(), info.uid());
  };
  var toDefinition = function (info) {
    var base = {
      tag: info.dom().tag(),
      classes: info.dom().classes(),
      attributes: $_gc11amwyje5o2xwl.deepMerge(getUid(info), info.dom().attributes()),
      styles: info.dom().styles(),
      domChildren: $_8kvqz0wsje5o2xvo.map(info.components(), function (comp) {
        return comp.element();
      })
    };
    return $_b3sd8yyije5o2y3f.nu($_gc11amwyje5o2xwl.deepMerge(base, info.dom().innerHtml().map(function (h) {
      return $_fnkom1xsje5o2xzl.wrap('innerHtml', h);
    }).getOr({}), info.dom().value().map(function (h) {
      return $_fnkom1xsje5o2xzl.wrap('value', h);
    }).getOr({})));
  };
  var toModification = function (info) {
    return info.domModification().fold(function () {
      return $_9n8qyryhje5o2y35.nu({});
    }, $_9n8qyryhje5o2y35.nu);
  };
  var toApis = function (info) {
    return info.apis();
  };
  var toEvents = function (info) {
    return info.events();
  };
  var $_1mivjn135je5o2yqp = {
    toInfo: toInfo,
    toDefinition: toDefinition,
    toModification: toModification,
    toApis: toApis,
    toEvents: toEvents
  };

  var add$3 = function (element, classes) {
    $_8kvqz0wsje5o2xvo.each(classes, function (x) {
      $_8ppxz2ynje5o2y3s.add(element, x);
    });
  };
  var remove$6 = function (element, classes) {
    $_8kvqz0wsje5o2xvo.each(classes, function (x) {
      $_8ppxz2ynje5o2y3s.remove(element, x);
    });
  };
  var toggle$3 = function (element, classes) {
    $_8kvqz0wsje5o2xvo.each(classes, function (x) {
      $_8ppxz2ynje5o2y3s.toggle(element, x);
    });
  };
  var hasAll = function (element, classes) {
    return $_8kvqz0wsje5o2xvo.forall(classes, function (clazz) {
      return $_8ppxz2ynje5o2y3s.has(element, clazz);
    });
  };
  var hasAny = function (element, classes) {
    return $_8kvqz0wsje5o2xvo.exists(classes, function (clazz) {
      return $_8ppxz2ynje5o2y3s.has(element, clazz);
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
    return $_c5aqv9ypje5o2y3v.supports(element) ? getNative(element) : $_c5aqv9ypje5o2y3v.get(element);
  };
  var $_37zbkp137je5o2yrf = {
    add: add$3,
    remove: remove$6,
    toggle: toggle$3,
    hasAll: hasAll,
    hasAny: hasAny,
    get: get$10
  };

  var getChildren = function (definition) {
    if (definition.domChildren().isSome() && definition.defChildren().isSome()) {
      throw new Error('Cannot specify children and child specs! Must be one or the other.\nDef: ' + $_b3sd8yyije5o2y3f.defToStr(definition));
    } else {
      return definition.domChildren().fold(function () {
        var defChildren = definition.defChildren().getOr([]);
        return $_8kvqz0wsje5o2xvo.map(defChildren, renderDef);
      }, function (domChildren) {
        return domChildren;
      });
    }
  };
  var renderToDom = function (definition) {
    var subject = $_f7rai4xfje5o2xy5.fromTag(definition.tag());
    $_c4ed9fxrje5o2xz8.setAll(subject, definition.attributes().getOr({}));
    $_37zbkp137je5o2yrf.add(subject, definition.classes().getOr([]));
    $_2jybvt103je5o2y95.setAll(subject, definition.styles().getOr({}));
    $_1fpq52xoje5o2xyx.set(subject, definition.innerHtml().getOr(''));
    var children = getChildren(definition);
    $_90nfp9xije5o2xyc.append(subject, children);
    definition.value().each(function (value) {
      $_3wapuj12eje5o2ylv.set(subject, value);
    });
    return subject;
  };
  var renderDef = function (spec) {
    var definition = $_b3sd8yyije5o2y3f.nu(spec);
    return renderToDom(definition);
  };
  var $_4no9lq136je5o2yr5 = { renderToDom: renderToDom };

  var build = function (spec) {
    var getMe = function () {
      return me;
    };
    var systemApi = Cell(NoContextApi(getMe));
    var info = $_1ui3lpyeje5o2y2u.getOrDie($_1mivjn135je5o2yqp.toInfo($_gc11amwyje5o2xwl.deepMerge(spec, { behaviours: undefined })));
    var bBlob = $_b0uxo312vje5o2yp8.generate(spec);
    var bList = $_d09kxw12wje5o2ypd.getBehaviours(bBlob);
    var bData = $_d09kxw12wje5o2ypd.getData(bBlob);
    var definition = $_1mivjn135je5o2yqp.toDefinition(info);
    var baseModification = { 'alloy.base.modification': $_1mivjn135je5o2yqp.toModification(info) };
    var modification = $_2korra130je5o2ypv.combine(bData, baseModification, bList, definition).getOrDie();
    var modDefinition = $_9n8qyryhje5o2y35.merge(definition, modification);
    var item = $_4no9lq136je5o2yr5.renderToDom(modDefinition);
    var baseEvents = { 'alloy.base.behaviour': $_1mivjn135je5o2yqp.toEvents(info) };
    var events = $_2fuwgp132je5o2yq9.combine(bData, info.eventOrder(), bList, baseEvents).getOrDie();
    var subcomponents = Cell(info.components());
    var connect = function (newApi) {
      systemApi.set(newApi);
    };
    var disconnect = function () {
      systemApi.set(NoContextApi(getMe));
    };
    var syncComponents = function () {
      var children = $_5i5voox3je5o2xx2.children(item);
      var subs = $_8kvqz0wsje5o2xvo.bind(children, function (child) {
        return systemApi.get().getByDom(child).fold(function () {
          return [];
        }, function (c) {
          return [c];
        });
      });
      subcomponents.set(subs);
    };
    var config = function (behaviour) {
      if (behaviour === $_7vju5710qje5o2ycz.apiConfig())
        return info.apis();
      var b = bData;
      var f = $_568ih9wzje5o2xwm.isFunction(b[behaviour.name()]) ? b[behaviour.name()] : function () {
        throw new Error('Could not find ' + behaviour.name() + ' in ' + $_anh5fuydje5o2y2s.stringify(spec, null, 2));
      };
      return f();
    };
    var hasConfigured = function (behaviour) {
      return $_568ih9wzje5o2xwm.isFunction(bData[behaviour.name()]);
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
      spec: $_49qg0cwjje5o2xv6.constant(spec),
      readState: readState,
      connect: connect,
      disconnect: disconnect,
      element: $_49qg0cwjje5o2xv6.constant(item),
      syncComponents: syncComponents,
      components: subcomponents.get,
      events: $_49qg0cwjje5o2xv6.constant(events)
    });
    return me;
  };
  var $_cdlq5412uje5o2yos = { build: build };

  var isRecursive = function (component, originator, target) {
    return $_8iyn3dx9je5o2xxi.eq(originator, component.element()) && !$_8iyn3dx9je5o2xxi.eq(originator, target);
  };
  var $_3nh8v0138je5o2yrj = {
    events: $_9z4gpyy4je5o2y14.derive([$_9z4gpyy4je5o2y14.can($_9k0aw9whje5o2xv0.focus(), function (component, simulatedEvent) {
        var originator = simulatedEvent.event().originator();
        var target = simulatedEvent.event().target();
        if (isRecursive(component, originator, target)) {
          console.warn($_9k0aw9whje5o2xv0.focus() + ' did not get interpreted by the desired target. ' + '\nOriginator: ' + $_ctmjchxmje5o2xys.element(originator) + '\nTarget: ' + $_ctmjchxmje5o2xys.element(target) + '\nCheck the ' + $_9k0aw9whje5o2xv0.focus() + ' event handlers');
          return false;
        } else {
          return true;
        }
      })])
  };

  var make$1 = function (spec) {
    return spec;
  };
  var $_c5w1cq139je5o2yrm = { make: make$1 };

  var buildSubcomponents = function (spec) {
    var components = $_fnkom1xsje5o2xzl.readOr('components', [])(spec);
    return $_8kvqz0wsje5o2xvo.map(components, build$1);
  };
  var buildFromSpec = function (userSpec) {
    var spec = $_c5w1cq139je5o2yrm.make(userSpec);
    var components = buildSubcomponents(spec);
    var completeSpec = $_gc11amwyje5o2xwl.deepMerge($_3nh8v0138je5o2yrj, spec, $_fnkom1xsje5o2xzl.wrap('components', components));
    return Result.value($_cdlq5412uje5o2yos.build(completeSpec));
  };
  var text = function (textContent) {
    var element = $_f7rai4xfje5o2xy5.fromText(textContent);
    return external({ element: element });
  };
  var external = function (spec) {
    var extSpec = $_1ui3lpyeje5o2y2u.asStructOrDie('external.component', $_1ui3lpyeje5o2y2u.objOfOnly([
      $_65y30vy7je5o2y1k.strict('element'),
      $_65y30vy7je5o2y1k.option('uid')
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
      $_xh06h10xje5o2yer.writeOnly(extSpec.element(), uid);
    });
    var me = ComponentApi({
      getSystem: systemApi.get,
      config: Option.none,
      hasConfigured: $_49qg0cwjje5o2xv6.constant(false),
      connect: connect,
      disconnect: disconnect,
      element: $_49qg0cwjje5o2xv6.constant(extSpec.element()),
      spec: $_49qg0cwjje5o2xv6.constant(spec),
      readState: $_49qg0cwjje5o2xv6.constant('No state'),
      syncComponents: $_49qg0cwjje5o2xv6.noop,
      components: $_49qg0cwjje5o2xv6.constant([]),
      events: $_49qg0cwjje5o2xv6.constant({})
    });
    return $_7vju5710qje5o2ycz.premade(me);
  };
  var build$1 = function (rawUserSpec) {
    return $_7vju5710qje5o2ycz.getPremade(rawUserSpec).fold(function () {
      var userSpecWithUid = $_gc11amwyje5o2xwl.deepMerge({ uid: $_xh06h10xje5o2yer.generate('') }, rawUserSpec);
      return buildFromSpec(userSpecWithUid).getOrDie();
    }, function (prebuilt) {
      return prebuilt;
    });
  };
  var $_cu5wb112tje5o2yoe = {
    build: build$1,
    premade: $_7vju5710qje5o2ycz.premade,
    external: external,
    text: text
  };

  var hoverEvent = 'alloy.item-hover';
  var focusEvent = 'alloy.item-focus';
  var onHover = function (item) {
    if ($_70842eytje5o2y49.search(item.element()).isNone() || Focusing.isFocused(item)) {
      if (!Focusing.isFocused(item))
        Focusing.focus(item);
      $_d7275bwgje5o2xut.emitWith(item, hoverEvent, { item: item });
    }
  };
  var onFocus = function (item) {
    $_d7275bwgje5o2xut.emitWith(item, focusEvent, { item: item });
  };
  var $_gbmzv013dje5o2ys2 = {
    hover: $_49qg0cwjje5o2xv6.constant(hoverEvent),
    focus: $_49qg0cwjje5o2xv6.constant(focusEvent),
    onHover: onHover,
    onFocus: onFocus
  };

  var builder = function (info) {
    return {
      dom: $_gc11amwyje5o2xwl.deepMerge(info.dom(), { attributes: { role: info.toggling().isSome() ? 'menuitemcheckbox' : 'menuitem' } }),
      behaviours: $_gc11amwyje5o2xwl.deepMerge($_e4rr4py2je5o2y0l.derive([
        info.toggling().fold(Toggling.revoke, function (tConfig) {
          return Toggling.config($_gc11amwyje5o2xwl.deepMerge({ aria: { mode: 'checked' } }, tConfig));
        }),
        Focusing.config({
          ignore: info.ignoreFocus(),
          onFocus: function (component) {
            $_gbmzv013dje5o2ys2.onFocus(component);
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
      events: $_9z4gpyy4je5o2y14.derive([
        $_9z4gpyy4je5o2y14.runWithTarget($_9k0aw9whje5o2xv0.tapOrClick(), $_d7275bwgje5o2xut.emitExecute),
        $_9z4gpyy4je5o2y14.cutter($_2opl28wije5o2xv3.mousedown()),
        $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.mouseover(), $_gbmzv013dje5o2ys2.onHover),
        $_9z4gpyy4je5o2y14.run($_9k0aw9whje5o2xv0.focusItem(), Focusing.focus)
      ]),
      components: info.components(),
      domModification: info.domModification()
    };
  };
  var schema$10 = [
    $_65y30vy7je5o2y1k.strict('data'),
    $_65y30vy7je5o2y1k.strict('components'),
    $_65y30vy7je5o2y1k.strict('dom'),
    $_65y30vy7je5o2y1k.option('toggling'),
    $_65y30vy7je5o2y1k.defaulted('itemBehaviours', {}),
    $_65y30vy7je5o2y1k.defaulted('ignoreFocus', false),
    $_65y30vy7je5o2y1k.defaulted('domModification', {}),
    $_2cu7nfz6je5o2y5e.output('builder', builder)
  ];

  var builder$1 = function (detail) {
    return {
      dom: detail.dom(),
      components: detail.components(),
      events: $_9z4gpyy4je5o2y14.derive([$_9z4gpyy4je5o2y14.stopper($_9k0aw9whje5o2xv0.focusItem())])
    };
  };
  var schema$11 = [
    $_65y30vy7je5o2y1k.strict('dom'),
    $_65y30vy7je5o2y1k.strict('components'),
    $_2cu7nfz6je5o2y5e.output('builder', builder$1)
  ];

  var owner$2 = 'item-widget';
  var partTypes = [$_1837sx10vje5o2ye4.required({
      name: 'widget',
      overrides: function (detail) {
        return {
          behaviours: $_e4rr4py2je5o2y0l.derive([me.config({
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
  var $_em9did13gje5o2ysg = {
    owner: $_49qg0cwjje5o2xv6.constant(owner$2),
    parts: $_49qg0cwjje5o2xv6.constant(partTypes)
  };

  var builder$2 = function (info) {
    var subs = $_fkcvdu10tje5o2yda.substitutes($_em9did13gje5o2ysg.owner(), info, $_em9did13gje5o2ysg.parts());
    var components = $_fkcvdu10tje5o2yda.components($_em9did13gje5o2ysg.owner(), info, subs.internals());
    var focusWidget = function (component) {
      return $_fkcvdu10tje5o2yda.getPart(component, info, 'widget').map(function (widget) {
        Keying.focusIn(widget);
        return widget;
      });
    };
    var onHorizontalArrow = function (component, simulatedEvent) {
      return $_2vbmoa108je5o2y9z.inside(simulatedEvent.event().target()) ? Option.none() : function () {
        if (info.autofocus()) {
          simulatedEvent.setSource(component.element());
          return Option.none();
        } else {
          return Option.none();
        }
      }();
    };
    return $_gc11amwyje5o2xwl.deepMerge({
      dom: info.dom(),
      components: components,
      domModification: info.domModification(),
      events: $_9z4gpyy4je5o2y14.derive([
        $_9z4gpyy4je5o2y14.runOnExecute(function (component, simulatedEvent) {
          focusWidget(component).each(function (widget) {
            simulatedEvent.stop();
          });
        }),
        $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.mouseover(), $_gbmzv013dje5o2ys2.onHover),
        $_9z4gpyy4je5o2y14.run($_9k0aw9whje5o2xv0.focusItem(), function (component, simulatedEvent) {
          if (info.autofocus())
            focusWidget(component);
          else
            Focusing.focus(component);
        })
      ]),
      behaviours: $_e4rr4py2je5o2y0l.derive([
        me.config({
          store: {
            mode: 'memory',
            initialValue: info.data()
          }
        }),
        Focusing.config({
          onFocus: function (component) {
            $_gbmzv013dje5o2ys2.onFocus(component);
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
    $_65y30vy7je5o2y1k.strict('uid'),
    $_65y30vy7je5o2y1k.strict('data'),
    $_65y30vy7je5o2y1k.strict('components'),
    $_65y30vy7je5o2y1k.strict('dom'),
    $_65y30vy7je5o2y1k.defaulted('autofocus', false),
    $_65y30vy7je5o2y1k.defaulted('domModification', {}),
    $_fkcvdu10tje5o2yda.defaultUidsSchema($_em9did13gje5o2ysg.parts()),
    $_2cu7nfz6je5o2y5e.output('builder', builder$2)
  ];

  var itemSchema$1 = $_1ui3lpyeje5o2y2u.choose('type', {
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
  var parts = [$_1837sx10vje5o2ye4.group({
      factory: {
        sketch: function (spec) {
          var itemInfo = $_1ui3lpyeje5o2y2u.asStructOrDie('menu.spec item', itemSchema$1, spec);
          return itemInfo.builder()(itemInfo);
        }
      },
      name: 'items',
      unit: 'item',
      defaults: function (detail, u) {
        var fallbackUid = $_xh06h10xje5o2yer.generate('');
        return $_gc11amwyje5o2xwl.deepMerge({ uid: fallbackUid }, u);
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
    $_65y30vy7je5o2y1k.strict('value'),
    $_65y30vy7je5o2y1k.strict('items'),
    $_65y30vy7je5o2y1k.strict('dom'),
    $_65y30vy7je5o2y1k.strict('components'),
    $_65y30vy7je5o2y1k.defaulted('eventOrder', {}),
    $_2c8uf410oje5o2yci.field('menuBehaviours', [
      Highlighting,
      me,
      Composing,
      Keying
    ]),
    $_65y30vy7je5o2y1k.defaultedOf('movement', {
      mode: 'menu',
      moveOnTab: true
    }, $_1ui3lpyeje5o2y2u.choose('mode', {
      grid: [
        $_2cu7nfz6je5o2y5e.initSize(),
        $_2cu7nfz6je5o2y5e.output('config', configureGrid)
      ],
      menu: [
        $_65y30vy7je5o2y1k.defaulted('moveOnTab', true),
        $_2cu7nfz6je5o2y5e.output('config', configureMenu)
      ]
    })),
    $_2cu7nfz6je5o2y5e.itemMarkers(),
    $_65y30vy7je5o2y1k.defaulted('fakeFocus', false),
    $_65y30vy7je5o2y1k.defaulted('focusManager', $_7n6h3zzrje5o2y83.dom()),
    $_2cu7nfz6je5o2y5e.onHandler('onHighlight')
  ];
  var $_gj96g413bje5o2yrp = {
    name: $_49qg0cwjje5o2xv6.constant('Menu'),
    schema: $_49qg0cwjje5o2xv6.constant(schema$13),
    parts: $_49qg0cwjje5o2xv6.constant(parts)
  };

  var focusEvent$1 = 'alloy.menu-focus';
  var $_d8qfvx13ije5o2yst = { focus: $_49qg0cwjje5o2xv6.constant(focusEvent$1) };

  var make$2 = function (detail, components, spec, externals) {
    return $_gc11amwyje5o2xwl.deepMerge({
      dom: $_gc11amwyje5o2xwl.deepMerge(detail.dom(), { attributes: { role: 'menu' } }),
      uid: detail.uid(),
      behaviours: $_gc11amwyje5o2xwl.deepMerge($_e4rr4py2je5o2y0l.derive([
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
        Composing.config({ find: $_49qg0cwjje5o2xv6.identity }),
        Keying.config(detail.movement().config()(detail, detail.movement()))
      ]), $_2c8uf410oje5o2yci.get(detail.menuBehaviours())),
      events: $_9z4gpyy4je5o2y14.derive([
        $_9z4gpyy4je5o2y14.run($_gbmzv013dje5o2ys2.focus(), function (menu, simulatedEvent) {
          var event = simulatedEvent.event();
          menu.getSystem().getByDom(event.target()).each(function (item) {
            Highlighting.highlight(menu, item);
            simulatedEvent.stop();
            $_d7275bwgje5o2xut.emitWith(menu, $_d8qfvx13ije5o2yst.focus(), {
              menu: menu,
              item: item
            });
          });
        }),
        $_9z4gpyy4je5o2y14.run($_gbmzv013dje5o2ys2.hover(), function (menu, simulatedEvent) {
          var item = simulatedEvent.event().item();
          Highlighting.highlight(menu, item);
        })
      ]),
      components: components,
      eventOrder: detail.eventOrder()
    });
  };
  var $_cx69c613hje5o2yso = { make: make$2 };

  var Menu = $_c7e59s10pje5o2yco.composite({
    name: 'Menu',
    configFields: $_gj96g413bje5o2yrp.schema(),
    partFields: $_gj96g413bje5o2yrp.parts(),
    factory: $_cx69c613hje5o2yso.make
  });

  var preserve$2 = function (f, container) {
    var ownerDoc = $_5i5voox3je5o2xx2.owner(container);
    var refocus = $_70842eytje5o2y49.active(ownerDoc).bind(function (focused) {
      var hasFocus = function (elem) {
        return $_8iyn3dx9je5o2xxi.eq(focused, elem);
      };
      return hasFocus(container) ? Option.some(container) : $_18ooz1yvje5o2y4e.descendant(container, hasFocus);
    });
    var result = f(container);
    refocus.each(function (oldFocus) {
      $_70842eytje5o2y49.active(ownerDoc).filter(function (newFocus) {
        return $_8iyn3dx9je5o2xxi.eq(newFocus, oldFocus);
      }).orThunk(function () {
        $_70842eytje5o2y49.focus(oldFocus);
      });
    });
    return result;
  };
  var $_2ayln413mje5o2yt7 = { preserve: preserve$2 };

  var set$7 = function (component, replaceConfig, replaceState, data) {
    $_s45jfx1je5o2xwq.detachChildren(component);
    $_2ayln413mje5o2yt7.preserve(function () {
      var children = $_8kvqz0wsje5o2xvo.map(data, component.getSystem().build);
      $_8kvqz0wsje5o2xvo.each(children, function (l) {
        $_s45jfx1je5o2xwq.attach(component, l);
      });
    }, component.element());
  };
  var insert = function (component, replaceConfig, insertion, childSpec) {
    var child = component.getSystem().build(childSpec);
    $_s45jfx1je5o2xwq.attachWith(component, child, insertion);
  };
  var append$2 = function (component, replaceConfig, replaceState, appendee) {
    insert(component, replaceConfig, $_9je15xx2je5o2xx0.append, appendee);
  };
  var prepend$2 = function (component, replaceConfig, replaceState, prependee) {
    insert(component, replaceConfig, $_9je15xx2je5o2xx0.prepend, prependee);
  };
  var remove$7 = function (component, replaceConfig, replaceState, removee) {
    var children = contents(component, replaceConfig);
    var foundChild = $_8kvqz0wsje5o2xvo.find(children, function (child) {
      return $_8iyn3dx9je5o2xxi.eq(removee.element(), child.element());
    });
    foundChild.each($_s45jfx1je5o2xwq.detach);
  };
  var contents = function (component, replaceConfig) {
    return component.components();
  };
  var $_3bhvpx13lje5o2yt2 = {
    append: append$2,
    prepend: prepend$2,
    remove: remove$7,
    set: set$7,
    contents: contents
  };

  var Replacing = $_e4rr4py2je5o2y0l.create({
    fields: [],
    name: 'replacing',
    apis: $_3bhvpx13lje5o2yt2
  });

  var transpose = function (obj) {
    return $_67wkp4x0je5o2xwn.tupleMap(obj, function (v, k) {
      return {
        k: v,
        v: k
      };
    });
  };
  var trace = function (items, byItem, byMenu, finish) {
    return $_fnkom1xsje5o2xzl.readOptFrom(byMenu, finish).bind(function (triggerItem) {
      return $_fnkom1xsje5o2xzl.readOptFrom(items, triggerItem).bind(function (triggerMenu) {
        var rest = trace(items, byItem, byMenu, triggerMenu);
        return Option.some([triggerMenu].concat(rest));
      });
    }).getOr([]);
  };
  var generate$5 = function (menus, expansions) {
    var items = {};
    $_67wkp4x0je5o2xwn.each(menus, function (menuItems, menu) {
      $_8kvqz0wsje5o2xvo.each(menuItems, function (item) {
        items[item] = menu;
      });
    });
    var byItem = expansions;
    var byMenu = transpose(expansions);
    var menuPaths = $_67wkp4x0je5o2xwn.map(byMenu, function (triggerItem, submenu) {
      return [submenu].concat(trace(items, byItem, byMenu, submenu));
    });
    return $_67wkp4x0je5o2xwn.map(items, function (path) {
      return $_fnkom1xsje5o2xzl.readOptFrom(menuPaths, path).getOr([path]);
    });
  };
  var $_2fpufh13pje5o2yu9 = { generate: generate$5 };

  function LayeredState () {
    var expansions = Cell({});
    var menus = Cell({});
    var paths = Cell({});
    var primary = Cell(Option.none());
    var toItemValues = Cell($_49qg0cwjje5o2xv6.constant([]));
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
      var sPaths = $_2fpufh13pje5o2yu9.generate(menuValues, sExpansions);
      paths.set(sPaths);
    };
    var expand = function (itemValue) {
      return $_fnkom1xsje5o2xzl.readOptFrom(expansions.get(), itemValue).map(function (menu) {
        var current = $_fnkom1xsje5o2xzl.readOptFrom(paths.get(), itemValue).getOr([]);
        return [menu].concat(current);
      });
    };
    var collapse = function (itemValue) {
      return $_fnkom1xsje5o2xzl.readOptFrom(paths.get(), itemValue).bind(function (path) {
        return path.length > 1 ? Option.some(path.slice(1)) : Option.none();
      });
    };
    var refresh = function (itemValue) {
      return $_fnkom1xsje5o2xzl.readOptFrom(paths.get(), itemValue);
    };
    var lookupMenu = function (menuValue) {
      return $_fnkom1xsje5o2xzl.readOptFrom(menus.get(), menuValue);
    };
    var otherMenus = function (path) {
      var menuValues = toItemValues.get()(menus.get());
      return $_8kvqz0wsje5o2xvo.difference($_67wkp4x0je5o2xwn.keys(menuValues), path);
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
      return $_67wkp4x0je5o2xwn.map(menus, function (spec, name) {
        var data = Menu.sketch($_gc11amwyje5o2xwl.deepMerge(spec, {
          value: name,
          items: spec.items,
          markers: $_fnkom1xsje5o2xzl.narrow(rawUiSpec.markers, [
            'item',
            'selectedItem'
          ]),
          fakeFocus: detail.fakeFocus(),
          onHighlight: detail.onHighlight(),
          focusManager: detail.fakeFocus() ? $_7n6h3zzrje5o2y83.highlights() : $_7n6h3zzrje5o2y83.dom()
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
      return $_67wkp4x0je5o2xwn.map(detail.data().menus(), function (data, menuName) {
        return $_8kvqz0wsje5o2xvo.bind(data.items, function (item) {
          return item.type === 'separator' ? [] : [item.data.value];
        });
      });
    };
    var setActiveMenu = function (container, menu) {
      Highlighting.highlight(container, menu);
      Highlighting.getHighlighted(menu).orThunk(function () {
        return Highlighting.getFirst(menu);
      }).each(function (item) {
        $_d7275bwgje5o2xut.dispatch(container, item.element(), $_9k0aw9whje5o2xv0.focusItem());
      });
    };
    var getMenus = function (state, menuValues) {
      return $_dyh85yy0je5o2y0i.cat($_8kvqz0wsje5o2xvo.map(menuValues, state.lookupMenu));
    };
    var updateMenuPath = function (container, state, path) {
      return Option.from(path[0]).bind(state.lookupMenu).map(function (activeMenu) {
        var rest = getMenus(state, path.slice(1));
        $_8kvqz0wsje5o2xvo.each(rest, function (r) {
          $_8ppxz2ynje5o2y3s.add(r.element(), detail.markers().backgroundMenu());
        });
        if (!$_4ff55vxjje5o2xyf.inBody(activeMenu.element())) {
          Replacing.append(container, $_cu5wb112tje5o2yoe.premade(activeMenu));
        }
        $_37zbkp137je5o2yrf.remove(activeMenu.element(), [detail.markers().backgroundMenu()]);
        setActiveMenu(container, activeMenu);
        var others = getMenus(state, state.otherMenus(path));
        $_8kvqz0wsje5o2xvo.each(others, function (o) {
          $_37zbkp137je5o2yrf.remove(o.element(), [detail.markers().backgroundMenu()]);
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
          if (!$_4ff55vxjje5o2xyf.inBody(activeMenu.element())) {
            Replacing.append(container, $_cu5wb112tje5o2yoe.premade(activeMenu));
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
      return $_2vbmoa108je5o2y9z.inside(item.element()) ? Option.none() : expandRight(container, item);
    };
    var onLeft = function (container, item) {
      return $_2vbmoa108je5o2y9z.inside(item.element()) ? Option.none() : collapseLeft(container, item);
    };
    var onEscape = function (container, item) {
      return collapseLeft(container, item).orThunk(function () {
        return detail.onEscape()(container, item);
      });
    };
    var keyOnItem = function (f) {
      return function (container, simulatedEvent) {
        return $_gesp01zxje5o2y8p.closest(simulatedEvent.getSource(), '.' + detail.markers().item()).bind(function (target) {
          return container.getSystem().getByDom(target).bind(function (item) {
            return f(container, item);
          });
        });
      };
    };
    var events = $_9z4gpyy4je5o2y14.derive([
      $_9z4gpyy4je5o2y14.run($_d8qfvx13ije5o2yst.focus(), function (sandbox, simulatedEvent) {
        var menu = simulatedEvent.event().menu();
        Highlighting.highlight(sandbox, menu);
      }),
      $_9z4gpyy4je5o2y14.runOnExecute(function (sandbox, simulatedEvent) {
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
      $_9z4gpyy4je5o2y14.runOnAttached(function (container, simulatedEvent) {
        setup(container).each(function (primary) {
          Replacing.append(container, $_cu5wb112tje5o2yoe.premade(primary));
          if (detail.openImmediately()) {
            setActiveMenu(container, primary);
            detail.onOpenMenu()(container, primary);
          }
        });
      })
    ].concat(detail.navigateOnHover() ? [$_9z4gpyy4je5o2y14.run($_gbmzv013dje5o2ys2.hover(), function (sandbox, simulatedEvent) {
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
      behaviours: $_gc11amwyje5o2xwl.deepMerge($_e4rr4py2je5o2y0l.derive([
        Keying.config({
          mode: 'special',
          onRight: keyOnItem(onRight),
          onLeft: keyOnItem(onLeft),
          onEscape: keyOnItem(onEscape),
          focusIn: function (container, keyInfo) {
            state.getPrimary().each(function (primary) {
              $_d7275bwgje5o2xut.dispatch(container, primary.element(), $_9k0aw9whje5o2xv0.focusItem());
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
      ]), $_2c8uf410oje5o2yci.get(detail.tmenuBehaviours())),
      eventOrder: detail.eventOrder(),
      apis: { collapseMenu: collapseMenuApi },
      events: events
    };
  };
  var $_fluyn513nje5o2ytg = {
    make: make$3,
    collapseItem: $_49qg0cwjje5o2xv6.constant('collapse-item')
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
      menus: $_fnkom1xsje5o2xzl.wrap(name, menu),
      expansions: {}
    };
  };
  var collapseItem = function (text) {
    return {
      value: $_44na3j10rje5o2yd4.generate($_fluyn513nje5o2ytg.collapseItem()),
      text: text
    };
  };
  var TieredMenu = $_c7e59s10pje5o2yco.single({
    name: 'TieredMenu',
    configFields: [
      $_2cu7nfz6je5o2y5e.onStrictKeyboardHandler('onExecute'),
      $_2cu7nfz6je5o2y5e.onStrictKeyboardHandler('onEscape'),
      $_2cu7nfz6je5o2y5e.onStrictHandler('onOpenMenu'),
      $_2cu7nfz6je5o2y5e.onStrictHandler('onOpenSubmenu'),
      $_2cu7nfz6je5o2y5e.onHandler('onCollapseMenu'),
      $_65y30vy7je5o2y1k.defaulted('openImmediately', true),
      $_65y30vy7je5o2y1k.strictObjOf('data', [
        $_65y30vy7je5o2y1k.strict('primary'),
        $_65y30vy7je5o2y1k.strict('menus'),
        $_65y30vy7je5o2y1k.strict('expansions')
      ]),
      $_65y30vy7je5o2y1k.defaulted('fakeFocus', false),
      $_2cu7nfz6je5o2y5e.onHandler('onHighlight'),
      $_2cu7nfz6je5o2y5e.onHandler('onHover'),
      $_2cu7nfz6je5o2y5e.tieredMenuMarkers(),
      $_65y30vy7je5o2y1k.strict('dom'),
      $_65y30vy7je5o2y1k.defaulted('navigateOnHover', true),
      $_65y30vy7je5o2y1k.defaulted('stayInDom', false),
      $_2c8uf410oje5o2yci.field('tmenuBehaviours', [
        Keying,
        Highlighting,
        Composing,
        Replacing
      ]),
      $_65y30vy7je5o2y1k.defaulted('eventOrder', {})
    ],
    apis: {
      collapseMenu: function (apis, tmenu) {
        apis.collapseMenu(tmenu);
      }
    },
    factory: $_fluyn513nje5o2ytg.make,
    extraApis: {
      tieredData: tieredData,
      singleData: singleData,
      collapseItem: collapseItem
    }
  });

  var findRoute = function (component, transConfig, transState, route) {
    return $_fnkom1xsje5o2xzl.readOptFrom(transConfig.routes(), route.start()).map($_49qg0cwjje5o2xv6.apply).bind(function (sConfig) {
      return $_fnkom1xsje5o2xzl.readOptFrom(sConfig, route.destination()).map($_49qg0cwjje5o2xv6.apply);
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
          transition: $_49qg0cwjje5o2xv6.constant(t),
          route: $_49qg0cwjje5o2xv6.constant(r)
        };
      });
    });
  };
  var disableTransition = function (comp, transConfig, transState) {
    getTransition(comp, transConfig, transState).each(function (routeTransition) {
      var t = routeTransition.transition();
      $_8ppxz2ynje5o2y3s.remove(comp.element(), t.transitionClass());
      $_c4ed9fxrje5o2xz8.remove(comp.element(), transConfig.destinationAttr());
    });
  };
  var getNewRoute = function (comp, transConfig, transState, destination) {
    return {
      start: $_49qg0cwjje5o2xv6.constant($_c4ed9fxrje5o2xz8.get(comp.element(), transConfig.stateAttr())),
      destination: $_49qg0cwjje5o2xv6.constant(destination)
    };
  };
  var getCurrentRoute = function (comp, transConfig, transState) {
    var el = comp.element();
    return $_c4ed9fxrje5o2xz8.has(el, transConfig.destinationAttr()) ? Option.some({
      start: $_49qg0cwjje5o2xv6.constant($_c4ed9fxrje5o2xz8.get(comp.element(), transConfig.stateAttr())),
      destination: $_49qg0cwjje5o2xv6.constant($_c4ed9fxrje5o2xz8.get(comp.element(), transConfig.destinationAttr()))
    }) : Option.none();
  };
  var jumpTo = function (comp, transConfig, transState, destination) {
    disableTransition(comp, transConfig, transState);
    if ($_c4ed9fxrje5o2xz8.has(comp.element(), transConfig.stateAttr()) && $_c4ed9fxrje5o2xz8.get(comp.element(), transConfig.stateAttr()) !== destination)
      transConfig.onFinish()(comp, destination);
    $_c4ed9fxrje5o2xz8.set(comp.element(), transConfig.stateAttr(), destination);
  };
  var fasttrack = function (comp, transConfig, transState, destination) {
    if ($_c4ed9fxrje5o2xz8.has(comp.element(), transConfig.destinationAttr())) {
      $_c4ed9fxrje5o2xz8.set(comp.element(), transConfig.stateAttr(), $_c4ed9fxrje5o2xz8.get(comp.element(), transConfig.destinationAttr()));
      $_c4ed9fxrje5o2xz8.remove(comp.element(), transConfig.destinationAttr());
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
      $_8ppxz2ynje5o2y3s.add(comp.element(), t.transitionClass());
      $_c4ed9fxrje5o2xz8.set(comp.element(), transConfig.destinationAttr(), destination);
    });
  };
  var getState = function (comp, transConfig, transState) {
    var e = comp.element();
    return $_c4ed9fxrje5o2xz8.has(e, transConfig.stateAttr()) ? Option.some($_c4ed9fxrje5o2xz8.get(e, transConfig.stateAttr())) : Option.none();
  };
  var $_c03s9h13sje5o2yuu = {
    findRoute: findRoute,
    disableTransition: disableTransition,
    getCurrentRoute: getCurrentRoute,
    jumpTo: jumpTo,
    progressTo: progressTo,
    getState: getState
  };

  var events$8 = function (transConfig, transState) {
    return $_9z4gpyy4je5o2y14.derive([
      $_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.transitionend(), function (component, simulatedEvent) {
        var raw = simulatedEvent.event().raw();
        $_c03s9h13sje5o2yuu.getCurrentRoute(component, transConfig, transState).each(function (route) {
          $_c03s9h13sje5o2yuu.findRoute(component, transConfig, transState, route).each(function (rInfo) {
            rInfo.transition().each(function (rTransition) {
              if (raw.propertyName === rTransition.property()) {
                $_c03s9h13sje5o2yuu.jumpTo(component, transConfig, transState, route.destination());
                transConfig.onTransition()(component, route);
              }
            });
          });
        });
      }),
      $_9z4gpyy4je5o2y14.runOnAttached(function (comp, se) {
        $_c03s9h13sje5o2yuu.jumpTo(comp, transConfig, transState, transConfig.initialState());
      })
    ]);
  };
  var $_3u1eie13rje5o2yus = { events: events$8 };

  var TransitionSchema = [
    $_65y30vy7je5o2y1k.defaulted('destinationAttr', 'data-transitioning-destination'),
    $_65y30vy7je5o2y1k.defaulted('stateAttr', 'data-transitioning-state'),
    $_65y30vy7je5o2y1k.strict('initialState'),
    $_2cu7nfz6je5o2y5e.onHandler('onTransition'),
    $_2cu7nfz6je5o2y5e.onHandler('onFinish'),
    $_65y30vy7je5o2y1k.strictOf('routes', $_1ui3lpyeje5o2y2u.setOf(Result.value, $_1ui3lpyeje5o2y2u.setOf(Result.value, $_1ui3lpyeje5o2y2u.objOfOnly([$_65y30vy7je5o2y1k.optionObjOfOnly('transition', [
        $_65y30vy7je5o2y1k.strict('property'),
        $_65y30vy7je5o2y1k.strict('transitionClass')
      ])]))))
  ];

  var createRoutes = function (routes) {
    var r = {};
    $_67wkp4x0je5o2xwn.each(routes, function (v, k) {
      var waypoints = k.split('<->');
      r[waypoints[0]] = $_fnkom1xsje5o2xzl.wrap(waypoints[1], v);
      r[waypoints[1]] = $_fnkom1xsje5o2xzl.wrap(waypoints[0], v);
    });
    return r;
  };
  var createBistate = function (first, second, transitions) {
    return $_fnkom1xsje5o2xzl.wrapAll([
      {
        key: first,
        value: $_fnkom1xsje5o2xzl.wrap(second, transitions)
      },
      {
        key: second,
        value: $_fnkom1xsje5o2xzl.wrap(first, transitions)
      }
    ]);
  };
  var createTristate = function (first, second, third, transitions) {
    return $_fnkom1xsje5o2xzl.wrapAll([
      {
        key: first,
        value: $_fnkom1xsje5o2xzl.wrapAll([
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
        value: $_fnkom1xsje5o2xzl.wrapAll([
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
        value: $_fnkom1xsje5o2xzl.wrapAll([
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
  var Transitioning = $_e4rr4py2je5o2y0l.create({
    fields: TransitionSchema,
    name: 'transitioning',
    active: $_3u1eie13rje5o2yus,
    apis: $_c03s9h13sje5o2yuu,
    extra: {
      createRoutes: createRoutes,
      createBistate: createBistate,
      createTristate: createTristate
    }
  });

  var scrollable = $_dqvuwxzeje5o2y6o.resolve('scrollable');
  var register = function (element) {
    $_8ppxz2ynje5o2y3s.add(element, scrollable);
  };
  var deregister = function (element) {
    $_8ppxz2ynje5o2y3s.remove(element, scrollable);
  };
  var $_aj0ve213uje5o2yv9 = {
    register: register,
    deregister: deregister,
    scrollable: $_49qg0cwjje5o2xv6.constant(scrollable)
  };

  var getValue$4 = function (item) {
    return $_fnkom1xsje5o2xzl.readOptFrom(item, 'format').getOr(item.title);
  };
  var convert$1 = function (formats, memMenuThunk) {
    var mainMenu = makeMenu('Styles', [].concat($_8kvqz0wsje5o2xvo.map(formats.items, function (k) {
      return makeItem(getValue$4(k), k.title, k.isSelected(), k.getPreview(), $_fnkom1xsje5o2xzl.hasKey(formats.expansions, getValue$4(k)));
    })), memMenuThunk, false);
    var submenus = $_67wkp4x0je5o2xwn.map(formats.menus, function (menuItems, menuName) {
      var items = $_8kvqz0wsje5o2xvo.map(menuItems, function (item) {
        return makeItem(getValue$4(item), item.title, item.isSelected !== undefined ? item.isSelected() : false, item.getPreview !== undefined ? item.getPreview() : '', $_fnkom1xsje5o2xzl.hasKey(formats.expansions, getValue$4(item)));
      });
      return makeMenu(menuName, items, memMenuThunk, true);
    });
    var menus = $_gc11amwyje5o2xwl.deepMerge(submenus, $_fnkom1xsje5o2xzl.wrap('styles', mainMenu));
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
        classes: isMenu ? [$_dqvuwxzeje5o2y6o.resolve('styles-item-is-menu')] : []
      },
      toggling: {
        toggleOnExecute: false,
        toggleClass: $_dqvuwxzeje5o2y6o.resolve('format-matches'),
        selected: selected
      },
      itemBehaviours: $_e4rr4py2je5o2y0l.derive(isMenu ? [] : [$_941wfnzdje5o2y6l.format(value, function (comp, status) {
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
            classes: [$_dqvuwxzeje5o2y6o.resolve('styles-collapser')]
          },
          components: collapsable ? [
            {
              dom: {
                tag: 'span',
                classes: [$_dqvuwxzeje5o2y6o.resolve('styles-collapse-icon')]
              }
            },
            $_cu5wb112tje5o2yoe.text(value)
          ] : [$_cu5wb112tje5o2yoe.text(value)],
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
            classes: [$_dqvuwxzeje5o2y6o.resolve('styles-menu-items-container')]
          },
          components: [Menu.parts().items({})],
          behaviours: $_e4rr4py2je5o2y0l.derive([$_g0brcd126je5o2yky.config('adhoc-scrollable-menu', [
              $_9z4gpyy4je5o2y14.runOnAttached(function (component, simulatedEvent) {
                $_2jybvt103je5o2y95.set(component.element(), 'overflow-y', 'auto');
                $_2jybvt103je5o2y95.set(component.element(), '-webkit-overflow-scrolling', 'touch');
                $_aj0ve213uje5o2yv9.register(component.element());
              }),
              $_9z4gpyy4je5o2y14.runOnDetached(function (component) {
                $_2jybvt103je5o2y95.remove(component.element(), 'overflow-y');
                $_2jybvt103je5o2y95.remove(component.element(), '-webkit-overflow-scrolling');
                $_aj0ve213uje5o2yv9.deregister(component.element());
              })
            ])])
        }
      ],
      items: items,
      menuBehaviours: $_e4rr4py2je5o2y0l.derive([Transitioning.config({
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
    var memMenu = $_32ltkv11rje5o2yj6.record(TieredMenu.sketch({
      dom: {
        tag: 'div',
        classes: [$_dqvuwxzeje5o2y6o.resolve('styles-menu')]
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
        var w = $_bqnful11kje5o2yi9.get(container.element());
        $_bqnful11kje5o2yi9.set(menu.element(), w);
        Transitioning.jumpTo(menu, 'current');
      },
      onOpenSubmenu: function (container, item, submenu) {
        var w = $_bqnful11kje5o2yi9.get(container.element());
        var menu = $_gesp01zxje5o2y8p.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
        var menuComp = container.getSystem().getByDom(menu).getOrDie();
        $_bqnful11kje5o2yi9.set(submenu.element(), w);
        Transitioning.progressTo(menuComp, 'before');
        Transitioning.jumpTo(submenu, 'after');
        Transitioning.progressTo(submenu, 'current');
      },
      onCollapseMenu: function (container, item, menu) {
        var submenu = $_gesp01zxje5o2y8p.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
        var submenuComp = container.getSystem().getByDom(submenu).getOrDie();
        Transitioning.progressTo(submenuComp, 'after');
        Transitioning.progressTo(menu, 'current');
      },
      navigateOnHover: false,
      openImmediately: true,
      data: dataset.tmenu,
      markers: {
        backgroundMenu: $_dqvuwxzeje5o2y6o.resolve('styles-background-menu'),
        menu: $_dqvuwxzeje5o2y6o.resolve('styles-menu'),
        selectedMenu: $_dqvuwxzeje5o2y6o.resolve('styles-selected-menu'),
        item: $_dqvuwxzeje5o2y6o.resolve('styles-item'),
        selectedItem: $_dqvuwxzeje5o2y6o.resolve('styles-selected-item')
      }
    }));
    return memMenu.asSpec();
  };
  var $_ftdrr712sje5o2ynt = { sketch: sketch$9 };

  var getFromExpandingItem = function (item) {
    var newItem = $_gc11amwyje5o2xwl.deepMerge($_fnkom1xsje5o2xzl.exclude(item, ['items']), { menu: true });
    var rest = expand(item.items);
    var newMenus = $_gc11amwyje5o2xwl.deepMerge(rest.menus, $_fnkom1xsje5o2xzl.wrap(item.title, rest.items));
    var newExpansions = $_gc11amwyje5o2xwl.deepMerge(rest.expansions, $_fnkom1xsje5o2xzl.wrap(item.title, item.title));
    return {
      item: newItem,
      menus: newMenus,
      expansions: newExpansions
    };
  };
  var getFromItem = function (item) {
    return $_fnkom1xsje5o2xzl.hasKey(item, 'items') ? getFromExpandingItem(item) : {
      item: item,
      menus: {},
      expansions: {}
    };
  };
  var expand = function (items) {
    return $_8kvqz0wsje5o2xvo.foldr(items, function (acc, item) {
      var newData = getFromItem(item);
      return {
        menus: $_gc11amwyje5o2xwl.deepMerge(acc.menus, newData.menus),
        items: [newData.item].concat(acc.items),
        expansions: $_gc11amwyje5o2xwl.deepMerge(acc.expansions, newData.expansions)
      };
    }, {
      menus: {},
      expansions: {},
      items: []
    });
  };
  var $_14ng9h13vje5o2yvc = { expand: expand };

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
      return $_gc11amwyje5o2xwl.deepMerge(item, {
        isSelected: isSelectedFor(item.format),
        getPreview: getPreview(item.format)
      });
    };
    var enrichMenu = function (item) {
      return $_gc11amwyje5o2xwl.deepMerge(item, {
        isSelected: $_49qg0cwjje5o2xv6.constant(false),
        getPreview: $_49qg0cwjje5o2xv6.constant('')
      });
    };
    var enrichCustom = function (item) {
      var formatName = $_44na3j10rje5o2yd4.generate(item.title);
      var newItem = $_gc11amwyje5o2xwl.deepMerge(item, {
        format: formatName,
        isSelected: isSelectedFor(formatName),
        getPreview: getPreview(formatName)
      });
      editor.formatter.register(formatName, newItem);
      return newItem;
    };
    var formats = $_fnkom1xsje5o2xzl.readOptFrom(settings, 'style_formats').getOr(DefaultStyleFormats);
    var doEnrich = function (items) {
      return $_8kvqz0wsje5o2xvo.map(items, function (item) {
        if ($_fnkom1xsje5o2xzl.hasKey(item, 'items')) {
          var newItems = doEnrich(item.items);
          return $_gc11amwyje5o2xwl.deepMerge(enrichMenu(item), { items: newItems });
        } else if ($_fnkom1xsje5o2xzl.hasKey(item, 'format')) {
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
      return $_8kvqz0wsje5o2xvo.bind(items, function (item) {
        if (item.items !== undefined) {
          var newItems = doPrune(item.items);
          return newItems.length > 0 ? [item] : [];
        } else {
          var keep = $_fnkom1xsje5o2xzl.hasKey(item, 'format') ? editor.formatter.canApply(item.format) : true;
          return keep ? [item] : [];
        }
      });
    };
    var prunedItems = doPrune(formats);
    return $_14ng9h13vje5o2yvc.expand(prunedItems);
  };
  var ui = function (editor, formats, onDone) {
    var pruned = prune(editor, formats);
    return $_ftdrr712sje5o2ynt.sketch({
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
  var $_ecf8jw12qje5o2ynk = {
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
    return $_8kvqz0wsje5o2xvo.bind(toolbar, function (item) {
      return $_568ih9wzje5o2xwm.isArray(item) ? identifyFromArray(item) : extract$1(item);
    });
  };
  var identify = function (settings) {
    var toolbar = settings.toolbar !== undefined ? settings.toolbar : defaults;
    return $_568ih9wzje5o2xwm.isArray(toolbar) ? identifyFromArray(toolbar) : extract$1(toolbar);
  };
  var setup = function (realm, editor) {
    var commandSketch = function (name) {
      return function () {
        return $_2abrklzfje5o2y6q.forToolbarCommand(editor, name);
      };
    };
    var stateCommandSketch = function (name) {
      return function () {
        return $_2abrklzfje5o2y6q.forToolbarStateCommand(editor, name);
      };
    };
    var actionSketch = function (name, query, action) {
      return function () {
        return $_2abrklzfje5o2y6q.forToolbarStateAction(editor, name, query, action);
      };
    };
    var undo = commandSketch('undo');
    var redo = commandSketch('redo');
    var bold = stateCommandSketch('bold');
    var italic = stateCommandSketch('italic');
    var underline = stateCommandSketch('underline');
    var removeformat = commandSketch('removeformat');
    var link = function () {
      return $_2d1ykm121je5o2yk5.sketch(realm, editor);
    };
    var unlink = actionSketch('unlink', 'link', function () {
      editor.execCommand('unlink', null, false);
    });
    var image = function () {
      return $_efsab411qje5o2yiy.sketch(editor);
    };
    var bullist = actionSketch('unordered-list', 'ul', function () {
      editor.execCommand('InsertUnorderedList', null, false);
    });
    var numlist = actionSketch('ordered-list', 'ol', function () {
      editor.execCommand('InsertOrderedList', null, false);
    });
    var fontsizeselect = function () {
      return $_2i3ho111mje5o2yic.sketch(realm, editor);
    };
    var forecolor = function () {
      return $_eknkcp115je5o2yg5.sketch(realm, editor);
    };
    var styleFormats = $_ecf8jw12qje5o2ynk.register(editor, editor.settings);
    var styleFormatsMenu = function () {
      return $_ecf8jw12qje5o2ynk.ui(editor, styleFormats, function () {
        editor.fire('scrollIntoView');
      });
    };
    var styleselect = function () {
      return $_2abrklzfje5o2y6q.forToolbar('style-formats', function (button) {
        editor.fire('toReading');
        realm.dropup().appear(styleFormatsMenu, Toggling.on, button);
      }, $_e4rr4py2je5o2y0l.derive([
        Toggling.config({
          toggleClass: $_dqvuwxzeje5o2y6o.resolve('toolbar-button-selected'),
          toggleOnExecute: false,
          aria: { mode: 'pressed' }
        }),
        Receiving.config({
          channels: $_fnkom1xsje5o2xzl.wrapAll([
            $_941wfnzdje5o2y6l.receive($_m50iiz1je5o2y4r.orientationChanged(), Toggling.off),
            $_941wfnzdje5o2y6l.receive($_m50iiz1je5o2y4r.dropupDismissed(), Toggling.off)
          ])
        })
      ]));
    };
    var feature = function (prereq, sketch) {
      return {
        isSupported: function () {
          return prereq.forall(function (p) {
            return $_fnkom1xsje5o2xzl.hasKey(editor.buttons, p);
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
    return $_8kvqz0wsje5o2xvo.bind(itemNames, function (iName) {
      var r = !$_fnkom1xsje5o2xzl.hasKey(present, iName) && $_fnkom1xsje5o2xzl.hasKey(features, iName) && features[iName].isSupported() ? [features[iName].sketch()] : [];
      present[iName] = true;
      return r;
    });
  };
  var $_2i3ubfz2je5o2y4t = {
    identify: identify,
    setup: setup,
    detect: detect$4
  };

  var mkEvent = function (target, x, y, stop, prevent, kill, raw) {
    return {
      'target': $_49qg0cwjje5o2xv6.constant(target),
      'x': $_49qg0cwjje5o2xv6.constant(x),
      'y': $_49qg0cwjje5o2xv6.constant(y),
      'stop': stop,
      'prevent': prevent,
      'kill': kill,
      'raw': $_49qg0cwjje5o2xv6.constant(raw)
    };
  };
  var handle = function (filter, handler) {
    return function (rawEvent) {
      if (!filter(rawEvent))
        return;
      var target = $_f7rai4xfje5o2xy5.fromDom(rawEvent.target);
      var stop = function () {
        rawEvent.stopPropagation();
      };
      var prevent = function () {
        rawEvent.preventDefault();
      };
      var kill = $_49qg0cwjje5o2xv6.compose(prevent, stop);
      var evt = mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
      handler(evt);
    };
  };
  var binder = function (element, event, filter, handler, useCapture) {
    var wrapped = handle(filter, handler);
    element.dom().addEventListener(event, wrapped, useCapture);
    return { unbind: $_49qg0cwjje5o2xv6.curry(unbind, element, event, wrapped, useCapture) };
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
  var $_bxxc3o13yje5o2yvp = {
    bind: bind$1,
    capture: capture
  };

  var filter$1 = $_49qg0cwjje5o2xv6.constant(true);
  var bind$2 = function (element, event, handler) {
    return $_bxxc3o13yje5o2yvp.bind(element, event, filter$1, handler);
  };
  var capture$1 = function (element, event, handler) {
    return $_bxxc3o13yje5o2yvp.capture(element, event, filter$1, handler);
  };
  var $_etlh9713xje5o2yvn = {
    bind: bind$2,
    capture: capture$1
  };

  var INTERVAL = 50;
  var INSURANCE = 1000 / INTERVAL;
  var get$11 = function (outerWindow) {
    var isPortrait = outerWindow.matchMedia('(orientation: portrait)').matches;
    return { isPortrait: $_49qg0cwjje5o2xv6.constant(isPortrait) };
  };
  var getActualWidth = function (outerWindow) {
    var isIos = $_6ys1d4wkje5o2xv8.detect().os.isiOS();
    var isPortrait = get$11(outerWindow).isPortrait();
    return isIos && !isPortrait ? outerWindow.screen.height : outerWindow.screen.width;
  };
  var onChange = function (outerWindow, listeners) {
    var win = $_f7rai4xfje5o2xy5.fromDom(outerWindow);
    var poller = null;
    var change = function () {
      clearInterval(poller);
      var orientation = get$11(outerWindow);
      listeners.onChange(orientation);
      onAdjustment(function () {
        listeners.onReady(orientation);
      });
    };
    var orientationHandle = $_etlh9713xje5o2yvn.bind(win, 'orientationchange', change);
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
  var $_41wlrp13wje5o2yvh = {
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
      settings.triggerEvent($_9k0aw9whje5o2xv0.longpress(), event);
    }, LONGPRESS_DELAY);
    var handleTouchstart = function (event) {
      getTouch(event).each(function (touch) {
        longpress.cancel();
        var data = {
          x: $_49qg0cwjje5o2xv6.constant(touch.clientX),
          y: $_49qg0cwjje5o2xv6.constant(touch.clientY),
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
        return $_8iyn3dx9je5o2xxi.eq(data.target(), event.target());
      };
      return startData.get().filter(isSame).map(function (data) {
        return settings.triggerEvent($_9k0aw9whje5o2xv0.tap(), event);
      });
    };
    var handlers = $_fnkom1xsje5o2xzl.wrapAll([
      {
        key: $_2opl28wije5o2xv3.touchstart(),
        value: handleTouchstart
      },
      {
        key: $_2opl28wije5o2xv3.touchmove(),
        value: handleTouchmove
      },
      {
        key: $_2opl28wije5o2xv3.touchend(),
        value: handleTouchend
      }
    ]);
    var fireIfReady = function (event, type) {
      return $_fnkom1xsje5o2xzl.readOptFrom(handlers, type).bind(function (handler) {
        return handler(event);
      });
    };
    return { fireIfReady: fireIfReady };
  };
  var $_3hhxdf144je5o2ywr = { monitor: monitor };

  var monitor$1 = function (editorApi) {
    var tapEvent = $_3hhxdf144je5o2ywr.monitor({
      triggerEvent: function (type, evt) {
        editorApi.onTapContent(evt);
      }
    });
    var onTouchend = function () {
      return $_etlh9713xje5o2yvn.bind(editorApi.body(), 'touchend', function (evt) {
        tapEvent.fireIfReady(evt, 'touchend');
      });
    };
    var onTouchmove = function () {
      return $_etlh9713xje5o2yvn.bind(editorApi.body(), 'touchmove', function (evt) {
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
  var $_7eybiq143je5o2ywo = { monitor: monitor$1 };

  var isAndroid6 = $_6ys1d4wkje5o2xv8.detect().os.version.major >= 6;
  var initEvents = function (editorApi, toolstrip, alloy) {
    var tapping = $_7eybiq143je5o2ywo.monitor(editorApi);
    var outerDoc = $_5i5voox3je5o2xx2.owner(toolstrip);
    var isRanged = function (sel) {
      return !$_8iyn3dx9je5o2xxi.eq(sel.start(), sel.finish()) || sel.soffset() !== sel.foffset();
    };
    var hasRangeInUi = function () {
      return $_70842eytje5o2y49.active(outerDoc).filter(function (input) {
        return $_5souzyxkje5o2xyh.name(input) === 'input';
      }).exists(function (input) {
        return input.dom().selectionStart !== input.dom().selectionEnd;
      });
    };
    var updateMargin = function () {
      var rangeInContent = editorApi.doc().dom().hasFocus() && editorApi.getSelection().exists(isRanged);
      alloy.getByDom(toolstrip).each((rangeInContent || hasRangeInUi()) === true ? Toggling.on : Toggling.off);
    };
    var listeners = [
      $_etlh9713xje5o2yvn.bind(editorApi.body(), 'touchstart', function (evt) {
        editorApi.onTouchContent();
        tapping.fireTouchstart(evt);
      }),
      tapping.onTouchmove(),
      tapping.onTouchend(),
      $_etlh9713xje5o2yvn.bind(toolstrip, 'touchstart', function (evt) {
        editorApi.onTouchToolstrip();
      }),
      editorApi.onToReading(function () {
        $_70842eytje5o2y49.blur(editorApi.body());
      }),
      editorApi.onToEditing($_49qg0cwjje5o2xv6.noop),
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
      $_etlh9713xje5o2yvn.bind($_f7rai4xfje5o2xy5.fromDom(editorApi.win()), 'blur', function () {
        alloy.getByDom(toolstrip).each(Toggling.off);
      }),
      $_etlh9713xje5o2yvn.bind(outerDoc, 'select', updateMargin),
      $_etlh9713xje5o2yvn.bind(editorApi.doc(), 'selectionchange', updateMargin)
    ]);
    var destroy = function () {
      $_8kvqz0wsje5o2xvo.each(listeners, function (l) {
        l.unbind();
      });
    };
    return { destroy: destroy };
  };
  var $_82910j142je5o2yw8 = { initEvents: initEvents };

  var safeParse = function (element, attribute) {
    var parsed = parseInt($_c4ed9fxrje5o2xz8.get(element, attribute), 10);
    return isNaN(parsed) ? 0 : parsed;
  };
  var $_fco49p147je5o2yx8 = { safeParse: safeParse };

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
    var browser = $_6ys1d4wkje5o2xv8.detect().browser;
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

  var api$3 = NodeValue($_5souzyxkje5o2xyh.isText, 'text');
  var get$12 = function (element) {
    return api$3.get(element);
  };
  var getOption = function (element) {
    return api$3.getOption(element);
  };
  var set$8 = function (element, value) {
    api$3.set(element, value);
  };
  var $_edet8s14aje5o2yxj = {
    get: get$12,
    getOption: getOption,
    set: set$8
  };

  var getEnd = function (element) {
    return $_5souzyxkje5o2xyh.name(element) === 'img' ? 1 : $_edet8s14aje5o2yxj.getOption(element).fold(function () {
      return $_5i5voox3je5o2xx2.children(element).length;
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
    return $_edet8s14aje5o2yxj.getOption(el).filter(function (text) {
      return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
    }).isSome();
  };
  var elementsWithCursorPosition = [
    'img',
    'br'
  ];
  var isCursorPosition = function (elem) {
    var hasCursorPosition = isTextNodeWithCursorPosition(elem);
    return hasCursorPosition || $_8kvqz0wsje5o2xvo.contains(elementsWithCursorPosition, $_5souzyxkje5o2xyh.name(elem));
  };
  var $_5xm95h149je5o2yxh = {
    getEnd: getEnd,
    isEnd: isEnd,
    isStart: isStart,
    isCursorPosition: isCursorPosition
  };

  var adt$4 = $_9u0u7zxwje5o2xzz.generate([
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
    return situ.fold($_49qg0cwjje5o2xv6.identity, $_49qg0cwjje5o2xv6.identity, $_49qg0cwjje5o2xv6.identity);
  };
  var $_dc9lww14dje5o2yxx = {
    before: adt$4.before,
    on: adt$4.on,
    after: adt$4.after,
    cata: cata,
    getStart: getStart
  };

  var type$1 = $_9u0u7zxwje5o2xzz.generate([
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
  var range$1 = $_2y7sshx4je5o2xxa.immutable('start', 'soffset', 'finish', 'foffset');
  var exactFromRange = function (simRange) {
    return type$1.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
  };
  var getStart$1 = function (selection) {
    return selection.match({
      domRange: function (rng) {
        return $_f7rai4xfje5o2xy5.fromDom(rng.startContainer);
      },
      relative: function (startSitu, finishSitu) {
        return $_dc9lww14dje5o2yxx.getStart(startSitu);
      },
      exact: function (start, soffset, finish, foffset) {
        return start;
      }
    });
  };
  var getWin = function (selection) {
    var start = getStart$1(selection);
    return $_5i5voox3je5o2xx2.defaultView(start);
  };
  var $_a4wsz14cje5o2yxs = {
    domRange: type$1.domRange,
    relative: type$1.relative,
    exact: type$1.exact,
    exactFromRange: exactFromRange,
    range: range$1,
    getWin: getWin
  };

  var makeRange = function (start, soffset, finish, foffset) {
    var doc = $_5i5voox3je5o2xx2.owner(start);
    var rng = doc.dom().createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var commonAncestorContainer = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    return $_f7rai4xfje5o2xy5.fromDom(r.commonAncestorContainer);
  };
  var after$2 = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    var same = $_8iyn3dx9je5o2xxi.eq(start, finish) && soffset === foffset;
    return r.collapsed && !same;
  };
  var $_148wkw14fje5o2yy5 = {
    after: after$2,
    commonAncestorContainer: commonAncestorContainer
  };

  var fromElements = function (elements, scope) {
    var doc = scope || document;
    var fragment = doc.createDocumentFragment();
    $_8kvqz0wsje5o2xvo.each(elements, function (element) {
      fragment.appendChild(element.dom());
    });
    return $_f7rai4xfje5o2xy5.fromDom(fragment);
  };
  var $_fzu4rf14gje5o2yyd = { fromElements: fromElements };

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
    return $_f7rai4xfje5o2xy5.fromDom(fragment);
  };
  var toRect = function (rect) {
    return {
      left: $_49qg0cwjje5o2xv6.constant(rect.left),
      top: $_49qg0cwjje5o2xv6.constant(rect.top),
      right: $_49qg0cwjje5o2xv6.constant(rect.right),
      bottom: $_49qg0cwjje5o2xv6.constant(rect.bottom),
      width: $_49qg0cwjje5o2xv6.constant(rect.width),
      height: $_49qg0cwjje5o2xv6.constant(rect.height)
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
  var $_5vdewj14hje5o2yyf = {
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

  var adt$5 = $_9u0u7zxwje5o2xzz.generate([
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
    return type($_f7rai4xfje5o2xy5.fromDom(range.startContainer), range.startOffset, $_f7rai4xfje5o2xy5.fromDom(range.endContainer), range.endOffset);
  };
  var getRanges = function (win, selection) {
    return selection.match({
      domRange: function (rng) {
        return {
          ltr: $_49qg0cwjje5o2xv6.constant(rng),
          rtl: Option.none
        };
      },
      relative: function (startSitu, finishSitu) {
        return {
          ltr: $_4sqgp8wlje5o2xva.cached(function () {
            return $_5vdewj14hje5o2yyf.relativeToNative(win, startSitu, finishSitu);
          }),
          rtl: $_4sqgp8wlje5o2xva.cached(function () {
            return Option.some($_5vdewj14hje5o2yyf.relativeToNative(win, finishSitu, startSitu));
          })
        };
      },
      exact: function (start, soffset, finish, foffset) {
        return {
          ltr: $_4sqgp8wlje5o2xva.cached(function () {
            return $_5vdewj14hje5o2yyf.exactToNative(win, start, soffset, finish, foffset);
          }),
          rtl: $_4sqgp8wlje5o2xva.cached(function () {
            return Option.some($_5vdewj14hje5o2yyf.exactToNative(win, finish, foffset, start, soffset));
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
        return adt$5.rtl($_f7rai4xfje5o2xy5.fromDom(rev.endContainer), rev.endOffset, $_f7rai4xfje5o2xy5.fromDom(rev.startContainer), rev.startOffset);
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
  var $_1rg6l414ije5o2yyl = {
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
  var $_df6anw14lje5o2yyz = {
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
    var length = $_edet8s14aje5o2yxj.get(textnode).length;
    var offset = $_df6anw14lje5o2yyz.searchForPoint(rectForOffset, x, y, rect.right, length);
    return rangeForOffset(offset);
  };
  var locate$1 = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rects = r.getClientRects();
    var foundRect = $_dyh85yy0je5o2y0i.findMap(rects, function (rect) {
      return $_df6anw14lje5o2yyz.inRect(rect, x, y) ? Option.some(rect) : Option.none();
    });
    return foundRect.map(function (rect) {
      return locateOffset(doc, node, x, y, rect);
    });
  };
  var $_48irqp14mje5o2yz0 = { locate: locate$1 };

  var searchInChildren = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    var nodes = $_5i5voox3je5o2xx2.children(node);
    return $_dyh85yy0je5o2y0i.findMap(nodes, function (n) {
      r.selectNode(n.dom());
      return $_df6anw14lje5o2yyz.inRect(r.getBoundingClientRect(), x, y) ? locateNode(doc, n, x, y) : Option.none();
    });
  };
  var locateNode = function (doc, node, x, y) {
    var locator = $_5souzyxkje5o2xyh.isText(node) ? $_48irqp14mje5o2yz0.locate : searchInChildren;
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
  var $_s8hye14kje5o2yyv = { locate: locate$2 };

  var first$3 = function (element) {
    return $_18ooz1yvje5o2y4e.descendant(element, $_5xm95h149je5o2yxh.isCursorPosition);
  };
  var last$2 = function (element) {
    return descendantRtl(element, $_5xm95h149je5o2yxh.isCursorPosition);
  };
  var descendantRtl = function (scope, predicate) {
    var descend = function (element) {
      var children = $_5i5voox3je5o2xx2.children(element);
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
  var $_ap0s2i14oje5o2yz7 = {
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
    var f = collapseDirection === COLLAPSE_TO_LEFT ? $_ap0s2i14oje5o2yz7.first : $_ap0s2i14oje5o2yz7.last;
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
    var f = $_5i5voox3je5o2xx2.children(node).length === 0 ? locateInEmpty : locateInElement;
    return f(doc, node, x);
  };
  var $_eb849614nje5o2yz4 = { search: search$1 };

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
    return $_s8hye14kje5o2yyv.locate(doc, node, boundedX, boundedY);
  };
  var searchFromPoint = function (doc, x, y) {
    return $_f7rai4xfje5o2xy5.fromPoint(doc, x, y).bind(function (elem) {
      var fallback = function () {
        return $_eb849614nje5o2yz4.search(doc, elem, x);
      };
      return $_5i5voox3je5o2xx2.children(elem).length === 0 ? fallback() : searchTextNodes(doc, elem, x, y).orThunk(fallback);
    });
  };
  var availableSearch = document.caretPositionFromPoint ? caretPositionFromPoint : document.caretRangeFromPoint ? caretRangeFromPoint : searchFromPoint;
  var fromPoint$1 = function (win, x, y) {
    var doc = $_f7rai4xfje5o2xy5.fromDom(win.document);
    return availableSearch(doc, x, y).map(function (rng) {
      return $_a4wsz14cje5o2yxs.range($_f7rai4xfje5o2xy5.fromDom(rng.startContainer), rng.startOffset, $_f7rai4xfje5o2xy5.fromDom(rng.endContainer), rng.endOffset);
    });
  };
  var $_fw35oa14jje5o2yys = { fromPoint: fromPoint$1 };

  var withinContainer = function (win, ancestor, outerRange, selector) {
    var innerRange = $_5vdewj14hje5o2yyf.create(win);
    var self = $_463sqkxeje5o2xxt.is(ancestor, selector) ? [ancestor] : [];
    var elements = self.concat($_b0xmc2zvje5o2y8l.descendants(ancestor, selector));
    return $_8kvqz0wsje5o2xvo.filter(elements, function (elem) {
      $_5vdewj14hje5o2yyf.selectNodeContentsUsing(innerRange, elem);
      return $_5vdewj14hje5o2yyf.isWithin(outerRange, innerRange);
    });
  };
  var find$4 = function (win, selection, selector) {
    var outerRange = $_1rg6l414ije5o2yyl.asLtrRange(win, selection);
    var ancestor = $_f7rai4xfje5o2xy5.fromDom(outerRange.commonAncestorContainer);
    return $_5souzyxkje5o2xyh.isElement(ancestor) ? withinContainer(win, ancestor, outerRange, selector) : [];
  };
  var $_74jrph14pje5o2yz9 = { find: find$4 };

  var beforeSpecial = function (element, offset) {
    var name = $_5souzyxkje5o2xyh.name(element);
    if ('input' === name)
      return $_dc9lww14dje5o2yxx.after(element);
    else if (!$_8kvqz0wsje5o2xvo.contains([
        'br',
        'img'
      ], name))
      return $_dc9lww14dje5o2yxx.on(element, offset);
    else
      return offset === 0 ? $_dc9lww14dje5o2yxx.before(element) : $_dc9lww14dje5o2yxx.after(element);
  };
  var preprocessRelative = function (startSitu, finishSitu) {
    var start = startSitu.fold($_dc9lww14dje5o2yxx.before, beforeSpecial, $_dc9lww14dje5o2yxx.after);
    var finish = finishSitu.fold($_dc9lww14dje5o2yxx.before, beforeSpecial, $_dc9lww14dje5o2yxx.after);
    return $_a4wsz14cje5o2yxs.relative(start, finish);
  };
  var preprocessExact = function (start, soffset, finish, foffset) {
    var startSitu = beforeSpecial(start, soffset);
    var finishSitu = beforeSpecial(finish, foffset);
    return $_a4wsz14cje5o2yxs.relative(startSitu, finishSitu);
  };
  var preprocess = function (selection) {
    return selection.match({
      domRange: function (rng) {
        var start = $_f7rai4xfje5o2xy5.fromDom(rng.startContainer);
        var finish = $_f7rai4xfje5o2xy5.fromDom(rng.endContainer);
        return preprocessExact(start, rng.startOffset, finish, rng.endOffset);
      },
      relative: preprocessRelative,
      exact: preprocessExact
    });
  };
  var $_46wu8014qje5o2yzd = {
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
    var rng = $_5vdewj14hje5o2yyf.exactToNative(win, start, soffset, finish, foffset);
    doSetNativeRange(win, rng);
  };
  var findWithin = function (win, selection, selector) {
    return $_74jrph14pje5o2yz9.find(win, selection, selector);
  };
  var setRangeFromRelative = function (win, relative) {
    return $_1rg6l414ije5o2yyl.diagnose(win, relative).match({
      ltr: function (start, soffset, finish, foffset) {
        doSetRange(win, start, soffset, finish, foffset);
      },
      rtl: function (start, soffset, finish, foffset) {
        var selection = win.getSelection();
        if (selection.setBaseAndExtent) {
          selection.setBaseAndExtent(start.dom(), soffset, finish.dom(), foffset);
        } else if (selection.extend) {
          selection.collapse(start.dom(), soffset);
          selection.extend(finish.dom(), foffset);
        } else {
          doSetRange(win, finish, foffset, start, soffset);
        }
      }
    });
  };
  var setExact = function (win, start, soffset, finish, foffset) {
    var relative = $_46wu8014qje5o2yzd.preprocessExact(start, soffset, finish, foffset);
    setRangeFromRelative(win, relative);
  };
  var setRelative = function (win, startSitu, finishSitu) {
    var relative = $_46wu8014qje5o2yzd.preprocessRelative(startSitu, finishSitu);
    setRangeFromRelative(win, relative);
  };
  var toNative = function (selection) {
    var win = $_a4wsz14cje5o2yxs.getWin(selection).dom();
    var getDomRange = function (start, soffset, finish, foffset) {
      return $_5vdewj14hje5o2yyf.exactToNative(win, start, soffset, finish, foffset);
    };
    var filtered = $_46wu8014qje5o2yzd.preprocess(selection);
    return $_1rg6l414ije5o2yyl.diagnose(win, filtered).match({
      ltr: getDomRange,
      rtl: getDomRange
    });
  };
  var readRange = function (selection) {
    if (selection.rangeCount > 0) {
      var firstRng = selection.getRangeAt(0);
      var lastRng = selection.getRangeAt(selection.rangeCount - 1);
      return Option.some($_a4wsz14cje5o2yxs.range($_f7rai4xfje5o2xy5.fromDom(firstRng.startContainer), firstRng.startOffset, $_f7rai4xfje5o2xy5.fromDom(lastRng.endContainer), lastRng.endOffset));
    } else {
      return Option.none();
    }
  };
  var doGetExact = function (selection) {
    var anchorNode = $_f7rai4xfje5o2xy5.fromDom(selection.anchorNode);
    var focusNode = $_f7rai4xfje5o2xy5.fromDom(selection.focusNode);
    return $_148wkw14fje5o2yy5.after(anchorNode, selection.anchorOffset, focusNode, selection.focusOffset) ? Option.some($_a4wsz14cje5o2yxs.range($_f7rai4xfje5o2xy5.fromDom(selection.anchorNode), selection.anchorOffset, $_f7rai4xfje5o2xy5.fromDom(selection.focusNode), selection.focusOffset)) : readRange(selection);
  };
  var setToElement = function (win, element) {
    var rng = $_5vdewj14hje5o2yyf.selectNodeContents(win, element);
    doSetNativeRange(win, rng);
  };
  var forElement = function (win, element) {
    var rng = $_5vdewj14hje5o2yyf.selectNodeContents(win, element);
    return $_a4wsz14cje5o2yxs.range($_f7rai4xfje5o2xy5.fromDom(rng.startContainer), rng.startOffset, $_f7rai4xfje5o2xy5.fromDom(rng.endContainer), rng.endOffset);
  };
  var getExact = function (win) {
    var selection = win.getSelection();
    return selection.rangeCount > 0 ? doGetExact(selection) : Option.none();
  };
  var get$13 = function (win) {
    return getExact(win).map(function (range) {
      return $_a4wsz14cje5o2yxs.exact(range.start(), range.soffset(), range.finish(), range.foffset());
    });
  };
  var getFirstRect$1 = function (win, selection) {
    var rng = $_1rg6l414ije5o2yyl.asLtrRange(win, selection);
    return $_5vdewj14hje5o2yyf.getFirstRect(rng);
  };
  var getBounds$1 = function (win, selection) {
    var rng = $_1rg6l414ije5o2yyl.asLtrRange(win, selection);
    return $_5vdewj14hje5o2yyf.getBounds(rng);
  };
  var getAtPoint = function (win, x, y) {
    return $_fw35oa14jje5o2yys.fromPoint(win, x, y);
  };
  var getAsString = function (win, selection) {
    var rng = $_1rg6l414ije5o2yyl.asLtrRange(win, selection);
    return $_5vdewj14hje5o2yyf.toString(rng);
  };
  var clear$1 = function (win) {
    var selection = win.getSelection();
    selection.removeAllRanges();
  };
  var clone$3 = function (win, selection) {
    var rng = $_1rg6l414ije5o2yyl.asLtrRange(win, selection);
    return $_5vdewj14hje5o2yyf.cloneFragment(rng);
  };
  var replace = function (win, selection, elements) {
    var rng = $_1rg6l414ije5o2yyl.asLtrRange(win, selection);
    var fragment = $_fzu4rf14gje5o2yyd.fromElements(elements, win.document);
    $_5vdewj14hje5o2yyf.replaceWith(rng, fragment);
  };
  var deleteAt = function (win, selection) {
    var rng = $_1rg6l414ije5o2yyl.asLtrRange(win, selection);
    $_5vdewj14hje5o2yyf.deleteContents(rng);
  };
  var isCollapsed = function (start, soffset, finish, foffset) {
    return $_8iyn3dx9je5o2xxi.eq(start, finish) && soffset === foffset;
  };
  var $_cog17n14eje5o2yy0 = {
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
      width: $_49qg0cwjje5o2xv6.constant(COLLAPSED_WIDTH),
      height: rect.height
    };
  };
  var toRect$1 = function (rawRect) {
    return {
      left: $_49qg0cwjje5o2xv6.constant(rawRect.left),
      top: $_49qg0cwjje5o2xv6.constant(rawRect.top),
      right: $_49qg0cwjje5o2xv6.constant(rawRect.right),
      bottom: $_49qg0cwjje5o2xv6.constant(rawRect.bottom),
      width: $_49qg0cwjje5o2xv6.constant(rawRect.width),
      height: $_49qg0cwjje5o2xv6.constant(rawRect.height)
    };
  };
  var getRectsFromRange = function (range) {
    if (!range.collapsed) {
      return $_8kvqz0wsje5o2xvo.map(range.getClientRects(), toRect$1);
    } else {
      var start_1 = $_f7rai4xfje5o2xy5.fromDom(range.startContainer);
      return $_5i5voox3je5o2xx2.parent(start_1).bind(function (parent) {
        var selection = $_a4wsz14cje5o2yxs.exact(start_1, range.startOffset, parent, $_5xm95h149je5o2yxh.getEnd(parent));
        var optRect = $_cog17n14eje5o2yy0.getFirstRect(range.startContainer.ownerDocument.defaultView, selection);
        return optRect.map(collapsedRect).map($_8kvqz0wsje5o2xvo.pure);
      }).getOr([]);
    }
  };
  var getRectangles = function (cWin) {
    var sel = cWin.getSelection();
    return sel !== undefined && sel.rangeCount > 0 ? getRectsFromRange(sel.getRangeAt(0)) : [];
  };
  var $_5d2yog148je5o2yxa = { getRectangles: getRectangles };

  var autocompleteHack = function () {
    return function (f) {
      setTimeout(function () {
        f();
      }, 0);
    };
  };
  var resume = function (cWin) {
    cWin.focus();
    var iBody = $_f7rai4xfje5o2xy5.fromDom(cWin.document.body);
    var inInput = $_70842eytje5o2y49.active().exists(function (elem) {
      return $_8kvqz0wsje5o2xvo.contains([
        'input',
        'textarea'
      ], $_5souzyxkje5o2xyh.name(elem));
    });
    var transaction = inInput ? autocompleteHack() : $_49qg0cwjje5o2xv6.apply;
    transaction(function () {
      $_70842eytje5o2y49.active().each($_70842eytje5o2y49.blur);
      $_70842eytje5o2y49.focus(iBody);
    });
  };
  var $_bkvf9x14rje5o2yzg = { resume: resume };

  var EXTRA_SPACING = 50;
  var data = 'data-' + $_dqvuwxzeje5o2y6o.resolve('last-outer-height');
  var setLastHeight = function (cBody, value) {
    $_c4ed9fxrje5o2xz8.set(cBody, data, value);
  };
  var getLastHeight = function (cBody) {
    return $_fco49p147je5o2yx8.safeParse(cBody, data);
  };
  var getBoundsFrom = function (rect) {
    return {
      top: $_49qg0cwjje5o2xv6.constant(rect.top()),
      bottom: $_49qg0cwjje5o2xv6.constant(rect.top() + rect.height())
    };
  };
  var getBounds$2 = function (cWin) {
    var rects = $_5d2yog148je5o2yxa.getRectangles(cWin);
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
    var cBody = $_f7rai4xfje5o2xy5.fromDom(cWin.document.body);
    var toEditing = function () {
      $_bkvf9x14rje5o2yzg.resume(cWin);
    };
    var onResize = $_etlh9713xje5o2yvn.bind($_f7rai4xfje5o2xy5.fromDom(outerWindow), 'resize', function () {
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
  var $_5qhrv8146je5o2yx1 = { setup: setup$1 };

  var getBodyFromFrame = function (frame) {
    return Option.some($_f7rai4xfje5o2xy5.fromDom(frame.dom().contentWindow.document.body));
  };
  var getDocFromFrame = function (frame) {
    return Option.some($_f7rai4xfje5o2xy5.fromDom(frame.dom().contentWindow.document));
  };
  var getWinFromFrame = function (frame) {
    return Option.from(frame.dom().contentWindow);
  };
  var getSelectionFromFrame = function (frame) {
    var optWin = getWinFromFrame(frame);
    return optWin.bind($_cog17n14eje5o2yy0.getExact);
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
        return $_etlh9713xje5o2yvn.bind(doc, type, handler);
      };
    });
  };
  var toRect$2 = function (rect) {
    return {
      left: $_49qg0cwjje5o2xv6.constant(rect.left),
      top: $_49qg0cwjje5o2xv6.constant(rect.top),
      right: $_49qg0cwjje5o2xv6.constant(rect.right),
      bottom: $_49qg0cwjje5o2xv6.constant(rect.bottom),
      width: $_49qg0cwjje5o2xv6.constant(rect.width),
      height: $_49qg0cwjje5o2xv6.constant(rect.height)
    };
  };
  var getActiveApi = function (editor) {
    var frame = getFrame(editor);
    var tryFallbackBox = function (win) {
      var isCollapsed = function (sel) {
        return $_8iyn3dx9je5o2xxi.eq(sel.start(), sel.finish()) && sel.soffset() === sel.foffset();
      };
      var toStartRect = function (sel) {
        var rect = sel.start().dom().getBoundingClientRect();
        return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect$2) : Option.none();
      };
      return $_cog17n14eje5o2yy0.getExact(win).filter(isCollapsed).bind(toStartRect);
    };
    return getBodyFromFrame(frame).bind(function (body) {
      return getDocFromFrame(frame).bind(function (doc) {
        return getWinFromFrame(frame).map(function (win) {
          var html = $_f7rai4xfje5o2xy5.fromDom(doc.dom().documentElement);
          var getCursorBox = editor.getCursorBox.getOrThunk(function () {
            return function () {
              return $_cog17n14eje5o2yy0.get(win).bind(function (sel) {
                return $_cog17n14eje5o2yy0.getFirstRect(win, sel).orThunk(function () {
                  return tryFallbackBox(win);
                });
              });
            };
          });
          var setSelection = editor.setSelection.getOrThunk(function () {
            return function (start, soffset, finish, foffset) {
              $_cog17n14eje5o2yy0.setExact(win, start, soffset, finish, foffset);
            };
          });
          var clearSelection = editor.clearSelection.getOrThunk(function () {
            return function () {
              $_cog17n14eje5o2yy0.clear(win);
            };
          });
          return {
            body: $_49qg0cwjje5o2xv6.constant(body),
            doc: $_49qg0cwjje5o2xv6.constant(doc),
            win: $_49qg0cwjje5o2xv6.constant(win),
            html: $_49qg0cwjje5o2xv6.constant(html),
            getSelection: $_49qg0cwjje5o2xv6.curry(getSelectionFromFrame, frame),
            setSelection: setSelection,
            clearSelection: clearSelection,
            frame: $_49qg0cwjje5o2xv6.constant(frame),
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
  var $_amy3p214sje5o2yzn = {
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
  var isAndroid = $_6ys1d4wkje5o2xv8.detect().os.isAndroid();
  var matchColor = function (editorBody) {
    var color = $_2jybvt103je5o2y95.get(editorBody, 'background-color');
    return color !== undefined && color !== '' ? 'background-color:' + color + '!important' : bgFallback;
  };
  var clobberStyles = function (container, editorBody) {
    var gatherSibilings = function (element) {
      var siblings = $_b0xmc2zvje5o2y8l.siblings(element, '*');
      return siblings;
    };
    var clobber = function (clobberStyle) {
      return function (element) {
        var styles = $_c4ed9fxrje5o2xz8.get(element, 'style');
        var backup = styles === undefined ? 'no-styles' : styles.trim();
        if (backup === clobberStyle) {
          return;
        } else {
          $_c4ed9fxrje5o2xz8.set(element, attr, backup);
          $_c4ed9fxrje5o2xz8.set(element, 'style', clobberStyle);
        }
      };
    };
    var ancestors = $_b0xmc2zvje5o2y8l.ancestors(container, '*');
    var siblings = $_8kvqz0wsje5o2xvo.bind(ancestors, gatherSibilings);
    var bgColor = matchColor(editorBody);
    $_8kvqz0wsje5o2xvo.each(siblings, clobber(siblingStyles));
    $_8kvqz0wsje5o2xvo.each(ancestors, clobber(ancestorPosition + ancestorStyles + bgColor));
    var containerStyles = isAndroid === true ? '' : ancestorPosition;
    clobber(containerStyles + ancestorStyles + bgColor)(container);
  };
  var restoreStyles = function () {
    var clobberedEls = $_b0xmc2zvje5o2y8l.all('[' + attr + ']');
    $_8kvqz0wsje5o2xvo.each(clobberedEls, function (element) {
      var restore = $_c4ed9fxrje5o2xz8.get(element, attr);
      if (restore !== 'no-styles') {
        $_c4ed9fxrje5o2xz8.set(element, 'style', restore);
      } else {
        $_c4ed9fxrje5o2xz8.remove(element, 'style');
      }
      $_c4ed9fxrje5o2xz8.remove(element, attr);
    });
  };
  var $_4jw0fv14tje5o2yzv = {
    clobberStyles: clobberStyles,
    restoreStyles: restoreStyles
  };

  var tag = function () {
    var head = $_gesp01zxje5o2y8p.first('head').getOrDie();
    var nu = function () {
      var meta = $_f7rai4xfje5o2xy5.fromTag('meta');
      $_c4ed9fxrje5o2xz8.set(meta, 'name', 'viewport');
      $_9je15xx2je5o2xx0.append(head, meta);
      return meta;
    };
    var element = $_gesp01zxje5o2y8p.first('meta[name="viewport"]').getOrThunk(nu);
    var backup = $_c4ed9fxrje5o2xz8.get(element, 'content');
    var maximize = function () {
      $_c4ed9fxrje5o2xz8.set(element, 'content', 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0');
    };
    var restore = function () {
      if (backup !== undefined && backup !== null && backup.length > 0) {
        $_c4ed9fxrje5o2xz8.set(element, 'content', backup);
      } else {
        $_c4ed9fxrje5o2xz8.set(element, 'content', 'user-scalable=yes');
      }
    };
    return {
      maximize: maximize,
      restore: restore
    };
  };
  var $_3hno2p14uje5o2z08 = { tag: tag };

  var create$5 = function (platform, mask) {
    var meta = $_3hno2p14uje5o2z08.tag();
    var androidApi = $_6u06mm12oje5o2yne.api();
    var androidEvents = $_6u06mm12oje5o2yne.api();
    var enter = function () {
      mask.hide();
      $_8ppxz2ynje5o2y3s.add(platform.container, $_dqvuwxzeje5o2y6o.resolve('fullscreen-maximized'));
      $_8ppxz2ynje5o2y3s.add(platform.container, $_dqvuwxzeje5o2y6o.resolve('android-maximized'));
      meta.maximize();
      $_8ppxz2ynje5o2y3s.add(platform.body, $_dqvuwxzeje5o2y6o.resolve('android-scroll-reload'));
      androidApi.set($_5qhrv8146je5o2yx1.setup(platform.win, $_amy3p214sje5o2yzn.getWin(platform.editor).getOrDie('no')));
      $_amy3p214sje5o2yzn.getActiveApi(platform.editor).each(function (editorApi) {
        $_4jw0fv14tje5o2yzv.clobberStyles(platform.container, editorApi.body());
        androidEvents.set($_82910j142je5o2yw8.initEvents(editorApi, platform.toolstrip, platform.alloy));
      });
    };
    var exit = function () {
      meta.restore();
      mask.show();
      $_8ppxz2ynje5o2y3s.remove(platform.container, $_dqvuwxzeje5o2y6o.resolve('fullscreen-maximized'));
      $_8ppxz2ynje5o2y3s.remove(platform.container, $_dqvuwxzeje5o2y6o.resolve('android-maximized'));
      $_4jw0fv14tje5o2yzv.restoreStyles();
      $_8ppxz2ynje5o2y3s.remove(platform.body, $_dqvuwxzeje5o2y6o.resolve('android-scroll-reload'));
      androidEvents.clear();
      androidApi.clear();
    };
    return {
      enter: enter,
      exit: exit
    };
  };
  var $_asukmo141je5o2yw4 = { create: create$5 };

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
  var $_3x414o14wje5o2z0k = {
    adaptable: adaptable,
    first: first$4,
    last: last$3
  };

  var sketch$10 = function (onView, translate) {
    var memIcon = $_32ltkv11rje5o2yj6.record(Container.sketch({
      dom: $_a88x2p113je5o2yfs.dom('<div aria-hidden="true" class="${prefix}-mask-tap-icon"></div>'),
      containerBehaviours: $_e4rr4py2je5o2y0l.derive([Toggling.config({
          toggleClass: $_dqvuwxzeje5o2y6o.resolve('mask-tap-icon-selected'),
          toggleOnExecute: false
        })])
    }));
    var onViewThrottle = $_3x414o14wje5o2z0k.first(onView, 200);
    return Container.sketch({
      dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-disabled-mask"></div>'),
      components: [Container.sketch({
          dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-content-container"></div>'),
          components: [Button.sketch({
              dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-content-tap-section"></div>'),
              components: [memIcon.asSpec()],
              action: function (button) {
                onViewThrottle.throttle();
              },
              buttonBehaviours: $_e4rr4py2je5o2y0l.derive([Toggling.config({ toggleClass: $_dqvuwxzeje5o2y6o.resolve('mask-tap-icon-selected') })])
            })]
        })]
    });
  };
  var $_d6qsf614vje5o2z0d = { sketch: sketch$10 };

  var MobileSchema = $_1ui3lpyeje5o2y2u.objOf([
    $_65y30vy7je5o2y1k.strictObjOf('editor', [
      $_65y30vy7je5o2y1k.strict('getFrame'),
      $_65y30vy7je5o2y1k.option('getBody'),
      $_65y30vy7je5o2y1k.option('getDoc'),
      $_65y30vy7je5o2y1k.option('getWin'),
      $_65y30vy7je5o2y1k.option('getSelection'),
      $_65y30vy7je5o2y1k.option('setSelection'),
      $_65y30vy7je5o2y1k.option('clearSelection'),
      $_65y30vy7je5o2y1k.option('cursorSaver'),
      $_65y30vy7je5o2y1k.option('onKeyup'),
      $_65y30vy7je5o2y1k.option('onNodeChanged'),
      $_65y30vy7je5o2y1k.option('getCursorBox'),
      $_65y30vy7je5o2y1k.strict('onDomChanged'),
      $_65y30vy7je5o2y1k.defaulted('onTouchContent', $_49qg0cwjje5o2xv6.noop),
      $_65y30vy7je5o2y1k.defaulted('onTapContent', $_49qg0cwjje5o2xv6.noop),
      $_65y30vy7je5o2y1k.defaulted('onTouchToolstrip', $_49qg0cwjje5o2xv6.noop),
      $_65y30vy7je5o2y1k.defaulted('onScrollToCursor', $_49qg0cwjje5o2xv6.constant({ unbind: $_49qg0cwjje5o2xv6.noop })),
      $_65y30vy7je5o2y1k.defaulted('onScrollToElement', $_49qg0cwjje5o2xv6.constant({ unbind: $_49qg0cwjje5o2xv6.noop })),
      $_65y30vy7je5o2y1k.defaulted('onToEditing', $_49qg0cwjje5o2xv6.constant({ unbind: $_49qg0cwjje5o2xv6.noop })),
      $_65y30vy7je5o2y1k.defaulted('onToReading', $_49qg0cwjje5o2xv6.constant({ unbind: $_49qg0cwjje5o2xv6.noop })),
      $_65y30vy7je5o2y1k.defaulted('onToolbarScrollStart', $_49qg0cwjje5o2xv6.identity)
    ]),
    $_65y30vy7je5o2y1k.strict('socket'),
    $_65y30vy7je5o2y1k.strict('toolstrip'),
    $_65y30vy7je5o2y1k.strict('dropup'),
    $_65y30vy7je5o2y1k.strict('toolbar'),
    $_65y30vy7je5o2y1k.strict('container'),
    $_65y30vy7je5o2y1k.strict('alloy'),
    $_65y30vy7je5o2y1k.state('win', function (spec) {
      return $_5i5voox3je5o2xx2.owner(spec.socket).dom().defaultView;
    }),
    $_65y30vy7je5o2y1k.state('body', function (spec) {
      return $_f7rai4xfje5o2xy5.fromDom(spec.socket.dom().ownerDocument.body);
    }),
    $_65y30vy7je5o2y1k.defaulted('translate', $_49qg0cwjje5o2xv6.identity),
    $_65y30vy7je5o2y1k.defaulted('setReadOnly', $_49qg0cwjje5o2xv6.noop)
  ]);

  var produce = function (raw) {
    var mobile = $_1ui3lpyeje5o2y2u.asRawOrDie('Getting AndroidWebapp schema', MobileSchema, raw);
    $_2jybvt103je5o2y95.set(mobile.toolstrip, 'width', '100%');
    var onTap = function () {
      mobile.setReadOnly(true);
      mode.enter();
    };
    var mask = $_cu5wb112tje5o2yoe.build($_d6qsf614vje5o2z0d.sketch(onTap, mobile.translate));
    mobile.alloy.add(mask);
    var maskApi = {
      show: function () {
        mobile.alloy.add(mask);
      },
      hide: function () {
        mobile.alloy.remove(mask);
      }
    };
    $_9je15xx2je5o2xx0.append(mobile.container, mask.element());
    var mode = $_asukmo141je5o2yw4.create(mobile, maskApi);
    return {
      setReadOnly: mobile.setReadOnly,
      refreshStructure: $_49qg0cwjje5o2xv6.noop,
      enter: mode.enter,
      exit: mode.exit,
      destroy: $_49qg0cwjje5o2xv6.noop
    };
  };
  var $_7zvjhv140je5o2yvy = { produce: produce };

  var schema$14 = [
    $_65y30vy7je5o2y1k.defaulted('shell', true),
    $_2c8uf410oje5o2yci.field('toolbarBehaviours', [Replacing])
  ];
  var enhanceGroups = function (detail) {
    return { behaviours: $_e4rr4py2je5o2y0l.derive([Replacing.config({})]) };
  };
  var partTypes$1 = [$_1837sx10vje5o2ye4.optional({
      name: 'groups',
      overrides: enhanceGroups
    })];
  var $_f1zix7150je5o2z19 = {
    name: $_49qg0cwjje5o2xv6.constant('Toolbar'),
    schema: $_49qg0cwjje5o2xv6.constant(schema$14),
    parts: $_49qg0cwjje5o2xv6.constant(partTypes$1)
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
      return detail.shell() ? Option.some(component) : $_fkcvdu10tje5o2yda.getPart(component, detail, 'groups');
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
      behaviours: $_gc11amwyje5o2xwl.deepMerge($_e4rr4py2je5o2y0l.derive(extra.behaviours), $_2c8uf410oje5o2yci.get(detail.toolbarBehaviours())),
      apis: { setGroups: setGroups },
      domModification: { attributes: { role: 'group' } }
    };
  };
  var Toolbar = $_c7e59s10pje5o2yco.composite({
    name: 'Toolbar',
    configFields: $_f1zix7150je5o2z19.schema(),
    partFields: $_f1zix7150je5o2z19.parts(),
    factory: factory$4,
    apis: {
      setGroups: function (apis, toolbar, groups) {
        apis.setGroups(toolbar, groups);
      }
    }
  });

  var schema$15 = [
    $_65y30vy7je5o2y1k.strict('items'),
    $_2cu7nfz6je5o2y5e.markers(['itemClass']),
    $_2c8uf410oje5o2yci.field('tgroupBehaviours', [Keying])
  ];
  var partTypes$2 = [$_1837sx10vje5o2ye4.group({
      name: 'items',
      unit: 'item',
      overrides: function (detail) {
        return { domModification: { classes: [detail.markers().itemClass()] } };
      }
    })];
  var $_7jjccp152je5o2z1g = {
    name: $_49qg0cwjje5o2xv6.constant('ToolbarGroup'),
    schema: $_49qg0cwjje5o2xv6.constant(schema$15),
    parts: $_49qg0cwjje5o2xv6.constant(partTypes$2)
  };

  var factory$5 = function (detail, components, spec, _externals) {
    return $_gc11amwyje5o2xwl.deepMerge({ dom: { attributes: { role: 'toolbar' } } }, {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_gc11amwyje5o2xwl.deepMerge($_e4rr4py2je5o2y0l.derive([Keying.config({
          mode: 'flow',
          selector: '.' + detail.markers().itemClass()
        })]), $_2c8uf410oje5o2yci.get(detail.tgroupBehaviours())),
      'debug.sketcher': spec['debug.sketcher']
    });
  };
  var ToolbarGroup = $_c7e59s10pje5o2yco.composite({
    name: 'ToolbarGroup',
    configFields: $_7jjccp152je5o2z1g.schema(),
    partFields: $_7jjccp152je5o2z1g.parts(),
    factory: factory$5
  });

  var dataHorizontal = 'data-' + $_dqvuwxzeje5o2y6o.resolve('horizontal-scroll');
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
    $_c4ed9fxrje5o2xz8.set(container, dataHorizontal, 'true');
  };
  var hasScroll = function (container) {
    return $_c4ed9fxrje5o2xz8.get(container, dataHorizontal) === 'true' ? hasHorizontalScroll : hasVerticalScroll;
  };
  var exclusive = function (scope, selector) {
    return $_etlh9713xje5o2yvn.bind(scope, 'touchmove', function (event) {
      $_gesp01zxje5o2y8p.closest(event.target(), selector).filter(hasScroll).fold(function () {
        event.raw().preventDefault();
      }, $_49qg0cwjje5o2xv6.noop);
    });
  };
  var $_80hgxe153je5o2z1k = {
    exclusive: exclusive,
    markAsHorizontal: markAsHorizontal
  };

  function ScrollingToolbar () {
    var makeGroup = function (gSpec) {
      var scrollClass = gSpec.scrollable === true ? '${prefix}-toolbar-scrollable-group' : '';
      return {
        dom: $_a88x2p113je5o2yfs.dom('<div aria-label="' + gSpec.label + '" class="${prefix}-toolbar-group ' + scrollClass + '"></div>'),
        tgroupBehaviours: $_e4rr4py2je5o2y0l.derive([$_g0brcd126je5o2yky.config('adhoc-scrollable-toolbar', gSpec.scrollable === true ? [$_9z4gpyy4je5o2y14.runOnInit(function (component, simulatedEvent) {
              $_2jybvt103je5o2y95.set(component.element(), 'overflow-x', 'auto');
              $_80hgxe153je5o2z1k.markAsHorizontal(component.element());
              $_aj0ve213uje5o2yv9.register(component.element());
            })] : [])]),
        components: [Container.sketch({ components: [ToolbarGroup.parts().items({})] })],
        markers: { itemClass: $_dqvuwxzeje5o2y6o.resolve('toolbar-group-item') },
        items: gSpec.items
      };
    };
    var toolbar = $_cu5wb112tje5o2yoe.build(Toolbar.sketch({
      dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-toolbar"></div>'),
      components: [Toolbar.parts().groups({})],
      toolbarBehaviours: $_e4rr4py2je5o2y0l.derive([
        Toggling.config({
          toggleClass: $_dqvuwxzeje5o2y6o.resolve('context-toolbar'),
          toggleOnExecute: false,
          aria: { mode: 'none' }
        }),
        Keying.config({ mode: 'cyclic' })
      ]),
      shell: true
    }));
    var wrapper = $_cu5wb112tje5o2yoe.build(Container.sketch({
      dom: { classes: [$_dqvuwxzeje5o2y6o.resolve('toolstrip')] },
      components: [$_cu5wb112tje5o2yoe.premade(toolbar)],
      containerBehaviours: $_e4rr4py2je5o2y0l.derive([Toggling.config({
          toggleClass: $_dqvuwxzeje5o2y6o.resolve('android-selection-context-toolbar'),
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
      return $_8kvqz0wsje5o2xvo.map(gs, $_49qg0cwjje5o2xv6.compose(ToolbarGroup.sketch, makeGroup));
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
      wrapper: $_49qg0cwjje5o2xv6.constant(wrapper),
      toolbar: $_49qg0cwjje5o2xv6.constant(toolbar),
      createGroups: createGroups,
      setGroups: setGroups,
      setContextToolbar: setContextToolbar,
      restoreToolbar: restoreToolbar,
      refresh: refresh,
      focus: focus
    };
  }

  var makeEditSwitch = function (webapp) {
    return $_cu5wb112tje5o2yoe.build(Button.sketch({
      dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-mask-edit-icon ${prefix}-icon"></div>'),
      action: function () {
        webapp.run(function (w) {
          w.setReadOnly(false);
        });
      }
    }));
  };
  var makeSocket = function () {
    return $_cu5wb112tje5o2yoe.build(Container.sketch({
      dom: $_a88x2p113je5o2yfs.dom('<div class="${prefix}-editor-socket"></div>'),
      components: [],
      containerBehaviours: $_e4rr4py2je5o2y0l.derive([Replacing.config({})])
    }));
  };
  var showEdit = function (socket, switchToEdit) {
    Replacing.append(socket, $_cu5wb112tje5o2yoe.premade(switchToEdit));
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
  var $_aicf8b154je5o2z1q = {
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
    $_37zbkp137je5o2yrf.remove(root, [
      slideConfig.shrinkingClass(),
      slideConfig.growingClass()
    ]);
  };
  var setShrunk = function (component, slideConfig) {
    $_8ppxz2ynje5o2y3s.remove(component.element(), slideConfig.openClass());
    $_8ppxz2ynje5o2y3s.add(component.element(), slideConfig.closedClass());
    $_2jybvt103je5o2y95.set(component.element(), getDimensionProperty(slideConfig), '0px');
    $_2jybvt103je5o2y95.reflow(component.element());
  };
  var measureTargetSize = function (component, slideConfig) {
    setGrown(component, slideConfig);
    var expanded = getDimension(slideConfig, component.element());
    setShrunk(component, slideConfig);
    return expanded;
  };
  var setGrown = function (component, slideConfig) {
    $_8ppxz2ynje5o2y3s.remove(component.element(), slideConfig.closedClass());
    $_8ppxz2ynje5o2y3s.add(component.element(), slideConfig.openClass());
    $_2jybvt103je5o2y95.remove(component.element(), getDimensionProperty(slideConfig));
  };
  var doImmediateShrink = function (component, slideConfig, slideState) {
    slideState.setCollapsed();
    $_2jybvt103je5o2y95.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
    $_2jybvt103je5o2y95.reflow(component.element());
    disableTransitions(component, slideConfig);
    setShrunk(component, slideConfig);
    slideConfig.onStartShrink()(component);
    slideConfig.onShrunk()(component);
  };
  var doStartShrink = function (component, slideConfig, slideState) {
    slideState.setCollapsed();
    $_2jybvt103je5o2y95.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
    $_2jybvt103je5o2y95.reflow(component.element());
    var root = getAnimationRoot(component, slideConfig);
    $_8ppxz2ynje5o2y3s.add(root, slideConfig.shrinkingClass());
    setShrunk(component, slideConfig);
    slideConfig.onStartShrink()(component);
  };
  var doStartGrow = function (component, slideConfig, slideState) {
    var fullSize = measureTargetSize(component, slideConfig);
    var root = getAnimationRoot(component, slideConfig);
    $_8ppxz2ynje5o2y3s.add(root, slideConfig.growingClass());
    setGrown(component, slideConfig);
    $_2jybvt103je5o2y95.set(component.element(), getDimensionProperty(slideConfig), fullSize);
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
    return $_8ppxz2ynje5o2y3s.has(root, slideConfig.growingClass()) === true;
  };
  var isShrinking = function (component, slideConfig, slideState) {
    var root = getAnimationRoot(component, slideConfig);
    return $_8ppxz2ynje5o2y3s.has(root, slideConfig.shrinkingClass()) === true;
  };
  var isTransitioning = function (component, slideConfig, slideState) {
    return isGrowing(component, slideConfig, slideState) === true || isShrinking(component, slideConfig, slideState) === true;
  };
  var toggleGrow = function (component, slideConfig, slideState) {
    var f = slideState.isExpanded() ? doStartShrink : doStartGrow;
    f(component, slideConfig, slideState);
  };
  var $_4ea40m158je5o2z2j = {
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
    return expanded ? $_9n8qyryhje5o2y35.nu({
      classes: [slideConfig.openClass()],
      styles: {}
    }) : $_9n8qyryhje5o2y35.nu({
      classes: [slideConfig.closedClass()],
      styles: $_fnkom1xsje5o2xzl.wrap(slideConfig.dimension().property(), '0px')
    });
  };
  var events$9 = function (slideConfig, slideState) {
    return $_9z4gpyy4je5o2y14.derive([$_9z4gpyy4je5o2y14.run($_2opl28wije5o2xv3.transitionend(), function (component, simulatedEvent) {
        var raw = simulatedEvent.event().raw();
        if (raw.propertyName === slideConfig.dimension().property()) {
          $_4ea40m158je5o2z2j.disableTransitions(component, slideConfig, slideState);
          if (slideState.isExpanded())
            $_2jybvt103je5o2y95.remove(component.element(), slideConfig.dimension().property());
          var notify = slideState.isExpanded() ? slideConfig.onGrown() : slideConfig.onShrunk();
          notify(component, simulatedEvent);
        }
      })]);
  };
  var $_7kwgi157je5o2z2e = {
    exhibit: exhibit$5,
    events: events$9
  };

  var SlidingSchema = [
    $_65y30vy7je5o2y1k.strict('closedClass'),
    $_65y30vy7je5o2y1k.strict('openClass'),
    $_65y30vy7je5o2y1k.strict('shrinkingClass'),
    $_65y30vy7je5o2y1k.strict('growingClass'),
    $_65y30vy7je5o2y1k.option('getAnimationRoot'),
    $_2cu7nfz6je5o2y5e.onHandler('onShrunk'),
    $_2cu7nfz6je5o2y5e.onHandler('onStartShrink'),
    $_2cu7nfz6je5o2y5e.onHandler('onGrown'),
    $_2cu7nfz6je5o2y5e.onHandler('onStartGrow'),
    $_65y30vy7je5o2y1k.defaulted('expanded', false),
    $_65y30vy7je5o2y1k.strictOf('dimension', $_1ui3lpyeje5o2y2u.choose('property', {
      width: [
        $_2cu7nfz6je5o2y5e.output('property', 'width'),
        $_2cu7nfz6je5o2y5e.output('getDimension', function (elem) {
          return $_bqnful11kje5o2yi9.get(elem) + 'px';
        })
      ],
      height: [
        $_2cu7nfz6je5o2y5e.output('property', 'height'),
        $_2cu7nfz6je5o2y5e.output('getDimension', function (elem) {
          return $_a35qec102je5o2y93.get(elem) + 'px';
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
      setCollapsed: $_49qg0cwjje5o2xv6.curry(state.set, false),
      setExpanded: $_49qg0cwjje5o2xv6.curry(state.set, true),
      readState: readState
    });
  };
  var $_2y235u15aje5o2z2x = { init: init$4 };

  var Sliding = $_e4rr4py2je5o2y0l.create({
    fields: SlidingSchema,
    name: 'sliding',
    active: $_7kwgi157je5o2z2e,
    apis: $_4ea40m158je5o2z2j,
    state: $_2y235u15aje5o2z2x
  });

  var build$2 = function (refresh, scrollIntoView) {
    var dropup = $_cu5wb112tje5o2yoe.build(Container.sketch({
      dom: {
        tag: 'div',
        classes: $_dqvuwxzeje5o2y6o.resolve('dropup')
      },
      components: [],
      containerBehaviours: $_e4rr4py2je5o2y0l.derive([
        Replacing.config({}),
        Sliding.config({
          closedClass: $_dqvuwxzeje5o2y6o.resolve('dropup-closed'),
          openClass: $_dqvuwxzeje5o2y6o.resolve('dropup-open'),
          shrinkingClass: $_dqvuwxzeje5o2y6o.resolve('dropup-shrinking'),
          growingClass: $_dqvuwxzeje5o2y6o.resolve('dropup-growing'),
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
        $_941wfnzdje5o2y6l.orientation(function (component, data) {
          disappear($_49qg0cwjje5o2xv6.noop);
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
      component: $_49qg0cwjje5o2xv6.constant(dropup),
      element: dropup.element
    };
  };
  var $_6qt0j7155je5o2z23 = { build: build$2 };

  var isDangerous = function (event) {
    return event.raw().which === $_f2vh3bzpje5o2y7r.BACKSPACE()[0] && !$_8kvqz0wsje5o2xvo.contains([
      'input',
      'textarea'
    ], $_5souzyxkje5o2xyh.name(event.target()));
  };
  var isFirefox = $_6ys1d4wkje5o2xv8.detect().browser.isFirefox();
  var settingsSchema = $_1ui3lpyeje5o2y2u.objOfOnly([
    $_65y30vy7je5o2y1k.strictFunction('triggerEvent'),
    $_65y30vy7je5o2y1k.strictFunction('broadcastEvent'),
    $_65y30vy7je5o2y1k.defaulted('stopBackspace', true)
  ]);
  var bindFocus = function (container, handler) {
    if (isFirefox) {
      return $_etlh9713xje5o2yvn.capture(container, 'focus', handler);
    } else {
      return $_etlh9713xje5o2yvn.bind(container, 'focusin', handler);
    }
  };
  var bindBlur = function (container, handler) {
    if (isFirefox) {
      return $_etlh9713xje5o2yvn.capture(container, 'blur', handler);
    } else {
      return $_etlh9713xje5o2yvn.bind(container, 'focusout', handler);
    }
  };
  var setup$2 = function (container, rawSettings) {
    var settings = $_1ui3lpyeje5o2y2u.asRawOrDie('Getting GUI events settings', settingsSchema, rawSettings);
    var pointerEvents = $_6ys1d4wkje5o2xv8.detect().deviceType.isTouch() ? [
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
    var tapEvent = $_3hhxdf144je5o2ywr.monitor(settings);
    var simpleEvents = $_8kvqz0wsje5o2xvo.map(pointerEvents.concat([
      'selectstart',
      'input',
      'contextmenu',
      'change',
      'transitionend',
      'dragstart',
      'dragover',
      'drop'
    ]), function (type) {
      return $_etlh9713xje5o2yvn.bind(container, type, function (event) {
        tapEvent.fireIfReady(event, type).each(function (tapStopped) {
          if (tapStopped)
            event.kill();
        });
        var stopped = settings.triggerEvent(type, event);
        if (stopped)
          event.kill();
      });
    });
    var onKeydown = $_etlh9713xje5o2yvn.bind(container, 'keydown', function (event) {
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
        settings.triggerEvent($_9k0aw9whje5o2xv0.postBlur(), event);
      }, 0);
    });
    var defaultView = $_5i5voox3je5o2xx2.defaultView(container);
    var onWindowScroll = $_etlh9713xje5o2yvn.bind(defaultView, 'scroll', function (event) {
      var stopped = settings.broadcastEvent($_9k0aw9whje5o2xv0.windowScroll(), event);
      if (stopped)
        event.kill();
    });
    var unbind = function () {
      $_8kvqz0wsje5o2xvo.each(simpleEvents, function (e) {
        e.unbind();
      });
      onKeydown.unbind();
      onFocusIn.unbind();
      onFocusOut.unbind();
      onWindowScroll.unbind();
    };
    return { unbind: unbind };
  };
  var $_855sq215dje5o2z3n = { setup: setup$2 };

  var derive$3 = function (rawEvent, rawTarget) {
    var source = $_fnkom1xsje5o2xzl.readOptFrom(rawEvent, 'target').map(function (getTarget) {
      return getTarget();
    }).getOr(rawTarget);
    return Cell(source);
  };
  var $_3gu67315fje5o2z4k = { derive: derive$3 };

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
      event: $_49qg0cwjje5o2xv6.constant(event),
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
      cut: $_49qg0cwjje5o2xv6.noop,
      isStopped: stopper.get,
      isCut: $_49qg0cwjje5o2xv6.constant(false),
      event: $_49qg0cwjje5o2xv6.constant(event),
      setTarget: $_49qg0cwjje5o2xv6.die(new Error('Cannot set target of a broadcasted event')),
      getTarget: $_49qg0cwjje5o2xv6.die(new Error('Cannot get target of a broadcasted event'))
    };
  };
  var fromTarget = function (event, target) {
    var source = Cell(target);
    return fromSource(event, source);
  };
  var $_9iykj015gje5o2z4n = {
    fromSource: fromSource,
    fromExternal: fromExternal,
    fromTarget: fromTarget
  };

  var adt$6 = $_9u0u7zxwje5o2xzz.generate([
    { stopped: [] },
    { resume: ['element'] },
    { complete: [] }
  ]);
  var doTriggerHandler = function (lookup, eventType, rawEvent, target, source, logger) {
    var handler = lookup(eventType, target);
    var simulatedEvent = $_9iykj015gje5o2z4n.fromSource(rawEvent, source);
    return handler.fold(function () {
      logger.logEventNoHandlers(eventType, target);
      return adt$6.complete();
    }, function (handlerInfo) {
      var descHandler = handlerInfo.descHandler();
      var eventHandler = $_6598jr134je5o2yqm.getHandler(descHandler);
      eventHandler(simulatedEvent);
      if (simulatedEvent.isStopped()) {
        logger.logEventStopped(eventType, handlerInfo.element(), descHandler.purpose());
        return adt$6.stopped();
      } else if (simulatedEvent.isCut()) {
        logger.logEventCut(eventType, handlerInfo.element(), descHandler.purpose());
        return adt$6.complete();
      } else
        return $_5i5voox3je5o2xx2.parent(handlerInfo.element()).fold(function () {
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
    var source = $_3gu67315fje5o2z4k.derive(rawEvent, target);
    return doTriggerHandler(lookup, eventType, rawEvent, target, source, logger);
  };
  var broadcast = function (listeners, rawEvent, logger) {
    var simulatedEvent = $_9iykj015gje5o2z4n.fromExternal(rawEvent);
    $_8kvqz0wsje5o2xvo.each(listeners, function (listener) {
      var descHandler = listener.descHandler();
      var handler = $_6598jr134je5o2yqm.getHandler(descHandler);
      handler(simulatedEvent);
    });
    return simulatedEvent.isStopped();
  };
  var triggerUntilStopped = function (lookup, eventType, rawEvent, logger) {
    var rawTarget = rawEvent.target();
    return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, logger);
  };
  var triggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, logger) {
    var source = $_3gu67315fje5o2z4k.derive(rawEvent, rawTarget);
    return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
  };
  var $_ed4pw15eje5o2z4e = {
    triggerHandler: triggerHandler,
    triggerUntilStopped: triggerUntilStopped,
    triggerOnUntilStopped: triggerOnUntilStopped,
    broadcast: broadcast
  };

  var closest$4 = function (target, transform, isRoot) {
    var delegate = $_18ooz1yvje5o2y4e.closest(target, function (elem) {
      return transform(elem).isSome();
    }, isRoot);
    return delegate.bind(transform);
  };
  var $_4onuea15jje5o2z54 = { closest: closest$4 };

  var eventHandler = $_2y7sshx4je5o2xxa.immutable('element', 'descHandler');
  var messageHandler = function (id, handler) {
    return {
      id: $_49qg0cwjje5o2xv6.constant(id),
      descHandler: $_49qg0cwjje5o2xv6.constant(handler)
    };
  };
  function EventRegistry () {
    var registry = {};
    var registerId = function (extraArgs, id, events) {
      $_67wkp4x0je5o2xwn.each(events, function (v, k) {
        var handlers = registry[k] !== undefined ? registry[k] : {};
        handlers[id] = $_6598jr134je5o2yqm.curryArgs(v, extraArgs);
        registry[k] = handlers;
      });
    };
    var findHandler = function (handlers, elem) {
      return $_xh06h10xje5o2yer.read(elem).fold(function (err) {
        return Option.none();
      }, function (id) {
        var reader = $_fnkom1xsje5o2xzl.readOpt(id);
        return handlers.bind(reader).map(function (descHandler) {
          return eventHandler(elem, descHandler);
        });
      });
    };
    var filterByType = function (type) {
      return $_fnkom1xsje5o2xzl.readOptFrom(registry, type).map(function (handlers) {
        return $_67wkp4x0je5o2xwn.mapToArray(handlers, function (f, id) {
          return messageHandler(id, f);
        });
      }).getOr([]);
    };
    var find = function (isAboveRoot, type, target) {
      var readType = $_fnkom1xsje5o2xzl.readOpt(type);
      var handlers = readType(registry);
      return $_4onuea15jje5o2z54.closest(target, function (elem) {
        return findHandler(handlers, elem);
      }, isAboveRoot);
    };
    var unregisterId = function (id) {
      $_67wkp4x0je5o2xwn.each(registry, function (handlersById, eventName) {
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
      return $_xh06h10xje5o2yer.read(elem).fold(function () {
        return $_xh06h10xje5o2yer.write('uid-', component.element());
      }, function (uid) {
        return uid;
      });
    };
    var failOnDuplicate = function (component, tagId) {
      var conflict = components[tagId];
      if (conflict === component)
        unregister(component);
      else
        throw new Error('The tagId "' + tagId + '" is already used by: ' + $_ctmjchxmje5o2xys.element(conflict.element()) + '\nCannot use it for: ' + $_ctmjchxmje5o2xys.element(component.element()) + '\n' + 'The conflicting element is' + ($_4ff55vxjje5o2xyf.inBody(conflict.element()) ? ' ' : ' not ') + 'already in the DOM');
    };
    var register = function (component) {
      var tagId = readOrTag(component);
      if ($_fnkom1xsje5o2xzl.hasKey(components, tagId))
        failOnDuplicate(component, tagId);
      var extraArgs = [component];
      events.registerId(extraArgs, tagId, component.events());
      components[tagId] = component;
    };
    var unregister = function (component) {
      $_xh06h10xje5o2yer.read(component.element()).each(function (tagId) {
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
      return $_fnkom1xsje5o2xzl.readOpt(id)(components);
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
    var root = $_cu5wb112tje5o2yoe.build(Container.sketch({ dom: { tag: 'div' } }));
    return takeover(root);
  };
  var takeover = function (root) {
    var isAboveRoot = function (el) {
      return $_5i5voox3je5o2xx2.parent(root.element()).fold(function () {
        return true;
      }, function (parent) {
        return $_8iyn3dx9je5o2xxi.eq(el, parent);
      });
    };
    var registry = Registry();
    var lookup = function (eventName, target) {
      return registry.find(isAboveRoot, eventName, target);
    };
    var domEvents = $_855sq215dje5o2z3n.setup(root.element(), {
      triggerEvent: function (eventName, event) {
        return $_eivumrxlje5o2xyj.monitorEvent(eventName, event.target(), function (logger) {
          return $_ed4pw15eje5o2z4e.triggerUntilStopped(lookup, eventName, event, logger);
        });
      },
      broadcastEvent: function (eventName, event) {
        var listeners = registry.filter(eventName);
        return $_ed4pw15eje5o2z4e.broadcast(listeners, event);
      }
    });
    var systemApi = SystemApi({
      debugInfo: $_49qg0cwjje5o2xv6.constant('real'),
      triggerEvent: function (customType, target, data) {
        $_eivumrxlje5o2xyj.monitorEvent(customType, target, function (logger) {
          $_ed4pw15eje5o2z4e.triggerOnUntilStopped(lookup, customType, data, target, logger);
        });
      },
      triggerFocus: function (target, originator) {
        $_xh06h10xje5o2yer.read(target).fold(function () {
          $_70842eytje5o2y49.focus(target);
        }, function (_alloyId) {
          $_eivumrxlje5o2xyj.monitorEvent($_9k0aw9whje5o2xv0.focus(), target, function (logger) {
            $_ed4pw15eje5o2z4e.triggerHandler(lookup, $_9k0aw9whje5o2xv0.focus(), {
              originator: $_49qg0cwjje5o2xv6.constant(originator),
              target: $_49qg0cwjje5o2xv6.constant(target)
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
      build: $_cu5wb112tje5o2yoe.build,
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
      if (!$_5souzyxkje5o2xyh.isText(component.element())) {
        registry.register(component);
        $_8kvqz0wsje5o2xvo.each(component.components(), addToWorld);
        systemApi.triggerEvent($_9k0aw9whje5o2xv0.systemInit(), component.element(), { target: $_49qg0cwjje5o2xv6.constant(component.element()) });
      }
    };
    var removeFromWorld = function (component) {
      if (!$_5souzyxkje5o2xyh.isText(component.element())) {
        $_8kvqz0wsje5o2xvo.each(component.components(), removeFromWorld);
        registry.unregister(component);
      }
      component.disconnect();
    };
    var add = function (component) {
      $_s45jfx1je5o2xwq.attach(root, component);
    };
    var remove = function (component) {
      $_s45jfx1je5o2xwq.detach(component);
    };
    var destroy = function () {
      domEvents.unbind();
      $_fjv49rxhje5o2xya.remove(root.element());
    };
    var broadcastData = function (data) {
      var receivers = registry.filter($_9k0aw9whje5o2xv0.receive());
      $_8kvqz0wsje5o2xvo.each(receivers, function (receiver) {
        var descHandler = receiver.descHandler();
        var handler = $_6598jr134je5o2yqm.getHandler(descHandler);
        handler(data);
      });
    };
    var broadcast = function (message) {
      broadcastData({
        universal: $_49qg0cwjje5o2xv6.constant(true),
        data: $_49qg0cwjje5o2xv6.constant(message)
      });
    };
    var broadcastOn = function (channels, message) {
      broadcastData({
        universal: $_49qg0cwjje5o2xv6.constant(false),
        channels: $_49qg0cwjje5o2xv6.constant(channels),
        data: $_49qg0cwjje5o2xv6.constant(message)
      });
    };
    var getByUid = function (uid) {
      return registry.getById(uid).fold(function () {
        return Result.error(new Error('Could not find component with uid: "' + uid + '" in system.'));
      }, Result.value);
    };
    var getByDom = function (elem) {
      return $_xh06h10xje5o2yer.read(elem).bind(getByUid);
    };
    addToWorld(root);
    return {
      root: $_49qg0cwjje5o2xv6.constant(root),
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
  var $_b9p8nv15cje5o2z38 = {
    create: create$6,
    takeover: takeover
  };

  var READ_ONLY_MODE_CLASS = $_49qg0cwjje5o2xv6.constant($_dqvuwxzeje5o2y6o.resolve('readonly-mode'));
  var EDIT_MODE_CLASS = $_49qg0cwjje5o2xv6.constant($_dqvuwxzeje5o2y6o.resolve('edit-mode'));
  function OuterContainer (spec) {
    var root = $_cu5wb112tje5o2yoe.build(Container.sketch({
      dom: { classes: [$_dqvuwxzeje5o2y6o.resolve('outer-container')].concat(spec.classes) },
      containerBehaviours: $_e4rr4py2je5o2y0l.derive([Swapping.config({
          alpha: READ_ONLY_MODE_CLASS(),
          omega: EDIT_MODE_CLASS()
        })])
    }));
    return $_b9p8nv15cje5o2z38.takeover(root);
  }

  function AndroidRealm (scrollIntoView) {
    var alloy = OuterContainer({ classes: [$_dqvuwxzeje5o2y6o.resolve('android-container')] });
    var toolbar = ScrollingToolbar();
    var webapp = $_6u06mm12oje5o2yne.api();
    var switchToEdit = $_aicf8b154je5o2z1q.makeEditSwitch(webapp);
    var socket = $_aicf8b154je5o2z1q.makeSocket();
    var dropup = $_6qt0j7155je5o2z23.build($_49qg0cwjje5o2xv6.noop, scrollIntoView);
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
      webapp.set($_7zvjhv140je5o2yvy.produce(spec));
    };
    var exit = function () {
      webapp.run(function (w) {
        w.exit();
        Replacing.remove(socket, switchToEdit);
      });
    };
    var updateMode = function (readOnly) {
      $_aicf8b154je5o2z1q.updateMode(socket, switchToEdit, readOnly, alloy.root());
    };
    return {
      system: $_49qg0cwjje5o2xv6.constant(alloy),
      element: alloy.element,
      init: init,
      exit: exit,
      setToolbarGroups: setToolbarGroups,
      setContextToolbar: setContextToolbar,
      focusToolbar: focusToolbar,
      restoreToolbar: restoreToolbar,
      updateMode: updateMode,
      socket: $_49qg0cwjje5o2xv6.constant(socket),
      dropup: $_49qg0cwjje5o2xv6.constant(dropup)
    };
  }

  var input = function (parent, operation) {
    var input = $_f7rai4xfje5o2xy5.fromTag('input');
    $_2jybvt103je5o2y95.setAll(input, {
      opacity: '0',
      position: 'absolute',
      top: '-1000px',
      left: '-1000px'
    });
    $_9je15xx2je5o2xx0.append(parent, input);
    $_70842eytje5o2y49.focus(input);
    operation(input);
    $_fjv49rxhje5o2xya.remove(input);
  };
  var $_fneojf15oje5o2z63 = { input: input };

  var refreshInput = function (input) {
    var start = input.dom().selectionStart;
    var end = input.dom().selectionEnd;
    var dir = input.dom().selectionDirection;
    setTimeout(function () {
      input.dom().setSelectionRange(start, end, dir);
      $_70842eytje5o2y49.focus(input);
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
  var $_52iihm15qje5o2z6c = {
    refreshInput: refreshInput,
    refresh: refresh
  };

  var resume$1 = function (cWin, frame) {
    $_70842eytje5o2y49.active().each(function (active) {
      if (!$_8iyn3dx9je5o2xxi.eq(active, frame)) {
        $_70842eytje5o2y49.blur(active);
      }
    });
    cWin.focus();
    $_70842eytje5o2y49.focus($_f7rai4xfje5o2xy5.fromDom(cWin.document.body));
    $_52iihm15qje5o2z6c.refresh(cWin);
  };
  var $_dvdzi015pje5o2z68 = { resume: resume$1 };

  var stubborn = function (outerBody, cWin, page, frame) {
    var toEditing = function () {
      $_dvdzi015pje5o2z68.resume(cWin, frame);
    };
    var toReading = function () {
      $_fneojf15oje5o2z63.input(outerBody, $_70842eytje5o2y49.blur);
    };
    var captureInput = $_etlh9713xje5o2yvn.bind(page, 'keydown', function (evt) {
      if (!$_8kvqz0wsje5o2xvo.contains([
          'input',
          'textarea'
        ], $_5souzyxkje5o2xyh.name(evt.target()))) {
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
      $_70842eytje5o2y49.blur(frame);
    };
    var onToolbarTouch = function () {
      dismissKeyboard();
    };
    var toReading = function () {
      dismissKeyboard();
    };
    var toEditing = function () {
      $_dvdzi015pje5o2z68.resume(cWin, frame);
    };
    return {
      toReading: toReading,
      toEditing: toEditing,
      onToolbarTouch: onToolbarTouch,
      destroy: $_49qg0cwjje5o2xv6.noop
    };
  };
  var $_be7uaq15nje5o2z5r = {
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
      var toolbarHeight = $_a35qec102je5o2y93.get(toolstrip);
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
    var tapping = $_7eybiq143je5o2ywo.monitor(editorApi);
    var refreshThrottle = $_3x414o14wje5o2z0k.last(refreshView, 300);
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
      $_etlh9713xje5o2yvn.bind(editorApi.doc(), 'touchend', function (touchEvent) {
        if ($_8iyn3dx9je5o2xxi.eq(editorApi.html(), touchEvent.target()) || $_8iyn3dx9je5o2xxi.eq(editorApi.body(), touchEvent.target())) {
        }
      }),
      $_etlh9713xje5o2yvn.bind(toolstrip, 'transitionend', function (transitionEvent) {
        if (transitionEvent.raw().propertyName === 'height') {
          reposition();
        }
      }),
      $_etlh9713xje5o2yvn.capture(toolstrip, 'touchstart', function (touchEvent) {
        saveSelectionFirst();
        onToolbarTouch(touchEvent);
        editorApi.onTouchToolstrip();
      }),
      $_etlh9713xje5o2yvn.bind(editorApi.body(), 'touchstart', function (evt) {
        clearSelection();
        editorApi.onTouchContent();
        tapping.fireTouchstart(evt);
      }),
      tapping.onTouchmove(),
      tapping.onTouchend(),
      $_etlh9713xje5o2yvn.bind(editorApi.body(), 'click', function (event) {
        event.kill();
      }),
      $_etlh9713xje5o2yvn.bind(toolstrip, 'touchmove', function () {
        editorApi.onToolbarScrollStart();
      })
    ];
    var destroy = function () {
      $_8kvqz0wsje5o2xvo.each(listeners, function (l) {
        l.unbind();
      });
    };
    return { destroy: destroy };
  };
  var $_cjf39x15rje5o2z6f = { initEvents: initEvents$1 };

  function FakeSelection (win, frame) {
    var doc = win.document;
    var container = $_f7rai4xfje5o2xy5.fromTag('div');
    $_8ppxz2ynje5o2y3s.add(container, $_dqvuwxzeje5o2y6o.resolve('unfocused-selections'));
    $_9je15xx2je5o2xx0.append($_f7rai4xfje5o2xy5.fromDom(doc.documentElement), container);
    var onTouch = $_etlh9713xje5o2yvn.bind(container, 'touchstart', function (event) {
      event.prevent();
      $_dvdzi015pje5o2z68.resume(win, frame);
      clear();
    });
    var make = function (rectangle) {
      var span = $_f7rai4xfje5o2xy5.fromTag('span');
      $_37zbkp137je5o2yrf.add(span, [
        $_dqvuwxzeje5o2y6o.resolve('layer-editor'),
        $_dqvuwxzeje5o2y6o.resolve('unfocused-selection')
      ]);
      $_2jybvt103je5o2y95.setAll(span, {
        left: rectangle.left() + 'px',
        top: rectangle.top() + 'px',
        width: rectangle.width() + 'px',
        height: rectangle.height() + 'px'
      });
      return span;
    };
    var update = function () {
      clear();
      var rectangles = $_5d2yog148je5o2yxa.getRectangles(win);
      var spans = $_8kvqz0wsje5o2xvo.map(rectangles, make);
      $_90nfp9xije5o2xyc.append(container, spans);
    };
    var clear = function () {
      $_fjv49rxhje5o2xya.empty(container);
    };
    var destroy = function () {
      onTouch.unbind();
      $_fjv49rxhje5o2xya.remove(container);
    };
    var isActive = function () {
      return $_5i5voox3je5o2xx2.children(container).length > 0;
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
      $_8kvqz0wsje5o2xvo.each(cbs, call);
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
  var $_bue6s115xje5o2z7p = { bounce: bounce };

  var nu$9 = function (baseFn) {
    var get = function (callback) {
      baseFn($_bue6s115xje5o2z7p.bounce(callback));
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
  var $_6zlse515yje5o2z7v = {
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
    return $_dyh85yy0je5o2y0i.findMap(devices, function (device) {
      return deviceWidth <= device.width && deviceHeight <= device.height ? Option.some(device.keyboard) : Option.none();
    }).getOr({
      portrait: deviceHeight / 5,
      landscape: deviceWidth / 4
    });
  };
  var $_a88gly161je5o2zat = { findDevice: findDevice };

  var softKeyboardLimits = function (outerWindow) {
    return $_a88gly161je5o2zat.findDevice(outerWindow.screen.width, outerWindow.screen.height);
  };
  var accountableKeyboardHeight = function (outerWindow) {
    var portrait = $_41wlrp13wje5o2yvh.get(outerWindow).isPortrait();
    var limits = softKeyboardLimits(outerWindow);
    var keyboard = portrait ? limits.portrait : limits.landscape;
    var visualScreenHeight = portrait ? outerWindow.screen.height : outerWindow.screen.width;
    return visualScreenHeight - outerWindow.innerHeight > keyboard ? 0 : keyboard;
  };
  var getGreenzone = function (socket, dropup) {
    var outerWindow = $_5i5voox3je5o2xx2.owner(socket).dom().defaultView;
    var viewportHeight = $_a35qec102je5o2y93.get(socket) + $_a35qec102je5o2y93.get(dropup);
    var acc = accountableKeyboardHeight(outerWindow);
    return viewportHeight - acc;
  };
  var updatePadding = function (contentBody, socket, dropup) {
    var greenzoneHeight = getGreenzone(socket, dropup);
    var deltaHeight = $_a35qec102je5o2y93.get(socket) + $_a35qec102je5o2y93.get(dropup) - greenzoneHeight;
    $_2jybvt103je5o2y95.set(contentBody, 'padding-bottom', deltaHeight + 'px');
  };
  var $_g1ic2s160je5o2zam = {
    getGreenzone: getGreenzone,
    updatePadding: updatePadding
  };

  var fixture = $_9u0u7zxwje5o2xzz.generate([
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
  var yFixedData = 'data-' + $_dqvuwxzeje5o2y6o.resolve('position-y-fixed');
  var yFixedProperty = 'data-' + $_dqvuwxzeje5o2y6o.resolve('y-property');
  var yScrollingData = 'data-' + $_dqvuwxzeje5o2y6o.resolve('scrolling');
  var windowSizeData = 'data-' + $_dqvuwxzeje5o2y6o.resolve('last-window-height');
  var getYFixedData = function (element) {
    return $_fco49p147je5o2yx8.safeParse(element, yFixedData);
  };
  var getYFixedProperty = function (element) {
    return $_c4ed9fxrje5o2xz8.get(element, yFixedProperty);
  };
  var getLastWindowSize = function (element) {
    return $_fco49p147je5o2yx8.safeParse(element, windowSizeData);
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
    var classifier = $_c4ed9fxrje5o2xz8.get(element, yScrollingData) === 'true' ? classifyScrolling : classifyFixed;
    return classifier(element, offsetY);
  };
  var findFixtures = function (container) {
    var candidates = $_b0xmc2zvje5o2y8l.descendants(container, '[' + yFixedData + ']');
    return $_8kvqz0wsje5o2xvo.map(candidates, classify);
  };
  var takeoverToolbar = function (toolbar) {
    var oldToolbarStyle = $_c4ed9fxrje5o2xz8.get(toolbar, 'style');
    $_2jybvt103je5o2y95.setAll(toolbar, {
      position: 'absolute',
      top: '0px'
    });
    $_c4ed9fxrje5o2xz8.set(toolbar, yFixedData, '0px');
    $_c4ed9fxrje5o2xz8.set(toolbar, yFixedProperty, 'top');
    var restore = function () {
      $_c4ed9fxrje5o2xz8.set(toolbar, 'style', oldToolbarStyle || '');
      $_c4ed9fxrje5o2xz8.remove(toolbar, yFixedData);
      $_c4ed9fxrje5o2xz8.remove(toolbar, yFixedProperty);
    };
    return { restore: restore };
  };
  var takeoverViewport = function (toolbarHeight, height, viewport) {
    var oldViewportStyle = $_c4ed9fxrje5o2xz8.get(viewport, 'style');
    $_aj0ve213uje5o2yv9.register(viewport);
    $_2jybvt103je5o2y95.setAll(viewport, {
      position: 'absolute',
      height: height + 'px',
      width: '100%',
      top: toolbarHeight + 'px'
    });
    $_c4ed9fxrje5o2xz8.set(viewport, yFixedData, toolbarHeight + 'px');
    $_c4ed9fxrje5o2xz8.set(viewport, yScrollingData, 'true');
    $_c4ed9fxrje5o2xz8.set(viewport, yFixedProperty, 'top');
    var restore = function () {
      $_aj0ve213uje5o2yv9.deregister(viewport);
      $_c4ed9fxrje5o2xz8.set(viewport, 'style', oldViewportStyle || '');
      $_c4ed9fxrje5o2xz8.remove(viewport, yFixedData);
      $_c4ed9fxrje5o2xz8.remove(viewport, yScrollingData);
      $_c4ed9fxrje5o2xz8.remove(viewport, yFixedProperty);
    };
    return { restore: restore };
  };
  var takeoverDropup = function (dropup, toolbarHeight, viewportHeight) {
    var oldDropupStyle = $_c4ed9fxrje5o2xz8.get(dropup, 'style');
    $_2jybvt103je5o2y95.setAll(dropup, {
      position: 'absolute',
      bottom: '0px'
    });
    $_c4ed9fxrje5o2xz8.set(dropup, yFixedData, '0px');
    $_c4ed9fxrje5o2xz8.set(dropup, yFixedProperty, 'bottom');
    var restore = function () {
      $_c4ed9fxrje5o2xz8.set(dropup, 'style', oldDropupStyle || '');
      $_c4ed9fxrje5o2xz8.remove(dropup, yFixedData);
      $_c4ed9fxrje5o2xz8.remove(dropup, yFixedProperty);
    };
    return { restore: restore };
  };
  var deriveViewportHeight = function (viewport, toolbarHeight, dropupHeight) {
    var outerWindow = $_5i5voox3je5o2xx2.owner(viewport).dom().defaultView;
    var winH = outerWindow.innerHeight;
    $_c4ed9fxrje5o2xz8.set(viewport, windowSizeData, winH + 'px');
    return winH - toolbarHeight - dropupHeight;
  };
  var takeover$1 = function (viewport, contentBody, toolbar, dropup) {
    var outerWindow = $_5i5voox3je5o2xx2.owner(viewport).dom().defaultView;
    var toolbarSetup = takeoverToolbar(toolbar);
    var toolbarHeight = $_a35qec102je5o2y93.get(toolbar);
    var dropupHeight = $_a35qec102je5o2y93.get(dropup);
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
        var newToolbarHeight = $_a35qec102je5o2y93.get(toolbar);
        var dropupHeight_1 = $_a35qec102je5o2y93.get(dropup);
        var newHeight = deriveViewportHeight(viewport, newToolbarHeight, dropupHeight_1);
        $_c4ed9fxrje5o2xz8.set(viewport, yFixedData, newToolbarHeight + 'px');
        $_2jybvt103je5o2y95.set(viewport, 'height', newHeight + 'px');
        $_2jybvt103je5o2y95.set(dropup, 'bottom', -(newToolbarHeight + newHeight + dropupHeight_1) + 'px');
        $_g1ic2s160je5o2zam.updatePadding(contentBody, viewport, dropup);
      }
    };
    var setViewportOffset = function (newYOffset) {
      var offsetPx = newYOffset + 'px';
      $_c4ed9fxrje5o2xz8.set(viewport, yFixedData, offsetPx);
      refresh();
    };
    $_g1ic2s160je5o2zam.updatePadding(contentBody, viewport, dropup);
    return {
      setViewportOffset: setViewportOffset,
      isExpanding: isExpanding,
      isShrinking: $_49qg0cwjje5o2xv6.not(isExpanding),
      refresh: refresh,
      restore: restore
    };
  };
  var $_6yytpv15zje5o2z7z = {
    findFixtures: findFixtures,
    takeover: takeover$1,
    getYFixedData: getYFixedData
  };

  var animator = $_6zlse515yje5o2z7v.create();
  var ANIMATION_STEP = 15;
  var NUM_TOP_ANIMATION_FRAMES = 10;
  var ANIMATION_RATE = 10;
  var lastScroll = 'data-' + $_dqvuwxzeje5o2y6o.resolve('last-scroll-top');
  var getTop = function (element) {
    var raw = $_2jybvt103je5o2y95.getRaw(element, 'top').getOr(0);
    return parseInt(raw, 10);
  };
  var getScrollTop = function (element) {
    return parseInt(element.dom().scrollTop, 10);
  };
  var moveScrollAndTop = function (element, destination, finalTop) {
    return Future.nu(function (callback) {
      var getCurrent = $_49qg0cwjje5o2xv6.curry(getScrollTop, element);
      var update = function (newScroll) {
        element.dom().scrollTop = newScroll;
        $_2jybvt103je5o2y95.set(element, 'top', getTop(element) + ANIMATION_STEP + 'px');
      };
      var finish = function () {
        element.dom().scrollTop = destination;
        $_2jybvt103je5o2y95.set(element, 'top', finalTop + 'px');
        callback(destination);
      };
      animator.animate(getCurrent, destination, ANIMATION_STEP, update, finish, ANIMATION_RATE);
    });
  };
  var moveOnlyScroll = function (element, destination) {
    return Future.nu(function (callback) {
      var getCurrent = $_49qg0cwjje5o2xv6.curry(getScrollTop, element);
      $_c4ed9fxrje5o2xz8.set(element, lastScroll, getCurrent());
      var update = function (newScroll, abort) {
        var previous = $_fco49p147je5o2yx8.safeParse(element, lastScroll);
        if (previous !== element.dom().scrollTop) {
          abort(element.dom().scrollTop);
        } else {
          element.dom().scrollTop = newScroll;
          $_c4ed9fxrje5o2xz8.set(element, lastScroll, newScroll);
        }
      };
      var finish = function () {
        element.dom().scrollTop = destination;
        $_c4ed9fxrje5o2xz8.set(element, lastScroll, destination);
        callback(destination);
      };
      var distance = Math.abs(destination - getCurrent());
      var step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
      animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
    });
  };
  var moveOnlyTop = function (element, destination) {
    return Future.nu(function (callback) {
      var getCurrent = $_49qg0cwjje5o2xv6.curry(getTop, element);
      var update = function (newTop) {
        $_2jybvt103je5o2y95.set(element, 'top', newTop + 'px');
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
    var newTop = amount + $_6yytpv15zje5o2z7z.getYFixedData(element) + 'px';
    $_2jybvt103je5o2y95.set(element, 'top', newTop);
  };
  var moveWindowScroll = function (toolbar, viewport, destY) {
    var outerWindow = $_5i5voox3je5o2xx2.owner(toolbar).dom().defaultView;
    return Future.nu(function (callback) {
      updateTop(toolbar, destY);
      updateTop(viewport, destY);
      outerWindow.scrollTo(0, destY);
      callback(destY);
    });
  };
  var $_38t3un15uje5o2z7a = {
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
    var greenzone = $_g1ic2s160je5o2zam.getGreenzone(socket, dropup);
    var refreshCursor = $_49qg0cwjje5o2xv6.curry($_52iihm15qje5o2z6c.refresh, cWin);
    if (top > greenzone || bottom > greenzone) {
      $_38t3un15uje5o2z7a.moveOnlyScroll(socket, socket.dom().scrollTop - greenzone + bottom).get(refreshCursor);
    } else if (top < 0) {
      $_38t3un15uje5o2z7a.moveOnlyScroll(socket, socket.dom().scrollTop + top).get(refreshCursor);
    } else {
    }
  };
  var $_c0l1r4163je5o2zb0 = { scrollIntoView: scrollIntoView };

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
        $_8kvqz0wsje5o2xvo.each(asyncValues, function (asyncValue, i) {
          asyncValue.get(cb(i));
        });
      }
    });
  };
  var $_21prhs166je5o2zbb = { par: par };

  var par$1 = function (futures) {
    return $_21prhs166je5o2zbb.par(futures, Future.nu);
  };
  var mapM = function (array, fn) {
    var futures = $_8kvqz0wsje5o2xvo.map(array, fn);
    return par$1(futures);
  };
  var compose$1 = function (f, g) {
    return function (a) {
      return g(a).bind(f);
    };
  };
  var $_9oeuq165je5o2zba = {
    par: par$1,
    mapM: mapM,
    compose: compose$1
  };

  var updateFixed = function (element, property, winY, offsetY) {
    var destination = winY + offsetY;
    $_2jybvt103je5o2y95.set(element, property, destination + 'px');
    return Future.pure(offsetY);
  };
  var updateScrollingFixed = function (element, winY, offsetY) {
    var destTop = winY + offsetY;
    var oldProp = $_2jybvt103je5o2y95.getRaw(element, 'top').getOr(offsetY);
    var delta = destTop - parseInt(oldProp, 10);
    var destScroll = element.dom().scrollTop + delta;
    return $_38t3un15uje5o2z7a.moveScrollAndTop(element, destScroll, destTop);
  };
  var updateFixture = function (fixture, winY) {
    return fixture.fold(function (element, property, offsetY) {
      return updateFixed(element, property, winY, offsetY);
    }, function (element, offsetY) {
      return updateScrollingFixed(element, winY, offsetY);
    });
  };
  var updatePositions = function (container, winY) {
    var fixtures = $_6yytpv15zje5o2z7z.findFixtures(container);
    var updates = $_8kvqz0wsje5o2xvo.map(fixtures, function (fixture) {
      return updateFixture(fixture, winY);
    });
    return $_9oeuq165je5o2zba.par(updates);
  };
  var $_enbqvd164je5o2zb3 = { updatePositions: updatePositions };

  var VIEW_MARGIN = 5;
  var register$2 = function (toolstrip, socket, container, outerWindow, structure, cWin) {
    var scroller = BackgroundActivity(function (y) {
      return $_38t3un15uje5o2z7a.moveWindowScroll(toolstrip, socket, y);
    });
    var scrollBounds = function () {
      var rects = $_5d2yog148je5o2yxa.getRectangles(cWin);
      return Option.from(rects[0]).bind(function (rect) {
        var viewTop = rect.top() - socket.dom().scrollTop;
        var outside = viewTop > outerWindow.innerHeight + VIEW_MARGIN || viewTop < -VIEW_MARGIN;
        return outside ? Option.some({
          top: $_49qg0cwjje5o2xv6.constant(viewTop),
          bottom: $_49qg0cwjje5o2xv6.constant(viewTop + rect.height())
        }) : Option.none();
      });
    };
    var scrollThrottle = $_3x414o14wje5o2z0k.last(function () {
      scroller.idle(function () {
        $_enbqvd164je5o2zb3.updatePositions(container, outerWindow.pageYOffset).get(function () {
          var extraScroll = scrollBounds();
          extraScroll.each(function (extra) {
            socket.dom().scrollTop = socket.dom().scrollTop + extra.top();
          });
          scroller.start(0);
          structure.refresh();
        });
      });
    }, 1000);
    var onScroll = $_etlh9713xje5o2yvn.bind($_f7rai4xfje5o2xy5.fromDom(outerWindow), 'scroll', function () {
      if (outerWindow.pageYOffset < 0) {
        return;
      }
      scrollThrottle.throttle();
    });
    $_enbqvd164je5o2zb3.updatePositions(container, outerWindow.pageYOffset).get($_49qg0cwjje5o2xv6.identity);
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
    var structure = $_6yytpv15zje5o2z7z.takeover(socket, ceBody, toolstrip, dropup);
    var keyboardModel = keyboardType(bag.outerBody(), cWin, $_4ff55vxjje5o2xyf.body(), contentElement, toolstrip, toolbar);
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
    var onOrientation = $_41wlrp13wje5o2yvh.onChange(outerWindow, {
      onChange: $_49qg0cwjje5o2xv6.noop,
      onReady: structure.refresh
    });
    onOrientation.onAdjustment(function () {
      structure.refresh();
    });
    var onResize = $_etlh9713xje5o2yvn.bind($_f7rai4xfje5o2xy5.fromDom(outerWindow), 'resize', function () {
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
      $_c0l1r4163je5o2zb0.scrollIntoView(cWin, socket, dropup, top, bottom);
    };
    var syncHeight = function () {
      $_2jybvt103je5o2y95.set(contentElement, 'height', contentElement.dom().contentWindow.document.body.scrollHeight + 'px');
    };
    var setViewportOffset = function (newYOffset) {
      structure.setViewportOffset(newYOffset);
      $_38t3un15uje5o2z7a.moveOnlyTop(socket, newYOffset).get($_49qg0cwjje5o2xv6.identity);
    };
    var destroy = function () {
      structure.restore();
      onOrientation.destroy();
      onScroll.unbind();
      onResize.unbind();
      keyboardModel.destroy();
      unfocusedSelection.destroy();
      $_fneojf15oje5o2z63.input($_4ff55vxjje5o2xyf.body(), $_70842eytje5o2y49.blur);
    };
    return {
      toEditing: toEditing,
      toReading: toReading,
      onToolbarTouch: onToolbarTouch,
      refreshSelection: refreshSelection,
      clearSelection: clearSelection,
      highlightSelection: highlightSelection,
      scrollIntoView: scrollIntoView,
      updateToolbarPadding: $_49qg0cwjje5o2xv6.noop,
      setViewportOffset: setViewportOffset,
      syncHeight: syncHeight,
      refreshStructure: structure.refresh,
      destroy: destroy
    };
  };
  var $_613g2215sje5o2z6n = { setup: setup$3 };

  var create$8 = function (platform, mask) {
    var meta = $_3hno2p14uje5o2z08.tag();
    var priorState = $_6u06mm12oje5o2yne.value();
    var scrollEvents = $_6u06mm12oje5o2yne.value();
    var iosApi = $_6u06mm12oje5o2yne.api();
    var iosEvents = $_6u06mm12oje5o2yne.api();
    var enter = function () {
      mask.hide();
      var doc = $_f7rai4xfje5o2xy5.fromDom(document);
      $_amy3p214sje5o2yzn.getActiveApi(platform.editor).each(function (editorApi) {
        priorState.set({
          socketHeight: $_2jybvt103je5o2y95.getRaw(platform.socket, 'height'),
          iframeHeight: $_2jybvt103je5o2y95.getRaw(editorApi.frame(), 'height'),
          outerScroll: document.body.scrollTop
        });
        scrollEvents.set({ exclusives: $_80hgxe153je5o2z1k.exclusive(doc, '.' + $_aj0ve213uje5o2yv9.scrollable()) });
        $_8ppxz2ynje5o2y3s.add(platform.container, $_dqvuwxzeje5o2y6o.resolve('fullscreen-maximized'));
        $_4jw0fv14tje5o2yzv.clobberStyles(platform.container, editorApi.body());
        meta.maximize();
        $_2jybvt103je5o2y95.set(platform.socket, 'overflow', 'scroll');
        $_2jybvt103je5o2y95.set(platform.socket, '-webkit-overflow-scrolling', 'touch');
        $_70842eytje5o2y49.focus(editorApi.body());
        var setupBag = $_2y7sshx4je5o2xxa.immutableBag([
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
        iosApi.set($_613g2215sje5o2z6n.setup(setupBag({
          cWin: editorApi.win(),
          ceBody: editorApi.body(),
          socket: platform.socket,
          toolstrip: platform.toolstrip,
          toolbar: platform.toolbar,
          dropup: platform.dropup.element(),
          contentElement: editorApi.frame(),
          cursor: $_49qg0cwjje5o2xv6.noop,
          outerBody: platform.body,
          outerWindow: platform.win,
          keyboardType: $_be7uaq15nje5o2z5r.stubborn,
          isScrolling: function () {
            return scrollEvents.get().exists(function (s) {
              return s.socket.isScrolling();
            });
          }
        })));
        iosApi.run(function (api) {
          api.syncHeight();
        });
        iosEvents.set($_cjf39x15rje5o2z6f.initEvents(editorApi, iosApi, platform.toolstrip, platform.socket, platform.dropup));
      });
    };
    var exit = function () {
      meta.restore();
      iosEvents.clear();
      iosApi.clear();
      mask.show();
      priorState.on(function (s) {
        s.socketHeight.each(function (h) {
          $_2jybvt103je5o2y95.set(platform.socket, 'height', h);
        });
        s.iframeHeight.each(function (h) {
          $_2jybvt103je5o2y95.set(platform.editor.getFrame(), 'height', h);
        });
        document.body.scrollTop = s.scrollTop;
      });
      priorState.clear();
      scrollEvents.on(function (s) {
        s.exclusives.unbind();
      });
      scrollEvents.clear();
      $_8ppxz2ynje5o2y3s.remove(platform.container, $_dqvuwxzeje5o2y6o.resolve('fullscreen-maximized'));
      $_4jw0fv14tje5o2yzv.restoreStyles();
      $_aj0ve213uje5o2yv9.deregister(platform.toolbar);
      $_2jybvt103je5o2y95.remove(platform.socket, 'overflow');
      $_2jybvt103je5o2y95.remove(platform.socket, '-webkit-overflow-scrolling');
      $_70842eytje5o2y49.blur(platform.editor.getFrame());
      $_amy3p214sje5o2yzn.getActiveApi(platform.editor).each(function (editorApi) {
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
  var $_cetg6y15mje5o2z5i = { create: create$8 };

  var produce$1 = function (raw) {
    var mobile = $_1ui3lpyeje5o2y2u.asRawOrDie('Getting IosWebapp schema', MobileSchema, raw);
    $_2jybvt103je5o2y95.set(mobile.toolstrip, 'width', '100%');
    $_2jybvt103je5o2y95.set(mobile.container, 'position', 'relative');
    var onView = function () {
      mobile.setReadOnly(true);
      mode.enter();
    };
    var mask = $_cu5wb112tje5o2yoe.build($_d6qsf614vje5o2z0d.sketch(onView, mobile.translate));
    mobile.alloy.add(mask);
    var maskApi = {
      show: function () {
        mobile.alloy.add(mask);
      },
      hide: function () {
        mobile.alloy.remove(mask);
      }
    };
    var mode = $_cetg6y15mje5o2z5i.create(mobile, maskApi);
    return {
      setReadOnly: mobile.setReadOnly,
      refreshStructure: mode.refreshStructure,
      enter: mode.enter,
      exit: mode.exit,
      destroy: $_49qg0cwjje5o2xv6.noop
    };
  };
  var $_bctoud15lje5o2z5c = { produce: produce$1 };

  function IosRealm (scrollIntoView) {
    var alloy = OuterContainer({ classes: [$_dqvuwxzeje5o2y6o.resolve('ios-container')] });
    var toolbar = ScrollingToolbar();
    var webapp = $_6u06mm12oje5o2yne.api();
    var switchToEdit = $_aicf8b154je5o2z1q.makeEditSwitch(webapp);
    var socket = $_aicf8b154je5o2z1q.makeSocket();
    var dropup = $_6qt0j7155je5o2z23.build(function () {
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
      webapp.set($_bctoud15lje5o2z5c.produce(spec));
    };
    var exit = function () {
      webapp.run(function (w) {
        Replacing.remove(socket, switchToEdit);
        w.exit();
      });
    };
    var updateMode = function (readOnly) {
      $_aicf8b154je5o2z1q.updateMode(socket, switchToEdit, readOnly, alloy.root());
    };
    return {
      system: $_49qg0cwjje5o2xv6.constant(alloy),
      element: alloy.element,
      init: init,
      exit: exit,
      setToolbarGroups: setToolbarGroups,
      setContextToolbar: setContextToolbar,
      focusToolbar: focusToolbar,
      restoreToolbar: restoreToolbar,
      updateMode: updateMode,
      socket: $_49qg0cwjje5o2xv6.constant(socket),
      dropup: $_49qg0cwjje5o2xv6.constant(dropup)
    };
  }

  var EditorManager = tinymce.util.Tools.resolve('tinymce.EditorManager');

  var derive$4 = function (editor) {
    var base = $_fnkom1xsje5o2xzl.readOptFrom(editor.settings, 'skin_url').fold(function () {
      return EditorManager.baseURL + '/skins/' + 'lightgray';
    }, function (url) {
      return url;
    });
    return {
      content: base + '/content.mobile.min.css',
      ui: base + '/skin.mobile.min.css'
    };
  };
  var $_8b8hm6167je5o2zbg = { derive: derive$4 };

  var fontSizes = [
    'x-small',
    'small',
    'medium',
    'large',
    'x-large'
  ];
  var fireChange$1 = function (realm, command, state) {
    realm.system().broadcastOn([$_m50iiz1je5o2y4r.formatChanged()], {
      command: command,
      state: state
    });
  };
  var init$5 = function (realm, editor) {
    var allFormats = $_67wkp4x0je5o2xwn.keys(editor.formatter.get());
    $_8kvqz0wsje5o2xvo.each(allFormats, function (command) {
      editor.formatter.formatChanged(command, function (state) {
        fireChange$1(realm, command, state);
      });
    });
    $_8kvqz0wsje5o2xvo.each([
      'ul',
      'ol'
    ], function (command) {
      editor.selection.selectorChanged(command, function (state, data) {
        fireChange$1(realm, command, state);
      });
    });
  };
  var $_fthnog169je5o2zbq = {
    init: init$5,
    fontSizes: $_49qg0cwjje5o2xv6.constant(fontSizes)
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
  var $_d9w8oq16aje5o2zbu = { fireSkinLoaded: fireSkinLoaded };

  var READING = $_49qg0cwjje5o2xv6.constant('toReading');
  var EDITING = $_49qg0cwjje5o2xv6.constant('toEditing');
  ThemeManager.add('mobile', function (editor) {
    var renderUI = function (args) {
      var cssUrls = $_8b8hm6167je5o2zbg.derive(editor);
      if ($_4eru57z0je5o2y4q.isSkinDisabled(editor) === false) {
        editor.contentCSS.push(cssUrls.content);
        DOMUtils.DOM.styleSheetLoader.load(cssUrls.ui, $_d9w8oq16aje5o2zbu.fireSkinLoaded(editor));
      } else {
        $_d9w8oq16aje5o2zbu.fireSkinLoaded(editor)();
      }
      var doScrollIntoView = function () {
        editor.fire('scrollIntoView');
      };
      var wrapper = $_f7rai4xfje5o2xy5.fromTag('div');
      var realm = $_6ys1d4wkje5o2xv8.detect().os.isAndroid() ? AndroidRealm(doScrollIntoView) : IosRealm(doScrollIntoView);
      var original = $_f7rai4xfje5o2xy5.fromDom(args.targetNode);
      $_9je15xx2je5o2xx0.after(original, wrapper);
      $_s45jfx1je5o2xwq.attachSystem(wrapper, realm.system());
      var findFocusIn = function (elem) {
        return $_70842eytje5o2y49.search(elem).bind(function (focused) {
          return realm.system().getByDom(focused).toOption();
        });
      };
      var outerWindow = args.targetNode.ownerDocument.defaultView;
      var orientation = $_41wlrp13wje5o2yvh.onChange(outerWindow, {
        onChange: function () {
          var alloy = realm.system();
          alloy.broadcastOn([$_m50iiz1je5o2y4r.orientationChanged()], { width: $_41wlrp13wje5o2yvh.getActualWidth(outerWindow) });
        },
        onReady: $_49qg0cwjje5o2xv6.noop
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
              return $_f7rai4xfje5o2xy5.fromDom(editor.contentAreaContainer.querySelector('iframe'));
            },
            onDomChanged: function () {
              return { unbind: $_49qg0cwjje5o2xv6.noop };
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
              var toolbar = $_f7rai4xfje5o2xy5.fromDom(editor.editorContainer.querySelector('.' + $_dqvuwxzeje5o2y6o.resolve('toolbar')));
              findFocusIn(toolbar).each($_d7275bwgje5o2xut.emitExecute);
              realm.restoreToolbar();
              hideDropup();
            },
            onTapContent: function (evt) {
              var target = evt.target();
              if ($_5souzyxkje5o2xyh.name(target) === 'img') {
                editor.selection.select(target.dom());
                evt.kill();
              } else if ($_5souzyxkje5o2xyh.name(target) === 'a') {
                var component = realm.system().getByDom($_f7rai4xfje5o2xy5.fromDom(editor.editorContainer));
                component.each(function (container) {
                  if (Swapping.isAlpha(container)) {
                    $_5f166vyzje5o2y4p.openLink(target.dom());
                  }
                });
              }
            }
          },
          container: $_f7rai4xfje5o2xy5.fromDom(editor.editorContainer),
          socket: $_f7rai4xfje5o2xy5.fromDom(editor.contentAreaContainer),
          toolstrip: $_f7rai4xfje5o2xy5.fromDom(editor.editorContainer.querySelector('.' + $_dqvuwxzeje5o2y6o.resolve('toolstrip'))),
          toolbar: $_f7rai4xfje5o2xy5.fromDom(editor.editorContainer.querySelector('.' + $_dqvuwxzeje5o2y6o.resolve('toolbar'))),
          dropup: realm.dropup(),
          alloy: realm.system(),
          translate: $_49qg0cwjje5o2xv6.noop,
          setReadOnly: function (ro) {
            setReadOnly(readOnlyGroups, mainGroups, ro);
          }
        });
        var hideDropup = function () {
          realm.dropup().disappear(function () {
            realm.system().broadcastOn([$_m50iiz1je5o2y4r.dropupDismissed()], {});
          });
        };
        $_eivumrxlje5o2xyj.registerInspector('remove this', realm.system());
        var backToMaskGroup = {
          label: 'The first group',
          scrollable: false,
          items: [$_2abrklzfje5o2y6q.forToolbar('back', function () {
              editor.selection.collapse();
              realm.exit();
            }, {})]
        };
        var backToReadOnlyGroup = {
          label: 'Back to read only',
          scrollable: false,
          items: [$_2abrklzfje5o2y6q.forToolbar('readonly-back', function () {
              setReadOnly(readOnlyGroups, mainGroups, true);
            }, {})]
        };
        var readOnlyGroup = {
          label: 'The read only mode group',
          scrollable: true,
          items: []
        };
        var features = $_2i3ubfz2je5o2y4t.setup(realm, editor);
        var items = $_2i3ubfz2je5o2y4t.detect(editor.settings, features);
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
        $_fthnog169je5o2zbq.init(realm, editor);
      });
      return {
        iframeContainer: realm.socket().element().dom(),
        editorContainer: realm.element().dom()
      };
    };
    return {
      getNotificationManagerImpl: function () {
        return {
          open: $_49qg0cwjje5o2xv6.identity,
          close: $_49qg0cwjje5o2xv6.noop,
          reposition: $_49qg0cwjje5o2xv6.noop,
          getArgs: $_49qg0cwjje5o2xv6.identity
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
