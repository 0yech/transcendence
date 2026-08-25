import { useRef } from "react";
import type { ReactNode } from "react";
import { io, Socket } from 'socket.io-client';
import { WebsocketContext } from "./WebSocketContext"

export function WebSocketRef({children} : {children: ReactNode})
{
    const wsRef = useRef<Socket | null>(null);
    function connect(code: string) {

        wsRef.current = io("/games", {
            reconnection: true
        });
        wsRef.current.on("game:state", () => console.log("listening to game:state"));
        wsRef.current.on("game:error", () => console.log("listening to game:error"));
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
        <WebsocketContext value={{connect:connect, disconnect:disconnect}}>
            {children}
        </WebsocketContext>
    );
}