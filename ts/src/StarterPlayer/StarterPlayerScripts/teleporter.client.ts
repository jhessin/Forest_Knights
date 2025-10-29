import { Players, ReplicatedStorage, StarterGui, Workspace } from "@rbxts/services";
import { MsgType } from "ReplicatedStorage/Enums";

const Player = Players.LocalPlayer;
const PlayerGui = Player.WaitForChild("PlayerGui") as StarterGui;
const LeaveUi = PlayerGui.WaitForChild("LeaveGui") as StarterGui["LeaveGui"];
const PartyGui = PlayerGui.WaitForChild("CreatePartyGui") as StarterGui["CreatePartyGui"];
const Messenger = ReplicatedStorage.Events.Messenger;

const fadedButtonColor = new Color3(0.5, 0.5, 0.5);
const highlightButtonColor = new Color3(1, 1, 0);

function unselectButton(btn: TextButton) {
	btn.BackgroundColor3 = fadedButtonColor;
}

function selectButton(btn: TextButton) {
	btn.BackgroundColor3 = highlightButtonColor;
}

function OnLeave() {
	Player.Character?.PivotTo(Workspace.SpawnLocation.CFrame);
	Messenger.FireServer(MsgType.RemovePlayer, Player.Name);
	LeaveUi.Enabled = false;
}

function OnMessageFromServer(msg: MsgType) {
	if (msg === MsgType.ShowPartyScreen) PartyGui.Enabled = true;
	else if (msg === MsgType.HidePartyScreen) PartyGui.Enabled = false;
}

LeaveUi.LeaveTextButton.Activated.Connect(OnLeave);
PartyGui.PartyFrame.CloseTextButton.Activated.Connect(OnLeave);

ReplicatedStorage.Events.Messenger.OnClientEvent.Connect(OnMessageFromServer);
