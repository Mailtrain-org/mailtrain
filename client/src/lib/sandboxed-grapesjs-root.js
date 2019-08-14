'use strict';

import './public-path';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {TranslationRoot, withTranslation} from './i18n';
import {parentRPC, UntrustedContentRoot} from './untrusted';
import PropTypes from "prop-types";
import {getPublicUrl, getSandboxUrl, getTrustedUrl} from "./urls";
import {base, unbase} from "../../../shared/templates";
import mjml2html from "./mjml";

import 'grapesjs/dist/css/grapes.min.css';
import grapesjs from 'grapesjs';

import 'grapesjs-mjml';

import 'grapesjs-preset-newsletter';
import 'grapesjs-preset-newsletter/dist/grapesjs-preset-newsletter.css';

import "./sandboxed-grapesjs.scss";

import axios from './axios';
import {GrapesJSSourceType} from "./sandboxed-grapesjs-shared";
import {withComponentMixins} from "./decorator-helpers";


grapesjs.plugins.add('mailtrain-remove-buttons', (editor, opts = {}) => {
    // This needs to be done in on-load and after gjs plugin because grapesjs-preset-newsletter tries to set titles to all buttons (including those we remove)
    // see https://github.com/artf/grapesjs-preset-newsletter/blob/e0a91636973a5a1481e9d7929e57a8869b1db72e/src/index.js#L248
    editor.on('load', () => {
        const panelManager = editor.Panels;
        panelManager.removeButton('options','fullscreen');
        panelManager.removeButton('options','export-template');
    });
});


@withComponentMixins([
    withTranslation
])
export class GrapesJSSandbox extends Component {
    constructor(props) {
        super(props);

        this.initialized = false;

        this.state = {
            assets: null
        };
    }

    static propTypes = {
        entityTypeId: PropTypes.string,
        entityId: PropTypes.number,
        tagLanguage: PropTypes.string,
        initialSource: PropTypes.string,
        initialStyle: PropTypes.string,
        sourceType: PropTypes.string
    }

    async exportState(method, params) {
        const props = this.props;

        const editor = this.editor;

        // If exportState comes during text editing (via RichTextEditor), we need to cancel the editing, so that the
        // text being edited is stored in the model
        const sel = editor.getSelected();
        if (sel && sel.view && sel.view.disableEditing) {
            sel.view.disableEditing();
        }

        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();

        const source = unbase(editor.getHtml(), this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase, true);
        const style = unbase(editor.getCss(), this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase, true);

        let html;

        if (props.sourceType === GrapesJSSourceType.MJML) {
            const preMjml = '<mjml><mj-head></mj-head><mj-body>';
            const postMjml = '</mj-body></mjml>';
            const mjml = preMjml + source + postMjml;

            const mjmlRes = mjml2html(mjml);
            html = mjmlRes.html;

        } else if (props.sourceType === GrapesJSSourceType.HTML) {
            const commandManager = editor.Commands;

            const cmdGetCode = commandManager.get('gjs-get-inlined-html');
            const htmlBody = cmdGetCode.run(editor);

            const preHtml = '<!doctype html><html><head><meta charset="utf-8"><title></title></head><body>';
            const postHtml = '</body></html>';
            html = preHtml + unbase(htmlBody, this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase, true) + postHtml;
        }


        return {
            html,
            style: style,
            source: source
        };
    }

    async fetchAssets() {
        const props = this.props;
        const resp = await axios.get(getSandboxUrl(`rest/files-list/${props.entityTypeId}/file/${props.entityId}`));
        this.setState({
            assets: resp.data.map( f => ({type: 'image', src: getPublicUrl(`files/${props.entityTypeId}/file/${props.entityId}/${f.filename}`)}) )
        });
    }

    componentDidMount() {
        // noinspection JSIgnoredPromiseFromCall
        this.fetchAssets();
    }

    componentDidUpdate() {
        if (!this.initialized && this.state.assets !== null) {
            this.initGrapesJs();
            this.initialized = true;
        }
    }

