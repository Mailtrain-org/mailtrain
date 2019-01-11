'use strict';

import React from "react";

export function createComponentMixin(contexts, deps, decoratorFn) {
    return {
        contexts,
        deps,
        decoratorFn
    };
}

export function withComponentMixins(mixins, delegateFuns) {
    const mixinsClosure = new Set();
    for (const mixin of mixins) {
        mixinsClosure.add(mixin);
        for (const dep of mixin.deps) {
            mixinsClosure.add(dep);
        }
    }

    const contexts = new Map();
    for (const mixin of mixinsClosure.values()) {
        for (const ctx of mixin.contexts) {
            contexts.set(ctx.propName, ctx.context);
        }
    }

    return TargetClass => {
        const ctors = [];

        function TargetClassWithCtors(props, context) {
            if (!new.target) {
                throw new TypeError();
            }

            const self = Reflect.construct(TargetClass, [props, context], new.target);

            for (const ctor of ctors) {
                ctor(self);
            }

            return self;
        }

        TargetClassWithCtors.prototype = TargetClass.prototype;

        for (const attr in TargetClass) {
            TargetClassWithCtors[attr] = TargetClass[attr];
        }


        class ComponentMixinsInner extends React.Component {
            render() {
                const props = {
                    ...this.props,
                    ref: this.props._decoratorInnerInstanceRefFn
                };
                delete props._decoratorInnerInstanceRefFn;

                return (
                    <TargetClassWithCtors {...props}/>
                );
            }
        }

        let DecoratedInner = ComponentMixinsInner;

        for (const mixin of mixinsClosure.values()) {
            const res = mixin.decoratorFn(DecoratedInner, TargetClassWithCtors);

            if (res.cls) {
                DecoratedInner = res.cls;
            }

            if (res.ctor) {
                ctors.push(res.ctor);
            }
        }

        class ComponentMixinsOuter extends React.Component {
            render() {
                let innerFn = parentProps => {
                    const props = {
                        ...parentProps,
                        _decoratorInnerInstanceRefFn: node => this._decoratorInnerInstance = node
                    };

                    return <DecoratedInner {...props}/>
                }

                for (const [propName, Context] of contexts.entries()) {
                    const existingInnerFn = innerFn;
                    innerFn = parentProps => (
                        <Context.Consumer>
                            {
                                value => existingInnerFn({
                                    ...parentProps,
                                    [propName]: value
                                })
                            }
                        </Context.Consumer>
                    );
                }

                return innerFn(this.props);
            }
        }

        if (delegateFuns) {
            for (const fun of delegateFuns) {
                ComponentMixinsOuter.prototype[fun] = function (...args) {
                    return this._decoratorInnerInstance[fun](...args);
                }
            }
        }

        return ComponentMixinsOuter;
    };
}

