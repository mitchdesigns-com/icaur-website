import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function readPageHtml(id: string): Promise<string> {
  return readFile(join(process.cwd(), "content/pages", `${id}.html`), "utf8");
}
