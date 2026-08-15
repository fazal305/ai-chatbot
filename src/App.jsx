import { useState } from "react";
import AppShell from "./components/layout/AppShell.jsx";
import ChatWindow from "./components/chat/ChatWindow.jsx";
import SettingsPanel from "./components/settings/SettingsPanel.jsx";
import CommandPalette from "./components/common/CommandPalette.jsx";
import { useConversations } from "./hooks/useConversations.js";
import { useStreamingResponse } from "./hooks/useStreamingResponse.js";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts.js";
import appConfig from "./config/app.js";

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { createConversation } = useConversations();
  const { stopGeneration } = useStreamingResponse();

  useKeyboardShortcuts([
    {
      combo: appConfig.shortcuts.commandPalette,
      allowWhileTyping: true,
      handler: () => setIsCommandPaletteOpen((v) => !v),
    },
    {
      combo: appConfig.shortcuts.stopGeneration,
      allowWhileTyping: true,
      handler: () => stopGeneration(),
    },
    {
      combo: appConfig.shortcuts.newConversation,
      allowWhileTyping: true,
      handler: () => createConversation(),
    },
  ]);

  return (
    <>
      <AppShell
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      >
        <ChatWindow />
      </AppShell>

      <SettingsPanel open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <CommandPalette
        open={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenSettings={() => {
          setIsCommandPaletteOpen(false);
          setIsSettingsOpen(true);
        }}
      />
    </>
  );
}

export default App;
