export default class Pointer extends Script {
    constructor(offx=0, offy=0) {
        super();
        this.x = 0;
        this.y = 0;

        this.offx = offx;
        this.offy = offy;

        this.ticks = 20;
        this.drawing = true;
    }

    update() {
        // if (this.ticks-- <= 0) {
        //     this.ticks = 20;
        //     this.drawing = this.drawing;
        // }
        manager.batchEmit("pointer-move", this, { x: this.x + this.offx, y: this.y + this.offy });
    }
    draw(ctx) {
        // if (!this.drawing) return;
        ctx.fillStyle = "red";
        ctx.fillRect(this.x+this.offx - 10, this.y+this.offy - 10, 20, 20);
    }

    "on:mouse-move"(_, { x, y }) {
        this.x = x;
        this.y = y;
    }
}
