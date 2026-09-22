import PrivacyPolicy from '~/pages/legal/privacy';
import { NavBar } from '~/components/Navbar';

export default function Privacy() {
  return (
    <>
      <title>Privacy Policy</title>
      <NavBar className="fixed"></NavBar>
      <PrivacyPolicy />
    </>
  );
}
