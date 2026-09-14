import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';

import MuiProvider from '../components/common/MuiProvider';
import AdminLayout from '../components/layout/AdminLayout';

export const metadata = {
  title: 'BFL Administration',
  description: 'BFL Administration Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MuiProvider>
          <AdminLayout>
            {children}
          </AdminLayout>
        </MuiProvider>
      </body>
    </html>
  );
}