import { ResourceLoader } from "@common-module/ts";
declare class BinaryLoader extends ResourceLoader<Uint8Array> {
    protected loadResource(src: string): Promise<Uint8Array | undefined>;
    protected cleanup(_: Uint8Array): void;
}
declare const _default: BinaryLoader;
export default _default;
//# sourceMappingURL=BinaryLoader.d.ts.map