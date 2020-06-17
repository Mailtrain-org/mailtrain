'use strict';

import React from "react";

export function createComponentMixin(opts) {
    return {
        contexts: opts.contexts || [],
        deps: opts.deps || [],
        delegateFuns: opts.delegateFuns || [],
        decoratorFn: opts.decoratorFn
    };
}

export function withComponentMixins(mixins, delegateFuns, delegateStaticFuns) {
    const mixinsClosure = new Set();
    for (const mixin of mixins) {
        console.assert(mixin);
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
        const mixinDelegateFuns = [];

        if (delegateFuns) {
            mixinDelegateFuns.push(...delegateFuns);
        }

        for (const mixin of mixinsClosure.values()) {
            mixinDelegateFuns.push(...mixin.delegateFuns);
        }

        function TargetClassWithCtors(props) {
            if (!new.target) {
                throw new TypeError();
            }

            const self = Reflect.construct(TargetClass, [props], new.target);

            for (const ctor of ctors) {
                ctor(self, props);
            }

            return self;
        }

        TargetClassWithCtors.displayName = TargetClass.name;

        TargetClassWithCtors.prototype = TargetClass.prototype;

        for (const attr in TargetClass) {
            TargetClassWithCtors[attr] = TargetClass[attr];
        }

        function addStaticMethodsToClass(clazz) {
            if (delegateStaticFuns) {
                for (const staticFuncName of delegateStaticFuns) {
                    if (!clazz[staticFuncName]) {
                        Object.defineProperty(
                            clazz,
                            staticFuncName,
                            Object.getOwnPropertyDescriptor(TargetClass, staticFuncName)
                        );
                    }
                }
            }
        }

        function incorporateMixins(DecoratedInner) {
            for (const mixin of mixinsClosure.values()) {
                if (mixin.decoratorFn) {
                    const res = mixin.decoratorFn(DecoratedInner, TargetClassWithCtors);

                    if (res.cls) {
                        DecoratedInner = res.cls;
                    }

                    if (res.ctor) {
                        ctors.push(res.ctor);
                    }
                }
            }

            return DecoratedInner;
        }

        if (mixinDelegateFuns.length > 0) {
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

            const DecoratedInner = incorporateMixins(ComponentMixinsInner);

            class ComponentMixinsOuter extends React.Component {
                constructor(props) {
                    super(props);

                    this._decoratorInnerInstanceRefFn = node => this._decoratorInnerInstance = node
                }

                render() {
                    let innerFn = parentProps => {
                        const props = {
                            ...parentProps,
                            _decoratorInnerInstanceRefFn: this._decoratorInnerInstanceRefFn
                        };

                        return <DecoratedInner {...props}/>
                    };

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

            for (const fun of mixinDelegateFuns) {
                ComponentMixinsOuter.prototype[fun] = function (...args) {
                    return this._decoratorInnerInstance[fun](...args);
                }
            }

            addStaticMethodsToClass(ComponentMixinsOuter);
            return ComponentMixinsOuter;

        } else {
            const DecoratedInner = incorporateMixins(TargetClassWithCtors);

            function ComponentContextProvider(props) {
                let innerFn = props => {
                    return <DecoratedInner {...props}/>
                };

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

                return innerFn(props);
            }

            addStaticMethodsToClass(ComponentContextProvider);
            return ComponentContextProvider;
        }

    };
}

