mod claim;
mod close;
mod initialize;
mod mine;
mod open;
mod reset;
mod stake;
mod update;
mod upgrade;

use claim::*;
use close::*;
use initialize::*;
use mine::*;
use open::*;
use reset::*;
use stake::*;
use update::*;
use upgrade::*;

use solana_program::{msg};

use ore_api::instruction::*;
use solana_program::{
    self, account_info::AccountInfo, entrypoint::ProgramResult, program_error::ProgramError,
    pubkey::Pubkey,
};

solana_program::entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    msg!("v0.2");
    msg!("process_instruction_1 _program_id_ {:?} _accounts_ {:?} _data_ {:?} ",program_id,accounts,data);

    if program_id.ne(&ore_api::id()) {
        return Err(ProgramError::IncorrectProgramId);
    }

    // msg!("process_instruction_2 _program_id.ne(&ore_api::id())_ {:?} ",program_id.ne(&ore_api::id()));

    let (tag, data) = data
        .split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;

    // msg!("process_instruction_3 _tag_ {:?} _data_ {:?} ",tag,data);

    match OreInstruction::try_from(*tag).or(Err(ProgramError::InvalidInstructionData))? {
        OreInstruction::Claim => process_claim(accounts, data)?,
        OreInstruction::Close => process_close(accounts, data)?,
        OreInstruction::Mine => process_mine(accounts, data)?,
        OreInstruction::Open => process_open(accounts, data)?,
        OreInstruction::Reset => process_reset(accounts, data)?,
        OreInstruction::Stake => process_stake(accounts, data)?,
        OreInstruction::Update => process_update(accounts, data)?,
        OreInstruction::Upgrade => process_upgrade(accounts, data)?,
        OreInstruction::Initialize => process_initialize(accounts, data)?,
    }

    Ok(())
}
