import {Application, Assets, Container, Graphics, Texture} from "pixi.js";
import Reel from "./Reel";
import MySprite from "./MySprite";
import { SYMBOL_WILD, SYMBOL_NAMES } from "./Constants";
import MyTexture from "./MyTexture";

const REEL_OFFSET_LEFT = 70;
const NUMBER_OF_REELS = 3;
const SHIFTING_DELAY = 500;

interface WinningLine {
    symbols: Array<MySprite>;
    lineNumber: number;
}

let atlas: any = {}

export default class ReelsContainer {
    public readonly app: Application;
    public readonly reels: Array<Reel> = [];
    public readonly container: Container;
    public textures: Array<MyTexture> = [];
    private winLineLayer: Container;
    private winningLinesGraphics: Graphics[] = [];

    constructor(app: Application) {
        this.app = app;
        this.container = new Container();
        this.container.x = REEL_OFFSET_LEFT;

        // // Create new layer for lines
        this.winLineLayer = new Container();
        this.app.stage.addChild(this.container);
        this.app.stage.addChild(this.winLineLayer);

    }

    public async init() {
        await this.loadTextures();
        for (let i = 0; i < NUMBER_OF_REELS; i++) {
            const reel = new Reel(this.app, this.textures, i);
            await reel.init();
            this.reels.push(reel);
            this.container.addChild(reel.container);
            console.log(`reel: ${i} reel.sprites.length: ${reel.sprites.length}`);
        }
    }

    private async loadTextures(): Promise<void> {
        console.log(`loading textures`);
        SYMBOL_NAMES.forEach((name) => {
            try {
                const texture = Assets.get(name);
                let myTexture = texture as MyTexture;
                myTexture.key = name;
                console.log(`myTexture.key: ${myTexture.key} name: ${name}`);
                this.textures.push(myTexture);
            } catch (error) {
                console.log(`caught error attempting to create a texture: ${name} from the atlas.`);
                console.log(error);
            } finally {
                // console.log(`loaded ${this.textures.length} textures from atlas.`);
                // this.textures.forEach(texture => {
                //     console.log(`loaded texture ${name} to atlas.`);
                // })
            }
        })
    }

    async spin() {
        const shiftingDelay = SHIFTING_DELAY;
        const start = Date.now();
        const reelsToSpin = [...this.reels];

        for await (let _ of this.infiniteSpinning(reelsToSpin)) {
            const shiftingWaitTime = (this.reels.length - reelsToSpin.length + 1) * shiftingDelay;

            if (Date.now() >= start + shiftingWaitTime) {
                reelsToSpin.shift();
            }

            if (!reelsToSpin.length) break;
        }

        let hasWin = false;
        // Check for winning lines across a row of visible symbols (indexes 1,2,3)
        for (let row = 1; row < 4; row++) {
            let syms ="";
            let lineSymbols: MySprite[] = [];
            for (let col = 0; col < this.reels.length; col++) {
                const reel = this.reels[col];
                const sprite = reel.sprites[row] as MySprite
                //console.log(`row: ${row} col: ${col} key: ${sprite.key} label: ${sprite.texture.label} x: ${sprite.x} y: ${sprite.y}`);
                if (syms.length > 0) {
                    syms = syms + ", ";
                }
                syms = syms + sprite.texture.label;
                lineSymbols.push(sprite);
            }
            //console.log(`calling checkForWin() for row: ${row}`);
            hasWin = this.checkForWin(lineSymbols);
            console.log(`hasWin: ${hasWin}`)
        }
        return hasWin;
    }

    private async* infiniteSpinning(reelsToSpin: Array<Reel>) {
        while (true) {
            const spinningPromises = reelsToSpin.map(reel => reel.spinOneTime());
            await Promise.all(spinningPromises);
            this.blessRNG();
            yield;
        }
    }

    private drawWinningLine(symbols: Array<MySprite>) {
        // Create new graphics object for this line
        const lineGraphics = new Graphics();
        this.winLineLayer.addChild(lineGraphics);
        this.winningLinesGraphics.push(lineGraphics);

        const globalStartPos = symbols[0].getGlobalPosition();
        const startX = globalStartPos.x + symbols[0].width / 2;
        const startY = globalStartPos.y + symbols[0].height / 2;

        lineGraphics.setStrokeStyle({
            width: 8,
            color: 0x00FF00,
            alpha: 1,
            alignment: 0.5 //,
            //native: true
        });

        lineGraphics.moveTo(startX, startY);

        symbols.slice(1).forEach(symbol => {
            const globalPos = symbol.getGlobalPosition();
            const endX = globalPos.x + symbol.width / 2;
            const endY = globalPos.y + symbol.height / 2;
            lineGraphics.lineTo(endX, endY);
        });

        lineGraphics.stroke();
    }

    public clearWinningLines() {
        // Clear all existing lines
        this.winningLinesGraphics.forEach(line => {
            line.clear();
            this.winLineLayer.removeChild(line);
        });
        this.winningLinesGraphics = [];
    }

    private checkForWin(symbols: Array<MySprite>): boolean {
        const combination: Set<string> = new Set();
        //symbols.forEach(symbol => combination.add(symbol.key)); // SYM1 is wild
        symbols.forEach(symbol => combination.add(symbol.texture.label!)); // SYM1 is wild

        const THREE_OF_A_KIND: boolean = combination.size === 1 && !combination.has(SYMBOL_WILD);
        const THREE_WILDS: boolean = combination.size === 1 && combination.has(SYMBOL_WILD);
        const ONE_OR_TWO_WILDS: boolean = combination.size === 2 && combination.has(SYMBOL_WILD);

        const keysString = Array.from(combination.keys()).join(", ");

        const isWinningLine = (THREE_OF_A_KIND || THREE_WILDS || ONE_OR_TWO_WILDS)

        if (isWinningLine) {
            console.log(`${'*'.repeat(50)}`);
            console.log(`keys: ${keysString} \ncombination.size: ${combination.size} \ncombination.has(SYMBOL_WILD): ${combination.has(SYMBOL_WILD)} `);
            console.log(`THREE_OF_A_KIND: ${THREE_OF_A_KIND}`);
            console.log(`THREE_WILDS: ${THREE_WILDS}`);
            console.log(`ONE_OR_TWO_WILDS: ${ONE_OR_TWO_WILDS}`);
            this.drawWinningLine(symbols);
        }

        console.log(`isWinningLine: ${isWinningLine}`);
        return isWinningLine;
    }

    private blessRNG() {
        this.reels.forEach(reel => {
            const index = Math.floor(Math.random() * this.textures.length);
            const mySprite = reel.sprites[0];
            const myTexture = this.textures[index] as MyTexture;
            mySprite.texture = myTexture;
            mySprite.key = myTexture.key;
            mySprite.myTexture = myTexture;
        });
    }
}