'use strict';

import {isArray, mergeWith} from 'lodash';
import kebabCase from 'lodash/kebabCase';
import mjml2html, {BodyComponent, HeadComponent, presetCore, components, dependencies, assignComponents, assignDependencies, defaultSkeleton} from "mjml-browser";

export { BodyComponent, HeadComponent };

const initComponents = [...presetCore.components];
const initDependencies = {...presetCore.dependencies};

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
        this.components.push(Component);
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

        assignComponents(components, this.components)
        assignDependencies(dependencies, this.dependencies)

        const res = mjml2html(mjml, {
            skeleton: options => {
                const headRaw = options.headRaw || [];
                options.headRaw = headRaw.concat(this.headRaw);
                return defaultSkeleton(options);
            }
        });

        assignComponents(components, presetCore.components)
        assignDependencies(dependencies, presetCore.dependencies)

        return res;
    }
}

const mjmlInstance = new MJML();

export default function defaultMjml2html(src) {
    return mjmlInstance.mjml2html(src);
}



