export class StringBuilder {
    private _strings: string[]

    constructor() {
        this._strings = []
    }
    
    append(str: string): StringBuilder {
        this._strings.push(str)
        return this
    }

    toString(): string {
        return this._strings.join('')
    }

    clear(): void {
        this._strings = []
    }
}