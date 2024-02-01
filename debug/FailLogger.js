
import {readFile, writeFile} from 'fs/promises';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
import {mkdirSync} from 'fs';

import path from 'node:path';

/**
 * Helper function to assert the data struct files exist. 
 * Reads the specified file path, and creates it if not found.
 * @param {string} filePath 
 * @param {string} fileName 
 * @returns 
 */
async function loadStructFromFile(filePath, fileName) {
    var fullPath = path.join(__dirname, filePath, fileName);
    var file;
    try {
        mkdirSync(path.join(__dirname, filePath), {recursive:true}, err => {});
        file = await readFile(fullPath);
    }
    // if no file, make it.  if other error, throw exception.
    catch(e) {
        if(e.code === "ENOENT") {            
            await writeFile(fullPath, JSON.stringify([]));
            file = await readFile(fullPath);
            return;
        }
        throw e;
    }
    finally {
        if(file) {
            return JSON.parse(file);
        }
    }
    return null;
}

const classStructPath = "/data/fail/";
const classStructFilename = "UClasses.json";
const propertyStructPath = "/data/fail/";
const propertyStructFilename = "UProperty.json";
const functionStructPath = "/data/fail/";
const functionStructFilename = "UFunction.json";
var failClassStruct = await loadStructFromFile(classStructPath, classStructFilename);
var failPropertyStruct = await loadStructFromFile(propertyStructPath, propertyStructFilename);
var failFunctionStruct = await loadStructFromFile(functionStructPath, functionStructFilename);

console.log(failFunctionStruct);

/**
 * handler for failure. Used for debugging issues with parsing classes. Takes in an object that triggered a failure and stores it in the appropriate failed data structure
 * for review.
 */
export default class FailLogger {

    static classBuildFailed(failedClass) {
        if(typeof(failClassStruct) !== "array") failClassStruct = [];
        failClassStruct.push(failedClass);
        writeFile(path.join(__dirname, classStructPath, classStructFilename), JSON.stringify(failClassStruct));
    }
    
    static functionBuildFailed(failedFunction) {
        if(typeof(failFunctionStruct) !== "array") failFunctionStruct = [];
        failFunctionStruct.push(failedFunction);
        writeFile(path.join(__dirname, functionStructPath, functionStructFilename), JSON.stringify(failFunctionStruct));
    }
    
    static propertyBuildFailed(failedProperty) {
        if(typeof(failPropertyStruct) !== "array") failPropertyStruct = [];
        failPropertyStruct.push(failedProperty);
        writeFile(path.join(__dirname, propertyStructPath, propertyStructFilename), JSON.stringify(failPropertyStruct));
    }

}


