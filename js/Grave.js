class Grave{
    #GRAVELIST = [];

    push(grave){
        this.#GRAVELIST.push(grave);
        return grave;
    }

    pop(idx){
        let pop = this.#GRAVELIST[idx];
        this.#GRAVELIST.splice(idx,1);
        return pop;
    }

    drawGrave(coordinates,whichPlayer){
        $(`#field`).append(`<div id = grave_${whichPlayer} style='left : ${coordinates.x - 64/2}px; bottom : ${coordinates.y - 64/2}px'></div>`);
    }

    revive(){
        if(this.#GRAVELIST.length > 0){
            return this.pop(0);
        }
        return false;
    }
}