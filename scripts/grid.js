export default class Grid extends Script {
    constructor() {
        super();
        this.data = [0, 1, 2];
    }
    start() {
        console.log("Setting up grid!");
    }
    update() {
        console.log("Updating grid!");
    }

    // Listener
    "on-jump"(player, extra={}) {
        console.log("Player jumped!");
        console.log(extra);
        return "Hello, console!";
    }
}