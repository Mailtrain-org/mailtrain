'use strict';
/* global grapesjs, toastr, confirm */
/* eslint no-var: "off", prefer-arrow-callback:"off", object-shorthand:"off" */

grapesjs.plugins.add('gjs-preset-mjml', (editor, opts) => {

    var updateTooltip = function (coll, pos) {
        coll.each(function (item) {
            var attrs = item.get('attributes');
            attrs['data-tooltip-pos'] = pos || 'bottom';
            item.set('attributes', attrs);
        });
    };

    /****************** BUTTONS *************************/

    var pnm = editor.Panels;

    pnm.addButton('options', {
        id: 'clean-all',
        className: 'fa fa-trash icon-blank',
        command: {
            run: function (editor, sender = {}) {
                if (confirm('Are you sure you want to clean the canvas?')) {
                    editor.setComponents('');
                    editor.Commands.run('clean-mjml');
                }
                sender.set && sender.set('active', 0);
            }
        },
        attributes: {
            title: 'Empty canvas'
        }
    });

    updateTooltip(pnm.getPanel('options').get('buttons'));
    updateTooltip(pnm.getPanel('views').get('buttons'));


    /****************** EVENTS *************************/

    // When removing assets
    editor.on('asset:remove', function () {
        editor.log('Removing assets is not implemented.', { title: 'GrapesJS Assets', level: 'info' });
    });

    // When loggin
    editor.on('log:info', (msg, opts) => toastr && toastr.info(msg, opts.title));
    editor.on('log:error', (msg, opts) => toastr && toastr.error(msg, opts.title));
    editor.on('log:warning', (msg, opts) => toastr && toastr.warning(msg, opts.title));

    // When cleaning mjml
    editor.getModel().on('run:clean-mjml', function () {

        // convert template images relative to absolute urls when command
        // 'clean-mjml' is triggered (at loading and at import).

        ['mj-wrapper', 'mj-section', 'mj-navbar', 'mj-hero', 'mj-image'].forEach(function (tagName) {

            var components = editor.getWrapper().findType(tagName);
            components.forEach(function (cpnt) {
                var attributes = cpnt.get('attributes');
                var attrName = tagName === 'mj-image' ? 'src' : 'background-url';
                var url = attributes[attrName];

                if (url && url.substring(0, 2) === './') {
                    var absoluteUrl = opts.mailtrain.serviceUrl + 'grapejs/templates/' + opts.mailtrain.template + '/' + url.substring(2);

                    if (tagName === 'mj-image') {
                        cpnt.set('src', absoluteUrl);
                        editor.trigger(cpnt, 'change:src');
                    } else {
                        attributes[attrName] = absoluteUrl;
                        cpnt.set('attributes', attributes);
                        cpnt.view.rerender();
                        // cpnt.trigger(cpnt, 'change:attributes'); ??
                    }
                }
            });
        });
    });

});
