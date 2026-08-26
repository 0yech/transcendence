import { UseWebSocket } from "~/context/UseWebSocket";
import { useNavigate } from "react-router";


export default function PlayGame() {
  const { playSlot } = UseWebSocket();
  const navigate = useNavigate();
  return (
    <>
      <li>
        <button onClick={() => navigate("/")}>home</button>
      </li>
      <li>
        <button onClick={() => playSlot(1)}>play Slot 1</button>
      </li>
      <li>
        <button onClick={() => playSlot(2)}>play Slot 2</button>
      </li>
      <li>
        <button onClick={() => playSlot(3)}>play Slot 3</button>
      </li>
      <li>
        <button onClick={() => playSlot(4)}>play Slot 4</button>
      </li>
    </>
  );
}
