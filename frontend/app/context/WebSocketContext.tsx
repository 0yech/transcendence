import { createContext, useRef } from "react";
import type { ReactNode } from "react";
import { io, Socket } from 'socket.io-client';

interface InterfaceWSConnection
{
  ws: Socket | null,
  connect: (code: string) => void,
  disconnect: () => void,
};

const WebsocketContext = createContext<InterfaceWSConnection | null>(null);

export function WebSocketRef({children} : {children: ReactNode})
{
    const wsRef = useRef<Socket | null>(null);
    function connect(code: string) {
        wsRef.current = io("/socket.io", {
            reconnection: true
        });
        wsRef.current.on("connect", () => console.log("connected to websocket"));
        wsRef.current.on("disconnect", () => console.log("disconnected"));
        
        wsRef.current.emit("game:join", {
            "lobbyCode": code
        }, (ack: { ok: boolean; lobbyCode: string }) => console.log(ack));
    }

    function disconnect() {
        if (wsRef.current?.connected)
        {
            wsRef.current.disconnect();
            wsRef.current = null;
        }
    }
    return (
    <>
        <WebsocketContext value={{ws:null, connect:connect, disconnect:disconnect}}>
            {children};
        </WebsocketContext>
    </>);
}