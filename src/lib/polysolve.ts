export type Point = { x: number; y: number };

type Description = {
  slope: number;
  intercept: number;
  start: Point;
  end: Point;
};

type PiecewiseLinearModel = {
  fit: (x: number) => number;
  describe: () => Description[];
};

export function createPiecewiseLinearModel(points: Point[]): PiecewiseLinearModel {
  const sorted = [...points].sort((a, b) => a.x - b.x);

  const fit = (x: number): number => {
    if (x <= sorted[0].x) return sorted[0].y;
    if (x >= sorted[sorted.length - 1].x) return sorted[sorted.length - 1].y;

    for (let i = 0; i < sorted.length - 1; i++) {
      const p1 = sorted[i];
      const p2 = sorted[i + 1];

      if (x >= p1.x && x <= p2.x) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        if (dx === 0) {
          // Degenerate vertical segment — just return y from p1
          return p1.y;
        }

        const t = (x - p1.x) / dx;
        return p1.y + t * dy;
      }
    }

    // Fallback (should never hit this)
    return sorted[sorted.length - 1].y;
  };

  const describe = (): Description[] => {
    const segments: Description[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const p1 = sorted[i];
      const p2 = sorted[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;

      if (dx === 0) {
        segments.push({
          slope: 0,
          intercept: p1.y,
          start: p1,
          end: p2,
        });
      } else {
        const slope = dy / dx;
        const intercept = p1.y - slope * p1.x;
        segments.push({
          slope,
          intercept,
          start: p1,
          end: p2,
        });
      }
    }
    return segments;
  };

  return { fit, describe };
}
