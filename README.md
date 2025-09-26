# Smart Assistant

A personal AI assistant with persistent memory and continuous learning capabilities using Zep Cloud and OpenAI.

## Features

- **Persistent Memory**: Uses Zep Cloud for conversation history and user context
- **Streaming Responses**: Real-time conversation with the AI assistant
- **User Context**: Maintains user profiles and conversation threads
- **OpenAI Integration**: Powered by OpenAI's language models

## Architecture

- **Agent**: Core AI agent that handles user interactions
- **Thread**: Manages conversation history and user context via Zep Cloud
- **Memory**: Persistent storage of conversations and user information
- **Streaming**: Real-time response generation for better user experience

## Setup

1. **Environment Setup**:
   ```bash
   # Install dependencies
   uv sync

   # Activate virtual environment
   source .venv/bin/activate
   ```

2. **Configuration**:
   Create a `.env` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ZEP_API_KEY=your_zep_api_key
   ```

3. **Run the Assistant**:
   ```bash
   python main.py
   ```

## Usage

Once started, you can chat with the assistant through the command line interface:

```
> Hello, how are you?
Assistant: I'm doing well, thank you for asking! How can I help you today?

> Tell me about the weather
Assistant: I'd be happy to help with weather information, though I don't have access to real-time weather data...

> exit
```

## Dependencies

- **langchain-openai**: OpenAI integration for language models
- **zep-cloud**: Persistent memory and conversation management
- **langgraph**: Advanced conversation flow management
- **dotenv**: Environment variable management

## Current Status

✅ **Core Implementation Complete**
- [x] Basic AI agent with OpenAI integration
- [x] Zep Cloud memory system
- [x] Streaming conversation interface
- [x] User context and thread management
- [x] Command-line interface

## Future Enhancements

- Web-based interface
- Telegram bot integration
- Advanced memory retrieval
- Tool integrations (calendar, email, etc.)
- Multi-user support

## License

MIT License