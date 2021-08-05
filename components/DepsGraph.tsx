// @ts-ignore
import { Sigma, RandomizeNodePositions, RelativeSize } from "react-sigma";

export interface SigmaGraph {
  nodes: SigmaNode[];
  edges: SigmaEdge[];
}

interface SigmaNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}

interface SigmaEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  color?: string;
}

export default function DepsGraph({ data }: { data: SigmaGraph }) {
  return (
    <Sigma
      graph={data}
      style={{ width: "90vw", height: "90vh" }}
      settings={{ drawEdges: true, clone: false }}
    >
      <RelativeSize initialSize={15} />
      <RandomizeNodePositions />
    </Sigma>
  );
}
