import { Application, Container, Sprite } from "pixi.js";
import MyTexture from "./MyTexture";

export default interface MySprite extends Sprite {
    key: string;
    row: number;
    col: number;
    displayRow: number;
    myTexture: MyTexture;
}
