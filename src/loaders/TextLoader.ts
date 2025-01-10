import { ResourceLoader } from "@gaiaengine/2d";

class TextLoader extends ResourceLoader<string> {
  protected async loadResource(src: string): Promise<string | undefined> {
    const loadPromise = (async () => {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`Failed to load text: ${src}`);
      const text = await response.text();

      this.pendingLoads.delete(src);

      if (this.isResourceInUse(src)) {
        if (this.resources.has(src)) {
          throw new Error(`Text already exists: ${src}`);
        } else {
          this.resources.set(src, text);
          return text;
        }
      } else {
        return undefined;
      }
    })();

    this.pendingLoads.set(src, loadPromise);
    return await loadPromise;
  }

  protected cleanup(_: string): void {
    // No cleanup necessary for text
  }
}

export default new TextLoader();
