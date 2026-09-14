'use client';

import { useState } from 'react';

import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-container">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main className="admin-content">
        <header className="top-header d-lg-none">
          <IconButton
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon />
          </IconButton>

          <strong>BFL Administration</strong>
        </header>

        <div className="container-fluid p-3 p-md-4">
          {children}
        </div>
      </main>
    </div>
  );
}