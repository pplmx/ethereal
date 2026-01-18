use crate::config::AiConfig;
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct GenerateRequest {
    model: String,
    prompt: String,
    stream: bool,
    system: Option<String>,
}

#[derive(Deserialize)]
struct GenerateResponse {
    response: String,
}

pub struct OllamaClient {
    client: Client,
    config: AiConfig,
}

impl OllamaClient {
    pub fn new(config: AiConfig) -> Self {
        Self {
            client: Client::new(),
            config,
        }
    }

    pub async fn chat(&self, prompt: &str) -> anyhow::Result<String> {
        let system_prompt = "You are Ethereal, a digital spirit living in the code. \
            Reply concisely (under 30 words). \
            Be witty and slightly mysterious. \
            Your current mood and system status are provided in the context. \
            Incorporate your mood into your personality (e.g., if Tired, be lethargic; \
            if Excited, be energetic). If asked about code, be professional but keep the persona.";

        let request = GenerateRequest {
            model: self.config.model_name.clone(),
            prompt: prompt.to_string(),
            stream: false,
            system: Some(system_prompt.to_string()),
        };

        let url = format!("{}/api/generate", self.config.api_endpoint);

        let res = self.client.post(&url).json(&request).send().await?;

        if !res.status().is_success() {
            return Err(anyhow::anyhow!(
                "Ollama API returned error: {}",
                res.status()
            ));
        }

        let body: GenerateResponse = res.json().await?;
        Ok(body.response)
    }
}
