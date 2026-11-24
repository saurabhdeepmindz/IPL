/**
 * @file    Card.stories.tsx
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

const meta = {
  title: 'Components/Card',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px' }}>
      <div>
        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Standard Card Structure</h4>
        <div className="card" style={{ maxWidth: '480px' }}>
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Account Summary</span>
            <span className="badge bg-primary-100 text-primary-700" style={{ fontSize: '11px' }}>
              Active
            </span>
          </div>
          <div className="card-body">
            <h5 className="card-title">India Post Premium Savings</h5>
            <p className="card-text text-muted">
              Zero balance digital savings account linked directly to your Aadhaar and Postal Index Number.
            </p>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-primary btn-sm">View Passbook</button>
              <button type="button" className="btn btn-outline-primary btn-sm">Transfer Funds</button>
            </div>
          </div>
          <div className="card-footer text-muted" style={{ fontSize: '12px' }}>
            Last transaction: 12 Nov 2026, 10:45 AM
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Card Group (.card-group)</h4>
        <div className="card-group">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Aadhaar ATM (AePS)</h5>
              <p className="card-text">
                Withdraw cash, inquire balance, and obtain mini-statements right at your doorstep.
              </p>
            </div>
            <div className="card-footer text-muted" style={{ fontSize: '12px' }}>Max ₹10,000 / day</div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Direct Benefit (DBT)</h5>
              <p className="card-text">
                Seamless credit for government social welfare schemes and subsidies.
              </p>
            </div>
            <div className="card-footer text-muted" style={{ fontSize: '12px' }}>Zero processing fee</div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Bill Payments (BBPS)</h5>
              <p className="card-text">
                Pay electricity, water, gas, FASTag, and mobile recharges with instant receipt.
              </p>
            </div>
            <div className="card-footer text-muted" style={{ fontSize: '12px' }}>24x7 Settlement</div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '800px' }}>
      <div className="card">
        <svg
          className="card-img-top"
          width="100%"
          height="160"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Doorstep Banking Placeholder"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
        >
          <rect width="100%" height="100%" fill="#00646B" />
          <text x="50%" y="50%" fill="#ffffff" dy=".3em" textAnchor="middle" fontSize="16" fontFamily="sans-serif">
            Doorstep Postal Banking
          </text>
        </svg>
        <div className="card-body">
          <h5 className="card-title">Postman at Your Doorstep</h5>
          <p className="card-text">
            Request cash pickup or digital KYC completion directly at your residential address with biometric authentication.
          </p>
          <button type="button" className="btn btn-primary">Book Appointment</button>
        </div>
      </div>

      <div className="card">
        <svg
          className="card-img-top"
          width="100%"
          height="160"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Digital Gold Placeholder"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
        >
          <rect width="100%" height="100%" fill="#F2B705" />
          <text x="50%" y="50%" fill="#212121" dy=".3em" textAnchor="middle" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
            Micro Insurance & Investments
          </text>
        </svg>
        <div className="card-body">
          <h5 className="card-title">Postal Life Insurance (PLI)</h5>
          <p className="card-text">
            Affordable life and accident cover starting at low monthly premiums for citizens across rural & urban India.
          </p>
          <button type="button" className="btn btn-secondary">Learn More</button>
        </div>
      </div>
    </div>
  ),
};

export const ColorVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        maxWidth: '1000px',
      }}
    >
      <div className="card text-bg-primary">
        <div className="card-header">Header (Primary)</div>
        <div className="card-body">
          <h5 className="card-title">Primary (.text-bg-primary)</h5>
          <p className="card-text">Styled using brand primary teal (#00646B) with light contrast text.</p>
        </div>
      </div>

      <div className="card text-bg-secondary">
        <div className="card-header">Header (Secondary)</div>
        <div className="card-body">
          <h5 className="card-title">Secondary (.text-bg-secondary)</h5>
          <p className="card-text">Styled using brand secondary gold (#F2B705) with dark contrast text.</p>
        </div>
      </div>

      <div className="card text-bg-success">
        <div className="card-header">Header (Success)</div>
        <div className="card-body">
          <h5 className="card-title">Success (.text-bg-success)</h5>
          <p className="card-text">Positive state indicator with high contrast typography.</p>
        </div>
      </div>

      <div className="card text-bg-danger">
        <div className="card-header">Header (Danger)</div>
        <div className="card-body">
          <h5 className="card-title">Danger (.text-bg-danger)</h5>
          <p className="card-text">Critical and urgent card notification presentation.</p>
        </div>
      </div>

      <div className="card text-bg-warning">
        <div className="card-header">Header (Warning)</div>
        <div className="card-body">
          <h5 className="card-title">Warning (.text-bg-warning)</h5>
          <p className="card-text">Cautionary notice container with dark legible text.</p>
        </div>
      </div>

      <div className="card text-bg-dark">
        <div className="card-header">Header (Dark)</div>
        <div className="card-body">
          <h5 className="card-title">Dark (.text-bg-dark)</h5>
          <p className="card-text">High emphasis neutral card container for administrative logs.</p>
        </div>
      </div>

      <div className="card text-bg-light">
        <div className="card-header">Header (Light)</div>
        <div className="card-body">
          <h5 className="card-title">Light (.text-bg-light)</h5>
          <p className="card-text">Subtle muted background with standard body text colors.</p>
        </div>
      </div>
    </div>
  ),
};
