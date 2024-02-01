import fs from 'fs';
import readline from 'readline';
import Factory from '../class/Factory.js';

var factory;

var currentComment; 

const states = {
    OUTSIDE_CLASS: 0,
    INSIDE_CLASS: 1,
    INSIDE_FUNCTION_SPECIFIER: 2, // inside UFUNCTION() macro
    INSIDE_FUNCTION_META: 3, // inside an embedded UFUNCTION parenthesis, same concept as UPROPERTY "meta", allows for an extra layer of parenthesis while parsing a ufunction macro
    INSIDE_FUNCTION_META_SPEC: 4, // second layer for ufunction macro parenthesis. Probably rare, but supported in case. 
    INSIDE_FUNCTION: 5, // after the UFUNCTION() macro but before the function is declared. expecting to find a function declaration.
    INSIDE_PROPERTY_SPECIFIER: 6, // this is actually inside the UPROPERTY() macro, before reaching the end of the flags
    INSIDE_PROPERTY_META: 7, // this is inside a meta tag inside the UPROPERTY declaration
    INSIDE_PROPERTY_META_SPEC: 8, // this is inside a member of the meta tag that is inside a uproperty 
    INSIDE_PROPERTY: 9, // this is after the UPROPERTY() macro but before the data type is declared . expecting to find a data type declaration.
};

var currentState = states.OUTSIDE_CLASS;

var parsingMultilineComment = false;

/**
 * Try to assert whether the given string has comment markers.
 * @param {string} line 
 * @returns {bool} Whether a comment was detected
 */
function isComment(line) {
    return line.startsWith("/*") || line.startsWith("//") || line.includes("*/");
}

/**
 * Clear the current comment state and values. Generally used when the comment has been paired to an object. 
 */
function clearComment() {
    parsingMultilineComment = false;
    currentComment = "";
}


function isUClass(line) {
    return line.startsWith("UCLASS(");
}

function isUEnum(line) {
    return line.startsWith("UENUM(");
}

function isUStruct(line) {
    return line.startsWith("USTRUCT(");
}

function isUProperty(line) {
    return line.startsWith("UPROPERTY");
}

function getPropertyFlags(line) {
    var nospec = line.replace("UPROPERTY(", "");
        var flags = nospec.split(/[,|\)]/); 

        // if we still have parenthesis, then there are embedded parenthesis
        if (nospec.includes("(")) {
            currentState = states.INSIDE_PROPERTY_META;
            var metaData = [];
            // loop over all meta data.           
            while (currentState === states.INSIDE_PROPERTY_META) {
                var subMeta = nospec.substring(nospec.indexOf("("), nospec.indexOf(")"));
                metaData.push(subMeta);
                nospec = nospec.replace(subMeta, "");

                // if no more open parenthesis, then leave the property meta state.
                if (!subMeta.includes("(")) {
                    currentState = states.INSIDE_PROPERTY_SPECIFIER;
                    flags.push(metaData);
                }
            }
        }
        return flags;
}

function splitPropertyDeclaration(propertyDeclaration) {

    const propertyRegex = /^((?:\w+<\w+>\s+)*(?:\w+\s+)*)(\w+)\s*(\[\s*\])?;?$/;
    const matches = propertyDeclaration.match(propertyRegex);

    if (matches) {
        const [, typeQualifiers, propertyName, isArray] = matches;
        const type = typeQualifiers.trim();
        const isArrayProperty = isArray && isArray.trim() === "[]";
        return { type, propertyName, isArrayProperty };
    } else {
        return null; // Not a valid property declaration
    }
}

function isUFunction(line) {
    return line.startsWith("UFUNCTION");
}

function splitFunctionDeclaration(functionDeclaration) {
    const functionRegex = /^(static\s+)?(\w*)\s+(\w+)\s*\((.*?)\);?$/;
    const matches = functionDeclaration.match(functionRegex);
    if (matches) {
        const [, staticFlag, returnType, functionName, parameters] = matches;
        const isStatic = staticFlag ? true : false;
        const params = parameters.split(/\s*,\s*/).map(param => {
            const [type, paramName] = param.split(/\s+/).filter(Boolean);
            return { type, paramName };
        });
        return { isStatic, returnType, functionName, params };
    } else {
        return null; // Not a valid function declaration
    }
}

function isPropertyDeclaration(line) {

}

function isFunctionDeclaration(line) {

}


/**
 * Parse a given string, looking for property specifiers that match documentation flags.
 * @param {string} line 
 * @return {string} type of specifier found
 */
