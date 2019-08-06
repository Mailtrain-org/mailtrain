'use strict';

function convertFileURLs(sourceCustom, fromEntityType, fromEntityId, toEntityType, toEntityId, campaign) {

    function convertText(text) {
        if (text) {
            const fromUrl = `/files/${fromEntityType}/file/${fromEntityId}`;
            const toUrl = `/files/${toEntityType}/file/${toEntityId}`;

            const encodedFromUrl = encodeURIComponent(fromUrl);
            const encodedToUrl = encodeURIComponent(toUrl);

            text = text.split('[URL_BASE]' + fromUrl).join('[URL_BASE]' + toUrl);
            text = text.split('[SANDBOX_URL_BASE]' + fromUrl).join('[SANDBOX_URL_BASE]' + toUrl);
            text = text.split('[ENCODED_URL_BASE]' + encodedFromUrl).join('[ENCODED_URL_BASE]' + encodedToUrl);
            text = text.split('[ENCODED_SANDBOX_URL_BASE]' + encodedFromUrl).join('[ENCODED_SANDBOX_URL_BASE]' + encodedToUrl);
        }

        return text;
    }

    sourceCustom.html = convertText(sourceCustom.html);
    sourceCustom.text = convertText(sourceCustom.text);

    if ((sourceCustom.type === 'mosaico' || sourceCustom.type === 'mosaicoWithFsTemplate') && campaign){
        sourceCustom.data.model = convertText(sourceCustom.data.model);
        sourceCustom.data.model = convertText(sourceCustom.data.model);
        sourceCustom.data.metadata = convertText(sourceCustom.data.metadata);
    }
}

module.exports.convertFileURLs = convertFileURLs;