'use strict';

import {getUrl} from "./urls";
import axios from "./axios";

export async function checkPermissions(request) {
    return await axios.post(getUrl('rest/permissions-check'), request);
}

export function canShare(perms) {
    for (const perm of perms) {
        if (perm === 'share' || perm.startsWith('share:')) {
            return true;
        }
    }
}