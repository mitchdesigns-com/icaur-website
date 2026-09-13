import Link from "next/link";

export function QuickNav() {
  return (
    <div id="quick-nav" className="qn" aria-label="Quick navigation">
      <div className="qn-menu" id="qnMenu" aria-hidden="true">
        <a
          href="https://wa.me/20221234567"
          className="qn-item qn-item--wa"
          target="_blank"
          rel="noopener"
          aria-label="Chat on WhatsApp"
        >
          <span className="qn-item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.858L0 24l6.336-1.508A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 01-5.001-1.373l-.359-.213-3.722.886.916-3.614-.234-.371A9.787 9.787 0 012.182 12C2.182 6.567 6.567 2.182 12 2.182S21.818 6.567 21.818 12 17.433 21.818 12 21.818z" />
            </svg>
          </span>
          <span className="qn-item-label">Chat on WhatsApp</span>
        </a>
        <Link href="/contact/?tab=maintenance" className="qn-item qn-item--maintenance" aria-label="Book Maintenance">
          <span className="qn-item-icon">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </span>
          <span className="qn-item-label">Book Maintenance</span>
        </Link>
        <Link href="/contact/?tab=test-drive" className="qn-item qn-item--drive" aria-label="Request Test Drive">
          <span className="qn-item-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="9" x2="12" y2="2" />
              <line x1="9" y1="11.5" x2="2.5" y2="15" />
              <line x1="15" y1="11.5" x2="21.5" y2="15" />
            </svg>
          </span>
          <span className="qn-item-label">Request Test Drive</span>
        </Link>
      </div>
      <button className="qn-toggle" id="qnToggle" aria-label="Open quick navigation" aria-expanded="false">
        <span className="qn-bar qn-bar--1" />
        <span className="qn-bar qn-bar--2" />
        <span className="qn-bar qn-bar--3" />
      </button>
    </div>
  );
}
