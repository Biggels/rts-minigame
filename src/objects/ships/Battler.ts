import * as Matter from 'matter-js';
import { DisplayObject, Graphics } from "pixi.js";
import { Sync } from '../../sync/Sync';
import { argMin, removeFrom } from "../../util/MathUtil";
import { PhysicsObject } from "../PhysicsObject";
import { Projectile } from "../projectile/Projectile";

export abstract class Battler extends PhysicsObject {

    graphics: Graphics;
    size: number;
    maxHealth = 10;
    health = this.maxHealth;
    team: number;
    dying = false;
    target: Battler;
    enemiesChasing = [] as Battler[];
    // turn speed
    // fuel regen?

    // some sort of basic 'threat' that counts nearby enemies, and if it's high, they move toward nearest ally? or away from nearest enemy? when would that supercede chasing?

    constructor(team: number, size = 15) {
        super(); // do we need this when our parents are abstract classes?
        this.graphics = new Graphics();
        this.graphics = this.updateGraphics();
        this.team = team;

        // should we assign positions randomly in the world instead of per battler, and should we try splitting the arena in 2 for each team?
        this.g.x = Sync.random.floatRange(-300, 300);
        this.g.y = Sync.random.floatRange(-200, 200);
        this.size = size;
    }

    abstract updateGraphics();

    shoot(bullet: Projectile, direction: number = this.direction) {
        this.world.addObject(bullet);

        let dx = Math.cos(direction);
        let dy = Math.sin(direction);

        bullet.x = this.x + this.size * dx;
        bullet.y = this.y + this.size * dy;
        bullet.vx = this.vx + dx * 10;
        bullet.vy = this.vy + dy * 10;
    }

    updateTarget() {
        if (this.target != null) {
            removeFrom(this.target.enemiesChasing, this);
        }
        this.setTarget(this.getNearestEnemy());
    }

    setTarget(target: Battler) {
        this.target = target;
        if (this.target) this.target.enemiesChasing.push(this);
    }

    getNearestEnemy(enemies?: Battler[]) {
        if (!enemies) enemies = this.world.objects
            .filter(o => o instanceof Battler && o.team != this.team) as Battler[];
        return argMin(enemies, e => this.distanceTo(e)) as Battler;
    }

    getDisplayObject(): DisplayObject {
        return this.graphics;
    }

    startToDie() {
        this.dying = true;
        this.run(() => {
            this.g.alpha *= 0.9;
            return this.g.alpha < 0.01;
        }).then(() => this.die());
        return;
    }

    update() {
        super.update();
        this.updateGraphics();

        if (this.dying) {
            return; // we forgot to finish this if statemnt, which was causing a lot of the weird behavior
        }

        if (!this.target || !this.target.isInWorld) {
            this.updateTarget();
        }

        this.enemiesChasing =
            this.enemiesChasing.filter(e => e && e.isInWorld);

        if (this.health <= 0) {
            this.startToDie();
            return;
        }
    }

}

