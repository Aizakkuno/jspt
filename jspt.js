const ptype = (value) => {
    if (value === undefined || value === null) {
        return null;
    } else if (value.constructor === String) {
        return str;
    } else if (value.constructor === Boolean) {
        return bool;
    } else if (value.constructor === Function) {
        if (ptypes.includes(value)) {
            return ptype;
        } else {
            return func;
        }
    } else if (value.constructor === Number) {
        return Number.isInteger(value) ? int : float;
    } else if (value.constructor === Object) {
        return dict;
    } else if (value.constructor === Array) {
        return list;
    } else {
        return object;
    }
}

const isInstanceBasic = (value, valueType) => {
    return ((ptype(value) === object && value instanceof valueType) ||
            ptype(value) === valueType);
}

const isInstance = (value, typeOrList) => {
    if (isInstanceBasic(typeOrList, list)) {
        for (const listType of typeOrList) {
            if (isInstanceBasic(value, listType)) {
                return true;
            }
        }

        return false;
    } else {
        return isInstanceBasic(value, typeOrList);
    }
}

const str = (value) => {
    if (isInstance(value, list)) {
        let isPtypeList = value.length > 0;
        let firstRun = true;

        let typeString = "(";

        for (const item of value) {
            if (isInstance(item, ptype)) {
                if (firstRun) {
                    firstRun = false;
                } else {
                    typeString += ", ";
                }

                typeString += str(item);
            } else {
                isPtypeList = false;
            }
        }

        if (isPtypeList) {
            typeString += ")";

            return typeString;
        }
    } else if (isInstance(value, ptype)) {
        return ptypeStringMap.get(value);
    }
    
    if (isInstance(value, [list, dict])) {
        return JSON.stringify(value);
    } else {
        return String(value);
    }
}

const int = (value) => {
    if (value != null && !isInstance(value, [str, float, int, bool])) {
        throw new Error("Value is not of a parseable type (str, float, "
                        + "int, bool)!");

    } else if (!value) {
        return 0.0;
    }

    value = parseInt(value);

    if (Number.isNaN(value)) {
        throw new Error("Integer could not be converted!");
    }

    return value;
    // return parseInt(value) || 0;
}

const float = (value) => {
    if (value != null && !isInstance(value, [str, float, int, bool])) {
        throw new Error("Value is not of a parseable type (str, float, "
                        + "int, bool)!");

    } else if (!value) {
        return 0.0;
    }

    value = parseFloat(value);

    if (Number.isNaN(value)) {
        throw new Error("Float could not be converted!");
    }

    return value;

    // return parseFloat(value);
}

const dict = (value) => {
    if (!value) {
        return {};
    }

    if (isInstance(value, str)) {
        try {
            value = JSON.parse(value);
        } catch (error) {
            throw new Error("Value is not JSON serializable!");
        }
    }

    if (!isInstance(value, dict)) {
        throw new Error("Value is not a dictionary!");
    }

    return value;
}

const list = (value) => {
    if (isInstance(value, dict)) {
        return Object.values(value);
    } else if (isInstance(value, list)) {
        return value;
    } else if (!value) {
        return [];
    } else {
        value = str(value);

        if (value.contains("{") || value.contains("[")) {
            try {
                return JSON.parse(value);
            } catch (error) {
                return value.split("");
            }
        } else {
            return value.split("");
        }
    }
}

const bool = (value) => {
    if (isInstance(value, [str, list, dict])) {
        return list(value).length > 0;
    } else {
        return Boolean(value);
    }
}

const func = (value) => {
    if (!isInstance(value, func)) {
        throw new Error("Value must be a function!");
    }

    return value;
}

const object = (value) => {
    if (isInstance(value, none)) {
        return Object();
    }

    if (!isInstance(value, object)) {
        throw new Error("Value must be a class object/instance!");
    }

    return value;
}

class FlexDictNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}

class FlexDict {
    constructor(inheritDict = {}) {
        if (!isInstance(inheritDict, dict)) {
            throw new Error("inheritDict must be type dictionary!");
        }

        this.nodes = [];

        for (const [key, value] of inheritDict.items()) {
            this.set(key, value);
        }
    }

