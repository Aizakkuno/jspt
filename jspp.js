function isInstance(value, typeOrList) {
    
}

const arrayContains = (array, item) => {
    for (let i = 0; i < array.length; i++) {
        const compareItem = array[i];

        if (compareItem == item) {
            return true;
        }
    }

    return false;
}

class Dict {
    // static reservedKeywords = ["forItems", "forKeys", "forValues"];

    constructor(dictObj = {}) {
        if (dictObj.constructor != Object) {
            throw new Error("Object is not a dictionary!");
        }

        this.objKeys = Object.keys(dictObj);
        for (let i = 0; i < this.objKeys.length; i++) {
            const key = this.objKeys[i];
            const value = dictObj[key];

            // if (arrayContains(Dict.reservedKeywords, key)) {
            //     throw new Error("Object overrides reserved variables!");
            // }

            this[key] = value;
        }
    }

    forItems(callback) {
        
    }
}

class List {
    constructor(listObj = []) {
        if (listObj.constructor != Array) {
            throw new Error("Object is not a list/array!");
        }

        for (let i = 0; i < listObj.length; i++) {
            this[i] = listObj[i];
        }

        this.length = listObj.length;
    }

    contains(item) {

    }
}