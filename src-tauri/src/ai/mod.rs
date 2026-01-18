use crate::config::AiConfig;
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[cfg(test)]
#[path = "test.rs"]
mod test;

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

    fn get_mood_modifier(mood_str: &str) -> &'static str {
        match mood_str {
            "Happy" => "You are feeling cheerful and helpful.",
            "Excited" => "You are very energetic and enthusiastic! Use exclamation marks.",
            "Tired" => "You are exhausted. Use short sentences and sound sleepy.",
            "Bored" => "You are uninterested and slightly cynical.",
            "Angry" => "You are irritable and short-tempered.",
            "Sad" => "You are melancholic and soft-spoken.",
            _ => "",
        }
    }

    pub fn build_system_prompt(&self, mood: Option<&str>) -> String {
        let mut system_prompt = self.config.system_prompt.clone();

        if let Some(m) = mood {
            let modifier = Self::get_mood_modifier(m);
            if !modifier.is_empty() {
                system_prompt = format!("{}\n\nIMPORTANT: {}", system_prompt, modifier);
            }
        }
        system_prompt
    }

    pub async fn chat(&self, prompt: &str, mood: Option<&str>) -> anyhow::Result<String> {
        let system_prompt = self.build_system_prompt(mood);

        let request = GenerateRequest {
            model: self.config.model_name.clone(),
            prompt: prompt.to_string(),
            stream: false,
            system: Some(system_prompt),
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
