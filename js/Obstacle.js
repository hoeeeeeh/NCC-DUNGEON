class Obstacle{
    #OBSTACLENUM = 0;
    #LEFTOBSTACLE = [];
    #RIGHTOBSTACLE = [];
    #BOTTOMOBSTACLE = [];
    #UPOBSTACLE = [];

    #OBJECTOBSTACLE = [];

    #OBSTACLEIDX = new Map();
    get idx(){
        return this.#OBSTACLEIDX;
    }
    constructor(){
    }

    destructuring(left,right,bottom,up){
        return[
            {right : right, bottom : bottom, up : up }, // left obstacle
            {left : left, bottom : bottom, up : up}, // right obstacle
            {up: up, left : left, right : right}, // bottom obstacle
            {bottom : bottom, left : left, right : right} // up obstacle
        ];
        
    }

    removeObstacle(obsIdxArr){
        for(let i = 0; i<obsIdxArr.length; i++){
            if(obsIdxArr[i] === -1)
                continue;
            if(i === 0)
                this.#LEFTOBSTACLE.splice(obsIdxArr[i],1);
            else if( i === 1)
                this.#RIGHTOBSTACLE.splice(obsIdxArr[i],1);
            else if( i === 2)
                this.#BOTTOMOBSTACLE.splice(obsIdxArr[i],1);
            else if( i === 3)
                this.#UPOBSTACLE.splice(obsIdxArr[i],1);       
        }

    }

    addObstacleAllSide(name, left,right,bottom,up){
        let destructed = this.destructuring(left,right,bottom,up);
        let obstacleIdx = [-1,-1,-1,-1];
        console.log(destructed);

        obstacleIdx[0] = this.#LEFTOBSTACLE.length; 
        this.#LEFTOBSTACLE.push(destructed[0]);

        obstacleIdx[1] = this.#RIGHTOBSTACLE.length; 
        this.#RIGHTOBSTACLE.push(destructed[1]);

        obstacleIdx[2] = this.#BOTTOMOBSTACLE.length;
        this.#BOTTOMOBSTACLE.push(destructed[2]);

        obstacleIdx[3] = this.#UPOBSTACLE.length;
        this.#UPOBSTACLE.push(destructed[3]);

        this.#OBSTACLEIDX.set(name, obstacleIdx);
    }

    addObstaclePartialSide = (name, left,right,bottom,up, ...args)=>{ // 장애물의 quarter 과 partial side를 각각의 파라미터로 
        let side = ['left','right','bottom','up'];
        let destructed = this.destructuring(left,right,bottom,up);
        let obstacleIdx = [-1, -1, -1, -1];
        for(let arg of args){
            for(let idx = 0; idx < side.length; idx++){
                if (arg === side[idx]){
                    switch(idx){
                        case 0: // left obstacle
                        obstacleIdx[0] = this.#LEFTOBSTACLE.length; 
                        this.#LEFTOBSTACLE.push(destructed[0]);
                            break;
                        case 1: // right obstacle
                        obstacleIdx[1] = this.#RIGHTOBSTACLE.length; 
                        this.#RIGHTOBSTACLE.push(destructed[1]);
                            break;
                        case 2: // bottom obstacle
                        obstacleIdx[2] = this.#BOTTOMOBSTACLE.length; 
                        this.#BOTTOMOBSTACLE.push(destructed[2]);
                            break;
                        case 3: // up obstacle
                        obstacleIdx[3] = this.#UPOBSTACLE.length; 
                        this.#UPOBSTACLE.push(destructed[3]);
                            break;
                        default:
                            console.log('error occur');
                    }
                }
            }
        }
        this.#OBSTACLEIDX.set(name, obstacleIdx);
        return obstacleIdx;
    }

    addObject(obj){
      this.#OBJECTOBSTACLE.push(obj);
       let obstacleIdx = [-1, -1, -1, -1];
                switch(obj.arrow){
                    case 'left':
                        obstacleIdx[0] = this.#LEFTOBSTACLE.length; 
                        this.#LEFTOBSTACLE.push(obj);
                        break;

                    case 'right':
                        obstacleIdx[1] = this.#RIGHTOBSTACLE.length; 
                        this.#RIGHTOBSTACLE.push(obj);
                        break;

                    case 'bottom':
                        obstacleIdx[2] = this.#BOTTOMOBSTACLE.length; 
                        this.#BOTTOMOBSTACLE.push(obj);
                        break;

                    case 'up':
                        obstacleIdx[3] = this.#UPOBSTACLE.length; 
                        this.#UPOBSTACLE.push(obj);
                        break;
                
       }
            return obstacleIdx;
    }


//지금은 이동거리 먼저 체크해서, 현재 위치 + 이동거리 < stuck? 체크이지만, 조금 움직이고 stuck? 체크 를 반복해야할듯.

    isGetStuckGoingHorizontal = (quarter,speed)=>{
        if(speed >= 0){
            return this.isGetStuckGoingRight(quarter,Speed);
        }else{
            return this.isGetStuckGoingLeft(quarter,Speed);
        }
    }

    isGetStuckGoingVertical = (quarter,speed)=>{
        if(speed >= 0){
            return this.isGetStuckGoingUp(quarter,Speed);
        }else{
            return this.isGetStuckGoingBottom(quarter,Speed);
        }
    }




    isGetStuckGoingLeft = (quarter,Speed)=>{
        let movingSpeed = Math.abs(Speed);
        let stuck = {
            bool : false,
            limit : 0,
        };
        for(let obs of this.#LEFTOBSTACLE){
            if(obs?.quarter) {
                obs = obs.quarter;
                }
            if(quarter.up < obs.up && quarter.bottom > obs.bottom){               
                if(quarter.left > obs.right && quarter.left - movingSpeed <= obs.right){
                    stuck.bool = true;
                    stuck.limit = obs.right;
                }
            }
        }
        return stuck;
    }

    isGetStuckGoingRight = (quarter,Speed)=>{
        let movingSpeed = Math.abs(Speed);
        let stuck = {
            bool : false,
            limit : 0,
        };
        for(let obs of this.#RIGHTOBSTACLE){
            if(obs?.quarter) obs = obs.quarter;
             if(quarter.up < obs.up && quarter.bottom > obs.bottom){      
                 if(quarter.right < obs.left && quarter.right + movingSpeed >= obs.left){
                    stuck.bool = true;
                    stuck.limit = obs.left;
                 }
            }
        }
        return stuck;
    }

    isGetStuckGoingBottom = (quarter,Speed)=>{
        let movingSpeed = Math.abs(Speed);
        let stuck = {
            bool : false,
            limit : 0,
        };
        for(let obs of this.#BOTTOMOBSTACLE){
            if(obs?.quarter) obs = obs.quarter;
            if(quarter.left > obs.left && quarter.right < obs.right){
                if(quarter.bottom > obs.up && quarter.bottom - movingSpeed <= obs.up){
                    stuck.bool = true;
                    stuck.limit = obs.up;
                }
            }
        }
        return stuck;
    }

    isGetStuckGoingUp = (quarter,Speed)=>{
        let movingSpeed = Math.abs(Speed);
        let stuck = {
            bool : false,
            limit : 0,
        };
        for(let obs of this.#UPOBSTACLE){
            if(obs?.quarter) obs = obs.quarter;
            if(quarter.left > obs.left && quarter.right < obs.right){
                if(quarter.up < obs.bottom && quarter.up + movingSpeed >= obs.bottom){
                    stuck.bool = true;
                    stuck.limit = obs.bottom;
                }
            }
        }
        return stuck;
    }
    

}