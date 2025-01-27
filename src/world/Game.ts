import { Application } from "pixi.js";
import { Sync } from "../sync/Sync";
import { UI } from "../ui/UI";
import { World } from "./World";

export class Game {
    app: Application;
    
    world: World;
    ui: UI;

    private framesBehind = 0;

    constructor(app: Application) {
        this.app = app;

        Sync.init(12345);

        // Add a ticker callback to move the sprite back and forth
        this.world = new World(app.view.width, app.view.height);
        this.app.stage.addChild(this.world.mainContainer);
        this.world.game = this; // added game to both world and ui so world and ui child objects can access each other by travelling up to the game and then back down...
                                // i'm sure there's a better way

        this.ui = new UI();
        this.app.stage.addChild(this.ui.mainContainer);
        this.ui.game = this;
    }


    update(delta: number) {
        this.framesBehind += delta;
        while (this.framesBehind > 1) {
            this.world.update();
            this.ui.update();

            this.framesBehind--;
        }
    }
}