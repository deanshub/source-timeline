import { Render, Common, Vector } from "matter-js";

export function setConstraintRenderer(): void {
  /**
   * Description
   * @private
   * @method constraints
   * @param {constraint[]} constraints
   * @param {RenderingContext} context
   */
  // @ts-ignore
  Render.constraints = function(constraints: any, context: any) {
    var c = context;

    for (var i = 0; i < constraints.length; i++) {
      var constraint = constraints[i];

      if (
        !constraint.render.visible ||
        !constraint.pointA ||
        !constraint.pointB
      )
        continue;

      var bodyA = constraint.bodyA,
        bodyB = constraint.bodyB,
        start,
        end;

      if (bodyA) {
        start = Vector.add(bodyA.position, constraint.pointA);
      } else {
        start = constraint.pointA;
      }

      if (constraint.render.type === "pin") {
        c.beginPath();
        c.arc(start.x, start.y, 3, 0, 2 * Math.PI);
        c.closePath();
      } else {
        if (bodyB) {
          end = Vector.add(bodyB.position, constraint.pointB);
        } else {
          end = constraint.pointB;
        }

        c.beginPath();
        c.moveTo(start.x, start.y);

        // if (constraint.render.type === "spring") {
        //   var delta = Vector.sub(end, start),
        //     normal = Vector.perp(Vector.normalise(delta)),
        //     coils = Math.ceil(Common.clamp(constraint.length / 5, 12, 20)),
        //     offset;
        //
        //   for (var j = 1; j < coils; j += 1) {
        //     offset = j % 2 === 0 ? 1 : -1;
        //
        //     c.lineTo(
        //       start.x + delta.x * (j / coils) + normal.x * offset * 4,
        //       start.y + delta.y * (j / coils) + normal.y * offset * 4
        //     );
        //   }
        // }

        c.lineTo(end.x, end.y);
      }

      if (constraint.render.lineWidth) {
        c.lineWidth = constraint.render.lineWidth;
        c.strokeStyle = constraint.render.strokeStyle;
        c.stroke();
      }

      if (constraint.render.anchors) {
        c.fillStyle = constraint.render.strokeStyle;
        c.beginPath();
        c.arc(start.x, start.y, 3, 0, 2 * Math.PI);
        c.arc(end.x, end.y, 3, 0, 2 * Math.PI);
        c.closePath();
        c.fill();
      }
    }
  };
}
