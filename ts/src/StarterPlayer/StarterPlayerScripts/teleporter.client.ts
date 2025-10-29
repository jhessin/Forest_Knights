import { Players, ReplicatedStorage, StarterGui, Workspace } from "@rbxts/services";

const Player = Players.LocalPlayer;
const PlayerGui = Player.WaitForChild("PlayerGui") as StarterGui;
const LeaveUi = PlayerGui.WaitForChild("LeaveGui") as StarterGui["LeaveGui"];
const PartyGui = PlayerGui.WaitForChild("CreatePartyGui") as StarterGui["CreatePartyGui"];

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
	LeaveUi.Enabled = false;
}

function OnMessageFromServer(msg: string) {
	PartyGui.Enabled = true;
}

LeaveUi.LeaveTextButton.Activated.Connect(OnLeave);

ReplicatedStorage.Events.Messenger.OnClientEvent.Connect(OnMessageFromServer);
