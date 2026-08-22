import { createContext, useRef } from "react";
import type { ReactNode } from "react";

interface InterfaceWSConnection
{
  ws: WebSocket | null,
  connect: (code: string) => void,
  disconnect: () => void,
};

const WebsocketContext = createContext<InterfaceWSConnection | null>(null);

export function WebSocketRef({children} : {children: ReactNode})
{
    const wsRef = useRef<WebSocket | null>(null);
    function connect(code: string) {
        wsRef.current = new WebSocket("/game")
    }

    function disconnect() {

    }
    return (
    <>
        <WebsocketContext value={{ws:null, connect:connect, disconnect:disconnect}}>
            {children};
        </WebsocketContext>
    </>);
}