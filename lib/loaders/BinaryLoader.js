import { ResourceLoader } from "@gaiaengine/2d";
class BinaryLoader extends ResourceLoader {
    async loadResource(src) {
        const loadPromise = (async () => {
            const response = await fetch(src);
            if (!response.ok)
                throw new Error(`Failed to load binary data: ${src}`);
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            this.pendingLoads.delete(src);
            if (this.isResourceInUse(src)) {
                if (this.resources.has(src)) {
                    throw new Error(`Binary data already exists: ${src}`);
                }
                else {
                    this.resources.set(src, data);
                    return data;
                }
            }
            else {
                return undefined;
            }
        })();
        this.pendingLoads.set(src, loadPromise);
        return await loadPromise;
    }
    cleanup(_) {
    }
}
export default new BinaryLoader();
//# sourceMappingURL=BinaryLoader.js.map