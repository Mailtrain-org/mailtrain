'use strict';

export function getTagLanguageFromEntity(entity, entityTypeId) {
    if (entityTypeId === 'template') {
        return entity.tag_language;
    } else if (entityTypeId === 'campaign') {
        return entity.data.sourceCustom.tag_language;
    }
}