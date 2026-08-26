import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { io, Socket } from 'socket.io-client';
import { WebsocketContext } from "./WebSocketContext"
import { useNavigate } from "react-router";
import apiFetch from "~/utils/api-fetch";

export function WebSocketRef({children} : {children: ReactNode})
{
    const wsRef = useRef<Socket | null>(null);
    const codeLink = useRef<string | null>(null);
    const usernameRef = useRef<string | null>(null);
    const gameStartedRef = useRef<boolean>(false);

    useEffect(() => {
        apiFetch("/api/auth/me")
            .then((data) => data.json())
            .then((json) => {
                console.log(json);
                usernameRef.current = json.id;
                return (json.id);
            })
    }, []);

    const navigate = useNavigate();
    function connect(code: string): Promise<boolean> {

        wsRef.current = io("/games", {
            reconnection: true
        });
        codeLink.current = code;
        wsRef.current.on("game:state", (e) => {
            if (e.turnNumber == 1 || e.currentPlayerId == usernameRef.current)
            {
                navigate(`/game/${codeLink.current}/play`);
                gameStartedRef.current = true;
            }
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
            gameStartedRef.current = false;
        }
    }

    function isConnected(): string | null {
        return (codeLink.current);
    }

    function gameStarted(): boolean {
        return (gameStartedRef.current);
    }

    return (
        <WebsocketContext value={{connect:connect, disconnect:disconnect,
            startGame:gameStart, playSlot:playCard, isConnected:isConnected, gameStarted:gameStarted}}>
            {children}
        </WebsocketContext>
    );
}