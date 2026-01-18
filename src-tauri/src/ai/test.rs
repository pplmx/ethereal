#[cfg(test)]
mod tests {
    use crate::ai::OllamaClient;
    use crate::config::AiConfig;

    fn mock_ai_config() -> AiConfig {
        AiConfig {
            model_name: "test-model".to_string(),
            api_endpoint: "http://localhost:11434".to_string(),
            system_prompt: "You are a test spirit.".to_string(),
            max_response_length: 100,
            cooldown_seconds: 1,
        }
    }

    #[test]
    fn test_build_system_prompt_no_mood() {
        let client = OllamaClient::new(mock_ai_config());
        let prompt = client.build_system_prompt(None);
        assert_eq!(prompt, "You are a test spirit.");
    }

    #[test]
    fn test_build_system_prompt_with_mood_happy() {
        let client = OllamaClient::new(mock_ai_config());
        let prompt = client.build_system_prompt(Some("Happy"));
        assert!(prompt.contains("You are a test spirit."));
        assert!(prompt.contains("cheerful and helpful"));
    }

    #[test]
    fn test_build_system_prompt_with_mood_angry() {
        let client = OllamaClient::new(mock_ai_config());
        let prompt = client.build_system_prompt(Some("Angry"));
        assert!(prompt.contains("irritable and short-tempered"));
    }

    #[test]
    fn test_build_system_prompt_unknown_mood() {
        let client = OllamaClient::new(mock_ai_config());
        let prompt = client.build_system_prompt(Some("Unknown"));
        assert_eq!(prompt, "You are a test spirit.");
    }
}
