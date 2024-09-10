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
    // msg!("v0.2");//修复计算单元超出调试
    // msg!("v0.3");//修复内存溢出调试
    // msg!("v0.4");//pda调试
    // msg!("v0.5");//load_uninitialized_pda 内存溢出调试
    // msg!("v0.6");//减少日志调试
    // msg!("v0.7");//Transaction simulation failed: Error processing Instruction 0: Provided seeds do not result in a valid address
    // msg!("v0.8");//关闭一个可能错误的校验
    // msg!("v0.9");//增加调试定位日志
    // msg!("v0.10");//调试定位日志 第十次load_uninitialized_pda异常定位
    // msg!("v0.11");//调试定位日志 process_initialize_4.2
    // msg!("process_instruction_1 _program_id_ {:?} _accounts_ {:?} _data_ {:?} ",program_id,accounts,data);
    msg!("v0.12");// 初始化已经完成

    if program_id.ne(&ore_api::id()) {
        return Err(ProgramError::IncorrectProgramId);
    }

    // msg!("process_instruction_2 _program_id.ne(&ore_api::id())_ {:?} ",program_id.ne(&ore_api::id()));

    let (tag, data) = data
        .split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;

    // msg!("process_instruction_3 _tag_ {:?} _data_ {:?} ",tag,data);

    match OreInstruction::try_from(*tag).or(Err(ProgramError::InvalidInstructionData))? {
        OreInstruction::Claim =>  msg!("Claim instruction received."),
        OreInstruction::Close =>  msg!("Close instruction received."),
        OreInstruction::Mine =>  msg!("Mine instruction received."),
        OreInstruction::Open =>  msg!("Open instruction received."),
        OreInstruction::Reset =>  msg!("Reset instruction received."),
        OreInstruction::Stake =>  msg!("Stake instruction received."),
        OreInstruction::Update =>  msg!("Update instruction received."),
        OreInstruction::Upgrade =>  msg!("Upgrade instruction received."),
        OreInstruction::Initialize =>  msg!("Initialize instruction received."),
    }

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
