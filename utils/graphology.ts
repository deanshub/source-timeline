import type { SigmaGraph } from "../components/DepsGraph";
import Graph from 'graphology'
import {circular} from 'graphology-layout';
// import forceAtlas2 from 'graphology-layout-forceatlas2';

export function toGraph(data: SigmaGraph): Graph{
  const graph = new Graph();

  data.nodes.forEach(node=>{
    graph.addNode(node.id, node)
  })
  data.edges.forEach(edge=>{
    graph.addEdge(edge.from, edge.to, edge)
  })

  // random.assign(graph, {center:600, scale:700})
  circular.assign(graph, {center:550, scale:100})

  // forceAtlas2.assign(graph, {
  //   iterations:50,o
  //   settings:{
  //     scalingRatio: 30,
  //     // linLogMode: true,
  //     outboundAttractionDistribution:true,
  //     // adjustSizes: true,
  //     // edgeWeightInfluence: 0.001,
  //     // strongGravityMode: true,
  //     // gravity: 10,
  //     // slowDown: 10,
  //     barnesHutOptimize: true,
  //     barnesHutTheta: 5
  //   },
  // });

  return graph
}
