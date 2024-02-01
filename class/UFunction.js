export default class UFunction {

    constructor(name, args, description, returnType = "void", flags = []) {
        this.name = name;
        this.flags = flags;
        this.args = args;
        this.returnType = returnType;
        this.description = description;
    }

    setArgs(args) {
        this.args = args;
    }

    setName(name) {
        this.name = name;
    }

    setDescription(description) {
        this.description = description;
    }

    asJson() {
        return {
            name:this.name,
            flags:this.flags,
            args:this.args,
            returnType:this.returnType,
            description:this.description
        }
    }
}