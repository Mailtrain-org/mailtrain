'use strict';

import ellipsize from "ellipsize";


export function ellipsizeBreadcrumbLabel(label) {
    return ellipsize(label, 40)
}