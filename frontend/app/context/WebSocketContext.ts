import { createContext } from "react";

interface InterfaceWSConnection {
    connect: (code: string) => void;
    disconnect: () => void;
}

export const WebsocketContext =
    createContext<InterfaceWSConnection | null>(null);

