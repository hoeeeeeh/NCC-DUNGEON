class Title {
    #idx = 0;
    // 메뉴 선택지 인덱스
    #isGameStart = false;
    //게임 시작 여부
    #menu = [];

    #howManyPlayer = 0;

    get howManyPlayer(){
        return this.#howManyPlayer;
    }

    set howManyPlayer(num){
        this.#howManyPlayer = num;
    }
    /*
    #menu = [this.gameStart, this.characterSelect, this.setting];  하면 안되는 이유
        : characterSelect 함수는 일반적인 함수 선언이 아니라 화살표 함수로 선언했음. 
        화살표 함수는 호이스팅이 되지 않기 때문에 undefined 가 되어버림.
        화살표 함수와 마찬가지로 함수 표현식은 호이스팅이 되지 않음 ex) var boo = function(){...} 는 호이스팅 되지 않음.
    
    */

    //메뉴 배열

    constructor() {
        this.#menu = [this.gameStart, this.characterSelect, this.setting];
    }

    get tag(){
        return `#select_title>ul>li:nth-child(${this.#idx + 1})`; 
        // idx 번 째에 있는 메뉴 선택지 태그
    }

    selectTitle() {
        const keydown = (e)=>{
            switch (e.keyCode){
                case 38 : // ↑
                case 82 : // R
                    if(this.#idx > 0){
                        $(this.tag).removeClass(`selected`);
                        this.#idx--;
                        $(this.tag).addClass(`selected`);
                    }
                    break;
                case 40 : // ↓
                case 70 : // F
                    if(this.#idx < this.#menu.length - 1){
                        $(this.tag).removeClass(`selected`);
                        this.#idx++;
                        $(this.tag).addClass(`selected`);
                    }
                    break;
                case 13 : // ENTER 엔터
                    this.#menu[this.#idx]();
                    keydownEvent.dispose();
                    keydownEvent = null; // 가비지 콜렉터
                    break;

            }
        }
        let keydownEvent = new EventListener({event : 'keydown' , callback : keydown});
        keydownEvent.add();
    }

    gameStart = ()=>{
        document.documentElement.requestFullscreen(); // 전체화면 모드 진입
        new GameManager(this.howManyPlayer + 1).setUpTheGame();
        
        // const gameLoad = setInterval(()=>{
        //     console.log('game load....');
        //     if(window.innerHeight == screen.height){
        //         new GameManager(this.howManyPlayer + 1).setUpTheGame();
        //         clearInterval(gameLoad);
        //     }
        // }, 100);
    }

    characterSelect = ()=>{

        $("#title_popup").css("width", "30%");
        $("#characterSelectPopup").css("opacity", "100%");

        let popup_idx = this.howManyPlayer;
        const maxPlayer = 2;

        function popup_tag(idx){
            return `#characterSelectPopup>p:nth-child(${idx + 1})`;
        } 

        const keydown = (e)=>{
            switch (e.keyCode){
                case 38 : // ↑
                case 82 : // R
                    if(popup_idx > 0){
                        $(popup_tag(popup_idx)).removeClass(`selected_popup`);
                        popup_idx--;
                        $(popup_tag(popup_idx)).addClass(`selected_popup`);
                    }
                    break;
                case 40 : // ↓
                case 70 : // F
                    if(popup_idx < maxPlayer - 1){
                        $(popup_tag(popup_idx)).removeClass(`selected_popup`);
                        popup_idx++;
                        $(popup_tag(popup_idx)).addClass(`selected_popup`);
                    }
                    break;
                case 13 : // ENTER 엔터
                    keydownEvent.dispose();
                    keydownEvent = null; // 가비지 콜렉터
                    this.howManyPlayer = popup_idx;
                    $("#title_popup").css("width", "0%");
                    $("#characterSelectPopup").css("opacity", "0%");
                    this.selectTitle();
                    break;

            }
        }
        let keydownEvent = new EventListener({event : 'keydown' , callback : keydown});
        keydownEvent.add();

    }

    setting(){
        alert('아무 기능 없지롱. 새로고침 하세요');
    }

    fullScreen(){
        document.documentElement.requestFullscreen();
    }
}
