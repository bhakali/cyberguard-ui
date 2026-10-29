<script>
  import Topbar from '$lib/components/Topbar.svelte';
  import { cyberguard } from '$lib/cyberguard.svelte.js';
</script>

<svelte:head>
  <title>CyberGuard Security | Business Process Mapping</title>
</svelte:head>

<Topbar title="Business Process Mapping & System Automation Logic">
  {#snippet actions()}
    <button class="btn btn-secondary btn-sm" onclick={() => cyberguard.showToast('Exporting End-to-End Business Process Specification (PDF/DOCX)', 'success')}>
      <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      Export Process Blueprint
    </button>
  {/snippet}
</Topbar>

<main class="page-container">

  <div class="page-header">
    <div class="header-title-area">
      <h2>End-to-End HR Workflow Blueprint & Logic Translation</h2>
      <p>Comprehensive mapping of typical steps, common bottlenecks, benefits, and automated software logic for implementation</p>
    </div>
  </div>

  <!-- Master Process Matrix Table -->
  <div class="card" style="margin-bottom: 24px;">
    <div class="card-header">
      <div class="card-title">
        <svg width="20" height="20" fill="none" stroke="#2563eb" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        Core HR Business Process Mapping Matrix
      </div>
      <span class="badge badge-primary">5 Core Workflows</span>
    </div>

    <div class="table-responsive">
      <table class="modern-table workflow-matrix-table">
        <thead>
          <tr>
            <th style="width: 15%;">HR Process</th>
            <th style="width: 30%;">Typical Operational Steps</th>
            <th style="width: 25%;">Common Issues (Unmapped)</th>
            <th style="width: 20%;">Benefits of Process Mapping</th>
            <th style="width: 10%;">Interactive Module</th>
          </tr>
        </thead>
        <tbody>
          
          <!-- 1. Recruitment -->
          <tr>
            <td>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Recruitment</div>
              <span class="badge badge-accent" style="margin-top: 4px;">Talent Acquisition</span>
            </td>
            <td>
              <div style="font-weight: 600; color: #93c5fd;">Job posting → Applications → Screening → Interviews → Offer</div>
              <div style="font-size: 0.76rem; color: var(--text-dim); margin-top: 6px;">
                Includes police fingerprint vetting, physical endurance test, and armed guard certification verification.
              </div>
            </td>
            <td>
              <div class="badge badge-danger" style="margin-bottom: 4px;"><span class="badge-dot"></span> Bottlenecks</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">
                Delays in management approvals, inconsistent selection criteria, paper resume loss, unverified licenses.
              </div>
            </td>
            <td>
              <div class="badge badge-success" style="margin-bottom: 4px;"><span class="badge-dot"></span> Value</div>
              <div style="font-size: 0.8rem; color: var(--text-main);">
                Faster hiring cycle (from 28d to 12d), clearer role accountability, structured rating rubrics.
              </div>
            </td>
            <td>
              <a href="/recruitment" class="btn btn-secondary btn-sm">Launch Module →</a>
            </td>
          </tr>

          <!-- 2. Onboarding -->
          <tr>
            <td>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Onboarding</div>
              <span class="badge badge-primary" style="margin-top: 4px;">Personnel Induction</span>
            </td>
            <td>
              <div style="font-weight: 600; color: #93c5fd;">Paperwork → Orientation → Training → System Access</div>
              <div style="font-size: 0.76rem; color: var(--text-dim); margin-top: 6px;">
                Uniform & radio kit issuance, NRC/NAPSA registration, biometric site enroll, firearms safety induction.
              </div>
            </td>
            <td>
              <div class="badge badge-danger" style="margin-bottom: 4px;"><span class="badge-dot"></span> Bottlenecks</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">
                Redundant data entry across ops and HR, missed tasks, delayed uniform issuance, unmapped site deployment.
              </div>
            </td>
            <td>
              <div class="badge badge-success" style="margin-bottom: 4px;"><span class="badge-dot"></span> Value</div>
              <div style="font-size: 0.8rem; color: var(--text-main);">
                Standardized guard experience, zero missed statutory steps, day-one operational readiness.
              </div>
            </td>
            <td>
              <a href="/recruitment" class="btn btn-secondary btn-sm">Launch Module →</a>
            </td>
          </tr>

          <!-- 3. Payroll -->
          <tr>
            <td>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Payroll</div>
              <span class="badge badge-success" style="margin-top: 4px;">Statutory Compensation</span>
            </td>
            <td>
              <div style="font-weight: 600; color: #93c5fd;">Timesheets → Approvals → Calculations → Payments</div>
              <div style="font-size: 0.76rem; color: var(--text-dim); margin-top: 6px;">
                Automated ZRA PAYE tax tiers, NAPSA 5% (capped), NHIMA 1%, housing/transport allowances, overtime (1.5x/2.0x).
              </div>
            </td>
            <td>
              <div class="badge badge-danger" style="margin-bottom: 4px;"><span class="badge-dot"></span> Bottlenecks</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">
                Manual attendance entry, late shift sheet submissions, incorrect statutory tax formulas, penalties from ZRA/NAPSA.
              </div>
            </td>
            <td>
              <div class="badge badge-success" style="margin-bottom: 4px;"><span class="badge-dot"></span> Value</div>
              <div style="font-size: 0.8rem; color: var(--text-main);">
                100% calculation accuracy, flawless statutory compliance, automated direct bank batch files.
              </div>
            </td>
            <td>
              <a href="/payroll" class="btn btn-secondary btn-sm">Launch Module →</a>
            </td>
          </tr>

          <!-- 4. Performance Management -->
          <tr>
            <td>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Performance Management</div>
              <span class="badge badge-warning" style="margin-top: 4px;">Appraisal & Growth</span>
            </td>
            <td>
              <div style="font-weight: 600; color: #93c5fd;">Goal setting → Reviews → Feedback → Development plans</div>
              <div style="font-size: 0.76rem; color: var(--text-dim); margin-top: 6px;">
                Quarterly KPI cycles, site vigilance metrics, incident handling speed, supervisor 1-5 rating rubrics.
              </div>
            </td>
            <td>
              <div class="badge badge-danger" style="margin-bottom: 4px;"><span class="badge-dot"></span> Bottlenecks</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">
                Subjective evaluations, unclear appraisal timelines, lack of field feedback loops, guard turnover.
              </div>
            </td>
            <td>
              <div class="badge badge-success" style="margin-bottom: 4px;"><span class="badge-dot"></span> Value</div>
              <div style="font-size: 0.8rem; color: var(--text-main);">
                Fairness & transparency, objective site metrics, structured promotion & retraining pipelines.
              </div>
            </td>
            <td>
              <a href="/performance" class="btn btn-secondary btn-sm">Launch Module →</a>
            </td>
          </tr>

          <!-- 5. Offboarding -->
          <tr>
            <td>
              <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">Offboarding</div>
              <span class="badge badge-danger" style="margin-top: 4px;">Separation & Clearance</span>
            </td>
            <td>
              <div style="font-weight: 600; color: #93c5fd;">Exit interview → Clearance → Benefits termination → Knowledge transfer</div>
              <div style="font-size: 0.76rem; color: var(--text-dim); margin-top: 6px;">
                Uniform & arms kit surrender, biometric/RFID access revocation, terminal dues calculation, rehire flag.
              </div>
            </td>
            <td>
              <div class="badge badge-danger" style="margin-bottom: 4px;"><span class="badge-dot"></span> Bottlenecks</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">
                Unreturned uniforms/firearms, delayed terminal benefits payout, missed labor law compliance, security breaches.
              </div>
            </td>
            <td>
              <div class="badge badge-success" style="margin-bottom: 4px;"><span class="badge-dot"></span> Value</div>
              <div style="font-size: 0.8rem; color: var(--text-main);">
                Complete security clearance audit, legal risk reduction, accurate rehire eligibility classification.
              </div>
            </td>
            <td>
              <a href="/offboarding" class="btn btn-secondary btn-sm">Launch Module →</a>
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  </div>

  <!-- Automated System Logic for Developers / Implementers -->
  <div class="card">
    <div class="card-header">
      <div class="card-title">
        <svg width="20" height="20" fill="none" stroke="#10b981" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
        Translation: Business Logic to Automated Software Triggers
      </div>
    </div>
    <div class="card-body">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        
        <div>
          <h4 style="font-size: 0.92rem; color: #fff; margin-bottom: 8px;">1. Statutory Tax & Payroll Trigger Logic</h4>
          <div class="logic-callout" style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 16px; font-family: monospace; font-size: 0.8rem; color: #93c5fd; line-height: 1.6;">
            // Event: Monthly Timesheet Approved by Area Manager<br>
            On Timesheet.Status == "APPROVED":<br>
            &nbsp;&nbsp;CalculatedHours = Roster.RegularHours + (Overtime.Hours * 1.5)<br>
            &nbsp;&nbsp;Gross = BasePay + Housing + Transport + OvertimePay<br>
            &nbsp;&nbsp;NAPSA = MIN(Gross * 0.05, 1426.00)<br>
            &nbsp;&nbsp;NHIMA = BasePay * 0.01<br>
            &nbsp;&nbsp;TaxableIncome = Gross - NAPSA<br>
            &nbsp;&nbsp;PAYE = CalculateZBATiers(TaxableIncome)<br>
            &nbsp;&nbsp;NetPay = Gross - (PAYE + NAPSA + NHIMA)<br>
            &nbsp;&nbsp;GenerateBankEFTBatch(NetPay, Employee.BankDetails)
          </div>
        </div>

        <div>
          <h4 style="font-size: 0.92rem; color: #fff; margin-bottom: 8px;">2. Guard Shift Discrepancy & Relief Trigger</h4>
          <div class="logic-callout" style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 16px; font-family: monospace; font-size: 0.8rem; color: #93c5fd; line-height: 1.6;">
            // Event: Site Biometric Clock-in Window (05:45 - 06:15)<br>
            On ClockIn.Time &gt; ScheduledShift.Start + 15_MINUTES:<br>
            &nbsp;&nbsp;Status = "FLAGGED_ABSENT"<br>
            &nbsp;&nbsp;Alert ShiftCoordinator (David Lungu) via SMS & Push<br>
            &nbsp;&nbsp;Trigger AutoReliefDispatcher(NearestAvailableGuard)<br>
            &nbsp;&nbsp;Deduct 0.5 Shift Allowance unless ApprovedMedicalLeave<br>
            &nbsp;&nbsp;Log incident to Operations Incident Register
          </div>
        </div>

      </div>
    </div>
  </div>

<style>
  .flow-step-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
    flex-wrap: wrap;
  }

  .flow-step {
    background: var(--bg-card);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 12px 18px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-main);
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
  }

  .flow-step.active {
    border-color: var(--primary-light);
    background: rgba(37, 99, 235, 0.12);
    box-shadow: 0 0 15px rgba(37, 99, 235, 0.25);
  }

  .flow-step-num {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 700;
  }

  .flow-connector {
    color: var(--accent-cyan);
    font-size: 1.1rem;
    font-weight: bold;
  }

  .workflow-matrix-table td {
    vertical-align: top;
    padding: 16px 20px;
  }

  .logic-callout {
    background: rgba(14, 23, 42, 0.7);
    border-left: 4px solid var(--accent-cyan);
    border-radius: var(--radius-sm);
    padding: 16px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.82rem;
    color: #93c5fd;
    line-height: 1.5;
  }
</style>

</main>
