let game_scale = 1;
let game_width = 1920;
let game_height = 1080;
let game_fps = 60;
let last_frame = performance.now();

class Script {
    constructor(deps=[""], enabled=true) {
        this.enabled = enabled;
        this.deps = deps;
    }
    start() {}
    update() {}
    draw() {}
}

const renderer = {
    scripts: [],
    ctxs: {},
    ctx_ids: [],
    game_canvas: null,
    game_ctx: null,
    auto_add: null,

    createCanvas(canvas_id="", will_clear=true) {
        if (this.game_canvas == undefined) {
            const game_canvas = document.querySelector("canvas");
            game_canvas.width = game_width;
            game_canvas.height = game_height;

            const game_ctx = game_canvas.getContext("2d");
            game_ctx.imageSmoothingEnabled = false;

            this.game_canvas = game_canvas;
            this.game_ctx = game_ctx;
        }

        // if (main_canvas == null) {
        //     main_canvas = document.createElement("canvas");
        //     main_canvas.id = "canvas";
        //     main_canvas.width = game_width;
        //     main_canvas.height = game_height;

        //     main_canvas.getContext("2d").imageSmoothingEnabled = false;
            
        //     document.body.appendChild(main_canvas);

        //     this.game_canvas = main_canvas;
        //     this.game_ctx = main_canvas.getContext("2d");
        // }
        
        let canvas = document.createElement("canvas");
        // let canvas = document.querySelector(`#canvases canvas#${canvas_id}`);

        // if (canvas == null) {
        //     canvas = document.createElement("canvas");
        // canvas.id = canvas_id;
        // wrapper.appendChild(canvas);
        // }

        canvas.width = game_width;
        canvas.height = game_height;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        this.ctxs[canvas_id] = [ctx, will_clear];
        this.ctx_ids.push(canvas_id);
    },
    add(canvas_id="", script_ids=[""]) {
        for (let i = 0; i < script_ids.length; i++) {
            const script = manager.scripts[script_ids[i]];
            if (script instanceof Script == false) continue;
            this.scripts.push({
                canvas_id,
                script,
            });
        }
    },
    autoAdd(canvas_id="") {
        this.auto_add = canvas_id;
    },

    run() {
        this.game_ctx.clearRect(0, 0, game_width, game_height);
        
        for (let i = 0; i < this.ctx_ids.length; i++) {
            const [ctx, clear] = this.ctxs[this.ctx_ids[i]];
            
            if (clear) ctx.clearRect(0, 0, game_width, game_height);
        }

        for (let i = 0; i < this.scripts.length; i++) {
            const { canvas_id, script } = this.scripts[i];
            if (this.ctxs[canvas_id] == undefined) continue;
            if (script?.enabled === true) script?.draw(this.ctxs[canvas_id][0]);
        }

        for (let i = 0; i < this.ctx_ids.length; i++) {
            const [ctx] = this.ctxs[this.ctx_ids[i]];
            
            this.game_ctx.drawImage(ctx.canvas, 0, 0);
        }
    },

    noClear() {},
}

