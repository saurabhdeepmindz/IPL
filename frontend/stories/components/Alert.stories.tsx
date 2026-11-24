/**
 * @file    Alert.stories.tsx
 * @module  Storybook
 *
 * @description
 * Storybook examples. In plain words: shows the component or token in each state.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta = {
  title: 'Components/Alert',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
      <div className="alert alert-primary" role="alert">
        <strong>Primary Notice:</strong> Brand teal alert applied via overridden <code>.alert-primary</code>. Check out the{' '}
        <a href="#" className="alert-link" onClick={(e) => e.preventDefault()}>
          banking policy update
        </a>
        .
      </div>

      <div className="alert alert-secondary" role="alert">
        <strong>Secondary Notice:</strong> Brand gold alert applied via overridden <code>.alert-secondary</code>. Read the{' '}
        <a href="#" className="alert-link" onClick={(e) => e.preventDefault()}>
          festival interest rate brochure
        </a>
        .
      </div>

      <div className="alert alert-success" role="alert">
        <strong>Transaction Successful:</strong> Funds transfer of ₹5,000 to Account ending 4120 was executed.{' '}
        <a href="#" className="alert-link" onClick={(e) => e.preventDefault()}>
          Download UTR receipt
        </a>
        .
      </div>

      <div className="alert alert-danger" role="alert">
        <strong>Authentication Error:</strong> Biometric fingerprint match exceeded allowable attempts. Please{' '}
        <a href="#" className="alert-link" onClick={(e) => e.preventDefault()}>
          request OTP alternative
        </a>
        .
      </div>

      <div className="alert alert-warning" role="alert">
        <strong>Scheduled Maintenance:</strong> Core banking network will undergo system upgrades between 01:00 AM and 03:30 AM IST.{' '}
        <a href="#" className="alert-link" onClick={(e) => e.preventDefault()}>
          View uptime calendar
        </a>
        .
      </div>

      <div className="alert alert-info" role="alert">
        <strong>Regulatory Information:</strong> Deposits up to ₹5 Lakh are insured under DICGC guidelines.{' '}
        <a href="#" className="alert-link" onClick={(e) => e.preventDefault()}>
          Read RBI guidelines
        </a>
        .
      </div>
    </div>
  ),
};

export const WithHeading: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div className="alert alert-primary" role="alert">
        <h4 className="alert-heading" style={{ fontWeight: 700 }}>
          Welcome to IPPB Digital Doorstep Banking!
        </h4>
        <p>
          Your account has been successfully provisioned. You can now perform transactions, pay utility bills,
          deposit into Government small savings schemes, and book a Gramin Dak Sevak visit straight from your mobile.
        </p>
        <hr />
        <p className="mb-0">
          Need immediate assistance? Call our toll-free postal helpline at <strong>155299</strong> or visit your local{' '}
          <a href="#" className="alert-link" onClick={(e) => e.preventDefault()}>
            Post Office Branch
          </a>
          .
        </p>
      </div>

      <div className="alert alert-warning" role="alert">
        <h4 className="alert-heading" style={{ fontWeight: 700 }}>
          Periodic KYC Re-validation Required
        </h4>
        <p>
          As per Reserve Bank of India circular RBI/2026/88, all digital banking accounts with annual turnover exceeding
          ₹2 Lakh must complete periodic video-KYC or biometric re-validation before the financial quarter ends.
        </p>
        <hr />
        <p className="mb-0">
          Ensure you have your original physical PAN card and Aadhaar linked mobile ready before starting the{' '}
          <a href="#" className="alert-link" onClick={(e) => e.preventDefault()}>
            Video KYC Process
          </a>
          .
        </p>
      </div>
    </div>
  ),
};

function DismissibleAlertsDemo() {
  const [alerts, setAlerts] = useState({
    primary: true,
    secondary: true,
    success: true,
    danger: true,
  });

  const resetAlerts = () => {
    setAlerts({ primary: true, secondary: true, success: true, danger: true });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: '#666' }}>
          Click the close button (×) on any alert to test dismissibility:
        </span>
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={resetAlerts}>
          Reset Alerts
        </button>
      </div>

      {alerts.primary && (
        <div className="alert alert-primary alert-dismissible fade show" role="alert">
          <strong>Primary Alert:</strong> Doorstep cash request submitted successfully for PIN code 110001.
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setAlerts((prev) => ({ ...prev, primary: false }))}
          />
        </div>
      )}

      {alerts.secondary && (
        <div className="alert alert-secondary alert-dismissible fade show" role="alert">
          <strong>Secondary Alert:</strong> Brand golden alert notice for postal life insurance dividend credit.
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setAlerts((prev) => ({ ...prev, secondary: false }))}
          />
        </div>
      )}

      {alerts.success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Success Alert:</strong> Nominee authentication record updated and secured.
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setAlerts((prev) => ({ ...prev, success: false }))}
          />
        </div>
      )}

      {alerts.danger && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Danger Alert:</strong> Session timeout imminent due to 15 minutes of inactivity.
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setAlerts((prev) => ({ ...prev, danger: false }))}
          />
        </div>
      )}
    </div>
  );
}

export const Dismissible: Story = {
  render: () => <DismissibleAlertsDemo />,
};
