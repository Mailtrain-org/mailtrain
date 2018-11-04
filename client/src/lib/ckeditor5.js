'use strict';

import React, {Component} from 'react';

import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import UnderlinePlugin from '@ckeditor/ckeditor5-basic-styles/src/underline';
import StrikethroughPlugin from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import CodePlugin from '@ckeditor/ckeditor5-basic-styles/src/code';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuotePlugin from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import EasyImagePlugin from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import HeadingPlugin from '@ckeditor/ckeditor5-heading/src/heading';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImageCaptionPlugin from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStylePlugin from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbarPlugin from '@ckeditor/ckeditor5-image/src/imagetoolbar';
//import ImageUploadPlugin from '@ckeditor/ckeditor5-image/src/imageupload';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import AlignmentPlugin from '@ckeditor/ckeditor5-alignment/src/alignment';
import TablePlugin from '@ckeditor/ckeditor5-table/src/table';
import TableToolbarPlugin from '@ckeditor/ckeditor5-table/src/tabletoolbar';

import CKEditor from '@ckeditor/ckeditor5-react';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import insertImageIcon from './ckeditor-insert-image.svg';

class InsertImage extends Plugin {
    init() {
        const editor = this.editor;

        editor.ui.componentFactory.add( 'insertImage', locale => {
            const view = new ButtonView( locale );

            view.set( {
                label: 'Insert image',
                icon: insertImageIcon,
                tooltip: true
            } );

            // Callback executed once the image is clicked.
            view.on( 'execute', () => {
                let url = '';
                const selectedElement = editor.model.document.selection.getSelectedElement();
                if (selectedElement) {
                    if (selectedElement.is('element', 'image')) {
                        url = selectedElement.getAttribute('src');
                    }
                }

                const imageUrl = prompt('Image URL', url);

                if (imageUrl) {
                    editor.model.change( writer => {
                        const imageElement = writer.createElement( 'image', {
                            src: imageUrl
                        } );

                        // Insert the image in the current selection location.
                        editor.model.insertContent( imageElement, editor.model.document.selection );
                    } );
                }
            } );

            return view;
        } );
    }
}

/*
Upload through CKEditor is disable because files can be managed by Files tab

class UploadAdapter {
    constructor(loader, url, t) {
        this.loader = loader;
    }

    async upload() {
        console.log(this.loader);
        return {
            default: 'http://server/default-size.image.png'
        };
    }

    abort() {
    }
}

class MailtrainUploadAdapter extends Plugin {
    static get requires() {
        return [ FileRepository ];
    }

    static get pluginName() {
        return 'MailtrainUploadAdapter';
    }

    init() {
        this.editor.plugins.get(FileRepository).createUploadAdapter = loader => new UploadAdapter(loader, this.editor.t);
    }
}
 */



class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.builtinPlugins = [
    EssentialsPlugin,
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikethroughPlugin,
    CodePlugin,
    BlockQuotePlugin,
    HeadingPlugin,
    ImagePlugin,
    ImageCaptionPlugin,
    ImageStylePlugin,
    ImageToolbarPlugin,
    //ImageUploadPlugin,
    LinkPlugin,
    ListPlugin,
    ParagraphPlugin,
    AlignmentPlugin,
    TablePlugin,
    TableToolbarPlugin,
    //MailtrainUploadAdapter,
    InsertImage
];

ClassicEditor.defaultConfig = {
    toolbar: {
        items: [
            'heading',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'code',
            '|',
            'alignment',
            '|',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'insertImage',
            // 'imageUpload',
            'blockQuote',
            '|',
            'insertTable',
            '|',
            'undo',
            'redo'
        ]
    },
    alignment: {
        options: [ 'left', 'center', 'right', 'justify' ]
    },
    image: {
        toolbar: [
            'imageStyle:full',
            'imageStyle:side',
            '|',
            'imageTextAlternative'
        ]
    },
    table: {
        contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
    },
    language: 'en'
};

export default class CKEditorWrapper extends Component {
    render() {
        return (
            <CKEditor
                editor={ ClassicEditor }
                {...this.props}
            />
        );
    }
}