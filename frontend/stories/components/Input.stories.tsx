/**
 * @file    Input.stories.tsx
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
  title: 'Components/Input',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
      <div>
        <label htmlFor="text-input-demo" className="form-label" style={{ fontWeight: 600 }}>
          Account Holder Name
        </label>
        <input
          type="text"
          className="form-control"
          id="text-input-demo"
          placeholder="e.g. Ramesh Kumar"
          defaultValue="Aarav Sharma"
        />
        <div className="form-text">Enter name exactly as printed on Government ID.</div>
      </div>

      <div>
        <label htmlFor="select-input-demo" className="form-label" style={{ fontWeight: 600 }}>
          Account Type
        </label>
        <select className="form-select" id="select-input-demo" defaultValue="savings">
          <option value="">Select an account type...</option>
          <option value="savings">Basic Savings Bank Deposit Account (BSBDA)</option>
          <option value="current">Current Business Account</option>
          <option value="salary">Corporate Salary Account</option>
        </select>
        <div className="form-text">Choose the primary banking product for enrollment.</div>
      </div>

      <div>
        <label htmlFor="textarea-input-demo" className="form-label" style={{ fontWeight: 600 }}>
          Permanent Address Notes
        </label>
        <textarea
          className="form-control"
          id="textarea-input-demo"
          rows={3}
          placeholder="Enter complete postal address with PIN code..."
          defaultValue="House 42, Sector 14, New Delhi, PIN: 110001"
        />
        <div className="form-text">Must match postal verification documents.</div>
      </div>

      <div>
        <label htmlFor="disabled-input-demo" className="form-label" style={{ fontWeight: 600 }}>
          Customer CIF / ID (Disabled)
        </label>
        <input
          type="text"
          className="form-control"
          id="disabled-input-demo"
          defaultValue="IPPB-994820124"
          disabled
        />
      </div>

      <div>
        <label htmlFor="readonly-input-demo" className="form-label" style={{ fontWeight: 600 }}>
          IFSC Code (Readonly)
        </label>
        <input
          type="text"
          className="form-control"
          id="readonly-input-demo"
          defaultValue="IPOS0000001"
          readOnly
        />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '600px' }}>
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: '#444' }}>
          Small (.form-control-sm / .form-select-sm)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Small input field"
            defaultValue="Small text"
          />
          <select className="form-select form-select-sm" defaultValue="1">
            <option value="1">Small select option</option>
            <option value="2">Secondary option</option>
          </select>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: '#444' }}>
          Default Size
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Default input field"
            defaultValue="Standard input text"
          />
          <select className="form-select" defaultValue="1">
            <option value="1">Default select option</option>
            <option value="2">Secondary option</option>
          </select>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: '#444' }}>
          Large (.form-control-lg / .form-select-lg)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Large input field"
            defaultValue="Prominent large input text"
          />
          <select className="form-select form-select-lg" defaultValue="1">
            <option value="1">Large select option</option>
            <option value="2">Secondary option</option>
          </select>
        </div>
      </div>
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '600px' }}>
      <div>
        <label htmlFor="valid-input" className="form-label" style={{ fontWeight: 600 }}>
          Aadhaar / Mobile Number (Valid)
        </label>
        <input
          type="text"
          className="form-control is-valid"
          id="valid-input"
          defaultValue="9876543210"
        />
        <div className="valid-feedback" style={{ display: 'block' }}>
          ✓ Verified linked mobile number with UIDAI.
        </div>
      </div>

      <div>
        <label htmlFor="invalid-input" className="form-label" style={{ fontWeight: 600 }}>
          PAN Number (Invalid)
        </label>
        <input
          type="text"
          className="form-control is-invalid"
          id="invalid-input"
          defaultValue="INVALID_PAN"
        />
        <div className="invalid-feedback" style={{ display: 'block' }}>
          Please enter a valid 10-character alphanumeric PAN format (e.g. ABCDE1234F).
        </div>
      </div>

      <div>
        <label htmlFor="valid-select" className="form-label" style={{ fontWeight: 600 }}>
          Branch Selection (Valid)
        </label>
        <select className="form-select is-valid" id="valid-select" defaultValue="delhi">
          <option value="delhi">New Delhi GPO Head Post Office</option>
          <option value="mumbai">Mumbai GPO Head Post Office</option>
        </select>
        <div className="valid-feedback" style={{ display: 'block' }}>
          ✓ Branch is active and operational.
        </div>
      </div>

      <div>
        <label htmlFor="invalid-select" className="form-label" style={{ fontWeight: 600 }}>
          Designated State (Invalid)
        </label>
        <select className="form-select is-invalid" id="invalid-select" defaultValue="">
          <option value="">Please select a state...</option>
          <option value="DL">Delhi</option>
          <option value="MH">Maharashtra</option>
        </select>
        <div className="invalid-feedback" style={{ display: 'block' }}>
          State selection is required to calculate postal branch jurisdiction.
        </div>
      </div>
    </div>
  ),
};
