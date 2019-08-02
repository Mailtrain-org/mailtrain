'use strict';

import {getUrl} from "./urls";
import axios from "./axios";

export async function checkPermissions(request) {
    return await axios.post(getUrl('rest/permissions-check'), request);
}