function parseLine(line) {
    // remove any whitespace at the start of the line
    line = line.trim();

    // detect comment
    if(isComment(line)) {

        // is the start of a comment or next line of a multiline
        if(line.startsWith("/*") || line.startsWith("//") || parsingMultilineComment) {
            currentComment += line.substring(0, line.indexOf("*/") || line.length-1);
            parsingMultilineComment = true;
        }

        /* contains the end of a comment multiline, or is a single line comment.
        * NOTE: this doesn't filter edge cases where "//"" may be part of a multiline comment
        */
        if(line.includes("*/") || line.includes("//")) {
            parsingMultilineComment = false;
        }
    }


    // If outside of a class, search for class specifier. Can safely return here, as no further logic is required while in this state.
    if (currentState === states.OUTSIDE_CLASS) {

        // new uclass
        if (isUClass(line)) {
            currentState = states.INSIDE_CLASS;
            factory.makeObject("UClass", currentComment);
            clearComment();
        }

        // new ustruct
        if (isUStruct(line)) {
            currentState = states.INSIDE_CLASS;
            factory.makeObject("UStruct", currentComment);
            clearComment();
        }

        // new uenum
        if (isUEnum(line)) {
            currentState = states.INSIDE_CLASS;
            factory.makeObject("UEnum", currentComment);
            clearComment();
        }
        return;
    }


    // if inside a class, search for member specifier. Does not return here, so we can continue to parse the same line later if applicable.
    if (currentState === states.INSIDE_CLASS) {

        if (isUProperty(line)) {
            factory.startUProperty();
            factory.updateUProperty(null, null, null, currentComment);
            currentState = states.INSIDE_PROPERTY_SPECIFIER;        
        }

        if (isUFunction(line)) {
            factory.startUFunction();
            currentState = states.INSIDE_FUNCTION_SPECIFIER;
        }        
    }


    //if inside uproperty macro declaration - search for property flags. 
    // returns here, assuming that properties are not declared on the same line as the macro, so we never need to go deeper on the same line.
    if (currentState === states.INSIDE_PROPERTY_SPECIFIER) {
        const flags = getPropertyFlags(line);
        factory.updateUProperty(null, flags, null);

        // if we find the end of the specifier, change the state. otherwise just move to next line.
        if (line.replace("UPROPERTY(", "").trim().charAt(line.replace("UPROPERTY(", "").trim().length - 1) === ")") {
            currentState = states.INSIDE_PROPERTY;
            clearComment();
        }
        return;
    }

    // if inside a property spec
    if(currentState === states.INSIDE_PROPERTY) {
        var result = splitPropertyDeclaration(line);    
        if(!result) {
            factory.failUProperty();
            currentState = states.INSIDE_CLASS;
            return;
        }
        factory.updateUProperty(result.propertyName, null, result.type);
        factory.endUProperty();
        clearComment();
        currentState = states.INSIDE_CLASS;   
        return;     
    }

    if(currentState === states.INSIDE_FUNCTION_SPECIFIER) {
        const flags = getPropertyFlags(line);
        factory.updateUFunction(null, null, currentComment, null, flags);
        // if we find the end of the specifier, change the state. otherwise just move to next line.
        if (line.replace("UFUNCTION(", "").trim().charAt( line.replace("UFUNCTION(", "").trim().length - 1) === ")") {
            currentState = states.INSIDE_FUNCTION;
            clearComment();
        }
        return;
    }

    if(currentState === states.INSIDE_FUNCTION) {
        var result  = splitFunctionDeclaration(line);
        if(!result) {
            factory.failUFunction();
            currentState = states.INSIDE_CLASS;
            return;
        }        
        factory.updateUFunction(result.functionName, result.params, null, result.returnType);
        factory.endUFunction();
        currentState = states.INSIDE_CLASS;
    }


    // end of class
    if(currentState === states.INSIDE_CLASS) {
        if(line.trim().includes("}")) {
            factory.finaliseObject();
            currentState = states.OUTSIDE_CLASS;
        }
    }
}


/**
 * Main function for parsing a header file. expects a file path to the appropriate file type. Parses the file line by line and passes it to internal function to 
 * filter out appropriate members to document.
 */
export default function parseFile(filePath) {
    factory = new Factory();
    var outLine;
   // console.log("Parsing" + filePath);
    const readInterface = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: outLine,
        console: false
    });

    readInterface.on('line', (line) => { parseLine(line) });
};
