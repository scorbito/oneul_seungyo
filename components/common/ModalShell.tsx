"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

type ModalShellProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  backdropClassName?: string;
};

export function ModalShell({ open, title, onClose, children, panelClassName, backdropClassName }: ModalShellProps) {
  if (!open) {
    return null;
  }

  return (
    <div className={backdropClassName ? `modal-backdrop ${backdropClassName}` : "modal-backdrop"} role="presentation">
      <section className={panelClassName ? `modal-panel ${panelClassName}` : "modal-panel"} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-header">
          <button className="modal-close" type="button" aria-label="닫기" onClick={onClose}>
            <X size={20} />
          </button>
          <strong>{title}</strong>
          <span />
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
