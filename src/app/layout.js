import { StoreProvider } from 'src/context/StoreContext';
import '../styles/global.css';
import '../styles/components.css';
import '../styles/customer.css';
import '../styles/admin.css';

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
