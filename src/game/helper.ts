export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const gameObjectsToObjectPoints = (
    gameObjects: unknown[],
): ObjectPoint[] => {
    return gameObjects.map((gameObject) => gameObject as ObjectPoint);
};
