use crate::config::AiConfig;
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[cfg(test)]
#[path = "test.rs"]
mod test;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    stream: bool,
}

#[derive(Deserialize)]
struct ChatResponse {
    message: ChatMessage,
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

    pub async fn chat(
        &self,
        history: Vec<ChatMessage>,
        mood: Option<&str>,
    ) -> anyhow::Result<String> {
        let system_prompt = self.build_system_prompt(mood);

        let mut messages = vec![ChatMessage {
            role: "system".to_string(),
            content: system_prompt,
        }];

        messages.extend(history);

        let request = ChatRequest {
            model: self.config.model_name.clone(),
            messages,
            stream: false,
        };

        let url = format!("{}/api/chat", self.config.api_endpoint);

        let res = self.client.post(&url).json(&request).send().await?;

        if !res.status().is_success() {
            return Err(anyhow::anyhow!(
                "Ollama API returned error: {}",
                res.status()
            ));
        }

        let body: ChatResponse = res.json().await?;
        Ok(body.message.content)
    }
}
