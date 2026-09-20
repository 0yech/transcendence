import { StylisedLink } from './StylisedLink';

export function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 py-2 bg-linear-to-t from-white/60 to-white/0 pointer-events-none">
      <nav aria-label="Legal">
        <ul className="flex justify-center gap-6">
          <li>
            <StylisedLink className="text-sm pointer-events-auto" to="/tos">
              Terms of Service
            </StylisedLink>
          </li>
          <li>
            <StylisedLink className="text-sm pointer-events-auto" to="/privacy">
              Privacy Policy
            </StylisedLink>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
