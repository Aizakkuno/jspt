const str = (value) => {
    if (value.constructor == Array || value.constructor == Object) {
        return JSON.stringify(value);
    } else {
        return String(value);
    }
}

const int = (value) => {
    return parseInt(value);
}

const float = (value) => {
    return parseFloat(value);
}

const dict = (value) => {
    if (bool(value) && typeof(value) != "object") {
        value = JSON.parse(value);
    }

    if (value.constructor != Object) {
        throw new Error("Value is not a dictionary!");
    }

    return value;
}

const list = (value) => {
    if (value.constructor != String && typeof(value) != "object") {
        value = JSON.parse(value);
    }

    if (value.constructor == Array) {
        return value;
    } else if (value.constructor == Object) {
        return Object.values(value);
    } else if (value.constructor == String) {
        return value.split("");
    } else {
        throw new Error("Value is not a list/array!");
    }
}

const bool = (value) => {
    return Boolean(value);
}

const func = (value) => {
    if (value.constructor != Function) {
        throw new Error("Value must be a function!");
    }

    return value;
}

const obj = (value) => {
    if (typeof(value) != "object") {
        throw new Error("Value must be a class object/instance!");
    }

    return value;
}

const none = (value) => {
    return null;
}

const getType = (value) => {
    const valueObjType = typeof(value);

    if (value.constructor == String) {
        return str;
    } else if (value.constructor == Boolean) {
        return bool;
    } else if (value.constructor == Function) {
        return func;
    } else if (value == undefined || value == null) {
        return none;
    } else if (value.constructor == Number) {
        return value == int(value) ? int : float;
    } else if (value.constructor == Object) {
        return dict;
    } else if (value.constructor == Array) {
        return list;
    } else {
        return obj;
    }
}

const isInstance = (value, typeOrList) => {
    if (getType(typeOrList) == list) {
        let flag = false;

        for (const listType of typeOrList) {
            if ((getType(value) == obj && value instanceof listType) ||
                listType == getType(value)) {

                return true
            }
        }

        return false;
    } else {
        return ((getType(value) == obj && value instanceof typeOrList) ||
                getType(value) == typeOrList);
    }
}

Object.prototype.items = function() {
    if (!isInstance(this, [list, dict])) {
        throw new Error(".items can only be called on list/dict!");
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
    if (!isInstance(this, dict)) {
        throw new Error(".items can only be called on dict!");
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

// Object.prototype.contains = function(...values) {
//     let iterableThis;
//     if (!isInstance(this, list)) {
//         if (isInstance(this, [dict, str])) {
//             iterableThis = list(this);
//         } else {
//             throw new Error(".contains can only be called on iterables!");
//         }
//     } else {
//         iterableThis = this;
//     }

//     console.log(iterableThis)

//     const fulfilledValues = [];

//     for (const iteratedValue of iterableThis) {
//         if (iteratedValue.in(values)) {
//             fulfilledValues.append(iteratedValue);
//         }
//     }

//     return fulfilledValues.length == values.length;
// }

Object.prototype.removeKey = function(...keys) {
    if (!isInstance(this, dict)) {
        throw new Error(".removeKey can only be called on dict!");
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
        throw new Error(".removeValue can only be called on dict!");
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
        throw new Error(".removeIndex can only be called on list!");
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

Array.prototype.append = Array.prototype.push;

const blockUntilReady = () => {
    while (true) {
        if (document.readyState == "complete") {
            return true;
        }
    }
}