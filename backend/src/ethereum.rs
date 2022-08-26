use web3::types::Log;
use super::fastabi;

use ethabi::{
    decode,
    token::{LenientTokenizer, Token, Tokenizer},
    Contract, Error, ParamType,
};

pub fn decode_payload(log: &Log) {
    let buf: &Vec<u8> = &log.data.0;
    // let serialized_data = serde_json::to_string(&log.data.0).unwrap();
    println!("> data: {:x?}", buf);
    let decoded = decode(&[ParamType::Uint(256), 
        ParamType::Address, 
        ParamType::Array(Box::new(ParamType::Address)),
        ParamType::Array(Box::new(ParamType::Uint(256))),
        ParamType::Array(Box::new(ParamType::String)),
        ParamType::Bytes,
        ParamType::Uint(256),
        ParamType::Uint(256),
        ParamType::String
        ], &buf);
    println!("decoded] {}", decoded.unwrap()[0]);
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
    decode_payload(&log);
    // println!("> log: {}", serialized_log);
}