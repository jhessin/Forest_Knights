import { Workspace } from "@rbxts/services";

const Teleporter = Workspace.Teleporter;

function lockTeleporter() {
	Teleporter.Walls.GetChildren().forEach((wall) => {
		if (wall.IsA("Part")) {
			wall.CanCollide = true;
		}
	});
}
function onTeleporterEntered(hit: Instance) {
  lockTeleporter.
}
