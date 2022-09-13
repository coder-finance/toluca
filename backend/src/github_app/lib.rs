// Copyright (c) 2019 Jason White
// Copyright (c) 2019 Mike Lubinets
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
pub use github_types as types;

pub use types::{AppEvent, Event, EventType};

use std::collections::HashMap;
use std::sync::Mutex;

use hubcaps::{Github, Credentials, JWTCredentials, InstallationTokenGenerator};

use reqwest::Client;

const USER_AGENT: &str =
    concat!(env!("CARGO_PKG_NAME"), "/", env!("CARGO_PKG_VERSION"));

/// A pool of JWT credentials, indexed by the installation ID.
pub struct ClientPool {
    pool: Mutex<HashMap<u64, InstallationTokenGenerator>>,

    /// The Reqwest HTTP client.
    client: Client,

    /// The Github API URL.
    api: String,

    creds: JWTCredentials,
}

impl ClientPool {
    pub fn new(api: String, creds: JWTCredentials) -> Self {
        ClientPool {
            pool: Mutex::new(HashMap::new()),
            client: Client::new(),
            api,
            creds,
        }
    }

    /// Gets a Github client for the given installation ID.
    pub fn get(&self, installation: u64) -> Github {
        let mut pool = self.pool.lock().unwrap();

        let token_generator = pool
            .entry(installation)
            .or_insert_with(|| {
                InstallationTokenGenerator::new(
                    installation,
                    self.creds.clone(),
                )
            })
            .clone();

        Github::custom(
            self.api.clone(),
            USER_AGENT,
            Credentials::InstallationToken(token_generator),
            self.client.clone(),
        )
    }
}