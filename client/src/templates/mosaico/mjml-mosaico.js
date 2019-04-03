'use strict';

import htmlparser from 'htmlparser2'
import min from 'lodash/min';
import mjml, {MJML, BodyComponent, HeadComponent} from "../../lib/mjml";
import shortid from "shortid";

function getId() {
    return shortid.generate();
}

const parents = [];

function pushParent(parent) {
    parents.push(parent);
}

function popParent() {
    parents.pop();
}

function getParent() {
    if (parents.length > 0) {
        return parents[parents.length - 1];
    }
}


function handleMosaicoEditable(block, src) {
    let newSrc = src;
    let offset = 0;

    const parser = new htmlparser.Parser(
        {
            onopentag: (name, attrs) => {
                const fragment = src.substring(parser.startIndex, parser.endIndex);

                const tagAttrsRe = RegExp(`(<\\s*${name})((?:\\s+[a-z0-9-_]+\\s*=\\s*"[^"]*")*)`, 'i');
                const [ , tagStr, attrsStr] = fragment.match(tagAttrsRe);

                const attrsRe = new RegExp(/([a-z0-9-_]+)\s*=\s*"([^"]*)"/g);
                const attrsMatches = attrsStr.matchAll(attrsRe);

                let newFragment = tagStr;


                for (const attrMatch of attrsMatches) {
                    if (attrMatch[1] === 'mosaico-editable') {
                        const propertyId = attrMatch[2];
                        block.addMosaicoProperty(propertyId);

                        newFragment += ` data-ko-editable="${propertyId}"`;
                    } else {
                        newFragment += ` ${attrMatch[0]}`;
                    }
                }

                newSrc = newSrc.substring(0, parser.startIndex + offset) + newFragment + newSrc.substring(parser.endIndex + offset);
                offset += newFragment.length - fragment.length;
            }
        },
        {
            recognizeCDATA: true,
            decodeEntities: false,
            recognizeSelfClosing: true,
            lowerCaseAttributeNames: false,
        }
    );

    parser.write(src);
    parser.end();

    return newSrc;
}


class MjMosaicoProperty extends HeadComponent {
    static endingTag = true

    static allowedAttributes = {
        'property-id': 'string',
        label: 'string',
        widget: 'string',
    }

    handler() {
        const { add } = this.context;

        add('style', ` @supports -ko-blockdefs { ${this.getAttribute('property-id')} { label: ${this.getAttribute('label')}; widget: ${this.getAttribute('widget')} } }`);
    }
}


class MjMosaicoContainer extends BodyComponent {
    static endingTag = false

    render() {
        return `
            <div data-ko-container="main" data-ko-wrap="false">
                ${this.renderChildren()}
            </div>
        `;
    }
}


class MjMosaicoBlock extends BodyComponent {
    constructor(initialDatas = {}) {
        super(initialDatas);

        const blockId = this.getAttribute('block-id');
        this.blockId = blockId || `block_${getId()}`;
        this.mosaicoProperties = [];
    }

    componentHeadStyle = breakpoint => {
        const propertiesOut = this.mosaicoProperties.length > 0 ? `; properties: ${this.mosaicoProperties.join(' ')}`: '';

        return `
            @supports -ko-blockdefs {
                ${this.blockId} { label: ${this.getAttribute('label')}${propertiesOut} } 
            }
        `;
    }

    static endingTag = false

    static allowedAttributes = {
        'block-id': 'string',
        'label': 'string'
    }

    addMosaicoProperty(property) {
        this.mosaicoProperties.push(property);
    }

    render() {
        pushParent(this);
        const result = `
            <div
                ${this.htmlAttributes({
                    class: this.getAttribute('css-class'),
                    'data-ko-block': this.blockId
                })}
            >
                ${this.renderChildren()}
            </div>
        `;
        popParent();

        return handleMosaicoEditable(this, result);
    }
}


class MjMosaicoInnerBlock extends BodyComponent {
    constructor(initialDatas = {}) {
        super(initialDatas);

        const blockId = this.getAttribute('block-id');
        this.blockId = blockId || `block_${getId()}`;
        this.mosaicoProperties = [];
    }

