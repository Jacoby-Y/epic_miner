import Player from "./scripts/player.js";
import Pointer from "./scripts/pointer.js";

renderer.createCanvas("main");
renderer.autoAdd("main");


manager.add("player", new Player(game_width/2, game_height/2));

// const pointers = new Array(100);
// for (let i = 0; i < pointers.length; i++) {
//     const dist = (i/5) * 10 + 50;
//     const ang = (Math.PI*2 / pointers.length) * (i*2);
//     const x = Math.cos(ang) * dist;
//     const y = Math.sin(ang) * dist;
    
//     pointers[i] = new Pointer(x, y);
// }

// manager.addMany("pointer", ...pointers);


// manager.add("pointer-0", new Pointer());
// manager.add("pointer-1", new Pointer(-50, -50));
// manager.add("pointer-2", new Pointer(50, -50));
// manager.add("pointer-3", new Pointer(-50, 50));
// manager.add("pointer-4", new Pointer(50, 50));

// ↓↑ These two are the same

// manager.addMany("pointer",
//     new Pointer(), 
//     new Pointer(-50, -50), 
//     new Pointer(50, -50), 
//     new Pointer(-50, 50), 
//     new Pointer(50, 50)
// );

// Don't need to do this anymore because of `renderer.autoAdd("main");`
// renderer.add("main", /* Scripts ->*/ ["player", "pointer-0", "pointer-1", "pointer-2", "pointer-3", "pointer-4"]);

manager.start();

setInterval(()=>{
    document.querySelector("#fps").innerText = `FPS: ${game_fps}`;
}, 500);
