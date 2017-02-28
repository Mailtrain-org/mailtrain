This files are not yet directly used by mosaico.

You can use ```Mosaico.init({ strings: #thecontentofoneofthisfiles# })``` to initialize mosaico in a given language.

You can provide new translations to our mosaico translations project on Transifex: https://www.transifex.com/void-labs/mosaico

Please note that this just translate the main Mosaico UI: some parts of the UI are defined by the template and their "labels" cannot be translated by the library because each template defines its own labels/texts. So you may want to create your own "translated" templates by altering the "source" html for the template.

You can even force mosaico to run the internal translation tool for the template labels by defining a [plugin](https://github.com/voidlabs/mosaico/wiki/Mosaico-Plugins):
```javascript
  var plugin = function(vm) {
    vm.ut = vm.tt;
  };
```

Please get in touch with us by sending an email to info on the mosaico.io domain including your email and the language you'd like to contribute.

Thanks to translators:
it (Italian): Mosaico Team
de (German): Bernhard Weichel
es (Spanish): Carlos Jacobs
fr (French): Jonathan Loriaux
nl (Dutch): Pieter Emeis
sv (Swedish): P-H Westman

Sign-up to Transifex if you want to collaborate or suggest changes to the current languages!
