import { ResourceLoader } from "@gaiaengine/2d";
import { Texture } from "pixi.js";
interface SpineResourceOptions {
    atlasPath: string;
    skeletonPath: string;
    isBinary: boolean;
    texturePaths: Record<string, string> | string;
}
interface SpineData {
    atlasData: string;
    skeletonData: string | Uint8Array;
    textures: Texture | Record<string, Texture>;
}
declare class SpineLoader extends ResourceLoader<SpineData> {
    load(options: SpineResourceOptions): Promise<SpineData | undefined>;
    protected loadFromPath(key: string, options: SpineResourceOptions): Promise<SpineData | undefined>;
    protected cleanup(data: SpineData, key: string): void;
    getKey(options: SpineResourceOptions): string;
}
declare const _default: SpineLoader;
export default _default;
//# sourceMappingURL=SpineLoader.d.ts.map