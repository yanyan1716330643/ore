use std::mem::size_of;
use solana_program::{
    msg
};
use ore_api::{
    consts::*,
    instruction::*,
    state::{Bus, Config, Treasury},
};
use ore_utils::*;
use solana_program::{
    self, account_info::AccountInfo, entrypoint::ProgramResult, program_error::ProgramError,
    program_pack::Pack, system_program, sysvar,
};
use spl_token::state::Mint;

/// Initialize sets up the ORE program to begin mining.
pub fn process_initialize(accounts: &[AccountInfo<'_>], data: &[u8]) -> ProgramResult {
    msg!("process_initialize_1 _accounts_ {:?} _data_ {:?} ",accounts,data);
    // Parse args.
    let args = Initialize::try_from_bytes(data)?;
    msg!("process_initialize_2 _args_ {:?} ",args);
    // Load accounts.
    let [
    signer,
    bus_0_info,
    bus_1_info,
    bus_2_info,
    bus_3_info,
    bus_4_info,
    bus_5_info,
    bus_6_info,
    bus_7_info,
    config_info,
    metadata_info,
    mint_info,
    treasury_info,
    treasury_tokens_info,
    system_program,
    token_program,
    associated_token_program,
    metadata_program,
    rent_sysvar] =
        accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    msg!("process_initialize_3");
    // 'Program log: Error: memory allocation failed, out of memory',
    // msg!("process_initialize_3 \
    // _signer_ {:?} \
    // _bus_0_info_ {:?} \
    // _bus_1_info_ {:?} \
    // _bus_2_info_ {:?} \
    // _bus_3_info_ {:?} \
    // _bus_4_info_ {:?} \
    // _bus_5_info_ {:?} \
    // _bus_6_info_ {:?} \
    // _bus_7_info_ {:?} \
    // _config_info_ {:?} \
    // _metadata_info_ {:?} \
    // _mint_info_ {:?} \
    // _treasury_info_ {:?} \
    // _treasury_tokens_info_ {:?} \
    // _system_program_ {:?} \
    // _token_program_ {:?} \
    // _associated_token_program_ {:?} \
    // _metadata_program_ {:?} \
    // _rent_sysvar_ {:?}",
    // signer,
    // bus_0_info,
    // bus_1_info,
    // bus_2_info,
    // bus_3_info,
    // bus_4_info,
    // bus_5_info,
    // bus_6_info,
    // bus_7_info,
    // config_info,
    // metadata_info,
    // mint_info,
    // treasury_info,
    // treasury_tokens_info,
    // system_program,
    // token_program,
    // associated_token_program,
    // metadata_program,
    // rent_sysvar
    // );

    load_signer(signer)?;
    load_uninitialized_pda(bus_0_info, &[BUS, &[0]], args.bus_0_bump, &ore_api::id())?;
    load_uninitialized_pda(bus_1_info, &[BUS, &[1]], args.bus_1_bump, &ore_api::id())?;
    load_uninitialized_pda(bus_2_info, &[BUS, &[2]], args.bus_2_bump, &ore_api::id())?;
    load_uninitialized_pda(bus_3_info, &[BUS, &[3]], args.bus_3_bump, &ore_api::id())?;
    load_uninitialized_pda(bus_4_info, &[BUS, &[4]], args.bus_4_bump, &ore_api::id())?;
    load_uninitialized_pda(bus_5_info, &[BUS, &[5]], args.bus_5_bump, &ore_api::id())?;
    load_uninitialized_pda(bus_6_info, &[BUS, &[6]], args.bus_6_bump, &ore_api::id())?;
    load_uninitialized_pda(bus_7_info, &[BUS, &[7]], args.bus_7_bump, &ore_api::id())?;
    load_uninitialized_pda(config_info, &[CONFIG], args.config_bump, &ore_api::id())?;
    load_uninitialized_pda(
        metadata_info,
        &[
            METADATA,
            mpl_token_metadata::ID.as_ref(),
            MINT_ADDRESS.as_ref(),
        ],
        args.metadata_bump,
        &mpl_token_metadata::ID,
    )?;
    load_uninitialized_pda(
        mint_info,
        &[MINT, MINT_NOISE.as_slice()],
        args.mint_bump,
        &ore_api::id(),
    )?;
    load_uninitialized_pda(
        treasury_info,
        &[TREASURY],
        args.treasury_bump,
        &ore_api::id(),
    )?;
    load_system_account(treasury_tokens_info, true)?;
    load_program(system_program, system_program::id())?;
    load_program(token_program, spl_token::id())?;
    load_program(associated_token_program, spl_associated_token_account::id())?;
    load_program(metadata_program, mpl_token_metadata::ID)?;
    load_sysvar(rent_sysvar, sysvar::rent::id())?;

    // Check signer.
    if signer.key.ne(&INITIALIZER_ADDRESS) {
        return Err(ProgramError::MissingRequiredSignature);
    }
    msg!("process_initialize_4 _signer.key.ne(&INITIALIZER_ADDRESS)_ {:?} ",signer.key.ne(&INITIALIZER_ADDRESS));
    // Initialize bus accounts.
    let bus_infos = [
        bus_0_info, bus_1_info, bus_2_info, bus_3_info, bus_4_info, bus_5_info, bus_6_info,
        bus_7_info,
    ];
    let bus_bumps = [
        args.bus_0_bump,
        args.bus_1_bump,
        args.bus_2_bump,
        args.bus_3_bump,
        args.bus_4_bump,
        args.bus_5_bump,
        args.bus_6_bump,
        args.bus_7_bump,
    ];
    for i in 0..BUS_COUNT {
        create_pda(
            bus_infos[i],
            &ore_api::id(),
            8 + size_of::<Bus>(),
            &[BUS, &[i as u8], &[bus_bumps[i]]],
            system_program,
            signer,
        )?;
        let mut bus_data = bus_infos[i].try_borrow_mut_data()?;
        bus_data[0] = Bus::discriminator() as u8;
        let bus = Bus::try_from_bytes_mut(&mut bus_data)?;
        bus.id = i as u64;
        bus.rewards = 0;
        bus.theoretical_rewards = 0;
        bus.top_balance = 0;
    }
    msg!("process_initialize_5");
    // Initialize config.
    create_pda(
        config_info,
        &ore_api::id(),
        8 + size_of::<Config>(),
        &[CONFIG, &[args.config_bump]],
        system_program,
        signer,
    )?;
    msg!("process_initialize_6");
    let mut config_data = config_info.data.borrow_mut();
    config_data[0] = Config::discriminator() as u8;
    let config = Config::try_from_bytes_mut(&mut config_data)?;
    config.base_reward_rate = INITIAL_BASE_REWARD_RATE;
    config.last_reset_at = 0;
    config.min_difficulty = INITIAL_MIN_DIFFICULTY as u64;
    config.top_balance = 0;
    msg!("process_initialize_7");
    // Initialize treasury.
    create_pda(
        treasury_info,
        &ore_api::id(),
        8 + size_of::<Treasury>(),
        &[TREASURY, &[args.treasury_bump]],
        system_program,
        signer,
    )?;
    msg!("process_initialize_8");
    let mut treasury_data = treasury_info.data.borrow_mut();
    treasury_data[0] = Treasury::discriminator() as u8;
    msg!("process_initialize_9");
    drop(treasury_data);
    msg!("process_initialize_10");
    // Initialize mint.
    create_pda(
        mint_info,
        &spl_token::id(),
        Mint::LEN,
        &[MINT, MINT_NOISE.as_slice(), &[args.mint_bump]],
        system_program,
        signer,
    )?;
    msg!("process_initialize_11");
    solana_program::program::invoke_signed(
        &spl_token::instruction::initialize_mint(
            &spl_token::id(),
            mint_info.key,
            treasury_info.key,
            None,
            TOKEN_DECIMALS,
        )?,
        &[
            token_program.clone(),
            mint_info.clone(),
            treasury_info.clone(),
            rent_sysvar.clone(),
        ],
        &[&[MINT, MINT_NOISE.as_slice(), &[args.mint_bump]]],
    )?;
    msg!("process_initialize_12");

    // Initialize mint metadata.
    mpl_token_metadata::instructions::CreateMetadataAccountV3Cpi {
        __program: metadata_program,
        metadata: metadata_info,
        mint: mint_info,
        mint_authority: treasury_info,
        payer: signer,
        update_authority: (signer, true),
        system_program,
        rent: Some(rent_sysvar),
        __args: mpl_token_metadata::instructions::CreateMetadataAccountV3InstructionArgs {
            data: mpl_token_metadata::types::DataV2 {
                name: METADATA_NAME.to_string(),
                symbol: METADATA_SYMBOL.to_string(),
                uri: METADATA_URI.to_string(),
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            },
            is_mutable: true,
            collection_details: None,
        },
    }
    .invoke_signed(&[&[TREASURY, &[args.treasury_bump]]])?;

    msg!("process_initialize_13");
    // Initialize treasury token account.
    create_ata(
        signer,
        treasury_info,
        treasury_tokens_info,
        mint_info,
        system_program,
        token_program,
        associated_token_program,
    )?;
    msg!("process_initialize_14");

    Ok(())
}