    initGrapesJs() {
        const props = this.props;

        parentRPC.setMethodHandler('exportState', ::this.exportState);

        const trustedUrlBase = getTrustedUrl();
        const sandboxUrlBase = getSandboxUrl();
        const publicUrlBase = getPublicUrl();

        const config = {
            noticeOnUnload: false,
            container: this.canvasNode,
            height: '100%',
            width: '100%',
            storageManager:{
                type: 'none'
            },
            assetManager: {
                assets: this.state.assets,
                upload: getSandboxUrl(`grapesjs/upload/${this.props.entityTypeId}/${this.props.entityId}`),
                uploadText: 'Drop images here or click to upload',
                headers: {
                    'X-CSRF-TOKEN': '{{csrfToken}}',
                },
                autoAdd: true
            },
            styleManager: {
                clearProperties: true,
            },
            fromElement: false,
            components: '',
            style: '',
            plugins: [
            ],
            pluginsOpts: {
            }
        };

        let defaultSource, defaultStyle;

        if (props.sourceType === GrapesJSSourceType.MJML) {
            defaultSource =
                '<mj-container>\n' +
                '  <mj-section>\n' +
                '    <mj-column>\n' +
                '      <mj-text>Lorem Ipsum...</mj-text>\n' +
                '    </mj-column>\n' +
                '  </mj-section>\n' +
                '</mj-container>';

            defaultStyle = '';

            config.plugins.push('gjs-mjml');
            config.pluginsOpts['gjs-mjml'] = {
                preMjml: '<mjml><mj-head></mj-head><mj-body>',
                postMjml: '</mj-body></mjml>'
            };

        } else if (props.sourceType === GrapesJSSourceType.HTML) {
            defaultSource =
                '<table class="main-body">\n' +
                '  <tr class="row">\n' +
                '    <td class="main-body-cell">\n' +
                '      <table class="container">\n' +
                '        <tr>\n' +
                '          <td class="container-cell">\n' +
                '            <table class="table100 c1790">\n' +
                '              <tr>\n' +
                '                <td class="top-cell" id="c1793">\n' +
                '                  <u class="browser-link" id="c307">View in browser\n' +
                '                  </u>\n' +
                '                </td>\n' +
                '              </tr>\n' +
                '            </table>\n' +
                '            <table class="c1766">\n' +
                '              <tr>\n' +
                '                <td class="cell c1769">\n' +
                '                  <img class="c926" src="http://artf.github.io/grapesjs/img/grapesjs-logo.png" alt="GrapesJS."/>\n' +
                '                </td>\n' +
                '                <td class="cell c1776">\n' +
                '                  <div class="c1144">GrapesJS Newsletter Builder\n' +
                '                    <br/>\n' +
                '                  </div>\n' +
                '                </td>\n' +
                '              </tr>\n' +
                '            </table>\n' +
                '            <table class="card">\n' +
                '              <tr>\n' +
                '                <td class="card-cell">\n' +
                '                  <img class="c1271" src="http://artf.github.io/grapesjs/img/tmp-header-txt.jpg" alt="Big image here"/>\n' +
                '                  <table class="table100 c1357">\n' +
                '                    <tr>\n' +
                '                      <td class="card-content">\n' +
                '                        <h1 class="card-title">Build your newsletters faster than ever\n' +
                '                          <br/>\n' +
                '                        </h1>\n' +
                '                        <p class="card-text">Import, build, test and export responsive newsletter templates faster than ever using the GrapesJS Newsletter Builder.\n' +
                '                        </p>\n' +
                '                        <table class="c1542">\n' +
                '                          <tr>\n' +
                '                            <td class="card-footer" id="c1545">\n' +
                '                              <a class="button" href="https://github.com/artf/grapesjs">Free and Open Source\n' +
                '                              </a>\n' +
                '                            </td>\n' +
                '                          </tr>\n' +
                '                        </table>\n' +
                '                      </td>\n' +
                '                    </tr>\n' +
                '                  </table>\n' +
                '                </td>\n' +
                '              </tr>\n' +
                '            </table>\n' +
                '            <table class="list-item">\n' +
                '              <tr>\n' +
                '                <td class="list-item-cell">\n' +
                '                  <table class="list-item-content">\n' +
                '                    <tr class="list-item-row">\n' +
                '                      <td class="list-cell-left">\n' +
                '                        <img class="list-item-image" src="http://artf.github.io/grapesjs/img/tmp-blocks.jpg" alt="Image1"/>\n' +
                '                      </td>\n' +
                '                      <td class="list-cell-right">\n' +
                '                        <h1 class="card-title">Built-in Blocks\n' +
                '                        </h1>\n' +
                '                        <p class="card-text">Drag and drop built-in blocks from the right panel and style them in a matter of seconds\n' +
                '                        </p>\n' +
                '                      </td>\n' +
                '                    </tr>\n' +
                '                  </table>\n' +
                '                </td>\n' +
                '              </tr>\n' +
                '            </table>\n' +
                '            <table class="list-item">\n' +
                '              <tr>\n' +
                '                <td class="list-item-cell">\n' +
                '                  <table class="list-item-content">\n' +
                '                    <tr class="list-item-row">\n' +
                '                      <td class="list-cell-left">\n' +
                '                        <img class="list-item-image" src="http://artf.github.io/grapesjs/img/tmp-tgl-images.jpg" alt="Image2"/>\n' +
                '                      </td>\n' +
                '                      <td class="list-cell-right">\n' +
                '                        <h1 class="card-title">Toggle images\n' +
                '                        </h1>\n' +
                '                        <p class="card-text">Build a good looking newsletter even without images enabled by the email clients\n' +
                '                        </p>\n' +
                '                      </td>\n' +
                '                    </tr>\n' +
                '                  </table>\n' +
                '                </td>\n' +
                '              </tr>\n' +
                '            </table>\n' +
                '            <table class="grid-item-row">\n' +
                '              <tr>\n' +
                '                <td class="grid-item-cell2-l">\n' +
                '                  <table class="grid-item-card">\n' +
                '                    <tr>\n' +
                '                      <td class="grid-item-card-cell">\n' +
                '                        <img class="grid-item-image" src="http://artf.github.io/grapesjs/img/tmp-send-test.jpg" alt="Image1"/>\n' +
                '                        <table class="grid-item-card-body">\n' +
                '                          <tr>\n' +
                '                            <td class="grid-item-card-content">\n' +
                '                              <h1 class="card-title">Test it\n' +
                '                              </h1>\n' +
                '                              <p class="card-text">You can send email tests directly from the editor and check how are looking on your email clients\n' +
                '                              </p>\n' +
                '                            </td>\n' +
                '                          </tr>\n' +
                '                        </table>\n' +
                '                      </td>\n' +
                '                    </tr>\n' +
                '                  </table>\n' +
                '                </td>\n' +
                '                <td class="grid-item-cell2-r">\n' +
                '                  <table class="grid-item-card">\n' +
                '                    <tr>\n' +
                '                      <td class="grid-item-card-cell">\n' +
                '                        <img class="grid-item-image" src="http://artf.github.io/grapesjs/img/tmp-devices.jpg" alt="Image2"/>\n' +
                '                        <table class="grid-item-card-body">\n' +
                '                          <tr>\n' +
                '                            <td class="grid-item-card-content">\n' +
                '                              <h1 class="card-title">Responsive\n' +
                '                              </h1>\n' +
                '                              <p class="card-text">Using the device manager you\'ll always send a fully responsive contents\n' +
                '                              </p>\n' +
                '                            </td>\n' +
                '                          </tr>\n' +
                '                        </table>\n' +
                '                      </td>\n' +
                '                    </tr>\n' +
                '                  </table>\n' +
                '                </td>\n' +
                '              </tr>\n' +
                '            </table>\n' +
                '            <table class="footer">\n' +
                '              <tr>\n' +
                '                <td class="footer-cell">\n' +
                '                  <div class="c2577">\n' +
                '                    <p class="footer-info">GrapesJS Newsletter Builder is a free and open source preset (plugin) used on top of the GrapesJS core library.\n' +
                '                  For more information about and how to integrate it inside your applications check<p>\n' +
                '                  <a class="link" href="https://github.com/artf/grapesjs-preset-newsletter">GrapesJS Newsletter Preset</a>\n' +
                '                    <br/>\n' +
                '                  </div>\n' +
                '                  <div class="c2421">\n' +
                '                    MADE BY <a class="link" href="https://github.com/artf">ARTUR ARSENIEV</a>\n' +
                '                    <p>\n' +
                '                  </div>\n' +
                '                </td>\n' +
                '              </tr>\n' +
                '            </table>\n' +
                '          </td>\n' +
                '        </tr>\n' +
                '      </table>\n' +
                '    </td>\n' +
                '  </tr>\n' +
                '</table>';

            defaultStyle =
                '.link {\n' +
                '    color: rgb(217, 131, 166);\n' +
                '  }\n' +
                '  .row{\n' +
                '    vertical-align:top;\n' +
                '  }\n' +
                '  .main-body{\n' +
                '    min-height:150px;\n' +
                '    padding: 5px;\n' +
                '    width:100%;\n' +
                '    height:100%;\n' +
                '    background-color:rgb(234, 236, 237);\n' +
                '  }\n' +
                '  .c926{\n' +
                '    color:rgb(158, 83, 129);\n' +
                '    width:100%;\n' +
                '    font-size:50px;\n' +
                '  }\n' +
                '  .cell.c849{\n' +
                '    width:11%;\n' +
                '  }\n' +
                '  .c1144{\n' +
                '    padding: 10px;\n' +
                '    font-size:17px;\n' +
                '    font-weight: 300;\n' +
                '  }\n' +
                '  .card{\n' +
                '    min-height:150px;\n' +
                '    padding: 5px;\n' +
                '    margin-bottom:20px;\n' +
                '    height:0px;\n' +
                '  }\n' +
                '  .card-cell{\n' +
                '    background-color:rgb(255, 255, 255);\n' +
                '    overflow:hidden;\n' +
                '    border-radius: 3px;\n' +
                '    padding: 0;\n' +
                '    text-align:center;\n' +
                '  }\n' +
                '  .card.sector{\n' +
                '    background-color:rgb(255, 255, 255);\n' +
                '    border-radius: 3px;\n' +
                '    border-collapse:separate;\n' +
                '  }\n' +
                '  .c1271{\n' +
                '    width:100%;\n' +
                '    margin: 0 0 15px 0;\n' +
                '    font-size:50px;\n' +
                '    color:rgb(120, 197, 214);\n' +
                '    line-height:250px;\n' +
                '    text-align:center;\n' +
                '  }\n' +
                '  .table100{\n' +
                '    width:100%;\n' +
                '  }\n' +
                '  .c1357{\n' +
                '    min-height:150px;\n' +
                '    padding: 5px;\n' +
                '    margin: auto;\n' +
                '    height:0px;\n' +
                '  }\n' +
                '  .darkerfont{\n' +
                '    color:rgb(65, 69, 72);\n' +
                '  }\n' +
                '  .button{\n' +
                '    font-size:12px;\n' +
                '    padding: 10px 20px;\n' +
                '    background-color:rgb(217, 131, 166);\n' +
                '    color:rgb(255, 255, 255);\n' +
                '    text-align:center;\n' +
                '    border-radius: 3px;\n' +
                '    font-weight:300;\n' +
                '  }\n' +
                '  .table100.c1437{\n' +
                '    text-align:left;\n' +
                '  }\n' +
                '  .cell.cell-bottom{\n' +
                '    text-align:center;\n' +
                '    height:51px;\n' +
                '  }\n' +
                '  .card-title{\n' +
                '    font-size:25px;\n' +
                '    font-weight:300;\n' +
                '    color:rgb(68, 68, 68);\n' +
                '  }\n' +
                '  .card-content{\n' +
                '    font-size:13px;\n' +
                '    line-height:20px;\n' +
                '    color:rgb(111, 119, 125);\n' +
                '    padding: 10px 20px 0 20px;\n' +
                '    vertical-align:top;\n' +
                '  }\n' +
                '  .container{\n' +
                '    font-family: Helvetica, serif;\n' +
                '    min-height:150px;\n' +
                '    padding: 5px;\n' +
                '    margin:auto;\n' +
                '    height:0px;\n' +
                '    width:90%;\n' +
                '    max-width:550px;\n' +
                '  }\n' +
                '  .cell.c856{\n' +
                '    vertical-align:middle;\n' +
                '  }\n' +
                '  .container-cell{\n' +
                '    vertical-align:top;\n' +
                '    font-size:medium;\n' +
                '    padding-bottom:50px;\n' +
                '  }\n' +
                '  .c1790{\n' +
                '    min-height:150px;\n' +
                '    padding: 5px;\n' +
                '    margin:auto;\n' +
                '    height:0px;\n' +
                '  }\n' +
                '  .table100.c1790{\n' +
                '    min-height:30px;\n' +
                '    border-collapse:separate;\n' +
                '    margin: 0 0 10px 0;\n' +
                '  }\n' +
                '  .browser-link{\n' +
                '    font-size:12px;\n' +
                '  }\n' +
                '  .top-cell{\n' +
                '    text-align:right;\n' +
                '    color:rgb(152, 156, 165);\n' +
                '  }\n' +
                '  .table100.c1357{\n' +
                '    margin: 0;\n' +
                '    border-collapse:collapse;\n' +
                '  }\n' +
                '  .c1769{\n' +
                '    width:30%;\n' +
                '  }\n' +
                '  .c1776{\n' +
                '    width:70%;\n' +
                '  }\n' +
                '  .c1766{\n' +
                '    margin: 0 auto 10px 0;\n' +
                '    padding: 5px;\n' +
                '    width:100%;\n' +
                '    min-height:30px;\n' +
                '  }\n' +
                '  .cell.c1769{\n' +
                '    width:11%;\n' +
                '  }\n' +
                '  .cell.c1776{\n' +
                '    vertical-align:middle;\n' +
                '  }\n' +
                '  .c1542{\n' +
                '    margin: 0 auto 10px auto;\n' +
                '    padding:5px;\n' +
                '    width:100%;\n' +
                '  }\n' +
                '  .card-footer{\n' +
                '    padding: 20px 0;\n' +
                '    text-align:center;\n' +
                '  }\n' +
                '  .c2280{\n' +
                '    height:150px;\n' +
                '    margin:0 auto 10px auto;\n' +
                '    padding:5px 5px 5px 5px;\n' +
                '    width:100%;\n' +
                '  }\n' +
                '  .c2421{\n' +
                '    padding:10px;\n' +
                '  }\n' +
                '  .c2577{\n' +
                '    padding:10px;\n' +
                '  }\n' +
                '  .footer{\n' +
                '    margin-top: 50px;\n' +
                '    color:rgb(152, 156, 165);\n' +
                '    text-align:center;\n' +
                '    font-size:11px;\n' +
                '    padding: 5px;\n' +
                '  }\n' +
                '  .quote {\n' +
                '    font-style: italic;\n' +
                '  }\n' +
                '  .list-item{\n' +
                '    height:auto;\n' +
                '    width:100%;\n' +
                '    margin: 0 auto 10px auto;\n' +
                '    padding: 5px;\n' +
                '  }\n' +
                '  .list-item-cell{\n' +
                '    background-color:rgb(255, 255, 255);\n' +
                '    border-radius: 3px;\n' +
                '    overflow: hidden;\n' +
                '    padding: 0;\n' +
                '  }\n' +
                '  .list-cell-left{\n' +
                '    width:30%;\n' +
                '    padding: 0;\n' +
                '  }\n' +
                '  .list-cell-right{\n' +
                '    width:70%;\n' +
                '    color:rgb(111, 119, 125);\n' +
                '    font-size:13px;\n' +
                '    line-height:20px;\n' +
                '    padding: 10px 20px 0px 20px;\n' +
                '  }\n' +
                '  .list-item-content{\n' +
                '    border-collapse: collapse;\n' +
                '    margin: 0 auto;\n' +
                '    padding: 5px;\n' +
                '    height:150px;\n' +
                '    width:100%;\n' +
                '  }\n' +
                '  .list-item-image{\n' +
                '    color:rgb(217, 131, 166);\n' +
                '    font-size:45px;\n' +
                '    width: 100%;\n' +
                '  }\n' +
                '  .grid-item-image{\n' +
                '    line-height:150px;\n' +
                '    font-size:50px;\n' +
                '    color:rgb(120, 197, 214);\n' +
                '    margin-bottom:15px;\n' +
                '    width:100%;\n' +
                '  }\n' +
                '  .grid-item-row {\n' +
                '    margin: 0 auto 10px;\n' +
                '    padding: 5px 0;\n' +
                '    width: 100%;\n' +
                '  }\n' +
                '  .grid-item-card {\n' +
                '    width:100%;\n' +
                '    padding: 5px 0;\n' +
                '    margin-bottom: 10px;\n' +
                '  }\n' +
                '  .grid-item-card-cell{\n' +
                '    background-color:rgb(255, 255, 255);\n' +
                '    overflow: hidden;\n' +
                '    border-radius: 3px;\n' +
                '    text-align:center;\n' +
                '    padding: 0;\n' +
                '  }\n' +
                '  .grid-item-card-content{\n' +
                '    font-size:13px;\n' +
                '    color:rgb(111, 119, 125);\n' +
                '    padding: 0 10px 20px 10px;\n' +
                '    width:100%;\n' +
                '    line-height:20px;\n' +
                '  }\n' +
                '  .grid-item-cell2-l{\n' +
                '    vertical-align:top;\n' +
                '    padding-right:10px;\n' +
                '    width:50%;\n' +
                '  }\n' +
                '  .grid-item-cell2-r{\n' +
                '    vertical-align:top;\n' +
                '    padding-left:10px;\n' +
                '    width:50%;\n' +
                '  }';

            config.plugins.push('gjs-preset-newsletter');
        }

        config.components = props.initialSource ? base(props.initialSource, this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase) : defaultSource;
        config.style = props.initialStyle ? base(props.initialStyle, this.props.tagLanguage, trustedUrlBase, sandboxUrlBase, publicUrlBase) : defaultStyle;

        config.plugins.push('mailtrain-remove-buttons');

        this.editor = grapesjs.init(config);
    }

    render() {
        return (
            <div>
                <div ref={node => this.canvasNode = node}/>
            </div>
        );
    }
}


export default function() {
    parentRPC.init();

    ReactDOM.render(
        <TranslationRoot>
            <UntrustedContentRoot render={props => <GrapesJSSandbox {...props} />} />
        </TranslationRoot>,
        document.getElementById('root')
    );
};


