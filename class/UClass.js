import UProperty from './UProperty.js';
import UFunction from './UFunction.js';
import {readFile, writeFile} from 'fs/promises';
var json = JSON.parse(await readFile(new URL("../data/UClasses.json", import.meta.url)));

export default class UClass {

    constructor(name, namespace, description, uProperties = [], uFunctions = []) {
        this.className = name;
        this.namespace;
        this.description;
        this.uProperties = uProperties;
        this.uFunctions = uFunctions;        
    }

    setClassName(name) {
        this.className = name;
    }

    setNameSpace(namespace) {
        this.namespace = namespace;
    }

    setDescription(description) {
        this.description = description;
    }
    
    addUProperty(uProperty) {
        this.uProperties.push(uProperty)
    };
    
    addUFunction(uFunction) {
        this.uFunctions.push(uFunction);
    }

    asJson() {
        return {
            name:this.className,
            namespace:this.namespace,
            properties:this.uProperties,
            functions:this.uFunctions
        }
    }

    save() {
        if(json) {
            json.push(this.asJson());
            writeFile(new URL("./UClasses.json", import.meta.url), JSON.stringify(json));
        }
    }
}