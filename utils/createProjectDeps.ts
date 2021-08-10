import fs from "fs-extra";
import * as esbuild from "esbuild";
import path from 'path'
import type { SigmaGraph, SigmaNode, SigmaEdge } from "../components/DepsGraph";

interface Source {
  size: number;
  deps: Set<string>;
}

interface Node{
  id: string
  size?: number
  label: string
  module: boolean
}

export async function createProjectDeps(...entryPoints: string[]) {
  const { plugin, sources } = createDependencyPlugin();

  await esbuild.build({
    bundle: true,
    format: "esm",
    platform: "node",
    plugins: [plugin],
    logLevel: "silent",
    write: false,
    entryPoints
  });

  return convertToGraph(sources, path.dirname(entryPoints[0]));
}

function convertToGraph(sources: Map<string, Source>, entryPoint: string): SigmaGraph {
  let index = 0
  const nodes = new Map<string, Node>()
  const edges: SigmaEdge[] = []

  // @ts-ignore-next-line
  for (const [filePath, fileData] of sources.entries()) {
    const sanitizedFilePath = sanitize(entryPoint, filePath)
    if (!sanitizedFilePath.module && (!nodes.has(sanitizedFilePath.id) || nodes.get(sanitizedFilePath.id)?.size===undefined)){
      nodes.set(sanitizedFilePath.id, {
        ...sanitizedFilePath,
        size: fileData.size, // TODO: if module, weigh the dir
      })
    }

    if (!sanitizedFilePath.module){
      for (const depFilePath of fileData.deps.values()) {
        const sanitizeDepdFilePath = sanitize(entryPoint, depFilePath, path.dirname(filePath))
        if (!nodes.has(sanitizeDepdFilePath.id)){
          nodes.set(sanitizeDepdFilePath.id, sanitizeDepdFilePath)
        }

        edges.push({
          id: `${index++}`,
          from:sanitizedFilePath.id,
          to:sanitizeDepdFilePath.id
        })
      }
    }
  }
  return {
    nodes: Array.from(nodes.values()),
    edges,
  }
}

function createDependencyPlugin(): {
  sources: Map<string, Source>;
  plugin: esbuild.Plugin;
} {
  const sources = new Map<string, Source>();
  let entryIndex = 1;

  return {
    sources,
    plugin: {
      name: "dependency-tracker",
      setup(b: any) {
        b.onResolve(
          { filter: /.?/ },
          async (args: { importer: string; path: string }) => {
            const key = args.importer || `__entry${entryIndex++}__`;
            const source = sources.get(key) ?? {
              size: args.importer
                ? (await fs.stat(args.importer))?.size ?? 0
                : 0,
              deps: new Set<string>()
            };
            source.deps.add(args.path);
            sources.set(key, source);
            return null;
          }
        );
      }
    }
  };
}

function sanitize(entryPoint: string, filePath: string, source?: string): {filePath: string, id: string, label: string, module: boolean}{
  const absFilePath = source && filePath.startsWith('.')? path.join(source, `${filePath}.ts`) : filePath

  const dirs = filePath.split('/')
  const nodeModulesIndex = dirs.lastIndexOf('node_modules')

  if (nodeModulesIndex!==-1){
    return {
      filePath,
      id: dirs[nodeModulesIndex+1],
      label:dirs[nodeModulesIndex+1],
      module: true,
    }
  }

  return {
    filePath,
    id: absFilePath,
    label: absFilePath.includes('/') ? path.relative(entryPoint, absFilePath) || absFilePath: absFilePath,
    module:false
  }
}

// git clone
// generate the dep graph
// draw it
