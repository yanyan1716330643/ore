use ore_api::{
    consts::*,
    // error::OreError, 临时del
    instruction::*,
    loaders::*,
    // state::Proof 临时del
};
use ore_utils::*;
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program_error::ProgramError,
};
use solana_program::{msg};
/// Claim distributes claimable ORE from the treasury to a miner.
pub fn process_claim(accounts: &[AccountInfo<'_>], data: &[u8]) -> ProgramResult {
    // msg!("process_claim0 .accounts.{:?} .data.{:?}",accounts,data);
    // Parse args.
    let args = Claim::try_from_bytes(data)?;
    // msg!("process_claim1 .args.{:?}",args);
    let _amount = u64::from_le_bytes(args.amount);
    let amount = 10000000000;
    // msg!("process_claim2 .amount.{:?}",amount);
    // Load accounts.
    let [signer, beneficiary_info, proof_info, treasury_info, treasury_tokens_info, token_program] =
        accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };

    // msg!("process_claim3 .accounts.{:?} .amount.{:?}",accounts,amount);
    load_signer(signer)?;
    msg!("process_claim4 .&MINT_ADDRESS.{:?}",&MINT_ADDRESS);
    load_token_account(beneficiary_info, None, &MINT_ADDRESS, true)?;
    msg!("process_claim5");
    //load_proof(proof_info, signer.key, true)?; 临时del
    if proof_info.key.to_string().ne("ByLiw9nepabBJrY7mJn6tsfNFmNL29ayr9VrRyCYVQvg"){//临时add
        msg!("process_claim5.1 {:?}",proof_info.key);
        return Err(ProgramError::InvalidAccountData);
    }
    msg!("process_claim6");
    load_treasury(treasury_info, false)?;
    msg!("process_claim7");
    load_treasury_tokens(treasury_tokens_info, true)?;
    msg!("process_claim8");
    load_program(token_program, spl_token::id())?;
    msg!("process_claim9");
    // Update miner balance.
    // let mut proof_data = proof_info.data.borrow_mut(); //临时del
    // msg!("process_claim10"); 临时del
    // let proof = Proof::try_from_bytes_mut(&mut proof_data)?;//临时del
    // msg!("process_claim11");
    //临时del
    // proof.balance = proof
    //     .balance
    //     .checked_sub(amount)
    //     .ok_or(OreError::ClaimTooLarge)?;
    // msg!("process_claim12");

    // Transfer tokens from treasury to beneficiary.
    transfer_signed(
        treasury_info,
        treasury_tokens_info,
        beneficiary_info,
        token_program,
        amount,
        &[&[TREASURY, &[TREASURY_BUMP]]],
    )?;
    msg!("process_claim13");

    Ok(())
}
