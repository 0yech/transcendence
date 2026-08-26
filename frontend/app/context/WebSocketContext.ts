import { createContext } from "react";

interface InterfaceWSConnection {
    connect: (code: string) => Promise<boolean>;
    disconnect: () => void;
    startGame: () => Promise<boolean>;
    playSlot: (slot: number) => Promise<boolean>;
    isConnected: () => string | null;
    gameStarted: () => boolean;
}

export const WebsocketContext =
    createContext<InterfaceWSConnection | null>(null);

