export default class Player extends Script {
    constructor(x=0, y=0) {
        super();
        this.x = x;
        this.y = y;

        this.bright = false;
    }
    
    update() {
        const [px, py] = [this.x, this.y];

        const speed = 10;
        if (KeyBoard.a) this.x -= speed;
        if (KeyBoard.d) this.x += speed;
        if (KeyBoard.w) this.y -= speed;
        if (KeyBoard.s) this.y += speed;

        const moved = px != this.x || py != this.y;
        renderer.noClear(this);
    }
    draw(ctx) {
        ctx.fillStyle = this.bright ? "lime" : "green";
        ctx.fillRect(this.x, this.y, 50, 50);
    }

    "batch:pointer-move"(data=[new Script(), { x: 0, y: 0 }]) {
        for (let i = 0; i < data.length; i++) {
            const { emitter, payload } = data[i];
            const { x, y } = payload;
            if (x >= this.x-10 && x <= this.x+60 &&
                y >= this.y-10 && y <= this.y+60
            ) {
                this.bright = true;
                return;
            }
        }
        this.bright = false;
    }
    "on:test"(emitter, data) {
        console.log(data);
    }
}
