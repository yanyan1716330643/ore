use ore_utils::*;
use solana_program::{account_info::AccountInfo, program_error::ProgramError, pubkey::Pubkey};

use crate::{
    consts::*,
    state::{Bus, Config, Proof, Treasury},
};
use solana_program::{msg};
/// Errors if:
/// - Owner is not Ore program.
/// - Address does not match the expected bus address.
/// - Data is empty.
/// - Data cannot deserialize into a bus account.
/// - Bus ID does not match the expected ID.
/// - Expected to be writable, but is not.
pub fn load_bus(info: &AccountInfo<'_>, id: u64, is_writable: bool) -> Result<(), ProgramError> {
    if info.owner.ne(&crate::id()) {
        return Err(ProgramError::InvalidAccountOwner);
    }

    if info.key.ne(&BUS_ADDRESSES[id as usize]) {
        return Err(ProgramError::InvalidSeeds);
    }

    if info.data_is_empty() {
        return Err(ProgramError::UninitializedAccount);
    }

    let bus_data = info.data.borrow();
    let bus = Bus::try_from_bytes(&bus_data)?;

    if bus.id.ne(&id) {
        return Err(ProgramError::InvalidAccountData);
    }

    if is_writable && !info.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }

    Ok(())
}

/// Errors if:
/// - Owner is not Ore program.
/// - Data is empty.
/// - Data cannot deserialize into a bus account.
/// - Bus ID is not in the expected range.
/// - Address is not in set of valid bus address.
/// - Expected to be writable, but is not.
pub fn load_any_bus(info: &AccountInfo<'_>, is_writable: bool) -> Result<(), ProgramError> {
    if info.owner.ne(&crate::id()) {
        return Err(ProgramError::InvalidAccountOwner);
    }

    if info.data_is_empty() {
        return Err(ProgramError::UninitializedAccount);
    }

    if info.data.borrow()[0].ne(&(Bus::discriminator() as u8)) {
        return Err(solana_program::program_error::ProgramError::InvalidAccountData);
    }

    if !BUS_ADDRESSES.contains(info.key) {
        return Err(ProgramError::InvalidSeeds);
    }

    if is_writable && !info.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }

    Ok(())
}

/// Errors if:
/// - Owner is not Ore program.
/// - Address does not match the expected address.
/// - Data is empty.
/// - Data cannot deserialize into a config account.
/// - Expected to be writable, but is not.
pub fn load_config(info: &AccountInfo<'_>, is_writable: bool) -> Result<(), ProgramError> {
    if info.owner.ne(&crate::id()) {
        return Err(ProgramError::InvalidAccountOwner);
    }

    if info.key.ne(&CONFIG_ADDRESS) {
        return Err(ProgramError::InvalidSeeds);
    }

    if info.data_is_empty() {
        return Err(ProgramError::UninitializedAccount);
    }

    if info.data.borrow()[0].ne(&(Config::discriminator() as u8)) {
        return Err(solana_program::program_error::ProgramError::InvalidAccountData);
    }

    if is_writable && !info.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }

    Ok(())
}

/// Errors if:
/// - Owner is not Ore program.
/// - Data is empty.
/// - Data cannot deserialize into a proof account.
/// - Proof authority does not match the expected address.
/// - Expected to be writable, but is not.
pub fn load_proof(
    info: &AccountInfo<'_>,
    authority: &Pubkey,
    is_writable: bool,
) -> Result<(), ProgramError> {
    if info.owner.ne(&crate::id()) {
        return Err(ProgramError::InvalidAccountOwner);
    }

    if info.data_is_empty() {
        return Err(ProgramError::UninitializedAccount);
    }

    let proof_data = info.data.borrow();
    let proof = Proof::try_from_bytes(&proof_data)?;

    if proof.authority.ne(&authority) {
        return Err(ProgramError::InvalidAccountData);
    }

    if is_writable && !info.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }

    Ok(())
}

/// Errors if:
/// - Owner is not Ore program.
/// - Data is empty.
/// - Data cannot deserialize into a proof account.
/// - Proof miner does not match the expected address.
/// - Expected to be writable, but is not.
pub fn load_proof_with_miner(
    info: &AccountInfo<'_>,
    miner: &Pubkey,
    is_writable: bool,
) -> Result<(), ProgramError> {
    if info.owner.ne(&crate::id()) {
        return Err(ProgramError::InvalidAccountOwner);
    }

    if info.data_is_empty() {
        return Err(ProgramError::UninitializedAccount);
    }

    let proof_data = info.data.borrow();
    let proof = Proof::try_from_bytes(&proof_data)?;

    if proof.miner.ne(&miner) {
        return Err(ProgramError::InvalidAccountData);
    }

    if is_writable && !info.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }

    Ok(())
}

/// Errors if:
/// - Owner is not Ore program.
/// - Data is empty.
/// - Data cannot deserialize into a proof account.
/// - Expected to be writable, but is not.
pub fn load_any_proof(info: &AccountInfo<'_>, is_writable: bool) -> Result<(), ProgramError> {
    if info.owner.ne(&crate::id()) {
        return Err(ProgramError::InvalidAccountOwner);
    }

    if info.data_is_empty() {
        return Err(ProgramError::UninitializedAccount);
    }

    if info.data.borrow()[0].ne(&(Proof::discriminator() as u8)) {
        return Err(solana_program::program_error::ProgramError::InvalidAccountData);
    }

    if is_writable && !info.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }

    Ok(())
}

/// Errors if:
/// - Owner is not Ore program.
/// - Address does not match the expected address.
/// - Data is empty.
/// - Data cannot deserialize into a treasury account.
/// - Expected to be writable, but is not.
pub fn load_treasury(info: &AccountInfo<'_>, is_writable: bool) -> Result<(), ProgramError> {
    msg!("load_treasury1 .info.{:?}",info);
    if info.owner.ne(&crate::id()) {
        msg!("load_treasury2 .&crate::id().{:?}",&crate::id());
        return Err(ProgramError::InvalidAccountOwner);
    }

    if info.key.ne(&TREASURY_ADDRESS) {
        msg!("load_treasury3 .&TREASURY_ADDRESS.{:?}",&TREASURY_ADDRESS);
        return Err(ProgramError::InvalidSeeds);
    }

    if info.data_is_empty() {
        msg!("load_treasury4 .info.data_is_empty().{:?}",info.data_is_empty());
        return Err(ProgramError::UninitializedAccount);
    }

    if info.data.borrow()[0].ne(&(Treasury::discriminator() as u8)) {
        msg!("load_treasury5 .&(Treasury::discriminator() as u8).{:?}",&(Treasury::discriminator() as u8));
        return Err(solana_program::program_error::ProgramError::InvalidAccountData);
    }

    if is_writable && !info.is_writable {
        msg!("load_treasury6");
        return Err(ProgramError::InvalidAccountData);
    }

    Ok(())
}

/// Errors if:
/// - Address does not match the expected treasury tokens address.
/// - Cannot load as a token account
pub fn load_treasury_tokens(info: &AccountInfo<'_>, is_writable: bool) -> Result<(), ProgramError> {
    if info.key.ne(&TREASURY_TOKENS_ADDRESS) {
        return Err(ProgramError::InvalidSeeds);
    }

    load_token_account(info, Some(&TREASURY_ADDRESS), &MINT_ADDRESS, is_writable)
}
