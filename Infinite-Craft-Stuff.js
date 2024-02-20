// ==UserScript==
// @name         Infinite Craft stuff
// @downloadURL	 https://github.com/art0007i/Infinite-Craft-Stuff/raw/main/Infinite-Craft-Stuff.js
// @updateURL	 https://github.com/art0007i/Infinite-Craft-Stuff/raw/main/Infinite-Craft-Stuff.js
// @namespace    https://github.com/art0007i/Infinite-Craft-Stuff
// @version      0.1.0
// @description  Adds auto craft and recipe memory to infinite craft.
// @author       art0007i
// @match        https://neal.fun/infinite-craft/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neal.fun/infinite-craft
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //https://github.com/DVLP/localStorageDB?tab=readme-ov-file#you-can-use-it-as-a-one-liner-in-your-js-code
    !function(){var s,c,e="undefined"!=typeof window?window:{},t=e.indexedDB||e.mozIndexedDB||e.webkitIndexedDB||e.msIndexedDB;"undefined"==typeof window||t?((t=t.open("ldb",1)).onsuccess=function(e){s=this.result},t.onerror=function(e){console.error("indexedDB request error"),console.log(e)},t={get:(c={ready:!(t.onupgradeneeded=function(e){s=null,e.target.result.createObjectStore("s",{keyPath:"k"}).transaction.oncomplete=function(e){s=e.target.db}}),get:function(e,t){s?s.transaction("s").objectStore("s").get(e).onsuccess=function(e){e=e.target.result&&e.target.result.v||null;t(e)}:setTimeout(function(){c.get(e,t)},50)},set:function(t,n,o){if(s){let e=s.transaction("s","readwrite");e.oncomplete=function(e){"Function"==={}.toString.call(o).slice(8,-1)&&o()},e.objectStore("s").put({k:t,v:n}),e.commit()}else setTimeout(function(){c.set(t,n,o)},50)},delete:function(e,t){s?s.transaction("s","readwrite").objectStore("s").delete(e).onsuccess=function(e){t&&t()}:setTimeout(function(){c.delete(e,t)},50)},list:function(t){s?s.transaction("s").objectStore("s").getAllKeys().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.list(t)},50)},getAll:function(t){s?s.transaction("s").objectStore("s").getAll().onsuccess=function(e){e=e.target.result||null;t(e)}:setTimeout(function(){c.getAll(t)},50)},clear:function(t){s?s.transaction("s","readwrite").objectStore("s").clear().onsuccess=function(e){t&&t()}:setTimeout(function(){c.clear(t)},50)}}).get,set:c.set,delete:c.delete,list:c.list,getAll:c.getAll,clear:c.clear},e.ldb=t,"undefined"!=typeof module&&(module.exports=t)):console.error("indexDB not supported")}();

    function artiRng(array) {
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }

    var AUTO_FARM = false;
    var artiObj = null;
    var infCraftObj = null;

    function findElementByProperty(obj, prop) {
        if(obj[prop]) {
            return obj;
        }
        // Check if the object has a 'children' property
        if (obj.$children) {
            // Iterate over the children array
            for (const child of obj.$children) {
                // Recursively search for the property
                let elm = findElementByProperty(child, prop);
                if(elm != null) {return elm}
            }
        }
        return null;
    }


    function artiSave() {
        ldb.set("artiObj", JSON.stringify({
            matches: artiObj
        }))
    }

    let load = ldb.get("artiObj", (load)=>{
        if(!load) {
            load = []
        }
        else {
            load = JSON.parse(load).matches
        }

        console.log("Recipe Data Loaded...")

        artiObj = load;
    });

    // Auto Farm Code
    setInterval(async x => {

        if(!infCraftObj) return;

        if (!AUTO_FARM) return;

        var prot = 0;
        let first = {
            text: "Water",
            emoji: "💧",
            discovered: false
        }
        let second = {
            text: "Water",
            emoji: "💧",
            discovered: false
        }
        while (artiObj.find(x => x.first === first.text && x.second === second.text) != undefined) {
            prot++;
            if (prot > 5000) {
                console.error("over 5k iters!1 bad");
                return;
            }

            first = artiRng(infCraftObj.elements)
            second = artiRng(infCraftObj.elements)

            if (first.text.localeCompare(second.text) < 0) {
                let temp = first;
                first = second;
                second = temp;
            }
        }

        let resp = await infCraftObj.getCraftResponse(first, second);

        if (resp.result === "Nothing") {
            return;
        }

        if (infCraftObj.elements.find(x => x.text === resp.result)) {
            return;
        }

        let element = {
            text: resp.result,
            emoji: resp.emoji,
            discovered: resp.isNew
        }

        if (resp.isNew) {
            console.log("UNIQUE ITEM!!! " + resp.result);
        }else{
            console.log("New Item! " + resp.result);
        }

        infCraftObj.elements.push(element)
        infCraftObj.saveItems()
    }, 500);

    // Inject auto farm button
    document.addEventListener("DOMContentLoaded", ()=>{
        setTimeout(()=>{
            // Find the game state in here
            infCraftObj = findElementByProperty(window.$nuxt, "getCraftResponse");

            let coolbtn = document.querySelector(".mobile-sound");
            var mynode = coolbtn.cloneNode(false);
            mynode.style.right = "60px";
            coolbtn.parentElement.appendChild(mynode);
            let inner = document.createElement("span");
            inner.innerText = ":X";
            mynode.appendChild(inner);


            var mb2 = document.querySelector(".sound");
            var my2 = document.createElement("span");
            my2.innerText = ":X"
            mb2.parentElement.appendChild(my2);


            mynode.addEventListener('click', (e)=>{
                AUTO_FARM = !AUTO_FARM;
                let tx = AUTO_FARM ? ":O" : ":X";
                inner.innerText = tx;
                my2.innerText = tx;
            });

            my2.addEventListener("click", (e)=>{
                AUTO_FARM = !AUTO_FARM;
                let tx = AUTO_FARM ? ":O" : ":X";
                inner.innerText = tx;
                my2.innerText = tx;
            });
        }, 1000);
    });

    const _fetch = window.fetch;
    window.fetch = async function(...args) {
        const promise = _fetch.call(window, ...args);

        if(URL.canParse(args[0])) {
            const url = new URL(args[0]);
            const first = url.searchParams.get("first");
            const second = url.searchParams.get("second");
            if(first && second && url.pathname.endsWith("pair")) {

                promise
                    .then(resp=>resp.clone().json())
                    .then(data=>{
                    const match = {first,second,result: data.result};
                    if(artiObj.find(x=>x.first === match.first && x.second === match.second) == undefined) {
                        artiObj.push(match);
                        artiSave();
                    }
                    //console.log(match);
                });

            }
        }

        return promise;
    }

    console.log("infinite craft stuff loaded");// Your code here...
})();
