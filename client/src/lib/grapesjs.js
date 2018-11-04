'use strict';

import React, {Component} from 'react';

import 'grapesjs/dist/css/grapes.min.css';
import grapesjs from 'grapesjs';
import grapesjsMjml from 'grapesjs-mjml';

export default class GrapesJs extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    componentDidMount() {
        const editor = grapesjs.init({
            container: this.canvasNode,
            height: '100%',
            width: 'auto',
            noticeOnUnload: 0,
            storageManager:{autoload: 0},
            fromElement: false,
            components:
                '  <mj-container>\n' +
                '        <mj-section>\n' +
                '          <mj-column>\n' +
                '            <mj-text>My Company</mj-text>\n' +
                '          </mj-column>\n' +
                '        </mj-section>\n' +
                '  <mj-container>',
            plugins: ['gjs-mjml'],
            pluginsOpts: {
                'gjs-mjml': {}
            }
        });
    }

    render() {
        return (
            <div>
                <div ref={node => this.canvasNode = node}/>
            </div>
        );
    }
}