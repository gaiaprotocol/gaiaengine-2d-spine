import { ResourceLoader } from "@common-module/ts";
class TextLoader extends ResourceLoader {
    async loadResource(src) {
        const loadPromise = (async () => {
            const response = await fetch(src);
            if (!response.ok)
                throw new Error(`Failed to load text: ${src}`);
            const text = await response.text();
            this.pendingLoads.delete(src);
            if (this.isResourceInUse(src)) {
                if (this.resources.has(src)) {
                    throw new Error(`Text already exists: ${src}`);
                }
                else {
                    this.resources.set(src, text);
                    return text;
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
export default new TextLoader();
//# sourceMappingURL=TextLoader.js.map