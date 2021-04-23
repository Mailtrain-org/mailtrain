(function () {
var textpattern = (function () {
  'use strict';

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

  var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var get = function (patternsState) {
    var setPatterns = function (newPatterns) {
      patternsState.set(newPatterns);
    };
    var getPatterns = function () {
      return patternsState.get();
    };
    return {
      setPatterns: setPatterns,
      getPatterns: getPatterns
    };
  };
  var $_nrzbfqgje5o2wh7 = { get: get };

  var defaultPatterns = [
    {
      start: '*',
      end: '*',
      format: 'italic'
    },
    {
      start: '**',
      end: '**',
      format: 'bold'
    },
    {
      start: '***',
      end: '***',
      format: [
        'bold',
        'italic'
      ]
    },
    {
      start: '#',
      format: 'h1'
    },
    {
      start: '##',
      format: 'h2'
    },
    {
      start: '###',
      format: 'h3'
    },
    {
      start: '####',
      format: 'h4'
    },
    {
      start: '#####',
      format: 'h5'
    },
    {
      start: '######',
      format: 'h6'
    },
    {
      start: '1. ',
      cmd: 'InsertOrderedList'
    },
    {
      start: '* ',
      cmd: 'InsertUnorderedList'
    },
    {
      start: '- ',
      cmd: 'InsertUnorderedList'
    }
  ];
  var getPatterns = function (editorSettings) {
    return editorSettings.textpattern_patterns !== undefined ? editorSettings.textpattern_patterns : defaultPatterns;
  };
  var $_x9knwqhje5o2wh8 = { getPatterns: getPatterns };

  var Delay = tinymce.util.Tools.resolve('tinymce.util.Delay');

  var VK = tinymce.util.Tools.resolve('tinymce.util.VK');

  var TreeWalker = tinymce.util.Tools.resolve('tinymce.dom.TreeWalker');

  var Tools = tinymce.util.Tools.resolve('tinymce.util.Tools');

  var sortPatterns = function (patterns) {
    return patterns.sort(function (a, b) {
      if (a.start.length > b.start.length) {
        return -1;
      }
      if (a.start.length < b.start.length) {
        return 1;
      }
      return 0;
    });
  };
  var findPattern = function (patterns, text) {
    for (var i = 0; i < patterns.length; i++) {
      if (text.indexOf(patterns[i].start) !== 0) {
        continue;
      }
      if (patterns[i].end && text.lastIndexOf(patterns[i].end) !== text.length - patterns[i].end.length) {
        continue;
      }
      return patterns[i];
    }
  };
  var isMatchingPattern = function (pattern, text, offset, delta) {
    var textEnd = text.substr(offset - pattern.end.length - delta, pattern.end.length);
    return textEnd === pattern.end;
  };
  var hasContent = function (offset, delta, pattern) {
    return offset - delta - pattern.end.length - pattern.start.length > 0;
  };
  var findEndPattern = function (patterns, text, offset, delta) {
    var pattern, i;
    var sortedPatterns = sortPatterns(patterns);
    for (i = 0; i < sortedPatterns.length; i++) {
      pattern = sortedPatterns[i];
      if (pattern.end !== undefined && isMatchingPattern(pattern, text, offset, delta) && hasContent(offset, delta, pattern)) {
        return pattern;
      }
    }
  };
  var $_25znbqpje5o2whi = {
    findPattern: findPattern,
    findEndPattern: findEndPattern
  };

  var splitContainer = function (container, pattern, endOffset, startOffset, space) {
    container = startOffset > 0 ? container.splitText(startOffset) : container;
    container.splitText(endOffset - startOffset + pattern.end.length);
    container.deleteData(0, pattern.start.length);
    container.deleteData(container.data.length - pattern.end.length, pattern.end.length);
    return container;
  };
  var patternFromRng = function (patterns, rng, space) {
    if (rng.collapsed === false) {
      return;
    }
    var container = rng.startContainer;
    var text = container.data;
    var delta = space === true ? 1 : 0;
    if (container.nodeType !== 3) {
      return;
    }
    var endPattern = $_25znbqpje5o2whi.findEndPattern(patterns, text, rng.startOffset, delta);
    if (endPattern === undefined) {
      return;
    }
    var endOffset = text.lastIndexOf(endPattern.end, rng.startOffset - delta);
    var startOffset = text.lastIndexOf(endPattern.start, endOffset - endPattern.end.length);
    endOffset = text.indexOf(endPattern.end, startOffset + endPattern.start.length);
    if (startOffset === -1) {
      return;
    }
    var patternRng = document.createRange();
    patternRng.setStart(container, startOffset);
    patternRng.setEnd(container, endOffset + endPattern.end.length);
    var startPattern = $_25znbqpje5o2whi.findPattern(patterns, patternRng.toString());
    if (endPattern === undefined || startPattern !== endPattern || container.data.length <= endPattern.start.length + endPattern.end.length) {
      return;
    }
    return {
      pattern: endPattern,
      startOffset: startOffset,
      endOffset: endOffset
    };
  };
  var splitAndApply = function (editor, container, found, space) {
    var formatArray = Tools.isArray(found.pattern.format) ? found.pattern.format : [found.pattern.format];
    var validFormats = Tools.grep(formatArray, function (formatName) {
      var format = editor.formatter.get(formatName);
      return format && format[0].inline;
    });
    if (validFormats.length !== 0) {
      editor.undoManager.transact(function () {
        container = splitContainer(container, found.pattern, found.endOffset, found.startOffset, space);
        formatArray.forEach(function (format) {
          editor.formatter.apply(format, {}, container);
        });
      });
      return container;
    }
  };
  var doApplyInlineFormat = function (editor, patterns, space) {
    var rng = editor.selection.getRng(true);
    var foundPattern = patternFromRng(patterns, rng, space);
    if (foundPattern) {
      return splitAndApply(editor, rng.startContainer, foundPattern, space);
    }
  };
  var applyInlineFormatSpace = function (editor, patterns) {
    return doApplyInlineFormat(editor, patterns, true);
  };
  var applyInlineFormatEnter = function (editor, patterns) {
    return doApplyInlineFormat(editor, patterns, false);
  };
  var applyBlockFormat = function (editor, patterns) {
    var selection, dom, container, firstTextNode, node, format, textBlockElm, pattern, walker, rng, offset;
    selection = editor.selection;
    dom = editor.dom;
    if (!selection.isCollapsed()) {
      return;
    }
    textBlockElm = dom.getParent(selection.getStart(), 'p');
    if (textBlockElm) {
      walker = new TreeWalker(textBlockElm, textBlockElm);
      while (node = walker.next()) {
        if (node.nodeType === 3) {
          firstTextNode = node;
          break;
        }
      }
      if (firstTextNode) {
        pattern = $_25znbqpje5o2whi.findPattern(patterns, firstTextNode.data);
        if (!pattern) {
          return;
        }
        rng = selection.getRng(true);
        container = rng.startContainer;
        offset = rng.startOffset;
        if (firstTextNode === container) {
          offset = Math.max(0, offset - pattern.start.length);
        }
        if (Tools.trim(firstTextNode.data).length === pattern.start.length) {
          return;
        }
        if (pattern.format) {
          format = editor.formatter.get(pattern.format);
          if (format && format[0].block) {
            firstTextNode.deleteData(0, pattern.start.length);
            editor.formatter.apply(pattern.format, {}, firstTextNode);
            rng.setStart(container, offset);
            rng.collapse(true);
            selection.setRng(rng);
          }
        }
        if (pattern.cmd) {
          editor.undoManager.transact(function () {
            firstTextNode.deleteData(0, pattern.start.length);
            editor.execCommand(pattern.cmd);
          });
        }
      }
    }
  };
  var $_c74arcqmje5o2whe = {
    patternFromRng: patternFromRng,
    applyInlineFormatSpace: applyInlineFormatSpace,
    applyInlineFormatEnter: applyInlineFormatEnter,
    applyBlockFormat: applyBlockFormat
  };

  function handleEnter(editor, patterns) {
    var wrappedTextNode, rng;
    wrappedTextNode = $_c74arcqmje5o2whe.applyInlineFormatEnter(editor, patterns);
    if (wrappedTextNode) {
      rng = editor.dom.createRng();
      rng.setStart(wrappedTextNode, wrappedTextNode.data.length);
      rng.setEnd(wrappedTextNode, wrappedTextNode.data.length);
      editor.selection.setRng(rng);
    }
    $_c74arcqmje5o2whe.applyBlockFormat(editor, patterns);
  }
  function handleInlineKey(editor, patterns) {
    var wrappedTextNode, lastChar, lastCharNode, rng, dom;
    wrappedTextNode = $_c74arcqmje5o2whe.applyInlineFormatSpace(editor, patterns);
    if (wrappedTextNode) {
      dom = editor.dom;
      lastChar = wrappedTextNode.data.slice(-1);
      if (/[\u00a0 ]/.test(lastChar)) {
        wrappedTextNode.deleteData(wrappedTextNode.data.length - 1, 1);
        lastCharNode = dom.doc.createTextNode(lastChar);
        dom.insertAfter(lastCharNode, wrappedTextNode.parentNode);
        rng = dom.createRng();
        rng.setStart(lastCharNode, 1);
        rng.setEnd(lastCharNode, 1);
        editor.selection.setRng(rng);
      }
    }
  }
  var checkKeyEvent = function (codes, event, predicate) {
    for (var i = 0; i < codes.length; i++) {
      if (predicate(codes[i], event)) {
        return true;
      }
    }
  };
  var checkKeyCode = function (codes, event) {
    return checkKeyEvent(codes, event, function (code, event) {
      return code === event.keyCode && VK.modifierPressed(event) === false;
    });
  };
  var checkCharCode = function (chars, event) {
    return checkKeyEvent(chars, event, function (chr, event) {
      return chr.charCodeAt(0) === event.charCode;
    });
  };
  var $_4uqogkqlje5o2whb = {
    handleEnter: handleEnter,
    handleInlineKey: handleInlineKey,
    checkCharCode: checkCharCode,
    checkKeyCode: checkKeyCode
  };

  var setup = function (editor, patternsState) {
    var charCodes = [
      ',',
      '.',
      ';',
      ':',
      '!',
      '?'
    ];
    var keyCodes = [32];
    editor.on('keydown', function (e) {
      if (e.keyCode === 13 && !VK.modifierPressed(e)) {
        $_4uqogkqlje5o2whb.handleEnter(editor, patternsState.get());
      }
    }, true);
    editor.on('keyup', function (e) {
      if ($_4uqogkqlje5o2whb.checkKeyCode(keyCodes, e)) {
        $_4uqogkqlje5o2whb.handleInlineKey(editor, patternsState.get());
      }
    });
    editor.on('keypress', function (e) {
      if ($_4uqogkqlje5o2whb.checkCharCode(charCodes, e)) {
        Delay.setEditorTimeout(editor, function () {
          $_4uqogkqlje5o2whb.handleInlineKey(editor, patternsState.get());
        });
      }
    });
  };
  var $_2hfp33qije5o2wh9 = { setup: setup };

  PluginManager.add('textpattern', function (editor) {
    var patternsState = Cell($_x9knwqhje5o2wh8.getPatterns(editor.settings));
    $_2hfp33qije5o2wh9.setup(editor, patternsState);
    return $_nrzbfqgje5o2wh7.get(patternsState);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
