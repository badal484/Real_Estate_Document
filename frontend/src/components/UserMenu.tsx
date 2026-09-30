import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types';
import { LogOut, ChevronDown, Shield } from 'lucide-react';
import { Badge } from './ui/badge';

function Avatar({ user, size }: { user: User; size: 'sm' | 'md' }) {
  const dims = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-8 w-8 text-xs';
  if (user.pictureUrl) {
    return (
      <img
        src={user.pictureUrl}
        alt=""
        referrerPolicy="no-referrer"
        className={`${dims} rounded-full object-cover border border-border`}
      />
    );
  }
  return (
    <span
      className={`${dims} flex items-center justify-center rounded-full bg-primary font-semibold text-white`}
    >
      {(user.name ?? user.email).charAt(0).toUpperCase()}
    </span>
  );
}

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={rootRef} className="relative ml-2 pl-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 text-primary-text transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
      >
        <Avatar user={user} size="sm" />
        <span className="hidden max-w-[130px] truncate text-xs font-medium md:inline">
          {user.name ?? user.email}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-secondary-text transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            role="menu"
            className="absolute right-0 mt-2 w-60 origin-top-right overflow-hidden rounded-lg border border-border bg-surface shadow-md z-50"
          >
            <div className="flex items-center gap-2.5 border-b border-border p-3 bg-secondary/40">
              <Avatar user={user} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-primary-text">
                  {user.name || 'Agent User'}
                </p>
                <p className="truncate text-[11px] text-secondary-text font-mono">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="p-1.5 space-y-0.5">
              <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] text-secondary-text">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-secondary-text" />
                  <span>Role</span>
                </span>
                <Badge variant="neutral" className="text-[10px]">
                  Brokerage Admin
                </Badge>
              </div>

              <div className="h-px bg-border my-1" />

              <button
                type="button"
                role="menuitem"
                onClick={signOut}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-danger transition-colors hover:bg-danger-light"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
