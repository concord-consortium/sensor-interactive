import Shutterbug from "shutterbug";

export function enableShutterbug(appClassName: string) {
  Shutterbug.enable("." + appClassName);
  Shutterbug.on("saycheese", beforeSnapshotHandler);
}

export function disableShutterbug() {
  Shutterbug.disable();
  Shutterbug.off("saycheese", beforeSnapshotHandler);
}

function beforeSnapshotHandler() {
  // This a no-op for now, because our canvases are doing the right thing.
  // stacking PNGs in the correct order. If this stops working for some reason,
  // we might need to manually composite the PNGs.
  console.info("Shutterbug: before snapshot -- Nothing to do FTM.");
}