import { createContext } from "react";

interface InterfaceWSConnection {
    connect: (code: string) => Promise<boolean>;
    disconnect: () => void;
    startGame: () => Promise<boolean>;
    playSlot: (slot: number) => Promise<boolean>;
}

export const WebsocketContext =
    createContext<InterfaceWSConnection | null>(null);

