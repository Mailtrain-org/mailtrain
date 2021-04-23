(function () {
var fullpage = (function () {
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

  var Tools = tinymce.util.Tools.resolve('tinymce.util.Tools');

  var DomParser = tinymce.util.Tools.resolve('tinymce.html.DomParser');

  var Node = tinymce.util.Tools.resolve('tinymce.html.Node');

  var Serializer = tinymce.util.Tools.resolve('tinymce.html.Serializer');

  var shouldHideInSourceView = function (editor) {
    return editor.getParam('fullpage_hide_in_source_view');
  };
  var getDefaultXmlPi = function (editor) {
    return editor.getParam('fullpage_default_xml_pi');
  };
  var getDefaultEncoding = function (editor) {
    return editor.getParam('fullpage_default_encoding');
  };
  var getDefaultFontFamily = function (editor) {
    return editor.getParam('fullpage_default_font_family');
  };
  var getDefaultFontSize = function (editor) {
    return editor.getParam('fullpage_default_font_size');
  };
  var getDefaultTextColor = function (editor) {
    return editor.getParam('fullpage_default_text_color');
  };
  var getDefaultTitle = function (editor) {
    return editor.getParam('fullpage_default_title');
  };
  var getDefaultDocType = function (editor) {
    return editor.getParam('fullpage_default_doctype', '<!DOCTYPE html>');
  };
  var $_1t711zbdje5o2tkv = {
    shouldHideInSourceView: shouldHideInSourceView,
    getDefaultXmlPi: getDefaultXmlPi,
    getDefaultEncoding: getDefaultEncoding,
    getDefaultFontFamily: getDefaultFontFamily,
    getDefaultFontSize: getDefaultFontSize,
    getDefaultTextColor: getDefaultTextColor,
    getDefaultTitle: getDefaultTitle,
    getDefaultDocType: getDefaultDocType
  };

  var parseHeader = function (head) {
    return DomParser({
      validate: false,
      root_name: '#document'
    }).parse(head);
  };
  var htmlToData = function (editor, head) {
    var headerFragment = parseHeader(head);
    var data = {};
    var elm, matches;
    function getAttr(elm, name) {
      var value = elm.attr(name);
      return value || '';
    }
    data.fontface = $_1t711zbdje5o2tkv.getDefaultFontFamily(editor);
    data.fontsize = $_1t711zbdje5o2tkv.getDefaultFontSize(editor);
    elm = headerFragment.firstChild;
    if (elm.type === 7) {
      data.xml_pi = true;
      matches = /encoding="([^"]+)"/.exec(elm.value);
      if (matches) {
        data.docencoding = matches[1];
      }
    }
    elm = headerFragment.getAll('#doctype')[0];
    if (elm) {
      data.doctype = '<!DOCTYPE' + elm.value + '>';
    }
    elm = headerFragment.getAll('title')[0];
    if (elm && elm.firstChild) {
      data.title = elm.firstChild.value;
    }
    Tools.each(headerFragment.getAll('meta'), function (meta) {
      var name = meta.attr('name');
      var httpEquiv = meta.attr('http-equiv');
      var matches;
      if (name) {
        data[name.toLowerCase()] = meta.attr('content');
      } else if (httpEquiv === 'Content-Type') {
        matches = /charset\s*=\s*(.*)\s*/gi.exec(meta.attr('content'));
        if (matches) {
          data.docencoding = matches[1];
        }
      }
    });
    elm = headerFragment.getAll('html')[0];
    if (elm) {
      data.langcode = getAttr(elm, 'lang') || getAttr(elm, 'xml:lang');
    }
    data.stylesheets = [];
    Tools.each(headerFragment.getAll('link'), function (link) {
      if (link.attr('rel') === 'stylesheet') {
        data.stylesheets.push(link.attr('href'));
      }
    });
    elm = headerFragment.getAll('body')[0];
    if (elm) {
      data.langdir = getAttr(elm, 'dir');
      data.style = getAttr(elm, 'style');
      data.visited_color = getAttr(elm, 'vlink');
      data.link_color = getAttr(elm, 'link');
      data.active_color = getAttr(elm, 'alink');
    }
    return data;
  };
  var dataToHtml = function (editor, data, head) {
    var headerFragment, headElement, html, elm, value;
    var dom = editor.dom;
    function setAttr(elm, name, value) {
      elm.attr(name, value ? value : undefined);
    }
    function addHeadNode(node) {
      if (headElement.firstChild) {
        headElement.insert(node, headElement.firstChild);
      } else {
        headElement.append(node);
      }
    }
    headerFragment = parseHeader(head);
    headElement = headerFragment.getAll('head')[0];
    if (!headElement) {
      elm = headerFragment.getAll('html')[0];
      headElement = new Node('head', 1);
      if (elm.firstChild) {
        elm.insert(headElement, elm.firstChild, true);
      } else {
        elm.append(headElement);
      }
    }
    elm = headerFragment.firstChild;
    if (data.xml_pi) {
      value = 'version="1.0"';
      if (data.docencoding) {
        value += ' encoding="' + data.docencoding + '"';
      }
      if (elm.type !== 7) {
        elm = new Node('xml', 7);
        headerFragment.insert(elm, headerFragment.firstChild, true);
      }
      elm.value = value;
    } else if (elm && elm.type === 7) {
      elm.remove();
    }
    elm = headerFragment.getAll('#doctype')[0];
    if (data.doctype) {
      if (!elm) {
        elm = new Node('#doctype', 10);
        if (data.xml_pi) {
          headerFragment.insert(elm, headerFragment.firstChild);
        } else {
          addHeadNode(elm);
        }
      }
      elm.value = data.doctype.substring(9, data.doctype.length - 1);
    } else if (elm) {
      elm.remove();
    }
    elm = null;
    Tools.each(headerFragment.getAll('meta'), function (meta) {
      if (meta.attr('http-equiv') === 'Content-Type') {
        elm = meta;
      }
    });
    if (data.docencoding) {
      if (!elm) {
        elm = new Node('meta', 1);
        elm.attr('http-equiv', 'Content-Type');
        elm.shortEnded = true;
        addHeadNode(elm);
      }
      elm.attr('content', 'text/html; charset=' + data.docencoding);
    } else if (elm) {
      elm.remove();
    }
    elm = headerFragment.getAll('title')[0];
    if (data.title) {
      if (!elm) {
        elm = new Node('title', 1);
        addHeadNode(elm);
      } else {
        elm.empty();
      }
      elm.append(new Node('#text', 3)).value = data.title;
    } else if (elm) {
      elm.remove();
    }
    Tools.each('keywords,description,author,copyright,robots'.split(','), function (name) {
      var nodes = headerFragment.getAll('meta');
      var i, meta;
      var value = data[name];
      for (i = 0; i < nodes.length; i++) {
        meta = nodes[i];
        if (meta.attr('name') === name) {
          if (value) {
            meta.attr('content', value);
          } else {
            meta.remove();
          }
          return;
        }
      }
      if (value) {
        elm = new Node('meta', 1);
        elm.attr('name', name);
        elm.attr('content', value);
        elm.shortEnded = true;
        addHeadNode(elm);
      }
    });
    var currentStyleSheetsMap = {};
    Tools.each(headerFragment.getAll('link'), function (stylesheet) {
      if (stylesheet.attr('rel') === 'stylesheet') {
        currentStyleSheetsMap[stylesheet.attr('href')] = stylesheet;
      }
    });
    Tools.each(data.stylesheets, function (stylesheet) {
      if (!currentStyleSheetsMap[stylesheet]) {
        elm = new Node('link', 1);
        elm.attr({
          rel: 'stylesheet',
          text: 'text/css',
          href: stylesheet
        });
        elm.shortEnded = true;
        addHeadNode(elm);
      }
      delete currentStyleSheetsMap[stylesheet];
    });
    Tools.each(currentStyleSheetsMap, function (stylesheet) {
      stylesheet.remove();
    });
    elm = headerFragment.getAll('body')[0];
    if (elm) {
      setAttr(elm, 'dir', data.langdir);
      setAttr(elm, 'style', data.style);
      setAttr(elm, 'vlink', data.visited_color);
      setAttr(elm, 'link', data.link_color);
      setAttr(elm, 'alink', data.active_color);
      dom.setAttribs(editor.getBody(), {
        style: data.style,
        dir: data.dir,
        vLink: data.visited_color,
        link: data.link_color,
        aLink: data.active_color
      });
    }
    elm = headerFragment.getAll('html')[0];
    if (elm) {
      setAttr(elm, 'lang', data.langcode);
      setAttr(elm, 'xml:lang', data.langcode);
    }
    if (!headElement.firstChild) {
      headElement.remove();
    }
    html = Serializer({
      validate: false,
      indent: true,
      apply_source_formatting: true,
      indent_before: 'head,html,body,meta,title,script,link,style',
      indent_after: 'head,html,body,meta,title,script,link,style'
    }).serialize(headerFragment);
    return html.substring(0, html.indexOf('</body>'));
  };
  var $_ekdzrmb9je5o2tkl = {
    parseHeader: parseHeader,
    htmlToData: htmlToData,
    dataToHtml: dataToHtml
  };

  var open = function (editor, headState) {
    var data = $_ekdzrmb9je5o2tkl.htmlToData(editor, headState.get());
    editor.windowManager.open({
      title: 'Document properties',
      data: data,
      defaults: {
        type: 'textbox',
        size: 40
      },
      body: [
        {
          name: 'title',
          label: 'Title'
        },
        {
          name: 'keywords',
          label: 'Keywords'
        },
        {
          name: 'description',
          label: 'Description'
        },
        {
          name: 'robots',
          label: 'Robots'
        },
        {
          name: 'author',
          label: 'Author'
        },
        {
          name: 'docencoding',
          label: 'Encoding'
        }
      ],
      onSubmit: function (e) {
        var headHtml = $_ekdzrmb9je5o2tkl.dataToHtml(editor, Tools.extend(data, e.data), headState.get());
        headState.set(headHtml);
      }
    });
  };
  var $_axf5vgb7je5o2tki = { open: open };

  var register = function (editor, headState) {
    editor.addCommand('mceFullPageProperties', function () {
      $_axf5vgb7je5o2tki.open(editor, headState);
    });
  };
  var $_b3doj8b6je5o2tkh = { register: register };

  var protectHtml = function (protect, html) {
    Tools.each(protect, function (pattern) {
      html = html.replace(pattern, function (str) {
        return '<!--mce:protected ' + escape(str) + '-->';
      });
    });
    return html;
  };
  var unprotectHtml = function (html) {
    return html.replace(/<!--mce:protected ([\s\S]*?)-->/g, function (a, m) {
      return unescape(m);
    });
  };
  var $_1ds3kdbfje5o2tl6 = {
    protectHtml: protectHtml,
    unprotectHtml: unprotectHtml
  };

  var each = Tools.each;
  var low = function (s) {
    return s.replace(/<\/?[A-Z]+/g, function (a) {
      return a.toLowerCase();
    });
  };
  var handleSetContent = function (editor, headState, footState, evt) {
    var startPos, endPos, content, headerFragment, styles = '';
    var dom = editor.dom;
    var elm;
    if (evt.selection) {
      return;
    }
    content = $_1ds3kdbfje5o2tl6.protectHtml(editor.settings.protect, evt.content);
    if (evt.format === 'raw' && headState.get()) {
      return;
    }
    if (evt.source_view && $_1t711zbdje5o2tkv.shouldHideInSourceView(editor)) {
      return;
    }
    if (content.length === 0 && !evt.source_view) {
      content = Tools.trim(headState.get()) + '\n' + Tools.trim(content) + '\n' + Tools.trim(footState.get());
    }
    content = content.replace(/<(\/?)BODY/gi, '<$1body');
    startPos = content.indexOf('<body');
    if (startPos !== -1) {
      startPos = content.indexOf('>', startPos);
      headState.set(low(content.substring(0, startPos + 1)));
      endPos = content.indexOf('</body', startPos);
      if (endPos === -1) {
        endPos = content.length;
      }
      evt.content = Tools.trim(content.substring(startPos + 1, endPos));
      footState.set(low(content.substring(endPos)));
    } else {
      headState.set(getDefaultHeader(editor));
      footState.set('\n</body>\n</html>');
    }
    headerFragment = $_ekdzrmb9je5o2tkl.parseHeader(headState.get());
    each(headerFragment.getAll('style'), function (node) {
      if (node.firstChild) {
        styles += node.firstChild.value;
      }
    });
    elm = headerFragment.getAll('body')[0];
    if (elm) {
      dom.setAttribs(editor.getBody(), {
        style: elm.attr('style') || '',
        dir: elm.attr('dir') || '',
        vLink: elm.attr('vlink') || '',
        link: elm.attr('link') || '',
        aLink: elm.attr('alink') || ''
      });
    }
    dom.remove('fullpage_styles');
    var headElm = editor.getDoc().getElementsByTagName('head')[0];
    if (styles) {
      dom.add(headElm, 'style', { id: 'fullpage_styles' }, styles);
      elm = dom.get('fullpage_styles');
      if (elm.styleSheet) {
        elm.styleSheet.cssText = styles;
      }
    }
    var currentStyleSheetsMap = {};
    Tools.each(headElm.getElementsByTagName('link'), function (stylesheet) {
      if (stylesheet.rel === 'stylesheet' && stylesheet.getAttribute('data-mce-fullpage')) {
        currentStyleSheetsMap[stylesheet.href] = stylesheet;
      }
    });
    Tools.each(headerFragment.getAll('link'), function (stylesheet) {
      var href = stylesheet.attr('href');
      if (!href) {
        return true;
      }
      if (!currentStyleSheetsMap[href] && stylesheet.attr('rel') === 'stylesheet') {
        dom.add(headElm, 'link', {
          'rel': 'stylesheet',
          'text': 'text/css',
          'href': href,
          'data-mce-fullpage': '1'
        });
      }
      delete currentStyleSheetsMap[href];
    });
    Tools.each(currentStyleSheetsMap, function (stylesheet) {
      stylesheet.parentNode.removeChild(stylesheet);
    });
  };
  var getDefaultHeader = function (editor) {
    var header = '', value, styles = '';
    if ($_1t711zbdje5o2tkv.getDefaultXmlPi(editor)) {
      var piEncoding = $_1t711zbdje5o2tkv.getDefaultEncoding(editor);
      header += '<?xml version="1.0" encoding="' + (piEncoding ? piEncoding : 'ISO-8859-1') + '" ?>\n';
    }
    header += $_1t711zbdje5o2tkv.getDefaultDocType(editor);
    header += '\n<html>\n<head>\n';
    if (value = $_1t711zbdje5o2tkv.getDefaultTitle(editor)) {
      header += '<title>' + value + '</title>\n';
    }
    if (value = $_1t711zbdje5o2tkv.getDefaultEncoding(editor)) {
      header += '<meta http-equiv="Content-Type" content="text/html; charset=' + value + '" />\n';
    }
    if (value = $_1t711zbdje5o2tkv.getDefaultFontFamily(editor)) {
      styles += 'font-family: ' + value + ';';
    }
    if (value = $_1t711zbdje5o2tkv.getDefaultFontSize(editor)) {
      styles += 'font-size: ' + value + ';';
    }
    if (value = $_1t711zbdje5o2tkv.getDefaultTextColor(editor)) {
      styles += 'color: ' + value + ';';
    }
    header += '</head>\n<body' + (styles ? ' style="' + styles + '"' : '') + '>\n';
    return header;
  };
  var handleGetContent = function (editor, head, foot, evt) {
    if (!evt.selection && (!evt.source_view || !$_1t711zbdje5o2tkv.shouldHideInSourceView(editor))) {
      evt.content = $_1ds3kdbfje5o2tl6.unprotectHtml(Tools.trim(head) + '\n' + Tools.trim(evt.content) + '\n' + Tools.trim(foot));
    }
  };
  var setup = function (editor, headState, footState) {
    editor.on('BeforeSetContent', function (evt) {
      handleSetContent(editor, headState, footState, evt);
    });
    editor.on('GetContent', function (evt) {
      handleGetContent(editor, headState.get(), footState.get(), evt);
    });
  };
  var $_a5bjhlbeje5o2tl0 = { setup: setup };

  var register$1 = function (editor) {
    editor.addButton('fullpage', {
      title: 'Document properties',
      cmd: 'mceFullPageProperties'
    });
    editor.addMenuItem('fullpage', {
      text: 'Document properties',
      cmd: 'mceFullPageProperties',
      context: 'file'
    });
  };
  var $_99f5orbgje5o2tl7 = { register: register$1 };

  PluginManager.add('fullpage', function (editor) {
    var headState = Cell(''), footState = Cell('');
    $_b3doj8b6je5o2tkh.register(editor, headState);
    $_99f5orbgje5o2tl7.register(editor);
    $_a5bjhlbeje5o2tl0.setup(editor, headState, footState);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
