import { Application, Assets, Container, Sprite, Texture, Ticker } from "pixi.js";
import MySprite from "./MySprite";
import ReelsContainer from "./ReelsContainer";
import {SYMBOL_NAMES} from "./Constants";
import MyTexture from "./MyTexture";

const REEL_WIDTH = 230;
const REEL_OFFSET_BETWEEN = 10;
const NUMBER_OF_ROWS = 3;
const SPIN_SPEED = 50;


export default class Reel {
    public readonly container: Container;
    //public textures: Array<MyTexture> = [];
    public sprites: Array<MySprite> = [];
    private readonly appHeight: number;
    private readonly ticker: Ticker;
    private readonly position: number;
    private textures: Array<MyTexture> = [];


    //constructor(app: Application, reelsContainer: ReelsContainer, position: number) {
    constructor(app: Application, textures: MyTexture[],  position: number) {
        this.appHeight = app.screen.height;
        this.textures = textures;
        this.ticker = app.ticker;
        this.container = new Container();
        this.position = position;

        // try {
        //     const atlas = Assets.get("atlas");
        //     this.textures = [
        //         atlas.textures["WILD.png"],
        //         atlas.textures["STRAWBERRY.png"],
        //         atlas.textures["SYM3.png"],
        //         atlas.textures["SYM5.png"],
        //         atlas.textures["GRAPE.png"],
        //     ];
        // } catch (error) {
        //     console.log("caught error in Reel.constructor");
        //     console.log(error);
        // } finally {
        // }
    }

    public async init() {
        this.generate(this.position);
    }

    private generate(position: number) {
        this.container.x = position * REEL_WIDTH;

        for (let i = 0; i < NUMBER_OF_ROWS + 1; i++) {
            console.log(`i: ${i}`);
            //const symbol = new Sprite(this.textures[Math.floor(Math.random() * this.textures.length)]);
            const index = Math.floor(Math.random() * this.textures.length);
            const myTexture = this.textures[index] as MyTexture;
            console.log(`Reel.generate sprite for col: ${position} row: ${i} myTexture.key: ${myTexture.key}`);
            const symbol = new Sprite(myTexture) as MySprite;
            symbol.key = myTexture.key;
            symbol.myTexture = myTexture;
            console.log(`symbol.key: ${symbol.key} symbol.myTexture.key: ${symbol.myTexture.key} myTexture.key: ${myTexture.key}`);
            symbol.scale.set(0.8);
            const widthDiff = REEL_WIDTH - symbol.width;
            const yOffset = (this.appHeight - symbol.height * 3) / 3;
            const cellHeight = symbol.height + yOffset;
            const paddingTop = yOffset / 2;
            symbol.y = (i - 1) * cellHeight + paddingTop;
            symbol.row = i;
            symbol.col = position;
            this.sprites.push(symbol);
            this.container.addChild(symbol);
            //console.log(`sprite: ${symbol.key} label: ${symbol.texture.label} x: ${symbol.x} y: ${symbol.y}`);
            console.log(`new Sprite with key: ${symbol.key} row: ${symbol.row} col: ${symbol.col}`);
        }
        console.log(`${this.sprites.length} sprites for row: ${this.position}`);
    }

    spinOneTime() {
        let speed = SPIN_SPEED;
        let doneRunning = false;
        let yOffset = (this.appHeight - this.sprites[0].height * 3) / 3 / 2;

        return new Promise<void>(resolve => {
            const tick = () => {
                for (let i = this.sprites.length - 1; i >= 0; i--) {
                    const symbol = this.sprites[i];

                    if (symbol.y + speed > this.appHeight + yOffset) {
                        doneRunning = true;
                        speed = this.appHeight - symbol.y + yOffset;
                        symbol.y = -(symbol.height + yOffset);
                    } else {
                        symbol.y += speed;
                    }

                    if (i === 0 && doneRunning) {
                        let t = this.sprites.pop();
                        if (t) this.sprites.unshift(t);
                        this.ticker.remove(tick);
                        resolve();
                    }
                }
            }

            this.ticker.add(tick);
        });
    }
}
