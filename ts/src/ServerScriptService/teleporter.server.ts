import { Players, ReplicatedStorage, TeleportService, Workspace } from "@rbxts/services";
import { MsgType } from "ReplicatedStorage/TS/Enums";

const TPS = TeleportService;
const Teleporter = Workspace.Teleporter;
const Messenger = ReplicatedStorage.Events.Messenger;
const TeleportList: string[] = [];

const LongCountdown = 30;
const ShortCountdown = 5;

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

function enterTeleporter(player: Player) {
	player.Character?.PivotTo(Teleporter.TeleportZone.CFrame);
}

function onTeleporterEntered(hit: Instance) {
	const player_name = hit.Parent?.Name;
	if (!player_name) return;
	const player = Players.FindFirstChild(player_name) as Player;
	if (!player) return;
	const character = hit.Parent?.FindFirstChild("Humanoid");
	if (character && !TeleportList.find((plr) => plr === player_name)) {
		// New character entering
		if (TeleportList.size() < Teleporter.MaxPlayers.Value) {
			TeleportList.push(player_name);
			Teleporter.NumPlayers.Value = TeleportList.size();
		}

		const numPlayers = TeleportList.size();

		if (numPlayers === 1) {
			enterTeleporter(player);
			lockTeleporter();
			Messenger.FireClient(player, MsgType.ShowPartyScreen);
		}
	}
}

Teleporter.TeleportZone.Touched.Connect(onTeleporterEntered);

function updatePlayerCount() {
	const numPlayers = Teleporter.NumPlayers.Value;
	const maxPlayers = Teleporter.MaxPlayers.Value;
	Teleporter.PlayerCountGui.PlayerCountTextLabel.Text = `${numPlayers}/${maxPlayers}`;
}

Teleporter.NumPlayers.Changed.Connect(updatePlayerCount);
Teleporter.MaxPlayers.Changed.Connect(updatePlayerCount);

function onServerEvent(plr: Player, msg: MsgType | unknown, arg: string | unknown) {
	switch (msg) {
		case MsgType.RemovePlayer:
			if (TeleportList.find((v) => v === arg)) {
				TeleportList.remove(TeleportList.indexOf(arg as string));
				const numPlayers = TeleportList.size();
				Teleporter.NumPlayers.Value = numPlayers;
				if (numPlayers <= 0) {
					unlockTeleporter();
				}
			}
			break;

		default:
			break;
	}
}

Messenger.OnServerEvent.Connect(onServerEvent);
