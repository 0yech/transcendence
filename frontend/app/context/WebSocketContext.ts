import { createContext } from "react";

interface InterfaceWSConnection {
    connect: (code: string) => Promise<boolean>;
    disconnect: () => void;
}

export const WebsocketContext =
    createContext<InterfaceWSConnection | null>(null);

