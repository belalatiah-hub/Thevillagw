/**
 * Deterministic, role-aware "AI brief" generator — the intelligence layer that
 * turns raw CRM aggregates into a role-specific headline, insights, and
 * recommended next actions. Pure and side-effect free so it is trivially
 * testable and identical across web + mobile. The LLM provider can later
 * enrich the phrasing, but the grounded facts always come from real data.
 */

export type BriefRole =
  | 'AGENT'
  | 'MANAGER'
  | 'DIRECTOR'
  | 'FINANCE'
  | 'MARKETING'
  | 'CEO';

export interface BriefStats {
  totalLeads: number;
  newToday: number;
  hot: number;
  /** money values are integer minor units (piastres/cents) */
  pipelineOpenMinor: bigint;
  weightedForecastMinor: bigint;
  wonThisMonthMinor: bigint;
  openCount: number;
  currency: string;
  topSource?: { source: string; count: number } | null;
  topOwner?: { name: string; leads: number } | null;
  /** commission awaiting approval/payout, minor units */
  commissionPendingMinor?: bigint;
  commissionPaidMinor?: bigint;
}

export interface RoleBrief {
  role: BriefRole;
  headline: string;
  insights: string[];
  recommendations: string[];
}

function money(minor: bigint, currency: string): string {
  const major = Number(minor) / 100;
  if (major >= 1_000_000) return `${currency} ${(major / 1_000_000).toFixed(2)}M`;
  if (major >= 1_000) return `${currency} ${Math.round(major / 1_000)}K`;
  return `${currency} ${Math.round(major)}`;
}

/** Build the brief for a role from the aggregate stats. */
export function buildRoleBrief(role: BriefRole, s: BriefStats): RoleBrief {
  const cur = s.currency || 'EGP';
  switch (role) {
    case 'MANAGER':
    case 'DIRECTOR': {
      return {
        role,
        headline: `Team pipeline is ${money(s.pipelineOpenMinor, cur)} with a weighted forecast of ${money(
          s.weightedForecastMinor,
          cur,
        )}.`,
        insights: [
          `${s.openCount} open deals; ${s.hot} hot leads need attention today.`,
          s.topOwner
            ? `Top performer: ${s.topOwner.name} (${s.topOwner.leads} active leads).`
            : `No clear top performer yet — leads are evenly spread.`,
          `${s.newToday} new leads arrived today.`,
        ],
        recommendations: [
          s.hot > 0
            ? `Have the team call the ${s.hot} hot leads within the hour — speed-to-lead drives win rate.`
            : `Coach the team to re-qualify warm leads and refill the top of the funnel.`,
          `Review deals with no activity in 3+ days before the weekly forecast call.`,
        ],
      };
    }
    case 'FINANCE': {
      return {
        role,
        headline: `${money(s.wonThisMonthMinor, cur)} closed this month; ${money(
          s.commissionPendingMinor ?? 0n,
          cur,
        )} in commission awaits approval.`,
        insights: [
          `Pending commission: ${money(s.commissionPendingMinor ?? 0n, cur)}.`,
          `Paid to date: ${money(s.commissionPaidMinor ?? 0n, cur)}.`,
          `Open pipeline (future collections): ${money(s.pipelineOpenMinor, cur)}.`,
        ],
        recommendations: [
          (s.commissionPendingMinor ?? 0n) > 0n
            ? `Clear the pending commission queue so payouts stay on schedule.`
            : `No commission pending — payouts are current.`,
          `Reconcile developer payments against signed contracts weekly.`,
        ],
      };
    }
    case 'MARKETING': {
      const top = s.topSource;
      return {
        role,
        headline: top
          ? `${top.source} is your top lead source (${top.count} leads).`
          : `Lead sources are balanced — no single channel dominates.`,
        insights: [
          `${s.totalLeads} total leads; ${s.newToday} today.`,
          `${s.hot} leads are hot — measure which channels produce them.`,
          top ? `Concentrate spend where lead quality (lead→meeting) is highest.` : `Diversify to find your cheapest quality channel.`,
        ],
        recommendations: [
          `Shift budget toward the channel with the best cost-per-qualified-lead, not just the cheapest CPL.`,
          `Tag every campaign with UTM so ROAS is attributable end-to-end.`,
        ],
      };
    }
    case 'CEO': {
      return {
        role,
        headline: `${money(s.wonThisMonthMinor, cur)} won this month; ${money(
          s.weightedForecastMinor,
          cur,
        )} weighted in the pipeline.`,
        insights: [
          `${s.totalLeads} leads in the system, ${s.newToday} new today.`,
          `Open pipeline: ${money(s.pipelineOpenMinor, cur)} across ${s.openCount} deals.`,
          s.topOwner ? `Standout agent: ${s.topOwner.name}.` : `Talent is evenly distributed.`,
        ],
        recommendations: [
          `Protect speed-to-lead: it is the highest-ROI operational lever in brokerage.`,
          `Double down on the top lead source and the top project by conversion.`,
        ],
      };
    }
    case 'AGENT':
    default: {
      return {
        role: 'AGENT',
        headline:
          s.hot > 0
            ? `You have ${s.hot} hot lead${s.hot === 1 ? '' : 's'} and ${s.newToday} new today.`
            : `${s.newToday} new lead${s.newToday === 1 ? '' : 's'} today — keep the funnel warm.`,
        insights: [
          `Your open pipeline is ${money(s.pipelineOpenMinor, cur)} (${money(
            s.weightedForecastMinor,
            cur,
          )} weighted).`,
          `${s.totalLeads} leads assigned to you.`,
        ],
        recommendations: [
          s.hot > 0
            ? `Call your hot leads first and offer a site visit this week.`
            : `Send tailored WhatsApp options to your warm leads, then follow up by call.`,
          `Log every call and meeting so follow-ups never slip.`,
        ],
      };
    }
  }
}
