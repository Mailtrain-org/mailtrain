(function () {
var code = (function () {
  'use strict';

  var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var DOMUtils = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

  var getMinWidth = function (editor) {
    return editor.getParam('code_dialog_width', 600);
  };
  var getMinHeight = function (editor) {
    return editor.getParam('code_dialog_height', Math.min(DOMUtils.DOM.getViewPort().h - 200, 500));
  };
  var $_egow1k9aje5o2tb0 = {
    getMinWidth: getMinWidth,
    getMinHeight: getMinHeight
  };

  var setContent = function (editor, html) {
    editor.focus();
    editor.undoManager.transact(function () {
      editor.setContent(html);
    });
    editor.selection.setCursorLocation();
    editor.nodeChanged();
  };
  var getContent = function (editor) {
    return editor.getContent({ source_view: true });
  };
  var $_3bjmii9cje5o2tb2 = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_egow1k9aje5o2tb0.getMinWidth(editor);
    var minHeight = $_egow1k9aje5o2tb0.getMinHeight(editor);
    var win = editor.windowManager.open({
      title: 'Source code',
      body: {
        type: 'textbox',
        name: 'code',
        multiline: true,
        minWidth: minWidth,
        minHeight: minHeight,
        spellcheck: false,
        style: 'direction: ltr; text-align: left'
      },
      onSubmit: function (e) {
        $_3bjmii9cje5o2tb2.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_3bjmii9cje5o2tb2.getContent(editor));
  };
  var $_e8lpox99je5o2tay = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_e8lpox99je5o2tay.open(editor);
    });
  };
  var $_23iixx98je5o2taw = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_e8lpox99je5o2tay.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_e8lpox99je5o2tay.open(editor);
      }
    });
  };
  var $_965sk49dje5o2tb3 = { register: register$1 };

  PluginManager.add('code', function (editor) {
    $_23iixx98je5o2taw.register(editor);
    $_965sk49dje5o2tb3.register(editor);
    return {};
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
