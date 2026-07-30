

const DEMO_EMAIL = "user@gmail.com";
const DEMO_PASSWORD = "Aravind@1";

function DemoNoticeModal({
  onClose,
  onUseDemo,
}: {
  onClose: () => void;
  onUseDemo: () => void;
}) {
  return (
    <div className="sb-modal-overlay" role="dialog" aria-modal="true">
      <div className="sb-modal">
        <h2>👋 Checking out this project?</h2>
        <p>
          This app is hosted on Render's free tier, so a couple of things to
          know before you try it:
        </p>
        <ul className="sb-modal-list">
          <li>
            The server spins down when idle — the <strong>first request can
            take up to ~50 seconds</strong> to respond. Please be patient on
            first load.
          </li>
          <li>
            Render blocks outbound <strong>SMTP requests</strong>, so email
            verification for new sign-ups won't go through. Signing up
            won't work in this deployment.
          </li>
          <li>
            Use the demo account below to sign in instead:
            <div className="sb-modal-creds">
              <code>{DEMO_EMAIL}</code>
              <code>{DEMO_PASSWORD}</code>
            </div>
          </li>
        </ul>

        <div className="sb-modal-actions">
          <button type="button" className="sb-modal-btn-secondary" onClick={onClose}>
            Got it
          </button>
          <button type="button" className="sb-modal-btn-primary" onClick={onUseDemo}>
            Fill demo credentials
          </button>
        </div>
      </div>
    </div>
  );
}

export default DemoNoticeModal;
