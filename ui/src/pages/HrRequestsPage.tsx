import { useState } from 'react'
import TimeOffRequestForm from '../components/TimeOffRequestForm'
import HrEnquiryForm from '../components/HrEnquiryForm'

type Tab = 'time-off' | 'enquiry'

/**
 * HR Requests page with two tabs: Time Off and General Enquiry.
 * Covers FR4.1 and FR4.2.
 */
export default function HrRequestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('time-off')

  return (
    <section>
      <h1>HR Requests</h1>

      <div
        role="tablist"
        aria-label="HR request types"
        style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'time-off'}
          aria-controls="panel-time-off"
          id="tab-time-off"
          className={`btn ${activeTab === 'time-off' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('time-off')}
          data-testid="tab-time-off"
        >
          Time Off
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'enquiry'}
          aria-controls="panel-enquiry"
          id="tab-enquiry"
          className={`btn ${activeTab === 'enquiry' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('enquiry')}
          data-testid="tab-enquiry"
        >
          General Enquiry
        </button>
      </div>

      <div
        id="panel-time-off"
        role="tabpanel"
        aria-labelledby="tab-time-off"
        hidden={activeTab !== 'time-off'}
        className="card"
      >
        <h2>Submit Time-Off Request</h2>
        <TimeOffRequestForm />
      </div>

      <div
        id="panel-enquiry"
        role="tabpanel"
        aria-labelledby="tab-enquiry"
        hidden={activeTab !== 'enquiry'}
        className="card"
      >
        <h2>General HR Enquiry</h2>
        <HrEnquiryForm />
      </div>
    </section>
  )
}
