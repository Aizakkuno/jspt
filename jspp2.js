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

    if (valueObjType == "string") {
        return str;
    } else if (valueObjType == "boolean") {
        return bool;
    } else if (valueObjType == "function") {
        return func;
    } else if (valueObjType == "undefined") {
        return none;
    } else if (valueObjType == "number") {
        return value == int(value) ? int : float;
    } else if (valueObjType == "object") {
        if (value.constructor == Object) {
            return dict;
        } else if (value.constructor == Array) {
            return list;
        } else {
            return value.constructor;
        }
    }
}

const isInstance = (value, typeOrList) => {
    if (getType(typeOrList) == list) {
        for (const listType of typeOrList) {
            if (listType == getType(value)) {
                return true;
            }
        }

        return false;
    } else {
        return getType(value) == typeOrList;
    }
}

Object.prototype.items = function() {
    if (!isInstance(this, dict)) {
        throw new Error(".items can only be called on dict!");
    }

    return Object.entries(this);
}

Object.prototype.keys = function() {
    if (!isInstance(this, dict)) {
        throw new Error(".items can only be called on dict!");
    }

    return Object.keys(this);
}

Object.prototype.values = function() {
    if (!isInstance(this, dict)) {
        throw new Error(".items can only be called on dict!");
    }

    return Object.values(this);
}

Object.prototype.in = function(valueList) {
    if (!isInstance(valueList, list)) {
        if (isInstance(valueList, [dict, str])) {
            valueList = list(valueList);
        } else {
            throw new Error("valueList must be a list!");
        }
    }

    for (const value of valueList) {
        if (this == value) {
            return true;
        }
    }

    return false;
}

Object.prototype.contains = function(value) {
    let iterableThis;
    if (!isInstance(this, list)) {
        if (isInstance(this, [dict, str])) {
            iterableThis = list(this);
        } else {
            throw new Error(".contains can only be called on iterables!");
        }
    } else {
        iterableThis = this;
    }

    for (const iteratedValue of iterableThis) {
        if (iteratedValue == value) {
            return true;
        }
    }

    return false;
}