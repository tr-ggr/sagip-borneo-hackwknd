# SEA-Guard Responsible AI Framework

SAGIP’s AI follows the **SEA-Guard** framework for responsible deployment across Southeast Asia.

## Pillars

1. **Language inclusivity**  
   The assistant supports multiple languages and locales. Users can request responses in their preferred language so that disaster guidance is accessible across the region’s diverse languages.

2. **Ethical AI prioritization**  
   AI is used to support, not replace, human decisions. The system provides preparedness guidance only, does not issue operational commands or warnings, and always directs users to follow official local authorities.

3. **Secure community data governance**  
   User data (location, demographics, conversation context) is used only to personalize preparedness advice. Assistant interactions are logged for safety and improvement without storing full question content in plain text. Data is handled according to the application’s security and privacy policies.

## Implementation hooks

- **Assistant API**: optional `preferredLanguage` for language-inclusive responses.
- **LLM server**: prompts enforce “preparedness guidance only” and official-authority disclaimer.
- **Logging**: assistant inquiries are audited (e.g. user id, timestamp, context flags) for governance and debugging; sensitive content is not logged.
