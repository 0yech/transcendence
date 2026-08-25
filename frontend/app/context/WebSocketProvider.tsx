import { useRef } from "react";
import type { ReactNode } from "react";
import { io, Socket } from 'socket.io-client';
import { WebsocketContext } from "./WebSocketContext"
import { useNavigate } from "react-router";

export function WebSocketRef({children} : {children: ReactNode})
{
    const wsRef = useRef<Socket | null>(null);
    const codeLink = useRef<string | null>(null);
    const navigate = useNavigate();
    function connect(code: string): Promise<boolean> {

        wsRef.current = io("/games", {
            reconnection: true
        });
        codeLink.current = code;
        wsRef.current.on("game:state", (e) => {
            navigate(`/game/${codeLink.current}/play`);
            console.log(e);
        });
        wsRef.current.on("game:error", (e) => {console.log("listening to game:error"); console.log(e)});
        wsRef.current.on("connect", () => console.log("connected to websocket"));
        wsRef.current.on("disconnect", () => console.log("disconnected"));

        return new Promise((resolve) => {
            if (!wsRef.current)
                throw new Error("No game joined");
            wsRef.current.emit("game:join", {
                "lobbyCode": codeLink.current
            }, (ack: { success: boolean; lobbyCode: string }) => resolve(ack.success));
        });
    }

    function playCard(slot: number): Promise<boolean> {
        return new Promise((resolve) => {
            if (!wsRef.current || !codeLink.current)
                throw new Error("No active game. cannot play a card");
            wsRef.current.emit("game:play-slot", {
                "lobbyCode": codeLink.current,
                "slot": slot
            }, (ack: { ok: boolean}) => {
                console.log("played slot " + slot);
                return resolve(ack.ok);
            });
        });
    }

    function gameStart(): Promise<boolean> {
        return new Promise((resolve) => {
            if (!wsRef.current)
                throw new Error("No active game. cannot start a game (wsRef)");
            if (!codeLink.current)
                throw new Error("No active game. cannot start a game (codeLink)");
            wsRef.current.emit("game:start", {
                "lobbyCode": codeLink.current
            }, (ack: { ok: boolean}) => resolve(ack.ok));
        });
    }

    function disconnect() {
        if (wsRef.current?.connected)
        {
            wsRef.current.disconnect();
            wsRef.current = null;
            codeLink.current = null;
        }
    }
    return (
        <WebsocketContext value={{connect:connect, disconnect:disconnect, startGame:gameStart, playSlot:playCard}}>
            {children}
        </WebsocketContext>
    );
}