    componentHeadStyle = breakpoint => {
        const propertiesOut = this.mosaicoProperties.length > 0 ? `; properties: ${this.mosaicoProperties.join(' ')}`: '';

        return `
            @supports -ko-blockdefs {
                ${this.blockId} { label: ${this.getAttribute('label')}${propertiesOut} } 
            }
        `;
    }

    static endingTag = false

    static allowedAttributes = {
        'block-id': 'string',
        'label': 'string'
    }

    addMosaicoProperty(property) {
        this.mosaicoProperties.push(property);
    }

    render() {
        const { children } = this.props;

        pushParent(this);
        const result = `
            <div
                ${this.htmlAttributes({
                    class: this.getAttribute('css-class'),
                    'data-ko-block': this.blockId
                })}
            >
                <table
                    ${this.htmlAttributes({
                        border: '0',
                        cellpadding: '0',
                        cellspacing: '0',
                        role: 'presentation',
                        style: 'table',
                        width: '100%',
                    })}
                >
                    ${this.renderChildren(children, {
                        renderer: component => component.constructor.isRawElement() ? component.render() : `
                            <tr>
                                <td
                                    ${component.htmlAttributes({
                                        align: component.getAttribute('align'),
                                        'vertical-align': component.getAttribute('vertical-align'),
                                        class: component.getAttribute('css-class'),
                                        style: {
                                            background: component.getAttribute('container-background-color'),
                                            'font-size': '0px',
                                            padding: component.getAttribute('padding'),
                                            'padding-top': component.getAttribute('padding-top'),
                                            'padding-right': component.getAttribute('padding-right'),
                                            'padding-bottom': component.getAttribute('padding-bottom'),
                                            'padding-left': component.getAttribute('padding-left'),
                                            'word-break': 'break-word',
                                        },
                                    })}
                                >
                                    ${component.render()}
                                </td>
                            </tr>
                        `,
                    })}
                </table>                        
            </div>
        `;
        popParent();

        return handleMosaicoEditable(this, result);
    }
}


// Adapted from https://github.com/mjmlio/mjml/blob/master/packages/mjml-image/src/index.js
class MjMosaicoImage extends BodyComponent {
    constructor(initialDatas = {}) {
        super(initialDatas);

        const propertyId = this.getAttribute('property-id');
        this.propertyId = propertyId || `image_${getId()}`;

        getParent().addMosaicoProperty(this.propertyId);
    }

    static tagOmission = true

    static allowedAttributes = {
        'property-id': 'string',
        'placeholder-height': 'integer',
        'href-editable': 'boolean',
        alt: 'string',
        href: 'string',
        name: 'string',
        title: 'string',
        rel: 'string',
        align: 'enum(left,center,right)',
        border: 'string',
        'border-bottom': 'string',
        'border-left': 'string',
        'border-right': 'string',
        'border-top': 'string',
        'border-radius': 'unit(px,%){1,4}',
        'container-background-color': 'color',
        'fluid-on-mobile': 'boolean',
        padding: 'unit(px,%){1,4}',
        'padding-bottom': 'unit(px,%)',
        'padding-left': 'unit(px,%)',
        'padding-right': 'unit(px,%)',
        'padding-top': 'unit(px,%)',
        target: 'string',
        width: 'unit(px)',
        height: 'unit(px)',
    }

    static defaultAttributes = {
        align: 'center',
        border: '0',
        height: 'auto',
        padding: '10px 25px',
        target: '_blank',
        'placeholder-height': '400',
        'href-editable': false
    }

    getStyles() {
        const width = this.getContentWidth();
        const fullWidth = this.getAttribute('full-width') === 'full-width';

        return {
            img: {
                border: this.getAttribute('border'),
                'border-left': this.getAttribute('left'),
                'border-right': this.getAttribute('right'),
                'border-top': this.getAttribute('top'),
                'border-bottom': this.getAttribute('bottom'),
                'border-radius': this.getAttribute('border-radius'),
                display: 'block',
                outline: 'none',
                'text-decoration': 'none',
                height: this.getAttribute('height'),
                'min-width': fullWidth ? '100%' : null,
                width: '100%',
                'max-width': fullWidth ? '100%' : null,
            },
            td: {
                width: fullWidth ? null : width,
            },
            table: {
                'min-width': fullWidth ? '100%' : null,
                'max-width': fullWidth ? '100%' : null,
                width: fullWidth ? width : null,
                'border-collapse': 'collapse',
                'border-spacing': '0px',
            },
        }
    }

