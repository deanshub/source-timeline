import { useEffect, useRef } from "react";
import {
  Engine,
  Render,
  Bodies,
  World,
  Constraint,
  Mouse,
  MouseConstraint,
  Body,
  Vector,
  use,
} from "matter-js";
import { getColor,gray } from "./colors";
import type Graph from 'graphology'
import type { SigmaNode, SigmaEdge} from '../DepsGraph';
// @ts-ignore-next-line
import * as MatterAttractors from 'matter-attractors'
import {setConstraintRenderer} from './renderers/constraintRenderer'
import {setBodiesRenderer} from './renderers/bodiesRenderer'

use(MatterAttractors)

export default function MatterGraph({ data }: { data: Graph }) {
  const scene = useRef(null);
  // const isPressed = useRef(false)
  const engine = useRef(Engine.create());

  useEffect(() => {
    const cw = document.body.clientWidth;
    const ch = document.body.clientHeight;

    if (!scene) {
      throw new Error("no ref for scene");
    }

    setConstraintRenderer()
    setBodiesRenderer()
    const render = Render.create({
      element: scene.current || undefined,
      engine: engine.current,
      options: {
        width: cw,
        height: ch,
        wireframes: false,
        background: "transparent",
        hasBounds: true,
      }
    });

    engine.current.gravity.y = 0;

    const wallSize = 500
    World.add(engine.current.world, [
      // Bodies.rectangle(cw / 2, -10, cw, 20, { isStatic: true }),
      Bodies.rectangle(cw / 2, -0.5 * wallSize, cw, wallSize, { isStatic: true }),
      // Bodies.rectangle(-10, ch / 2, 20, ch, { isStatic: true }),
      Bodies.rectangle(-0.5 * wallSize, ch / 2, wallSize, ch, { isStatic: true }),
      // Bodies.rectangle(cw / 2, ch + 10, cw, 20, { isStatic: true }),
      Bodies.rectangle(cw / 2, ch + (0.5 * wallSize), cw, wallSize, { isStatic: true }),
      // Bodies.rectangle(cw + 10, ch / 2, 20, ch, { isStatic: true })
      Bodies.rectangle(cw + (0.5 * wallSize), ch / 2, wallSize, ch, { isStatic: true })
    ]);

    const nodesBodies = new Map<string, Matter.Body>()
    data.forEachNode((id, node)=>{
      const nodeBody = addNode(engine, node as SigmaNode)
      nodesBodies.set(id, nodeBody)
    })
    data.forEachEdge((key, edge)=>addEdge(engine, edge as SigmaEdge, nodesBodies))

    const mouse = Mouse.create(render.canvas);

    const mouseConstraint = MouseConstraint.create(engine.current, {
      mouse: mouse,
      // @ts-ignore-next-line
      constraint: {
        render: {
          visible: false,
        }
      }
    });

    World.add(engine.current.world, mouseConstraint);

    Engine.run(engine.current);
    Render.run(render);

    return () => {
      Render.stop(render);
      World.clear(engine.current.world, false);
      Engine.clear(engine.current);
      render.canvas.remove();
      // @ts-ignore-next-line
      render.canvas = null;
      // @ts-ignore-next-line
      render.context = null;
      render.textures = {};
    };
  }, []);

  // const handleDown = () => {
  //   isPressed.current = true
  // }
  //
  // const handleUp = () => {
  //   isPressed.current = false
  // }
  //
  // const handleAddCircle = (e: any) => {
  //   if (isPressed.current) {
  //     const ball = Bodies.circle(
  //       e.clientX,
  //       e.clientY,
  //       10 + Math.random() * 30,
  //       {
  //         mass: 10,
  //         restitution: 0.9,
  //         friction: 0.005,
  //         render: {
  //           fillStyle: '#0000ff'
  //         }
  //       })
  //     World.add(engine.current.world, [ball])
  //   }
  // }

  // onMouseDown={handleDown}
  // onMouseUp={handleUp}
  // onMouseMove={handleAddCircle}

  return (
    <div>
      <div ref={scene} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}


function addNode(engine: any, node: SigmaNode){
  const ball = Bodies.circle((node.x!), (node.y!), 25, {
    label: node.label,
    density: 0.04,
    frictionAir: 0.005,
    render: {
      fillStyle: node.module ? gray: getColor(),
      // @ts-ignore-next-line
      text:{
  			content: node.label,
  			color: "#2f2f2f",
  			size: 14,
  			// family: "Papyrus",
  		},
    },
    plugin: {
      attractors: [
        // MatterAttractors.Attractors.gravity
        // use Newton's law of gravitation
        (bodyA: Matter.Body, bodyB: Matter.Body) =>{
           const bToA = Vector.sub(bodyB.position, bodyA.position)
           const distanceSq = Vector.magnitudeSquared(bToA) || 0.0001
           const normal = Vector.normalise(bToA)
           const magnitude = MatterAttractors.Attractors.gravityConstant*10 * (bodyA.mass * bodyB.mass / distanceSq)
           const force = Vector.mult(normal, magnitude)

           // to apply forces to both bodies
           Body.applyForce(bodyA, bodyA.position, Vector.neg(force));
           Body.applyForce(bodyB, bodyB.position, force);
        }
      ]
    }
  });

  World.add(engine.current.world, ball);
  return ball
}

function addEdge(engine: any, edge: SigmaEdge, nodes: Map<string, Matter.Body>){
  const bodyA = nodes.get(edge.from)
  const bodyB = nodes.get(edge.to)
  const constraint = Constraint.create({
    label: edge.label,
    stiffness: 0.001,
    length: 100,
    type: "line",
    render: {
      strokeStyle: "#2F2F2F"
    },
    bodyA,
    bodyB
  })
  World.add(
    engine.current.world,
    constraint
  );
  // return constraint
}
