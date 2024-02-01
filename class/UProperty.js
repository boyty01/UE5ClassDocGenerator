export default class UProperty {

    constructor(name, flags, type, description) {
        this.name = name;        
        this.flags = flags || [];
        this.type = type;
        this.description = description;
    }

    /**
     * retun this property as a json (js) object.
     * @returns {object} this class as a json/js object
     */
    asJson() {
        return {
            name:this.name,
            flags:this.flags,
            type:this.type,
            description:this.description
        }
    }
}