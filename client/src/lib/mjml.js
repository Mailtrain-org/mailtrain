'use strict';

import {isArray, mergeWith} from 'lodash';
import kebabCase from 'lodash/kebabCase';
import mjml2html, {BodyComponent, components, defaultSkeleton, dependencies, HeadComponent} from "mjml4-in-browser";

export { BodyComponent, HeadComponent };

const initComponents = {...components};
const initDependencies = {...dependencies};


// MJML uses global state. This class wraps MJML state and provides a custom mjml2html function which sets the right state before calling the original mjml2html
export class MJML {
    constructor() {
        this.components = initComponents;
        this.dependencies = initDependencies;
        this.headRaw = [];
    }

    registerDependencies(dep) {
        function mergeArrays(objValue, srcValue) {
            if (isArray(objValue) && isArray(srcValue)) {
                return objValue.concat(srcValue)
            }
        }

        mergeWith(this.dependencies, dep, mergeArrays);
    }

    registerComponent(Component) {
        this.components[kebabCase(Component.name)] = Component;
    }

    addToHeader(src) {
        this.headRaw.push(src);
    }

    mjml2html(mjml) {
        function setObj(obj, src) {
            for (const prop of Object.keys(obj)) {
                delete obj[prop];
            }

            Object.assign(obj, src);
        }

        const origComponents = {...components};
        const origDependencies = {...dependencies};

        setObj(components, this.components);
        setObj(dependencies, this.dependencies);

        const res = mjml2html(mjml, {
            skeleton: options => {
                const headRaw = options.headRaw || [];
                options.headRaw = headRaw.concat(this.headRaw);
                return defaultSkeleton(options);
            }
        });

        setObj(components, origComponents);
        setObj(dependencies, origDependencies);

        return res;
    }
}

const mjmlInstance = new MJML();

export default function defaultMjml2html(src) {
    return mjmlInstance.mjml2html(src);
}




