import { useContext } from "react";
import { WebsocketContext } from "./WebSocketContext";

export function UseWebSocket() {
    const context = useContext(WebsocketContext);

    if (!context) {
        throw new Error(
            "useWebSocket must be used inside WebSocketRef"
        );
    }

    return context;
}