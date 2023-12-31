const ptype = (value) => {
    if (value === undefined || value === null) {
        return none;
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
        return value == Number.isInteger(value) ? int : float;
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
    if (isInstance(value, [list, dict])) {
        return JSON.stringify(value);
    } else if (isInstance(value, ptype)) {
        return String(value).split(" ")[1].replace("()", "");
    } else {
        return String(value);
    }
}

const int = (value) => {
    if (!isInstance(value, [str, float, int, bool, none])) {
        throw new Error("Value is not of a parseable type (str, float, "
                        + "int, bool, none)!");
    }

    return parseInt(value) || 0;
}

const float = (value) => {
    if (!isInstance(value, [str, float, int, bool, none])) {
        throw new Error("Value is not of a parseable type (str, float, "
                        + "int, bool, none)!");
    }

    return parseFloat(value) || 0.0;
}

const dict = (value) => {
    if (isInstance(value, none)) {
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
    } else if (isInstance(value, none)) {
        return {};
    } else {
        try {
            return JSON.parse(value);
        } catch (error) {
            return str(value).split("");
        }
    }
}

const bool = (value) => {
    if (!isInstance(value, [str, list, dict])) {
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

const none = (value) => {
    return null;
}

const ptypes = [str, int, float, dict, list, bool, func, object, none, ptype];

Object.prototype.entries = function() {
    if (!isInstance(this, [list, dict])) {
        throw new Error(".entries can only be called on list/dict!");
    }

    return Object.entries(this);
}

Object.prototype.keys = function() {
    if (!isInstance(this, [list, dict])) {
        throw new Error(".keys can only be called on list/dict!");
    }

    return Object.keys(this);
}

Object.prototype.values = function() {
    if (!isInstance(this, [list, dict])) {
        throw new Error(".values can only be called on list/dict!");
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
        if (this === value) {
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
        throw new Error(".removeKey can only be called on dict!");
    }

    const newDict = {};
    const removedKeys = [];

    for (const [key, value] of this.entries()) {
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
        throw new Error(".removeValue can only be called on dict!");
    }

    const newDict = {};
    const removedValues = [];

    for (const [key, value] of this.entries()) {
        if (value.in(values)) {
            removedValues.append(value)
        } else {
            newDict[key] = value;
        }
    }

    return newDict;
}

// Object.prototype.asChars = function() {
//     let iterableThis;

//     if (!isInstance(this, [list, dict])) {

//     }
// }

Array.prototype.removeIndex = function(...indexes) {
    if (!isInstance(this, list)) {
        throw new Error(".removeIndex can only be called on list!");
    }

    const newList = [];
    const removedIndexes = [];

    for (const [index, value] of this.entries()) {
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
        throw new Error(".remove can only be called on list!");
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