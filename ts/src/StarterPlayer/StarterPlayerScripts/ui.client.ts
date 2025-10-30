import { Players, ReplicatedStorage, StarterGui, Workspace } from "@rbxts/services";
import { MsgType } from "ReplicatedStorage/TS/Enums";

const Player = Players.LocalPlayer;
const PlayerGui = Player.WaitForChild("PlayerGui") as StarterGui;
const LeaveUi = PlayerGui.WaitForChild("LeaveGui") as StarterGui["LeaveGui"];
const PartyGui = PlayerGui.WaitForChild("CreatePartyGui") as StarterGui["CreatePartyGui"];
const Messenger = ReplicatedStorage.Events.Messenger;

const fadedButtonColor = new Color3(0.5, 0.5, 0.5);
const highlightButtonColor = new Color3(0.1, 0.61, 0.05);
let maxPlayers = 5;

function unselectButton(btn: TextButton) {
	btn.BackgroundColor3 = fadedButtonColor;
}

function selectButton(btn: TextButton, btns: Instance[] = PartyGui.PartyFrame.PartySizeFrame.GetChildren()) {
	btns.forEach((b) => {
		if (b.IsA("TextButton")) {
			if (b === btn) {
				b.BackgroundColor3 = highlightButtonColor;
			} else {
				unselectButton(b as TextButton);
			}
		}
	});
}

function OnLeave() {
	Player.Character?.PivotTo(Workspace.SpawnLocation.CFrame);
	Messenger.FireServer(MsgType.RemovePlayer);
	LeaveUi.Enabled = false;
	PartyGui.Enabled = false;
}

function OnPartySizeSelection(btn: TextButton) {
	return function () {
		print(`Party size set to ${btn.Text}`);
		selectButton(btn);
		maxPlayers = tonumber(btn.Text) || maxPlayers;
	};
}

function OnCreateButton() {
	Messenger.FireServer(MsgType.SetRoomSize, maxPlayers);
	Messenger.FireServer(MsgType.AddPlayer);
	PartyGui.Enabled = false;
	LeaveUi.Enabled = true;
}

PartyGui.PartyFrame.CreateTextButton.Activated.Connect(OnCreateButton);

PartyGui.PartyFrame.PartySizeFrame.GetChildren().forEach((btn) => {
	if (btn.IsA("TextButton")) {
		print(`Assigning function for ${btn.Text} - type: ${typeOf(btn)}`);
		btn.Activated.Connect(OnPartySizeSelection(btn));
	}
});

LeaveUi.LeaveTextButton.Activated.Connect(OnLeave);
PartyGui.PartyFrame.CloseTextButton.Activated.Connect(OnLeave);

function OnMessageFromServer(msg: MsgType) {
	switch (msg) {
		case MsgType.ShowPartyScreen:
			PartyGui.Enabled = true;
			break;

		case MsgType.HidePartyScreen:
			PartyGui.Enabled = false;
			break;

		default:
			break;
	}
}

LeaveUi.LeaveTextButton.Activated.Connect(OnLeave);
PartyGui.PartyFrame.CloseTextButton.Activated.Connect(OnLeave);

ReplicatedStorage.Events.Messenger.OnClientEvent.Connect(OnMessageFromServer);
