class EventListener {
    #args = [];
    constructor(...args) { // REST 파라미터, ... 을 붙히면 인자를 배열로 전달받음.
        this.#args = args;
    }
    add = ()=>{
      for (let e of this.#args)
          document.addEventListener(e.event, e.callback); 
      return this;
    }

    dispose = ()=> {
        for (let e of this.#args)
            document.removeEventListener(e.event, e.callback);
        return this;
    }
}