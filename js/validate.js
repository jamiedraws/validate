(function(global) {
    const create = function(methods, models) {
        return Object.create(methods || null, models);
    };

    const properties = function(properties, model) {
        return Object.defineProperties(model || create(), properties);
    };

    const property = function(name, property, model) {
        return Object.defineProperty(model || create(), name, property);
    };

    const each = function(obj, callback) {
        Object.keys(obj).forEach(callback);
    };

    const form = properties({
        select: {
            value: function(fieldset, callback) {
                const fields = this.elements.fieldset[fieldset];
                if (typeof fields === "undefined") {
                    this.key = fieldset;
                    return this;
                }

                if (typeof callback === "function") {
                    each(fields, function(field) {
                        callback(fields[field]);
                    });
                }

                return fields;
            }
        },
        from: {
            value: function(id, handler) {
                let key = this.key,
                    result;

                this.select(id, function(field) {
                    if (field.id === key) {
                        if (typeof handler === "function") {
                            handler(field);
                        }
                        result = field;
                    }
                });
                return result || this;
            }
        },
        compare: {
            value: function(e1, e2, handler) {
                if (typeof handler === "function") {
                    handler.apply(e1, [e1, e2]);
                    handler.apply(e2, [e1, e2]);
                }
            }
        },
        onSubmit: {
            value: function(callback) {
                this.elements.form.addEventListener("submit", callback);
            }
        }
    });

    const field = create({
        on: function(listener, handler) {
            if (this.element) {
                let field = this;
                this.element.addEventListener(listener, function() {
                    field.clearMessage();
                    if (typeof handler === "function") {
                        handler.call(field.element, field);
                    }
                    field.postMessage();
                });
            }
        },
        clearMessage: function() {
            this.element.classList.remove("form__error");
            this.element.setCustomValidity("");
        },
        postMessage: function() {
            if (!this.element.validity.valid) {
                this.element.classList.add("form__error");
                this.element.setAttribute(
                    "aria-label",
                    this.element.validationMessage
                );
                this.message.element.textContent = this.element.validationMessage;
            }
        },
        isInvalid: function(response) {
            if (this.element.validity.patternMismatch) {
                this.element.setCustomValidity(response);
            }
        },
        matches: function(field, response) {
            if (field.element.value !== this.element.value) {
                this.element.setCustomValidity(response);
            } else {
                field.clearMessage();
                this.clearMessage();
            }
        }
    });

    const model = create(
        {
            defineProperties: function(property) {
                model.defineElement(property);
                if (model.hasProperty(property, "message")) {
                    model.defineElement(property.message);
                }
            },
            intoProperties: function(properties) {
                properties.forEach(function(property) {
                    model.defineProperties(property);
                    Object.setPrototypeOf(property, field);
                });
                return properties;
            },
            hasProperty: function(item, property) {
                return property in item ? true : false;
            },
            defineElement: function(item) {
                if (model.hasProperty(item, "id")) {
                    model.element(item.id, item);
                }
            }
        },
        {
            form: {
                value: function(form) {
                    return properties({
                        form: {
                            enumerable: true,
                            value: document.getElementById(form) || false
                        },
                        fieldset: {
                            enumerable: true,
                            value: create()
                        }
                    });
                }
            },
            fieldset: {
                value: function(fieldset, field, fields) {
                    property(
                        field,
                        {
                            value: this.intoProperties(fields),
                            enumerable: true
                        },
                        fieldset
                    );
                    return fields;
                }
            },
            element: {
                value: function(id, model) {
                    return property(
                        "element",
                        {
                            value: document.getElementById(id) || false,
                            enumerable: true
                        },
                        model
                    );
                }
            }
        }
    );

    const library = create(
        {
            process: function(id, fieldset) {
                const data = model.form(id);
                each(fieldset, function(field) {
                    model.fieldset(data.fieldset, field, fieldset[field]);
                });

                return create(form, {
                    elements: {
                        enumerable: true,
                        value: data
                    }
                });
            }
        },
        {
            api: {
                value: function(methods, model) {
                    each(methods, function(method) {
                        property(
                            method,
                            {
                                enumerable: true,
                                value: methods[method]
                            },
                            model
                        );
                    });
                }
            },
            init: {
                value: function(id, fieldset, rules) {
                    rules(library.process(id, fieldset));
                }
            }
        }
    );

    if (typeof global.validate !== "object") {
        property(
            "validate",
            {
                value: {
                    form: function(methods) {
                        library.api(methods, form);
                    },
                    field: function(methods) {
                        library.api(methods, field);
                    },
                    rules: library.init
                }
            },
            global
        );

        Object.freeze(global.validate);
    }
})(window);
