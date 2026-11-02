import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const exercisesDirectory = fileURLToPath(
  new URL("../../src/exercises/", import.meta.url),
);
const outputPath = new URL("../src/generated/exercisePrompts.json", import.meta.url);
const exercisePattern = /^(hartshorne|vakil)\/([^/]+)\/([^/]+)\/([^/]+)\.tex$/;

async function findExerciseFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const entryPath = `${directory}${sep}${entry.name}`;
    if (entry.isDirectory()) return findExerciseFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".tex") ? [entryPath] : [];
  }));
  return nestedFiles.flat();
}

const prompts = {};
const exerciseFiles = await findExerciseFiles(exercisesDirectory);

for (const filePath of exerciseFiles) {
  const exerciseId = relative(exercisesDirectory, filePath).split(sep).join("/");
  const match = exerciseId.match(exercisePattern);
  if (!match) continue;

  const [, bookId, chapter, section, filename] = match;
  prompts[exerciseId] = {
    bookId,
    chapter,
    section,
    label: bookId === "hartshorne"
      ? filename.replaceAll("_", ".")
      : filename,
    content: await readFile(filePath, "utf8"),
  };
}

if (Object.keys(prompts).length === 0) {
  throw new Error("No supported exercise prompts were found.");
}

const generatedOutputPath = fileURLToPath(outputPath);
await mkdir(dirname(generatedOutputPath), { recursive: true });
await writeFile(generatedOutputPath, `${JSON.stringify(prompts, null, 2)}\n`);
console.log(`Generated ${Object.keys(prompts).length} exercise prompts.`);
