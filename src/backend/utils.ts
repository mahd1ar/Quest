import crypto from "crypto";
import fs, { existsSync } from "fs";

export async function calcHash(filepath: string): Promise<string> {
  const md5sum = crypto.createHash("md5");

  return new Promise(resolve => {
    const s = fs.createReadStream(filepath);

    s.on("data", d => {
      md5sum.update(d);
    });

    s.on("end", () => {
      const d = md5sum.digest("hex");
      s.close();
      return resolve(d);
    });
  });
}

export function makeDirectory(dir_path: string) {
  if (!existsSync(dir_path)) fs.mkdirSync(dir_path, { recursive: true });
}
