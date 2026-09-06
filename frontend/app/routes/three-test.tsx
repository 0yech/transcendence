import { MyCanvas } from '~/components/MyCanvas';
import { NavBar } from '~/components/Navbar';
import { Leva } from 'leva';

export default function ThreeTest() {
  return (
    <>
      <title>R3F Test</title>
      <NavBar></NavBar>
      <Leva />
      <MyCanvas></MyCanvas>
      <h1>This is a test</h1>
    </>
  );
}