    getContentWidth() {
        const width = this.getAttribute('width')
            ? parseInt(this.getAttribute('width'), 10)
            : Infinity;

        const {box} = this.getBoxWidths();

        return min([box, width])
    }

    renderImage() {
        const height = this.getAttribute('height');

        const img = `
            <img
                ${this.htmlAttributes({
                    alt: this.getAttribute('alt'),
                    height: height && (height === 'auto' ? undefined : parseInt(height, 10)),
                    style: 'img',
                    title: this.getAttribute('title'),
                    width: this.getContentWidth(),
            
                    'data-ko-editable': this.propertyId + '.src',
                    'data-ko-placeholder-height': this.getAttribute('placeholder-height'),
                    src: "[PLACEHOLDER]"
                })}
            />
        `;

        if (this.getAttribute('href-editable')) {
            return `
                <a
                    ${this.htmlAttributes({
                        'data-ko-link': this.propertyId + '.url',
                        href: this.getAttribute('href') || '',
                        target: this.getAttribute('target'),
                        rel: this.getAttribute('rel'),
                        name: this.getAttribute('name'),
                    })}
                >
                    ${img}
                </a>
            `;
        } else if (this.getAttribute('href')) {
            return `
                <a
                    ${this.htmlAttributes({
                        href: this.getAttribute('href'),
                        target: this.getAttribute('target'),
                        rel: this.getAttribute('rel'),
                        name: this.getAttribute('name'),
                    })}
                >
                    ${img}
                </a>
            `;
        }

        return img
    }

    headStyle = breakpoint => `
        @media only screen and (max-width:${breakpoint}) {
        table.full-width-mobile { width: 100% !important; }
        td.full-width-mobile { width: auto !important; }
        }
    `

    render() {
        return `
            <table
                ${this.htmlAttributes({
                    border: '0',
                    cellpadding: '0',
                    cellspacing: '0',
                    role: 'presentation',
                    style: 'table',
                    class:
                        this.getAttribute('fluid-on-mobile')
                            ? 'full-width-mobile'
                            : null,
                })}
            >
                <tbody>
                    <tr>
                        <td ${this.htmlAttributes({
                            style: 'td',
                            class:
                                this.getAttribute('fluid-on-mobile')
                                ? 'full-width-mobile'
                                : null,
                        })}>
                            ${this.renderImage()}
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    }
}



const mjmlInstance = new MJML();

mjmlInstance.registerComponent(MjMosaicoContainer);
mjmlInstance.registerComponent(MjMosaicoBlock);
mjmlInstance.registerComponent(MjMosaicoInnerBlock);
mjmlInstance.registerComponent(MjMosaicoImage);
mjmlInstance.registerComponent(MjMosaicoProperty);

mjmlInstance.registerDependencies({
    'mj-mosaico-container': ['mj-mosaico-block', 'mj-mosaico-inner-block'],
    'mj-body': ['mj-mosaico-container', 'mj-mosaico-block'],
    'mj-section': ['mj-mosaico-container', 'mj-mosaico-block'],
    'mj-column': ['mj-mosaico-container', 'mj-mosaico-inner-block', 'mj-mosaico-image'],
    'mj-mosaico-block': ['mj-section', 'mj-column'],
    'mj-mosaico-inner-block': ['mj-mosaico-image', 'mj-divider', 'mj-text', 'mj-image', 'mj-table']
});

mjmlInstance.addToHeader(`
    <style type="text/css">
        @supports -ko-blockdefs {
            text { label: Paragraph; widget: text }
            image { label: Image; properties: src url alt }
            link { label: Link; properties: text url }
            url { label: Link; widget: url }
            src { label: Image; widget: src }
            alt {
                label: Alternative Text;
                widget: text;
                help: Alternative text will be shown on email clients that does not download image automatically;
            }
    
            template { label: Page }
        }
    </style>
`);

export default function mjml2html(src) {
    return mjmlInstance.mjml2html(src);
}
