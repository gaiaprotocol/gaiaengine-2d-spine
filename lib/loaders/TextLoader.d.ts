import { ResourceLoader } from "@gaiaengine/2d";
declare class TextLoader extends ResourceLoader<string> {
    protected loadResource(src: string): Promise<string | undefined>;
    protected cleanup(_: string): void;
}
declare const _default: TextLoader;
export default _default;
//# sourceMappingURL=TextLoader.d.ts.map