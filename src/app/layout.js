import { StoreProvider } from 'src/context/StoreContext';
// Only truly shared CSS lives in the root layout. Customer- and admin-specific
// stylesheets are loaded from their respective group layouts so customer pages
// no longer ship the admin CSS (and vice versa).
import '../styles/global.css';
import '../styles/components.css';

export const metadata = {
  title: 'Zassports - Premium Cricket Gear E-Commerce',
  description: 'Shop cricket bats, balls, kits, and protective gears online. Decathlon-inspired sports shopping experience.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