const manager = {
    scripts: {},
    ids: [],
    cancel: false,
    batch_emits: {},

    events: {
        on: {},
        batch: {}
    },

    gameLoop() {
        renderer.run();
        manager.update();
        manager.runBatchEmits();
        const frame_time = performance.now() - last_frame;
        fps.addFrameTime(frame_time);
        // console.log(33 - frame_time);
        last_frame = performance.now();
        if (manager.cancel) return;
        setTimeout(()=>{
            requestAnimationFrame(manager.gameLoop);
        }, 16 + (33 - frame_time));
    },

    add(id="", script=new Script()) {
        if (this.scripts[id] instanceof Script == false) {
            this.ids.push(id);
        }
        this.scripts[id] = script;

        if (renderer.auto_add != null) {
            renderer.add(renderer.auto_add, [id]);
        }

        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(script));
        for (let i = 0; i < methods.length; i++) {
            const method = methods[i];
            if (method.slice(0, 5) == "batch") {
                if (this.events.batch[method.slice(6)] == undefined) this.events.batch[method.slice(6)] = [script];
                else this.events.batch[method.slice(6)].push(script);
            }
            if (method.slice(0, 2) == "on") {
                if (this.events.on[method.slice(3)] == undefined) this.events.on[method.slice(3)] = [script];
                else this.events.on[method.slice(3)].push(script);
            }
        }
    },
    addMany(root_id="", ...scripts) {
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            const id = root_id + "-" + i;

            this.add(id, script);
        }
    },
    start() {
        for (let i = 0; i < this.ids.length; i++) {
            const script = this.scripts[this.ids[i]];
            const deps = script.deps.map(id => this.scripts[id]);
            if (script?.enabled === true) script?.start(...deps);
        }

        requestAnimationFrame(this.gameLoop);
        // requestAnimationFrame(function gameLoop() {
        //     renderer.run();
        //     manager.update();
        //     if (manager.cancel) return;
        //     requestAnimationFrame(gameLoop);
        // });
    },
    update() {
        for (let i = 0; i < this.ids.length; i++) {
            const script = this.scripts[this.ids[i]];
            const deps = script.deps.map(id => this.scripts[id]);
            if (script?.enabled === true) script?.update(...deps);
        }
    },

    gid(id="") {
        return this.scripts[id];
    },

    emit(name="", emitter=new Script(), payload={}) {
        if (!Array.isArray(this.events.on[name])) return [];

        let results = [];

        const scripts = this.events.on[name];
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            if (script?.enabled !== true) continue;
            const res = script?.["on:" + name]?.(emitter, payload);
            if (res != undefined) results.push(res);
        }

        // for (let i = 0; i < this.ids.length; i++) {
        //     const script = this.scripts[this.ids[i]];
        //     if (script?.enabled === true) {
        //         if (typeof script?.["on:" + name] == "function") {
        //             const res = script["on:" + name](emitter, payload);
        //             if (res != undefined) results.push();
        //         }
        //     }
        // }
        return results;
    },
    batchEmit(name="", emitter=new Script(), payload={}) {
        if (!Array.isArray(this.events.batch[name])) return;

        if (this.batch_emits[name] == undefined) this.batch_emits[name] = [];
        this.batch_emits[name].push({ emitter, payload });
    },
    runBatchEmits() {
        for (const name in this.batch_emits) {
            for (let i = 0; i < this.ids.length; i++) {
                const script = this.scripts[this.ids[i]];
                if (script?.enabled === false || typeof script?.["batch:" + name] != "function") continue;
                script["batch:" + name](this.batch_emits[name]);
            }

            this.batch_emits[name] = [];
        }
    }
}

const fps = {
    frames: new Uint16Array(20),
    frame_i: 0,
    addFrameTime(ms=16) {
        if (this.frame_i == this.frames.length) {
            game_fps = Math.round(1000 / (this.frames.reduce((p, c)=> p + c) / this.frames.length));
            this.frame_i = 0;
        } else {
            this.frames[this.frame_i] = ms;
            this.frame_i++;
        }
    }
}

//#region | Keyboard Stuff
const KeyBoard = {}

window.onkeydown = ({ key })=>{
    if (key.length == 1) KeyBoard[key.toLowerCase()] = true;
    else KeyBoard[key] = true;
}
window.onkeyup = ({ key })=>{
    if (key.length == 1) KeyBoard[key.toLowerCase()] = false;
    else KeyBoard[key] = false;
}
//#endregion

//#region | Window Scaling
window.onresize = ()=>{
    document.body.style.width = `${game_width}px`;
    document.body.style.height = `${game_height}px`;

    const w = document.body.parentElement.clientWidth;
    const h = document.body.parentElement.clientHeight;
    if (w*(game_height/game_width) >= h) game_scale = h/game_height;
    else game_scale = w/game_width;
    
    document.body.style.transform = `translate(-50%, -50%) scale(${(game_scale)}, ${(game_scale)})`;
}
window.onresize();
//#endregion 

//#region | Mouse Stuff
const Mouse = {
    x: 0,
    y: 0,
    down: false,
    hovering: false,
}

const mapVal = (val=1, min=0, max=2)=> (val - min) / (max - min);

const scaleY = (pos=0)=>{
    const win = document.body.parentElement.clientHeight;
    const body = document.body.clientHeight;
    const scr = pos / win;
    const top_p = Math.round((1 - body*game_scale / win)/2 * 100)/100;
    const bot_p = 1 - top_p;
    const perc = mapVal(scr, top_p, bot_p);

    return perc * game_height;
}

const scaleX = (pos=0)=>{
    const win = document.body.parentElement.clientWidth;
    const body = document.body.clientWidth;
    const scr = pos / win;
    const left_p = Math.round(((1 - (body*game_scale / win)))/2 * 100)/100;
    const right_p = 1 - left_p;
    const perc = mapVal(scr, left_p, right_p);

    return perc * game_width;
}

document.body.onmousemove = (ev)=>{
    ev.preventDefault();
    const [cx,cy] = [ev.clientX, ev.clientY];
    const x = Math.round(scaleX(cx));
    const y = Math.round(scaleY(cy));

    Mouse.x = x;
    Mouse.y = y;

    manager.emit("mouse-move", Mouse, { x, y });
}

document.onmouseup = ()=> Mouse.down = false;
document.onmousedown = ()=> Mouse.down = true;
document.onmouseenter = ()=> Mouse.hovering = true;
document.onmouseleave = ()=> Mouse.hovering = false;
//#endregion

