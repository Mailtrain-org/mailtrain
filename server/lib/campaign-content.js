'use strict';

const {renderTag} = require('../../shared/templates');

function convertFileURLs(sourceCustom, fromEntityType, fromEntityId, toEntityType, toEntityId) {

    const tagLanguage = sourceCustom.tag_language;

    function convertText(text) {
        if (text) {
            const fromUrl = `/files/${fromEntityType}/file/${fromEntityId}`;
            const toUrl = `/files/${toEntityType}/file/${toEntityId}`;

            const encodedFromUrl = encodeURIComponent(fromUrl);
            const encodedToUrl = encodeURIComponent(toUrl);

            text = text.split(renderTag(tagLanguage, 'URL_BASE') + fromUrl).join(renderTag(tagLanguage, 'URL_BASE') + toUrl);
            text = text.split(renderTag(tagLanguage,'SANDBOX_URL_BASE') + fromUrl).join(renderTag(tagLanguage, 'SANDBOX_URL_BASE') + toUrl);
            text = text.split(renderTag(tagLanguage, 'ENCODED_URL_BASE') + encodedFromUrl).join(renderTag(tagLanguage, 'ENCODED_URL_BASE') + encodedToUrl);
            text = text.split(renderTag(tagLanguage, 'ENCODED_SANDBOX_URL_BASE') + encodedFromUrl).join(renderTag(tagLanguage, 'ENCODED_SANDBOX_URL_BASE') + encodedToUrl);
        }

        return text;
    }

    sourceCustom.html = convertText(sourceCustom.html);
    sourceCustom.text = convertText(sourceCustom.text);

    if (sourceCustom.type === 'mosaico' || sourceCustom.type === 'mosaicoWithFsTemplate') {
        sourceCustom.data.model = convertText(sourceCustom.data.model);
        sourceCustom.data.model = convertText(sourceCustom.data.model);
        sourceCustom.data.metadata = convertText(sourceCustom.data.metadata);
    }
}

module.exports.convertFileURLs = convertFileURLs;