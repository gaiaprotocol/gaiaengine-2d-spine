import { GameObject } from "@gaiaengine/2d";
interface SpineOptions {
    atlas: string;
    skel?: string;
    json?: string;
    png: Record<string, string> | string;
    skins?: string[];
    animation?: string;
    loop?: boolean;
    onLoad?: () => void;
    onAnimationEnd?: (animation: string) => void;
}
export default class Spine extends GameObject {
    private options;
    private pixiSpine;
    private _animation;
    constructor(x: number, y: number, options: SpineOptions);
    private load;
    set animation(animation: string | undefined);
    get animation(): string | undefined;
    private changeSkins;
    remove(): void;
}
export {};
//# sourceMappingURL=Spine.d.ts.map