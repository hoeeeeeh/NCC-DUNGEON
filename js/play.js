/*

    * DATE: 2021_07_13 TUE
    * VERSION : 1.0
    * JAVASCRIPT
    * @license Copyright (c) 2021~, Hoeeeeeh, All rights reserved.
    * @author : Hoeeeeeh

*/

/*
    TODO-LIST
    1. 자바스크립트에 소멸자 있는지 찾아보기.


*/

import fs from "fs";

const openBrowserAndThen = new BrowserManager();
openBrowserAndThen.init();
openBrowserAndThen.selectTitle();

function preloading(imageArray) {
  let n = imageArray.length;
  for (let i = 0; i < n; i++) {
    let img = new Image();
    img.src = imageArray[i];
  }
}

preloading(["./img/background/background_2.png"]);

var fs = require("fs");
var files = fs.readdirSync("./img");

console.log(files.length);