    set(key, value) {
        const node = new FlexDictNode(key, value);

        this.nodes.push(node);
    }

    get(key) {
        for (const node of this.nodes) {
            if (node.key == key) {
                return node.value;
            }
        }
    }
}

Object.prototype.items = function() {
    if (!isInstance(this, [list, dict])) {
        throw new Error(".items can only be called on type list/dict!");
    }

    return Object.entries(this);
}

Object.prototype.keys = function() {
    if (!isInstance(this, [list, dict])) {
        throw new Error(".keys can only be called on type list/dict!");
    }

    return Object.keys(this);
}

Object.prototype.values = function() {
    if (!isInstance(this, dict)) {
        throw new Error(".values can only be called on type dict!");
    }

    return Object.values(this);
}

Object.prototype.in = function(iterable) {
    if (isInstance(iterable, str)) {
        return iterable.includes(this);
    } else if (isInstance(iterable, dict)) {
        iterable = list(iterable);
    } else if (!isInstance(iterable, list)) {
        throw new Error("iterable must be an iterable!");
    }

    for (const value of iterable) {
        if (this == value) {
            return true;
        }
    }

    return false;
}

Object.prototype.contains = function(value) {
    if (isInstance(this, dict)) {
        iterableThis = list(this);

        return iterableThis.includes(value);
    } else {
        return this.includes(value);
    }
}

Object.prototype.removeKey = function(...keys) {
    if (!isInstance(this, dict)) {
        throw new Error(".removeKey can only be called on type dict!");
    }

    const newDict = {};
    const removedKeys = [];

    for (const [key, value] of this.items()) {
        if (key.in(keys)) {
            removedKeys.append(key)
        } else {
            newDict[key] = value;
        }
    }

    return newDict;
}

Object.prototype.removeValue = function(...values) {
    if (!isInstance(this, dict)) {
        throw new Error(".removeValue can only be called on type dict!");
    }

    const newDict = {};
    const removedValues = [];

    for (const [key, value] of this.items()) {
        if (value.in(values)) {
            removedValues.append(value)
        } else {
            newDict[key] = value;
        }
    }

    return newDict;
}

Array.prototype.removeIndex = function(...indexes) {
    if (!isInstance(this, list)) {
        throw new Error(".removeIndex can only be called on type list!");
    }

    const newList = [];
    const removedIndexes = [];

    for (const [index, value] of this.items()) {
        if (index.in(indexes)) {
            removedIndexes.append(index)
        } else {
            newList.append(value);
        }
    }

    return newList;
}

Array.prototype.remove = function(...values) {
    if (!isInstance(this, list)) {
        throw new Error(".remove can only be called on type list!");
    }

    const newList = [];
    const removedValues = [];

    for (const value of this) {
        if (value.in(values)) {
            removedValues.append(value)
        } else {
            newList.append(value);
        }
    }

    return newList;
}

Array.prototype.asString = function() {
    let newString = "";

    for (const value of this) {
        newString += str(value);
    }

    return newString;
}

Array.prototype.append = Array.prototype.push;

String.prototype.join = function(...values) {
    const newString = this;

    for (const value of values) {
        if (isInstance(value, list)) {
            for (const listValue of value) {
                newString += str(listValue);
            }
        } else {
            newString += str(value);
        }
    }

    return newString;
}

const ptypes = [str, int, float, dict, list, bool, func, object, ptype];

// possibly allow arrays to be passed into flexdict for simplification
const ptypeStringMap = new FlexDict();

ptypeStringMap.set(str, "str");
ptypeStringMap.set(int, "int");
ptypeStringMap.set(float, "float");
ptypeStringMap.set(dict, "dict");
ptypeStringMap.set(list, "list");
ptypeStringMap.set(bool, "bool");
ptypeStringMap.set(func, "func");
ptypeStringMap.set(object, "object");
ptypeStringMap.set(ptype, "ptype");

window.elements = {}

const loadInterval = setInterval(() => {
    if (document.readyState === "complete") {
        const allElements = document.querySelectorAll('*[id]');

        for (const element of allElements) {
            window.elements[element.id] = element;
        }

        if (window.main && isInstance(window.main, func)) {
            window.main();
        }

        clearInterval(loadInterval);
    }
}, 100);