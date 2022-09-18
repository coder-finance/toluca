
use std::convert::TryFrom;

#[derive(strum_macros::Display)]
pub enum ProposalState {
    Pending,
    Active,
    Canceled,
    Defeated,
    Succeeded,
    Queued,
    Expired,
    Executed,
    Verified,
    Merged,
}

impl TryFrom<u64> for ProposalState {
    type Error = ();

    fn try_from(v: u64) -> Result<Self, Self::Error> {
        match v {
            x if x == ProposalState::Pending as u64 => Ok(ProposalState::Pending),
            x if x == ProposalState::Active as u64 => Ok(ProposalState::Active),
            x if x == ProposalState::Canceled as u64 => Ok(ProposalState::Canceled),
            x if x == ProposalState::Defeated as u64 => Ok(ProposalState::Defeated),
            x if x == ProposalState::Succeeded as u64 => Ok(ProposalState::Succeeded),
            x if x == ProposalState::Queued as u64 => Ok(ProposalState::Queued),
            x if x == ProposalState::Expired as u64 => Ok(ProposalState::Expired),
            x if x == ProposalState::Executed as u64 => Ok(ProposalState::Executed),
            x if x == ProposalState::Verified as u64 => Ok(ProposalState::Verified),
            x if x == ProposalState::Merged as u64 => Ok(ProposalState::Merged),
            _ => Err(()),
        }
    }
}