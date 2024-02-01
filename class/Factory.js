import UClass from './UClass.js';
import UProperty from './UProperty.js';
import UFunction from './UFunction.js';
import FailLogger from '../debug/FailLogger.js';

export default class Factory {

   constructor() {
      this.isBuildingProperty = false;
      this.constructingProperty = new UProperty();
      this.isBuildingFunction = false;
      this.constructingFunction = new UFunction();
      this.isBuildingObject = false;
      this.constructingObject = null;
   }

   /**
    * Construct a new UObject of type specified
    * @param {string} type Object subclass
    * @param {string} name Object name
    */
   makeObject(type, name, namespace, description, uProperties = [], uFunctions =[]) {
      if (this.isBuildingObject) {
         throw "Error. Attempting to build new object but factory is already building an object.";
      }

      this.isBuildingObject = true;
      switch (type.toLowerCase()) {
         case type === "uclass":
            this.constructingObject = new UClass(name, namespace, description, uProperties, uFunctions);
            break;
         default:
            this.constructingObject = new UClass(name);
            break;
      }
   }

   /**
    * Update object data fields. This function doesn't support adding UFunctions or UProperties. 
    * @param {string} name
    * @param {string} namespace
    * @param {string} description
    */
   updateObject(name, namespace, description) {
      if(!this.isBuildingObject) {
         throw "Error. Factory attempted to update an object, but no object is currently being built.";
      }
      this.constructingObject.name = name || this.constructingObject.name;
      this.constructingObject.namespace = namespace || this.constructingObject.namespace;
      this.constructingObject.description = description || this.constructingObject.description;
   }

   /**
    * ends construction of the current object and return a copy.
    * @returns {UObject} unreal object instance. 
    */
   finaliseObject() {
      if(!this.isBuildingObject) {
         throw "Error. Factory attempted to finalise an object, but no object is currently being built.";
      }
      this.constructingObject.save();
      this.isBuildingObject = false;
   }

   /**
    * Fails the currently constructing object. Useful for debugging. Forwards the error to the FailLogger to handle recording.
    */
   failObject() {
      if(!this.isBuildingObject) {
         throw "Error. Factory attempted to fail an object, but no object is currently being built.";
      }      
      FailLogger.classBuildFailed(this.constructingObject.asJson());
      this.isBuildingObject = false;
   }


   /**
    * Initialises a uproperty. awaits future information on the property. Calling this function again before calling endUProperty will throw an exception.
    * send UProperty information with updateUProperty(). 
    */
   startUProperty() {
      if(!this.isBuildingObject) {
         throw "Error. Factory trying to construct UProperty but no UObject is currently being built.";
      }
      
      this.isBuildingProperty = true;
      this.constructingProperty = new UProperty();
   };

   /**
    * Update a constructing uproperty with the required data. fields can be null if they cannot all be specified at once. null fields will default to the uproperties existing
    * value if applicable. 
    * @param {string} name 
    * @param {string} flags 
    * @param {string} type 
    */
   updateUProperty(name, flags, type, description) {
      if(!this.isBuildingProperty) {
         throw "Error. Factory trying to update a UProperty but no Property is being built.";
      }

      this.constructingProperty.name = name || this.constructingProperty.name;
      this.constructingProperty.flags = this.constructingProperty.flags.concat(flags);
      this.constructingProperty.type = type || this.constructingProperty.type;
      this.constructingProperty.description = description || this.constructingProperty.description;
   }

   /**
    * Finalise a UProperty and store it in the current objects attributes. Throws an exception if no uproperty is currently under construction.
    */
   endUProperty() {
      if(!this.isBuildingProperty) { 
         throw "Error. Factory trying to finalize a UProperty but no UProperty is being built.";
      }
      this.constructingObject.addUProperty(this.constructingProperty);
      this.isBuildingProperty = false;
   }

   /**
    * Fails the currently constructing property. Useful for debugging. Forwards the error to the FailLogger to handle recording.
    * Failed properties do not fail their container, but do not get added to the container attributes. 
    */
   failUProperty() {
      if(!this.isBuildingProperty) {
         throw "Error. Factory trying to fail a UProperty, but no UProperty is being built.";
      }
      FailLogger.propertyBuildFailed(this.constructingProperty.asJson());
      this.isBuildingProperty = false;

   }

   startUFunction(name, args, description, returnType, flags) {
      if(this.isBuildingFunction) { 
         throw "Error. Factory trying to build a new function, but a function is already being being built.";
      }
      this.isBuildingFunction = true;
      this.constructingFunction = new UFunction(name, args, description, returnType, flags);

   };

   updateUFunction(name, args, description, returnType, flags = []) {
      if(!this.isBuildingFunction) { 
         throw "Error. Factory trying toupdate a function but no function is currently being built.";         
      }
      this.constructingFunction.name = name || this.constructingFunction.name;
      this.constructingFunction.args = args || this.constructingFunction.args;
      this.constructingFunction.description = description || this.constructingFunction.description;
      this.constructingFunction.returnType = returnType || this.constructingFunction.returnType;
   };

   endUFunction() {
      if(!this.isBuildingFunction) { 
         throw "Error. Factory trying to finalise a function but no function is being built.";         
      }
      this.constructingObject.addUFunction(this.constructingFunction);
      this.isBuildingFunction = false;
   };

   /**
    * Fails the currently constructing function. Useful for debugging. Forwards the error to the FailLogger to handle recording.
    * Failed functions do not fail their container, but do not get added to the containers attributes. 
    */
   failUFunction() {
      if(!this.isBuildingFunction) { 
         throw "Error. Factory trying to fail a function but no function is being built.";         
      }
      FailLogger.functionBuildFailed(this.constructingFunction.asJson());
      this.isBuildingFunction = false;
   }
}