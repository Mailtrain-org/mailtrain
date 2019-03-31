'use strict';

import {getUrl} from "./urls";
import axios from "./axios";

async function checkPermissions(request) {
    return await axios.post(getUrl('rest/permissions-check'), request);
}

export {
    checkPermissions
}