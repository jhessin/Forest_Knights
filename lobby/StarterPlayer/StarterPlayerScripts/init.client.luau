type LeaveGui = ScreenGui & { LeaveTextButton: TextButton }

local leaveGui: LeaveGui = game.Players.LocalPlayer.PlayerGui:WaitForChild("LeaveGui")
local leaveButton: TextButton = leaveGui.LeaveTextButton


function OnLeave() 
  print(`Button Clicked!`)
  leaveGui.Enabled = false
end

leaveButton.Activated:Connect(OnLeave)