use web3::types::Log;

use ethabi::{
    decode, ParamType,
};

pub fn decode_payload_proposal_created(log: &Log) {
    let buf: &Vec<u8> = &log.data.0;
    // let serialized_data = serde_json::to_string(&log.data.0).unwrap();
    println!("> data: {:x?}", buf);
    let decoded = decode(&[
        ParamType::Uint(256),                               // proposalId
        ParamType::Address,                                 // proposer
        ParamType::Array(Box::new(ParamType::Address)),     // targets
        ParamType::Array(Box::new(ParamType::Uint(256))),   // values
        ParamType::Array(Box::new(ParamType::String)),      // signatures
        ParamType::Bytes,                                   // calldatas
        ParamType::Uint(256),                               // startBlock
        ParamType::Uint(256),                               // endBlock
        ParamType::String                                   // description
        ], &buf);
    let unwrapped = decoded.unwrap();

    println!("decoded] {}, {}, {}", unwrapped[6], unwrapped[7], unwrapped[8]);
}

pub fn parse_log_entry(log: &Log) {
    // println!("TODO: decoding log");
    // println!("TODO: find contribute intent related to proposal");
    // println!("TODO: check verification is done");
    // println!("TODO: check merge is done");
    // println!("TODO: check payout is already done");
    // println!("TODO: if not already paid and confirmed, payout!");
    // println!("TODO: log and save the receipt");
    // let serialized_log = serde_json::to_string(&log).unwrap();
    decode_payload_proposal_created(&log);
    // println!("> log: {}", serialized_log);
}