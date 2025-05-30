import { Assets, Container, Sprite, Texture } from "pixi.js";

export default class Background {
    public readonly sprite: Container;
    private readonly texture: Texture;

    constructor() {
        try {
            this.texture = Assets.get("atlas").textures["BG.png"];
        } catch (error) {
            console.log(error);
        } finally {
        }
        this.sprite = new Sprite(this.texture);
    }
}
