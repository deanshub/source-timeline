import Graph from "react-graph-vis";

export interface SigmaGraph {
  nodes: SigmaNode[];
  edges: SigmaEdge[];
}

export interface SigmaNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}

export interface SigmaEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  color?: string;
}

const options = {
  layout: {
    hierarchical: true
  },
  edges: {
    color: "#000000"
  },
};

export default function DepsGraph({ data }: { data: SigmaGraph }) {
  if (!window) return null;
  return <Graph graph={data} options={options} />;
}
