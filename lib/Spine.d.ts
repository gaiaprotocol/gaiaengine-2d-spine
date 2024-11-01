import { GameObject } from "@gaiaengine/2d";
interface SpineOptions {
    atlas: string;
    skel: string;
    png: string;
    animation?: string;
    loop?: boolean;
}
export default class Spine extends GameObject {
    private options;
    private onAnimEnd?;
    private pixiSpine;
    private _animation;
    constructor(x: number, y: number, options: SpineOptions, onAnimEnd?: ((animation: string) => void) | undefined);
    private load;
    set animation(animation: string | undefined);
    get animation(): string | undefined;
    remove(): void;
}
export {};
//# sourceMappingURL=Spine.d.ts.map