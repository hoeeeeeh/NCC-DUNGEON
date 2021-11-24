class StageMap {
    #INFO = {
        MAPMINWIDTH : 0,
        MAPMAXWIDTH : 0,
        MAPMINHEIGHT : 0,
        MAPMAXHEIGHT : 0,
    }

    constructor(){
        this.setInfo();
    }

    get info(){
        return this.#INFO;
    }
    
    setInfo(){
        console.log(BrowserManager.screen());
        const BORDER = 7;
        this.#INFO.MAPMINWIDTH = parseFloat($(".sidebar").css("width")) + BORDER;
            // 1330, 538 / border 7 / sidebar 238
        this.#INFO.MAPMAXWIDTH = this.#INFO.MAPMINWIDTH + (BrowserManager.screen().width-14) * 0.7;
        this.#INFO.MAPMINHEIGHT =  (BrowserManager.screen().height-14) * 0.2 + BORDER;
    // padding : 190
        this.#INFO.MAPMAXHEIGHT = this.#INFO.MAPMINHEIGHT + parseFloat($("#field").css("height"));
    }
}