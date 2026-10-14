import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types';
import { LogOut, ChevronDown, User as UserIcon, Shield } from 'lucide-react';
import { Badge } from './ui/badge';

function Avatar({ user, size }: { user: User; size: 'sm' | 'md' }) {
  const dims = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-8 w-8 text-xs';
  if (user.pictureUrl) {
    return <img src={user.pictureUrl} alt="" referrerPolicy="no-referrer" className={`${dims} rounded-full object-cover border border-neutral-200`} />;
  }
  return (
    <span className={`${dims} flex items-center justify-center rounded-full bg-[#09090B] font-semibold text-white`}>
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
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-[#09090B] transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10 cursor-pointer"
      >
        <Avatar user={user} size="sm" />
        <span className="hidden max-w-[130px] truncate text-xs font-semibold md:inline text-[#09090B]">{user.name ?? user.email}</span>
        <ChevronDown
          className={`h-3 w-3 text-[#71717A] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-[#E4E4E7] bg-white p-3 shadow-clean-lg z-50"
          >
            <div className="flex items-center gap-3 border-b border-[#E4E4E7] pb-3 mb-2 px-1">
              <Avatar user={user} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#09090B]">{user.name || 'Managing Broker'}</p>
                <p className="truncate text-[11px] text-[#71717A] font-mono">{user.email}</p>
              </div>
            </div>

            <div className="px-2 py-1.5 mb-2 rounded-xl bg-[#F9FAFB] border border-[#E4E4E7]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#71717A] flex items-center gap-1">
                  <Shield className="h-3 w-3 text-neutral-800" /> Organization Role
                </span>
                <Badge variant="outline" className="text-[10px] font-semibold py-0.5">
                  {user.role || 'BROKER'}
                </Badge>
              </div>
            </div>

            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
