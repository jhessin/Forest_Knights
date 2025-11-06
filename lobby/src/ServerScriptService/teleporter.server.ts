import { Players, ReplicatedStorage, TeleportService, Workspace } from "@rbxts/services";
import { MsgType } from "ReplicatedStorage/TS/Enums";

const TPS = TeleportService;
const Teleporter = Workspace.Teleporter;
const Messenger = ReplicatedStorage.Events.Messenger;
const TeleportList: string[] = [];

const LongCountdown = 30;
const ShortCountdown = 5;
const ForestID = 105080786925449;

const numPlayers = () => TeleportList.size();
const maxPlayers = () => Teleporter.MaxPlayers.Value;

function lockTeleporter() {
	Teleporter.Walls.GetChildren().forEach((wall) => {
		if (wall.IsA("Part")) {
			wall.CanCollide = true;
		}
	});
}

function unlockTeleporter() {
	Teleporter.Walls.GetChildren().forEach((wall) => {
		if (wall.IsA("Part")) {
			wall.CanCollide = false;
		}
	});
}

// Teleport the given player inside the teleporter and lock it.
function enterTeleporter(player: Player) {
	player.Character?.PivotTo(Teleporter.TeleportZone.CFrame);
	lockTeleporter();
}

function onTeleporterEntered(hit: Instance) {
	const player_name = hit.Parent?.Name;
	if (!player_name) return;
	const player = Players.FindFirstChild(player_name) as Player;
	if (!player) return;
	const character = hit.Parent?.FindFirstChild("Humanoid");
	if (character && !TeleportList.find((plr) => plr === player_name)) {
		// New character entering
		if (numPlayers() < Teleporter.MaxPlayers.Value) {
			TeleportList.push(player_name);
			enterTeleporter(player);
			Teleporter.NumPlayers.Value = numPlayers();
		}

		if (numPlayers() === 1) {
			lockTeleporter();
			Messenger.FireClient(player, MsgType.ShowPartyScreen);
		} else {
			Messenger.FireClient(player, MsgType.EnableLeave);
		}
	}
}

function onTeleporterExit(hit: Instance) {
	const player_name = hit.Parent?.Name;
	if (!player_name) return;
	const player = Players.FindFirstChild(player_name) as Player;
	if (!player) return;
	const character = hit.Parent?.FindFirstChild("Humanoid");
	if (character && TeleportList.find((plr) => plr === player_name)) {
		TeleportList.remove(TeleportList.indexOf(player.Name));

		Teleporter.NumPlayers.Value = numPlayers();

		if (numPlayers() === 0) {
			unlockTeleporter();
		} else if (numPlayers() > 0 && numPlayers() < maxPlayers()) {
			unlockTeleporter();
		}
	}
}

Teleporter.TeleportZone.TouchEnded.Connect(onTeleporterExit);

Teleporter.TeleportZone.Touched.Connect(onTeleporterEntered);

function updatePlayerCount() {
	Teleporter.PlayerCountGui.PlayerCountTextLabel.Text = `${numPlayers()}/${maxPlayers()}`;
}

Teleporter.NumPlayers.Changed.Connect(updatePlayerCount);
Teleporter.MaxPlayers.Changed.Connect(updatePlayerCount);

function onServerEvent(plr: Player, msg: MsgType | unknown, arg: string | unknown) {
	switch (msg) {
		case MsgType.AddPlayer:
			if (TeleportList.find((v) => v === plr.Name)) {
				return;
			}
			if (numPlayers() < maxPlayers()) TeleportList.push(plr.Name);
			Teleporter.NumPlayers.Value = numPlayers();
			if (numPlayers() === maxPlayers()) lockTeleporter();
			break;
		case MsgType.RemovePlayer:
			if (TeleportList.find((v) => v === plr.Name)) {
				TeleportList.remove(TeleportList.indexOf(plr.Name));
				Teleporter.NumPlayers.Value = numPlayers();
				if (numPlayers() === 0) {
					unlockTeleporter();
				}
			}
			break;

		case MsgType.SetRoomSize:
			Teleporter.MaxPlayers.Value = arg as number;
			Teleporter.CountdownStarted.Value = true;

			unlockTeleporter();

			for (let i = LongCountdown; i >= 0; i--) {
				if (numPlayers() === 0) {
					Teleporter.PlayerCountGui.CountdownTextLabel.Text = "";
					Teleporter.CountdownStarted.Value = false;
					break;
				} else if (numPlayers() === maxPlayers() && i > ShortCountdown) i = ShortCountdown;
				Teleporter.PlayerCountGui.CountdownTextLabel.Text = `${i}'s`;

				if (i === 0) {
					Teleporter.PlayerCountGui.CountdownTextLabel.Text = "Teleporting...";
					Players.GetPlayers().forEach((plr) => {
						if (TeleportList.find((name) => name === plr.Name)) {
							TeleportList.remove(TeleportList.indexOf(plr.Name));
							TPS.Teleport(ForestID, plr);
						}
					});
					Teleporter.PlayerCountGui.CountdownTextLabel.Text = "";
					Teleporter.CountdownStarted.Value = false;
					ResetPlayerCount();
				}
				task.wait(1);
			}
			break;

		default:
			break;
	}
}

Messenger.OnServerEvent.Connect(onServerEvent);

function onPlayerAdded(player: Player) {
	const leaderstats = new Instance("Folder", player);
	leaderstats.Name = "Leaderstats";
	const maxDays = new Instance("NumberValue", leaderstats);
	maxDays.Name = "Max Days";
	maxDays.Value = 0;
}

Players.PlayerAdded.Connect(onPlayerAdded);

function ResetPlayerCount() {
	Teleporter.NumPlayers.Value = 0;
	Teleporter.MaxPlayers.Value = 5;
}
