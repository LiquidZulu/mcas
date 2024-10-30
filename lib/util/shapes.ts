import { Circle } from '@motion-canvas/2d';
import { Reference, Vector2 } from '@motion-canvas/core';
import { distance } from './vectors';

/*
 * Returns a locus function which can test whether
 * a given point (absolute position) is in the locus
 */
export function ellipseLocusFactory(
    ellipse: Reference<Circle>,
): (point: Vector2) => boolean {
    const isCircle = ellipse().width() == ellipse().height();

    if (isCircle) {
        return point =>
            distance(ellipse().absolutePosition(), point) <=
            ellipse().width() / 2;
    }

    const { x, y } = ellipse().absolutePosition();

    let major, minor;

    if (ellipse().width() > ellipse().height()) {
        [major, minor] = [ellipse().width(), ellipse().height()];
    } else {
        [minor, major] = [ellipse().width(), ellipse().height()];
    }

    const [a, b] = [major / 2, minor / 2];

    return point =>
        (point.x - x) ** 2 / a ** 2 + (point.y - y) ** 2 / b ** 2 <= 1;
}
